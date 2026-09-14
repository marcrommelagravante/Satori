import { db } from "@/lib/db";
import {
  documents,
  documentVersions,
  documentChunks,
} from "@/lib/db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/gemini";

export type RetrievalMode = "hybrid" | "semantic" | "keyword";

export interface SearchSimilarChunksOptions {
  workspaceId: string;
  query: string;
  topK?: number; // Default 5
  similarityThreshold?: number; // Default 0.45 (cosine similarity >= 0.45)
  documentIds?: string[]; // Optional document filter
}

export interface SearchChunksOptions extends SearchSimilarChunksOptions {
  mode?: RetrievalMode; // Default "hybrid"
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
  keywordScore?: number;
  rrfScore?: number;
  retrievalMethod?: RetrievalMode;
}

/**
 * Searches for document chunks semantically similar to the provided query using pgvector.
 * Multi-tenant safe: Results are strictly scoped to documents belonging to the specified workspaceId.
 */
export async function searchSimilarChunks(
  options: SearchSimilarChunksOptions
): Promise<ScoredChunk[]> {
  const { workspaceId, query } = options;
  const topK = Math.max(1, Math.min(options.topK ?? 5, 20));
  const threshold = options.similarityThreshold ?? 0.45;

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
    retrievalMethod: "semantic" as const,
  }));
}

/**
 * Searches document chunks using PostgreSQL Full-Text Search (tsvector + websearch_to_tsquery).
 * Best for exact terminology, codes, acronyms, and proper nouns.
 * Multi-tenant safe: strictly scoped by workspaceId.
 */
export async function keywordSearchChunks(
  options: SearchSimilarChunksOptions
): Promise<ScoredChunk[]> {
  const { workspaceId, query } = options;
  const topK = Math.max(1, Math.min(options.topK ?? 5, 20));

  const trimmedQuery = query?.trim() || "";
  if (!trimmedQuery) {
    return [];
  }

  // Expression for ts_rank score
  const rankSql = sql<number>`ROUND(ts_rank(${documentChunks.searchVector}, websearch_to_tsquery('english', ${trimmedQuery}))::numeric, 4)::float`;

  const conditions = [
    eq(documents.workspaceId, workspaceId),
    eq(documents.status, "ready"),
    sql`${documentChunks.searchVector} @@ websearch_to_tsquery('english', ${trimmedQuery})`,
  ];

  if (options.documentIds && options.documentIds.length > 0) {
    conditions.push(inArray(documents.id, options.documentIds));
  }

  try {
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
        keywordScore: rankSql,
      })
      .from(documentChunks)
      .innerJoin(
        documentVersions,
        eq(documentChunks.documentVersionId, documentVersions.id)
      )
      .innerJoin(documents, eq(documentVersions.documentId, documents.id))
      .where(and(...conditions))
      .orderBy(desc(rankSql))
      .limit(topK);

    return results.map((r) => ({
      chunkId: r.chunkId,
      documentId: r.documentId,
      documentName: r.documentName,
      versionNumber: r.versionNumber,
      chunkIndex: r.chunkIndex,
      content: r.content,
      pageNumber: r.pageNumber,
      section: r.section,
      tokenEstimate: r.tokenEstimate,
      similarityScore: 0,
      distance: 1,
      keywordScore: Number(r.keywordScore || 0),
      retrievalMethod: "keyword" as const,
    }));
  } catch (error) {
    console.warn("keywordSearchChunks query error, falling back to empty:", error);
    return [];
  }
}

/**
 * Hybrid retrieval combining Dense Vector Search (pgvector) and Sparse Keyword Search (PostgreSQL FTS)
 * using Reciprocal Rank Fusion (RRF).
 * Formula: RRF Score = sum( 1 / (k + rank) ) with k = 60.
 */
export async function hybridSearch(
  options: SearchSimilarChunksOptions
): Promise<ScoredChunk[]> {
  const topK = Math.max(1, Math.min(options.topK ?? 5, 20));
  // Over-fetch candidates from each search mechanism to maximize fusion recall
  const candidatePoolSize = Math.min(topK * 2, 20);

  // Execute both vector search and keyword search concurrently in parallel
  const [vectorCandidates, keywordCandidates] = await Promise.all([
    searchSimilarChunks({
      ...options,
      topK: candidatePoolSize,
      similarityThreshold: options.similarityThreshold ?? 0.35, // Relax slightly for hybrid pool
    }),
    keywordSearchChunks({
      ...options,
      topK: candidatePoolSize,
    }),
  ]);

  const RRF_K = 60;
  interface FusedEntry {
    chunk: ScoredChunk;
    rrfScore: number;
    vectorRank?: number;
    keywordRank?: number;
    similarityScore: number;
    keywordScore?: number;
  }

  const fusedMap = new Map<string, FusedEntry>();

  // 1. Process Vector search results
  vectorCandidates.forEach((chunk, index) => {
    const rank = index + 1;
    const score = 1 / (RRF_K + rank);

    fusedMap.set(chunk.chunkId, {
      chunk,
      rrfScore: score,
      vectorRank: rank,
      similarityScore: chunk.similarityScore,
      keywordScore: 0,
    });
  });

  // 2. Process Keyword search results and fuse
  keywordCandidates.forEach((chunk, index) => {
    const rank = index + 1;
    const score = 1 / (RRF_K + rank);

    const existing = fusedMap.get(chunk.chunkId);
    if (existing) {
      existing.rrfScore += score;
      existing.keywordRank = rank;
      existing.keywordScore = chunk.keywordScore;
      // If keyword result had better metadata, keep existing base
    } else {
      fusedMap.set(chunk.chunkId, {
        chunk,
        rrfScore: score,
        keywordRank: rank,
        similarityScore: 0,
        keywordScore: chunk.keywordScore,
      });
    }
  });

  // 3. Sort by combined RRF score descending
  const sortedEntries = Array.from(fusedMap.values()).sort(
    (a, b) => b.rrfScore - a.rrfScore
  );

  // 4. Return topK fused results
  return sortedEntries.slice(0, topK).map(({ chunk, rrfScore, similarityScore, keywordScore }) => ({
    ...chunk,
    similarityScore,
    keywordScore,
    rrfScore: Number(rrfScore.toFixed(6)),
    retrievalMethod: "hybrid" as const,
  }));
}

/**
 * Unified search entry point for workspace knowledge retrieval.
 * Supports "hybrid" (default), "semantic", or "keyword" modes.
 */
export async function searchChunks(
  options: SearchChunksOptions
): Promise<ScoredChunk[]> {
  const mode = options.mode ?? "hybrid";

  switch (mode) {
    case "semantic":
      return searchSimilarChunks(options);
    case "keyword":
      return keywordSearchChunks(options);
    case "hybrid":
    default:
      return hybridSearch(options);
  }
}

