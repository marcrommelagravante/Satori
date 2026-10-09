"use client";

import * as React from "react";
import { Building, BookOpen, Code, Briefcase, FileText } from "lucide-react";

export function UseCases() {
  const [activeTab, setActiveTab] = React.useState("orgs");

  const cases = [
    {
      id: "orgs",
      label: "Community Organizations",
      icon: Building,
      summary:
        "Manage bylaws, procedural guidelines, election rules, and committee resolutions with verifiable clarity.",
      documents: [
        "Bylaws_Revised_2025.pdf",
        "Election_Committee_Charter.docx",
        "Trustee_Meeting_Minutes.txt",
      ],
      sampleQuery:
        "What majority vote is necessary to amend the officer election schedule?",
      sampleAnswer:
        "According to Article IX, Section 3, any amendment to the officer election timeline requires a two-thirds affirmative vote of all active voting members present.",
      citation: "Bylaws_Revised_2025.pdf · Page 18",
    },
    {
      id: "research",
      label: "Researchers",
      icon: BookOpen,
      summary:
        "Synthesize academic manuscripts, clinical trial methodologies, study protocols, and institutional bibliographies.",
      documents: [
        "Clinical_Trial_Protocol_v3.pdf",
        "IRB_Submission_Review.docx",
        "Statistical_Plan_Summary.txt",
      ],
      sampleQuery:
        "What are the predefined secondary endpoints for cohort 2 exclusion criteria?",
      sampleAnswer:
        "Secondary exclusion criteria for cohort 2 stipulate prior baseline therapeutic interventions within 90 days preceding initial screening evaluation.",
      citation: "Clinical_Trial_Protocol_v3.pdf · Section 4.2",
    },
    {
      id: "teams",
      label: "Technical Teams",
      icon: Code,
      summary:
        "Centralize architecture documentation, API specifications, database migration runbooks, and engineering playbooks.",
      documents: [
        "Architecture_RFC_042.pdf",
        "Security_Audit_Remediation.docx",
        "API_Gateway_Configuration.txt",
      ],
      sampleQuery:
        "What rate-limiting tiers are applied to unauthenticated API gateway consumers?",
      sampleAnswer:
        "Unauthenticated client traffic is bounded to 60 requests per minute per IP address with exponential jitter fallbacks on downstream proxy limits.",
      citation: "API_Gateway_Configuration.txt · Line 84",
    },
    {
      id: "business",
      label: "Small Businesses",
      icon: Briefcase,
      summary:
        "Provide your team with instant answers on employee guidelines, vendor terms, compliance rules, and client contracts.",
      documents: [
        "Standard_Operating_Procedures.pdf",
        "Master_Services_Agreement.docx",
        "Vendor_Payment_Terms.txt",
      ],
      sampleQuery:
        "What are our standard payment grace periods before late fees apply to consulting retainers?",
      sampleAnswer:
        "Master consulting engagements stipulate a net-30 remittance schedule with a five business day cure grace period prior to late interest assessment.",
      citation: "Master_Services_Agreement.docx · Section 6.1",
    },
  ];

  const currentCase = cases.find((c) => c.id === activeTab) || cases[0];

  return (
    <section id="use-cases" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Tailored for document-intensive workflows
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Real organizational knowledge environments where precision and provenance matter.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {cases.map((c) => {
            const Icon = c.icon;
            const isActive = c.id === activeTab;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveTab(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#0F2D4A] dark:bg-white text-white dark:text-[#0F2D4A] shadow-xs"
                    : "border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Summary & Document List (col-span-5) */}
            <div className="md:col-span-5 space-y-5">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-foreground mb-2">
                  {currentCase.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentCase.summary}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 dark:text-muted-foreground uppercase tracking-wider block font-semibold">
                  Example Knowledge Corpus
                </span>
                <div className="space-y-1.5">
                  {currentCase.documents.map((doc) => (
                    <div
                      key={doc}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-muted/30 border border-slate-200/60 dark:border-border/60 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#0F2D4A] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Query Preview (col-span-7) */}
            <div className="md:col-span-7 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-[#F5F3FF]/70 dark:bg-[#1E1B4B]/30 p-6 border-l-3 border-l-[#7C3AED] space-y-4">
              <div>
                <span className="text-[10.5px] font-mono uppercase text-slate-400 dark:text-muted-foreground tracking-wider block mb-1">
                  Natural-Language Inquiry
                </span>
                <p className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  &ldquo;{currentCase.sampleQuery}&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10.5px] font-mono uppercase text-[#7C3AED] dark:text-purple-400 tracking-wider block mb-1">
                  Grounded Synthesis
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {currentCase.sampleAnswer}
                </p>
              </div>

              <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs font-mono text-[#7C3AED] dark:text-purple-300">
                <span>Verified Source:</span>
                <span className="font-semibold">{currentCase.citation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
