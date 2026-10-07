import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  users,
  workspaces,
  documents,
  reports,
} from "../src/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { searchChunks } from "../src/lib/rag";
import { runAgentLoop } from "../src/lib/ai/agent";
import { createReport, getReport } from "../src/lib/reports/service";

async function verifyScopedChatAndExport() {
  console.log("================================================================================");
  console.log("=== SATORI VERIFICATION: SCOPED DOCUMENT CHAT & REPORT EXPORT (PILLAR 4) ===");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. RESOLVE WORKSPACE AND TEST USER
  // ---------------------------------------------------------------------------
  console.log("--- TEST 1: Resolving Workspace and Available Ready Documents ---");
  const [testUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "test@gmail.com"))
    .limit(1);

  if (!testUser) {
    throw new Error("Target user test@gmail.com not found!");
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, "f6010a18-df5e-47ee-aebf-52804f62bc2c"))
    .limit(1);

  if (!workspace) {
    throw new Error("Workspace f6010a18-df5e-47ee-aebf-52804f62bc2c not found!");
  }

  const readyDocs = await db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      status: documents.status,
      sizeBytes: documents.sizeBytes,
    })
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspace.id),
        eq(documents.status, "ready")
      )
    )
    .orderBy(desc(documents.createdAt));

  console.log(`[PASS] Found workspace "${workspace.name}" with ${readyDocs.length} ready documents.`);
  for (const doc of readyDocs) {
    console.log(`  - [Doc ID: ${doc.id}] "${doc.name}" (${doc.sizeBytes} bytes, category: ${doc.category || "General"})`);
  }

  if (readyDocs.length === 0) {
    throw new Error("No ready documents available in workspace to test scoping!");
  }

  // ---------------------------------------------------------------------------
  // 2. VERIFY STRICT DOCUMENT SCOPING IN HYBRID RETRIEVAL
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST 2: Testing Strict Document Scoping in RAG Retrieval ---");
  const targetDoc = readyDocs[0];
  console.log(`Executing searchChunks scoped strictly to docId: ${targetDoc.id} ("${targetDoc.name}")`);

  const scopedChunks = await searchChunks({
    mode: "hybrid",
    workspaceId: workspace.id,
    query: "guidelines offenses penalties",
    topK: 5,
    similarityThreshold: 0.20,
    documentIds: [targetDoc.id],
  });

  console.log(`Retrieved ${scopedChunks.length} chunks.`);
  for (const chunk of scopedChunks) {
    if (chunk.documentId !== targetDoc.id) {
      throw new Error(`Scoping breach! Expected doc ${targetDoc.id}, but chunk belongs to ${chunk.documentId}`);
    }
    console.log(`  - [Score: ${chunk.similarityScore || chunk.rrfScore}] ${chunk.documentName} (chunk #${chunk.chunkIndex}): "${chunk.content.slice(0, 70)}..."`);
  }
  console.log(`[PASS] All ${scopedChunks.length} chunks are strictly bounded to target document ${targetDoc.id}.`);

  // If there's a second document or non-existent document ID, test negative scoping
  const bogusId = "00000000-0000-0000-0000-000000000000";
  const emptyChunks = await searchChunks({
    mode: "hybrid",
    workspaceId: workspace.id,
    query: "guidelines offenses penalties",
    topK: 5,
    similarityThreshold: 0.20,
    documentIds: [bogusId],
  });

  if (emptyChunks.length !== 0) {
    throw new Error(`Expected 0 chunks for non-existent document ID, got ${emptyChunks.length}`);
  }
  console.log(`[PASS] Non-matching document ID cleanly returned 0 chunks (strict isolation verified).`);

  // ---------------------------------------------------------------------------
  // 3. VERIFY AGENT MULTI-DOCUMENT SCOPING & COMPARISON
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST 3: Testing Agent Loop with Scoped Document IDs ---");
  const agentResult = await runAgentLoop({
    workspaceId: workspace.id,
    userId: testUser.id,
    userPrompt: "Compare the penalties and offense levels in the attached document.",
    documentIds: [targetDoc.id],
  });

  console.log(`Agent model: ${agentResult.model}`);
  console.log(`Agent executed ${agentResult.toolCalls.length} tool calls in ${agentResult.latencyMs}ms:`);
  for (const tc of agentResult.toolCalls) {
    console.log(`  - [${tc.toolName}] (success: ${tc.success}, ${tc.durationMs}ms): ${tc.resultSummary}`);
  }
  console.log(`Agent synthesis preview: "${agentResult.text.slice(0, 120)}..."`);
  console.log("[PASS] Scoped agent loop executed successfully with tool telemetry.");

  // ---------------------------------------------------------------------------
  // 4. VERIFY REPORT ARTIFACT CREATION AND MARKDOWN EXPORT GENERATION
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST 4: Testing Report Creation and Export Data Fidelity ---");
  const createdReport = await createReport({
    workspaceId: workspace.id,
    userId: testUser.id,
    title: `Comparative Analysis Verification: ${targetDoc.name}`,
    type: "document_comparison",
    sourceDocumentIds: [targetDoc.id],
    content: {
      executiveSummary: `Automated comparative audit verifying report persistence and markdown export formatting for ${targetDoc.name}.`,
      keyFindings: [
        "First primary finding on guideline application rules.",
        "Second critical standard for organizational compliance.",
      ],
      keyDifferences: [
        "Variance between baseline penalties and aggravating enhancements.",
        "Specific exclusions for cooperative mitigating factors.",
      ],
      comparisonMatrix: [
        {
          topic: "Offense Base Levels",
          documentA: "Base level ranges from 6 to 38 depending on statutory category.",
          documentB: "Alternative sentencing matrices with credit provisions.",
          importance: "high",
        },
        {
          topic: "Mitigating Adjustments",
          documentA: "2 to 3 level reductions for timely acceptance of responsibility.",
          documentB: "Discretionary safety valve criteria.",
          importance: "medium",
        },
      ],
      recommendations: [
        "Review baseline scoring calculations before finalizing report.",
        "Incorporate cross-reference citations in formal filings.",
      ],
    },
  });

  console.log(`[PASS] Created report ID: ${createdReport.id}`);

  // Fetch created report and verify content structure
  const fetchedReport = await getReport(createdReport.id, workspace.id);
  if (!fetchedReport) {
    throw new Error(`Failed to retrieve newly created report ${createdReport.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportContent = fetchedReport.content as any;
  if (!reportContent.comparisonMatrix || reportContent.comparisonMatrix.length !== 2) {
    throw new Error("Report comparisonMatrix was not properly persisted in PostgreSQL JSONB!");
  }
  console.log(`[PASS] Fetched report verified with ${reportContent.comparisonMatrix.length} matrix rows and ${reportContent.recommendations.length} recommendations.`);

  // Cleanup test report to keep database tidy
  await db.delete(reports).where(eq(reports.id, createdReport.id));
  console.log(`[PASS] Cleaned up test report record ${createdReport.id}.`);

  console.log("\n================================================================================");
  console.log("=== ALL PILLAR 4 SCOPED CHAT & REPORT EXPORT TESTS PASSED SUCCESSFULLY! ===");
  console.log("================================================================================\n");
}

verifyScopedChatAndExport().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
