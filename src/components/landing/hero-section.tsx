import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileCheck, Layers } from "lucide-react";
import { ConvergenceStage } from "./convergence-stage";

interface HeroSectionProps {
  user?: {
    id: string;
    name?: string | null;
  } | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative w-full pt-8 pb-16 sm:pt-12 sm:pb-20 overflow-hidden">
      {/* Subtle Radial Gradient Wash */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-b from-[#4F46E5]/8 via-[#7C3AED]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Value Copy (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-6 text-left">
            {/* Eyebrow: GROUNDED KNOWLEDGE WORKSPACE */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-card/80 text-[#0F2D4A] dark:text-slate-200 shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                Grounded Knowledge Workspace
              </span>
            </div>

            {/* Headline: Strategy recommended copy */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-foreground leading-[1.12]">
              Find the answer. <br className="hidden sm:inline" />
              See the source.
            </h1>

            {/* Subtext: Plain language outcome */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Search across your PDFs, Word documents, and text files. Ask questions in plain language and inspect the passages behind Satori&rsquo;s answers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1 w-full sm:w-auto">
              {user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F2D4A] hover:bg-[#18395B] dark:bg-white dark:hover:bg-slate-100 dark:text-[#0F2D4A] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Open dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F2D4A] hover:bg-[#18395B] dark:bg-white dark:hover:bg-slate-100 dark:text-[#0F2D4A] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-muted text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                See how it works
              </a>
            </div>

            {/* Proof line */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground pt-2">
              <FileCheck className="h-4 w-4 text-[#059669]" />
              <span>PDF, DOCX, and TXT support · Source-linked answers</span>
            </div>
          </div>

          {/* Right Column: Convergence Stage Signature Animation (col-span-7) */}
          <div className="lg:col-span-7 w-full">
            <ConvergenceStage />
          </div>
        </div>
      </div>
    </section>
  );
}
