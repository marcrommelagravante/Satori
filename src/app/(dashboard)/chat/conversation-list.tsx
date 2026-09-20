"use client";

import { useState } from "react";
import { Conversation } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Search, X, History } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isCreating?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isCreating = false,
  isOpen = true,
  onClose,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-card border-r border-slate-200/80 dark:border-border/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">
                Chat History
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-foreground cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* New Chat Button & Search */}
        <div className="p-3.5 border-b border-slate-200/70 dark:border-border/70 space-y-2 bg-slate-50/50 dark:bg-muted/10">
          <Button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            disabled={isCreating}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl justify-center gap-2 text-xs font-semibold h-9 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-background rounded-lg border border-slate-200/80 dark:border-border focus:outline-hidden focus:border-[#4F46E5] text-slate-900 dark:text-foreground placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </div>
        </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            {conversations.length === 0
              ? "No chats yet. Start a new conversation above!"
              : "No conversations match your search."}
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isConfirming = confirmDeleteId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 font-semibold border border-[#C7D2FE] dark:border-indigo-800/40 shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted/60"
                }`}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose?.();
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-6">
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? "text-[#4F46E5] dark:text-indigo-400" : "text-slate-400"
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate text-xs font-medium">{conv.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-normal">
                      {formatTime(conv.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Delete button or confirmation */}
                <div
                  className="absolute right-2 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isConfirming ? (
                    <div className="flex items-center gap-1 bg-white dark:bg-card px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-border shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteConversation(conv.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Del
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-foreground cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all rounded cursor-pointer"
                      aria-label="Delete conversation"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  </>
);
}
