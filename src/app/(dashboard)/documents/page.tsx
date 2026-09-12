import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { DocumentList } from "@/components/documents/document-list";
import { Badge } from "@/components/ui/badge";
import { Files } from "lucide-react";

export default async function DocumentsPage({
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
    return <div>No active workspace found.</div>;
  }

  // Strictly tenant-isolated document fetch
  const workspaceDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, activeWorkspace.id))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Document Manager
            </h1>
            <Badge variant="outline" className="text-xs">
              Phase 2 Ready
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload, extract, and chunk organizational knowledge for <strong>{activeWorkspace.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
          <Files className="h-4 w-4 text-primary" />
          <span>{workspaceDocs.length} Total Documents</span>
        </div>
      </div>

      {/* Step 1: Upload Dropzone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Upload New Documents
          </h2>
          <span className="text-xs text-muted-foreground">
            Supported: PDF, DOCX, TXT (Max 15 MB)
          </span>
        </div>
        <UploadDropzone workspaceId={activeWorkspace.id} />
      </div>

      {/* Step 2: Document List & Ingestion Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Workspace Documents
        </h2>
        <DocumentList
          documents={workspaceDocs}
          workspaceId={activeWorkspace.id}
        />
      </div>
    </div>
  );
}
