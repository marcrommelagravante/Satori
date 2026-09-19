"use client";

import * as React from "react";
import {
  Search,
  FolderLock,
  Code2,
  BarChart3,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { searchKnowledgeAction } from "@/app/actions/knowledge";
import type { ScoredChunk } from "@/lib/rag";
import { ChunkInspector, type InspectChunk } from "@/app/(dashboard)/knowledge/chunk-inspector";
import { BackfillButton } from "@/app/(dashboard)/knowledge/backfill-button";
import Link from "next/link";

interface KnowledgeHubViewProps {
  workspaceId: string;
  workspaceName: string;
  totalChunks: number;
  embeddedChunks: number;
  ftsChunks: number;
  unindexedCount: number;
  readyDocs: number;
  inspectChunks: InspectChunk[];
  initialQuery?: string;
}

export function KnowledgeHubView({
  workspaceId,
  totalChunks,
  embeddedChunks,
  ftsChunks,
  unindexedCount,
  readyDocs,
  inspectChunks,
  initialQuery = "",
}: KnowledgeHubViewProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<ScoredChunk[] | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);

  const topicChips = [
    "Company policies",
    "Employee handbook",
    "Technical docs",
    "Q3 reports",
    "HR guidelines",
  ];

  const categories = [
    {
      id: "policies",
      name: "Policies & Procedures",
      count: "24 documents",
      query: "company policies rules compliance procedures",
      icon: FolderLock,
      iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    },
    {
      id: "technical",
      name: "Technical Documentation",
      count: "32 documents",
      query: "technical documentation architecture API specification",
      icon: Code2,
      iconBg: "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      count: "18 documents",
      query: "quarterly financial report performance analytics metrics",
      icon: BarChart3,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "general",
      name: "General Knowledge",
      count: "12 documents",
      query: "general overview onboarding guide notes",
      icon: Lightbulb,
      iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    },
  ];

  async function executeSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchKnowledgeAction({
        workspaceId,
        query: searchQuery,
        topK: 6,
        mode: "hybrid",
      });
      if (res.success && res.chunks) {
        setResults(res.chunks);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
    setActiveCategory(null);
    executeSearch(topic);
  };

  const handleCategoryClick = (cat: (typeof categories)[0]) => {
    setActiveCategory(cat.id);
    setQuery(cat.name);
    executeSearch(cat.query);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" data-density="medium">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Knowledge Hub
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Search, explore, and discover insights from your knowledge base.
        </p>
      </div>

      {/* Central Search Bar Hero matching Mockup Panel 3 */}
      <div className="max-w-2xl mx-auto space-y-3 pt-2">
        <form onSubmit={handleFormSubmit} className="relative flex items-center shadow-xs">
          <input
            type="text"
            placeholder="Ask a question or search for information..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-4 pr-14 text-sm rounded-[8px] bg-card border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-[6px] bg-primary hover:bg-primary-dark text-primary-foreground transition-all shadow-xs disabled:opacity-50"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {topicChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleTopicClick(chip)}
              className="rounded-full bg-card border border-border/80 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50 transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Area */}
      {results !== null && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Search Results ({results.length})
            </h2>
            <button
              onClick={() => setResults(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          {results.length === 0 ? (
            <div className="rounded-[10px] border border-border/80 bg-card p-6 text-center text-xs text-muted-foreground">
              No matching knowledge segments found for &quot;{query}&quot;. Try a broader keyword or add more documents.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {r.documentName}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        Score: {(r.rrfScore ?? r.similarityScore).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {r.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono">
                      {r.pageNumber ? `Page ${r.pageNumber}` : "Section 1"}
                    </span>
                    <Link
                      href={`/chat?ws=${workspaceId}&q=${encodeURIComponent(
                        `Based on ${r.documentName}: ${query}`
                      )}`}
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Ask in Chat</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse by category matching Mockup Panel 3 */}
      <div className="space-y-4 pt-2">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Browse by category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`rounded-[10px] border text-left p-4 bg-card shadow-2xs transition-all flex flex-col justify-between hover:border-primary/50 group cursor-pointer ${
                  isSelected ? "border-primary ring-2 ring-primary/10" : "border-border/80"
                }`}
              >
                <div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-[8px] mb-3 transition-transform group-hover:scale-105 ${cat.iconBg}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-heading text-xs font-semibold text-foreground mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{cat.count}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-end">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Retrieval Diagnostics & Chunk Inspector */}
      <div className="pt-4 border-t border-border/60">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{showDiagnostics ? "Hide" : "Show"} Retrieval Diagnostics & Vector Index</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              showDiagnostics ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDiagnostics && (
          <div className="mt-4 space-y-6 animate-in fade-in-50 duration-150">
            {/* Vector & FTS Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-[8px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] text-muted-foreground">Total Chunks</span>
                <div className="text-xl font-bold font-mono text-foreground mt-1">
                  {totalChunks}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Across {readyDocs} ready documents
                </p>
              </div>

              <div className="rounded-[8px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] text-muted-foreground">Vector Embedded</span>
                <div className="text-xl font-bold font-mono text-foreground mt-1">
                  {embeddedChunks}
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {totalChunks > 0
                    ? `${Math.round((embeddedChunks / totalChunks) * 100)}% indexed`
                    : "No chunks yet"}
                </p>
              </div>

              <div className="rounded-[8px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] text-muted-foreground">FTS tsvector</span>
                <div className="text-xl font-bold font-mono text-foreground mt-1">
                  {ftsChunks}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">GIN indexed</p>
              </div>

              <div className="rounded-[8px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] text-muted-foreground">Fusion Strategy</span>
                <div className="text-xl font-bold font-mono text-foreground mt-1">RRF</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">k = 60 reciprocal rank</p>
              </div>
            </div>

            {unindexedCount > 0 && (
              <div className="rounded-[8px] border border-warning/30 bg-warning/10 p-3.5 flex items-center justify-between text-xs">
                <span>
                  {unindexedCount} chunks pending vector embedding.
                </span>
                <BackfillButton workspaceId={workspaceId} unindexedCount={unindexedCount} />
              </div>
            )}

            <ChunkInspector chunks={inspectChunks} />
          </div>
        )}
      </div>
    </div>
  );
}
