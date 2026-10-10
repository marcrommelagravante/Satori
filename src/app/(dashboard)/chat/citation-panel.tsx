"use client";

import { useState, useMemo } from "react";
import { CitationDetail } from "@/lib/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  BookOpen,
  ExternalLink,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface CitationPanelProps {
  citations: CitationDetail[];
  selectedCitationId: string | null;
  onSelectCitation: (id: string) => void;
  onClose: () => void;
  activeQuery?: string;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have",
  "what", "when", "where", "which", "who", "whom", "whose", "why",
  "how", "all", "any", "both", "each", "few", "more", "most", "some",
  "such", "are", "were", "been", "being", "will", "would", "shall",
  "should", "can", "could", "may", "might", "must", "give", "tell",
  "show", "attached", "document", "file", "please", "about"
]);

export function CitationPanel({
  citations,
  selectedCitationId,
  onSelectCitation,
  onClose,
  activeQuery = "",
}: CitationPanelProps) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);

  if (citations.length === 0) return null;

  const activeCitation =
    citations.find((c) => c.id === selectedCitationId) || citations[0];

  const scorePercent = activeCitation?.relevanceScore
    ? Math.round(activeCitation.relevanceScore * 100)
    : null;

  const rawContent = activeCitation?.contentSnippet || "";
  const wordCount = rawContent ? rawContent.trim().split(/\s+/).length : 0;
  const isLongContent = rawContent.length > 380;

  // Extract meaningful query keywords for smart term highlighting
  const queryKeywords = useMemo(() => {
    if (!activeQuery.trim()) return [];
    return activeQuery
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  }, [activeQuery]);

  const handleCopySnippet = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyChunkId = () => {
    if (!activeCitation?.chunkId) return;
    navigator.clipboard.writeText(activeCitation.chunkId);
    setCopiedChunkId(true);
    setTimeout(() => setCopiedChunkId(false), 2000);
  };

  // Helper to render text with optional keyword highlights
  const renderHighlightedContent = (text: string) => {
    if (!highlightsEnabled || queryKeywords.length === 0) {
      return (
        <div className="space-y-2">
          {text.split(/\n\n+/).map((para, pIdx) => (
            <p key={pIdx} className="leading-[1.7] text-slate-800 dark:text-slate-200">
              {para.split("\n").map((line, lIdx) => (
                <span key={lIdx} className="block">
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>
      );
    }

    // Build regex from query keywords
    const escapedTerms = queryKeywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const regex = new RegExp(`(${escapedTerms})`, "gi");

    return (
      <div className="space-y-2">
        {text.split(/\n\n+/).map((para, pIdx) => (
          <p key={pIdx} className="leading-[1.7] text-slate-800 dark:text-slate-200">
            {para.split("\n").map((line, lIdx) => {
              const parts = line.split(regex);
              return (
                <span key={lIdx} className="block">
                  {parts.map((part, idx) => {
                    if (regex.test(part)) {
                      return (
                        <mark
                          key={idx}
                          className="bg-violet-100 dark:bg-violet-900/50 text-[#7C3AED] dark:text-violet-200 px-1 py-0.2 rounded-sm font-medium"
                        >
                          {part}
                        </mark>
                      );
                    }
                    return part;
                  })}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="fixed top-0 bottom-0 right-0 w-[420px] max-w-[92vw] bg-white dark:bg-card border-l border-slate-200/80 dark:border-border/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-border/80 flex items-center justify-between bg-slate-50/70 dark:bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#7C3AED] dark:text-violet-400 flex items-center justify-center shadow-2xs border border-violet-200/60 dark:border-violet-800/40">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Source Attributions
              </h2>
              <p className="text-xs text-muted-foreground">
                {citations.length} verified ground truth source{citations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close citations"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Multi-source switcher tabs */}
        {citations.length > 1 && (
          <div className="px-4 py-2 border-b border-border flex gap-1.5 overflow-x-auto bg-slate-50/40 dark:bg-muted/10 scrollbar-none">
            {citations.map((c, idx) => {
              const isSelected = c.id === activeCitation.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCitation(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#7C3AED] text-white shadow-xs"
                      : "bg-white dark:bg-card text-muted-foreground hover:text-foreground border border-slate-200 dark:border-border"
                  }`}
                >
                  <span>Source {c.rank || idx + 1}</span>
                  {c.relevanceScore && (
                    <span className="opacity-80 text-[10px] font-mono">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm">
            {/* Document metadata card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-border/80 bg-slate-50/50 dark:bg-muted/20 p-4 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4.5 w-4.5 text-[#4F46E5] shrink-0" />
                  <span className="font-semibold text-xs sm:text-[13px] text-slate-900 dark:text-foreground truncate" title={activeCitation.documentName || "Workspace Document"}>
                    {activeCitation.documentName || "Workspace Document"}
                  </span>
                </div>
                {scorePercent !== null && (
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold shrink-0 ${
                      scorePercent >= 70
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : "border-violet-500/30 text-[#7C3AED] dark:text-violet-400 bg-violet-500/10"
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
                    <span className="bg-white dark:bg-card border border-slate-200/70 dark:border-border px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                      Page {activeCitation.pageNumber}
                    </span>
                  )}
                {activeCitation.section && (
                  <span className="bg-white dark:bg-card border border-slate-200/70 dark:border-border px-2 py-0.5 rounded-md truncate max-w-[200px] font-medium text-slate-700 dark:text-slate-300">
                    {activeCitation.section}
                  </span>
                )}
                <span className="bg-white dark:bg-card border border-slate-200/70 dark:border-border px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                  Rank #{activeCitation.rank}
                </span>
              </div>

              {activeCitation.documentId && (
                <div className="pt-0.5">
                  <Link
                    href={`/documents/${activeCitation.documentId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <span>Open original document</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Exact source passage with proportional typography & actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-foreground tracking-wide uppercase">
                    Exact Source Passage
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {wordCount} words · {rawContent.length} characters
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Highlights toggle */}
                  {queryKeywords.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHighlightsEnabled(!highlightsEnabled)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        highlightsEnabled
                          ? "bg-violet-50 dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-300 border-violet-200 dark:border-violet-800"
                          : "bg-white dark:bg-card text-slate-500 border-slate-200 dark:border-border"
                      }`}
                      title="Toggle query term highlights"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Highlights</span>
                    </button>
                  )}

                  {/* Copy passage button */}
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-border bg-white dark:bg-card text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted transition-colors cursor-pointer"
                    title="Copy passage to clipboard"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Passage text reading container */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card/70 p-4 sm:p-4.5 text-[13.5px] font-sans shadow-2xs relative">
                <div
                  className={`transition-all duration-200 ${
                    isLongContent && !isExpanded
                      ? "max-h-64 overflow-hidden relative"
                      : "max-h-[500px] overflow-y-auto"
                  }`}
                >
                  {rawContent ? (
                    renderHighlightedContent(rawContent)
                  ) : (
                    <p className="text-muted-foreground italic text-xs">
                      No content snippet available for this citation.
                    </p>
                  )}

                  {/* Fade mask when truncated */}
                  {isLongContent && !isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-card to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Show full passage / Show less toggle */}
                {isLongContent && (
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-border/60 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] dark:text-violet-400 hover:underline cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          <span>Show less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>Show full passage ({wordCount} words)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Chunk Grounding Card */}
            <div className="rounded-2xl border border-dashed border-violet-200/80 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 p-3.5 text-xs text-slate-800 dark:text-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] dark:text-violet-400" />
                  Verified Chunk Grounding
                </p>
                <button
                  type="button"
                  onClick={handleCopyChunkId}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy full Chunk ID"
                >
                  {copiedChunkId ? (
                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  <span>{copiedChunkId ? "Copied" : "Copy ID"}</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Indexed in PostgreSQL via Neon pgvector. Chunk ID:{" "}
                <code className="text-[10px] font-mono bg-white dark:bg-card px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-border">
                  {activeCitation.chunkId}
                </code>
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
