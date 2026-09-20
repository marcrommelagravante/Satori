"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Search,
  Scale,
  Play,
  Activity,
  Gauge,
  Zap,
} from "lucide-react";
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
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30",
      query: "Please summarize our workspace documents and highlight key policies.",
    },
    {
      title: "Ask Questions",
      description: "Find specific information",
      icon: Search,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/30",
      query: "What are the rules and guidelines defined across our documents?",
    },
    {
      title: "Compare Documents",
      description: "See differences and similarities",
      icon: Scale,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/30",
      query: "Compare the differences and overlap across our uploaded files.",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-12" data-density="medium">
      {/* 1. Top Header with Segmented Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
            Evaluations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
            Test and experiment with your knowledge base using Retrieval-Augmented Generation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("playground")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "playground"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
            }`}
          >
            Playground Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("benchmarks")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "benchmarks"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
            }`}
          >
            Evaluation Benchmarks
          </button>
        </div>
      </div>

      {activeTab === "playground" ? (
        <div className="space-y-6 md:space-y-8">
          {/* 2. Hero Banner (Replica of User Mockup) */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-100/80 dark:border-indigo-950/50 bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF2FF]/70 dark:from-card dark:via-card dark:to-indigo-950/20 p-6 sm:p-8 md:p-10 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 lg:col-span-8 space-y-3.5">
                <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                  RAG Playground
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-muted-foreground leading-relaxed max-w-xl">
                  Test and experiment with your knowledge base using Retrieval-Augmented Generation.
                </p>

                <div className="pt-2">
                  <Link
                    href={`/chat?ws=${workspaceId}&mode=playground`}
                    className="inline-flex items-center gap-2.5 rounded-xl sm:rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm px-6 py-3 shadow-xs transition-all cursor-pointer group"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Start New Session</span>
                  </Link>
                </div>
              </div>

              {/* 3D Illustration matching user mockup */}
              <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-end items-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 rounded-full blur-2xl transform scale-90" />
                  <img
                    src="/illustrations/rag-playground-hero.jpg"
                    alt="RAG Playground 3D Document Illustration"
                    className="relative z-10 w-full h-full object-contain rounded-2xl drop-shadow-xl select-none pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Quick Examples Section (Replica of User Mockup) */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm md:text-base font-bold text-slate-900 dark:text-foreground">
              Quick Examples
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickExamples.map((ex, i) => {
                const Icon = ex.icon;
                return (
                  <Link
                    key={i}
                    href={`/chat?ws=${workspaceId}&q=${encodeURIComponent(
                      ex.query
                    )}`}
                    className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-4 sm:p-5 shadow-xs hover:border-[#4F46E5]/40 hover:shadow-sm transition-all flex items-center gap-4 group cursor-pointer"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${ex.iconBg} ${ex.iconColor} transition-transform group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors truncate">
                        {ex.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground mt-0.5 leading-snug truncate">
                        {ex.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 4. Four Summary Metric Counters (100% Real Telemetry Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Card 1: Total Invocations */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
              <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
                Total Invocations
              </span>
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
                  {initialTelemetry.totalRuns}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
                  Telemetry
                </span>
              </div>
            </div>

            {/* Card 2: Avg Latency */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
              <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
                Avg Latency
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
                  {Math.round(initialTelemetry.avgLatencyMs)}
                </span>
                <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
            </div>

            {/* Card 3: Total Tokens */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
              <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
                Total Tokens
              </span>
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
                  {initialTelemetry.totalTokens.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  Tokens
                </span>
              </div>
            </div>

            {/* Card 4: Benchmark Runs */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-border transition-all">
              <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
                Benchmark Runs
              </span>
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
                  {initialRuns.length}
                </span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                  Evaluations
                </span>
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
