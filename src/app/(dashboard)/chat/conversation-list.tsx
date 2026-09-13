"use client";

import { useState } from "react";
import { Conversation } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Search } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isCreating?: boolean;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isCreating = false,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    <div className="w-64 sm:w-72 border-r border-border bg-card flex flex-col h-full shrink-0 shadow-2xs">
      {/* New Chat Button */}
      <div className="p-3 border-b border-border space-y-2">
        <Button
          onClick={onNewChat}
          disabled={isCreating}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl justify-start gap-2 text-xs font-semibold h-9 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>

        {conversations.length > 5 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/40 rounded-lg border border-border focus:outline-hidden focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
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
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium border border-primary/20 shadow-2xs"
                    : "text-foreground hover:bg-muted/60"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center gap-2 min-w-0 pr-6">
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate text-xs">{conv.title}</p>
                    <p className="text-[10px] text-muted-foreground font-normal">
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
                    <div className="flex items-center gap-1 bg-card px-1.5 py-0.5 rounded-md border border-border shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteConversation(conv.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[10px] text-destructive hover:underline font-semibold"
                      >
                        Del
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all rounded"
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
    </div>
  );
}
