"use client";

import { CitationDetail } from "@/lib/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, BookOpen, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CitationPanelProps {
  citations: CitationDetail[];
  selectedCitationId: string | null;
  onSelectCitation: (id: string) => void;
  onClose: () => void;
}

export function CitationPanel({
  citations,
  selectedCitationId,
  onSelectCitation,
  onClose,
}: CitationPanelProps) {
  if (citations.length === 0) return null;

  const activeCitation =
    citations.find((c) => c.id === selectedCitationId) || citations[0];

  const scorePercent = activeCitation?.relevanceScore
    ? Math.round(activeCitation.relevanceScore * 100)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="fixed top-0 bottom-0 right-0 w-96 max-w-[88vw] bg-white dark:bg-card border-l border-slate-200/80 dark:border-border/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-muted/10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Source Attributions
            </h2>
            <p className="text-xs text-muted-foreground">
              {citations.length} verifiable source{citations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Close citations"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Citation source switcher tabs if multiple sources */}
      {citations.length > 1 && (
        <div className="p-2 border-b border-border flex gap-1.5 overflow-x-auto bg-muted/10">
          {citations.map((c, idx) => {
            const isSelected = c.id === activeCitation.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCitation(c.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <span>Source {c.rank || idx + 1}</span>
                {c.relevanceScore && (
                  <span className="opacity-80 text-[10px]">
                    {Math.round(c.relevanceScore * 100)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Citation Detail Content */}
      {activeCitation && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Document metadata card */}
          <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">
                  {activeCitation.documentName || "Workspace Document"}
                </span>
              </div>
              {scorePercent !== null && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${
                    scorePercent >= 70
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      : "border-secondary/30 text-secondary bg-secondary/10"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {scorePercent}% match
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
              {activeCitation.pageNumber !== null &&
                activeCitation.pageNumber !== undefined && (
                  <span className="bg-muted px-2 py-0.5 rounded-md">
                    Page {activeCitation.pageNumber}
                  </span>
                )}
              {activeCitation.section && (
                <span className="bg-muted px-2 py-0.5 rounded-md truncate max-w-[200px]">
                  {activeCitation.section}
                </span>
              )}
              <span className="bg-muted px-2 py-0.5 rounded-md">
                Rank #{activeCitation.rank}
              </span>
            </div>

            {activeCitation.documentId && (
              <div className="pt-1">
                <Link
                  href={`/documents/${activeCitation.documentId}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <span>Open original document</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Exact source excerpt */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exact Source Content
            </h3>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {activeCitation.contentSnippet || "No content snippet available"}
            </div>
          </div>

          {/* Verification note */}
          <div className="rounded-xl border border-dashed border-border bg-accent/40 p-3 text-xs text-accent-foreground space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
              Verified Chunk Grounding
            </p>
            <p className="text-[11px] text-muted-foreground">
              This citation was matched against your Neon pgvector document chunk index (Chunk ID:{" "}
              <code className="text-[10px] bg-background px-1 py-0.5 rounded">
                {activeCitation.chunkId.slice(0, 8)}...
              </code>
              ).
            </p>
          </div>
        </div>
      )}
    </aside>
  </>
);
}
