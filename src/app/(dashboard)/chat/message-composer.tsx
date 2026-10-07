import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  ArrowRight,
  Loader2,
  Paperclip,
  Square,
  Search,
  X,
  FileText,
  Check,
  Sparkles,
} from "lucide-react";

export interface DocumentAttachmentItem {
  id: string;
  name: string;
  category?: string | null;
  status?: string;
  fileSize?: number | null;
  mimeType?: string | null;
}

interface MessageComposerProps {
  onSend: (
    content: string,
    agentMode?: boolean,
    documentIds?: string[]
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  agentMode?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  availableDocuments?: DocumentAttachmentItem[];
  selectedDocumentIds?: string[];
  onToggleDocument?: (documentId: string) => void;
  onClearDocuments?: () => void;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Ask a question...",
  agentMode = false,
  isStreaming = false,
  onStop,
  availableDocuments = [],
  selectedDocumentIds = [],
  onToggleDocument,
  onClearDocuments,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Click outside to dismiss document picker popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when popover opens
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(
      trimmed,
      agentMode,
      selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined
    );
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const filteredDocs = availableDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const selectedDocsList = availableDocuments.filter((d) =>
    selectedDocumentIds.includes(d.id)
  );

  return (
    <div className="p-4 sm:p-6 pt-2 shrink-0 bg-transparent flex flex-col gap-2 relative">
      {/* 1. Selected Document Chips Bar (Sticky above composer) */}
      {selectedDocsList.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-card/70 border border-slate-200/80 dark:border-border/80 text-xs shadow-2xs transition-all">
          <div className="flex items-center gap-1.5 text-primary font-medium shrink-0 mr-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[11px]">
              Scoped to {selectedDocsList.length} doc
              {selectedDocsList.length === 1 ? "" : "s"}:
            </span>
          </div>

          {selectedDocsList.map((doc) => (
            <div
              key={doc.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-muted border border-slate-200 dark:border-border/60 text-slate-800 dark:text-foreground text-[11px] font-medium shadow-2xs group hover:border-primary/40 transition-colors"
            >
              <FileText className="h-3 w-3 text-primary shrink-0" />
              <span
                className="max-w-[140px] truncate"
                title={doc.name}
              >
                {doc.name}
              </span>
              {onToggleDocument && (
                <button
                  type="button"
                  onClick={() => onToggleDocument(doc.id)}
                  className="text-slate-400 hover:text-red-500 rounded-sm p-0.5 transition-colors cursor-pointer"
                  title={`Remove ${doc.name}`}
                  aria-label={`Remove ${doc.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {onClearDocuments && selectedDocsList.length >= 2 && (
            <button
              type="button"
              onClick={onClearDocuments}
              className="ml-auto text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2 transition-colors cursor-pointer shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* 2. Floating Document Picker Popover */}
      {isPickerOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-3 left-4 sm:left-6 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>Scope to Workspace Documents</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              aria-label="Close document picker"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted/50 border border-border/60 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Document Checklist */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {availableDocuments.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No indexed documents found in this workspace. Upload files in
                the Documents section to scope your queries.
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No documents match &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocumentIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onToggleDocument?.(doc.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium border border-primary/20"
                        : "hover:bg-muted/70 text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-4 w-4 rounded-md flex items-center justify-center border text-[10px] shrink-0 transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-slate-300 dark:border-border bg-white dark:bg-card"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate" title={doc.name}>
                        {doc.name}
                      </span>
                    </div>

                    {doc.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 uppercase tracking-wider font-semibold">
                        {doc.category}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
            <span>
              {selectedDocumentIds.length} of {availableDocuments.length}{" "}
              selected
            </span>
            <div className="flex items-center gap-2">
              {selectedDocumentIds.length > 0 && onClearDocuments && (
                <button
                  type="button"
                  onClick={onClearDocuments}
                  className="hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Message Composer Pill */}
      <div
        className={`relative flex items-center rounded-full border bg-white dark:bg-card py-1.5 pl-3 pr-1.5 shadow-xs transition-all ${
          agentMode
            ? "border-[#7C3AED]/70 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15 ring-1 ring-[#7C3AED]/20"
            : selectedDocumentIds.length > 0
            ? "border-primary/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ring-1 ring-primary/20"
            : "border-slate-200/90 dark:border-border/80 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/15"
        }`}
      >
        {/* Attachment Paperclip Button with badge */}
        <button
          type="button"
          onClick={() => setIsPickerOpen((prev) => !prev)}
          className={`relative p-1.5 rounded-full shrink-0 transition-colors cursor-pointer ${
            selectedDocumentIds.length > 0
              ? "text-primary hover:text-primary/80 bg-primary/10"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
          title={
            selectedDocumentIds.length > 0
              ? `Scoped to ${selectedDocumentIds.length} attached document(s) - click to manage`
              : "Attach workspace documents to scope search"
          }
          aria-label="Attach documents"
          aria-expanded={isPickerOpen}
        >
          <Paperclip className="h-4 w-4" />
          {selectedDocumentIds.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-card">
              {selectedDocumentIds.length}
            </span>
          )}
        </button>

        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            agentMode
              ? selectedDocumentIds.length >= 2
                ? "Ask agent to compare attached documents or extract key differences..."
                : "Ask agent to analyze, synthesize, or create reports..."
              : selectedDocumentIds.length > 0
              ? `Ask question scoped to ${selectedDocumentIds.length} attached document(s)...`
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

        {/* Circular Send / Stop Button */}
        {isStreaming && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            className={`h-9 w-9 rounded-full text-white flex items-center justify-center transition-all shadow-xs shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
              agentMode
                ? "bg-[#7C3AED] hover:bg-[#6D28D9]"
                : "bg-[#4F46E5] hover:bg-[#4338CA]"
            }`}
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4.5 w-4.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
