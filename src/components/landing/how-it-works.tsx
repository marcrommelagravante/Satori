import * as React from "react";
import { Upload, Search, FileCheck2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      stepNumber: "01",
      title: "Add your documents",
      description:
        "Upload PDF, DOCX, and TXT files directly to your private workspace. Files are validated, parsed, and indexed automatically.",
      icon: Upload,
      detail: "PDF, DOCX, and TXT supported",
    },
    {
      stepNumber: "02",
      title: "Ask a question",
      description:
        "Use natural language to find information across one file or your entire repository. Satori analyzes relevant passages in context.",
      icon: Search,
      detail: "Cross-document semantic search",
    },
    {
      stepNumber: "03",
      title: "Inspect the source",
      description:
        "Every response includes numbered citations. Click any citation chip to review the exact paragraph and page behind the answer.",
      icon: FileCheck2,
      detail: "Passage provenance & verification",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            How Satori connects your information
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            From raw documents to verified answers in three straightforward steps.
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
                className="relative z-10 flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white/80 dark:bg-card/80 backdrop-blur-xs shadow-xs hover:border-[#0F2D4A]/40 dark:hover:border-slate-700 transition-all group"
              >
                {/* Step Number & Icon Badge */}
                <div className="relative mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-slate-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6 text-[#0F2D4A] dark:text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#0F2D4A] dark:bg-white text-white dark:text-[#0F2D4A] font-mono text-[10px] font-bold">
                    {step.stepNumber}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-foreground mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Footnote Badge */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-border/60 w-full">
                  <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-muted-foreground">
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
