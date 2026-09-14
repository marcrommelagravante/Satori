"use client";

import { useEffect, useRef, Fragment } from "react";
import { MessageWithCitations, CitationDetail } from "@/lib/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  User,
  BookOpen,
  CheckCircle2,
  FileText,
  RotateCcw,
  BotMessageSquare,
  Bot,
} from "lucide-react";
import { AgentThinking } from "@/components/chat/agent-thinking";

interface MessageThreadProps {
  messages: MessageWithCitations[];
  isLoading: boolean;
  workspaceName?: string;
  onSelectCitation: (citation: CitationDetail) => void;
  activeCitationId: string | null;
  onSuggestedQuestionClick: (question: string) => void;
  onRetry?: () => void;
}

export function MessageThread({
  messages,
  isLoading,
  workspaceName,
  onSelectCitation,
  activeCitationId,
  onSuggestedQuestionClick,
  onRetry,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    "What are the equipment and home office reimbursement policies?",
    "What are the guidelines regarding conduct and compliance?",
    "Summarize the key sections in our workspace documents.",
  ];

  // Helper to parse inline [source-N] markers in assistant text
  const renderMessageContent = (
    text: string,
    citations: CitationDetail[] = []
  ) => {
    // Regex splits by [source-N], [source:N], [source N]
    const parts = text.split(/(\[source[-_:]?\s*\d+\])/gi);

    return parts.map((part, index) => {
      const match = part.match(/\[source[-_:]?\s*(\d+)\]/i);
      if (match) {
        const sourceRank = parseInt(match[1], 10);
        const matchedCitation =
          citations.find((c) => c.rank === sourceRank) ||
          citations[sourceRank - 1];

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (matchedCitation) {
                onSelectCitation(matchedCitation);
              }
            }}
            className={`inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.2 rounded-md text-[11px] font-semibold transition-all cursor-pointer align-baseline ${
              matchedCitation && matchedCitation.id === activeCitationId
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "bg-secondary/15 text-secondary hover:bg-secondary/25 border border-secondary/30"
            }`}
            title={
              matchedCitation
                ? `Source ${sourceRank}: ${matchedCitation.documentName || "Document"}`
                : `Source ${sourceRank}`
            }
          >
            <BookOpen className="h-2.5 w-2.5" />
            <span>[{sourceRank}]</span>
          </button>
        );
      }

      // Format markdown-style paragraphs and newlines
      const lines = part.split("\n");
      return (
        <Fragment key={index}>
          {lines.map((line, lIdx) => (
            <Fragment key={lIdx}>
              {line}
              {lIdx < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </Fragment>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="max-w-xl mx-auto py-12 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary shadow-xs">
            <BotMessageSquare className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              Ask anything about your workspace documents
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Satori retrieves relevant chunks from{" "}
              <strong>{workspaceName || "your workspace"}</strong> and generates
              verifiable answers with real source citations.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested Questions
            </p>
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestedQuestionClick(q)}
                  className="p-3 text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 text-xs text-foreground transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span>{q}</span>
                  <Sparkles className="h-3.5 w-3.5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.map((msg) => {
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
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
              className={`max-w-2xl rounded-2xl p-4 text-sm space-y-2 shadow-2xs transition-all ${
                isUser
                  ? "bg-primary text-primary-foreground rounded-tr-xs"
                  : "bg-card border border-border text-foreground rounded-tl-xs"
              }`}
            >
              {/* Header for Assistant */}
              {!isUser && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1">
                      {msg.isAgent ? (
                        <>
                          <Bot className="h-3.5 w-3.5 text-primary" /> Satori Agent
                        </>
                      ) : (
                        "Satori AI"
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        msg.isAgent
                          ? "text-primary border-primary/30 bg-primary/10"
                          : "text-secondary border-secondary/30 bg-secondary/10"
                      }`}
                    >
                      {msg.isAgent ? "agent-loop" : msg.model || "gemini-3.6-flash"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}

              {/* Message text */}
              <div
                className={`leading-relaxed text-[13px] ${
                  isUser ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>{renderMessageContent(msg.content, msg.citations)}</div>
                )}
              </div>

              {/* Agent Tool Trace & Report Link */}
              {!isUser && (msg.toolCalls || msg.reportId) && (
                <AgentThinking
                  toolCalls={msg.toolCalls}
                  reportId={msg.reportId}
                />
              )}

              {/* Citations Footer for Assistant Messages */}
              {!isUser && msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mr-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" /> Sources:
                    </span>
                    {msg.citations.map((c, idx) => {
                      const isSelected = c.id === activeCitationId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectCitation(c)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-secondary text-secondary-foreground border-secondary font-semibold shadow-2xs"
                              : "bg-background hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          <FileText className="h-3 w-3 text-primary opacity-80" />
                          <span className="font-semibold text-secondary">
                            [{c.rank || idx + 1}]
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

      {/* Loading Skeleton */}
      {isLoading && (
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
