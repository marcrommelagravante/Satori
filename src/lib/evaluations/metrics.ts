/**
 * Satori Evaluation Metrics Engine
 * 
 * Provides mathematical and heuristic evaluation functions for:
 * - Retrieval accuracy: Recall@K, Precision@K, Hit Rate, MRR
 * - Citation validity: Integrity of cited chunk IDs and workspace boundaries
 */

export interface RetrievalMetricsResult {
  recallK: number;
  precisionK: number;
  hitRate: number;
  mrr: number;
  expectedCount: number;
  retrievedCount: number;
  overlapCount: number;
}

/**
 * Calculates Recall@K:
 * Proportion of expected ground-truth chunks retrieved in top K.
 * Recall@K = |Retrieved ∩ Expected| / |Expected|
 */
export function calculateRecallK(
  retrievedIds: string[],
  expectedIds: string[],
  k?: number
): number {
  if (expectedIds.length === 0) return 1.0;
  const topKRetrieved = k ? retrievedIds.slice(0, k) : retrievedIds;
  if (topKRetrieved.length === 0) return 0.0;

  const expectedSet = new Set(expectedIds);
  const overlap = topKRetrieved.filter((id) => expectedSet.has(id)).length;
  return Number((overlap / expectedIds.length).toFixed(4));
}

/**
 * Calculates Precision@K:
 * Proportion of top K retrieved chunks that are relevant.
 * Precision@K = |Retrieved ∩ Expected| / K
 */
export function calculatePrecisionK(
  retrievedIds: string[],
  expectedIds: string[],
  k?: number
): number {
  const effectiveK = k ?? retrievedIds.length;
  if (effectiveK === 0) return 0.0;
  if (expectedIds.length === 0) return 1.0;

  const topKRetrieved = retrievedIds.slice(0, effectiveK);
  const expectedSet = new Set(expectedIds);
  const overlap = topKRetrieved.filter((id) => expectedSet.has(id)).length;
  return Number((overlap / effectiveK).toFixed(4));
}

/**
 * Calculates Hit Rate:
 * 1.0 if at least one expected chunk is in the retrieved set, else 0.0.
 */
export function calculateHitRate(
  retrievedIds: string[],
  expectedIds: string[],
  k?: number
): number {
  if (expectedIds.length === 0) return 1.0;
  const topKRetrieved = k ? retrievedIds.slice(0, k) : retrievedIds;
  const expectedSet = new Set(expectedIds);
  const hit = topKRetrieved.some((id) => expectedSet.has(id));
  return hit ? 1.0 : 0.0;
}

/**
 * Calculates Mean Reciprocal Rank (MRR) for a single query:
 * 1 / rank of the first relevant chunk found (1-indexed).
 * 0.0 if no relevant chunk is retrieved.
 */
export function calculateMRR(
  retrievedIds: string[],
  expectedIds: string[],
  k?: number
): number {
  if (expectedIds.length === 0) return 1.0;
  const topKRetrieved = k ? retrievedIds.slice(0, k) : retrievedIds;
  const expectedSet = new Set(expectedIds);

  for (let i = 0; i < topKRetrieved.length; i++) {
    if (expectedSet.has(topKRetrieved[i])) {
      return Number((1 / (i + 1)).toFixed(4));
    }
  }
  return 0.0;
}

/**
 * Computes all retrieval metrics at once for convenience.
 */
export function computeRetrievalMetrics(
  retrievedIds: string[],
  expectedIds: string[],
  k: number = 5
): RetrievalMetricsResult {
  const topKRetrieved = retrievedIds.slice(0, k);
  const expectedSet = new Set(expectedIds);
  const overlap = topKRetrieved.filter((id) => expectedSet.has(id)).length;

  return {
    recallK: calculateRecallK(retrievedIds, expectedIds, k),
    precisionK: calculatePrecisionK(retrievedIds, expectedIds, k),
    hitRate: calculateHitRate(retrievedIds, expectedIds, k),
    mrr: calculateMRR(retrievedIds, expectedIds, k),
    expectedCount: expectedIds.length,
    retrievedCount: topKRetrieved.length,
    overlapCount: overlap,
  };
}

export interface CitationValidationResult {
  validCount: number;
  totalCount: number;
  accuracy: number;
  invalidChunkIds: string[];
}

/**
 * Validates citation integrity:
 * Verifies whether all cited chunk IDs map to real document chunks belonging to the workspace.
 */
export function validateCitations(
  citedChunkIds: string[],
  validWorkspaceChunkIds: Set<string>
): CitationValidationResult {
  if (citedChunkIds.length === 0) {
    return {
      validCount: 0,
      totalCount: 0,
      accuracy: 1.0,
      invalidChunkIds: [],
    };
  }

  const invalidChunkIds: string[] = [];
  let validCount = 0;

  for (const chunkId of citedChunkIds) {
    if (validWorkspaceChunkIds.has(chunkId)) {
      validCount++;
    } else {
      invalidChunkIds.push(chunkId);
    }
  }

  return {
    validCount,
    totalCount: citedChunkIds.length,
    accuracy: Number((validCount / citedChunkIds.length).toFixed(4)),
    invalidChunkIds,
  };
}
