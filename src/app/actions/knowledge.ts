"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { searchChunks, buildRagContext, type RetrievalMode } from "@/lib/rag";
import { backfillWorkspaceEmbeddings } from "@/lib/ingestion/processor";
import { revalidatePath } from "next/cache";

export interface SearchKnowledgeInput {
  workspaceId: string;
  query: string;
  topK?: number;
  similarityThreshold?: number;
  mode?: RetrievalMode;
}

export async function searchKnowledgeAction(input: SearchKnowledgeInput) {
  await requireAuth();

  const { workspaceId, query, topK, similarityThreshold, mode } = input;
  if (!workspaceId || !query || query.trim().length === 0) {
    return { error: "Workspace ID and query are required." };
  }

  // Security guard: verify user has membership in the workspace
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const startTime = Date.now();
    const chunks = await searchChunks({
      mode: mode ?? "hybrid",
      workspaceId,
      query: query.trim(),
      topK: topK ?? 5,
      similarityThreshold: similarityThreshold ?? 0.45,
    });
    const latencyMs = Date.now() - startTime;

    const ragContext = buildRagContext(chunks);

    return {
      success: true,
      latencyMs,
      chunks,
      context: ragContext.formattedContext,
      citationMap: ragContext.citationMap,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during semantic search.",
    };
  }
}

export async function reindexWorkspaceAction(workspaceId: string) {
  await requireAuth();

  if (!workspaceId) {
    return { error: "Workspace ID is required." };
  }

  // Security guard: require member role to trigger re-indexing
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const result = await backfillWorkspaceEmbeddings(workspaceId);
    revalidatePath("/knowledge");
    return { success: true, backfilledCount: result.backfilledCount };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to reindex workspace embeddings.",
    };
  }
}
