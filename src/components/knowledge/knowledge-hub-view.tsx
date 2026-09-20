"use client";

import * as React from "react";
import {
  Search,
  FolderLock,
  Code2,
  BarChart3,
  Lightbulb,
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
  categoryCounts: {
    policies: number;
    technical: number;
    reports: number;
    general: number;
  };
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
  categoryCounts,
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
      query: "company policies rules compliance procedures guidelines handbook",
      icon: FolderLock,
      iconBg:
        "bg-blue-50 text-blue-500 border border-blue-100/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    },
    {
      id: "technical",
      name: "Technical Documentation",
      query: "technical documentation architecture API specification engineering code",
      icon: Code2,
      iconBg:
        "bg-purple-50 text-purple-600 border border-purple-100/60 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30",
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      query: "quarterly financial report performance analytics metrics finance",
      icon: BarChart3,
      iconBg:
        "bg-emerald-50 text-emerald-600 border border-emerald-100/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
    },
    {
      id: "general",
      name: "General Knowledge",
      query: "general overview onboarding guide notes plan information",
      icon: Lightbulb,
      iconBg:
        "bg-amber-50 text-amber-600 border border-amber-100/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
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
    <div className="space-y-8 w-full pb-12" data-density="medium">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
          Knowledge Hub
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-1">
          Search, explore, and discover insights from your knowledge base.
        </p>
      </div>

      {/* Central Search Bar Hero matching Image 1 */}
      <div className="w-full max-w-5xl mx-auto space-y-3 pt-2">
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-2 shadow-xs transition-all focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/10"
        >
          <Search className="h-5 w-5 text-slate-400 dark:text-muted-foreground ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Ask a question or search for information..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-11 bg-transparent text-xs md:text-sm text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-none px-3"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {topicChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleTopicClick(chip)}
              className="rounded-full bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground hover:border-[#4F46E5]/40 hover:bg-slate-50 dark:hover:bg-muted/50 transition-all shadow-2xs cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Area */}
      {results !== null && (
        <div className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
              Search Results ({results.length})
            </h2>
            <button
              onClick={() => {
                setResults(null);
                setQuery("");
                setActiveCategory(null);
              }}
              className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-8 text-center text-xs text-slate-500 dark:text-muted-foreground shadow-xs">
              No matching knowledge segments found for &quot;{query}&quot;. Try a broader keyword or add more documents.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs hover:border-[#4F46E5]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-slate-800 dark:text-foreground truncate max-w-[240px]">
                        {r.documentName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-muted-foreground bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full shrink-0">
                        Score: {(r.rrfScore ?? r.similarityScore).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-3 leading-relaxed">
                      {r.content}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-border/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-muted-foreground">
                    <span className="font-mono">
                      {r.pageNumber ? `Page ${r.pageNumber}` : "Section 1"}
                    </span>
                    <Link
                      href={`/chat?ws=${workspaceId}&q=${encodeURIComponent(
                        `Based on ${r.documentName}: ${query}`
                      )}`}
                      className="text-[#4F46E5] hover:text-[#4338CA] dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
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

      {/* Browse by category matching Image 1 */}
      <div className="space-y-4 pt-2">
        <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
          Browse by category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id as keyof typeof categoryCounts] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`rounded-2xl border text-left p-6 bg-white dark:bg-card shadow-xs transition-all flex flex-col justify-between hover:border-[#4F46E5]/40 hover:shadow-sm group cursor-pointer ${
                  isSelected
                    ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10"
                    : "border-slate-200/80 dark:border-border/80"
                }`}
              >
                <div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-105 ${cat.iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground mb-1 leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-muted-foreground font-normal">
                    {count === 1 ? "1 document" : `${count} documents`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Retrieval Diagnostics & Chunk Inspector */}
      <div className="pt-6 border-t border-slate-200/70 dark:border-border/60">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-2 transition-colors cursor-pointer"
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
              <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground">Total Chunks</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-foreground mt-1">
                  {totalChunks}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-muted-foreground mt-0.5">
                  Across {readyDocs} ready documents
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground">Vector Embedded</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-foreground mt-1">
                  {embeddedChunks}
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {totalChunks > 0
                    ? `${Math.round((embeddedChunks / totalChunks) * 100)}% indexed`
                    : "No chunks yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground">FTS tsvector</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-foreground mt-1">
                  {ftsChunks}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-muted-foreground mt-0.5">GIN indexed</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4 shadow-xs">
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground">Fusion Strategy</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-foreground mt-1">RRF</div>
                <p className="text-[10px] text-slate-400 dark:text-muted-foreground mt-0.5">k = 60 reciprocal rank</p>
              </div>
            </div>

            {unindexedCount > 0 && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center justify-between text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-medium">
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
