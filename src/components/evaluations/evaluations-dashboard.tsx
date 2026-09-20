"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Gauge,
  Play,
  History,
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { EvalScorecard } from "./eval-scorecard";
import { EvalCasesTable } from "./eval-cases-table";
import { EvalResultsViewer } from "./eval-results-viewer";
import { TelemetryView } from "./telemetry-view";
import type { EvalCase, EvalRun } from "@/lib/db/schema";
import type { EvalRunDetailResult } from "@/lib/evaluations";
import type { TelemetrySummary } from "@/lib/observability";
import {
  triggerEvaluationRunAction,
  getEvalRunsAction,
  getEvalRunDetailsAction,
  getEvalCasesAction,
} from "@/app/actions/evaluations";
import { getObservabilityDataAction } from "@/app/actions/observability";

interface EvaluationsDashboardProps {
  workspaceId: string;
  initialRuns: EvalRun[];
  initialBaseline: EvalRun | null;
  initialCases: EvalCase[];
  initialDetails: EvalRunDetailResult | null;
  initialTelemetry: TelemetrySummary | null;
}

export function EvaluationsDashboard({
  workspaceId,
  initialRuns,
  initialBaseline,
  initialCases,
  initialDetails,
  initialTelemetry,
}: EvaluationsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"benchmarks" | "observability">("benchmarks");
  const [runs, setRuns] = useState<EvalRun[]>(initialRuns);
  const [baselineRun, setBaselineRun] = useState<EvalRun | null>(initialBaseline);
  const [cases, setCases] = useState<EvalCase[]>(initialCases);
  const [selectedRunDetails, setSelectedRunDetails] = useState<EvalRunDetailResult | null>(initialDetails);
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(initialTelemetry);

  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const latestRun = runs[0] || null;

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      const [runsRes, casesRes, telemRes] = await Promise.all([
        getEvalRunsAction(workspaceId),
        getEvalCasesAction(workspaceId),
        getObservabilityDataAction(workspaceId),
      ]);

      if (runsRes.success && runsRes.runs) {
        setRuns(runsRes.runs);
        const baseline = runsRes.runs.find((r) => r.isBaseline) || null;
        setBaselineRun(baseline);

        if (runsRes.runs.length > 0) {
          const detailsRes = await getEvalRunDetailsAction(workspaceId, runsRes.runs[0].id);
          if (detailsRes.success && detailsRes.details) {
            setSelectedRunDetails(detailsRes.details);
          }
        }
      }

      if (casesRes.success && casesRes.cases) {
        setCases(casesRes.cases);
      }

      if (telemRes.success && telemRes.telemetry) {
        setTelemetry(telemRes.telemetry);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectRun = async (runId: string) => {
    const res = await getEvalRunDetailsAction(workspaceId, runId);
    if (res.success && res.details) {
      setSelectedRunDetails(res.details);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true);
    try {
      const res = await triggerEvaluationRunAction(workspaceId);
      if (res.success && res.run) {
        await refreshAll();
      } else {
        alert(res.error || "Benchmark evaluation failed to run");
      }
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Evaluations & Observability Suite
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground">
            Measure retrieval accuracy (Recall@K), answer correctness, citation validity, and real-time AI operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isRefreshing}
            className="rounded-xl border border-slate-200/80 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted text-xs cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${
                isRefreshing ? "animate-spin text-[#4F46E5]" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleRunBenchmark}
            disabled={isRunningBenchmark}
            className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isRunningBenchmark ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
            )}
            Run Benchmark Suite
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-border">
        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "benchmarks"
              ? "border-[#4F46E5] text-[#4F46E5] dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
          }`}
        >
          <Gauge className="h-4 w-4" />
          <span>Quality Evaluations & Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab("observability")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "observability"
              ? "border-[#4F46E5] text-[#4F46E5] dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>System Observability & Telemetry</span>
        </button>
      </div>

      {/* Tab 1: Quality Evaluations */}
      {activeTab === "benchmarks" && (
        <div className="space-y-6">
          {/* Top Scorecard */}
          <EvalScorecard latestRun={latestRun} baselineRun={baselineRun} />

          {/* Runs History & Results Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Evaluation Run History</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Select a run to inspect individual test case scores.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                {runs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No runs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                    {runs.map((r) => {
                      const isSelected = selectedRunDetails?.run.id === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRun(r.id)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 font-medium text-foreground shadow-xs"
                              : "border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold truncate text-foreground">
                              {r.name}
                            </span>
                            {r.isBaseline && (
                              <Badge className="bg-primary/15 text-primary border-primary/20 text-[9px] py-0 px-1">
                                Baseline
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              {new Date(r.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="font-mono">
                              Recall: {((r.retrievalRecallK ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Details Viewer */}
            <div className="lg:col-span-2">
              <EvalResultsViewer
                workspaceId={workspaceId}
                runDetails={selectedRunDetails}
                onBaselineChanged={refreshAll}
              />
            </div>
          </div>

          {/* Test Cases Table */}
          <EvalCasesTable
            workspaceId={workspaceId}
            cases={cases}
            onRefresh={refreshAll}
          />
        </div>
      )}

      {/* Tab 2: System Observability */}
      {activeTab === "observability" && (
        <TelemetryView telemetry={telemetry} />
      )}
    </div>
  );
}
