import * as React from "react";
import { Upload, Cpu, MessageSquareQuote } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Add your documents",
      description:
        "Upload PDF, DOCX, and TXT files directly to your isolated workspace without configuring complex databases.",
      icon: Upload,
      detail: "Automatic validation & sanitization",
    },
    {
      title: "Index and vectorize",
      description:
        "Satori extracts clean text, splits content into semantically coherent chunks, and indexes embeddings with pgvector.",
      icon: Cpu,
      detail: "768-dim embeddings + full-text vectors",
    },
    {
      title: "Ask and discover",
      description:
        "Ask natural-language questions across your repository. Every answer cites exact documents, sections, and page numbers.",
      icon: MessageSquareQuote,
      detail: "Reciprocal Rank Fusion hybrid retrieval",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading (Stacked, no split-header) */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            How Satori connects your information
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            From raw files to verified intelligence in three automated stages.
          </p>
        </div>

        {/* 3-Step Horizontal Flow with Connector Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle Connector Bar across steps (Desktop only) */}
          <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-900 -z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/70 dark:border-border/70 bg-white/70 dark:bg-card/70 backdrop-blur-xs shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all group"
              >
                {/* Step Icon Badge */}
                <div className="h-14 w-14 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Step Title */}
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-foreground mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Technical Footnote Badge */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-border/60 w-full">
                  <span className="font-mono text-[10.5px] font-semibold text-slate-500 dark:text-muted-foreground">
                    {step.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
