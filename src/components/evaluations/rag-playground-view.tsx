"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Search,
  Scale,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationsDashboard } from "./evaluations-dashboard";
import type { EvalCase, EvalRun } from "@/lib/db/schema";
import type { EvalRunDetailResult } from "@/lib/evaluations";
import type { TelemetrySummary } from "@/lib/observability";

interface RAGPlaygroundViewProps {
  workspaceId: string;
  initialRuns: EvalRun[];
  initialBaseline: EvalRun | null;
  initialCases: EvalCase[];
  initialDetails: EvalRunDetailResult | null;
  initialTelemetry: TelemetrySummary;
}

export function RAGPlaygroundView({
  workspaceId,
  initialRuns,
  initialBaseline,
  initialCases,
  initialDetails,
  initialTelemetry,
}: RAGPlaygroundViewProps) {
  const [activeTab, setActiveTab] = React.useState<"playground" | "benchmarks">(
    "playground"
  );

  const quickExamples = [
    {
      title: "Summarize Documents",
      description: "Get a summary from your files",
      icon: FileText,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
      query: "Please summarize our workspace documents and highlight key policies.",
    },
    {
      title: "Ask Questions",
      description: "Find specific information",
      icon: Search,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50 dark:bg-violet-950/40",
      query: "What are the rules and guidelines defined across our documents?",
    },
    {
      title: "Compare Documents",
      description: "See differences and similarities",
      icon: Scale,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      query: "Compare the differences and overlap across our uploaded files.",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Banner matching Mockup Panel 7 */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-background to-secondary/5 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3 w-3" />
              <span>Phase 7 — RAG Playground</span>
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              RAG Playground
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Test and experiment with your knowledge base using Retrieval-Augmented Generation.
              Run semantic searches, inspect chunk fusion, and benchmark answer quality.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-[8px] bg-primary hover:bg-primary-dark text-primary-foreground font-semibold px-4 py-2 shadow-xs">
                <Link href={`/chat?ws=${workspaceId}&mode=playground`}>
                  <Play className="h-4 w-4 mr-2" />
                  <span>Start New Session</span>
                </Link>
              </Button>

              <div className="flex items-center rounded-[8px] border border-border bg-card p-1 shadow-2xs">
                <button
                  onClick={() => setActiveTab("playground")}
                  className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${
                    activeTab === "playground"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Playground Overview
                </button>
                <button
                  onClick={() => setActiveTab("benchmarks")}
                  className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${
                    activeTab === "benchmarks"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Evaluation Suite & Telemetry
                </button>
              </div>
            </div>
          </div>

          {/* 3D-styled floating doc card illustration */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-44 h-44 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-secondary/30 flex items-center justify-center p-4 shadow-xl">
              <div className="w-28 h-36 bg-card border border-border/80 rounded-xl shadow-lg p-3 space-y-2 transform -rotate-6">
                <div className="h-2 w-12 bg-primary/40 rounded-full" />
                <div className="h-2 w-20 bg-muted rounded-full" />
                <div className="h-2 w-16 bg-muted rounded-full" />
                <div className="h-2 w-14 bg-secondary/40 rounded-full mt-4" />
              </div>
              <div className="absolute w-28 h-36 bg-primary/10 border border-primary/30 rounded-xl shadow-md p-3 space-y-2 transform rotate-6 translate-x-3 translate-y-2 backdrop-blur-xs">
                <div className="h-2 w-10 bg-secondary/50 rounded-full" />
                <div className="h-2 w-16 bg-muted rounded-full" />
                <div className="h-2 w-12 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "playground" ? (
        <div className="space-y-6">
          {/* Quick Examples Section matching Mockup Panel 7 */}
          <div className="space-y-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Quick Examples
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickExamples.map((ex, i) => {
                const Icon = ex.icon;
                return (
                  <Link
                    key={i}
                    href={`/chat?ws=${workspaceId}&q=${encodeURIComponent(ex.query)}`}
                    className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-[8px] mb-3 ${ex.iconBg} ${ex.iconColor} transition-transform group-hover:scale-105`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-heading text-xs font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {ex.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {ex.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-primary font-medium">
                      <span>Try example</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Telemetry Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-xs text-muted-foreground">Total Invocations</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {initialTelemetry.totalRuns}
              </div>
            </div>
            <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-xs text-muted-foreground">Avg Latency</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {Math.round(initialTelemetry.avgLatencyMs)} ms
              </div>
            </div>
            <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-xs text-muted-foreground">Total Tokens</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {initialTelemetry.totalTokens.toLocaleString()}
              </div>
            </div>
            <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-xs text-muted-foreground">Benchmark Runs</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {initialRuns.length}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Evaluations & Benchmark Suite Tab */
        <EvaluationsDashboard
          workspaceId={workspaceId}
          initialRuns={initialRuns}
          initialBaseline={initialBaseline}
          initialCases={initialCases}
          initialDetails={initialDetails}
          initialTelemetry={initialTelemetry}
        />
      )}
    </div>
  );
}
