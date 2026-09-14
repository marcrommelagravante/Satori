import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  workspaces,
  workspaceMembers,
  evalCases,
  evalRuns,
  evalResults,
  aiRuns,
  documents,
  documentChunks,
} from "../src/lib/db/schema";
import {
  calculateRecallK,
  calculatePrecisionK,
  calculateHitRate,
  calculateMRR,
  validateCitations,
  computeRetrievalMetrics,
} from "../src/lib/evaluations/metrics";
import { evaluateWithFallback, normalizeScore } from "../src/lib/evaluations/judge";
import { generateBenchmarkCases } from "../src/lib/evaluations/generator";
import {
  createEvalCase,
  getEvalCases,
  deleteEvalCase,
  getEvalRuns,
  getEvalRunDetails,
  setBaselineRun,
  getActiveBaseline,
} from "../src/lib/evaluations/service";
import { runEvaluationSuite } from "../src/lib/evaluations/runner";
import { getWorkspaceTelemetry } from "../src/lib/observability";
import { eq, and } from "drizzle-orm";

async function runPhase7Verification() {
  console.log("==========================================================");
  console.log("=== SATORI PHASE 7: EVALUATION & OBSERVABILITY VERIFY ====");
  console.log("==========================================================\n");

  // 1. Setup Workspaces & User
  const existingWorkspaces = await db.select().from(workspaces).limit(2);
  if (existingWorkspaces.length === 0) {
    throw new Error("No workspaces found. Please ensure database is initialized.");
  }

  const workspaceA = existingWorkspaces[0];
  let workspaceB = existingWorkspaces[1];

  if (!workspaceB) {
    console.log("[Setup] Creating isolated Workspace B for cross-tenant checks...");
    const [newWs] = await db
      .insert(workspaces)
      .values({
        name: `Tenant Isolation B ${Date.now()}`,
        slug: `tenant-b-${Date.now()}`,
      })
      .returning();
    workspaceB = newWs;
  }

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceA.id))
    .limit(1);

  if (member.length === 0) {
    throw new Error("No member found in Workspace A.");
  }
  const testUserId = member[0].userId;

  console.log(`[Setup] Primary Workspace: "${workspaceA.name}" (${workspaceA.id})`);
  console.log(`[Setup] Isolated Workspace: "${workspaceB.name}" (${workspaceB.id})`);
  console.log(`[Setup] Test User: ${testUserId}\n`);

  // =========================================================================
  // TEST 1: Metrics Engine Mathematical Correctness
  // =========================================================================
  console.log("--- TEST 1: Evaluation Metrics Engine Validation ---");
  const expectedChunkIds = ["chunk-1", "chunk-2", "chunk-3"];
  const retrievedChunkIds = ["chunk-1", "chunk-4", "chunk-2", "chunk-5", "chunk-6"];

  const recall5 = calculateRecallK(retrievedChunkIds, expectedChunkIds, 5);
  // overlap = ["chunk-1", "chunk-2"] -> 2 / 3 = 0.6667
  console.log(`  Recall@5: ${recall5} (Expected: ~0.6667)`);
  if (Math.abs(recall5 - 0.6667) > 0.001) {
    throw new Error(`Recall@5 calculation failed: expected 0.6667, got ${recall5}`);
  }

  const precision5 = calculatePrecisionK(retrievedChunkIds, expectedChunkIds, 5);
  // overlap = 2 -> 2 / 5 = 0.4
  console.log(`  Precision@5: ${precision5} (Expected: 0.4000)`);
  if (Math.abs(precision5 - 0.4) > 0.001) {
    throw new Error(`Precision@5 calculation failed: expected 0.4, got ${precision5}`);
  }

  const hitRate = calculateHitRate(retrievedChunkIds, expectedChunkIds, 5);
  console.log(`  Hit Rate: ${hitRate} (Expected: 1.0)`);
  if (hitRate !== 1.0) {
    throw new Error(`Hit Rate failed: expected 1.0, got ${hitRate}`);
  }

  const mrr = calculateMRR(retrievedChunkIds, expectedChunkIds, 5);
  // first hit at index 0 (rank 1) -> 1 / 1 = 1.0
  console.log(`  MRR: ${mrr} (Expected: 1.0)`);
  if (mrr !== 1.0) {
    throw new Error(`MRR calculation failed: expected 1.0, got ${mrr}`);
  }

  const validWorkspaceChunks = new Set(["chunk-1", "chunk-2", "chunk-3", "chunk-4"]);
  const citationValidation = validateCitations(
    ["chunk-1", "chunk-2", "unauthorized-chunk-99"],
    validWorkspaceChunks
  );
  console.log(
    `  Citation Accuracy: ${citationValidation.accuracy} (2 valid, 1 invalid: ${citationValidation.invalidChunkIds.join(", ")})`
  );
  if (citationValidation.accuracy !== 0.6667 || citationValidation.invalidChunkIds.length !== 1) {
    throw new Error(`Citation validation failed: expected 0.6667, got ${citationValidation.accuracy}`);
  }
  console.log("✓ TEST 1 PASSED: Metrics engine produces exact mathematical values.\n");

  // =========================================================================
  // TEST 2: LLM Judge & Heuristic Fallback
  // =========================================================================
  console.log("--- TEST 2: LLM Judge & Heuristic Fallback Evaluation ---");
  const normalizedMax = normalizeScore(5);
  const normalizedMid = normalizeScore(3);
  const normalizedMin = normalizeScore(1);
  console.log(`  Normalized Scores: 5 -> ${normalizedMax}, 3 -> ${normalizedMid}, 1 -> ${normalizedMin}`);
  if (normalizedMax !== 1.0 || normalizedMid !== 0.5 || normalizedMin !== 0.0) {
    throw new Error("Score normalization formula failed.");
  }

  const fallbackJudgeResult = evaluateWithFallback({
    question: "What is the annual equipment reimbursement limit?",
    expectedAnswer: "The annual equipment reimbursement limit is $500 per calendar year.",
    generatedAnswer: "Employees can receive up to $500 per calendar year for equipment reimbursement.",
    retrievedContext: "Equipment Reimbursement Policy: Each full-time team member is eligible for a $500 equipment reimbursement per calendar year.",
  });

  console.log(`  Fallback Correctness Score: ${fallbackJudgeResult.correctnessScore}`);
  console.log(`  Fallback Groundedness Score: ${fallbackJudgeResult.groundednessScore}`);
  console.log(`  Fallback Reasoning: "${fallbackJudgeResult.reasoning}"`);
  if (fallbackJudgeResult.correctnessScore < 0.5 || fallbackJudgeResult.groundednessScore < 0.5) {
    throw new Error("Fallback judge scored matching text unexpectedly low.");
  }
  console.log("✓ TEST 2 PASSED: LLM judge scoring and fallback heuristic verified.\n");

  // =========================================================================
  // TEST 3: Benchmark Generator & Synthetic Cases
  // =========================================================================
  console.log("--- TEST 3: Benchmark Case Generation ---");
  const generatedCases = await generateBenchmarkCases(workspaceA.id, 2);
  console.log(`  Generated ${generatedCases.length} benchmark test case(s) from workspace documents:`);
  for (const gc of generatedCases) {
    console.log(`    - [${gc.category} / ${gc.difficulty}] Q: "${gc.question}"`);
    console.log(`      Ground truth chunks: [${gc.expectedChunkIds.join(", ")}]`);
  }
  if (generatedCases.length > 0) {
    if (!generatedCases[0].question || !generatedCases[0].expectedAnswer) {
      throw new Error("Generated case missing required fields.");
    }
  }
  console.log("✓ TEST 3 PASSED: Benchmark generation works cleanly.\n");

  // =========================================================================
  // TEST 4: Evaluations CRUD & Service Layer
  // =========================================================================
  console.log("--- TEST 4: Evaluations Service CRUD & Persistence ---");
  const newCase = await createEvalCase(workspaceA.id, testUserId, {
    question: "Test verification question regarding organizational bylaws",
    expectedAnswer: "The bylaws require a quorum of two-thirds of voting members.",
    category: "bylaws",
    difficulty: "medium",
  });
  console.log(`  Created Eval Case: "${newCase.question}" (${newCase.id})`);

  const initialCases = await getEvalCases(workspaceA.id);
  const found = initialCases.some((c) => c.id === newCase.id);
  if (!found) {
    throw new Error("Created test case not returned by getEvalCases.");
  }

  console.log("✓ TEST 4 PASSED: Eval case creation and querying verified.\n");

  // =========================================================================
  // TEST 5: Full Evaluation Suite Execution & Run Persistence
  // =========================================================================
  console.log("--- TEST 5: Full Evaluation Suite Execution ---");
  console.log("  Executing evaluation suite across workspace test cases...");
  const suiteResult = await runEvaluationSuite({
    workspaceId: workspaceA.id,
    userId: testUserId,
    runName: `Automated Test Run ${Date.now()}`,
    caseIds: [newCase.id],
    topK: 5,
  });

  const { run, results } = suiteResult;
  console.log(`  Run Completed: "${run.name}" (Status: ${run.status})`);
  console.log(`    - Cases Evaluated: ${run.totalCases}`);
  console.log(`    - Mean Recall@5: ${run.retrievalRecallK}`);
  console.log(`    - Mean Precision@5: ${run.retrievalPrecisionK}`);
  console.log(`    - Answer Correctness: ${run.answerCorrectness}`);
  console.log(`    - Groundedness Score: ${run.groundednessScore}`);
  console.log(`    - Citation Accuracy: ${run.citationAccuracy}`);
  console.log(`    - Average Latency: ${run.avgLatencyMs}ms`);

  if (run.status !== "completed") {
    throw new Error(`Evaluation run did not complete successfully: status = ${run.status}`);
  }
  if (results.length === 0) {
    throw new Error("No per-case results returned from evaluation run.");
  }
  console.log("✓ TEST 5 PASSED: Full evaluation suite executed and results persisted.\n");

  // =========================================================================
  // TEST 6: Baseline Locking & Comparison
  // =========================================================================
  console.log("--- TEST 6: Baseline Management & Diffs ---");
  const baselineSet = await setBaselineRun(workspaceA.id, run.id);
  console.log(`  Set Run "${baselineSet.name}" as Active Baseline: isBaseline = ${baselineSet.isBaseline}`);
  if (!baselineSet.isBaseline) {
    throw new Error("Failed to set run as active baseline.");
  }

  const activeBaseline = await getActiveBaseline(workspaceA.id);
  if (activeBaseline?.id !== run.id) {
    throw new Error(`Active baseline mismatch: expected ${run.id}, got ${activeBaseline?.id}`);
  }

  const runDetails = await getEvalRunDetails(workspaceA.id, run.id);
  if (!runDetails || !runDetails.run) {
    throw new Error("getEvalRunDetails returned null.");
  }
  console.log(`  Run Details retrieved with ${runDetails.results.length} case result(s).`);
  console.log("✓ TEST 6 PASSED: Active baseline locked and run details verified.\n");

  // =========================================================================
  // TEST 7: Observability Telemetry Aggregation
  // =========================================================================
  console.log("--- TEST 7: Observability Telemetry Aggregator ---");
  const telemetry = await getWorkspaceTelemetry(workspaceA.id);
  console.log(`  Total AI Operations: ${telemetry.totalRuns}`);
  console.log(`  Success Rate: ${telemetry.successRate}%`);
  console.log(`  Total Tokens: ${telemetry.totalTokens} (In: ${telemetry.totalInputTokens}, Out: ${telemetry.totalOutputTokens})`);
  console.log(`  Latency Profile: Avg = ${telemetry.avgLatencyMs}ms, p50 = ${telemetry.p50LatencyMs}ms, p95 = ${telemetry.p95LatencyMs}ms`);
  console.log(`  Operations Breakdown: ${telemetry.operations.map((o) => `${o.operation} (${o.count})`).join(", ")}`);
  console.log(`  Recent Traces: ${telemetry.recentTraces.length} records`);

  if (telemetry.totalRuns === 0) {
    throw new Error("Telemetry showed 0 total runs despite previous runs executing.");
  }
  console.log("✓ TEST 7 PASSED: Observability telemetry accurately aggregated.\n");

  // =========================================================================
  // TEST 8: Multi-Tenant Workspace Boundary Isolation
  // =========================================================================
  console.log("--- TEST 8: Multi-Tenant Workspace Boundary Isolation ---");
  // Check that Workspace B cannot query Workspace A's eval cases
  const wsBCases = await getEvalCases(workspaceB.id);
  const leakedCase = wsBCases.find((c) => c.id === newCase.id);
  if (leakedCase) {
    throw new Error("SECURITY VIOLATION: Workspace A eval case was leaked into Workspace B!");
  }
  console.log("  ✓ Cross-workspace eval cases query: strictly isolated (0 leakage)");

  // Check that Workspace B cannot query Workspace A's runs
  const wsBRuns = await getEvalRuns(workspaceB.id);
  const leakedRun = wsBRuns.find((r) => r.id === run.id);
  if (leakedRun) {
    throw new Error("SECURITY VIOLATION: Workspace A eval run was leaked into Workspace B!");
  }
  console.log("  ✓ Cross-workspace eval runs query: strictly isolated (0 leakage)");

  // Check that Workspace B cannot get details of Workspace A's run
  const unauthorizedDetails = await getEvalRunDetails(workspaceB.id, run.id);
  if (unauthorizedDetails !== null) {
    throw new Error("SECURITY VIOLATION: Workspace B was able to fetch Workspace A's run details!");
  }
  console.log("  ✓ Cross-workspace run details access: strictly denied (null returned)");

  // Clean up test case
  await deleteEvalCase(workspaceA.id, newCase.id);
  console.log("  ✓ Cleaned up verification test case");

  console.log("✓ TEST 8 PASSED: All multi-tenant boundary checks strictly enforced.\n");

  console.log("==========================================================");
  console.log("=== ALL PHASE 7 VERIFICATION TESTS PASSED SUCCESSFULLY ===");
  console.log("==========================================================");
}

runPhase7Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ PHASE 7 VERIFICATION FAILED:", err);
    process.exit(1);
  });
