import { db } from "@/lib/db";
import {
  evalCases,
  evalRuns,
  evalResults,
  type EvalCase,
  type EvalRun,
  type EvalResult,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateBenchmarkCases, type GeneratedEvalCase } from "./generator";

export interface CreateEvalCaseInput {
  question: string;
  expectedAnswer: string;
  expectedChunkIds?: string[];
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface EvalRunDetailResult {
  run: EvalRun;
  baselineRun: EvalRun | null;
  results: Array<{
    result: EvalResult;
    testCase: EvalCase;
  }>;
}

/**
 * Retrieves all evaluation cases for a workspace.
 */
export async function getEvalCases(workspaceId: string): Promise<EvalCase[]> {
  return db
    .select()
    .from(evalCases)
    .where(eq(evalCases.workspaceId, workspaceId))
    .orderBy(desc(evalCases.createdAt));
}

/**
 * Creates a single evaluation test case.
 */
export async function createEvalCase(
  workspaceId: string,
  userId: string,
  data: CreateEvalCaseInput
): Promise<EvalCase> {
  const [created] = await db
    .insert(evalCases)
    .values({
      workspaceId,
      createdBy: userId,
      question: data.question.trim(),
      expectedAnswer: data.expectedAnswer.trim(),
      expectedChunkIds: data.expectedChunkIds || [],
      category: data.category?.trim() || "general",
      difficulty: data.difficulty || "medium",
    })
    .returning();

  return created;
}

/**
 * Deletes an evaluation case, verifying workspace ownership.
 */
export async function deleteEvalCase(
  workspaceId: string,
  caseId: string
): Promise<boolean> {
  const [deleted] = await db
    .delete(evalCases)
    .where(and(eq(evalCases.id, caseId), eq(evalCases.workspaceId, workspaceId)))
    .returning();

  return !!deleted;
}

/**
 * Retrieves all evaluation runs for a workspace.
 */
export async function getEvalRuns(workspaceId: string): Promise<EvalRun[]> {
  return db
    .select()
    .from(evalRuns)
    .where(eq(evalRuns.workspaceId, workspaceId))
    .orderBy(desc(evalRuns.createdAt));
}

/**
 * Retrieves the current baseline evaluation run for a workspace, if any.
 */
export async function getActiveBaseline(
  workspaceId: string
): Promise<EvalRun | null> {
  const [baseline] = await db
    .select()
    .from(evalRuns)
    .where(and(eq(evalRuns.workspaceId, workspaceId), eq(evalRuns.isBaseline, true)))
    .limit(1);

  return baseline || null;
}

/**
 * Sets a specific run as the active workspace baseline.
 * Automatically clears previous baseline status from other runs in the workspace.
 */
export async function setBaselineRun(
  workspaceId: string,
  runId: string
): Promise<EvalRun> {
  // 1. Clear existing baselines in this workspace
  await db
    .update(evalRuns)
    .set({ isBaseline: false })
    .where(eq(evalRuns.workspaceId, workspaceId));

  // 2. Set new baseline
  const [updated] = await db
    .update(evalRuns)
    .set({ isBaseline: true })
    .where(and(eq(evalRuns.id, runId), eq(evalRuns.workspaceId, workspaceId)))
    .returning();

  if (!updated) {
    throw new Error("Evaluation run not found in this workspace.");
  }

  return updated;
}

/**
 * Fetches full details for a specific evaluation run, including individual case results and baseline diffs.
 */
export async function getEvalRunDetails(
  workspaceId: string,
  runId: string
): Promise<EvalRunDetailResult | null> {
  const [run] = await db
    .select()
    .from(evalRuns)
    .where(and(eq(evalRuns.id, runId), eq(evalRuns.workspaceId, workspaceId)))
    .limit(1);

  if (!run) return null;

  const baselineRun = await getActiveBaseline(workspaceId);

  const rawResults = await db
    .select({
      result: evalResults,
      testCase: evalCases,
    })
    .from(evalResults)
    .innerJoin(evalCases, eq(evalResults.caseId, evalCases.id))
    .where(eq(evalResults.runId, runId))
    .orderBy(desc(evalResults.createdAt));

  return {
    run,
    baselineRun: baselineRun?.id !== run.id ? baselineRun : null,
    results: rawResults,
  };
}

/**
 * Auto-generates and inserts benchmark evaluation cases from workspace documents.
 */
export async function generateSeedCases(
  workspaceId: string,
  userId: string,
  targetCount: number = 3
): Promise<EvalCase[]> {
  const generated: GeneratedEvalCase[] = await generateBenchmarkCases(
    workspaceId,
    targetCount
  );

  if (generated.length === 0) {
    return [];
  }

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

  return inserted;
}
