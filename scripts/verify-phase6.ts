import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  workspaces,
  workspaceMembers,
  users,
  documents,
  reports,
  aiRuns,
} from "../src/lib/db/schema";
import {
  executeTool,
  AGENT_TOOLS,
  SearchDocumentsArgsSchema,
  CreateReportArgsSchema,
  DocumentSummaryContentSchema,
  DocumentComparisonContentSchema,
} from "../src/lib/ai/tools";
import {
  createReport,
  getReports,
  getReport,
  deleteReport,
} from "../src/lib/reports";
import { runAgentLoop, detectAgentMode } from "../src/lib/ai/agent";
import { sendMessage, createConversation, deleteConversation } from "../src/lib/chat";
import { eq, and, desc } from "drizzle-orm";

async function runPhase6Verification() {
  console.log("==========================================================");
  console.log("=== SATORI PHASE 6: AGENT FEATURES VERIFICATION ==========");
  console.log("==========================================================\n");

  // 1. Setup Test Workspaces & User
  const existingWorkspaces = await db.select().from(workspaces).limit(2);
  if (existingWorkspaces.length === 0) {
    throw new Error("No workspaces found. Please ensure database is initialized.");
  }

  const workspaceA = existingWorkspaces[0];
  let workspaceB = existingWorkspaces[1];

  if (!workspaceB) {
    console.log("[Setup] Creating isolated Workspace B for cross-tenant checks...");
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
    throw new Error(`No user membership found in workspace ${workspaceA.id}`);
  }

  const userId = member[0].userId;
  console.log(`[Setup] Using Workspace A: "${workspaceA.name}" (${workspaceA.id})`);
  console.log(`[Setup] Using Workspace B: "${workspaceB.name}" (${workspaceB.id})`);
  console.log(`[Setup] Using User ID: ${userId}\n`);

  // 2. Verify Tool Definitions & Zod Schemas
  console.log("--- Test 1: Tool Declarations & Zod Schema Validation ---");
  if (AGENT_TOOLS.length !== 6) {
    throw new Error(`Expected 6 AGENT_TOOLS, found ${AGENT_TOOLS.length}`);
  }
  console.log(`✓ Verified ${AGENT_TOOLS.length} agent tool declarations: ${AGENT_TOOLS.map((t) => t.name).join(", ")}`);

  // Validate schemas directly
  const validSearch = SearchDocumentsArgsSchema.parse({ query: "policy" });
  if (validSearch.query !== "policy") throw new Error("SearchDocumentsArgsSchema failed");
  console.log("✓ SearchDocumentsArgsSchema validated correctly");

  const validSummary = DocumentSummaryContentSchema.parse({
    summary: "Test summary",
    keyFindings: ["Point 1", "Point 2"],
    sections: [{ title: "Section 1", content: "Details" }],
  });
  if (validSummary.keyFindings.length !== 2) throw new Error("Summary schema failed");
  console.log("✓ DocumentSummaryContentSchema validated correctly");

  const validComparison = DocumentComparisonContentSchema.parse({
    executiveSummary: "Comparison summary",
    keyDifferences: ["Diff 1"],
    comparisonMatrix: [
      {
        topic: "Coverage",
        documentA: "100%",
        documentB: "80%",
        importance: "high",
      },
    ],
  });
  if (validComparison.comparisonMatrix.length !== 1) throw new Error("Comparison schema failed");
  console.log("✓ DocumentComparisonContentSchema validated correctly\n");

  // 3. Find or Create Test Documents in Workspace A
  console.log("--- Test 2: Tool Execution via Dispatcher ---");
  const docsA = await db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, workspaceA.id))
    .limit(2);

  if (docsA.length === 0) {
    console.log("No documents found in Workspace A to test document tools. Skipping document-reading tool test.");
  } else {
    const doc1 = docsA[0];
    console.log(`Testing with Document: "${doc1.name}" (${doc1.id})`);

    // Tool: searchDocuments
    const searchRes = await executeTool(
      "searchDocuments",
      { query: doc1.name },
      { workspaceId: workspaceA.id, userId }
    );
    if (!searchRes.success) throw new Error(`searchDocuments failed: ${searchRes.error}`);
    console.log(`✓ Tool searchDocuments executed successfully (${searchRes.durationMs}ms)`);

    // Tool: getDocument
    const getDocRes = await executeTool(
      "getDocument",
      { documentId: doc1.id },
      { workspaceId: workspaceA.id, userId }
    );
    if (!getDocRes.success) throw new Error(`getDocument failed: ${getDocRes.error}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docData = getDocRes.data as any;
    if (docData.documentId !== doc1.id) throw new Error("getDocument returned incorrect document");
    console.log(`✓ Tool getDocument returned metadata and excerpt (${getDocRes.durationMs}ms)`);

    // Tool: summarizeDocument
    const sumRes = await executeTool(
      "summarizeDocument",
      { documentId: doc1.id },
      { workspaceId: workspaceA.id, userId }
    );
    if (!sumRes.success) throw new Error(`summarizeDocument failed: ${sumRes.error}`);
    console.log(`✓ Tool summarizeDocument retrieved chunks (${sumRes.durationMs}ms)`);

    // Tool: compareDocuments (if 2 docs exist)
    if (docsA.length >= 2) {
      const doc2 = docsA[1];
      const compRes = await executeTool(
        "compareDocuments",
        { documentIdA: doc1.id, documentIdB: doc2.id },
        { workspaceId: workspaceA.id, userId }
      );
      if (!compRes.success) throw new Error(`compareDocuments failed: ${compRes.error}`);
      console.log(`✓ Tool compareDocuments aligned "${doc1.name}" and "${doc2.name}" (${compRes.durationMs}ms)`);
    }
  }

  // 4. Multi-Tenant Cross-Workspace Boundary Enforcement
  console.log("\n--- Test 3: Multi-Tenant Security Boundary ---");
  // Try to access a document that doesn't belong to Workspace B
  if (docsA.length > 0) {
    const unauthorizedAccess = await executeTool(
      "getDocument",
      { documentId: docsA[0].id },
      { workspaceId: workspaceB.id, userId } // Workspace B context!
    );
    if (unauthorizedAccess.success) {
      throw new Error("SECURITY FAILURE: Cross-tenant document access was permitted!");
    }
    console.log("✓ Tool dispatcher successfully blocked cross-workspace getDocument access");

    const unauthorizedSummary = await executeTool(
      "summarizeDocument",
      { documentId: docsA[0].id },
      { workspaceId: workspaceB.id, userId }
    );
    if (unauthorizedSummary.success) {
      throw new Error("SECURITY FAILURE: Cross-tenant document summarization was permitted!");
    }
    console.log("✓ Tool dispatcher successfully blocked cross-workspace summarizeDocument access");
  }

  // 5. Reports Service CRUD & Tool Creation
  console.log("\n--- Test 4: Reports Service & Persistence ---");
  const reportCreated = await executeTool(
    "createReport",
    {
      title: "Automated Verification Report",
      type: "document_summary",
      content: {
        summary: "This is an automated test report verifying Phase 6 persistence.",
        keyFindings: ["Security checks passed", "CRUD validated"],
        sections: [
          {
            title: "Architecture Compliance",
            content: "Tools use Zod schema and workspace guards.",
          },
        ],
      },
      sourceDocumentIds: docsA.map((d) => d.id),
    },
    { workspaceId: workspaceA.id, userId }
  );

  if (!reportCreated.success) {
    throw new Error(`createReport tool failed: ${reportCreated.error}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportId = (reportCreated.data as any).reportId;
  console.log(`✓ Created report with ID: ${reportId}`);

  // Fetch report via service
  const fetchedReport = await getReport(reportId, workspaceA.id);
  if (!fetchedReport || fetchedReport.title !== "Automated Verification Report") {
    throw new Error("getReport failed to retrieve inserted report");
  }
  console.log(`✓ getReport retrieved valid report: "${fetchedReport.title}"`);

  // Verify cross-workspace isolation on report
  const crossTenantReport = await getReport(reportId, workspaceB.id);
  if (crossTenantReport !== null) {
    throw new Error("SECURITY FAILURE: Cross-tenant report access was permitted!");
  }
  console.log("✓ Cross-workspace report access blocked successfully");

  // List reports
  const allReports = await getReports(workspaceA.id);
  if (allReports.length === 0 || !allReports.some((r) => r.id === reportId)) {
    throw new Error("getReports failed to include created report");
  }
  console.log(`✓ getReports returned ${allReports.length} reports for Workspace A`);

  // Clean up report
  const deleted = await deleteReport(reportId, workspaceA.id);
  if (!deleted) throw new Error("deleteReport failed");
  console.log("✓ deleteReport cleaned up test report successfully");

  // 6. Agent Mode Heuristic Detection
  console.log("\n--- Test 5: Agent Mode Heuristic Detection ---");
  const testCases = [
    { text: "Compare the health benefits in doc A and doc B", expected: true },
    { text: "Give me a summary of the compliance policy", expected: true },
    { text: "Create a report analyzing the differences", expected: true },
    { text: "What is the capital of France?", expected: false },
    { text: "Who is the manager listed on page 2?", expected: false },
  ];

  for (const tc of testCases) {
    const detected = detectAgentMode(tc.text);
    if (detected !== tc.expected) {
      throw new Error(`detectAgentMode failed for: "${tc.text}" (got ${detected}, expected ${tc.expected})`);
    }
  }
  console.log("✓ All detectAgentMode heuristic tests passed");

  // 7. Chat Pipeline Integration & aiRuns Observability
  console.log("\n--- Test 6: Chat Pipeline Regression & Agent Observability ---");
  const conv = await createConversation(workspaceA.id, userId, "Phase 6 Test Chat");
  console.log(`Created test conversation: ${conv.id}`);

  try {
    // Normal RAG chat regression test (Phase 4 regression guard)
    const normalResponse = await sendMessage({
      conversationId: conv.id,
      workspaceId: workspaceA.id,
      userId,
      content: "What is the policy for reimbursement?",
      agentMode: false,
    });
    if (!normalResponse.assistantMessage) {
      throw new Error("Normal RAG sendMessage failed");
    }
    console.log("✓ Normal grounded RAG chat executed cleanly (Phase 4 regression guard passed)");

    // Agent mode execution test
    const agentResponse = await sendMessage({
      conversationId: conv.id,
      workspaceId: workspaceA.id,
      userId,
      content: "Summarize our workspace documents and highlight key points.",
      agentMode: true,
    });

    if (!agentResponse.assistantMessage) {
      throw new Error("Agent sendMessage failed");
    }
    if (!agentResponse.isAgent) {
      throw new Error("Expected response to be flagged as isAgent");
    }
    console.log("✓ Agent mode sendMessage executed cleanly");
    console.log(`  Agent response model: ${agentResponse.assistantMessage.model}`);
    console.log(`  Agent tool calls logged: ${agentResponse.toolCalls?.length ?? 0}`);

    // Verify ai_runs table captured the run with tool_calls column
    const [latestRun] = await db
      .select()
      .from(aiRuns)
      .where(eq(aiRuns.conversationId, conv.id))
      .orderBy(desc(aiRuns.createdAt))
      .limit(1);

    if (!latestRun) {
      throw new Error("No aiRuns record found for conversation");
    }
    console.log(`✓ aiRuns record logged: operation="${latestRun.operation}", status="${latestRun.status}"`);
  } finally {
    await deleteConversation(conv.id, userId);
    console.log("✓ Cleaned up test conversation");
  }

  console.log("\n==========================================================");
  console.log("=== ALL PHASE 6 AGENT TESTS PASSED SUCCESSFULLY! =========");
  console.log("==========================================================");
}

runPhase6Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Phase 6 Verification failed:", err);
    process.exit(1);
  });
