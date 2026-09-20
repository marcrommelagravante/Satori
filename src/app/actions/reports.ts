"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  getReports,
  getReport,
  deleteReport,
  createReport,
  generateGroundedReport,
  type CreateReportInput,
  type ReportFormat,
} from "@/lib/reports";
export type { ReportFormat };
import { logAuditEvent } from "@/lib/security/audit";
import { enforceRateLimit } from "@/lib/security/rate-limiter";
import { revalidatePath } from "next/cache";

export interface GenerateAndCreateReportInput {
  workspaceId: string;
  title: string;
  format: ReportFormat;
  sourceDocumentIds: string[];
  focusTopic?: string;
}

export async function generateAndCreateReportAction(
  input: GenerateAndCreateReportInput
) {
  const user = await requireAuth();
  await requireWorkspaceMember(input.workspaceId, "member");

  if (!input.sourceDocumentIds || input.sourceDocumentIds.length === 0) {
    return {
      success: false,
      error: "Please select at least one source document to generate a grounded report.",
    };
  }

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
    // 1. Live Gemini synthesis from real documents
    const content = await generateGroundedReport({
      workspaceId: input.workspaceId,
      format: input.format,
      title: input.title,
      sourceDocumentIds: input.sourceDocumentIds,
      focusTopic: input.focusTopic,
    });

    // 2. Map format to database type
    const dbType =
      input.format === "comparison" ? "document_comparison" : "document_summary";

    // 3. Persist report record
    const report = await createReport({
      workspaceId: input.workspaceId,
      userId: user.id,
      title: input.title,
      type: dbType,
      content: content as unknown as Record<string, unknown>,
      sourceDocumentIds: input.sourceDocumentIds,
    });

    await logAuditEvent({
      workspaceId: input.workspaceId,
      userId: user.id,
      action: "report.generate",
      resourceType: "report",
      resourceId: report.id,
      metadata: {
        title: report.title,
        reportType: report.type,
        format: input.format,
        sourceDocumentCount: input.sourceDocumentIds.length,
      },
    });

    revalidatePath("/reports");
    return { success: true, report };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate report",
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
