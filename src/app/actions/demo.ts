"use server";

import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import {
  TECH_ORG_DOCUMENTS,
  TECH_ORG_BENCHMARK_CASES,
  TECH_ORG_REPORTS,
} from "@/lib/demo/tech-org-data";
import {
  uploadAndRegisterDocument,
  processDocument,
} from "@/lib/ingestion/processor";
import { createEvalCase } from "@/lib/evaluations/service";
import { db } from "@/lib/db";
import { documents, evalCases, reports } from "@/lib/db/schema";
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

    // 3. Seed Realistic Grounded Reports
    let reportsCreated = 0;
    // Map current documents in workspace by filename
    const currentDocs = await db
      .select({ id: documents.id, name: documents.name })
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId));
    const docMap = new Map<string, string>();
    for (const d of currentDocs) {
      docMap.set(d.name, d.id);
    }

    for (const repDef of TECH_ORG_REPORTS) {
      const [existing] = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.workspaceId, workspaceId),
            eq(reports.title, repDef.title)
          )
        )
        .limit(1);

      if (!existing) {
        const docIds = repDef.sourceDocNames
          .map((name) => docMap.get(name))
          .filter((id): id is string => Boolean(id));

        await db.insert(reports).values({
          workspaceId,
          createdBy: user.id,
          title: repDef.title,
          type: repDef.type,
          content: repDef.content,
          sourceDocumentIds: docIds,
          status: "completed",
        });
        reportsCreated++;
      }
    }

    // 4. Record Audit Event
    await logAuditEvent({
      workspaceId,
      userId: user.id,
      action: "demo.seed_tech_org",
      resourceType: "workspace",
      resourceId: workspaceId,
      metadata: {
        documentsSeeded: docsCreated,
        benchmarksSeeded: benchmarksCreated,
        reportsSeeded: reportsCreated,
      },
    });

    revalidatePath("/documents");
    revalidatePath("/knowledge");
    revalidatePath("/evaluations");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      documentsCreated: docsCreated,
      benchmarksCreated,
      reportsCreated,
    };
  } catch (err) {
    console.error("[DEMO SEED ERROR]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to seed demo dataset.",
    };
  }
}
