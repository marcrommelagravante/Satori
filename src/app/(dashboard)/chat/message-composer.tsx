import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowRight, Loader2, Paperclip } from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string, agentMode?: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  agentMode?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Ask a question...",
  agentMode = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
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
    <div className="p-4 sm:p-6 pt-2 shrink-0 bg-transparent">
      <div
        className={`relative flex items-center rounded-full border bg-white dark:bg-card py-1.5 pl-4 pr-1.5 shadow-xs transition-all ${
          agentMode
            ? "border-[#7C3AED]/70 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15 ring-1 ring-[#7C3AED]/20"
            : "border-slate-200/90 dark:border-border/80 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/15"
        }`}
      >
        {/* Attachment Paperclip Icon */}
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full shrink-0 cursor-pointer"
          title="Attach document or reference (coming soon)"
          aria-label="Attach file"
        >
          <Paperclip className="h-4.5 w-4.5" />
        </button>

        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            agentMode
              ? "Ask agent to analyze, compare documents, or synthesize..."
              : placeholder
          }
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none resize-none max-h-32 min-h-[36px] leading-relaxed disabled:opacity-50"
        />

        {/* Character count when close to limit */}
        {content.length > 1500 && (
          <span className="text-[10px] text-slate-400 font-mono pr-2 shrink-0">
            {content.length}/2000
          </span>
        )}

        {/* Circular Send Button matching Image 1 */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="h-9 w-9 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center transition-all shadow-xs shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}
