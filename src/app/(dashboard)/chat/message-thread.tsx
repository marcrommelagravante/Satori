"use client";

import { useEffect, useRef, useState } from "react";
import { MessageWithCitations, CitationDetail } from "@/lib/chat";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  User,
  CheckCircle2,
  FileText,
  RotateCcw,
  Bot,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { AgentThinking } from "@/components/chat/agent-thinking";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

interface MessageThreadProps {
  messages: MessageWithCitations[];
  isLoading: boolean;
  workspaceName?: string;
  workspaceId?: string;
  onSelectCitation: (citation: CitationDetail) => void;
  activeCitationId: string | null;
  onSuggestedQuestionClick: (question: string) => void;
  onRetry?: () => void;
}

export function MessageThread({
  messages,
  isLoading,
  workspaceName,
  workspaceId,
  onSelectCitation,
  activeCitationId,
  onSuggestedQuestionClick,
  onRetry,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, "up" | "down">>({});

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedbacks((prev) => ({
      ...prev,
      [id]: prev[id] === type ? (undefined as unknown as "up") : type,
    }));
  };

  const suggestedQuestions = [
    "What are the equipment and home office reimbursement policies?",
    "What are the guidelines regarding conduct and compliance?",
    "Summarize the key sections in our workspace documents.",
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 flex flex-col">
      {/* Empty State matching Image 1 */}
      {messages.length === 0 && (
        <div className="max-w-2xl mx-auto my-auto py-8 sm:py-12 text-center flex flex-col items-center">
          {/* Squircle Badge */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-violet-950/50 text-[#7C3AED] dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 shadow-xs mb-4 ring-1 ring-violet-500/10">
            <Sparkles className="h-7 w-7" />
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground mb-2">
            How can I help you today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto mb-7 leading-relaxed">
            I can search your documents, answer questions, summarize information, and more.
          </p>

          {/* Suggestion Chips in 2 Centered Rows (matching Image 1) */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onSuggestedQuestionClick(
                    "Summarize the key points in the latest report"
                  )
                }
                className="px-4 py-2 text-center rounded-full border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card hover:border-[#4F46E5]/40 hover:bg-slate-50/80 dark:hover:bg-muted/40 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all shadow-2xs cursor-pointer"
              >
                Summarize the key points in the latest report
              </button>

              <button
                type="button"
                onClick={() =>
                  onSuggestedQuestionClick("What are the company's HR policies?")
                }
                className="px-4 py-2 text-center rounded-full border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card hover:border-[#4F46E5]/40 hover:bg-slate-50/80 dark:hover:bg-muted/40 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all shadow-2xs cursor-pointer"
              >
                What are the company&apos;s HR policies?
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onSuggestedQuestionClick(
                    "Find information about the product roadmap"
                  )
                }
                className="px-4 py-2 text-center rounded-full border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card hover:border-[#4F46E5]/40 hover:bg-slate-50/80 dark:hover:bg-muted/40 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all shadow-2xs cursor-pointer"
              >
                Find information about the product roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
                isUser
                  ? "bg-[#4F46E5] text-white"
                  : "bg-[#EEF2FF] dark:bg-violet-950/50 text-[#7C3AED] dark:text-violet-400 border border-violet-100 dark:border-violet-900/40"
              }`}
            >
              {isUser ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`space-y-3 transition-all ${
                isUser
                  ? "max-w-2xl rounded-2xl rounded-tr-xs bg-[#4F46E5] text-white p-4 sm:p-5 shadow-xs"
                  : "w-full max-w-3xl lg:max-w-4xl rounded-2xl rounded-tl-xs bg-white dark:bg-[#12121A] border border-slate-200/90 dark:border-[#27272A] p-5 sm:p-6 shadow-xs text-slate-900 dark:text-foreground"
              }`}
            >
              {/* Header for Assistant */}
              {!isUser && (
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-[13px] text-foreground flex items-center gap-1.5">
                      {msg.isAgent ? (
                        <>
                          <Bot className="h-4 w-4 text-[#7C3AED] dark:text-violet-400" /> Satori Agent
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-[#7C3AED] dark:text-violet-400" /> Satori AI
                        </>
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        msg.isAgent
                          ? "text-[#4F46E5] border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40"
                          : "text-[#7C3AED] border-violet-200/60 dark:border-violet-900/60 bg-violet-50/60 dark:bg-violet-950/40"
                      }`}
                    >
                      {msg.isAgent ? "autonomous-agent" : msg.model || "gemini-3.8-flash"}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Message text */}
              <div className="text-foreground">
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm sm:text-[14.5px] leading-relaxed text-white">
                    {msg.content}
                  </p>
                ) : (
                  <MarkdownRenderer
                    content={msg.content}
                    citations={msg.citations || []}
                    activeCitationId={activeCitationId}
                    onSelectCitation={onSelectCitation}
                    isStreaming={isLoading && idx === messages.length - 1}
                  />
                )}
              </div>

              {/* Agent Tool Trace & Report Link */}
              {!isUser && (msg.toolCalls || msg.reportId) && (
                <AgentThinking
                  toolCalls={msg.toolCalls}
                  reportId={msg.reportId}
                  workspaceId={workspaceId}
                  assistantText={msg.content}
                />
              )}

              {/* Citations Footer for Assistant Messages */}
              {!isUser && msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-border/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mr-1">
                      <CheckCircle2 className="h-3 w-3 text-[#7C3AED]" /> Sources:
                    </span>
                    {msg.citations.map((c, cIdx) => {
                      const isSelected = c.id === activeCitationId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectCitation(c)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#7C3AED] text-white border-[#7C3AED] font-semibold shadow-2xs"
                              : "bg-slate-50 dark:bg-card hover:bg-slate-100 dark:hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          <FileText className="h-3 w-3 text-[#4F46E5] opacity-80" />
                          <span className="font-semibold text-[#7C3AED] dark:text-violet-300">
                            [{c.rank || cIdx + 1}]
                          </span>
                          <span className="truncate max-w-[120px]">
                            {c.documentName || "Document"}
                          </span>
                          {c.pageNumber !== null && (
                            <span className="text-muted-foreground text-[10px]">
                              p.{c.pageNumber}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Utility Action Bar for Assistant Messages */}
              {!isUser && msg.content && (
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-border/50 text-xs text-slate-500 dark:text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-muted text-[11px] font-medium transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                      title="Copy response markdown"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onRetry && idx === messages.length - 1 && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-muted text-[11px] font-medium transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        title="Regenerate response"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, "up")}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer ${
                        feedbacks[msg.id] === "up"
                          ? "text-[#7C3AED] bg-violet-50 dark:bg-violet-950/40"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, "down")}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer ${
                        feedbacks[msg.id] === "down"
                          ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                      title="Unhelpful response"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamp for user */}
              {isUser && (
                <div className="text-right text-[10px] text-primary-foreground/70 pt-0.5">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Skeleton before first tokens arrive */}
      {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].role === "user" || messages[messages.length - 1].content.length === 0) && (
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="h-4 w-4 animate-spin" />
          </div>
          <div className="max-w-md rounded-2xl rounded-tl-xs border border-border bg-card p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">
                Satori AI
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary animate-ping" />
              <span className="text-[10px] text-muted-foreground">
                Retrieving chunks & generating grounded response...
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 bg-muted rounded-full w-4/5 animate-pulse" />
              <div className="h-2.5 bg-muted rounded-full w-full animate-pulse" />
              <div className="h-2.5 bg-muted rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
