import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import { PROMPT_INJECTION_DEFENSE_INSTRUCTION } from "@/lib/security/prompt-boundary";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSION = 768;

let genAIClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI | null {
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

export const GENERATION_MODEL =
  process.env.GEMINI_GENERATION_MODEL || "gemini-3.6-flash";

export const FALLBACK_GENERATION_MODEL =
  process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateGroundedResponseOptions {
  systemPrompt?: string;
  userQuestion: string;
  context: string;
  conversationHistory?: ChatHistoryMessage[];
  model?: string;
}

export interface GenerateGroundedResponseResult {
  text: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
}

export const DEFAULT_SYSTEM_INSTRUCTION = `You are Satori, an intelligent workspace knowledge assistant.
Your goal is to answer the user's inquiry with articulate, well-structured, and helpful synthesis based ONLY on the provided workspace context enclosed in <context> tags.

${PROMPT_INJECTION_DEFENSE_INSTRUCTION}

COMMUNICATION & FORMATTING STANDARDS:
1. STRUCTURE & READABILITY:
   - Begin with a direct, coherent opening statement addressing the user's intent.
   - Use clean, standard Markdown hierarchy:
     * Use headings (###) to separate distinct topics, sections, or thematic findings.
     * Use bullet points with bold descriptive lead-ins (e.g., "* **Core Finding:** Description...") to maximize readability.
     * Ensure proper spacing: separate distinct ideas and paragraphs with blank lines.
     * When comparing data, metrics, or workflows, use clear Markdown tables or side-by-side bullet matrices.
     * Use syntax-highlighted code blocks for technical snippets, commands, or data formats.
2. DOMAIN & ACADEMIC INQUIRIES:
   - When asked for "RRL" (Review of Related Literature), literature reviews, theoretical foundations, or related studies:
     * Synthesize the actual literature, cited authors, and thematic findings documented in the file.
     * Organize literature thematically or by concept with concise analytical takeaways.
     * Never output raw document outlines, indexes, or metadata in place of real literature analysis.
3. NOISE & ARTIFACT REJECTION:
   - Ignore and omit Table of Contents dot leaders (e.g. "..... 28"), stray pagination numbers, and header/footer boilerplate. Focus strictly on substantive analytical text.
4. CITATION RULES:
   - Every factual claim, finding, policy, or metric derived from context MUST cite its source immediately using [source-N] corresponding to the <source id="..."> attribute (e.g., [source-1]).
   - Cite cleanly at sentence or clause boundaries: "Augmented reality reduces hardware configuration errors [source-1]."
   - For multiple sources, write distinct brackets: [source-1] [source-2]. NEVER write double brackets like [[1]] or merged brackets like [source-1, source-2].
   - If the context does not contain enough information to answer, state: "I could not find enough information in this workspace to answer this question." Do not fabricate facts.
   - Maintain a professional, articulate, and calm tone.`;

export function buildGroundedSystemInstruction(options?: {
  isScopedToDocuments?: boolean;
  customDirective?: string;
}): string {
  const scopedNotice = options?.isScopedToDocuments
    ? `\nCRITICAL SCOPE DIRECTIVE: The user has attached specific reference documents to scope this answer. Your response MUST be derived strictly from the provided context corresponding to these attached documents. If the attached context does not contain the answer, explicitly state that the attached document does not contain the requested details. Do not invent details or pull from unprovided sources.\n`
    : "";

  if (options?.customDirective) {
    return `${DEFAULT_SYSTEM_INSTRUCTION}\n${scopedNotice}\nADDITIONAL DIRECTIVE: ${options.customDirective}`.trim();
  }

  return `${DEFAULT_SYSTEM_INSTRUCTION}\n${scopedNotice}`.trim();
}

/**
 * Deterministic fallback generator for offline tests or when API key is missing/quota-limited.
 */
function generateFallbackGroundedResponse(
  options: GenerateGroundedResponseOptions
): GenerateGroundedResponseResult {
  const { userQuestion, context } = options;

  // Extract source tags if present
  const sourceMatches = [...context.matchAll(/<source\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/source>/gi)];

  if (sourceMatches.length === 0) {
    return {
      text: "I could not find enough information in this workspace to answer this question.",
      model: "satori-fallback-local",
      promptTokens: Math.ceil((context.length + userQuestion.length) / 4),
      outputTokens: 18,
    };
  }

  // Pick the top source
  const firstSourceId = sourceMatches[0][1];
  const firstSourceContent = sourceMatches[0][2].trim();

  // Find a relevant line or take the first 1-2 sentences
  const lines = firstSourceContent
    .split(/\r?\n/)
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .filter((l) => l.length > 20);

  const bestSnippet = lines[0] || firstSourceContent.slice(0, 160);

  const text = `Based on the workspace documents, ${bestSnippet} [${firstSourceId}].`;

  return {
    text,
    model: "satori-fallback-local",
    promptTokens: Math.ceil((context.length + userQuestion.length) / 4),
    outputTokens: Math.ceil(text.length / 4),
  };
}

/**
 * Generates a grounded response using Gemini models with prompt context and citation guidelines.
 */
export async function generateGroundedResponse(
  options: GenerateGroundedResponseOptions
): Promise<GenerateGroundedResponseResult> {
  const client = getGenAIClient();
  if (!client) {
    return generateFallbackGroundedResponse(options);
  }

  const {
    systemPrompt = DEFAULT_SYSTEM_INSTRUCTION,
    userQuestion,
    context,
    conversationHistory = [],
  } = options;

  // Build the message contents array for Gemini
  // We format recent conversation history turns (if any) followed by the current question + context
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const turn of conversationHistory.slice(-6)) {
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    });
  }

  // Current turn with context block
  const userContent = `Here is the relevant workspace documentation context:

${context}

User Question: ${userQuestion}`;

  contents.push({
    role: "user",
    parts: [{ text: userContent }],
  });

  const MAX_RETRIES = 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: GENERATION_MODEL,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const promptTokens =
        response.usageMetadata?.promptTokenCount ??
        Math.ceil(userContent.length / 4);
      const outputTokens =
        response.usageMetadata?.candidatesTokenCount ??
        Math.ceil(responseText.length / 4);

      return {
        text: responseText.trim(),
        model: GENERATION_MODEL,
        promptTokens,
        outputTokens,
      };
    } catch (error) {
      lastError = error;
      const errMsg = error instanceof Error ? error.message : String(error);
      const isRetryable =
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("429");
      if (attempt < MAX_RETRIES && isRetryable) {
        console.log(`[Gemini API] Temporary spike detected (${errMsg.slice(0, 60)}...). Retrying in ${(attempt + 1) * 1.5}s...`);
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  console.warn(
    "Gemini generation error, using deterministic fallback response:",
    lastError instanceof Error ? lastError.message : lastError
  );
  return generateFallbackGroundedResponse(options);
}

export interface GroundedStreamResult {
  fullText: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
}

interface StreamChunkLike {
  text?: string | null;
}

/**
 * Streams a grounded response from Gemini models chunk-by-chunk.
 * Supports transparent fallback to backup models if primary model fails on initiation.
 */
export async function* generateGroundedResponseStream(
  options: GenerateGroundedResponseOptions
): AsyncGenerator<string, GroundedStreamResult, void> {
  const client = getGenAIClient();
  if (!client) {
    const fallback = generateFallbackGroundedResponse(options);
    const words = fallback.text.split(/(\s+)/);
    for (const w of words) {
      if (w) yield w;
    }
    return {
      fullText: fallback.text,
      model: fallback.model,
      promptTokens: fallback.promptTokens,
      outputTokens: fallback.outputTokens,
    };
  }

  const {
    systemPrompt = DEFAULT_SYSTEM_INSTRUCTION,
    userQuestion,
    context,
    conversationHistory = [],
  } = options;

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const turn of conversationHistory.slice(-6)) {
    contents.push({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    });
  }

  const userContent = `Here is the relevant workspace documentation context:

${context}

User Question: ${userQuestion}`;

  contents.push({
    role: "user",
    parts: [{ text: userContent }],
  });

  const candidateModels = [
    ...(options.model ? [options.model] : []),
    GENERATION_MODEL,
    FALLBACK_GENERATION_MODEL,
    "gemini-3.5-flash",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let activeStream: AsyncIterable<StreamChunkLike> | null = null;
  let activeModel = candidateModels[0] || GENERATION_MODEL;
  let lastError: unknown = null;

  for (const modelToTry of candidateModels) {
    try {
      activeStream = (await client.models.generateContentStream({
        model: modelToTry,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      })) as AsyncIterable<StreamChunkLike>;
      activeModel = modelToTry;
      break;
    } catch (err) {
      lastError = err;
      console.warn(
        `[Gemini Stream] Model ${modelToTry} stream failed on init:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  if (!activeStream) {
    console.warn(
      "[Gemini Stream] All models failed on init, using fallback generator:",
      lastError
    );
    const fallback = generateFallbackGroundedResponse(options);
    const words = fallback.text.split(/(\s+)/);
    for (const w of words) {
      if (w) yield w;
    }
    return {
      fullText: fallback.text,
      model: fallback.model,
      promptTokens: fallback.promptTokens,
      outputTokens: fallback.outputTokens,
    };
  }

  let fullText = "";
  try {
    for await (const chunk of activeStream) {
      const textChunk = chunk.text || "";
      if (textChunk) {
        fullText += textChunk;
        yield textChunk;
      }
    }
  } catch (streamIterErr) {
    console.warn("[Gemini Stream] Error during stream iteration:", streamIterErr);
    if (!fullText) {
      const fallback = generateFallbackGroundedResponse(options);
      yield fallback.text;
      return {
        fullText: fallback.text,
        model: "satori-fallback-local",
        promptTokens: fallback.promptTokens,
        outputTokens: fallback.outputTokens,
      };
    }
  }

  const promptTokens = Math.ceil(userContent.length / 4);
  const outputTokens = Math.ceil(fullText.length / 4);

  return {
    fullText: fullText.trim(),
    model: activeModel,
    promptTokens,
    outputTokens,
  };
}

