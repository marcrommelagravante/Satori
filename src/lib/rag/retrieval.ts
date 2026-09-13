import { db } from "@/lib/db";
import {
  documents,
  documentVersions,
  documentChunks,
} from "@/lib/db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/gemini";

export interface SearchSimilarChunksOptions {
  workspaceId: string;
  query: string;
  topK?: number; // Default 5
  similarityThreshold?: number; // Default 0.50 (cosine similarity >= 0.50)
  documentIds?: string[]; // Optional document filter
}

export interface ScoredChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  versionNumber: number;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  section: string | null;
  tokenEstimate: number | null;
  similarityScore: number;
  distance: number;
}

/**
 * Searches for document chunks semantically similar to the provided query.
 * Multi-tenant safe: Results are strictly scoped to documents belonging to the specified workspaceId.
 */
export async function searchSimilarChunks(
  options: SearchSimilarChunksOptions
): Promise<ScoredChunk[]> {
  const { workspaceId, query } = options;
  const topK = Math.max(1, Math.min(options.topK ?? 5, 20));
  const threshold = options.similarityThreshold ?? 0.5;

  if (!query || query.trim().length === 0) {
    return [];
  }

  // 1. Generate query embedding (768 dimensions)
  const queryVector = await generateEmbedding(query.trim());
  const vectorStr = `[${queryVector.join(",")}]`;

  // 2. pgvector distance and similarity expressions
  const distanceSql = sql<number>`(${documentChunks.embedding} <=> ${vectorStr}::vector)`;
  const similaritySql = sql<number>`ROUND((1 - (${documentChunks.embedding} <=> ${vectorStr}::vector))::numeric, 4)::float`;

  // 3. Build conditions strictly scoped by workspace
  const conditions = [
    eq(documents.workspaceId, workspaceId),
    eq(documents.status, "ready"),
    sql`${documentChunks.embedding} IS NOT NULL`,
    sql`(1 - (${documentChunks.embedding} <=> ${vectorStr}::vector)) >= ${threshold}`,
  ];

  if (options.documentIds && options.documentIds.length > 0) {
    conditions.push(inArray(documents.id, options.documentIds));
  }

  // 4. Query Neon PostgreSQL
  const results = await db
    .select({
      chunkId: documentChunks.id,
      documentId: documents.id,
      documentName: documents.name,
      versionNumber: documentVersions.versionNumber,
      chunkIndex: documentChunks.chunkIndex,
      content: documentChunks.content,
      pageNumber: documentChunks.pageNumber,
      section: documentChunks.section,
      tokenEstimate: documentChunks.tokenEstimate,
      similarityScore: similaritySql,
      distance: distanceSql,
    })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(and(...conditions))
    .orderBy(desc(similaritySql))
    .limit(topK);

  return results.map((r) => ({
    ...r,
    similarityScore: Number(r.similarityScore),
    distance: Number(r.distance),
  }));
}
