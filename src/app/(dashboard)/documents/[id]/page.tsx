import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { db } from "@/lib/db";
import {
  documents,
  documentVersions,
  documentChunks,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChunkViewer } from "@/components/documents/chunk-viewer";
import { processDocumentAction } from "@/app/actions/documents";

export default async function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ws?: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const sParams = await searchParams;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    notFound();
  }

  // Security guard: verify user has access to this workspace
  await requireWorkspaceMember(doc.workspaceId, "member");

  // Fetch version and chunks
  const [version] = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, id))
    .limit(1);

  const chunks = version
    ? await db
        .select()
        .from(documentChunks)
        .where(eq(documentChunks.documentVersionId, version.id))
        .orderBy(asc(documentChunks.chunkIndex))
    : [];

  const backHref = sParams.ws
    ? `/documents?ws=${sParams.ws}`
    : `/documents?ws=${doc.workspaceId}`;

  async function handleProcessForm() {
    "use server";
    await processDocumentAction(id);
  }

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Documents
          </Link>
        </Button>

        {(doc.status === "pending" || doc.status === "failed") && (
          <form action={handleProcessForm}>
            <Button size="sm" className="gap-1.5">
              {doc.status === "failed" ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry Ingestion
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Process Document
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Document Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {doc.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Category: {doc.category || "General"} &bull; Uploaded on{" "}
                {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doc.status === "ready" && (
              <Badge variant="success" className="gap-1 px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Indexed & Ready
              </Badge>
            )}
            {doc.status === "processing" && (
              <Badge variant="outline" className="gap-1 px-3 py-1 text-info">
                Processing...
              </Badge>
            )}
            {doc.status === "pending" && (
              <Badge variant="warning" className="gap-1 px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                Pending Processing
              </Badge>
            )}
            {doc.status === "failed" && (
              <Badge variant="error" className="gap-1 px-3 py-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Processing Failed
              </Badge>
            )}
          </div>
        </div>

        {/* Failure alert banner if present */}
        {doc.status === "failed" && doc.errorMessage && (
          <div className="rounded-xl border border-error/20 bg-error/10 p-3.5 text-xs text-error flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Ingestion Error:</strong> {doc.errorMessage}
            </div>
          </div>
        )}

        {/* Quick specs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block">File Size</span>
            <span className="font-medium text-foreground">
              {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">MIME Type</span>
            <span className="font-medium text-foreground truncate block">
              {doc.mimeType}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Version</span>
            <span className="font-medium text-foreground">
              v{version?.versionNumber || 1}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Generated Chunks</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-primary" />
              {chunks.length} chunks
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Text & Chunks Inspector */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Ingestion & Partition Inspection
        </h2>
        <ChunkViewer
          extractedText={version?.extractedText || null}
          chunks={chunks}
        />
      </div>
    </div>
  );
}
