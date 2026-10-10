import {
  GENERATION_MODEL,
  FALLBACK_GENERATION_MODEL,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
} from "./gemini";

export interface AiEngineInfo {
  generationModel: string;
  fallbackModel: string;
  embeddingModel: string;
  embeddingDimension: number;
  retrievalMode: string;
  rerankingMode: string;
}

export function getAiEngineInfo(): AiEngineInfo {
  return {
    generationModel: GENERATION_MODEL,
    fallbackModel: FALLBACK_GENERATION_MODEL,
    embeddingModel: EMBEDDING_MODEL,
    embeddingDimension: EMBEDDING_DIMENSION,
    retrievalMode: "Hybrid (pgvector cosine + full-text search)",
    rerankingMode: "Reciprocal Rank Fusion (RRF, k=60)",
  };
}
