import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FinalCtaProps {
  user?: {
    id: string;
  } | null;
}

export function FinalCta({ user }: FinalCtaProps) {
  return (
    <section className="py-20 sm:py-28 border-t border-slate-200/60 dark:border-border/60 bg-white/60 dark:bg-card/40 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-foreground">
          Bring your documents together.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Start turning scattered organizational files into searchable, source-grounded intelligence today.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0F2D4A] hover:bg-[#18395B] dark:bg-white dark:hover:bg-slate-100 dark:text-[#0F2D4A] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Open dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0F2D4A] hover:bg-[#18395B] dark:bg-white dark:hover:bg-slate-100 dark:text-[#0F2D4A] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-muted text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-muted-foreground pt-2">
          PDF, DOCX, and TXT support · Source-linked answers
        </p>
      </div>
    </section>
  );
}
