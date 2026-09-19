import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import { documents, documentVersions, documentChunks } from "@/lib/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";
import { type InspectChunk } from "./chunk-inspector";
import { KnowledgeHubView } from "@/components/knowledge/knowledge-hub-view";

interface KnowledgePageProps {
  searchParams: Promise<{ ws?: string; q?: string }>;
}

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);
  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  if (!activeWorkspace) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No active workspace found. Please select or create a workspace.
      </div>
    );
  }

  // 1. Fetch vector and FTS statistics for the current workspace
  const [chunkStats] = await db
    .select({
      totalChunks: count(documentChunks.id),
      embeddedChunks: count(documentChunks.embedding),
      ftsChunks: count(documentChunks.searchVector),
    })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const totalChunks = Number(chunkStats?.totalChunks || 0);
  const embeddedChunks = Number(chunkStats?.embeddedChunks || 0);
  const ftsChunks = Number(chunkStats?.ftsChunks || 0);
  const unindexedCount = totalChunks - embeddedChunks;

  // 2. Count ready documents
  const [docStats] = await db
    .select({
      totalDocs: count(documents.id),
    })
    .from(documents)
    .where(
      sql`${documents.workspaceId} = ${activeWorkspace.id} AND ${documents.status} = 'ready'`
    );
  const readyDocs = Number(docStats?.totalDocs || 0);

  // 3. Fetch real workspace documents to compute live category counts
  const workspaceDocs = await db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
    })
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id));

  const categoryCounts = {
    policies: 0,
    technical: 0,
    reports: 0,
    general: 0,
  };

  for (const doc of workspaceDocs) {
    const baseName = doc.name.replace(/\.[^/.]+$/, "");
    const cat = (doc.category || "").toLowerCase();
    const name = baseName.toLowerCase();
    const textToMatch = `${cat} ${name}`;

    if (
      /\b(policy|policies|procedure|procedures|handbook|guideline|guidelines|bylaws|compliance|hr)\b/i.test(textToMatch)
    ) {
      categoryCounts.policies++;
    } else if (
      /\b(tech|technical|doc|docs|documentation|spec|specs|api|architecture|engineering|code|developer)\b/i.test(textToMatch)
    ) {
      categoryCounts.technical++;
    } else if (
      /\b(report|reports|financial|finance|analytics|analysis|metric|metrics|quarter|quarterly|q1|q2|q3|q4)\b/i.test(textToMatch)
    ) {
      categoryCounts.reports++;
    } else {
      categoryCounts.general++;
    }
  }

  // 4. Fetch recent chunks for the inspector
  const recentChunksRaw = await db
    .select({
      id: documentChunks.id,
      documentName: documents.name,
      chunkIndex: documentChunks.chunkIndex,
      content: documentChunks.content,
      pageNumber: documentChunks.pageNumber,
      section: documentChunks.section,
      tokenEstimate: documentChunks.tokenEstimate,
      hasEmbedding: sql<boolean>`${documentChunks.embedding} IS NOT NULL`,
    })
    .from(documentChunks)
    .innerJoin(
      documentVersions,
      eq(documentChunks.documentVersionId, documentVersions.id)
    )
    .innerJoin(documents, eq(documentVersions.documentId, documents.id))
    .where(eq(documents.workspaceId, activeWorkspace.id))
    .orderBy(desc(documentChunks.createdAt))
    .limit(50);

  const inspectChunks: InspectChunk[] = recentChunksRaw.map((c) => ({
    ...c,
    hasEmbedding: Boolean(c.hasEmbedding),
  }));

  return (
    <KnowledgeHubView
      workspaceId={activeWorkspace.id}
      workspaceName={activeWorkspace.name}
      totalChunks={totalChunks}
      embeddedChunks={embeddedChunks}
      ftsChunks={ftsChunks}
      unindexedCount={unindexedCount}
      readyDocs={readyDocs}
      categoryCounts={categoryCounts}
      inspectChunks={inspectChunks}
      initialQuery={params.q || ""}
    />
  );
}
