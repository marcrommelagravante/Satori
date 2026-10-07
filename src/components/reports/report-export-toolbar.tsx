"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Copy,
  Check,
  FileDown,
} from "lucide-react";

export interface ReportExportData {
  id: string;
  title: string;
  type: string;
  createdAt: string | Date;
  status: string;
  sourceDocs: { id: string; name: string; category?: string | null }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export function ReportExportToolbar({ report }: { report: ReportExportData }) {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = (): string => {
    const { title, type, createdAt, status, sourceDocs, content } = report;
    const dateStr = new Date(createdAt).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const lines: string[] = [];
    lines.push(`# ${title}`);
    lines.push("");
    lines.push(`> **Platform:** Satori Document Intelligence`);
    lines.push(`> **Generated:** ${dateStr} | **Type:** ${type} | **Status:** ${status}`);
    lines.push("");

    if (sourceDocs && sourceDocs.length > 0) {
      lines.push("## Referenced Source Documents");
      for (const doc of sourceDocs) {
        lines.push(`- **${doc.name}** (${doc.category || "General"})`);
      }
      lines.push("");
    }

    const summaryText = content.executiveSummary || content.summary;
    if (summaryText) {
      lines.push("## Executive Summary");
      lines.push(summaryText);
      lines.push("");
    }

    if (Array.isArray(content.keyFindings) && content.keyFindings.length > 0) {
      lines.push("## Key Findings");
      for (const finding of content.keyFindings) {
        lines.push(`- ${finding}`);
      }
      lines.push("");
    }

    if (Array.isArray(content.keyDifferences) && content.keyDifferences.length > 0) {
      lines.push("## Key Differences");
      for (const diff of content.keyDifferences) {
        lines.push(`- ${diff}`);
      }
      lines.push("");
    }

    if (Array.isArray(content.sections) && content.sections.length > 0) {
      lines.push("## Detailed Analysis");
      for (const sec of content.sections) {
        lines.push(`### ${sec.title}`);
        lines.push(sec.content);
        lines.push("");
      }
    }

    if (Array.isArray(content.comparisonMatrix) && content.comparisonMatrix.length > 0) {
      lines.push("## Comparative Matrix");
      lines.push("| Dimension / Topic | Document A | Document B | Importance |");
      lines.push("| :--- | :--- | :--- | :---: |");
      for (const row of content.comparisonMatrix) {
        lines.push(
          `| ${row.topic.replace(/\|/g, "-")} | ${row.documentA.replace(/\|/g, "-")} | ${row.documentB.replace(/\|/g, "-")} | ${row.importance || "medium"} |`
        );
      }
      lines.push("");
    }

    if (Array.isArray(content.recommendations) && content.recommendations.length > 0) {
      lines.push("## Recommendations & Next Steps");
      for (const rec of content.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = report.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.download = `${slug || "satori-report"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const summaryText =
      report.content.executiveSummary ||
      report.content.summary ||
      report.title;
    const findings = Array.isArray(report.content.keyFindings)
      ? report.content.keyFindings.join("\n• ")
      : "";

    const textToCopy = `${report.title}\n\nExecutive Summary:\n${summaryText}${
      findings ? `\n\nKey Findings:\n• ${findings}` : ""
    }`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy report summary:", err);
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-2 print-hide">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopySummary}
        className="gap-1.5 text-xs rounded-xl shadow-2xs hover:bg-muted cursor-pointer"
        title="Copy executive summary to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Copy Summary</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-1.5 text-xs rounded-xl shadow-2xs hover:bg-muted cursor-pointer"
        title="Print or Save as PDF via browser"
      >
        <Printer className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Print / PDF</span>
      </Button>

      <Button
        type="button"
        size="sm"
        onClick={handleDownloadMarkdown}
        className="gap-1.5 text-xs rounded-xl bg-primary hover:bg-primary/90 text-white shadow-2xs cursor-pointer"
        title="Download structured Markdown file"
      >
        <FileDown className="h-3.5 w-3.5" />
        <span>Export Markdown</span>
      </Button>
    </div>
  );
}
