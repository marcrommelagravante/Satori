import { db } from "@/lib/db";
import { workspaces, workspaceMembers, type Workspace, type WorkspaceRole } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { SessionUser } from "@/lib/auth/session";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
  const records = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId));

  return records;
}

export async function getWorkspaceById(
  workspaceId: string,
  userId: string
): Promise<WorkspaceWithRole | null> {
  const [record] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1);

  return record || null;
}

export async function createWorkspace(
  userId: string,
  name: string,
  customSlug?: string
): Promise<WorkspaceWithRole> {
  const baseSlug = customSlug ? slugify(customSlug) : slugify(name);
  const uniqueSlug = `${baseSlug || "workspace"}-${Math.random().toString(36).substring(2, 7)}`;

  const [newWorkspace] = await db
    .insert(workspaces)
    .values({
      name,
      slug: uniqueSlug,
    })
    .returning();

  await db.insert(workspaceMembers).values({
    workspaceId: newWorkspace.id,
    userId,
    role: "owner",
  });

  return {
    ...newWorkspace,
    role: "owner",
  };
}

export async function getOrCreateDefaultWorkspace(
  user: SessionUser
): Promise<WorkspaceWithRole> {
  const existing = await getUserWorkspaces(user.id);
  if (existing.length > 0) {
    return existing[0];
  }

  const defaultName = user.name ? `${user.name}'s Workspace` : "My Workspace";
  return createWorkspace(user.id, defaultName);
}
