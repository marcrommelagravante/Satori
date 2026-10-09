"use client";

import * as React from "react";
import { ShieldCheck, Lock, Database, EyeOff, ChevronDown, CheckCircle2 } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Which file types can I upload?",
    answer:
      "Satori supports PDF, DOCX, and TXT documents up to 10MB per file. During upload, text is validated, sanitized, and segmented into semantic chunks ready for retrieval.",
  },
  {
    question: "How do source citations work?",
    answer:
      "Every generated response includes numbered citation chips (e.g., [1], [2]). Clicking any chip reveals the exact document name, page number, and source passage, allowing you to verify the factual context firsthand.",
  },
  {
    question: "Can I ask questions across multiple documents?",
    answer:
      "Yes. Satori performs unified hybrid search across all indexed files in your active workspace, synthesizing evidence from multiple separate documents when complex questions require cross-referencing.",
  },
  {
    question: "What happens when Satori cannot find a relevant answer?",
    answer:
      "Rather than inventing or hallucinating answers, Satori is explicitly prompt-bounded to state when the documents in your workspace do not contain sufficient evidence to address the query.",
  },
  {
    question: "Who can access the files in a workspace?",
    answer:
      "Every document, text chunk, and vector embedding is strictly scoped to your authenticated workspace ID. Other users or workspaces cannot access or query your materials.",
  },
  {
    question: "How are uploaded files stored and processed?",
    answer:
      "Original files are stored in encrypted cloud blob storage, while parsed text chunks and 768-dimensional embeddings are indexed in our PostgreSQL database using pgvector. Uploaded data is never used to train public foundation models.",
  },
];

export function TrustSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="trust" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-card text-[#0F2D4A] dark:text-slate-200 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
              Trust & Data Integrity
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Grounded in your files, protected by design
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            How Satori handles your documents, verifies answer accuracy, and enforces workspace isolation.
          </p>
        </div>

        {/* Accuracy Commitment Banner */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 sm:p-8 shadow-xs mb-12">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-[#059669]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-foreground">
                Our commitment to grounded factual accuracy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Satori grounds its responses in information retrieved directly from your workspace documents and provides interactive source citations so you can inspect the supporting passages before taking action.
              </p>
              <p className="text-xs text-slate-500 dark:text-muted-foreground pt-1">
                We design for dependable verification rather than blind trust. If your documents do not contain the answer, Satori informs you directly.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Privacy Pillars */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-slate-200/70 dark:border-border/70 bg-white/70 dark:bg-card/70 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-white flex items-center justify-center mb-2">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
              Strict Tenant Isolation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every database query and pgvector similarity scan is strictly scoped by workspace ID. Documents are inaccessible across accounts.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/70 dark:border-border/70 bg-white/70 dark:bg-card/70 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-white flex items-center justify-center mb-2">
              <EyeOff className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
              Zero Model Training
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your organizational materials, queries, and generated answers are never used to train public foundation models.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/70 dark:border-border/70 bg-white/70 dark:bg-card/70 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F2D4A] dark:text-white flex items-center justify-center mb-2">
              <Database className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
              Encrypted at Rest & Transit
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Secure TLS transport and protected blob storage keep organizational bylaws, policies, and research safe.
            </p>
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="text-center mb-6">
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground">
              Frequently asked questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground mt-1">
              Common questions about document handling, search, and privacy.
            </p>
          </div>

          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors"
                >
                  <span className="font-heading text-sm font-bold text-slate-900 dark:text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0F2D4A] dark:text-white" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-border/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
