"use server";

import { requireAuth } from "@/lib/auth/session";
import { createWorkspace } from "@/lib/workspaces/service";
import { redirect } from "next/navigation";
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

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete workspace",
    };
  }
}
