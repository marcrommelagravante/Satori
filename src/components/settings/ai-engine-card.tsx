"use client";

import * as React from "react";
import { Sparkles, Cpu, Layers, Database, Search, ShieldCheck } from "lucide-react";
import type { AiEngineInfo } from "@/lib/ai/info";

interface AiEngineCardProps {
  aiEngine: AiEngineInfo;
}

export function AiEngineCard({ aiEngine }: AiEngineCardProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
            AI Engine & Retrieval Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
            Active neural models, embedding spaces, and search pipelines powering this workspace.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-border/60 space-y-4">
        {/* Responsive Grid of Engine Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Primary Model */}
          <div className="p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Cpu className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <span>Primary Generator</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 text-[10px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-foreground">
              {aiEngine.generationModel}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
              Handles contextual question answering, multi-document synthesis, and tool orchestration.
            </p>
          </div>

          {/* Fallback Model */}
          <div className="p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Layers className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span>High-Availability Fallback</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-border/60 px-2.5 py-0.5 text-[10px] font-semibold">
                Standby
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-foreground">
              {aiEngine.fallbackModel}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
              Instant automatic failover during upstream rate limits, quotas, or service degradation.
            </p>
          </div>

          {/* Embeddings */}
          <div className="p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Database className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400" />
                <span>Dense Embeddings</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-muted-foreground">
                {aiEngine.embeddingDimension} dims
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-foreground">
              {aiEngine.embeddingModel}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
              Vectors computed upon document ingestion and indexed in PostgreSQL via pgvector cosine distance.
            </p>
          </div>

          {/* Retrieval */}
          <div className="p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Search className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span>Retrieval Strategy</span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                RRF Fusion (k=60)
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-foreground">
              Hybrid Search (Dense + Sparse)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
              Fused semantic similarity and full-text keyword ranking to maximize recall and precision.
            </p>
          </div>
        </div>

        {/* Data boundary guarantee banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs">
          <ShieldCheck className="h-4 w-4 text-[#4F46E5] dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-slate-900 dark:text-foreground">Strict Tenant Isolation: </strong>
            All embeddings, document chunks, and chat history are scoped exclusively to your workspace ID. Satori never uses your organization data to train public foundation models.
          </div>
        </div>
      </div>
    </div>
  );
}
