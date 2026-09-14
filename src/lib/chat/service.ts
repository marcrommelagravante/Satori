import { db } from "@/lib/db";
import {
  conversations,
  messages,
  citations,
  aiRuns,
  documentChunks,
  documentVersions,
  documents,
  type Conversation,
  type Message,
} from "@/lib/db/schema";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import {
  searchChunks,
  buildRagContext,
  type SourceAttribution,
} from "@/lib/rag";
import { generateGroundedResponse } from "@/lib/ai/gemini";
import { runAgentLoop, detectAgentMode, type AgentToolCallLog } from "@/lib/ai/agent";

export interface CitationDetail {
  id: string;
  chunkId: string;
  relevanceScore: number | null;
  rank: number;
  documentId?: string;
  documentName?: string;
  pageNumber?: number | null;
  section?: string | null;
  contentSnippet?: string;
}

export interface MessageWithCitations extends Message {
  citations?: CitationDetail[];
  toolCalls?: AgentToolCallLog[];
  reportId?: string;
  isAgent?: boolean;
}

export interface SendMessageOptions {
  conversationId: string;
  workspaceId: string;
  userId: string;
  content: string;
  agentMode?: boolean;
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
  citations: CitationDetail[];
  citationMap: Record<string, SourceAttribution>;
  latencyMs: number;
  reportId?: string;
  toolCalls?: AgentToolCallLog[];
  isAgent?: boolean;
}

/**
 * Creates a new conversation for a user within a workspace.
 */
export async function createConversation(
  workspaceId: string,
  userId: string,
  title: string = "New Conversation"
): Promise<Conversation> {
  const [conv] = await db
    .insert(conversations)
    .values({
      workspaceId,
      userId,
      title,
    })
    .returning();

  return conv;
}

/**
 * Gets all conversations for a user in a specific workspace.
 */
export async function getConversations(
  workspaceId: string,
  userId: string
): Promise<Conversation[]> {
  return db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.workspaceId, workspaceId),
        eq(conversations.userId, userId)
      )
    )
    .orderBy(desc(conversations.updatedAt));
}

/**
 * Gets a single conversation by ID, verifying user ownership.
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      )
    )
    .limit(1);

  return conv || null;
}

/**
 * Deletes a conversation and cascades messages and citations.
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      )
    )
    .returning({ id: conversations.id });

  return result.length > 0;
}

/**
 * Retrieves all messages in a conversation with their linked citations.
 */
export async function getMessages(
  conversationId: string,
  userId: string
): Promise<MessageWithCitations[]> {
  // 1. Verify conversation ownership
  const conv = await getConversation(conversationId, userId);
  if (!conv) {
    return [];
  }

  // 2. Fetch all messages in chronological order
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  if (msgs.length === 0) {
    return [];
  }

  const messageIds = msgs.map((m) => m.id);

  // 3. Fetch linked citations with chunk and document details
  const citationRows = await db
    .select({
      id: citations.id,
      messageId: citations.messageId,
      chunkId: citations.chunkId,
      relevanceScore: citations.relevanceScore,
      rank: citations.rank,
      content: documentChunks.content,
      pageNumber: documentChunks.pageNumber,
      section: documentChunks.section,
      documentId: documents.id,
      documentName: documents.name,
    })
    .from(citations)
    .innerJoin(documentChunks, eq(citations.chunkId, documentChunks.id))
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(inArray(citations.messageId, messageIds))
    .orderBy(asc(citations.rank));

  // 4. Map citations by message ID
  const citationsByMessage = new Map<string, CitationDetail[]>();
  for (const row of citationRows) {
    const list = citationsByMessage.get(row.messageId) || [];
    list.push({
      id: row.id,
      chunkId: row.chunkId,
      relevanceScore: row.relevanceScore,
      rank: row.rank,
      documentId: row.documentId,
      documentName: row.documentName,
      pageNumber: row.pageNumber,
      section: row.section,
      contentSnippet:
        row.content.length > 150
          ? `${row.content.slice(0, 150)}...`
          : row.content,
    });
    citationsByMessage.set(row.messageId, list);
  }

  return msgs.map((m) => ({
    ...m,
    citations: citationsByMessage.get(m.id) || [],
  }));
}

/**
 * Updates a conversation title.
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  await db
    .update(conversations)
    .set({
      title: title.trim().slice(0, 100),
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}

/**
 * Core chat pipeline:
 * 1. Persist user message
 * 2. Retrieve recent history
 * 3. Retrieve relevant chunks from workspace documents
 * 4. Construct grounded RAG context with citationMap
 * 5. Generate grounded response with Gemini
 * 6. Persist assistant message
 * 7. Extract inline [source-N] citations and persist to DB
 * 8. Log AI run metrics (latency, tokens, status)
 * 9. Auto-title conversation on first turn
 */
export async function sendMessage(
  options: SendMessageOptions
): Promise<SendMessageResult> {
  const { conversationId, workspaceId, userId, content } = options;
  const userText = content.trim();

  // 1. Verify conversation
  const conv = await getConversation(conversationId, userId);
  if (!conv || conv.workspaceId !== workspaceId) {
    throw new Error("Conversation not found or unauthorized");
  }

  // 2. Persist user message
  const [userMessage] = await db
    .insert(messages)
    .values({
      conversationId,
      role: "user",
      content: userText,
    })
    .returning();

  // Check if agent mode is explicitly requested or detected via query analysis
  const isAgent = options.agentMode ?? detectAgentMode(userText);

  if (isAgent) {
    const agentResult = await runAgentLoop({
      workspaceId,
      userId,
      conversationId,
      userPrompt: userText,
    });

    const [assistantMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        role: "assistant",
        content: agentResult.text,
        model: agentResult.model,
      })
      .returning();

    // Record AI run observability with tool calls
    try {
      await db.insert(aiRuns).values({
        workspaceId,
        userId,
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
      console.warn("Failed to write ai_runs record for agent loop:", logErr);
    }

    // Auto-title conversation if this is the first turn
    if (conv.title === "New Conversation" || conv.title.trim() === "") {
      let newTitle = userText.replace(/[#*`]/g, "").trim();
      if (newTitle.length > 50) {
        newTitle = newTitle.slice(0, 47) + "...";
      }
      await updateConversationTitle(conversationId, newTitle);
    } else {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    return {
      userMessage,
      assistantMessage,
      citations: [],
      citationMap: {},
      latencyMs: agentResult.latencyMs,
      reportId: agentResult.createdReportId,
      toolCalls: agentResult.toolCalls,
      isAgent: true,
    };
  }

  // 3. Fetch recent history for multi-turn conversational context
  const previousMessages = await db
    .select({
      role: messages.role,
      content: messages.content,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(7);

  // Reverse so they are chronological, excluding the just-inserted message
  const historyTurns = previousMessages
    .reverse()
    .slice(0, -1)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // 4. Hybrid retrieval (vector + FTS with RRF) across workspace documents
  const relevantChunks = await searchChunks({
    mode: "hybrid",
    workspaceId,
    query: userText,
    topK: 5,
    similarityThreshold: 0.45,
  });

  // 5. Build grounded context and structured citation map
  const ragContext = buildRagContext(relevantChunks, { maxTokens: 3000 });

  // 6. Generate grounded response via Gemini
  const startTime = Date.now();
  let generationResult;
  let generationError: string | null = null;

  try {
    generationResult = await generateGroundedResponse({
      userQuestion: userText,
      context: ragContext.formattedContext,
      conversationHistory: historyTurns,
    });
  } catch (err) {
    generationError = err instanceof Error ? err.message : "Generation failed";
    generationResult = {
      text: "I encountered an error generating an answer based on your documents. Please try again.",
      model: "error",
      promptTokens: 0,
      outputTokens: 0,
    };
  }
  const latencyMs = Date.now() - startTime;

  // 7. Persist assistant message
  const [assistantMessage] = await db
    .insert(messages)
    .values({
      conversationId,
      role: "assistant",
      content: generationResult.text,
      model: generationResult.model,
    })
    .returning();

  // 8. Post-process inline citations: detect [source-N] references
  const matchedSourceIds = new Set<string>();
  const citationRegex = /\[source[-_:]?\s*(\d+)\]/gi;
  let match;
  while ((match = citationRegex.exec(generationResult.text)) !== null) {
    matchedSourceIds.add(`source-${match[1]}`);
  }

  // If Gemini answered based on documents but omitted explicit [source-N] tags,
  // link the top-ranked source if relevance is high (>= 0.65)
  if (
    matchedSourceIds.size === 0 &&
    ragContext.includedChunks.length > 0 &&
    !generationResult.text.includes("could not find enough information") &&
    ragContext.includedChunks[0].similarityScore >= 0.65
  ) {
    matchedSourceIds.add("source-1");
  }

  const savedCitations: CitationDetail[] = [];
  let rank = 1;

  for (const sourceId of matchedSourceIds) {
    const src = ragContext.citationMap[sourceId];
    if (src && src.chunkId) {
      const [inserted] = await db
        .insert(citations)
        .values({
          messageId: assistantMessage.id,
          chunkId: src.chunkId,
          relevanceScore: src.relevanceScore,
          rank,
        })
        .returning();

      savedCitations.push({
        id: inserted.id,
        chunkId: src.chunkId,
        relevanceScore: src.relevanceScore,
        rank,
        documentId: src.documentId,
        documentName: src.documentName,
        pageNumber: src.pageNumber,
        section: src.section,
        contentSnippet: src.contentSnippet,
      });
      rank++;
    }
  }

  // 9. Record AI run observability
  try {
    await db.insert(aiRuns).values({
      workspaceId,
      userId,
      conversationId,
      model: generationResult.model,
      operation: "chat_grounded_generation",
      latencyMs,
      inputTokens: generationResult.promptTokens,
      outputTokens: generationResult.outputTokens,
      status: generationError ? "failed" : "success",
      errorCode: generationError,
    });
  } catch (logErr) {
    console.warn("Failed to write ai_runs record:", logErr);
  }

  // 10. Auto-title conversation if this is the first turn
  if (conv.title === "New Conversation" || conv.title.trim() === "") {
    let newTitle = userText.replace(/[#*`]/g, "").trim();
    if (newTitle.length > 50) {
      newTitle = newTitle.slice(0, 47) + "...";
    }
    await updateConversationTitle(conversationId, newTitle);
  } else {
    // Just update the timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }

  return {
    userMessage,
    assistantMessage,
    citations: savedCitations,
    citationMap: ragContext.citationMap,
    latencyMs,
  };
}
