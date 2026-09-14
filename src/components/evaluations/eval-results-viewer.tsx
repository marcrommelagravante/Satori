"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ShieldCheck,
  FileCheck2,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { EvalRunDetailResult } from "@/lib/evaluations";
import { setBaselineRunAction } from "@/app/actions/evaluations";

interface EvalResultsViewerProps {
  workspaceId: string;
  runDetails: EvalRunDetailResult | null;
  onBaselineChanged?: () => void;
}

export function EvalResultsViewer({
  workspaceId,
  runDetails,
  onBaselineChanged,
}: EvalResultsViewerProps) {
  const [isSettingBaseline, setIsSettingBaseline] = useState(false);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  if (!runDetails) {
    return (
      <Card className="border-dashed border-border bg-card/40">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Select an evaluation run from history to inspect detailed per-case metrics.
        </CardContent>
      </Card>
    );
  }

  const { run, baselineRun, results } = runDetails;

  const handleSetBaseline = async () => {
    setIsSettingBaseline(true);
    try {
      const res = await setBaselineRunAction(workspaceId, run.id);
      if (res.success) {
        onBaselineChanged?.();
      } else {
        alert(res.error || "Failed to set baseline");
      }
    } finally {
      setIsSettingBaseline(false);
    }
  };

  const formatPercent = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return `${(val * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">{run.name}</CardTitle>
            {run.isBaseline ? (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs py-0.5">
                <BookmarkCheck className="h-3 w-3 mr-1" />
                Active Baseline
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs capitalize">
                {run.status}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Executed on {new Date(run.createdAt).toLocaleString()} • {results.length} cases evaluated
            {baselineRun && (
              <span className="ml-1 text-muted-foreground">
                (Baseline: <strong>{baselineRun.name}</strong>)
              </span>
            )}
          </CardDescription>
        </div>

        {!run.isBaseline && run.status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetBaseline}
            disabled={isSettingBaseline}
            className="text-xs self-start sm:self-auto"
          >
            {isSettingBaseline ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <BookmarkCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
            )}
            Set as Workspace Baseline
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Results List */}
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {results.map(({ result, testCase }, index) => {
            const isExpanded = expandedCaseId === result.id;
            const isPassed = result.status === "passed";

            return (
              <div
                key={result.id}
                className="p-3.5 hover:bg-muted/30 transition-colors space-y-2 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5">
                      #{index + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {testCase.question}
                        </span>
                        {isPassed ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-1.5"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] py-0 px-1.5"
                          >
                            <XCircle className="h-2.5 w-2.5 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>

                      {/* Micro score badges */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground pt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Target className="h-3 w-3 text-primary" />
                          Recall@5: <strong className="text-foreground">{formatPercent(result.recallK)}</strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Correctness: <strong className="text-foreground">{formatPercent(result.correctnessScore)}</strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-indigo-500" />
                          Groundedness: <strong className="text-foreground">{formatPercent(result.groundednessScore)}</strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <FileCheck2 className="h-3 w-3 text-cyan-500" />
                          Citation: <strong className="text-foreground">{formatPercent(result.citationScore)}</strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {result.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedCaseId(isExpanded ? null : result.id)}
                    className="h-7 w-7 text-muted-foreground"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {/* Expanded Inspection Drawer */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-lg bg-muted/50 border border-border/60 space-y-3 text-xs">
                    {/* Expected vs Generated */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-md bg-card border border-border space-y-1">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                          Expected Ground Truth Answer:
                        </span>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {testCase.expectedAnswer}
                        </p>
                      </div>

                      <div className="p-3 rounded-md bg-card border border-border space-y-1">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                          Generated Answer:
                        </span>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {result.generatedAnswer || "No answer generated"}
                        </p>
                      </div>
                    </div>

                    {/* LLM Judge Reasoning */}
                    {result.judgeFeedback && (
                      <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-1">
                        <div className="flex items-center gap-1 text-primary font-semibold text-[11px]">
                          <Sparkles className="h-3 w-3" />
                          LLM Judge Assessment & Rationale:
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {result.judgeFeedback}
                        </p>
                      </div>
                    )}

                    {/* Retrieval & Citation Metadata */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>
                        Retrieved Chunks: <strong>{result.retrievedChunkIds?.length || 0}</strong>
                      </span>
                      <span>
                        Hit Rate: <strong>{result.hitRate === 1 ? "100%" : "0%"}</strong>
                      </span>
                      <span>
                        Precision@5: <strong>{formatPercent(result.precisionK)}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
