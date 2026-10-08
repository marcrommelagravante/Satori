import * as React from "react";
import { Search, Sparkles, BookmarkCheck, GitCompare, FileText, Check } from "lucide-react";

export function CapabilityBento() {
  return (
    <section id="capabilities" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Core platform capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Engineered for precision, document grounding, and cross-source synthesis.
          </p>
        </div>

        {/* Asymmetric 4-Cell Bento Grid (2+1 / 1+2 composition) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Cell 1: Universal Search (col-span-7) */}
          <div className="md:col-span-7 rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground">
                Universal Knowledge Search
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                Search your entire organizational archive with natural language. Combines pgvector semantic similarity and PostgreSQL full-text search with Reciprocal Rank Fusion.
              </p>
            </div>

            {/* Embedded Visual: Search Interface with RRF Matches */}
            <div className="rounded-xl border border-slate-200/70 dark:border-border/70 bg-slate-50/70 dark:bg-muted/30 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-slate-200/60 dark:border-border/60 text-xs">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  board member compensation and conflicts of interest
                </span>
                <span className="ml-auto font-mono text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold">
                  Hybrid RRF
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-white dark:bg-card border border-slate-200/50 dark:border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-foreground truncate">
                      Governance_Handbook_2025.pdf
                    </span>
                    <span className="text-slate-400 dark:text-muted-foreground text-[11px]">
                      Article VII · Page 14
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    98.4% match
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-card border border-slate-200/50 dark:border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-foreground truncate">
                      Ethics_and_Disclosure_Charter.docx
                    </span>
                    <span className="text-slate-400 dark:text-muted-foreground text-[11px]">
                      Section 3.2
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    94.1% match
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Grounded AI Answers (col-span-5) */}
          <div className="md:col-span-5 rounded-3xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/20 p-6 sm:p-8 shadow-xs flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground">
                Grounded AI Answers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Answers are synthesized strictly from retrieved workspace chunks with prompt boundaries that prioritize documentary facts.
              </p>
            </div>

            {/* Visual: Violet AI Message Callout */}
            <div className="rounded-xl border border-purple-200/80 dark:border-purple-800/50 bg-[#F5F3FF] dark:bg-[#1E1B4B]/50 p-4 border-l-3 border-l-[#7C3AED] space-y-2">
              <div className="flex items-center gap-1.5 text-[#7C3AED] dark:text-purple-300 text-xs font-bold font-heading">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Context-Bound Generation</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                &ldquo;Compensation for non-executive trustees is strictly prohibited without unanimous affirmative board resolution.&rdquo;
              </p>
            </div>
          </div>

          {/* Bento Cell 3: Exact Citations (col-span-5) */}
          <div className="md:col-span-5 rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-3">
                <BookmarkCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground">
                Exact Source Citations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Every claim includes interactive source pills. Click any citation to inspect the origin file, page, and chunk excerpt.
              </p>
            </div>

            {/* Visual: Citation Pills Sample */}
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-border/60 bg-slate-50/60 dark:bg-muted/20 flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-purple-200 dark:border-purple-800 text-[#7C3AED] dark:text-purple-300 font-mono text-xs shadow-2xs">
                <span className="font-bold">[1]</span>
                <span>Bylaws.pdf · p.6</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-card border border-purple-200 dark:border-purple-800 text-[#7C3AED] dark:text-purple-300 font-mono text-xs shadow-2xs">
                <span className="font-bold">[2]</span>
                <span>Travel_Policy.docx · §4</span>
              </span>
            </div>
          </div>

          {/* Bento Cell 4: Compare & Summarize (col-span-7) */}
          <div className="md:col-span-7 rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-3">
                <GitCompare className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground">
                Understand and Compare
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                Cross-analyze multiple versions or parallel policies with agent-powered synthesis. Export findings as structured markdown reports or print-ready briefs.
              </p>
            </div>

            {/* Visual: Comparative Matrix Snippet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200/60 dark:border-border/60 bg-slate-50/60 dark:bg-muted/20">
                <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-muted-foreground uppercase">
                  Version 2024
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Required physical presence for voting; 14-day advance notice required.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-[#EEF2FF]/60 dark:bg-indigo-950/30">
                <span className="font-mono text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 uppercase flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Version 2025 (Adopted)</span>
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">
                  Allows verified electronic attendance; reduces notice window to 5 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
