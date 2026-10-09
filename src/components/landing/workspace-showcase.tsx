import * as React from "react";
import { MessageSquare, Sparkles, CheckCircle2, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface WorkspaceShowcaseProps {
  user?: {
    id: string;
  } | null;
}

export function WorkspaceShowcase({ user }: WorkspaceShowcaseProps) {
  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            A workspace designed for deep document understanding
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            A calm, unified interface connecting documents, semantic embeddings, and conversational synthesis.
          </p>
        </div>

        {/* Full-Bleed Application Shell Mockup */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-2xl shadow-indigo-500/10 overflow-hidden">
          {/* Top Window Bar */}
          <div className="h-11 px-5 border-b border-slate-100 dark:border-border/60 bg-slate-50/80 dark:bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground hidden sm:inline">
                satori.app // workspace // chat
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-400 dark:text-muted-foreground hidden sm:inline">
                Workspace: Community Foundation
              </span>
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2D4A] dark:text-white hover:underline"
                >
                  <span>Launch app</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2D4A] dark:text-white hover:underline"
                >
                  <span>Sign in</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* App Interior Shell */}
          <div className="flex flex-col md:flex-row min-h-[460px] sm:min-h-[520px]">
            {/* Sidebar Simulation */}
            <div className="w-full md:w-56 p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/10 flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/60 dark:border-border/60">
                  <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-white flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
                    Community Foundation
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted/40">
                    Dashboard
                  </div>
                  <div className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted/40">
                    Documents (18)
                  </div>
                  <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F2D4A] text-white dark:bg-white dark:text-[#0F2D4A]">
                    AI Chat & Research
                  </div>
                  <div className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted/40">
                    Knowledge Hub
                  </div>
                  <div className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted/40">
                    Reports & Briefs
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-border/40 text-[11px] text-slate-400 dark:text-muted-foreground font-mono">
                1,420 chunks vectorized
              </div>
            </div>

            {/* Chat Canvas Simulation */}
            <div className="flex-1 p-5 sm:p-8 flex flex-col justify-between space-y-6">
              {/* Message Thread */}
              <div className="space-y-4 max-w-2xl">
                {/* User Message */}
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    U
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-muted text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    Compare the conflict of interest disclosure timelines between our 2024 by-laws and the proposed 2025 governance amendments.
                  </div>
                </div>

                {/* Satori AI Response */}
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-[#0F2D4A] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F5F7FA] dark:bg-slate-900/40 p-4 border-l-4 border-l-[#0F2D4A] dark:border-l-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs font-bold text-[#0F2D4A] dark:text-white">
                        Satori AI Synthesis
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>2 sources reconciled</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
                      Under the 2024 bylaws, trustees were permitted thirty calendar days following year-end to file annual financial disclosures [1]. The 2025 governance amendments shorten this timeline to fourteen calendar days and mandate immediate disclosure prior to any board transaction exceeding $5,000 [2].
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded bg-white dark:bg-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        [1] Bylaws_2024.pdf · p.12
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded bg-white dark:bg-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        [2] Amendments_2025.docx · §3.4
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Composer Input Bar Mock */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-slate-50/70 dark:bg-muted/30 p-3 flex items-center justify-between text-xs text-slate-400 dark:text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Ask questions, compare documents, or request synthesis...</span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#0F2D4A] hover:bg-[#18395B] dark:bg-white dark:text-[#0F2D4A] text-white font-semibold text-[11px] transition-colors cursor-pointer">
                  Send
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
