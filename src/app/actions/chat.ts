"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  createConversation,
  deleteConversation,
  getConversation,
  getMessages,
  sendMessage,
  type MessageWithCitations,
  type CitationDetail,
} from "@/lib/chat";
import { type SourceAttribution } from "@/lib/rag";
import { type AgentToolCallLog } from "@/lib/ai/agent";
import { enforceRateLimit } from "@/lib/security/rate-limiter";
import { revalidatePath } from "next/cache";

export interface SendMessageActionInput {
  conversationId: string;
  workspaceId: string;
  content: string;
  agentMode?: boolean;
}

export interface SendMessageActionResponse {
  success: boolean;
  userMessage?: {
    id: string;
    conversationId: string;
    role: "user";
    content: string;
    model: string | null;
    createdAt: Date;
  };
  assistantMessage?: {
    id: string;
    conversationId: string;
    role: "assistant";
    content: string;
    model: string | null;
    createdAt: Date;
  };
  citations?: CitationDetail[];
  citationMap?: Record<string, SourceAttribution>;
  latencyMs?: number;
  reportId?: string;
  toolCalls?: AgentToolCallLog[];
  isAgent?: boolean;
  retryAfterSeconds?: number;
  error?: string;
}

/**
 * Server action to send a user message and receive a grounded assistant response.
 */
export async function sendMessageAction(
  input: SendMessageActionInput
): Promise<SendMessageActionResponse> {
  const user = await requireAuth();
  const { conversationId, workspaceId, content } = input;

  // Rate limiting check
  const rateLimit = enforceRateLimit("chat", user.id);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.error,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  if (!conversationId || !workspaceId || !content || content.trim().length === 0) {
    return {
      success: false,
      error: "Missing required conversation, workspace, or message content.",
    };
  }

  // Security guard: verify user has access to this workspace
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const result = await sendMessage({
      conversationId,
      workspaceId,
      userId: user.id,
      content: content.trim(),
      agentMode: input.agentMode,
    });

    revalidatePath("/chat");
    revalidatePath("/dashboard");
    if (result.reportId) {
      revalidatePath("/reports");
    }

    return {
      success: true,
      userMessage: {
        id: result.userMessage.id,
        conversationId: result.userMessage.conversationId,
        role: "user",
        content: result.userMessage.content,
        model: result.userMessage.model ?? null,
        createdAt: result.userMessage.createdAt,
      },
      assistantMessage: {
        id: result.assistantMessage.id,
        conversationId: result.assistantMessage.conversationId,
        role: "assistant",
        content: result.assistantMessage.content,
        model: result.assistantMessage.model,
        createdAt: result.assistantMessage.createdAt,
      },
      citations: result.citations,
      citationMap: result.citationMap,
      latencyMs: result.latencyMs,
      reportId: result.reportId,
      toolCalls: result.toolCalls,
      isAgent: result.isAgent,
    };
  } catch (error) {
    console.error("sendMessageAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing your message.",
    };
  }
}

/**
 * Server action to create a new conversation thread.
 */
export async function createConversationAction(
  workspaceId: string,
  title: string = "New Conversation"
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const conv = await createConversation(workspaceId, user.id, title);
    revalidatePath("/chat");
    return { success: true, conversation: conv };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create conversation.",
    };
  }
}

/**
 * Server action to delete an existing conversation thread.
 */
export async function deleteConversationAction(
  conversationId: string,
  workspaceId: string
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const deleted = await deleteConversation(conversationId, user.id);
    revalidatePath("/chat");
    revalidatePath("/dashboard");
    return { success: deleted };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete conversation.",
    };
  }
}

/**
 * Server action to load messages for a conversation.
 */
export async function getConversationMessagesAction(
  conversationId: string,
  workspaceId: string
): Promise<{ success: boolean; messages?: MessageWithCitations[]; error?: string }> {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const messages = await getMessages(conversationId, user.id);
    return { success: true, messages };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load conversation messages.",
    };
  }
}
