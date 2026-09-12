import { db } from "@/lib/db";
import {
  documents,
  documentVersions,
  documentChunks,
  type Document,
} from "@/lib/db/schema";
import { getStorage } from "@/lib/storage";
import { extractDocumentText } from "./extractors";
import { cleanText } from "./cleaner";
import { chunkDocument } from "./chunker";
import { eq } from "drizzle-orm";

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt"];
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream", // Fallback when browsers send generic octet
];

export interface UploadFileInput {
  workspaceId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
  category?: string;
}

export async function uploadAndRegisterDocument({
  workspaceId,
  filename,
  mimeType,
  buffer,
  category,
}: UploadFileInput): Promise<Document> {
  // 1. Validate file size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds the 15 MB limit (size: ${(buffer.length / (1024 * 1024)).toFixed(1)} MB)`
    );
  }

  // 2. Validate extension
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type .${ext}. Only PDF, DOCX, and TXT are supported.`
    );
  }

  // 3. Generate storage key and upload
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `workspaces/${workspaceId}/${Date.now()}-${safeFilename}`;

  const storage = getStorage();
  const { url, key } = await storage.upload(storageKey, buffer, mimeType);

  // 4. Create document record in database with status 'pending'
  const [doc] = await db
    .insert(documents)
    .values({
      workspaceId,
      name: filename,
      mimeType,
      sizeBytes: buffer.length,
      status: "pending",
      category: category || "General",
    })
    .returning();

  // 5. Create initial document version record
  await db.insert(documentVersions).values({
    documentId: doc.id,
    versionNumber: 1,
    storageKey: key || url,
  });

  return doc;
}

export async function processDocument(documentId: string): Promise<void> {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) {
    throw new Error("Document not found");
  }

  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .limit(1);

  if (!version) {
    throw new Error("Document version record not found");
  }

  try {
    // 1. Transition to 'processing'
    await db
      .update(documents)
      .set({ status: "processing", errorMessage: null, updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    // 2. Download original file from storage
    const storage = getStorage();
    const buffer = await storage.download(version.storageKey);

    // 3. Extract text
    const extracted = await extractDocumentText(buffer, doc.mimeType, doc.name);
    const cleanedFullText = cleanText(extracted.fullText);

    if (!cleanedFullText || cleanedFullText.trim().length === 0) {
      throw new Error(
        "No readable text could be extracted from this document."
      );
    }

    // 4. Update version with extracted text
    await db
      .update(documentVersions)
      .set({ extractedText: cleanedFullText })
      .where(eq(documentVersions.id, version.id));

    // 5. Generate structural chunks
    const chunks = chunkDocument(extracted);

    if (chunks.length === 0) {
      throw new Error("Document produced zero chunk segments.");
    }

    // 6. Delete any existing chunks for idempotency / retries
    await db
      .delete(documentChunks)
      .where(eq(documentChunks.documentVersionId, version.id));

    // 7. Persist chunks in database
    await db.insert(documentChunks).values(
      chunks.map((c) => ({
        documentVersionId: version.id,
        chunkIndex: c.chunkIndex,
        content: c.content,
        pageNumber: c.pageNumber,
        section: c.section,
        tokenEstimate: c.tokenEstimate,
      }))
    );

    // 8. Mark document 'ready'
    await db
      .update(documents)
      .set({ status: "ready", errorMessage: null, updatedAt: new Date() })
      .where(eq(documents.id, documentId));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Document processing failed";

    await db
      .update(documents)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    throw error;
  }
}

export async function deleteDocumentAndStorage(documentId: string): Promise<void> {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) return;

  const versions = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId));

  const storage = getStorage();
  for (const v of versions) {
    if (v.storageKey) {
      await storage.delete(v.storageKey);
    }
  }

  // Deleting document cascades to document_versions and document_chunks
  await db.delete(documents).where(eq(documents.id, documentId));
}
