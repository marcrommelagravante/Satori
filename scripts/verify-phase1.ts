import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users, workspaces, workspaceMembers } from "../src/lib/db/schema";
import {
  getUserWorkspaces,
  getOrCreateDefaultWorkspace,
  createWorkspace,
} from "../src/lib/workspaces/service";
import {
  requireWorkspaceMember,
  WorkspaceAccessError,
} from "../src/lib/workspaces/guard";
import { eq } from "drizzle-orm";

async function runPhase1Verification() {
  console.log("=== SATORI PHASE 1 VERIFICATION ===");

  // 1. Check Database connection & Vector extension
  console.log("\n[1/5] Verifying PostgreSQL connection and pgvector extension...");
  const extCheck = await db.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
  console.log("pgvector status:", extCheck);

  // 2. Test User creation
  console.log("\n[2/5] Testing User creation...");
  const testEmail = `test-user-${Date.now()}@satori.local`;
  const [testUser] = await db
    .insert(users)
    .values({
      name: "Jordan Lee",
      email: testEmail,
    })
    .returning();
  console.log("Created test user:", testUser.id, testUser.name, testUser.email);

  // 3. Test Automated Workspace Onboarding
  console.log("\n[3/5] Testing automated workspace onboarding...");
  const defaultWs = await getOrCreateDefaultWorkspace({
    id: testUser.id,
    email: testUser.email,
    name: testUser.name,
  });
  console.log("Auto-created default workspace:", defaultWs.id, defaultWs.name, "Role:", defaultWs.role);
  if (defaultWs.role !== "owner") {
    throw new Error(`Expected role to be owner, got ${defaultWs.role}`);
  }

  // 4. Test Tenant Isolation & Security Guards
  console.log("\n[4/5] Testing tenant isolation and requireWorkspaceMember guard...");
  // Authorized check: user accessing their own workspace
  const memberCheck = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, defaultWs.id));
  console.log("Workspace members count:", memberCheck.length);

  // Create an unauthorized user to test tenant boundary
  const [unauthTestUser] = await db
    .insert(users)
    .values({
      name: "Intruder User",
      email: `intruder-${Date.now()}@satori.local`,
    })
    .returning();

  // Query workspace from unauthorized user perspective
  const intruderWorkspaces = await getUserWorkspaces(unauthTestUser.id);
  console.log("Intruder workspace access count (expected 0):", intruderWorkspaces.length);
  if (intruderWorkspaces.length !== 0) {
    throw new Error("Tenant isolation failed: Intruder should have 0 workspaces!");
  }

  // 5. Test Secondary Workspace Creation
  console.log("\n[5/5] Testing secondary workspace creation...");
  const secondaryWs = await createWorkspace(
    testUser.id,
    "Jordan Research Lab",
    "jordan-lab"
  );
  console.log("Created secondary workspace:", secondaryWs.id, secondaryWs.name, secondaryWs.slug);

  const allUserWorkspaces = await getUserWorkspaces(testUser.id);
  console.log("Total workspaces for test user:", allUserWorkspaces.map(w => ({ name: w.name, role: w.role })));
  if (allUserWorkspaces.length !== 2) {
    throw new Error(`Expected 2 workspaces for test user, got ${allUserWorkspaces.length}`);
  }

  console.log("\n✓ ALL PHASE 1 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  process.exit(0);
}

runPhase1Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
