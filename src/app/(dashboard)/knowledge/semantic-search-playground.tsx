"use client";

import * as React from "react";
import { Search, Sparkles, FileText, Code2, AlertCircle, Copy, Check, SlidersHorizontal, BookOpen, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { searchKnowledgeAction } from "@/app/actions/knowledge";
import type { ScoredChunk } from "@/lib/rag/retrieval";

interface SemanticSearchPlaygroundProps {
  workspaceId: string;
  workspaceName: string;
  hasIndexedChunks: boolean;
}

const EXAMPLE_QUERIES = [
  "What are the membership rights and voting privileges?",
  "What is the code of conduct policy?",
  "Who are the governance officers?",
  "What are the guidelines for document intelligence?",
];

export function SemanticSearchPlayground({
  workspaceId,
  workspaceName,
  hasIndexedChunks,
}: SemanticSearchPlaygroundProps) {
  const [query, setQuery] = React.useState("");
  const [topK, setTopK] = React.useState(5);
  const [threshold, setThreshold] = React.useState(0.5);
  const [showOptions, setShowOptions] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<ScoredChunk[] | null>(null);
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const [rawContext, setRawContext] = React.useState<string | null>(null);
  const [showContextModal, setShowContextModal] = React.useState(false);
  const [copiedContext, setCopiedContext] = React.useState(false);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);

    try {
      const res = await searchKnowledgeAction({
        workspaceId,
        query: searchQuery.trim(),
        topK,
        similarityThreshold: threshold,
      });

      if (res.error) {
        setError(res.error);
        setResults(null);
      } else if (res.success) {
        setResults(res.chunks || []);
        setLatencyMs(res.latencyMs || 0);
        setRawContext(res.context || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search request failed");
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCopyContext = () => {
    if (!rawContext) return;
    navigator.clipboard.writeText(rawContext);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Card */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Semantic Retrieval Playground
              </CardTitle>
              <CardDescription className="text-xs">
                Query document embeddings using cosine similarity inside PostgreSQL pgvector.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs h-8 gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showOptions ? "Hide Options" : "Parameters"}
            </Button>
          </div>

          {showOptions && (
            <div className="pt-4 mt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Top-K Chunks</span>
                  <span className="font-mono text-primary">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 (narrow)</span>
                  <span>5 (default)</span>
                  <span>10 (broad)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Min Similarity Threshold</span>
                  <span className="font-mono text-primary">{(threshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>10% (fuzzy)</span>
                  <span>50% (balanced)</span>
                  <span>90% (strict)</span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or enter keywords to retrieve relevant chunks..."
                className="pl-10 h-10 text-sm bg-background"
                disabled={isSearching}
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="h-10 px-5 gap-2"
            >
              {isSearching ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Chunks
                </>
              )}
            </Button>
          </div>

          {/* Preset queries */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">
              Examples:
            </span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  handleSearch(q);
                }}
                className="text-[11px] rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Search Failed</p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Retrieved Results ({results.length})
              </h3>
              {latencyMs !== null && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  {latencyMs}ms latency
                </span>
              )}
            </div>
            {rawContext && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContextModal(true)}
                className="text-xs h-8 gap-1.5"
              >
                <Code2 className="h-3.5 w-3.5 text-primary" />
                View Assembled Context (XML)
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm font-medium text-foreground">No matching chunks found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No chunks in workspace <strong>{workspaceName}</strong> met the minimum similarity cutoff ({(threshold * 100).toFixed(0)}%).
                Try lowering the threshold or uploading relevant documents.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((chunk, idx) => {
                const simPercent = Math.round(chunk.similarityScore * 100);
                const scoreVariant =
                  chunk.similarityScore >= 0.7
                    ? "success"
                    : chunk.similarityScore >= 0.55
                    ? "ai"
                    : "warning";

                return (
                  <div
                    key={chunk.chunkId}
                    className="rounded-xl border border-border bg-card hover:border-primary/40 transition-colors p-4 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-xs font-mono font-bold text-foreground">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span>{chunk.documentName}</span>
                        </div>
                        {chunk.pageNumber !== null && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            Page {chunk.pageNumber}
                          </Badge>
                        )}
                        {chunk.section && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 max-w-[200px] truncate">
                            {chunk.section}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ~{chunk.tokenEstimate || Math.ceil(chunk.content.length / 4)} tokens
                        </span>
                        <Badge variant={scoreVariant} className="font-mono text-xs px-2 py-0.5">
                          {simPercent}% match
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 font-mono bg-muted/30 p-3 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                      <span className="font-mono text-muted-foreground/70">
                        ID: {chunk.chunkId.slice(0, 8)}... | Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <span className="font-mono">
                        Cosine Distance: {chunk.distance.toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assembled RAG Context Modal / Drawer */}
      {showContextModal && rawContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Assembled RAG Context (XML)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContext}
                  className="h-7 text-xs gap-1"
                >
                  {copiedContext ? (
                    <>
                      <Check className="h-3 w-3 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContextModal(false)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <pre className="text-xs font-mono bg-muted/40 p-4 rounded-xl border border-border overflow-x-auto text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {rawContext}
              </pre>
            </div>

            <div className="border-t border-border px-5 py-3 bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
              <span>
                Formatted for Gemini 3.8 Flash grounding with structured citation attributes.
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowContextModal(false)}
                className="text-xs h-7"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
