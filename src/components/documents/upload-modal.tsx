"use client";

import * as React from "react";
import { X, UploadCloud } from "lucide-react";
import { UploadDropzone } from "./upload-dropzone";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onUploadSuccess?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  workspaceId,
  onUploadSuccess,
}: UploadModalProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                Upload Documents
              </h2>
              <p className="text-xs text-muted-foreground">
                Add files to extract, chunk, and index into your knowledge base.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <UploadDropzone
          workspaceId={workspaceId}
          onUploadSuccess={() => {
            onUploadSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
