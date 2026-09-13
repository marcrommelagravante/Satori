import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  workspaces,
  workspaceMembers,
  users,
  documents,
  conversations,
  messages,
  citations,
  aiRuns,
} from "../src/lib/db/schema";
import {
  uploadAndRegisterDocument,
  processDocument,
  deleteDocumentAndStorage,
} from "../src/lib/ingestion/processor";
import {
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from "../src/lib/chat";
import { eq, and } from "drizzle-orm";

async function runPhase4Verification() {
  console.log("=== SATORI PHASE 4: AI CHAT & CITATIONS VERIFICATION ===");

  // 1. Get workspaces & user
  const existingWorkspaces = await db.select().from(workspaces).limit(2);
  if (existingWorkspaces.length === 0) {
    throw new Error("No workspaces found. Please set up a workspace first.");
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

  // Get user associated with Workspace A
  const member = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceA.id))
    .limit(1);

  let testUserId: string;
  if (member.length > 0) {
    testUserId = member[0].userId;
  } else {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      throw new Error("No users found in database.");
    }
    testUserId = existingUsers[0].id;
  }

  console.log(`[1/8] Workspace A: "${workspaceA.name}" (${workspaceA.id})`);
  console.log(`[1/8] Workspace B: "${workspaceB.name}" (${workspaceB.id})`);
  console.log(`[1/8] Test User ID: ${testUserId}`);

  // 2. Ensure test document is present in Workspace A
  console.log("\n[2/8] Ensuring indexed test document in Workspace A...");
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
    filename: `handbook_chat_test_${Date.now()}.txt`,
    mimeType: "text/plain",
    buffer,
  });

  await processDocument(doc.id);
  const [processed] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, doc.id));

  if (!processed || processed.status !== "ready") {
    throw new Error(`Document processing failed with status: ${processed?.status}`);
  }
  console.log(`✓ Test document processed and indexed with embeddings (ID: ${doc.id})`);

  let testConversationId: string | null = null;
  let testConversationBId: string | null = null;

  try {
    // 3. Create conversation in Workspace A
    console.log("\n[3/8] Creating new conversation in Workspace A...");
    const conv = await createConversation(workspaceA.id, testUserId, "New Conversation");
    testConversationId = conv.id;
    console.log(`✓ Conversation created: "${conv.title}" (ID: ${conv.id})`);

    if (conv.title !== "New Conversation") {
      throw new Error(`Expected title 'New Conversation', got '${conv.title}'`);
    }

    // 4. Send first user message (grounded query)
    const question1 = "What is the equipment reimbursement allowance for remote employees?";
    console.log(`\n[4/8] Sending grounded user query: "${question1}"...`);

    const result1 = await sendMessage({
      conversationId: conv.id,
      workspaceId: workspaceA.id,
      userId: testUserId,
      content: question1,
    });

    console.log("\n--- Assistant Grounded Response ---");
    console.log(result1.assistantMessage.content);
    console.log("-----------------------------------");
    console.log(`Model: ${result1.assistantMessage.model}`);
    console.log(`Latency: ${result1.latencyMs}ms`);

    // Verify messages persisted
    if (!result1.userMessage?.id || result1.userMessage.role !== "user") {
      throw new Error("User message was not persisted properly");
    }
    if (!result1.assistantMessage?.id || result1.assistantMessage.role !== "assistant") {
      throw new Error("Assistant message was not persisted properly");
    }
    console.log("✓ User and assistant messages successfully persisted in PostgreSQL");

    // 5. Verify Citations
    console.log("\n[5/8] Verifying Citations persistence & source chunk link...");
    console.log(`Total citations created: ${result1.citations.length}`);

    if (result1.citations.length === 0) {
      throw new Error("Expected at least 1 citation for grounded document question");
    }

    const firstCitation = result1.citations[0];
    console.log(` - Citation 1: Document "${firstCitation.documentName}", Rank #${firstCitation.rank}, Score: ${Math.round((firstCitation.relevanceScore || 0) * 100)}%`);
    console.log(` - Chunk ID: ${firstCitation.chunkId}`);
    console.log(` - Content Snippet: ${firstCitation.contentSnippet?.slice(0, 80)}...`);

    // Verify citation in DB table
    const dbCitations = await db
      .select()
      .from(citations)
      .where(eq(citations.messageId, result1.assistantMessage.id));

    if (dbCitations.length === 0) {
      throw new Error("No citations found in `citations` DB table");
    }
    console.log(`✓ Verified ${dbCitations.length} citation record(s) persisted in database table`);

    // 6. Verify AI Run Observability
    console.log("\n[6/8] Verifying AI Run observability logging...");
    const runLogs = await db
      .select()
      .from(aiRuns)
      .where(eq(aiRuns.conversationId, conv.id));

    if (runLogs.length === 0) {
      throw new Error("No AI run record found in `ai_runs` table");
    }

    const latestRun = runLogs[runLogs.length - 1];
    console.log(` - AI Run ID: ${latestRun.id}`);
    console.log(` - Model: ${latestRun.model}`);
    console.log(` - Operation: ${latestRun.operation}`);
    console.log(` - Latency: ${latestRun.latencyMs}ms`);
    console.log(` - Input Tokens: ${latestRun.inputTokens}, Output Tokens: ${latestRun.outputTokens}`);
    console.log(` - Status: ${latestRun.status}`);

    if (latestRun.status !== "success") {
      throw new Error(`AI Run status expected 'success', got '${latestRun.status}'`);
    }
    console.log("✓ AI run observability metrics successfully verified");

    // 7. Verify Auto-titling & Multi-turn
    console.log("\n[7/8] Verifying auto-conversation title & multi-turn history...");
    const updatedConv = await getConversation(conv.id, testUserId);
    console.log(` - Updated Conversation Title: "${updatedConv?.title}"`);
    if (!updatedConv || updatedConv.title === "New Conversation") {
      throw new Error("Conversation title was not auto-updated from question");
    }
    console.log("✓ Auto-title successfully applied to conversation");

    // Send second message in thread (multi-turn conversation test)
    const question2 = "How many days do employees have to submit receipts?";
    console.log(`\nSending follow-up query in same thread: "${question2}"...`);
    const result2 = await sendMessage({
      conversationId: conv.id,
      workspaceId: workspaceA.id,
      userId: testUserId,
      content: question2,
    });

    console.log("Assistant Turn 2 Response:", result2.assistantMessage.content);
    console.log(`Turn 2 citations count: ${result2.citations.length}`);
    if (result2.citations.length === 0) {
      throw new Error("Expected citations on follow-up turn");
    }
    console.log("✓ Multi-turn conversation flow verified");

    // Verify messages list includes all turns with citations
    const thread = await getMessages(conv.id, testUserId);
    console.log(`Total messages in thread: ${thread.length} (expected 4: 2 user + 2 assistant)`);
    if (thread.length !== 4) {
      throw new Error(`Expected 4 messages in thread, found ${thread.length}`);
    }
    console.log("✓ Full message thread retrieval with joined citations verified");

    // 8. Verify Multi-Tenant Boundary Isolation
    console.log("\n[8/8] Verifying multi-tenant boundary isolation...");
    const convB = await createConversation(workspaceB.id, testUserId, "Workspace B Isolation Test");
    testConversationBId = convB.id;

    const resultB = await sendMessage({
      conversationId: convB.id,
      workspaceId: workspaceB.id,
      userId: testUserId,
      content: "What is the equipment reimbursement allowance for remote employees?",
    });

    console.log("Workspace B Assistant Response:", resultB.assistantMessage.content);
    console.log(`Workspace B Citations count: ${resultB.citations.length}`);

    // Must NOT leak Workspace A citations to Workspace B
    if (resultB.citations.length > 0) {
      throw new Error(
        `Security violation! Workspace B leaked citations from Workspace A documents: ${JSON.stringify(
          resultB.citations
        )}`
      );
    }
    console.log("✓ Multi-tenant boundary confirmed: Zero cross-workspace citations leaked");

  } finally {
    // Cleanup
    console.log("\n[Cleanup] Cleaning up test artifacts...");
    if (testConversationId) {
      await deleteConversation(testConversationId, testUserId);
      console.log("✓ Cleaned up Workspace A test conversation");
    }
    if (testConversationBId) {
      await deleteConversation(testConversationBId, testUserId);
      console.log("✓ Cleaned up Workspace B test conversation");
    }
    await deleteDocumentAndStorage(doc.id);
    console.log("✓ Cleaned up test document and vector records");
  }

  console.log("\n========================================================");
  console.log("✓ ALL PHASE 4 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  console.log("========================================================");
}

runPhase4Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ PHASE 4 VERIFICATION FAILED:", err);
    process.exit(1);
  });
