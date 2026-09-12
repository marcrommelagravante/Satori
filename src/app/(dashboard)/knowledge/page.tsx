import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { Network, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Index</h1>
          <Badge variant="outline">Phase 3</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Inspect chunks, pgvector embeddings, and similarity metrics inside PostgreSQL.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <Network className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Custom RAG Vector Storage & Retrieval
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          pgvector is active on Neon PostgreSQL with 768-dimension embeddings for Gemini text-embedding-004. Semantic search queries will be enabled in Phase 3.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Database className="h-3.5 w-3.5 text-primary" />
          Workspace: <strong>{activeWorkspace?.name}</strong>
        </div>
      </div>
    </div>
  );
}
