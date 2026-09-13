import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

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
  backfillWorkspaceEmbeddings,
} from "../src/lib/ingestion/processor";
import { searchSimilarChunks, buildRagContext } from "../src/lib/rag";
import { eq, and, sql } from "drizzle-orm";

async function runPhase3Verification() {
  console.log("=== SATORI PHASE 3: CUSTOM RAG VERIFICATION ===");

  // 1. Get or create Workspace A and Workspace B for multi-tenancy verification
  const existingWorkspaces = await db.select().from(workspaces).limit(2);
  if (existingWorkspaces.length === 0) {
    throw new Error("No workspaces found. Run verify-phase1 first.");
  }

  const workspaceA = existingWorkspaces[0];
  let workspaceB = existingWorkspaces[1];

  if (!workspaceB) {
    console.log("[Setup] Creating temporary Workspace B for tenant boundary verification...");
    const [newWs] = await db
      .insert(workspaces)
      .values({
        name: `Isolated Tenant B ${Date.now()}`,
        slug: `tenant-b-${Date.now()}`,
      })
      .returning();
    workspaceB = newWs;
  }

  console.log(`[1/7] Workspace A: "${workspaceA.name}" (${workspaceA.id})`);
  console.log(`[1/7] Workspace B: "${workspaceB.name}" (${workspaceB.id})`);

  // 2. Upload sample document to Workspace A
  console.log("\n[2/7] Uploading multi-section organizational handbook to Workspace A...");
  const sampleDocumentContent = `
# Global Enterprise Operations Handbook

## Section 1: Remote Work Equipment Reimbursement
Full-time remote team members are eligible for a one-time home office equipment stipend of up to $1,500.
Eligible purchases include ergonomic desks, dual monitors, noise-canceling headsets, and supportive office chairs.
Expense receipts must be submitted via the finance portal within forty-five days of purchase.

## Section 2: Code of Conduct and Anti-Harassment
Our organization maintains a strict zero-tolerance policy against discriminatory conduct, harassment, or retaliation.
All personnel must treat colleagues, clients, and partners with professional dignity and mutual respect.
Violations of conduct standards will result in disciplinary review, up to and including immediate termination of employment.

## Section 3: Intellectual Property and Security
All software, designs, data schemas, and documentation created during employment remain the sole intellectual property of the company.
Employees must use multi-factor authentication on all company accounts and encrypt any sensitive customer information at rest and in transit.

## Section 4: Annual Leave and Wellness Days
Every full-time employee receives twenty days of paid annual vacation in addition to ten statutory public holidays.
Employees also receive five dedicated personal wellness days per calendar year for rest and mental healthcare.
`;

  const buffer = Buffer.from(sampleDocumentContent, "utf-8");
  const doc = await uploadAndRegisterDocument({
    workspaceId: workspaceA.id,
    filename: `handbook_rag_test_${Date.now()}.txt`,
    mimeType: "text/plain",
    buffer,
    category: "Policy",
  });

  console.log(`Created document "${doc.name}" (ID: ${doc.id}) with status '${doc.status}'`);

  // 3. Process document and verify 768-dimensional embeddings are populated
  console.log("\n[3/7] Processing document (extract -> clean -> chunk -> embed -> persist)...");
  await processDocument(doc.id);

  const [processedDoc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id))
    .limit(1);

  if (processedDoc?.status !== "ready") {
    throw new Error(`Expected status 'ready', got '${processedDoc?.status}'`);
  }
  console.log("Document processed successfully. Status: READY");

  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, doc.id))
    .limit(1);

  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentVersionId, version.id));

  console.log(`Total chunks generated: ${chunks.length}`);
  if (chunks.length === 0) {
    throw new Error("No chunks created for the test document.");
  }

  // Validate that 100% of chunks have 768-dimensional vectors
  let allVectorsValid = true;
  for (const c of chunks) {
    if (!c.embedding || !Array.isArray(c.embedding) || c.embedding.length !== 768) {
      allVectorsValid = false;
      console.error(`Chunk #${c.chunkIndex} has invalid embedding:`, c.embedding?.length);
    }
  }

  if (!allVectorsValid) {
    throw new Error("One or more chunks have missing or invalid vector dimensions!");
  }
  console.log("✓ All chunks have verified 768-dimensional vector embeddings in pgvector.");

  // 4. Test Semantic Retrieval with Known Questions
  console.log("\n[4/7] Testing Semantic Vector Retrieval with known target queries...");

  // Query A: Remote Work Stipend
  const queryA = "What is the equipment reimbursement allowance for home office?";
  console.log(`\nQuery A: "${queryA}"`);
  const resultsA = await searchSimilarChunks({
    workspaceId: workspaceA.id,
    query: queryA,
    topK: 3,
    similarityThreshold: 0.1,
  });

  console.log(`Found ${resultsA.length} matches:`);
  resultsA.forEach((r, idx) => {
    console.log(
      ` - Rank #${idx + 1} | Score: ${(r.similarityScore * 100).toFixed(1)}% | Section: "${r.section}" | Doc: ${r.documentName}`
    );
  });

  if (resultsA.length === 0) {
    throw new Error("Query A returned zero results!");
  }

  const topMatchA = resultsA[0];
  const containsKeywordsA =
    topMatchA.content.includes("1,500") ||
    topMatchA.content.includes("Remote Work") ||
    topMatchA.content.includes("stipend");

  if (!containsKeywordsA) {
    throw new Error("Query A failed to retrieve the expected Remote Work Equipment section as top rank!");
  }
  console.log("✓ Query A accurately retrieved the Remote Work Equipment chunk at Rank #1!");

  // Query B: Disciplinary actions and conduct
  const queryB = "What happens if someone violates conduct standards or harassment rules?";
  console.log(`\nQuery B: "${queryB}"`);
  const resultsB = await searchSimilarChunks({
    workspaceId: workspaceA.id,
    query: queryB,
    topK: 3,
    similarityThreshold: 0.1,
  });

  console.log(`Found ${resultsB.length} matches:`);
  resultsB.forEach((r, idx) => {
    console.log(
      ` - Rank #${idx + 1} | Score: ${(r.similarityScore * 100).toFixed(1)}% | Section: "${r.section}" | Doc: ${r.documentName}`
    );
  });

  if (resultsB.length === 0) {
    throw new Error("Query B returned zero results!");
  }

  const topMatchB = resultsB[0];
  const containsKeywordsB =
    topMatchB.content.includes("termination") ||
    topMatchB.content.includes("Code of Conduct") ||
    topMatchB.content.includes("harassment");

  if (!containsKeywordsB) {
    throw new Error("Query B failed to retrieve the expected Code of Conduct section as top rank!");
  }
  console.log("✓ Query B accurately retrieved the Code of Conduct chunk at Rank #1!");

  // 5. Test Multi-Tenant Boundary Isolation (Cross-Workspace Security)
  console.log("\n[5/7] Testing Multi-Tenant Boundary Enforcement...");
  const crossTenantResults = await searchSimilarChunks({
    workspaceId: workspaceB.id, // Querying Workspace B
    query: "home office equipment allowance 1500 reimbursement",
    topK: 5,
    similarityThreshold: 0.0,
  });

  console.log(
    `Searching Workspace B for Workspace A's document content returned: ${crossTenantResults.length} chunks.`
  );

  if (crossTenantResults.length > 0) {
    throw new Error(
      `CRITICAL SECURITY FAILURE: Document chunks from Workspace A leaked into Workspace B search results!`
    );
  }
  console.log("✓ Multi-tenant boundary verified: Zero chunks leaked across workspace boundaries.");

  // 6. Test Context Builder and Citation Map Construction
  console.log("\n[6/7] Testing RAG Context Builder and Citation Generation...");
  const contextResult = buildRagContext(resultsA, { maxTokens: 2000 });

  console.log("Assembled Context snippet:");
  console.log(contextResult.formattedContext.slice(0, 300) + "...\n</context>");
  console.log("Included chunks count:", contextResult.includedChunks.length);
  console.log("Estimated token count:", contextResult.totalTokenEstimate);
  console.log("Citation Map Keys:", Object.keys(contextResult.citationMap));

  if (!contextResult.formattedContext.includes("<context>") || !contextResult.formattedContext.includes("<source")) {
    throw new Error("Context builder output is missing expected XML tags!");
  }

  if (Object.keys(contextResult.citationMap).length === 0) {
    throw new Error("Context builder citation map is empty!");
  }
  console.log("✓ Context builder generated structured XML context and valid citation mapping.");

  // Test token limit truncation
  const constrainedContext = buildRagContext(resultsA, { maxTokens: 10 });
  console.log(
    `Token budget test: constrained context included ${constrainedContext.includedChunks.length} chunk(s) (budget: 10 tokens).`
  );
  if (constrainedContext.includedChunks.length > 1) {
    throw new Error("Context builder failed to enforce maxTokens budget constraint!");
  }

  // 7. Test Backfill and Clean Up
  console.log("\n[7/7] Testing Embedding Backfill & Cleanup...");
  // Simulate missing embedding on chunk 0
  await db
    .update(documentChunks)
    .set({ embedding: null })
    .where(eq(documentChunks.id, chunks[0].id));

  const backfillResult = await backfillWorkspaceEmbeddings(workspaceA.id);
  console.log(`Backfill executed: ${backfillResult.backfilledCount} chunk(s) re-indexed.`);

  const [restoredChunk] = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.id, chunks[0].id));

  if (!restoredChunk.embedding || restoredChunk.embedding.length !== 768) {
    throw new Error("Backfill failed to restore 768-dimensional vector embedding!");
  }
  console.log("✓ Backfill successfully regenerated missing chunk vector.");

  // Delete test document
  await deleteDocumentAndStorage(doc.id);
  const [deletedDoc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id));

  if (deletedDoc) {
    throw new Error("Failed to delete test document records.");
  }
  console.log("✓ Cleaned up test document and vector records from database.");

  console.log("\n========================================================");
  console.log("✓ ALL PHASE 3 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  console.log("========================================================");
  process.exit(0);
}

runPhase3Verification().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
