import { db } from "@/lib/db";
import { auditLogs, type NewAuditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface LogAuditParams {
  workspaceId: string;
  userId: string;
  action:
    | "document.upload"
    | "document.delete"
    | "workspace.create"
    | "workspace.delete"
    | "member.role_change"
    | "report.generate"
    | "evaluation.run"
    | (string & {});
  resourceType: "document" | "workspace" | "report" | "evaluation" | "member" | (string & {});
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    const entry: NewAuditLog = {
      workspaceId: params.workspaceId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      metadata: params.metadata || {},
    };

    await db.insert(auditLogs).values(entry);
  } catch (err) {
    // Audit logging should be non-blocking but recorded to console error in case of DB glitch
    console.error("[AUDIT LOG ERROR] Failed to record audit event:", err);
  }
}

export async function getWorkspaceAuditLogs(
  workspaceId: string,
  limit = 50
) {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.workspaceId, workspaceId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
