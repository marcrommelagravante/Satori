import * as React from "react";
import { Server, ChevronDown, Shield, Database, Cpu } from "lucide-react";

export function ArchitectureSection() {
  const stackPills = [
    "Next.js 16 App Router",
    "TypeScript",
    "PostgreSQL",
    "pgvector",
    "Gemini Embeddings",
    "Drizzle ORM",
    "Tailwind CSS v4",
    "Vercel Blob Storage",
  ];

  return (
    <section id="architecture" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-card text-[#0F2D4A] dark:text-slate-200 shadow-2xs">
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
              Technical Foundation
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            A custom retrieval pipeline, not an opaque wrapper
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            PostgreSQL is our single system of record. Semantic and lexical search run directly inside your database.
          </p>
        </div>

        {/* Tech Stack Pills Marquee / Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-10">
          {stackPills.map((tech) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-xs font-mono font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Interactive "Under the Hood" Native Details Disclosure */}
        <div className="max-w-3xl mx-auto">
          <details className="group rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden">
            <summary className="p-5 sm:p-6 flex items-center justify-between cursor-pointer list-none select-none hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Server className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                    Under the hood: Architecture deep dive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                    Click to review the RAG pipeline, embedding dimensionality, and tenant security.
                  </p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-400 dark:text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="p-6 pt-2 border-t border-slate-100 dark:border-border/60 bg-slate-50/40 dark:bg-muted/10 space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-border/60 bg-white dark:bg-card space-y-1.5">
                  <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-slate-900 dark:text-foreground">
                    <Database className="h-3.5 w-3.5 text-[#4F46E5] dark:text-indigo-400" />
                    <span>pgvector Storage</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                    Chunks are stored with 768-dimensional embeddings directly in PostgreSQL using cosine distance indexes, eliminating separate vector database services.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-border/60 bg-white dark:bg-card space-y-1.5">
                  <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-slate-900 dark:text-foreground">
                    <Cpu className="h-3.5 w-3.5 text-[#7C3AED] dark:text-purple-400" />
                    <span>Reciprocal Rank Fusion</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                    Combines vector semantic similarity and tsvector full-text search ranks using the RRF algorithm with constant k = 60 for balanced recall.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-border/60 bg-white dark:bg-card space-y-1.5">
                  <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-slate-900 dark:text-foreground">
                    <Shield className="h-3.5 w-3.5 text-[#059669] dark:text-emerald-400" />
                    <span>Tenant Partitioning</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                    Every database query and similarity vector scan strictly scopes results by workspace ID, verified in server session handlers before LLM generation.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-border/60 bg-white dark:bg-card font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <span className="text-[#4F46E5] dark:text-indigo-400 font-bold">RRF Formula:</span> Score = 1 / (60 + rank_vector) + 1 / (60 + rank_fts)
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
