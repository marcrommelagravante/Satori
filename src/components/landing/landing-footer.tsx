import * as React from "react";
import Link from "next/link";
import { SatoriLogo } from "@/components/shared/satori-logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-border/70 bg-white/50 dark:bg-card/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-slate-100 dark:border-border/50">
          <div className="space-y-2 max-w-sm">
            <Link href="/" className="inline-block">
              <SatoriLogo size={28} showWordmark={true} />
            </Link>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              Your knowledge, intelligently connected. Built for small organizations, teams, and researchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors">
              How it works
            </a>
            <a href="#capabilities" className="hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors">
              Capabilities
            </a>
            <a href="#traceability" className="hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors">
              Traceability
            </a>
            <a href="#architecture" className="hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors">
              Architecture
            </a>
            <Link href="/login" className="hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-muted-foreground">
          <p>© {new Date().getFullYear()} Satori. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Next.js 16</span>
            <span>·</span>
            <span>PostgreSQL</span>
            <span>·</span>
            <span>pgvector</span>
            <span>·</span>
            <span>Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
