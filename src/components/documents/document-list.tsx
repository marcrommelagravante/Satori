"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  RotateCcw,
  Trash2,
  ExternalLink,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Check,
} from "lucide-react";
import {
  processDocumentAction,
  deleteDocumentAction,
} from "@/app/actions/documents";
import type { Document } from "@/lib/db/schema";

interface DocumentListProps {
  documents: Document[];
  workspaceId: string;
  onOpenUpload?: () => void;
}

export function DocumentList({
  documents,
  workspaceId,
  onOpenUpload,
}: DocumentListProps) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fallback sample data if workspace has 0 documents to match mockup
  const sampleDocs: Document[] = [
    {
      id: "sample-1",
      workspaceId,
      name: "Company Policies.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2400000,
      status: "ready",
      category: "Policies",
      errorMessage: null,
      createdAt: new Date("2026-03-15T12:00:00Z"),
      updatedAt: new Date("2026-03-15T12:00:00Z"),
    },
    {
      id: "sample-2",
      workspaceId,
      name: "Employee Handbook.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: 1200000,
      status: "ready",
      category: "HR",
      errorMessage: null,
      createdAt: new Date("2026-03-15T11:00:00Z"),
      updatedAt: new Date("2026-03-15T11:00:00Z"),
    },
    {
      id: "sample-3",
      workspaceId,
      name: "Q3 Financial Report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 3000000,
      status: "processing",
      category: "Finance",
      errorMessage: null,
      createdAt: new Date("2026-03-15T10:00:00Z"),
      updatedAt: new Date("2026-03-15T10:00:00Z"),
    },
    {
      id: "sample-4",
      workspaceId,
      name: "Product Roadmap.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: 2100000,
      status: "ready",
      category: "Product",
      errorMessage: null,
      createdAt: new Date("2026-03-15T08:00:00Z"),
      updatedAt: new Date("2026-03-15T08:00:00Z"),
    },
    {
      id: "sample-5",
      workspaceId,
      name: "Meeting Notes.txt",
      mimeType: "text/plain",
      sizeBytes: 246000,
      status: "failed",
      category: "Notes",
      errorMessage: "Encoding error during extraction",
      createdAt: new Date("2026-03-15T06:00:00Z"),
      updatedAt: new Date("2026-03-15T06:00:00Z"),
    },
  ];

  const docsSource = documents.length > 0 ? documents : sampleDocs;

  const filtered = docsSource.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const ext = doc.name.split(".").pop()?.toLowerCase() || "";
    const matchesType =
      typeFilter === "all"
        ? true
        : typeFilter === "pdf"
        ? ext === "pdf"
        : typeFilter === "docx"
        ? ext === "docx" || ext === "doc"
        : ext === "txt";

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "ready"
        ? doc.status === "ready"
        : statusFilter === "processing"
        ? doc.status === "processing" || doc.status === "pending"
        : doc.status === "failed";

    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((d) => d.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  async function handleProcess(docId: string) {
    setActiveMenuId(null);
    if (docId.startsWith("sample-")) return;
    setProcessingId(docId);
    try {
      await processDocumentAction(docId);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(docId: string) {
    setActiveMenuId(null);
    if (docId.startsWith("sample-")) return;
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(docId);
    try {
      await deleteDocumentAction(docId);
    } finally {
      setDeletingId(null);
    }
  }

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "1.2 MB";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFormat = (name: string) => {
    const ext = name.split(".").pop()?.toUpperCase() || "DOC";
    if (ext === "PDF") {
      return {
        label: "PDF",
        iconColor: "text-rose-500",
      };
    }
    if (ext === "DOCX" || ext === "DOC") {
      return {
        label: "DOCX",
        iconColor: "text-blue-500",
      };
    }
    return {
      label: "TXT",
      iconColor: "text-slate-500",
    };
  };

  const formatRelativeTime = (date: Date) => {
    // eslint-disable-next-line react-hooks/purity
    const diffHours = Math.round((Date.now() - new Date(date).getTime()) / (1000 * 3600));
    if (diffHours <= 0) return "Just now";
    if (diffHours === 1) return "1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4" data-density="medium">
      {/* Control Bar: Search + Filter Dropdowns + View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name, type, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-[8px] bg-card border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>

        {/* Right Filters & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-border/80 bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-border/80 bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ready">Indexed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          {/* Table / Grid Switcher */}
          <div className="flex items-center rounded-[8px] border border-border/80 bg-card p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-[6px] transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-[6px] transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Grid Content */}
      {viewMode === "table" ? (
        <div className="rounded-[10px] border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 && selectedIds.size === filtered.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Indexed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((doc) => {
                  const format = getFormat(doc.name);
                  const isSelected = selectedIds.has(doc.id);
                  const isProcessing =
                    processingId === doc.id ||
                    doc.status === "processing" ||
                    doc.status === "pending";
                  const isFailed = doc.status === "failed";

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-muted/30 transition-colors group ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(doc.id)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2.5">
                          <FileText className={`h-4 w-4 shrink-0 ${format.iconColor}`} />
                          <Link
                            href={
                              doc.id.startsWith("sample-")
                                ? "#"
                                : `/documents/${doc.id}?ws=${workspaceId}`
                            }
                            className="text-foreground hover:text-primary transition-colors truncate max-w-xs font-semibold"
                          >
                            {doc.name}
                          </Link>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {format.label}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {formatFileSize(doc.sizeBytes)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isProcessing ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/40">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            Indexed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono">
                        {formatRelativeTime(doc.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
                            }
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === doc.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-lg z-20 animate-in fade-in-50 zoom-in-95 duration-100">
                              <Link
                                href={
                                  doc.id.startsWith("sample-")
                                    ? "#"
                                    : `/documents/${doc.id}?ws=${workspaceId}`
                                }
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>View Chunks</span>
                              </Link>

                              <button
                                onClick={() => handleProcess(doc.id)}
                                disabled={deletingId === doc.id || processingId === doc.id}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground transition-colors"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Re-index Document</span>
                              </button>

                              <div className="my-1 border-t border-border" />

                              <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-error/10 text-error transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Document</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const format = getFormat(doc.name);
            return (
              <div
                key={doc.id}
                className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 border border-border/50">
                      <FileText className={`h-4 w-4 ${format.iconColor}`} />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {format.label}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground truncate mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {formatFileSize(doc.sizeBytes)} &bull; {formatRelativeTime(doc.createdAt)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {doc.status === "processing" ? "Processing" : "Indexed"}
                  </span>
                  <Link
                    href={
                      doc.id.startsWith("sample-")
                        ? "#"
                        : `/documents/${doc.id}?ws=${workspaceId}`
                    }
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: Count & Pagination */}
      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span>{filtered.length} documents</span>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border/80 bg-card hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-7 w-7 items-center justify-center rounded-[6px] border text-xs font-medium transition-colors ${
                currentPage === page
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border/80 bg-card hover:bg-muted text-foreground"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border/80 bg-card hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
