"use client";

import * as React from "react";
import { Sparkles, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export function SourceInspector() {
  const [activeCite, setActiveCite] = React.useState<"cite-1" | "cite-2">("cite-1");

  return (
    <section id="traceability" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Eyebrow 2 of 3 */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-900/50 bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400">
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
              Source Traceability
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Answers you can trace back to the source
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Click any citation chip to jump directly into the source document excerpt.
          </p>
        </div>

        {/* Dual-Pane Interactive Source Inspector Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-lg shadow-indigo-500/5 overflow-hidden">
          {/* Chrome Bar */}
          <div className="h-11 px-5 border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground hidden sm:inline">
                inspector // verified-citation-viewer
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-500 dark:text-muted-foreground">
              Active Focus: Citation [{activeCite === "cite-1" ? "1" : "2"}]
            </span>
          </div>

          {/* Dual-Pane Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-border/60">
            {/* Left Pane: Question & Synthesized Answer with Interactive Citations (col-span-5) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Question */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-muted-foreground block mb-1">
                    Question
                  </span>
                  <p className="font-heading text-base font-bold text-slate-900 dark:text-foreground">
                    What are the quorum and notice requirements for emergency board meetings?
                  </p>
                </div>

                {/* Satori Answer Card */}
                <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-[#F5F3FF]/70 dark:bg-[#1E1B4B]/30 p-5 border-l-3 border-l-[#7C3AED] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#7C3AED] dark:text-purple-400 font-heading text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Satori AI Synthesis</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
                    Emergency sessions require written notice sent at least five business days in advance{" "}
                    <button
                      type="button"
                      onClick={() => setActiveCite("cite-1")}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        activeCite === "cite-1"
                          ? "bg-[#7C3AED] text-white shadow-2xs scale-105"
                          : "bg-purple-100 dark:bg-purple-900/50 text-[#7C3AED] dark:text-purple-300 hover:bg-[#7C3AED] hover:text-white"
                      }`}
                    >
                      [1]
                    </button>
                    . Furthermore, a valid quorum requires 51% affirmative attendance of voting members in good standing{" "}
                    <button
                      type="button"
                      onClick={() => setActiveCite("cite-2")}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        activeCite === "cite-2"
                          ? "bg-[#7C3AED] text-white shadow-2xs scale-105"
                          : "bg-purple-100 dark:bg-purple-900/50 text-[#7C3AED] dark:text-purple-300 hover:bg-[#7C3AED] hover:text-white"
                      }`}
                    >
                      [2]
                    </button>
                    .
                  </p>
                </div>
              </div>

              {/* Citation Buttons Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-slate-400 dark:text-muted-foreground uppercase block">
                  Select Citation to Inspect
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCite("cite-1")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeCite === "cite-1"
                        ? "border-[#7C3AED] bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-[#7C3AED]/30"
                        : "border-slate-200/70 dark:border-border/60 hover:border-slate-300 dark:hover:border-border bg-slate-50/40 dark:bg-muted/10"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#7C3AED] dark:text-purple-300 mr-2">
                        [1]
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-foreground">
                        Organization_Bylaws_2025.pdf
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                        Article V · Section 1 (Advance Notice)
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#7C3AED] dark:text-purple-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCite("cite-2")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeCite === "cite-2"
                        ? "border-[#7C3AED] bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-[#7C3AED]/30"
                        : "border-slate-200/70 dark:border-border/60 hover:border-slate-300 dark:hover:border-border bg-slate-50/40 dark:bg-muted/10"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#7C3AED] dark:text-purple-300 mr-2">
                        [2]
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-foreground">
                        Organization_Bylaws_2025.pdf
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                        Article V · Section 2 (Quorum Threshold)
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#7C3AED] dark:text-purple-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Simulated Document Page with Targeted Highlight (col-span-7) */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/50 dark:bg-muted/10 flex flex-col justify-between">
              <div>
                {/* Document Metadata Strip */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-border/60">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-rose-500" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-foreground">
                      Organization_Bylaws_2025.pdf
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground">
                    <span>Page 6 of 28</span>
                    <span>·</span>
                    <span>Section 5</span>
                  </div>
                </div>

                {/* Simulated Document Content */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs space-y-4 font-serif text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-foreground">
                    ARTICLE V: MEETINGS OF THE BOARD OF DIRECTORS
                  </h4>

                  <p
                    className={`p-2.5 rounded-lg transition-all ${
                      activeCite === "cite-1"
                        ? "bg-purple-100/90 dark:bg-purple-950/70 border-l-4 border-l-[#7C3AED] text-slate-900 dark:text-foreground font-medium"
                        : "opacity-70"
                    }`}
                  >
                    <strong>Section 1. Special and Emergency Sessions.</strong> Special meetings of the Board may be called by the President or upon written petition of three voting trustees. Written notice stating the place, day, and hour shall be delivered at least five (5) business days prior to the assembly.
                  </p>

                  <p
                    className={`p-2.5 rounded-lg transition-all ${
                      activeCite === "cite-2"
                        ? "bg-purple-100/90 dark:bg-purple-950/70 border-l-4 border-l-[#7C3AED] text-slate-900 dark:text-foreground font-medium"
                        : "opacity-70"
                    }`}
                  >
                    <strong>Section 2. Quorum Requirements.</strong> A quorum for transaction of business shall consist of fifty-one percent (51%) of all active voting members in good standing. In the absence of a quorum, the presiding officer shall adjourn the session without legislative vote.
                  </p>

                  <p className="opacity-70">
                    <strong>Section 3. Record of Minutes.</strong> The Secretary shall record all resolutions and file certified copies with the corporate records repository within seven days following adjournment.
                  </p>
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-muted-foreground font-mono">
                <span>Vector Hash: 768-dim #c7e19a</span>
                <span>Grounding Score: 0.982</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
