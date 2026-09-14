"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Target,
  ShieldCheck,
  FileCheck2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  BookmarkCheck,
} from "lucide-react";
import type { EvalRun } from "@/lib/db/schema";

interface EvalScorecardProps {
  latestRun: EvalRun | null;
  baselineRun: EvalRun | null;
}

export function EvalScorecard({ latestRun, baselineRun }: EvalScorecardProps) {
  if (!latestRun) {
    return (
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">No Evaluation Runs Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Execute your first automated benchmark run to evaluate retrieval accuracy (Recall@K),
            answer correctness, citation validity, and groundedness.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPercent = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return `${(val * 100).toFixed(1)}%`;
  };

  const computeDelta = (
    current: number | null | undefined,
    baseline: number | null | undefined,
    isPercentage: boolean = true
  ) => {
    if (
      current === null ||
      current === undefined ||
      baseline === null ||
      baseline === undefined ||
      latestRun.id === baselineRun?.id
    ) {
      return null;
    }

    const diff = current - baseline;
    const formatted = isPercentage
      ? `${diff >= 0 ? "+" : ""}${(diff * 100).toFixed(1)}%`
      : `${diff >= 0 ? "+" : ""}${Math.round(diff)}ms`;

    return {
      diff,
      text: formatted,
      isPositive: isPercentage ? diff >= 0 : diff <= 0, // for latency, lower is positive
      isZero: Math.abs(diff) < 0.001,
    };
  };

  const recallDelta = computeDelta(latestRun.retrievalRecallK, baselineRun?.retrievalRecallK);
  const correctnessDelta = computeDelta(latestRun.answerCorrectness, baselineRun?.answerCorrectness);
  const groundednessDelta = computeDelta(latestRun.groundednessScore, baselineRun?.groundednessScore);
  const citationDelta = computeDelta(latestRun.citationAccuracy, baselineRun?.citationAccuracy);
  const latencyDelta = computeDelta(latestRun.avgLatencyMs, baselineRun?.avgLatencyMs, false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Latest Benchmark:</span>
          <span className="text-sm text-muted-foreground">{latestRun.name}</span>
          {latestRun.isBaseline && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs py-0.5">
              <BookmarkCheck className="h-3 w-3 mr-1" />
              Active Baseline
            </Badge>
          )}
        </div>

        {baselineRun && !latestRun.isBaseline && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            Comparing against baseline: <strong className="text-foreground">{baselineRun.name}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retrieval Recall@K */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Retrieval Recall@K</span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">
                {formatPercent(latestRun.retrievalRecallK)}
              </div>
              {recallDelta && (
                <DeltaBadge delta={recallDelta} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Target chunks retrieved in top 5 results
            </p>
          </CardContent>
        </Card>

        {/* Answer Correctness */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Answer Correctness</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">
                {formatPercent(latestRun.answerCorrectness)}
              </div>
              {correctnessDelta && (
                <DeltaBadge delta={correctnessDelta} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Factual alignment with expected ground truth
            </p>
          </CardContent>
        </Card>

        {/* Groundedness */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Groundedness</span>
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">
                {formatPercent(latestRun.groundednessScore)}
              </div>
              {groundednessDelta && (
                <DeltaBadge delta={groundednessDelta} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Strict context grounding without hallucination
            </p>
          </CardContent>
        </Card>

        {/* Citation Validity */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Citation Validity</span>
              <FileCheck2 className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground">
                {formatPercent(latestRun.citationAccuracy)}
              </div>
              {citationDelta && (
                <DeltaBadge delta={citationDelta} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Citations strictly mapped to verified chunks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auxiliary Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/60 text-xs">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Avg Latency:</span>{" "}
            <strong className="text-foreground">{latestRun.avgLatencyMs || 0}ms</strong>
          </div>
          {latencyDelta && <DeltaBadge delta={latencyDelta} compact />}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/60 text-xs">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Precision@K:</span>{" "}
            <strong className="text-foreground">{formatPercent(latestRun.retrievalPrecisionK)}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/60 text-xs">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">Total Test Cases:</span>{" "}
            <strong className="text-foreground">{latestRun.totalCases}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/60 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <strong className="capitalize text-foreground">{latestRun.status}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({
  delta,
  compact = false,
}: {
  delta: { diff: number; text: string; isPositive: boolean; isZero: boolean };
  compact?: boolean;
}) {
  if (delta.isZero) {
    return (
      <span className="inline-flex items-center text-xs text-muted-foreground">
        <Minus className="h-3 w-3 mr-0.5" />
        0.0%
      </span>
    );
  }

  const colorClasses = delta.isPositive
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    : "text-rose-500 bg-rose-500/10 border-rose-500/20";

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold border ${colorClasses} ${
        compact ? "text-[10px] ml-auto" : ""
      }`}
    >
      {delta.isPositive ? (
        <TrendingUp className="h-3 w-3 mr-1" />
      ) : (
        <TrendingDown className="h-3 w-3 mr-1" />
      )}
      {delta.text}
    </span>
  );
}
