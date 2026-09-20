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
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Upload,
  Clock,
  Play,
  AlertCircle,
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

  // Close active 3-dot dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (activeMenuId && !(e.target as HTMLElement)?.closest(".action-menu-container")) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Strictly use real documents passed from DB (Zero fake sample data)
  const filtered = React.useMemo(() => {
    return documents.filter((doc) => {
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
          ? doc.status === "processing" || processingId === doc.id
          : statusFilter === "pending"
          ? doc.status === "pending"
          : doc.status === "failed";

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, search, typeFilter, statusFilter]);

  // Pagination calculations
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedDocs = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedDocs.length && paginatedDocs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDocs.map((d) => d.id)));
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
    setProcessingId(docId);
    try {
      await processDocumentAction(docId);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(docId: string) {
    setActiveMenuId(null);
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(docId);
    try {
      await deleteDocumentAction(docId);
    } finally {
      setDeletingId(null);
    }
  }

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return "0 KB";
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFormat = (name: string) => {
    const ext = name.split(".").pop()?.toUpperCase() || "DOC";
    if (ext === "PDF") {
      return {
        label: "PDF",
        squircleClass:
          "bg-rose-50 text-rose-500 border border-rose-100/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30",
      };
    }
    if (ext === "DOCX" || ext === "DOC") {
      return {
        label: "DOCX",
        squircleClass:
          "bg-blue-50 text-blue-500 border border-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
      };
    }
    return {
      label: "TXT",
      squircleClass:
        "bg-rose-50 text-rose-500 border border-rose-100/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30",
    };
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4 w-full" data-density="medium">
      {/* Control Bar: Search + Filter Dropdowns + View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name, type, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#4F46E5] shadow-2xs transition-all"
          />
        </div>

        {/* Right Filters & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Type Dropdown */}
          <div className="relative inline-block">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 pl-3.5 pr-8 rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] shadow-2xs cursor-pointer appearance-none"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3.5 pr-8 rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] shadow-2xs cursor-pointer appearance-none"
            >
              <option value="all">All Status</option>
              <option value="ready">Indexed</option>
              <option value="processing">Processing</option>
              <option value="pending">Queued</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Table / Grid Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-1 shadow-2xs h-10">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#4F46E5]/10 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {documents.length === 0 ? (
        /* Empty Workspace Zero State (No Fake Documents) */
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden py-16 px-6 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-center mb-4 text-[#4F46E5] dark:text-indigo-400">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="font-heading text-base md:text-lg font-bold text-slate-900 dark:text-foreground mb-1">
            No documents in this workspace yet
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground max-w-md mb-6">
            Upload your first PDF, Word (.docx), or text (.txt) document to start extracting, chunking, and querying your knowledge base with AI.
          </p>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs md:text-sm px-5 py-2.5 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Documents</span>
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        /* Filter / Search Yielded 0 Results */
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden py-14 px-6 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-muted flex items-center justify-center mb-3 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground mb-1">
            No documents match your filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mb-4">
            No files match &quot;{search}&quot;. Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Populated Table View */
        <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-border/50 bg-slate-50/50 dark:bg-muted/20 text-slate-500 dark:text-muted-foreground font-medium text-xs">
                <tr>
                  <th className="py-4 pl-5 pr-2 w-12">
                    <input
                      type="checkbox"
                      checked={
                        paginatedDocs.length > 0 &&
                        selectedIds.size === paginatedDocs.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-border text-[#4F46E5] focus:ring-[#4F46E5] h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 font-medium text-slate-500 dark:text-muted-foreground">Name</th>
                  <th className="py-4 px-4 font-medium text-slate-500 dark:text-muted-foreground w-24">Type</th>
                  <th className="py-4 px-4 font-medium text-slate-500 dark:text-muted-foreground w-28">Size</th>
                  <th className="py-4 px-4 font-medium text-slate-500 dark:text-muted-foreground w-32">Status</th>
                  <th className="py-4 px-4 font-medium text-slate-500 dark:text-muted-foreground w-32">Indexed</th>
                  <th className="py-4 pr-5 pl-4 text-right font-medium text-slate-500 dark:text-muted-foreground w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                {paginatedDocs.map((doc) => {
                  const format = getFormat(doc.name);
                  const isSelected = selectedIds.has(doc.id);
                  const isProcessing =
                    processingId === doc.id || doc.status === "processing";
                  const isPending = doc.status === "pending" && processingId !== doc.id;
                  const isFailed = doc.status === "failed";

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-muted/20 transition-colors group ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="py-4 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(doc.id)}
                          className="rounded border-slate-300 dark:border-border text-[#4F46E5] focus:ring-[#4F46E5] h-4 w-4 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${format.squircleClass}`}
                          >
                            <FileText className="h-4 w-4" />
                          </div>
                          <Link
                            href={`/documents/${doc.id}?ws=${workspaceId}`}
                            className="text-slate-800 dark:text-foreground hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors truncate max-w-md font-semibold text-xs md:text-sm"
                          >
                            {doc.name}
                          </Link>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-muted-foreground text-xs">
                        {format.label}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-muted-foreground text-xs">
                        {formatFileSize(doc.sizeBytes)}
                      </td>

                      <td className="py-4 px-4">
                        {isProcessing ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-100/80 dark:border-purple-800/40">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/50">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Queued
                          </span>
                        ) : isFailed ? (
                          <span
                            title={doc.errorMessage || "Processing failed"}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100/80 dark:border-rose-800/40 cursor-help"
                          >
                            <AlertCircle className="h-3 w-3 text-rose-500" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-800/40">
                            Indexed
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-muted-foreground text-xs">
                        {formatRelativeTime(doc.createdAt)}
                      </td>

                      <td className="py-4 pr-5 pl-4 text-right relative action-menu-container">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === doc.id ? null : doc.id)
                            }
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === doc.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-1 shadow-lg z-20 animate-in fade-in-50 zoom-in-95 duration-100">
                              <Link
                                href={`/documents/${doc.id}?ws=${workspaceId}`}
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-foreground transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                <span>View Chunks</span>
                              </Link>

                              <button
                                onClick={() => handleProcess(doc.id)}
                                disabled={deletingId === doc.id || processingId === doc.id}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-foreground transition-colors cursor-pointer"
                              >
                                {doc.status === "failed" ? (
                                  <>
                                    <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Retry Ingestion</span>
                                  </>
                                ) : doc.status === "pending" ? (
                                  <>
                                    <Play className="h-3.5 w-3.5 text-[#4F46E5]" />
                                    <span>Process Document</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Re-index Document</span>
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-border" />

                              <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
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
        /* Populated Grid View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedDocs.map((doc) => {
            const format = getFormat(doc.name);
            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4.5 shadow-xs flex flex-col justify-between hover:border-[#4F46E5]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${format.squircleClass}`}
                    >
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-muted-foreground uppercase">
                      {format.label}
                    </span>
                  </div>
                  <h3 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-foreground truncate mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-mono">
                    {formatFileSize(doc.sizeBytes)} &bull; {formatRelativeTime(doc.createdAt)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-border/50 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold ${
                      doc.status === "ready"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : doc.status === "failed"
                        ? "text-rose-600 dark:text-rose-400"
                        : doc.status === "pending"
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {doc.status === "processing" || processingId === doc.id
                      ? "Processing"
                      : doc.status === "failed"
                      ? "Failed"
                      : doc.status === "pending"
                      ? "Queued"
                      : "Indexed"}
                  </span>
                  <Link
                    href={`/documents/${doc.id}?ws=${workspaceId}`}
                    className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
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
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-muted-foreground">
        <span>
          {filtered.length} {filtered.length === 1 ? "document" : "documents"}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-card border border-slate-200/80 dark:border-border/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-[#4F46E5] text-white font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-card border border-slate-200/80 dark:border-border/80"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-card border border-slate-200/80 dark:border-border/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
