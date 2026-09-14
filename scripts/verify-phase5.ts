import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  workspaces,
  workspaceMembers,
  users,
  documents,
  documentVersions,
  documentChunks,
} from "../src/lib/db/schema";
import {
  uploadAndRegisterDocument,
  processDocument,
  deleteDocumentAndStorage,
} from "../src/lib/ingestion/processor";
import {
  searchChunks,
  searchSimilarChunks,
  keywordSearchChunks,
  hybridSearch,
} from "../src/lib/rag";
import { sendMessage, createConversation, deleteConversation } from "../src/lib/chat";
import { eq, sql } from "drizzle-orm";

async function runPhase5Verification() {
  console.log("==========================================================");
  console.log("=== SATORI PHASE 5: HYBRID RETRIEVAL VERIFICATION =======");
  console.log("==========================================================\n");

  // 1. Setup Test Workspace & User
  const existingWorkspaces = await db.select().from(workspaces).limit(2);
  if (existingWorkspaces.length === 0) {
    throw new Error("No workspaces found. Please ensure database is initialized.");
  }

  const workspaceA = existingWorkspaces[0];
  let workspaceB = existingWorkspaces[1];

  if (!workspaceB) {
    console.log("[Setup] Creating isolated Workspace B for multi-tenant boundary checks...");
    const [newWs] = await db
      .insert(workspaces)
      .values({
        name: `Tenant Isolation B ${Date.now()}`,
        slug: `tenant-b-${Date.now()}`,
      })
      .returning();
    workspaceB = newWs;
  }

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceA.id))
    .limit(1);

  if (member.length === 0) {
    throw new Error("No member found in workspace A.");
  }
  const userId = member[0].userId;

  console.log(`[Workspace A] ID: ${workspaceA.id} ("${workspaceA.name}")`);
  console.log(`[Workspace B] ID: ${workspaceB.id} ("${workspaceB.name}")`);
  console.log(`[User ID] ${userId}\n`);

  let testDocAId: string | null = null;
  let testDocBId: string | null = null;
  let testConvId: string | null = null;

  try {
    // 2. Ingest Test Document into Workspace A
    const sampleTextA = `
# Satori Organization Bylaws & Security Protocol

Section 1: General Purpose
The organization operates under standard transparent governance rules.
All full-time members possess complete voting rights at general assemblies.

Section 2: Security Protocol ACRO-9021
Article VII Section 3.2 specifies compliance code ACRO-9021 for cryptographic validation.
All workspace documents must adhere to HIPAA compliance rule 164.312 regarding technical safeguards.
Data encryption at rest requires AES-256 with rotating keys every 90 days.
The chief security coordinator is designated as Officer Marcus Vance.

Section 3: Financial Reimbursement Policy
Employees may request up to $750 per fiscal year for ergonomic workspace equipment.
All expense receipts must be submitted within 30 days of purchase.
    `.trim();

    console.log("[Test 1] Uploading and processing test document in Workspace A...");
    const docA = await uploadAndRegisterDocument({
      workspaceId: workspaceA.id,
      filename: "phase5-test-protocol.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(sampleTextA, "utf-8"),
      category: "Security & Bylaws",
    });
    testDocAId = docA.id;

    await processDocument(testDocAId);
    console.log(`✓ Document A processed successfully (ID: ${testDocAId})\n`);

    // Verify search_vector was populated
    const chunksA = await db
      .select({
        id: documentChunks.id,
        hasSearchVector: sql<boolean>`${documentChunks.searchVector} IS NOT NULL`,
        hasEmbedding: sql<boolean>`${documentChunks.embedding} IS NOT NULL`,
      })
      .from(documentChunks)
      .innerJoin(documentVersions, eq(documentChunks.documentVersionId, documentVersions.id))
      .where(eq(documentVersions.documentId, testDocAId));

    console.log(`✓ Chunks created for Document A: ${chunksA.length}`);
    const allHaveVector = chunksA.every((c) => c.hasEmbedding);
    const allHaveFts = chunksA.every((c) => c.hasSearchVector);
    console.log(`✓ All chunks have vector embeddings: ${allHaveVector}`);
    console.log(`✓ All chunks have FTS search_vector: ${allHaveFts}`);

    if (!allHaveVector || !allHaveFts) {
      throw new Error("Failed assertion: Chunks missing vector embedding or FTS search_vector!");
    }

    // 3. Test Pure Keyword Search (FTS)
    console.log("\n[Test 2] Testing Keyword Search (PostgreSQL FTS)...");
    const keywordResults = await keywordSearchChunks({
      workspaceId: workspaceA.id,
      query: "ACRO-9021",
      topK: 3,
    });

    console.log(`✓ Keyword query "ACRO-9021" returned ${keywordResults.length} chunk(s)`);
    if (keywordResults.length === 0) {
      throw new Error("Keyword search failed to find exact acronym ACRO-9021!");
    }

    const topKeyword = keywordResults[0];
    console.log(`  - Document: ${topKeyword.documentName}`);
    console.log(`  - Method: ${topKeyword.retrievalMethod}`);
    console.log(`  - Keyword Score (ts_rank): ${topKeyword.keywordScore}`);
    console.log(`  - Snippet: "${topKeyword.content.slice(0, 100).replace(/\n/g, " ")}..."`);

    if (!topKeyword.content.includes("ACRO-9021")) {
      throw new Error("Keyword search result did not contain target term ACRO-9021!");
    }

    // 4. Test Semantic Search (pgvector)
    console.log("\n[Test 3] Testing Semantic Search (pgvector cosine similarity)...");
    const semanticResults = await searchSimilarChunks({
      workspaceId: workspaceA.id,
      query: "How are patient health records safeguarded technically?",
      topK: 3,
      similarityThreshold: 0.35,
    });

    console.log(`✓ Semantic query returned ${semanticResults.length} chunk(s)`);
    if (semanticResults.length === 0) {
      throw new Error("Semantic search returned zero chunks!");
    }
    const topSemantic = semanticResults[0];
    console.log(`  - Document: ${topSemantic.documentName}`);
    console.log(`  - Method: ${topSemantic.retrievalMethod}`);
    console.log(`  - Similarity Score: ${(topSemantic.similarityScore * 100).toFixed(1)}%`);
    console.log(`  - Distance: ${topSemantic.distance.toFixed(4)}`);

    // 5. Test Hybrid Search (RRF Fusion)
    console.log("\n[Test 4] Testing Hybrid Search with Reciprocal Rank Fusion (RRF)...");
    const hybridResults = await hybridSearch({
      workspaceId: workspaceA.id,
      query: "HIPAA compliance ACRO-9021 encryption safeguards",
      topK: 5,
    });

    console.log(`✓ Hybrid query returned ${hybridResults.length} chunk(s)`);
    if (hybridResults.length === 0) {
      throw new Error("Hybrid search returned zero chunks!");
    }

    hybridResults.forEach((r, idx) => {
      console.log(`  [Rank ${idx + 1}] RRF Score: ${r.rrfScore?.toFixed(6)} | Vector Sim: ${(r.similarityScore * 100).toFixed(1)}% | FTS Score: ${r.keywordScore ?? 0}`);
      console.log(`           Snippet: "${r.content.slice(0, 90).replace(/\n/g, " ")}..."`);
    });

    const topHybrid = hybridResults[0];
    if (!topHybrid.rrfScore || topHybrid.rrfScore <= 0) {
      throw new Error("Top hybrid result is missing valid RRF score!");
    }
    console.log("✓ RRF fusion successfully ranked candidates combining vector & keyword signals.");

    // 6. Test Unified `searchChunks` API with different modes
    console.log("\n[Test 5] Testing unified searchChunks API modes...");
    const [hRes, sRes, kRes] = await Promise.all([
      searchChunks({ workspaceId: workspaceA.id, query: "ergonomic equipment", mode: "hybrid" }),
      searchChunks({ workspaceId: workspaceA.id, query: "ergonomic equipment", mode: "semantic" }),
      searchChunks({ workspaceId: workspaceA.id, query: "ergonomic equipment", mode: "keyword" }),
    ]);

    console.log(`✓ searchChunks('hybrid'): ${hRes.length} results (method: ${hRes[0]?.retrievalMethod})`);
    console.log(`✓ searchChunks('semantic'): ${sRes.length} results (method: ${sRes[0]?.retrievalMethod})`);
    console.log(`✓ searchChunks('keyword'): ${kRes.length} results (method: ${kRes[0]?.retrievalMethod})`);

    if (hRes[0]?.retrievalMethod !== "hybrid" || sRes[0]?.retrievalMethod !== "semantic" || kRes[0]?.retrievalMethod !== "keyword") {
      throw new Error("searchChunks returned incorrect retrievalMethod tag!");
    }

    // 7. Multi-Tenant Workspace Boundary Isolation
    console.log("\n[Test 6] Testing strict Multi-Tenant Isolation...");
    const secretTermB = `TOPSECRET_KEYWORD_B_${Date.now()}`;
    const sampleTextB = `
This is confidential workspace B content.
The ultra secret access key is: ${secretTermB}.
Unauthorized access from other workspaces is strictly forbidden.
    `.trim();

    const docB = await uploadAndRegisterDocument({
      workspaceId: workspaceB.id,
      filename: "workspace-b-secret.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(sampleTextB, "utf-8"),
      category: "Confidential B",
    });
    testDocBId = docB.id;
    await processDocument(testDocBId);

    // Query Workspace A for the secret in Workspace B
    const leakCheckKeyword = await searchChunks({
      workspaceId: workspaceA.id,
      query: secretTermB,
      mode: "keyword",
    });
    const leakCheckHybrid = await searchChunks({
      workspaceId: workspaceA.id,
      query: secretTermB,
      mode: "hybrid",
    });
    const leakCheckSemantic = await searchChunks({
      workspaceId: workspaceA.id,
      query: secretTermB,
      mode: "semantic",
    });

    // Verify that the secret IS found when querying Workspace B
    const foundInB = await searchChunks({
      workspaceId: workspaceB.id,
      query: secretTermB,
      mode: "keyword",
    });
    if (foundInB.length === 0 || !foundInB[0].content.includes(secretTermB)) {
      throw new Error("Failed to find secret term in Workspace B where it belongs!");
    }
    console.log(`✓ Secret correctly found in Workspace B (${foundInB[0].documentName})`);

    // Verify that querying Workspace A never returns Document B or the secret
    const leakedDocInA = [
      ...leakCheckKeyword,
      ...leakCheckHybrid,
      ...leakCheckSemantic,
    ].find((c) => c.documentId === docB.id || c.content.includes(secretTermB));

    if (leakedDocInA) {
      throw new Error(
        `CRITICAL SECURITY VIOLATION: Document from Workspace B (${leakedDocInA.documentName}) was returned when querying Workspace A!`
      );
    }
    console.log("✓ Multi-tenant isolation verified: ZERO cross-tenant leakage across all modes.");

    // 8. Test End-to-End Chat Integration with Hybrid Retrieval
    console.log("\n[Test 7] Testing End-to-End Chat with Hybrid Retrieval & Citations...");
    const conv = await createConversation(workspaceA.id, userId, "Phase 5 Verification Chat");
    testConvId = conv.id;

    const chatResult = await sendMessage({
      conversationId: testConvId,
      workspaceId: workspaceA.id,
      userId,
      content: "What is the compliance code specified in the security protocol, and what is the reimbursement limit?",
    });

    console.log(`✓ Chat response generated (${chatResult.latencyMs}ms, model: ${chatResult.assistantMessage.model})`);
    console.log(`✓ Answer snippet: "${chatResult.assistantMessage.content.slice(0, 160).replace(/\n/g, " ")}..."`);
    console.log(`✓ Citations linked: ${chatResult.citations.length}`);

    chatResult.citations.forEach((cit, idx) => {
      console.log(`  Citation [${idx + 1}] Source: ${cit.documentName} | Score: ${cit.relevanceScore ?? "N/A"}`);
    });

    if (chatResult.citations.length === 0) {
      console.warn("Notice: Chat answered but did not produce explicit citations (acceptable with fallback generator).");
    }

    console.log("\n==========================================================");
    console.log("=== ALL PHASE 5 VERIFICATIONS PASSED SUCCESSFULLY! =======");
    console.log("==========================================================");
  } finally {
    console.log("\n[Cleanup] Removing test resources...");
    if (testDocAId) {
      await deleteDocumentAndStorage(testDocAId);
      console.log(`✓ Cleaned up test document A (${testDocAId})`);
    }
    if (testDocBId) {
      await deleteDocumentAndStorage(testDocBId);
      console.log(`✓ Cleaned up test document B (${testDocBId})`);
    }
    if (testConvId) {
      await deleteConversation(testConvId, userId);
      console.log(`✓ Cleaned up test conversation (${testConvId})`);
    }
    console.log("✓ Cleanup complete.");
  }
}

runPhase5Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Verification failed with error:", err);
    process.exit(1);
  });
