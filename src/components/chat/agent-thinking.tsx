"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Search,
  FileText,
  Layers,
  Scale,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { type AgentToolCallLog } from "@/lib/ai/agent";

interface AgentThinkingProps {
  isLoading?: boolean;
  toolCalls?: AgentToolCallLog[];
  reportId?: string;
}

const TOOL_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  searchDocuments: {
    label: "Search",
    icon: Search,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  getDocument: {
    label: "Read Doc",
    icon: FileText,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  getRelevantChunks: {
    label: "Inspect Chunks",
    icon: Layers,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  summarizeDocument: {
    label: "Summarize",
    icon: FileSpreadsheet,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  compareDocuments: {
    label: "Compare",
    icon: Scale,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
  createReport: {
    label: "Generate Report",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
};

export function AgentThinking({
  isLoading,
  toolCalls = [],
  reportId,
}: AgentThinkingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isLoading && (!toolCalls || toolCalls.length === 0) && !reportId) {
    return null;
  }

  return (
    <div className="my-2 space-y-2">
      {/* Real-time thinking animation or completed execution summary */}
      <div className="rounded-xl border border-border bg-card/60 p-3 text-xs shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-lg ${
                isLoading
                  ? "bg-primary/20 text-primary animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Sparkles className="h-3 w-3" />
            </div>

            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>
                {isLoading ? "Agent reasoning in progress..." : "Agent Workflow"}
              </span>
              {toolCalls.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({toolCalls.length} tool {toolCalls.length === 1 ? "call" : "calls"})
                </span>
              )}
            </div>
          </div>

          {toolCalls.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  Hide trace <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  View trace <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Badges preview row */}
        {toolCalls.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {toolCalls.map((tc, idx) => {
              const config = TOOL_CONFIG[tc.toolName] || {
                label: tc.toolName,
                icon: Sparkles,
                color: "bg-muted text-foreground border-border",
              };
              const Icon = config.icon;

              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`gap-1 px-2 py-0.5 text-[10px] font-medium border ${config.color}`}
                >
                  <Icon className="h-2.5 w-2.5" />
                  <span>{config.label}</span>
                  {tc.durationMs > 0 && (
                    <span className="text-muted-foreground ml-0.5">
                      {tc.durationMs}ms
                    </span>
                  )}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Expandable step-by-step trace */}
        {isExpanded && toolCalls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
            {toolCalls.map((tc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg bg-background/60 p-2 text-[11px] border border-border/40"
              >
                {tc.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground">
                      {tc.toolName}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {tc.durationMs}ms
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2">
                    {tc.resultSummary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Report Callout Card */}
      {reportId && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-xs transition-all hover:bg-primary/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Structured Report Created
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  The agent persisted a new report artifact for this workspace.
                </p>
              </div>
            </div>

            <Button asChild size="sm" className="h-7 text-xs gap-1.5 shadow-xs">
              <Link href={`/reports/${reportId}`}>
                View Report
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
