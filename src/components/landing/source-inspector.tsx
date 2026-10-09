"use client";

import * as React from "react";
import { Sparkles, FileText, CheckCircle2, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

interface DemonstrationScenario {
  id: string;
  category: string;
  documentName: string;
  documentType: "pdf" | "docx";
  pageInfo: string;
  question: string;
  answerPrefix: string;
  cite1Text: string;
  answerMiddle: string;
  cite2Text: string;
  answerSuffix: string;
  cite1: {
    title: string;
    section: string;
    passage: string;
  };
  cite2: {
    title: string;
    section: string;
    passage: string;
  };
}

const DEMO_SCENARIOS: DemonstrationScenario[] = [
  {
    id: "governance",
    category: "Non-Profit & Community Governance",
    documentName: "Organization_Bylaws_2025.pdf",
    documentType: "pdf",
    pageInfo: "Page 6 of 28 · Article V",
    question: "What are the quorum and notice requirements for emergency board meetings?",
    answerPrefix: "Emergency sessions require written notice delivered at least five business days in advance ",
    cite1Text: "[1]",
    answerMiddle: ". Furthermore, a valid quorum requires fifty-one percent (51%) affirmative attendance of voting trustees in good standing ",
    cite2Text: "[2]",
    answerSuffix: " before any formal resolution may be voted on.",
    cite1: {
      title: "Notice Period Requirement",
      section: "Article V · Section 1 (Emergency Sessions)",
      passage:
        "Special and emergency meetings of the Board of Trustees may be called by the President or upon written petition of three voting trustees. Written notice stating the meeting location, date, and hour shall be delivered at least five (5) business days prior to the assembly.",
    },
    cite2: {
      title: "Quorum Attendance Threshold",
      section: "Article V · Section 2 (Quorum Threshold)",
      passage:
        "A quorum for transaction of corporate business shall consist of fifty-one percent (51%) of all active voting members in good standing. In the absence of a verified quorum, the presiding officer shall adjourn the session without legislative vote.",
    },
  },
  {
    id: "operations",
    category: "Operations & Standard Operating Procedures",
    documentName: "Infrastructure_Incident_SOP_v4.docx",
    documentType: "docx",
    pageInfo: "Page 12 of 34 · Section 4",
    question: "What is the mandatory escalation timeline and customer notification SLA for Severity-1 outages?",
    answerPrefix: "Severity-1 incidents require an incident commander assignment within fifteen minutes ",
    cite1Text: "[1]",
    answerMiddle: ", followed by an external status communication published to stakeholders within thirty minutes of verification ",
    cite2Text: "[2]",
    answerSuffix: ".",
    cite1: {
      title: "Command Escalation Window",
      section: "Section 4.1 · P1 Escalation Protocol",
      passage:
        "Upon automated alert confirmation or manual escalation of a Severity-1 outage, the on-call engineering lead must acknowledge the page and assume the Incident Commander role within fifteen (15) minutes.",
    },
    cite2: {
      title: "External Stakeholder Communication SLA",
      section: "Section 4.3 · Customer Notification Mandate",
      passage:
        "The Incident Commander or designated communications deputy must publish an initial customer-facing advisory to the trust portal within thirty (30) minutes of Sev-1 severity classification.",
    },
  },
];

export function SourceInspector() {
  const [activeScenarioId, setActiveScenarioId] = React.useState("governance");
  const [activeCite, setActiveCite] = React.useState<"cite-1" | "cite-2">("cite-1");

  const scenario =
    DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  return (
    <section id="demo" className="py-16 sm:py-24 border-t border-slate-200/60 dark:border-border/60 scroll-mt-12">
      <div id="traceability" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-card text-[#0F2D4A] dark:text-slate-200 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
              Verifiable Source Provenance
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            From question to answer to exact source passage
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Click any citation chip below to inspect how Satori links each statement directly back to verified document pages.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveScenarioId(s.id);
                setActiveCite("cite-1");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeScenarioId === s.id
                  ? "bg-[#0F2D4A] dark:bg-white text-white dark:text-[#0F2D4A] shadow-xs"
                  : "bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{s.category}</span>
            </button>
          ))}
        </div>

        {/* Dual-Pane Interactive Source Inspector Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-lg shadow-slate-900/5 overflow-hidden">
          {/* Chrome Bar */}
          <div className="h-11 px-5 border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground hidden sm:inline">
                interactive-example // source-inspector
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-500 dark:text-muted-foreground">
              Inspecting: Citation [{activeCite === "cite-1" ? "1" : "2"}]
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
                    {scenario.question}
                  </p>
                </div>

                {/* Satori Answer Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F5F7FA] dark:bg-slate-900/40 p-5 border-l-4 border-l-[#0F2D4A] dark:border-l-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#0F2D4A] dark:text-slate-200 font-heading text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
                      <span>Satori Synthesized Answer</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Source-grounded</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
                    {scenario.answerPrefix}
                    <button
                      type="button"
                      onClick={() => setActiveCite("cite-1")}
                      aria-label="Inspect Citation 1"
                      className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        activeCite === "cite-1"
                          ? "bg-[#0F2D4A] text-white shadow-2xs scale-105"
                          : "bg-slate-200 dark:bg-slate-800 text-[#0F2D4A] dark:text-slate-200 hover:bg-[#0F2D4A] hover:text-white"
                      }`}
                    >
                      {scenario.cite1Text}
                    </button>
                    {scenario.answerMiddle}
                    <button
                      type="button"
                      onClick={() => setActiveCite("cite-2")}
                      aria-label="Inspect Citation 2"
                      className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        activeCite === "cite-2"
                          ? "bg-[#0F2D4A] text-white shadow-2xs scale-105"
                          : "bg-slate-200 dark:bg-slate-800 text-[#0F2D4A] dark:text-slate-200 hover:bg-[#0F2D4A] hover:text-white"
                      }`}
                    >
                      {scenario.cite2Text}
                    </button>
                    {scenario.answerSuffix}
                  </p>
                </div>
              </div>

              {/* Citation Buttons Selector */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-slate-400 dark:text-muted-foreground uppercase block font-semibold">
                  Click a citation to inspect passage:
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCite("cite-1")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeCite === "cite-1"
                        ? "border-[#0F2D4A] dark:border-white bg-slate-100/90 dark:bg-slate-800/80 shadow-2xs ring-1 ring-[#0F2D4A]/20"
                        : "border-slate-200/70 dark:border-border/60 hover:border-slate-300 dark:hover:border-border bg-slate-50/40 dark:bg-muted/10"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0F2D4A] dark:text-white mr-2">
                        [1]
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-foreground">
                        {scenario.cite1.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                        {scenario.cite1.section}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#0F2D4A] dark:text-slate-200 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCite("cite-2")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeCite === "cite-2"
                        ? "border-[#0F2D4A] dark:border-white bg-slate-100/90 dark:bg-slate-800/80 shadow-2xs ring-1 ring-[#0F2D4A]/20"
                        : "border-slate-200/70 dark:border-border/60 hover:border-slate-300 dark:hover:border-border bg-slate-50/40 dark:bg-muted/10"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0F2D4A] dark:text-white mr-2">
                        [2]
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-foreground">
                        {scenario.cite2.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                        {scenario.cite2.section}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#0F2D4A] dark:text-slate-200 shrink-0" />
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
                    <FileText className="h-4 w-4 text-[#0F2D4A] dark:text-blue-400" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-foreground font-mono">
                      {scenario.documentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground">
                    <span>{scenario.pageInfo}</span>
                  </div>
                </div>

                {/* Simulated Document Excerpt */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-6 shadow-xs space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-2">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Document Excerpt
                    </span>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Exact passage match
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl transition-all ${
                      activeCite === "cite-1"
                        ? "bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-[#D97706] text-slate-900 dark:text-foreground font-medium shadow-2xs"
                        : "opacity-60"
                    }`}
                  >
                    <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {scenario.cite1.section}
                    </p>
                    <p>{scenario.cite1.passage}</p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl transition-all ${
                      activeCite === "cite-2"
                        ? "bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-[#D97706] text-slate-900 dark:text-foreground font-medium shadow-2xs"
                        : "opacity-60"
                    }`}
                  >
                    <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {scenario.cite2.section}
                    </p>
                    <p>{scenario.cite2.passage}</p>
                  </div>
                </div>
              </div>

              {/* Provenance Footer Callout */}
              <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-muted-foreground border-t border-slate-200/60 dark:border-border/60">
                <span className="font-medium">
                  Why this matters: Review and verify human judgment in seconds before acting.
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  Citation verified ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
