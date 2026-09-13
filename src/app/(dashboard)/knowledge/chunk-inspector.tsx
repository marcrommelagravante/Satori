"use client";

import * as React from "react";
import { FileText, Layers, Search, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface InspectChunk {
  id: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  section: string | null;
  tokenEstimate: number | null;
  hasEmbedding: boolean;
}

export function ChunkInspector({ chunks }: { chunks: InspectChunk[] }) {
  const [filterText, setFilterText] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filteredChunks = React.useMemo(() => {
    if (!filterText.trim()) return chunks;
    const lower = filterText.toLowerCase();
    return chunks.filter(
      (c) =>
        c.content.toLowerCase().includes(lower) ||
        c.documentName.toLowerCase().includes(lower) ||
        (c.section && c.section.toLowerCase().includes(lower))
    );
  }, [chunks, filterText]);

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Indexed Chunks Catalog
            </CardTitle>
            <CardDescription className="text-xs">
              Direct inspection of chunk segments and vector presence in PostgreSQL.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by keyword or doc..."
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {filteredChunks.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            {chunks.length === 0
              ? "No chunks have been generated yet. Upload and process documents to see them here."
              : "No chunks match your filter criteria."}
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredChunks.map((chunk) => {
              const isExpanded = expandedId === chunk.id;
              return (
                <div
                  key={chunk.id}
                  className="rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/30 transition-colors p-3 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {chunk.documentName}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        Chunk #{chunk.chunkIndex + 1}
                      </span>
                      {chunk.pageNumber !== null && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          p.{chunk.pageNumber}
                        </Badge>
                      )}
                      {chunk.section && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 max-w-[160px] truncate">
                          {chunk.section}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {chunk.hasEmbedding ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          768d Vector
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          No Vector
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ~{chunk.tokenEstimate} tok
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : chunk.id)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p
                    className={`font-mono text-muted-foreground leading-relaxed transition-all ${
                      isExpanded
                        ? "whitespace-pre-wrap bg-background p-2.5 rounded-md border border-border"
                        : "line-clamp-2"
                    }`}
                  >
                    {chunk.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
