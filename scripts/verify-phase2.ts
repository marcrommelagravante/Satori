import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import {
  workspaces,
  documents,
  documentVersions,
  documentChunks,
} from "../src/lib/db/schema";
import {
  uploadAndRegisterDocument,
  processDocument,
  deleteDocumentAndStorage,
} from "../src/lib/ingestion/processor";
import { chunkDocument } from "../src/lib/ingestion/chunker";
import { cleanText } from "../src/lib/ingestion/cleaner";
import { eq } from "drizzle-orm";

async function runPhase2Verification() {
  console.log("=== SATORI PHASE 2 VERIFICATION ===");

  // 1. Get an existing workspace
  const [workspace] = await db.select().from(workspaces).limit(1);
  if (!workspace) {
    throw new Error("No workspace found. Run verify-phase1 first.");
  }
  console.log(`[1/5] Using test workspace: ${workspace.name} (${workspace.id})`);

  // 2. Test TXT Document Upload (Step 1: Upload to Storage)
  console.log("\n[2/5] Testing Step 1: Upload and Register TXT Document...");
  const sampleText = `
# Community Association Bylaws
Article I: Name and Purpose
The name of this organization shall be the Satori Community Knowledge Group.
Its primary objective is the advancement of collaborative learning and document intelligence.

Article II: Membership Rights
Section 1. Active Members
Any team member or resident in good standing shall be recognized as an active member with voting privileges.
Members have the right to inspect all published guidelines, participate in quarterly meetings, and propose amendments.

Section 2. Code of Conduct
All participants shall maintain respectful discourse, foster open communication, and protect sensitive organizational data.
Any violation of conduct policies shall be reviewed by the governance committee.

Article III: Governance and Officers
Officers shall consist of a President, Vice President, Secretary, and Treasurer.
Terms shall last for one fiscal year, renewable by majority vote during the annual general meeting.
`;

  const txtBuffer = Buffer.from(sampleText, "utf-8");
  const doc = await uploadAndRegisterDocument({
    workspaceId: workspace.id,
    filename: `bylaws_test_${Date.now()}.txt`,
    mimeType: "text/plain",
    buffer: txtBuffer,
    category: "Bylaws",
  });

  console.log("Created document record:", doc.id, "Status:", doc.status);
  if (doc.status !== "pending") {
    throw new Error(`Expected status 'pending', got '${doc.status}'`);
  }

  // 3. Test Step 2: Trigger Processing (Extract, Clean, Chunk)
  console.log("\n[3/5] Testing Step 2: Deliberate Ingestion Processing...");
  await processDocument(doc.id);

  const [processedDoc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id))
    .limit(1);

  console.log("Processed document status:", processedDoc?.status);
  if (processedDoc?.status !== "ready") {
    throw new Error(`Expected status 'ready', got '${processedDoc?.status}'`);
  }

  // Verify versions and chunks
  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, doc.id))
    .limit(1);

  console.log("Extracted text length:", version?.extractedText?.length, "characters");
  if (!version?.extractedText || version.extractedText.length === 0) {
    throw new Error("Expected extractedText to be populated in document_versions");
  }

  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentVersionId, version.id));

  console.log(`Generated and persisted ${chunks.length} chunks in Neon database:`);
  chunks.forEach((c) => {
    console.log(` - Chunk #${c.chunkIndex + 1} | Section: "${c.section || 'None'}" | Est. Tokens: ${c.tokenEstimate} | Length: ${c.content.length} chars`);
  });

  if (chunks.length === 0) {
    throw new Error("Expected at least 1 chunk to be created");
  }

  // 4. Test Idempotent Re-processing (Retry Simulation)
  console.log("\n[4/5] Testing Idempotent Re-processing (Retry)...");
  await processDocument(doc.id);
  const chunksAfterRetry = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentVersionId, version.id));

  console.log(`Chunks count after re-process (must match original ${chunks.length}):`, chunksAfterRetry.length);
  if (chunksAfterRetry.length !== chunks.length) {
    throw new Error(`Idempotency failure! Chunk count changed from ${chunks.length} to ${chunksAfterRetry.length}`);
  }

  // 5. Test Document Deletion & Storage Cleanup
  console.log("\n[5/5] Testing Document Deletion and Storage Cleanup...");
  await deleteDocumentAndStorage(doc.id);

  const [deletedDoc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id))
    .limit(1);

  const [deletedVersion] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, doc.id))
    .limit(1);

  console.log("Document in DB after deletion:", deletedDoc ? "STILL EXISTS" : "CLEARED");
  console.log("Version in DB after deletion:", deletedVersion ? "STILL EXISTS" : "CLEARED");

  if (deletedDoc || deletedVersion) {
    throw new Error("Deletion failed: records remain in database");
  }

  console.log("\n✓ ALL PHASE 2 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  process.exit(0);
}

runPhase2Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
