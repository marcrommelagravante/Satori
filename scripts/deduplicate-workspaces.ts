import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db";
import {
  users,
  workspaces,
  workspaceMembers,
  documents,
  conversations,
  reports,
} from "../src/lib/db/schema";
import { eq, inArray, count } from "drizzle-orm";
import { getUserWorkspaces, deleteWorkspace } from "../src/lib/workspaces/service";

async function deduplicateWorkspaces() {
  console.log("==========================================================");
  console.log("=== SATORI: SAFE WORKSPACE DEDUPLICATION MIGRATION =======");
  console.log("==========================================================\n");

  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} total users in database.\n`);

  let totalRemoved = 0;
  let totalPreserved = 0;

  for (const user of allUsers) {
    const userWorkspaces = await getUserWorkspaces(user.id);
    if (userWorkspaces.length <= 1) {
      if (userWorkspaces.length === 1) totalPreserved++;
      continue;
    }

    console.log(`--- Checking User: ${user.name || "Unnamed"} (${user.email}) ---`);
    console.log(`  Current workspaces count: ${userWorkspaces.length}`);

    // Inspect each workspace for data
    const workspaceDetails = [];
    for (const ws of userWorkspaces) {
      const [docRes] = await db
        .select({ value: count() })
        .from(documents)
        .where(eq(documents.workspaceId, ws.id));
      const [chatRes] = await db
        .select({ value: count() })
        .from(conversations)
        .where(eq(conversations.workspaceId, ws.id));
      const [repRes] = await db
        .select({ value: count() })
        .from(reports)
        .where(eq(reports.workspaceId, ws.id));

      const docCount = docRes?.value ?? 0;
      const chatCount = chatRes?.value ?? 0;
      const repCount = repRes?.value ?? 0;
      const hasData = docCount > 0 || chatCount > 0 || repCount > 0;

      const defaultPattern = user.name
        ? new RegExp(`^${user.name}'s Workspace$`, "i")
        : /^My Workspace$/i;
      const isDefaultName = defaultPattern.test(ws.name.trim()) || ws.name.endsWith("'s Workspace");

      workspaceDetails.push({
        ...ws,
        docCount,
        chatCount,
        repCount,
        hasData,
        isDefaultName,
      });
    }

    // Partition: Custom workspaces (like USSG) MUST ALWAYS be preserved
    const customWorkspaces = workspaceDetails.filter((w) => !w.isDefaultName);
    const defaultWorkspaces = workspaceDetails.filter((w) => w.isDefaultName);

    // Among default workspaces:
    // 1. Sort by: hasData desc, then createdAt asc
    defaultWorkspaces.sort((a, b) => {
      if (a.hasData && !b.hasData) return -1;
      if (!a.hasData && b.hasData) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // The first one is our primary default workspace to keep
    const primaryDefault = defaultWorkspaces[0];
    const duplicatesToRemove = defaultWorkspaces.slice(1).filter((w) => !w.hasData);
    const defaultsWithDataToKeep = defaultWorkspaces.slice(1).filter((w) => w.hasData);

    const toKeep = [
      ...customWorkspaces,
      ...(primaryDefault ? [primaryDefault] : []),
      ...defaultsWithDataToKeep,
    ];

    console.log("  Workspaces preserved:");
    for (const k of toKeep) {
      const reason = !k.isDefaultName
        ? "Custom User-Created Workspace"
        : k.hasData
        ? `Contains data (${k.docCount} docs, ${k.chatCount} chats)`
        : "Primary default workspace";
      console.log(`    ✓ [KEEP] "${k.name}" (${k.slug}) — ${reason}`);
      totalPreserved++;
    }

    if (duplicatesToRemove.length > 0) {
      console.log("  Redundant duplicate workspaces to prune:");
      for (const d of duplicatesToRemove) {
        console.log(`    ✗ [DELETE] "${d.name}" (${d.id}) — Empty duplicate`);
        // Safely delete the workspace record (cascades to members)
        await db.delete(workspaces).where(eq(workspaces.id, d.id));
        totalRemoved++;
      }
    } else {
      console.log("  No empty duplicate workspaces to remove.");
    }
    console.log("");
  }

  console.log("==========================================================");
  console.log(`DEDUPLICATION COMPLETE: ${totalRemoved} empty duplicates removed, ${totalPreserved} active workspaces preserved.`);
  console.log("==========================================================\n");
}

deduplicateWorkspaces()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Deduplication error:", err);
    process.exit(1);
  });
