import { requireAuth, type SessionUser } from "@/lib/auth/session";
import { getWorkspaceById, type WorkspaceWithRole } from "./service";
import type { WorkspaceRole } from "@/lib/db/schema";

const ROLE_RANKS: Record<WorkspaceRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

export class WorkspaceAccessError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = "WorkspaceAccessError";
  }
}

export interface WorkspaceContext {
  user: SessionUser;
  workspace: WorkspaceWithRole;
  role: WorkspaceRole;
}

export async function requireWorkspaceMember(
  workspaceId: string,
  minRole: WorkspaceRole = "member"
): Promise<WorkspaceContext> {
  const user = await requireAuth();

  const workspace = await getWorkspaceById(workspaceId, user.id);
  if (!workspace) {
    throw new WorkspaceAccessError("Workspace not found or access denied", 404);
  }

  if (ROLE_RANKS[workspace.role] < ROLE_RANKS[minRole]) {
    throw new WorkspaceAccessError(
      `Insufficient permissions. Required role: ${minRole}`,
      403
    );
  }

  return {
    user,
    workspace,
    role: workspace.role,
  };
}
