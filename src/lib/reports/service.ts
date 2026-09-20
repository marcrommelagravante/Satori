import { db } from "@/lib/db";
import { reports, Report, NewReport, ReportType } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateReportInput {
  workspaceId: string;
  userId?: string | null;
  conversationId?: string | null;
  title: string;
  type: ReportType;
  content: Record<string, unknown>;
  sourceDocumentIds?: string[];
}

/**
 * Creates a new report record scoped to a workspace.
 */
export async function createReport(
  input: CreateReportInput
): Promise<Report> {
  const [created] = await db
    .insert(reports)
    .values({
      workspaceId: input.workspaceId,
      createdBy: input.userId || null,
      conversationId: input.conversationId || null,
      title: input.title,
      type: input.type,
      content: input.content,
      sourceDocumentIds: input.sourceDocumentIds || [],
      status: "completed",
    } as NewReport)
    .returning();

  return created;
}

/**
 * Lists all reports for a specific workspace, ordered by newest first.
 */
export async function getReports(workspaceId: string): Promise<Report[]> {
  return db
    .select()
    .from(reports)
    .where(eq(reports.workspaceId, workspaceId))
    .orderBy(desc(reports.createdAt));
}

/**
 * Gets a single report by ID, verifying workspace membership.
 */
export async function getReport(
  reportId: string,
  workspaceId: string
): Promise<Report | null> {
  const [report] = await db
    .select()
    .from(reports)
    .where(
      and(eq(reports.id, reportId), eq(reports.workspaceId, workspaceId))
    )
    .limit(1);

  return report || null;
}

/**
 * Deletes a report, enforcing workspace isolation.
 */
export async function deleteReport(
  reportId: string,
  workspaceId: string
): Promise<boolean> {
  const result = await db
    .delete(reports)
    .where(
      and(eq(reports.id, reportId), eq(reports.workspaceId, workspaceId))
    )
    .returning({ id: reports.id });

  return result.length > 0;
}
