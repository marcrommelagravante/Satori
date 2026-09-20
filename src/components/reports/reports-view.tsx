"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MoreVertical,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  X,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Scale,
  Loader2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/db/schema";
import {
  generateAndCreateReportAction,
  deleteReportAction,
  type ReportFormat,
} from "@/app/actions/reports";

interface DocumentItem {
  id: string;
  name: string;
}

interface ReportsViewProps {
  reports: Report[];
  workspaceId: string;
  documentNamesMap?: Record<string, string>;
  availableDocuments?: DocumentItem[];
}

export function ReportsView({
  reports,
  workspaceId,
  documentNamesMap: _documentNamesMap,
  availableDocuments = [],
}: ReportsViewProps) {
  const router = useRouter();

  // Active three-dots menu ID
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Search & Filter state
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<
    "all" | "summary" | "comparison" | "analysis"
  >("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Generate Report Modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [reportTitle, setReportTitle] = React.useState("");
  const [selectedFormat, setSelectedFormat] =
    React.useState<ReportFormat>("summary");
  const [selectedDocIds, setSelectedDocIds] = React.useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = React.useState("");
  const [generateError, setGenerateError] = React.useState<string | null>(null);

  // Pre-select documents when opening modal if none selected yet
  React.useEffect(() => {
    if (isGenerateModalOpen && selectedDocIds.length === 0 && availableDocuments.length > 0) {
      setSelectedDocIds(availableDocuments.map((d) => d.id));
    }
  }, [isGenerateModalOpen, availableDocuments]);

  // Close three-dots menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        activeMenuId &&
        !(e.target as HTMLElement).closest(".report-actions-menu")
      ) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Helper to determine report format category from content or fallback
  const getReportCategory = (r: Report): "summary" | "comparison" | "analysis" => {
    const content = r.content as Record<string, unknown> | null;
    const format = content?.format as string | undefined;
    if (format === "analysis") return "analysis";
    if (format === "comparison" || r.type === "document_comparison") return "comparison";
    if (format === "summary") return "summary";
    if (r.title.toLowerCase().includes("analysis")) return "analysis";
    return "summary";
  };

  const totalReportsCount = reports.length;
  const summariesCount = reports.filter(
    (r) => getReportCategory(r) === "summary"
  ).length;
  const comparisonsCount = reports.filter(
    (r) => getReportCategory(r) === "comparison"
  ).length;
  const analysesCount = reports.filter(
    (r) => getReportCategory(r) === "analysis"
  ).length;

  // Real recent reports created in the last 7 days
  const sevenDaysAgo = React.useMemo(
    () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    []
  );
  const newReportsCount = React.useMemo(
    () => reports.filter((r) => new Date(r.createdAt) > sevenDaysAgo).length,
    [reports, sevenDaysAgo]
  );

  // Format real reports list with search/filter strictly from DB records
  const displayReports = reports
    .filter((r) => {
      const cat = getReportCategory(r);
      if (selectedFilter !== "all" && cat !== selectedFilter) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .map((r) => {
      const cat = getReportCategory(r);
      const contentObj = r.content as Record<string, unknown> | null;
      const sections = Array.isArray(contentObj?.sections)
        ? contentObj.sections
        : [];
      const summaryLength =
        typeof contentObj?.executiveSummary === "string"
          ? contentObj.executiveSummary.length
          : typeof contentObj?.summary === "string"
          ? contentObj.summary.length
          : 0;
      const estimatedPages = Math.max(
        1,
        Math.ceil((sections.length * 350 + summaryLength) / 500)
      );

      return {
        id: r.id,
        title: r.title,
        type: r.type,
        badgeText:
          cat === "analysis"
            ? "Analysis"
            : cat === "comparison"
            ? "Comparison"
            : "Summary",
        createdAt: new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        pageCount: estimatedPages,
      };
    });

  // Handle copy link action
  const handleCopyLink = (reportId: string) => {
    const url = `${window.location.origin}/reports/${reportId}?ws=${workspaceId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(reportId);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  // Handle delete action
  const handleDelete = async (reportId: string) => {
    setActiveMenuId(null);
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    setDeletingId(reportId);
    try {
      const res = await deleteReportAction(reportId, workspaceId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete report.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Handle report generation submit with 100% grounded Gemini synthesis
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      setGenerateError("Please enter a report title.");
      return;
    }

    if (selectedDocIds.length === 0) {
      setGenerateError("Please select at least one source document to analyze.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await generateAndCreateReportAction({
        workspaceId,
        title: reportTitle.trim(),
        format: selectedFormat,
        sourceDocumentIds: selectedDocIds,
        focusTopic: customPrompt.trim() || undefined,
      });

      if (res.success && res.report) {
        setIsGenerateModalOpen(false);
        setReportTitle("");
        setCustomPrompt("");
        setSelectedDocIds([]);
        router.push(`/reports/${res.report.id}?ws=${workspaceId}`);
      } else {
        setGenerateError(res.error || "Failed to generate report.");
      }
    } catch {
      setGenerateError("An unexpected error occurred while generating report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-12" data-density="medium">
      {/* 1. Header (Image 1 replica) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
            Reports
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
            View insights, analytics, and generated reports from your knowledge base.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="rounded-xl sm:rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs md:text-sm px-5 py-2.5 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Summary Metric Counters (100% Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
          <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
            Total Reports
          </span>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {totalReportsCount}
            </span>
            {newReportsCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                +{newReportsCount} new
              </span>
            ) : totalReportsCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                Active
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                0 new
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Recent Summaries */}
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
          <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
            Recent Summaries
          </span>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {summariesCount}
            </span>
            {summariesCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                +{summariesCount} total
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Comparisons */}
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
          <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
            Comparisons
          </span>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {comparisonsCount}
            </span>
            {comparisonsCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                +{comparisonsCount} total
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Analyses */}
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
          <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
            Analyses
          </span>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {analysesCount}
            </span>
            {analysesCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                +{analysesCount} total
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Section Header: Outside and Above Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Recent Reports
            </h2>
            <span className="text-xs text-slate-400 dark:text-muted-foreground font-medium">
              ({totalReportsCount})
            </span>
          </div>
          {totalReportsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showFilters ? "Hide filters" : "View all"}</span>
              <ArrowRight
                className={`h-3.5 w-3.5 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Optional Expandable In-Page Search & Filter Controls */}
        {showFilters && totalReportsCount > 0 && (
          <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: "All Reports" },
                { id: "summary", label: "Summaries" },
                { id: "comparison", label: "Comparisons" },
                { id: "analysis", label: "Analyses" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedFilter === tab.id
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by report title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-muted/50 border border-slate-200/80 dark:border-border text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white dark:focus:bg-card transition-all"
              />
            </div>
          </div>
        )}

        {/* 4. Report List Unified Card */}
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden">
          {totalReportsCount === 0 ? (
            /* 100% Real Empty State when Workspace has 0 Reports */
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#EEF2FF] dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-400 border border-violet-100/60 dark:border-violet-900/30 flex items-center justify-center mb-3.5 shadow-2xs">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-foreground">
                No reports in this workspace yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-sm mt-1 mb-5">
                Generate summaries, cross-document comparisons, and deep analytical reports grounded in your knowledge base.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {availableDocuments.length === 0 ? (
                  <>
                    <Link
                      href={`/documents?ws=${workspaceId}&upload=open`}
                      className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Upload Documents</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsGenerateModalOpen(true)}
                      className="rounded-xl border border-slate-200 dark:border-border bg-slate-50 hover:bg-slate-100 dark:bg-muted/40 dark:hover:bg-muted text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm px-4.5 py-2.5 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Generate Report</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Your First Report</span>
                  </button>
                )}
              </div>
              {availableDocuments.length === 0 && (
                <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-4">
                  Reports require uploaded documents to synthesize and cite verified evidence.
                </p>
              )}
            </div>
          ) : displayReports.length === 0 ? (
            /* Filter/Search yielded 0 matches */
            <div className="py-12 px-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                No reports match &ldquo;{searchQuery || selectedFilter}&rdquo;
              </p>
              <p className="text-xs text-slate-400 dark:text-muted-foreground mt-1">
                Try selecting a different filter or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Real Database Reports List */
            <div className="divide-y divide-slate-100 dark:divide-border/60">
              {displayReports.map((report) => {
                const isMenuOpen = activeMenuId === report.id;
                const isDeleting = deletingId === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      router.push(`/reports/${report.id}?ws=${workspaceId}`);
                    }}
                    className="py-4.5 px-5 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors group cursor-pointer relative"
                  >
                    {/* Left: Purple Squircle Badge + Title & Metadata */}
                    <div className="flex items-center gap-4 truncate min-w-0">
                      {/* Squircle Badge matching Image 1 */}
                      <div className="h-12 w-12 rounded-2xl bg-[#EEF2FF] dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-400 border border-violet-100/60 dark:border-violet-900/30 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="flex flex-col truncate">
                        <span className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-foreground group-hover:text-[#4F46E5] transition-colors truncate">
                          {report.title}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal">
                          Created {report.createdAt} &bull; {report.pageCount}{" "}
                          pages
                        </span>
                      </div>
                    </div>

                    {/* Right: Soft Lavender Type Badge + Three-dots Menu */}
                    <div
                      className="flex items-center gap-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="inline-flex items-center rounded-full bg-[#F5F3FF] dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 text-xs font-semibold px-3.5 py-1 shadow-2xs">
                        {report.badgeText}
                      </span>

                      {/* Three-dots menu button & dropdown */}
                      <div className="relative report-actions-menu">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : report.id)
                          }
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-1.5 shadow-xl text-xs z-30 animate-in fade-in-50 zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(
                                  `/reports/${report.id}?ws=${workspaceId}`
                                );
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-foreground transition-colors flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                              <span>View Report</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(report.id)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-foreground transition-colors flex items-center gap-2 cursor-pointer font-medium"
                            >
                              {copiedId === report.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                              )}
                              <span>
                                {copiedId === report.id ? "Copied!" : "Copy Link"}
                              </span>
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-border" />

                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(report.id)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-2 cursor-pointer font-medium disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Report</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Interactive Generate Report Modal Dialog */}
      {isGenerateModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
            onClick={() => !isGenerating && setIsGenerateModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#EEF2FF] dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-400 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-foreground">
                      Generate New Report
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">
                      Synthesize insights from your workspace knowledge.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={isGenerating}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleGenerateSubmit} className="space-y-4">
                {generateError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {generateError}
                  </div>
                )}

                {/* Report Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Report Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 2026 Operational Performance Summary"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/80 dark:border-border focus:outline-none focus:border-[#4F46E5] focus:bg-white text-slate-900 dark:text-foreground placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Report Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Report Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: "summary" as const,
                        label: "Executive Summary",
                        desc: "High-level digest",
                        icon: FileSpreadsheet,
                      },
                      {
                        id: "comparison" as const,
                        label: "Comparison",
                        desc: "Cross-doc analysis",
                        icon: Scale,
                      },
                      {
                        id: "analysis" as const,
                        label: "Deep Analysis",
                        desc: "In-depth breakdown",
                        icon: Sparkles,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedFormat === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedFormat(item.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? "border-[#4F46E5] bg-[#EEF2FF]/60 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 ring-1 ring-[#4F46E5]/30 shadow-2xs"
                              : "border-slate-200/80 dark:border-border bg-slate-50/50 dark:bg-muted/20 text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className="h-4 w-4" />
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#4F46E5]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">
                              {item.label}
                            </p>
                            <p className="text-[10px] opacity-80 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Document Source Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>Source Documents</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                        Required
                      </span>
                    </label>
                    {availableDocuments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedDocIds.length === availableDocuments.length) {
                            setSelectedDocIds([]);
                          } else {
                            setSelectedDocIds(availableDocuments.map((d) => d.id));
                          }
                        }}
                        className="text-[11px] text-[#4F46E5] dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                      >
                        {selectedDocIds.length === availableDocuments.length
                          ? "Deselect all"
                          : `Select all (${availableDocuments.length})`}
                      </button>
                    )}
                  </div>

                  {availableDocuments.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          No documents found in this workspace. Reports synthesize authentic document content, so at least one document is required.
                        </p>
                      </div>
                      <Link
                        href={`/documents?ws=${workspaceId}&upload=open`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload documents to knowledge base</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-border p-2 space-y-1 bg-slate-50/50 dark:bg-muted/20">
                      {availableDocuments.map((doc) => {
                        const isChecked = selectedDocIds.includes(doc.id);
                        return (
                          <label
                            key={doc.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-muted text-xs text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDocIds([...selectedDocIds, doc.id]);
                                } else {
                                  setSelectedDocIds(
                                    selectedDocIds.filter((id) => id !== doc.id)
                                  );
                                }
                              }}
                              className="rounded text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5"
                            />
                            <span className="truncate">{doc.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {availableDocuments.length > 0 && selectedDocIds.length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      Please select at least one document to analyze.
                    </p>
                  )}
                </div>

                {/* Custom Focus / Prompt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Focus Topic / Guidance Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Focus on compliance risks, quarterly revenue trends, and key policy updates..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/80 dark:border-border focus:outline-none focus:border-[#4F46E5] focus:bg-white text-slate-900 dark:text-foreground placeholder:text-slate-400 transition-all resize-none"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isGenerating || !reportTitle.trim() || selectedDocIds.length === 0}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-5 py-2 text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Report</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
