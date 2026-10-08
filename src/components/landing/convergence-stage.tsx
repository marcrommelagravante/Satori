"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  FileText,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Database,
} from "lucide-react";
import {
  CONVERGENCE_SCENARIOS,
  type Scenario,
} from "./convergence-scenarios";

export function ConvergenceStage() {
  const reduceMotion = useReducedMotion();
  const [scenarioIndex, setScenarioIndex] = React.useState(0);
  const scenario = CONVERGENCE_SCENARIOS[scenarioIndex];

  // Animation phase: 0 = scattered, 1 = chunking, 2 = indexing, 3 = question, 4 = answering, 5 = resolved
  const [phase, setPhase] = React.useState<number>(reduceMotion ? 5 : 0);
  const [visibleTokenCount, setVisibleTokenCount] = React.useState<number>(
    reduceMotion ? scenario.answerTokens.length : 0
  );
  const [activeCitationId, setActiveCitationId] = React.useState<string | null>(null);
  const [isReplaying, setIsReplaying] = React.useState(false);

  const tokenStreamIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Run the sequence
  const startSequence = React.useCallback(
    (targetScenario: Scenario, isQuickReplay = false) => {
      if (tokenStreamIntervalRef.current) {
        clearInterval(tokenStreamIntervalRef.current);
      }

      if (reduceMotion) {
        setPhase(5);
        setVisibleTokenCount(targetScenario.answerTokens.length);
        setIsReplaying(false);
        return;
      }

      const t0 = setTimeout(() => {
        setIsReplaying(true);
        setPhase(0);
        setVisibleTokenCount(0);
        setActiveCitationId(null);
      }, 0);

      const scatterDuration = isQuickReplay ? 300 : 700;
      const chunkDuration = isQuickReplay ? 350 : 700;
      const indexDuration = isQuickReplay ? 350 : 600;
      const queryDuration = isQuickReplay ? 250 : 350;

      // Phase 1: Chunking
      const t1 = setTimeout(() => {
        setPhase(1);
      }, scatterDuration);

      // Phase 2: Indexing
      const t2 = setTimeout(() => {
        setPhase(2);
      }, scatterDuration + chunkDuration);

      // Phase 3: Question
      const t3 = setTimeout(() => {
        setPhase(3);
      }, scatterDuration + chunkDuration + indexDuration);

      // Phase 4: Answering & token streaming
      const t4 = setTimeout(() => {
        setPhase(4);
        let currentToken = 0;
        const tokenInterval = isQuickReplay ? 22 : 32;

        tokenStreamIntervalRef.current = setInterval(() => {
          currentToken += 1;
          setVisibleTokenCount(currentToken);
          if (currentToken >= targetScenario.answerTokens.length) {
            if (tokenStreamIntervalRef.current) {
              clearInterval(tokenStreamIntervalRef.current);
            }
            setPhase(5);
            setIsReplaying(false);
          }
        }, tokenInterval);
      }, scatterDuration + chunkDuration + indexDuration + queryDuration);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        if (tokenStreamIntervalRef.current) {
          clearInterval(tokenStreamIntervalRef.current);
        }
      };
    },
    [reduceMotion]
  );

  React.useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        startSequence(scenario, false);
      }
    }, 10);
    return () => {
      active = false;
      clearTimeout(timer);
      if (tokenStreamIntervalRef.current) {
        clearInterval(tokenStreamIntervalRef.current);
      }
    };
  }, [scenario, startSequence]);

  const handleSelectScenario = (index: number) => {
    if (index === scenarioIndex && !isReplaying) {
      startSequence(CONVERGENCE_SCENARIOS[index], true);
      return;
    }
    setScenarioIndex(index);
  };

  const handleReplay = () => {
    startSequence(scenario, true);
  };

  const getFormatBadge = (fmt: string) => {
    switch (fmt) {
      case "pdf":
        return {
          label: "PDF",
          bg: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
        };
      case "docx":
        return {
          label: "DOCX",
          bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
        };
      default:
        return {
          label: "TXT",
          bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const activeCitation = scenario.citations.find((c) => c.id === activeCitationId);

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Stage Container */}
      <div className="relative w-full rounded-2xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-lg shadow-indigo-500/5 overflow-hidden flex flex-col min-h-[460px] sm:min-h-[480px]">
        {/* Window Chrome Header */}
        <div className="h-10 px-4 border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-muted/30 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 dark:bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/70" />
            <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-muted-foreground">
              satori // knowledge-convergence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              disabled={isReplaying}
              aria-label="Replay convergence animation"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isReplaying ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Main Animation Stage Area */}
        <div className="relative flex-1 p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
          {/* Subtle Ambient Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Top Half: Document Ingestion & Chunk Indexing Grid */}
          <div className="relative z-10 w-full mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                <Database className="h-3 w-3 text-[#4F46E5] dark:text-indigo-400" />
                <span>Workspace Knowledge Partition</span>
              </span>
              <span className="font-mono text-[10.5px] text-slate-400 dark:text-muted-foreground">
                {phase < 2
                  ? "Processing raw files..."
                  : `${scenario.chunks.length} chunks vectorized in pgvector`}
              </span>
            </div>

            {/* Stage Grid: Transitions between scattered docs and vectorized chunks */}
            <div className="min-h-[110px] sm:min-h-[120px] relative">
              <AnimatePresence mode="wait">
                {phase === 0 ? (
                  /* Phase 0: Raw Scattered Files */
                  <motion.div
                    key="scattered-docs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                  >
                    {scenario.documents.map((doc, idx) => {
                      const badge = getFormatBadge(doc.format);
                      const rotation = idx === 0 ? -1.5 : idx === 1 ? 1.5 : -0.5;
                      return (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 12, rotate: 0 }}
                          animate={{ opacity: 1, y: 0, rotate: rotation }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                          className="rounded-xl border border-slate-200/80 dark:border-border/80 bg-slate-50/80 dark:bg-muted/40 p-3 shadow-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-white dark:bg-card border border-slate-200/60 dark:border-border/60 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-foreground truncate">
                                {doc.name}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-muted-foreground">
                                {doc.size}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  /* Phase 1+: Vectorized Indexed Chunks Rail */
                  <motion.div
                    key="indexed-chunks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    {scenario.chunks.map((chunk, idx) => {
                      const isHighlighted =
                        activeCitation && activeCitation.chunkId === chunk.id;
                      return (
                        <motion.div
                          key={chunk.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: isHighlighted ? 1.02 : 1,
                          }}
                          transition={{
                            duration: 0.35,
                            delay: idx * 0.06,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={`rounded-xl border p-2.5 transition-all text-left ${
                            isHighlighted
                              ? "border-[#7C3AED] bg-purple-50/70 dark:bg-purple-950/40 shadow-xs ring-1 ring-[#7C3AED]/30"
                              : "border-slate-200/70 dark:border-border/60 bg-slate-50/50 dark:bg-muted/20 hover:border-slate-300 dark:hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 truncate max-w-[180px]">
                              {chunk.docName}
                            </span>
                            <span className="font-mono text-[9.5px] text-slate-400 dark:text-muted-foreground">
                              {chunk.page ? `p.${chunk.page}` : "sec"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {chunk.previewText}
                          </p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Half: Question, Grounded AI Answer & Verifiable Citation Chips */}
          <div className="relative z-10 w-full space-y-3 pt-3 border-t border-slate-100 dark:border-border/60">
            {/* User Query Bubble */}
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: phase >= 3 ? 1 : 0.35, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5"
            >
              <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Q
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                {scenario.question}
              </p>
            </motion.div>

            {/* Satori Grounded AI Answer Box with Violet Semantic Framing */}
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: phase >= 4 ? 1 : 0.2, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl border border-purple-200/80 dark:border-purple-900/50 bg-[#F5F3FF]/60 dark:bg-[#1E1B4B]/30 p-3.5 sm:p-4 border-l-3 border-l-[#7C3AED] relative"
            >
              {/* Header: Satori AI Indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[#7C3AED] dark:text-purple-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-heading text-xs font-bold tracking-tight">
                    Satori AI
                  </span>
                  <span className="font-mono text-[9.5px] uppercase text-[#7C3AED]/70 dark:text-purple-300/70 ml-1">
                    Grounded Answer
                  </span>
                </div>

                {phase === 5 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {/* Streaming Answer Text */}
              <div
                aria-live="polite"
                className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed min-h-[38px]"
              >
                {scenario.answerTokens
                  .slice(0, visibleTokenCount)
                  .join(" ")}
                {phase === 4 && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#7C3AED] ml-1 animate-pulse align-middle" />
                )}
              </div>

              {/* Citations Springs */}
              {phase >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-2.5 border-t border-purple-100 dark:border-purple-900/40 flex flex-wrap items-center gap-2"
                >
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-muted-foreground mr-1">
                    Sources:
                  </span>
                  {scenario.citations.map((cite) => {
                    const isSelected = activeCitationId === cite.id;
                    return (
                      <button
                        key={cite.id}
                        type="button"
                        onClick={() =>
                          setActiveCitationId(isSelected ? null : cite.id)
                        }
                        onMouseEnter={() => setActiveCitationId(cite.id)}
                        onMouseLeave={() => setActiveCitationId(null)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10.5px] transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs"
                            : "bg-white dark:bg-card text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:border-[#7C3AED]"
                        }`}
                      >
                        <span className="font-bold">[{cite.index}]</span>
                        <span className="truncate max-w-[120px] sm:max-w-[160px]">
                          {cite.docName}
                        </span>
                        {cite.page && (
                          <span className="opacity-70">p.{cite.page}</span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {CONVERGENCE_SCENARIOS.map((sc, idx) => {
            const isActive = idx === scenarioIndex;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted/50"
                }`}
              >
                {sc.tabLabel}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-400 dark:text-muted-foreground hidden sm:inline">
          Click tabs to test real knowledge scenarios
        </span>
      </div>
    </div>
  );
}
