"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Play,
  RotateCcw,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  processDocumentAction,
  deleteDocumentAction,
} from "@/app/actions/documents";
import type { Document } from "@/lib/db/schema";

interface DocumentListProps {
  documents: Document[];
  workspaceId: string;
}

export function DocumentList({ documents, workspaceId }: DocumentListProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleProcess(docId: string) {
    setProcessingId(docId);
    try {
      await processDocumentAction(docId);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document and its chunk embeddings?")) {
      return;
    }
    setDeletingId(docId);
    try {
      await deleteDocumentAction(docId);
    } finally {
      setDeletingId(null);
    }
  }

  function getFormatBadge(name: string) {
    const ext = name.split(".").pop()?.toUpperCase() || "DOC";
    if (ext === "PDF") {
      return <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-200">PDF</Badge>;
    }
    if (ext === "DOCX") {
      return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200">DOCX</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] bg-gray-500/10 text-gray-600 border-gray-200">TXT</Badge>;
  }

  function renderStatus(doc: Document) {
    switch (doc.status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-info animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Processing...
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-error" title={doc.errorMessage || "Processing failed"}>
            <AlertCircle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
            <Clock className="h-3.5 w-3.5" />
            Uploaded
          </span>
        );
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-medium mr-1">Status:</span>
          {["all", "ready", "pending", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {documents.length === 0
            ? "No documents uploaded yet. Drop a file above to get started."
            : "No documents match the active search/filter criteria."}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((doc) => {
                  const isProcessing = processingId === doc.id;
                  const isDeleting = deletingId === doc.id;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex flex-col">
                            <Link
                              href={`/documents/${doc.id}?ws=${workspaceId}`}
                              className="font-medium text-foreground hover:text-primary hover:underline transition-colors truncate max-w-xs sm:max-w-sm"
                            >
                              {doc.name}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {getFormatBadge(doc.name)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {doc.category || "General"}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </td>

                      <td className="py-3 px-4">
                        {renderStatus(doc)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step 2 Process Button */}
                          {(doc.status === "pending" || doc.status === "failed") && (
                            <Button
                              size="sm"
                              variant={doc.status === "failed" ? "outline" : "default"}
                              className="h-7 px-2.5 text-xs gap-1"
                              onClick={() => handleProcess(doc.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : doc.status === "failed" ? (
                                <>
                                  <RotateCcw className="h-3 w-3" />
                                  Retry
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3" />
                                  Process
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Inspect Details"
                          >
                            <Link href={`/documents/${doc.id}?ws=${workspaceId}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={isDeleting}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                            title="Delete Document"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
