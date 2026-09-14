import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Sparkles, Loader2, Bot } from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string, agentMode?: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultAgentMode?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Ask a question about your documents...",
  defaultAgentMode = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [agentMode, setAgentMode] = useState(defaultAgentMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [content]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, agentMode);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/80 backdrop-blur-xs">
      <div
        className={`relative rounded-2xl border bg-background focus-within:ring-2 transition-all shadow-xs ${
          agentMode
            ? "border-primary/60 focus-within:border-primary focus-within:ring-primary/25 ring-1 ring-primary/20"
            : "border-border focus-within:border-primary/50 focus-within:ring-primary/20"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            agentMode
              ? "Agent Mode active — ask to compare documents, summarize, or create reports..."
              : placeholder
          }
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50 min-h-[52px] max-h-[180px]"
        />

        <div className="absolute bottom-2.5 left-4 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setAgentMode(!agentMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                agentMode
                  ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/40"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
              title={
                agentMode
                  ? "Agent Mode: Autonomous multi-step tool reasoning enabled"
                  : "Click to enable Agent Mode"
              }
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Agent Mode</span>
              {agentMode && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-secondary" />
              <span>{agentMode ? "Multi-tool reasoning" : "Grounded RAG"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {content.length > 1500 && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {content.length}/2000
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={!content.trim() || disabled}
              className="h-8 w-8 rounded-xl p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs"
              aria-label="Send message"
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-center text-muted-foreground">
        Press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">Enter</kbd> to send, <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">Shift + Enter</kbd> for a new line
      </p>
    </div>
  );
}
