"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  getReports,
  getReport,
  deleteReport,
  createReport,
  CreateReportInput,
} from "@/lib/reports";
import { revalidatePath } from "next/cache";

export async function getReportsAction(workspaceId: string) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const data = await getReports(workspaceId);
    return { success: true, reports: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load reports",
      reports: [],
    };
  }
}

export async function getReportAction(reportId: string, workspaceId: string) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const report = await getReport(reportId, workspaceId);
    if (!report) {
      return { success: false, error: "Report not found" };
    }
    return { success: true, report };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load report",
    };
  }
}

export async function deleteReportAction(
  reportId: string,
  workspaceId: string
) {
  await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const ok = await deleteReport(reportId, workspaceId);
    if (!ok) {
      return { success: false, error: "Report not found or already deleted" };
    }

    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete report",
    };
  }
}
