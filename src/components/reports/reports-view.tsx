"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  MoreVertical,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Report } from "@/lib/db/schema";

interface ReportsViewProps {
  reports: Report[];
  workspaceId: string;
  documentNamesMap?: Record<string, string>;
}

export function ReportsView({
  reports,
  workspaceId,
  documentNamesMap: _documentNamesMap,
}: ReportsViewProps) {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Fallback sample reports from visual mockup Panel 5 if empty
  const sampleReports: Array<{
    id: string;
    title: string;
    type: "document_summary" | "document_comparison" | "research_analysis";
    badgeText: string;
    createdAt: string;
    pageCount: number;
  }> = [
    {
      id: "sample-rep-1",
      title: "Q3 2024 Company Summary",
      type: "document_summary",
      badgeText: "Summary",
      createdAt: "Apr 23, 2025",
      pageCount: 12,
    },
    {
      id: "sample-rep-2",
      title: "Employee Handbook Analysis",
      type: "research_analysis",
      badgeText: "Analysis",
      createdAt: "Apr 21, 2025",
      pageCount: 8,
    },
    {
      id: "sample-rep-3",
      title: "Product Performance Report",
      type: "research_analysis",
      badgeText: "Analysis",
      createdAt: "Apr 18, 2025",
      pageCount: 16,
    },
    {
      id: "sample-rep-4",
      title: "Technical Documentation Summary",
      type: "document_summary",
      badgeText: "Summary",
      createdAt: "Apr 15, 2025",
      pageCount: 22,
    },
  ];

  const hasRealReports = reports.length > 0;
  const summariesCount = hasRealReports
    ? reports.filter((r) => r.type === "document_summary").length
    : 8;
  const comparisonsCount = hasRealReports
    ? reports.filter((r) => r.type === "document_comparison").length
    : 3;
  const analysesCount = 1;
  const totalReportsCount = hasRealReports
    ? reports.length
    : summariesCount + comparisonsCount + analysesCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12" data-density="medium">
      {/* Header matching Mockup Panel 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            View insights, analytics, and generated reports from your knowledge base.
          </p>
        </div>

        <div>
          <Button
            asChild
            className="rounded-[8px] bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-xs md:text-sm px-4 py-2 shadow-xs flex items-center gap-2"
          >
            <Link href={`/chat?ws=${workspaceId}&prompt=Generate an analytical report on our documents`}>
              <Sparkles className="h-4 w-4" />
              <span>Generate Report</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Total Reports</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading text-2xl font-bold text-foreground">
              {totalReportsCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
              +2 new
            </span>
          </div>
        </div>

        {/* Recent Summaries */}
        <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Recent Summaries</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading text-2xl font-bold text-foreground">
              {summariesCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
              +2 new
            </span>
          </div>
        </div>

        {/* Comparisons */}
        <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Comparisons</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading text-2xl font-bold text-foreground">
              {comparisonsCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
              +1 new
            </span>
          </div>
        </div>

        {/* Analyses */}
        <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Analyses</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading text-2xl font-bold text-foreground">
              {analysesCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
              +1 new
            </span>
          </div>
        </div>
      </div>

      {/* Recent Reports List matching Mockup Panel 5 */}
      <div className="rounded-[10px] border border-border/80 bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Recent Reports
          </h2>
          <span className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer">
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {hasRealReports
            ? reports.map((report) => {
                const badgeLabel =
                  report.type === "document_summary"
                    ? "Summary"
                    : report.type === "document_comparison"
                    ? "Comparison"
                    : "Analysis";
                const dateStr = new Date(report.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={report.id}
                    className="py-3.5 flex items-center justify-between gap-4 group hover:bg-muted/25 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3.5 truncate">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col truncate">
                        <Link
                          href={`/reports/${report.id}?ws=${workspaceId}`}
                          className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                        >
                          {report.title}
                        </Link>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Created {dateStr} &bull; 8 pages
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center rounded-full bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 text-[11px] font-semibold">
                        {badgeLabel}
                      </span>

                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === report.id ? null : report.id)
                        }
                        className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            : sampleReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3.5 flex items-center justify-between gap-4 group hover:bg-muted/25 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {report.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Created {report.createdAt} &bull; {report.pageCount} pages
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center rounded-full bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 text-[11px] font-semibold">
                      {report.badgeText}
                    </span>

                    <button
                      className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
