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
