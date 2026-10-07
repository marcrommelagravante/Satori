import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { db } from "@/lib/db";
import {
  conversations,
  messages,
  aiRuns,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { searchChunks, buildRagContext } from "@/lib/rag";
import { generateGroundedResponseStream } from "@/lib/ai/gemini";
import { runAgentLoop, detectAgentMode } from "@/lib/ai/agent";
import {
  finalizeAndSaveAssistantMessage,
  updateConversationTitle,
} from "@/lib/chat";
import { enforceRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) streaming chat endpoint for real-time token feedback.
 * Multi-tenant safe: Strictly validates workspace membership and enforces rate limits.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
  const user = await requireAuth();

  // 1. Rate limiting check
  const rateLimit = enforceRateLimit("chat", user.id);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: rateLimit.error || "Rate limit exceeded. Please wait a moment.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Security guard: verify user has access to this workspace
  await requireWorkspaceMember(workspaceId, "member");

  // 3. Parse input body
  let body: { conversationId?: string; content?: string; agentMode?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { conversationId, content, agentMode } = body;
  if (!conversationId || !content || content.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "conversationId and content are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const userText = content.trim();

  // 4. Verify conversation exists and belongs to workspace
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv || conv.workspaceId !== workspaceId) {
    return new Response(
      JSON.stringify({ error: "Conversation not found or unauthorized." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Persist user message immediately
  const [userMessage] = await db
    .insert(messages)
    .values({
      conversationId,
      role: "user",
      content: userText,
    })
    .returning();

  const isAgent = agentMode ?? detectAgentMode(userText);

  // 6. Setup SSE ReadableStream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(eventType: string, data: Record<string, unknown>) {
        const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      try {
        // Send initial event with user message confirmation
        sendEvent("user_message", { userMessage });

        if (isAgent) {
          // Agent Mode: Multi-turn tool execution loop
          sendEvent("tool_start", {
            toolName: "satoriAgent",
            message: "Analyzing workspace documents...",
          });

          const agentResult = await runAgentLoop({
            workspaceId,
            userId: user.id,
            conversationId,
            userPrompt: userText,
          });

          for (const tc of agentResult.toolCalls) {
            sendEvent("tool_done", {
              toolName: tc.toolName,
              resultSummary: tc.resultSummary,
              durationMs: tc.durationMs,
            });
          }

          // Stream the resulting text in natural-sized token chunks
          const words = agentResult.text.split(/(\s+)/);
          for (const w of words) {
            if (w) {
              sendEvent("token", { text: w });
            }
          }

          // Persist assistant message in DB
          const [assistantMessage] = await db
            .insert(messages)
            .values({
              conversationId,
              role: "assistant",
              content: agentResult.text,
              model: agentResult.model,
            })
            .returning();

          // Log observability run
          try {
            await db.insert(aiRuns).values({
              workspaceId,
              userId: user.id,
              conversationId,
              model: agentResult.model,
              operation: "chat_agent_loop",
              latencyMs: agentResult.latencyMs,
              inputTokens: agentResult.inputTokens,
              outputTokens: agentResult.outputTokens,
              status: "success",
              toolCalls: agentResult.toolCalls,
            });
          } catch (logErr) {
            console.warn("Failed to log ai_runs for agent stream:", logErr);
          }

          // Auto-title conversation on first turn
          if (conv.title === "New Conversation" || conv.title.trim() === "") {
            let newTitle = userText.replace(/[#*`]/g, "").trim();
            if (newTitle.length > 50) {
              newTitle = newTitle.slice(0, 47) + "...";
            }
            await updateConversationTitle(conversationId, newTitle);
          }

          sendEvent("done", {
            assistantMessage,
            citations: [],
            toolCalls: agentResult.toolCalls,
            reportId: agentResult.createdReportId,
            latencyMs: agentResult.latencyMs,
            isAgent: true,
          });

          controller.close();
          return;
        }

        // Standard RAG Mode:
        // 1. Multi-turn history retrieval (last 6 messages)
        const previousMessages = await db
          .select({
            role: messages.role,
            content: messages.content,
          })
          .from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(desc(messages.createdAt))
          .limit(7);

        const historyTurns = previousMessages
          .reverse()
          .slice(0, -1)
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // 2. Hybrid retrieval (Dense Vector + FTS with RRF)
        const relevantChunks = await searchChunks({
          mode: "hybrid",
          workspaceId,
          query: userText,
          topK: 5,
          similarityThreshold: 0.45,
        });

        // 3. Context & citations preparation
        const ragContext = buildRagContext(relevantChunks, { maxTokens: 3000 });

        // UPFRONT CITATION EVENT: Send retrieved source pills right away
        sendEvent("context", {
          sources: Object.values(ragContext.citationMap),
          sourcesCount: ragContext.includedChunks.length,
        });

        // 4. Stream response from Gemini
        const startTime = Date.now();
        const streamGenerator = generateGroundedResponseStream({
          userQuestion: userText,
          context: ragContext.formattedContext,
          conversationHistory: historyTurns,
        });

        let accumulatedText = "";
        const finalModel = "gemini-3.6-flash";
        const promptTokens = Math.ceil((ragContext.formattedContext.length + userText.length) / 4);
        let outputTokens = 0;

        for await (const chunkText of streamGenerator) {
          accumulatedText += chunkText;
          sendEvent("token", { text: chunkText });
        }

        const latencyMs = Date.now() - startTime;
        outputTokens = Math.ceil(accumulatedText.length / 4);

        // 5. Persist assistant message and resolve inline citations
        const { assistantMessage, citations: savedCitations } =
          await finalizeAndSaveAssistantMessage({
            conversationId,
            workspaceId,
            userId: user.id,
            userText,
            assistantText: accumulatedText,
            model: finalModel,
            ragContext,
            latencyMs,
            promptTokens,
            outputTokens,
          });

        sendEvent("done", {
          assistantMessage,
          citations: savedCitations,
          latencyMs,
          isAgent: false,
        });

        controller.close();
      } catch (streamError) {
        console.error("[Chat Stream Error]", streamError);
        const errMsg =
          streamError instanceof Error
            ? streamError.message
            : "An unexpected error occurred during chat streaming.";

        sendEvent("error", {
          error: errMsg,
          retryable: true,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
