import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { db } from "@/lib/db";
import { reports, documents } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Scale,
  Calendar,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);

  if (!report) {
    notFound();
  }

  // Security guard: verify user has access to report's workspace
  await requireWorkspaceMember(report.workspaceId, "member");

  // Fetch source documents if specified
  const sourceDocs =
    report.sourceDocumentIds && report.sourceDocumentIds.length > 0
      ? await db
          .select({
            id: documents.id,
            name: documents.name,
            category: documents.category,
          })
          .from(documents)
          .where(inArray(documents.id, report.sourceDocumentIds))
      : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = report.content as any;

  const isComparison =
    report.type === "document_comparison" || content?.format === "comparison";
  const isAnalysis =
    content?.format === "analysis" ||
    (!isComparison && report.title.toLowerCase().includes("analysis"));
  const TypeIcon = isComparison ? Scale : isAnalysis ? Sparkles : FileSpreadsheet;
  const badgeLabel = isComparison
    ? "Document Comparison"
    : isAnalysis
    ? "Deep Analysis"
    : "Executive Summary";
  const badgeClass = isComparison
    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    : isAnalysis
    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    : "bg-amber-500/10 text-amber-500 border-amber-500/20";

  return (
    <div className="w-full space-y-6 md:space-y-8 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/reports">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Reports</span>
          </Link>
        </Button>

        {report.conversationId && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={`/chat?conv=${report.conversationId}`}>
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>View Conversation</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`gap-1.5 px-3 py-1 text-xs font-semibold ${badgeClass}`}
          >
            <TypeIcon className="h-3.5 w-3.5" />
            <span>{badgeLabel}</span>
          </Badge>

          <Badge
            variant="outline"
            className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            {report.status}
          </Badge>

          {content?.generationSource && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1 font-mono text-[11px]"
            >
              <Sparkles className="h-3 w-3" />
              <span>{content.generationSource}</span>
            </Badge>
          )}

          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(report.createdAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {report.title}
        </h1>

        {/* Source Documents */}
        {sourceDocs.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Source Documents Analyzed:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sourceDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1 text-xs text-foreground border border-border hover:border-primary/40 transition-colors shadow-2xs"
                >
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="font-medium">{doc.name}</span>
                  {doc.category && (
                    <span className="text-[10px] text-muted-foreground">
                      ({doc.category})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Report Body */}
      <div className="space-y-6">
        {/* Document Summary Rendering */}
        {!isComparison && (
          <>
            {/* Executive Summary */}
            {(content.summary || content.executiveSummary) && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Executive Summary
                  </h2>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {content.summary || content.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Findings */}
            {Array.isArray(content.keyFindings) &&
              content.keyFindings.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Key Findings
                  </h2>
                  <div className="grid gap-2.5">
                    {content.keyFindings.map((finding: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-background/60 p-3.5 border border-border/40 text-sm leading-relaxed"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Sections */}
            {Array.isArray(content.sections) &&
              content.sections.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3"
                >
                  <h2 className="text-base font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
          </>
        )}

        {/* Document Comparison Rendering */}
        {isComparison && (
          <>
            {/* Executive Summary */}
            {content.executiveSummary && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Scale className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Comparison Overview
                  </h2>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {content.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Differences */}
            {Array.isArray(content.keyDifferences) &&
              content.keyDifferences.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Key Differences & Discrepancies
                  </h2>
                  <div className="grid gap-2.5">
                    {content.keyDifferences.map((diff: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-background/60 p-3.5 border border-border/40 text-sm leading-relaxed"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground">{diff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Comparison Matrix */}
            {Array.isArray(content.comparisonMatrix) &&
              content.comparisonMatrix.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    Comparative Matrix
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border text-foreground font-semibold">
                          <th className="p-3 w-1/4">Topic / Dimension</th>
                          <th className="p-3 w-1/3">Document A</th>
                          <th className="p-3 w-1/3">Document B</th>
                          <th className="p-3 text-center">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {content.comparisonMatrix.map(
                          (row: any, idx: number) => (
                            <tr
                              key={idx}
                              className="hover:bg-accent/20 transition-colors"
                            >
                              <td className="p-3 font-semibold text-foreground align-top">
                                {row.topic}
                              </td>
                              <td className="p-3 text-muted-foreground align-top leading-relaxed">
                                {row.documentA}
                              </td>
                              <td className="p-3 text-muted-foreground align-top leading-relaxed">
                                {row.documentB}
                              </td>
                              <td className="p-3 text-center align-top">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                                    row.importance === "high"
                                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                                      : row.importance === "low"
                                      ? "bg-muted text-muted-foreground border-border"
                                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  }`}
                                >
                                  {row.importance || "medium"}
                                </Badge>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Recommendations */}
            {Array.isArray(content.recommendations) &&
              content.recommendations.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-secondary" />
                    Recommendations & Next Steps
                  </h2>
                  <div className="grid gap-2">
                    {content.recommendations.map(
                      (rec: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl bg-background/60 p-3 border border-border/40 text-sm text-foreground"
                        >
                          <span className="text-secondary font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
