"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentList } from "./document-list";
import { UploadModal } from "./upload-modal";
import { useSearchParams, useRouter } from "next/navigation";
import type { Document } from "@/lib/db/schema";

interface DocumentsViewProps {
  documents: Document[];
  workspaceId: string;
  workspaceName?: string;
}

export function DocumentsView({
  documents,
  workspaceId,
}: DocumentsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadOpen, setIsUploadOpen] = React.useState(
    () => searchParams?.get("upload") === "open"
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-density="medium">
      {/* Header matching Mockup Panel 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Documents
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Upload, manage, and organize your documents.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="rounded-[8px] bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-xs md:text-sm px-4 py-2 shadow-xs flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Documents</span>
          </Button>
        </div>
      </div>

      {/* Main Document Table / List */}
      <DocumentList
        documents={documents}
        workspaceId={workspaceId}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          if (searchParams.get("upload")) {
            router.push(`/documents?ws=${workspaceId}`);
          }
        }}
        workspaceId={workspaceId}
        onUploadSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
