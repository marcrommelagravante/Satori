"use client";

import { useState, useTransition } from "react";
import { Conversation } from "@/lib/db/schema";
import { MessageWithCitations, CitationDetail } from "@/lib/chat";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { MessageComposer } from "./message-composer";
import { CitationPanel } from "./citation-panel";
import {
  sendMessageAction,
  createConversationAction,
  deleteConversationAction,
  getConversationMessagesAction,
} from "@/app/actions/chat";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageSquare,
  History,
  Bot,
  ChevronDown,
  BookOpen,
} from "lucide-react";

interface ChatContainerProps {
  workspaceId: string;
  workspaceName: string;
  initialConversations: Conversation[];
  initialConversationId: string | null;
  initialMessages: MessageWithCitations[];
}

export function ChatContainer({
  workspaceId,
  workspaceName,
  initialConversations,
  initialConversationId,
  initialMessages,
}: ChatContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(initialConversationId);
  const [messages, setMessages] =
    useState<MessageWithCitations[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [agentMode, setAgentMode] = useState(false);

  // Citation panel state
  const [activeCitations, setActiveCitations] = useState<CitationDetail[]>(() => {
    // Find citations from the last assistant message if any
    const lastAssistantWithCitations = [...initialMessages]
      .reverse()
      .find((m) => m.role === "assistant" && m.citations && m.citations.length > 0);
    return lastAssistantWithCitations?.citations || [];
  });
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(
    null
  );
  const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);

  const [, startTransition] = useTransition();

  const syncUrlParam = (convId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (convId) {
      params.set("conv", convId);
    } else {
      params.delete("conv");
    }
    router.replace(`/chat?${params.toString()}`);
  };

  const handleSelectConversation = async (id: string) => {
    if (id === activeConversationId) return;

    setActiveConversationId(id);
    syncUrlParam(id);

    // Fetch messages for selected conversation
    startTransition(async () => {
      const res = await getConversationMessagesAction(id, workspaceId);
      if (res.success && res.messages) {
        setMessages(res.messages);

        const lastWithCitations = [...res.messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.citations && m.citations.length > 0);

        if (lastWithCitations?.citations && lastWithCitations.citations.length > 0) {
          setActiveCitations(lastWithCitations.citations);
          setSelectedCitationId(lastWithCitations.citations[0].id);
        } else {
          setActiveCitations([]);
          setIsCitationPanelOpen(false);
        }
      }
    });
  };

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const res = await createConversationAction(workspaceId);
      if (res.success && res.conversation) {
        setConversations((prev) => [res.conversation!, ...prev]);
        setActiveConversationId(res.conversation.id);
        setMessages([]);
        setActiveCitations([]);
        setIsCitationPanelOpen(false);
        syncUrlParam(res.conversation.id);
      }
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);

    if (activeConversationId === id) {
      const nextActive = remaining[0]?.id || null;
      setActiveConversationId(nextActive);
      syncUrlParam(nextActive);

      if (nextActive) {
        const res = await getConversationMessagesAction(nextActive, workspaceId);
        if (res.success && res.messages) {
          setMessages(res.messages);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    }

    await deleteConversationAction(id, workspaceId);
  };

  const handleSendMessage = async (content: string, explicitAgentMode?: boolean) => {
    if (!content.trim() || isLoading) return;
    const isAgent = explicitAgentMode !== undefined ? explicitAgentMode : agentMode;

    let targetConvId = activeConversationId;

    // Create conversation on first message if none is active
    if (!targetConvId) {
      const convRes = await createConversationAction(workspaceId);
      if (convRes.success && convRes.conversation) {
        targetConvId = convRes.conversation.id;
        setActiveConversationId(targetConvId);
        setConversations((prev) => [convRes.conversation!, ...prev]);
        syncUrlParam(targetConvId);
      } else {
        return;
      }
    }

    // Optimistic user message insertion
    const tempUserMessage: MessageWithCitations = {
      id: `temp-${Date.now()}`,
      conversationId: targetConvId,
      role: "user",
      content,
      model: null,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const res = await sendMessageAction({
        conversationId: targetConvId,
        workspaceId,
        content,
        agentMode: isAgent,
      });

      if (res.success && res.assistantMessage) {
        const assistantWithCitations: MessageWithCitations = {
          ...res.assistantMessage,
          citations: res.citations || [],
          toolCalls: res.toolCalls,
          reportId: res.reportId,
          isAgent: res.isAgent,
        };

        // Replace optimistic user message with real one from DB and add assistant message
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
          return [
            ...filtered,
            res.userMessage ? { ...res.userMessage, citations: [] } : tempUserMessage,
            assistantWithCitations,
          ];
        });

        // If citations were returned, set them and open panel
        if (res.citations && res.citations.length > 0) {
          setActiveCitations(res.citations);
          setSelectedCitationId(res.citations[0].id);
          setIsCitationPanelOpen(true);
        }

        // Update conversation title in the list if this was the first turn
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId && c.title === "New Conversation") {
              const preview = content.slice(0, 45);
              return {
                ...c,
                title: preview + (content.length > 45 ? "..." : ""),
                updatedAt: new Date(),
              };
            }
            return c;
          })
        );
      } else {
        // Handle error message gracefully
        const errorMsg: MessageWithCitations = {
          id: `err-${Date.now()}`,
          conversationId: targetConvId,
          role: "assistant",
          content:
            res.error ||
            "I encountered an issue generating an answer. Please try again or verify your documents are indexed.",
          model: "error",
          createdAt: new Date(),
          citations: [],
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: MessageWithCitations = {
        id: `err-${Date.now()}`,
        conversationId: targetConvId,
        role: "assistant",
        content:
          "Network error while communicating with AI service. Please check your connection and try again.",
        model: "error",
        createdAt: new Date(),
        citations: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCitation = (citation: CitationDetail) => {
    setSelectedCitationId(citation.id);
    setIsCitationPanelOpen(true);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
      {/* 1. Header (Outside Card, matching Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
            AI Chat
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
            Ask questions, get insights, and explore your knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* History Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-border hover:bg-slate-50 dark:hover:bg-muted/60 transition-all shadow-2xs cursor-pointer"
            title="View chat history"
          >
            <History className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
            <span className="hidden sm:inline">History</span>
            {conversations.length > 0 && (
              <span className="text-[10px] bg-slate-100 dark:bg-muted px-1.5 py-0.2 rounded-full font-mono text-slate-600 dark:text-slate-400">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Agent Mode Toggle Pill */}
          <button
            type="button"
            onClick={() => setAgentMode(!agentMode)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all shadow-2xs cursor-pointer ${
              agentMode
                ? "bg-[#EEF2FF] dark:bg-indigo-950/50 border-[#C7D2FE] dark:border-indigo-800 text-[#4F46E5] dark:text-indigo-400 font-semibold"
                : "bg-white dark:bg-card border-slate-200/90 dark:border-border/80 text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted/60"
            }`}
            title={
              agentMode
                ? "Agent Mode enabled: multi-step tool reasoning"
                : "Click to enable Agent Mode"
            }
          >
            <Bot className="h-3.5 w-3.5" />
            <span>{agentMode ? "Agent Mode" : "Grounded RAG"}</span>
            {agentMode && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Model Selector Dropdown Pill (Image 1 replica) */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-border/80 bg-white dark:bg-card px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
            <span>Gemini 2.0 Flash</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* Citations / Sources Indicator Button */}
          {activeCitations.length > 0 && !isCitationPanelOpen && (
            <button
              type="button"
              onClick={() => setIsCitationPanelOpen(true)}
              className="text-xs text-[#7C3AED] dark:text-violet-400 hover:bg-violet-100/60 dark:hover:bg-violet-950/50 flex items-center gap-1.5 font-medium bg-[#F5F3FF] dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Sources ({activeCitations.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Chat Card (Image 1 replica) */}
      <div className="flex-1 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs flex flex-col overflow-hidden relative min-h-0">
        {/* Message Thread */}
        <MessageThread
          messages={messages}
          isLoading={isLoading}
          workspaceName={workspaceName}
          onSelectCitation={handleSelectCitation}
          activeCitationId={selectedCitationId}
          onSuggestedQuestionClick={(q) => handleSendMessage(q, agentMode)}
        />

        {/* Floating Pill Composer */}
        <MessageComposer
          onSend={handleSendMessage}
          disabled={isLoading}
          agentMode={agentMode}
        />
      </div>

      {/* 3. Slide-over Drawers */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isCreating={isCreatingChat}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {isCitationPanelOpen && activeCitations.length > 0 && (
        <CitationPanel
          citations={activeCitations}
          selectedCitationId={selectedCitationId}
          onSelectCitation={(id) => setSelectedCitationId(id)}
          onClose={() => setIsCitationPanelOpen(false)}
        />
      )}
    </div>
  );
}
