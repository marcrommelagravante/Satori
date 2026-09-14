import { db } from "@/lib/db";
import {
  workspaces,
  workspaceMembers,
  documents,
  documentVersions,
  type Workspace,
  type WorkspaceRole,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getStorage } from "@/lib/storage";
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

export async function deleteWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  // 1. Verify that user is owner
  const member = await getWorkspaceById(workspaceId, userId);
  if (!member || member.role !== "owner") {
    throw new Error("Unauthorized: only workspace owners can delete a workspace.");
  }

  // 2. Fetch and purge all physical files in storage
  try {
    const workspaceDocs = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId));

    if (workspaceDocs.length > 0) {
      const docIds = workspaceDocs.map((d) => d.id);
      const versions = await db
        .select({ storageKey: documentVersions.storageKey })
        .from(documentVersions)
        .where(inArray(documentVersions.documentId, docIds));

      const storage = getStorage();
      for (const v of versions) {
        if (v.storageKey) {
          try {
            await storage.delete(v.storageKey);
          } catch (storageErr) {
            console.warn(
              `[STORAGE DELETE WARNING] Failed to delete key ${v.storageKey}:`,
              storageErr
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn(
      "[WORKSPACE DELETE WARNING] Error querying files for storage cleanup, continuing cascade:",
      err
    );
  }

  // 3. Cascade delete workspace (Neon DB cascades to documents, chunks, conversations, messages, reports, eval runs/cases, and memberships)
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

  return true;
}
