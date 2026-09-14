import { db } from "@/lib/db";
import { documentChunks, documentVersions, documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGenAIClient } from "@/lib/ai/gemini";
import { z } from "zod";

export const GeneratedCaseSchema = z.object({
  question: z.string().min(5),
  expectedAnswer: z.string().min(10),
  chunkIndexHint: z.number().optional(),
  category: z.string().default("general"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const GeneratedCasesListSchema = z.object({
  cases: z.array(GeneratedCaseSchema),
});

export interface GeneratedEvalCase {
  question: string;
  expectedAnswer: string;
  expectedChunkIds: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

const GENERATOR_SYSTEM_PROMPT = `You are a test engineer creating golden evaluation datasets for a RAG knowledge platform.
Given excerpted document chunks with their IDs, generate 3 to 5 high-quality, realistic user questions and golden reference answers.

RULES:
1. Each question must be strictly answerable from the provided chunk text.
2. The expectedAnswer must be concise, factual, and accurate.
3. Provide the chunk index (0-indexed from the provided list) that best answers the question.
4. Vary difficulty (easy, medium, hard) and assign a category (e.g., "policy", "bylaws", "procedure", "factual").

Respond strictly with valid JSON adhering to:
{
  "cases": [
    {
      "question": "What is ...?",
      "expectedAnswer": "...",
      "chunkIndexHint": 0,
      "category": "policy",
      "difficulty": "medium"
    }
  ]
}`;

/**
 * Generates synthetic evaluation test cases from workspace document chunks.
 */
export async function generateBenchmarkCases(
  workspaceId: string,
  targetCount: number = 3
): Promise<GeneratedEvalCase[]> {
  // Fetch candidate chunks from active workspace
  const chunks = await db
    .select({
      id: documentChunks.id,
      content: documentChunks.content,
      documentName: documents.name,
      chunkIndex: documentChunks.chunkIndex,
    })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.status, "ready")
      )
    )
    .limit(12);

  if (chunks.length === 0) {
    return [];
  }

  const client = getGenAIClient();
  if (client) {
    try {
      const chunksText = chunks
        .slice(0, 8)
        .map(
          (c, idx) =>
            `[Chunk Index ${idx}] (Document: "${c.documentName}")\n${c.content.slice(0, 500)}`
        )
        .join("\n\n---\n\n");

      const prompt = `Generate ${targetCount} benchmark evaluation questions from these document chunks:\n\n${chunksText}`;

      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: GENERATOR_SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      const parsed = JSON.parse(responseText);
      const validated = GeneratedCasesListSchema.parse(parsed);

      const generated: GeneratedEvalCase[] = validated.cases.map((c) => {
        const hint = c.chunkIndexHint ?? 0;
        const targetChunk = chunks[hint] || chunks[0];
        return {
          question: c.question,
          expectedAnswer: c.expectedAnswer,
          expectedChunkIds: [targetChunk.id],
          category: c.category || "general",
          difficulty: c.difficulty || "medium",
        };
      });

      if (generated.length > 0) {
        return generated.slice(0, targetCount);
      }
    } catch (err) {
      console.warn("AI benchmark generation failed, falling back to deterministic synthesis:", err);
    }
  }

  // Deterministic fallback generator
  return chunks.slice(0, targetCount).map((c, i) => {
    const lines = c.content.split("\n").map((l) => l.trim()).filter((l) => l.length > 20);
    const firstLine = lines[0] || c.content.slice(0, 100);
    return {
      question: `What information is documented in "${c.documentName}" regarding: ${firstLine.slice(0, 60)}...?`,
      expectedAnswer: `According to ${c.documentName}, ${firstLine}`,
      expectedChunkIds: [c.id],
      category: "document_content",
      difficulty: i % 2 === 0 ? "easy" : "medium",
    };
  });
}
