"use server";

import { requireAuth } from "@/lib/auth/session";
import { createWorkspace } from "@/lib/workspaces/service";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  slug: z.string().max(40).optional(),
});

export async function createWorkspaceAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const rawName = formData.get("name") as string;
  const rawSlug = formData.get("slug") as string;

  const validated = createWorkspaceSchema.safeParse({
    name: rawName,
    slug: rawSlug || undefined,
  });

  if (!validated.success) {
    const errorMsg = validated.error.issues?.[0]?.message || "Invalid input";
    throw new Error(errorMsg);
  }

  const workspace = await createWorkspace(
    user.id,
    validated.data.name,
    validated.data.slug
  );

  revalidatePath("/", "layout");
  redirect(`/dashboard?ws=${workspace.id}`);
}

export async function deleteWorkspaceAction(workspaceId: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  if (!workspaceId) {
    return { success: false, error: "Workspace ID is required" };
  }

  try {
    const { deleteWorkspace } = await import("@/lib/workspaces/service");
    const { logAuditEvent } = await import("@/lib/security/audit");

    await deleteWorkspace(workspaceId, user.id);

    // Audit log
    await logAuditEvent({
      workspaceId,
      userId: user.id,
      action: "workspace.delete",
      resourceType: "workspace",
      resourceId: workspaceId,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete workspace",
    };
  }
}

const renameWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters").max(50, "Workspace name cannot exceed 50 characters"),
});

export async function renameWorkspaceAction(
  workspaceId: string,
  name: string
): Promise<{ success: boolean; error?: string; name?: string }> {
  try {
    const validated = renameWorkspaceSchema.safeParse({ workspaceId, name });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid workspace name",
      };
    }

    const { requireWorkspaceMember } = await import("@/lib/workspaces/guard");
    const { renameWorkspace } = await import("@/lib/workspaces/service");
    const { logAuditEvent } = await import("@/lib/security/audit");

    const ctx = await requireWorkspaceMember(validated.data.workspaceId, "admin");
    const previousName = ctx.workspace.name;

    const updated = await renameWorkspace(validated.data.workspaceId, validated.data.name);

    await logAuditEvent({
      workspaceId: validated.data.workspaceId,
      userId: ctx.user.id,
      action: "workspace.rename",
      resourceType: "workspace",
      resourceId: validated.data.workspaceId,
      metadata: {
        from: previousName,
        to: updated.name,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, name: updated.name };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to rename workspace",
    };
  }
}

