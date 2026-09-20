"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocumentAction } from "@/app/actions/documents";

interface UploadDropzoneProps {
  workspaceId: string;
  onUploadSuccess?: () => void;
}

export function UploadDropzone({
  workspaceId,
  onUploadSuccess,
}: UploadDropzoneProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [category, setCategory] = React.useState("General");
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(selectedFile: File | null) {
    setError(null);
    setSuccess(false);

    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "docx", "txt"].includes(ext)) {
      setError("Only PDF, DOCX, and TXT files are supported.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("File size exceeds the 15 MB limit.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("file", file);
    formData.append("category", category);

    const res = await uploadDocumentAction(formData);

    if (res?.error) {
      setError(res.error);
      setIsUploading(false);
    } else {
      setSuccess(true);
      setFile(null);
      setIsUploading(false);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>File uploaded and indexed successfully! Ready for AI chat & search.</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/50 bg-card hover:bg-muted/40"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        {file ? (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 font-medium text-sm text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>{file.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to upload
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Drag & drop your file here, or{" "}
              <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOCX, and TXT up to 15 MB
            </p>
          </div>
        )}
      </div>

      {file && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground shrink-0">
              Category:
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Policy, Bylaws, Manual"
              className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFile(null)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Uploading & Indexing...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
