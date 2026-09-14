"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  uploadAndRegisterDocument,
  processDocument,
  deleteDocumentAndStorage,
} from "@/lib/ingestion/processor";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { enforceRateLimit } from "@/lib/security/rate-limiter";
import { logAuditEvent } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";

export async function uploadDocumentAction(formData: FormData) {
  const user = await requireAuth();

  const workspaceId = formData.get("workspaceId") as string;
  const file = formData.get("file") as File;
  const category = (formData.get("category") as string) || "General";

  if (!workspaceId || !file) {
    return { error: "Missing file or workspace ID" };
  }

  // Security guard: verify user has membership in workspace
  await requireWorkspaceMember(workspaceId, "member");

  // Rate limiting check
  const rateLimit = enforceRateLimit("upload", user.id);
  if (!rateLimit.allowed) {
    return {
      error: rateLimit.error,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const doc = await uploadAndRegisterDocument({
      workspaceId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      buffer,
      category,
    });

    // Record audit event
    await logAuditEvent({
      workspaceId,
      userId: user.id,
      action: "document.upload",
      resourceType: "document",
      resourceId: doc.id,
      metadata: {
        filename: file.name,
        sizeBytes: buffer.length,
        category,
      },
    });

    revalidatePath("/documents");
    revalidatePath("/dashboard");

    return { success: true, documentId: doc.id };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload document",
    };
  }
}

export async function processDocumentAction(documentId: string) {
  await requireAuth();

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) {
    return { error: "Document not found" };
  }

  // Security guard: verify workspace authorization
  await requireWorkspaceMember(doc.workspaceId, "member");

  try {
    await processDocument(documentId);

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Processing failed",
    };
  }
}

export async function deleteDocumentAction(documentId: string) {
  await requireAuth();

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) {
    return { error: "Document not found" };
  }

  // Security guard
  await requireWorkspaceMember(doc.workspaceId, "member");

  try {
    await deleteDocumentAndStorage(documentId);

    // Record audit event
    const user = await requireAuth();
    await logAuditEvent({
      workspaceId: doc.workspaceId,
      userId: user.id,
      action: "document.delete",
      resourceType: "document",
      resourceId: documentId,
      metadata: {
        documentName: doc.name,
      },
    });

    revalidatePath("/documents");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete document",
    };
  }
}
