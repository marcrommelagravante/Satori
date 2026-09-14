"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  getEvalCases,
  createEvalCase,
  deleteEvalCase,
  getEvalRuns,
  getEvalRunDetails,
  setBaselineRun,
  generateSeedCases,
  runEvaluationSuite,
  type CreateEvalCaseInput,
} from "@/lib/evaluations";
import { revalidatePath } from "next/cache";

export async function getEvalCasesAction(workspaceId: string) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const cases = await getEvalCases(workspaceId);
    return { success: true, cases };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load evaluation cases",
      cases: [],
    };
  }
}

export async function createEvalCaseAction(
  workspaceId: string,
  data: CreateEvalCaseInput
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const newCase = await createEvalCase(workspaceId, user.id, data);
    revalidatePath("/evaluations");
    return { success: true, case: newCase };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create evaluation case",
    };
  }
}

export async function deleteEvalCaseAction(
  workspaceId: string,
  caseId: string
) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const deleted = await deleteEvalCase(workspaceId, caseId);
    revalidatePath("/evaluations");
    return { success: deleted };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete evaluation case",
    };
  }
}

export async function generateSeedCasesAction(
  workspaceId: string,
  targetCount: number = 3
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const generated = await generateSeedCases(workspaceId, user.id, targetCount);
    revalidatePath("/evaluations");
    return { success: true, count: generated.length, cases: generated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate seed benchmark cases",
      count: 0,
      cases: [],
    };
  }
}

export async function triggerEvaluationRunAction(
  workspaceId: string,
  runName?: string,
  caseIds?: string[]
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const result = await runEvaluationSuite({
      workspaceId,
      userId: user.id,
      runName,
      caseIds,
    });
    revalidatePath("/evaluations");
    return { success: true, run: result.run, results: result.results };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Evaluation run failed",
    };
  }
}

export async function getEvalRunsAction(workspaceId: string) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const runs = await getEvalRuns(workspaceId);
    return { success: true, runs };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load evaluation runs",
      runs: [],
    };
  }
}

export async function getEvalRunDetailsAction(
  workspaceId: string,
  runId: string
) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const details = await getEvalRunDetails(workspaceId, runId);
    if (!details) {
      return { success: false, error: "Evaluation run not found" };
    }
    return { success: true, details };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load run details",
    };
  }
}

export async function setBaselineRunAction(
  workspaceId: string,
  runId: string
) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const updated = await setBaselineRun(workspaceId, runId);
    revalidatePath("/evaluations");
    return { success: true, run: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to set baseline run",
    };
  }
}
