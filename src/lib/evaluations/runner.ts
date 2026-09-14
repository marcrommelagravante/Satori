import { db } from "@/lib/db";
import {
  evalCases,
  evalRuns,
  evalResults,
  aiRuns,
  type EvalCase,
  type EvalRun,
  type EvalResult,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { searchChunks } from "@/lib/rag/retrieval";
import { buildRagContext } from "@/lib/rag/context";
import { generateGroundedResponse } from "@/lib/ai/gemini";
import { computeRetrievalMetrics, validateCitations } from "./metrics";
import { evaluateWithJudge } from "./judge";
import { generateBenchmarkCases } from "./generator";

export interface RunEvaluationOptions {
  workspaceId: string;
  userId: string;
  runName?: string;
  caseIds?: string[];
  topK?: number;
}

export interface RunEvaluationResult {
  run: EvalRun;
  results: EvalResult[];
}

/**
 * Orchestrates an end-to-end evaluation benchmark suite execution.
 * Executes retrieval and grounded generation for each test case,
 * computes metrics, runs LLM-as-judge evaluation, and records results.
 */
export async function runEvaluationSuite(
  options: RunEvaluationOptions
): Promise<RunEvaluationResult> {
  const { workspaceId, userId, runName, caseIds, topK = 5 } = options;

  // 1. Fetch test cases for workspace
  let targetCases: EvalCase[] = [];

  if (caseIds && caseIds.length > 0) {
    targetCases = await db
      .select()
      .from(evalCases)
      .where(
        inArray(evalCases.id, caseIds)
      );
    // Filter to workspace
    targetCases = targetCases.filter((c) => c.workspaceId === workspaceId);
  } else {
    targetCases = await db
      .select()
      .from(evalCases)
      .where(eq(evalCases.workspaceId, workspaceId));
  }

  // If no test cases exist yet, auto-generate synthetic benchmark cases from workspace documents
  if (targetCases.length === 0) {
    const generated = await generateBenchmarkCases(workspaceId, 3);
    if (generated.length > 0) {
      const inserted = await db
        .insert(evalCases)
        .values(
          generated.map((g) => ({
            workspaceId,
            createdBy: userId,
            question: g.question,
            expectedAnswer: g.expectedAnswer,
            expectedChunkIds: g.expectedChunkIds,
            category: g.category,
            difficulty: g.difficulty,
          }))
        )
        .returning();
      targetCases = inserted;
    }
  }

  if (targetCases.length === 0) {
    throw new Error(
      "No evaluation cases found and no workspace documents available to generate benchmark cases."
    );
  }

  // 2. Initialize eval run record
  const effectiveName =
    runName?.trim() ||
    `Benchmark Run #${Math.floor(Date.now() / 1000).toString().slice(-4)} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

  const [runRecord] = await db
    .insert(evalRuns)
    .values({
      workspaceId,
      createdBy: userId,
      name: effectiveName,
      status: "running",
      isBaseline: false,
      totalCases: targetCases.length,
    })
    .returning();

  const suiteStartTime = Date.now();
  const executedResults: EvalResult[] = [];

  let sumRecall = 0;
  let sumPrecision = 0;
  let sumCorrectness = 0;
  let sumGroundedness = 0;
  let sumCitationAccuracy = 0;
  let sumLatency = 0;

  try {
    for (const testCase of targetCases) {
      const caseStartTime = Date.now();

      // A. Hybrid Retrieval
      const searchResults = await searchChunks({
        mode: "hybrid",
        workspaceId,
        query: testCase.question,
        topK,
        similarityThreshold: 0.35,
      });

      const retrievedChunkIds = searchResults.map((r) => r.chunkId);

      // B. Compute Retrieval Metrics
      const retrievalMetrics = computeRetrievalMetrics(
        retrievedChunkIds,
        testCase.expectedChunkIds || [],
        topK
      );

      // C. Build Grounded Context
      const ragContext = buildRagContext(searchResults, { maxTokens: 3000 });

      // D. Generate Grounded Response
      let generatedText = "";
      try {
        const genResult = await generateGroundedResponse({
          userQuestion: testCase.question,
          context: ragContext.formattedContext,
          conversationHistory: [],
        });
        generatedText = genResult.text;
      } catch (err) {
        generatedText = "I encountered an error generating an answer based on your documents.";
      }

      // E. Parse & Validate Citations
      const matchedSourceIds: string[] = [];
      const citationRegex = /\[source[-_:]?\s*(\d+)\]/gi;
      let match;
      while ((match = citationRegex.exec(generatedText)) !== null) {
        matchedSourceIds.push(`source-${match[1]}`);
      }

      const citedChunkIds: string[] = [];
      for (const srcId of matchedSourceIds) {
        const attribution = ragContext.citationMap[srcId];
        if (attribution) {
          citedChunkIds.push(attribution.chunkId);
        }
      }

      const citationValidation = validateCitations(
        citedChunkIds,
        new Set(retrievedChunkIds)
      );

      // F. Run LLM Judge
      const judgeResult = await evaluateWithJudge({
        question: testCase.question,
        expectedAnswer: testCase.expectedAnswer,
        generatedAnswer: generatedText,
        retrievedContext: ragContext.formattedContext,
      });

      const caseLatency = Date.now() - caseStartTime;

      // Status determined by basic threshold
      const isPassed =
        judgeResult.correctnessScore >= 0.4 &&
        retrievalMetrics.hitRate >= (testCase.expectedChunkIds.length > 0 ? 0.5 : 0);

      // Persist individual case result
      const [evalResultRecord] = await db
        .insert(evalResults)
        .values({
          runId: runRecord.id,
          caseId: testCase.id,
          retrievedChunkIds,
          generatedAnswer: generatedText,
          citations: {
            citedCount: citedChunkIds.length,
            accuracy: citationValidation.accuracy,
            invalidChunkIds: citationValidation.invalidChunkIds,
          },
          recallK: retrievalMetrics.recallK,
          precisionK: retrievalMetrics.precisionK,
          hitRate: retrievalMetrics.hitRate,
          correctnessScore: judgeResult.correctnessScore,
          groundednessScore: judgeResult.groundednessScore,
          citationScore: citationValidation.accuracy,
          judgeFeedback: judgeResult.reasoning,
          latencyMs: caseLatency,
          status: isPassed ? "passed" : "failed",
        })
        .returning();

      executedResults.push(evalResultRecord);

      sumRecall += retrievalMetrics.recallK;
      sumPrecision += retrievalMetrics.precisionK;
      sumCorrectness += judgeResult.correctnessScore;
      sumGroundedness += judgeResult.groundednessScore;
      sumCitationAccuracy += citationValidation.accuracy;
      sumLatency += caseLatency;
    }

    const n = targetCases.length;
    const avgRecallK = Number((sumRecall / n).toFixed(4));
    const avgPrecisionK = Number((sumPrecision / n).toFixed(4));
    const avgCorrectness = Number((sumCorrectness / n).toFixed(4));
    const avgGroundedness = Number((sumGroundedness / n).toFixed(4));
    const avgCitationAccuracy = Number((sumCitationAccuracy / n).toFixed(4));
    const avgLatencyMs = Math.round(sumLatency / n);

    // 3. Finalize run record
    const [completedRun] = await db
      .update(evalRuns)
      .set({
        status: "completed",
        retrievalRecallK: avgRecallK,
        retrievalPrecisionK: avgPrecisionK,
        answerCorrectness: avgCorrectness,
        groundednessScore: avgGroundedness,
        citationAccuracy: avgCitationAccuracy,
        avgLatencyMs,
        completedAt: new Date(),
      })
      .where(eq(evalRuns.id, runRecord.id))
      .returning();

    // 4. Log AI Run observability entry for the evaluation suite
    try {
      await db.insert(aiRuns).values({
        workspaceId,
        userId,
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        operation: "evaluation_suite",
        latencyMs: Date.now() - suiteStartTime,
        inputTokens: n * 500,
        outputTokens: n * 200,
        status: "success",
      });
    } catch {
      // Non-blocking telemetry
    }

    return {
      run: completedRun,
      results: executedResults,
    };
  } catch (error) {
    console.error("Evaluation run failed:", error);
    await db
      .update(evalRuns)
      .set({
        status: "failed",
        completedAt: new Date(),
      })
      .where(eq(evalRuns.id, runRecord.id));

    throw error;
  }
}
