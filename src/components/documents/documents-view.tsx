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
    <div className="space-y-6 w-full" data-density="medium">
      {/* Header matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
            Documents
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-1">
            Upload, manage, and organize your documents.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs md:text-sm px-4.5 py-2.5 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
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
