"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  getReports,
  getReport,
  deleteReport,
  createReport,
  type CreateReportInput,
} from "@/lib/reports";
import { logAuditEvent } from "@/lib/security/audit";
import { enforceRateLimit } from "@/lib/security/rate-limiter";
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

export async function createReportAction(input: CreateReportInput) {
  const user = await requireAuth();
  await requireWorkspaceMember(input.workspaceId, "member");

  // Enforce rate limit
  const rateLimit = enforceRateLimit("reports", user.id);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.error,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  try {
    const report = await createReport(input);

    await logAuditEvent({
      workspaceId: input.workspaceId,
      userId: user.id,
      action: "report.generate",
      resourceType: "report",
      resourceId: report.id,
      metadata: {
        title: report.title,
        reportType: report.type,
      },
    });

    revalidatePath("/reports");
    return { success: true, report };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create report",
    };
  }
}

export async function deleteReportAction(
  reportId: string,
  workspaceId: string
) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    const ok = await deleteReport(reportId, workspaceId);
    if (!ok) {
      return { success: false, error: "Report not found or already deleted" };
    }

    await logAuditEvent({
      workspaceId,
      userId: user.id,
      action: "report.delete",
      resourceType: "report",
      resourceId: reportId,
    });

    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete report",
    };
  }
}
