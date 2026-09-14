import { z } from "zod";
import { getGenAIClient } from "@/lib/ai/gemini";

export const JudgeEvaluationSchema = z.object({
  correctness: z.number().min(1).max(5),
  groundedness: z.number().min(1).max(5),
  completeness: z.number().min(1).max(5),
  reasoning: z.string(),
});

export type JudgeEvaluation = z.infer<typeof JudgeEvaluationSchema>;

export interface JudgeScores {
  correctnessScore: number; // 0.0 - 1.0
  groundednessScore: number; // 0.0 - 1.0
  completenessScore: number; // 0.0 - 1.0
  rawScores: {
    correctness: number; // 1 - 5
    groundedness: number; // 1 - 5
    completeness: number; // 1 - 5
  };
  reasoning: string;
  isFallback: boolean;
}

const JUDGE_SYSTEM_PROMPT = `You are an expert AI Evaluation Judge for a Retrieval-Augmented Generation (RAG) platform.
Your task is to objectively evaluate a generated answer against a user's question, the retrieved document context, and the expected ground truth facts.

You must score each of the following 3 dimensions on an integer scale of 1 to 5:

1. CORRECTNESS (1 to 5):
   - 5: Completely correct; aligns with all facts in the expected answer.
   - 4: Mostly correct; minor omissions or slight phrasing differences that do not alter factual accuracy.
   - 3: Partially correct; contains some correct facts, but also notable inaccuracies or omissions.
   - 2: Mostly incorrect; misinterprets key facts or contradicts expected answer.
   - 1: Completely incorrect or fabricated.

2. GROUNDEDNESS (1 to 5):
   - 5: Fully grounded; every single claim in the answer is directly supported by the provided retrieved context.
   - 4: Highly grounded; essentially all facts are supported, with harmless syntactic bridge phrasing.
   - 3: Moderately grounded; some claims extrapolate beyond the retrieved context.
   - 2: Poorly grounded; relies heavily on external speculation not in retrieved context.
   - 1: Completely ungrounded or hallucinated.

3. COMPLETENESS (1 to 5):
   - 5: Thoroughly answers all aspects of the question asked.
   - 4: Answers the core question well, omitting only minor auxiliary detail.
   - 3: Answers part of the question, but leaves key aspects unaddressed.
   - 2: Minimally addresses the question.
   - 1: Fails to answer the question asked.

You MUST respond strictly with valid JSON matching this schema:
{
  "correctness": 1-5,
  "groundedness": 1-5,
  "completeness": 1-5,
  "reasoning": "Brief explanation of ratings"
}`;

/**
 * Normalizes a 1-5 score to a 0.0 - 1.0 float.
 * 1 -> 0.0, 3 -> 0.5, 5 -> 1.0
 */
export function normalizeScore(score: number): number {
  const normalized = (score - 1) / 4;
  return Number(Math.max(0, Math.min(1, normalized)).toFixed(4));
}

/**
 * Evaluates a RAG response using Gemini as an LLM judge,
 * with automatic fallback to deterministic heuristic analysis if the API fails or is unconfigured.
 */
export async function evaluateWithJudge(params: {
  question: string;
  expectedAnswer: string;
  generatedAnswer: string;
  retrievedContext: string;
}): Promise<JudgeScores> {
  const { question, expectedAnswer, generatedAnswer, retrievedContext } = params;

  const client = getGenAIClient();
  if (!client) {
    return evaluateWithFallback(params);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const prompt = `Evaluate the following RAG output:

QUESTION:
${question}

EXPECTED GROUND TRUTH ANSWER:
${expectedAnswer}

RETRIEVED CONTEXT:
${retrievedContext.slice(0, 4000)}

GENERATED ANSWER:
${generatedAnswer}

Return your JSON evaluation now:`;

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: JUDGE_SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsedJson = JSON.parse(responseText);
    const validated = JudgeEvaluationSchema.parse(parsedJson);

    return {
      correctnessScore: normalizeScore(validated.correctness),
      groundednessScore: normalizeScore(validated.groundedness),
      completenessScore: normalizeScore(validated.completeness),
      rawScores: {
        correctness: validated.correctness,
        groundedness: validated.groundedness,
        completeness: validated.completeness,
      },
      reasoning: validated.reasoning,
      isFallback: false,
    };
  } catch (error) {
    console.warn("LLM Judge call failed or unparseable, falling back to heuristic evaluation:", error);
    return evaluateWithFallback(params);
  }
}

/**
 * Resilient deterministic heuristic fallback when LLM API is unavailable.
 * Uses token overlap and semantic Jaccard distance.
 */
export function evaluateWithFallback(params: {
  question: string;
  expectedAnswer: string;
  generatedAnswer: string;
  retrievedContext: string;
}): JudgeScores {
  const { expectedAnswer, generatedAnswer, retrievedContext } = params;

  const tokenize = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const genTokens = tokenize(generatedAnswer);
  const expectedTokens = tokenize(expectedAnswer);
  const contextTokens = tokenize(retrievedContext);

  // Correctness: overlap of generated with expected
  let expectedOverlap = 0;
  expectedTokens.forEach((token) => {
    if (genTokens.has(token)) expectedOverlap++;
  });
  const correctnessRatio =
    expectedTokens.size > 0 ? expectedOverlap / expectedTokens.size : 0.5;

  // Groundedness: overlap of generated with context
  let contextOverlap = 0;
  genTokens.forEach((token) => {
    if (contextTokens.has(token)) contextOverlap++;
  });
  const groundednessRatio =
    genTokens.size > 0 ? contextOverlap / genTokens.size : 0.8;

  // Completeness: length and overlap heuristic
  const completenessRatio = Math.min(
    1,
    (correctnessRatio * 0.7) + (Math.min(generatedAnswer.length, 100) / 100 * 0.3)
  );

  const to1to5 = (ratio: number) => Math.max(1, Math.min(5, Math.round(1 + ratio * 4)));

  const rawCorrectness = to1to5(correctnessRatio);
  const rawGroundedness = to1to5(groundednessRatio);
  const rawCompleteness = to1to5(completenessRatio);

  return {
    correctnessScore: Number(correctnessRatio.toFixed(4)),
    groundednessScore: Number(groundednessRatio.toFixed(4)),
    completenessScore: Number(completenessRatio.toFixed(4)),
    rawScores: {
      correctness: rawCorrectness,
      groundedness: rawGroundedness,
      completeness: rawCompleteness,
    },
    reasoning: `[Heuristic Fallback] Evaluated via token overlap: ${(correctnessRatio * 100).toFixed(0)}% answer match, ${(groundednessRatio * 100).toFixed(0)}% context grounding.`,
    isFallback: true,
  };
}
