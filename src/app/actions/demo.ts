"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  TECH_ORG_DOCUMENTS,
  TECH_ORG_BENCHMARK_CASES,
} from "@/lib/demo/tech-org-data";
import {
  uploadAndRegisterDocument,
  processDocument,
} from "@/lib/ingestion/processor";
import { createEvalCase } from "@/lib/evaluations/service";
import { db } from "@/lib/db";
import { documents, evalCases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logAuditEvent } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";

export async function seedTechOrgDemoAction(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceMember(workspaceId, "member");

  try {
    let docsCreated = 0;

    // 1. Ingest Tech Org Documents
    for (const docDef of TECH_ORG_DOCUMENTS) {
      // Check if document already exists
      const [existing] = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.workspaceId, workspaceId),
            eq(documents.name, docDef.filename)
          )
        )
        .limit(1);

      if (!existing) {
        const buffer = Buffer.from(docDef.content, "utf-8");
        const doc = await uploadAndRegisterDocument({
          workspaceId,
          filename: docDef.filename,
          mimeType: "text/plain",
          buffer,
          category: docDef.category,
        });

        // Immediately process, chunk, and embed
        await processDocument(doc.id);
        docsCreated++;
      }
    }

    // 2. Seed Golden Benchmark Cases
    let benchmarksCreated = 0;
    for (const testCase of TECH_ORG_BENCHMARK_CASES) {
      const [existing] = await db
        .select()
        .from(evalCases)
        .where(
          and(
            eq(evalCases.workspaceId, workspaceId),
            eq(evalCases.question, testCase.question)
          )
        )
        .limit(1);

      if (!existing) {
        await createEvalCase(workspaceId, user.id, {
          question: testCase.question,
          expectedAnswer: testCase.expectedAnswer,
          expectedChunkIds: [],
          category: testCase.category,
          difficulty: testCase.difficulty,
        });
        benchmarksCreated++;
      }
    }

    // 3. Record Audit Event
    await logAuditEvent({
      workspaceId,
      userId: user.id,
      action: "demo.seed_tech_org",
      resourceType: "workspace",
      resourceId: workspaceId,
      metadata: {
        documentsSeeded: docsCreated,
        benchmarksSeeded: benchmarksCreated,
      },
    });

    revalidatePath("/documents");
    revalidatePath("/knowledge");
    revalidatePath("/evaluations");
    revalidatePath("/dashboard");

    return {
      success: true,
      documentsCreated: docsCreated,
      benchmarksCreated,
    };
  } catch (err) {
    console.error("[DEMO SEED ERROR]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to seed demo dataset.",
    };
  }
}
