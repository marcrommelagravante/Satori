import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSION = 768;

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

/**
 * Deterministically generates a 768-dimensional normalized unit vector
 * based on token/character n-grams. Used when GEMINI_API_KEY is not configured
 * to allow tests, offline development, and CI environments to run reliably.
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const dim = EMBEDDING_DIMENSION;
  const vector = new Float64Array(dim);

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);

  // Hash unigrams and bigrams
  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    const hash1 = crypto.createHash("sha256").update(unigram).digest();
    const idx1 = hash1.readUInt16BE(0) % dim;
    const sign1 = (hash1[2] & 1) === 1 ? 1 : -1;
    vector[idx1] += sign1 * 1.5;

    if (i < tokens.length - 1) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      const hash2 = crypto.createHash("sha256").update(bigram).digest();
      const idx2 = hash2.readUInt16BE(0) % dim;
      const sign2 = (hash2[2] & 1) === 1 ? 1 : -1;
      vector[idx2] += sign2 * 2.0;
    }
  }

  // Also include character trigrams to capture morphological similarities
  const noSpace = clean.replace(/\s+/g, "");
  for (let i = 0; i < noSpace.length - 2; i++) {
    const trigram = noSpace.slice(i, i + 3);
    const hash3 = crypto.createHash("md5").update(trigram).digest();
    const idx3 = hash3.readUInt16BE(0) % dim;
    vector[idx3] += 0.3;
  }

  // Normalize vector to unit length (L2 norm = 1.0)
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm === 0) {
    vector[0] = 1.0;
    norm = 1.0;
  }

  const result: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }

  return result;
}

/**
 * Generates an embedding for a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGenAIClient();

  if (!client) {
    return generateDeterministicEmbedding(text);
  }

  try {
    const response = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: [text],
      config: {
        outputDimensionality: EMBEDDING_DIMENSION,
      },
    });

    const values = response.embeddings?.[0]?.values;
    if (values && values.length > 0) {
      return values;
    }

    console.warn("Gemini API returned empty embedding values, using fallback");
    return generateDeterministicEmbedding(text);
  } catch (error) {
    console.warn(
      "Gemini API embedContent error, falling back to deterministic vector:",
      error instanceof Error ? error.message : error
    );
    return generateDeterministicEmbedding(text);
  }
}

/**
 * Batch generates embeddings for an array of text strings.
 * Batches in chunks of 50 to adhere to API limits.
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getGenAIClient();
  if (!client) {
    return texts.map((t) => generateDeterministicEmbedding(t));
  }

  const BATCH_SIZE = 50;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      const response = await client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
        config: {
          outputDimensionality: EMBEDDING_DIMENSION,
        },
      });

      const embeddings = response.embeddings;
      if (embeddings && embeddings.length === batch.length) {
        for (const emb of embeddings) {
          results.push(emb.values || generateDeterministicEmbedding(""));
        }
      } else {
        // Fallback for missing items
        for (const item of batch) {
          results.push(generateDeterministicEmbedding(item));
        }
      }
    } catch (error) {
      console.warn(
        `Gemini batch embedding failed for batch ${i}-${i + batch.length}, using fallback:`,
        error instanceof Error ? error.message : error
      );
      for (const item of batch) {
        results.push(generateDeterministicEmbedding(item));
      }
    }
  }

  return results;
}
