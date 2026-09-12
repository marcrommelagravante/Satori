"use client";

import * as React from "react";
import { Layers, FileText, Hash, Bookmark } from "lucide-react";
import type { DocumentChunk } from "@/lib/db/schema";

interface ChunkViewerProps {
  extractedText: string | null;
  chunks: DocumentChunk[];
}

export function ChunkViewer({ extractedText, chunks }: ChunkViewerProps) {
  const [activeTab, setActiveTab] = React.useState<"chunks" | "text">("chunks");

  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("chunks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "chunks"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Chunks ({chunks.length})
          </button>

          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Raw Extracted Text
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          {activeTab === "chunks"
            ? `${chunks.length} structured segments ready for vector search`
            : `${extractedText?.length || 0} characters`}
        </span>
      </div>

      {activeTab === "chunks" ? (
        chunks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No chunks generated yet. Process this document to partition it into retrieval chunks.
          </div>
        ) : (
          <div className="space-y-3">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2.5 transition-all hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Chunk #{chunk.chunkIndex + 1}
                    </span>

                    {chunk.pageNumber && (
                      <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground text-[11px]">
                        Page {chunk.pageNumber}
                      </span>
                    )}

                    {chunk.section && (
                      <span className="rounded bg-secondary/15 text-secondary px-2 py-0.5 text-[11px] font-medium flex items-center gap-1">
                        <Bookmark className="h-2.5 w-2.5" />
                        {chunk.section}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    ~{chunk.tokenEstimate} tokens &bull; {chunk.content.length} chars
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono bg-muted/20 p-3 rounded-lg border border-border/40">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <pre className="text-xs leading-relaxed text-foreground font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {extractedText || "No text extracted."}
          </pre>
        </div>
      )}
    </div>
  );
}
