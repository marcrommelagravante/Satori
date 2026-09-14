import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import { documents, documentVersions, documentChunks } from "@/lib/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";
import { Network, Database, Cpu, HardDrive, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SemanticSearchPlayground } from "./semantic-search-playground";
import { ChunkInspector, type InspectChunk } from "./chunk-inspector";
import { BackfillButton } from "./backfill-button";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
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

  // 3. Fetch recent chunks for the inspector
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Hub</h1>
            <Badge variant="ai">Phase 5: Hybrid Search</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            pgvector semantic search, PostgreSQL full-text search, and Reciprocal Rank Fusion (RRF) for{" "}
            <strong>{activeWorkspace.name}</strong>.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
          <Database className="h-3.5 w-3.5 text-primary" />
          Workspace: <strong className="text-foreground">{activeWorkspace.name}</strong>
        </div>
      </div>

      {/* Vector & FTS Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border p-4 shadow-2xs">
          <CardContent className="p-0 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Chunks</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalChunks}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Across {readyDocs} ready documents
            </p>
          </CardContent>
        </Card>

        <Card className="border-border p-4 shadow-2xs">
          <CardContent className="p-0 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Vector Embedded</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {embeddedChunks}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {totalChunks > 0
                ? `${Math.round((embeddedChunks / totalChunks) * 100)}% indexed`
                : "No chunks yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border p-4 shadow-2xs">
          <CardContent className="p-0 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">FTS Indexed</span>
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {ftsChunks}
            </div>
            <p className="text-[11px] text-muted-foreground">
              GIN tsvector indexed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border p-4 shadow-2xs">
          <CardContent className="p-0 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Fusion Method</span>
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              RRF
            </div>
            <p className="text-[11px] text-muted-foreground">
              k = 60 reciprocal rank
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backfill Alert if legacy chunks lack embeddings */}
      {unindexedCount > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning-foreground">
                {unindexedCount} chunks in this workspace are missing vector embeddings.
              </p>
              <p className="text-muted-foreground mt-0.5">
                Legacy chunks generated prior to Phase 3 need embeddings to appear in semantic search.
              </p>
            </div>
          </div>
          <BackfillButton workspaceId={activeWorkspace.id} unindexedCount={unindexedCount} />
        </div>
      )}

      {/* Interactive Semantic Search Playground */}
      <SemanticSearchPlayground
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        hasIndexedChunks={embeddedChunks > 0}
      />

      {/* Chunk Catalog / Inspector */}
      <ChunkInspector chunks={inspectChunks} />
    </div>
  );
}
