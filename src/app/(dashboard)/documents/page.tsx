import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DocumentsView } from "@/components/documents/documents-view";

interface DocumentsPageProps {
  searchParams: Promise<{ ws?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);
  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  if (!activeWorkspace) {
    return <div className="p-8 text-center text-sm text-muted-foreground">No active workspace found.</div>;
  }

  // Strictly tenant-isolated document fetch
  const workspaceDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id))
    .orderBy(desc(documents.createdAt));

  return (
    <DocumentsView
      documents={workspaceDocs}
      workspaceId={activeWorkspace.id}
      workspaceName={activeWorkspace.name}
    />
  );
}
