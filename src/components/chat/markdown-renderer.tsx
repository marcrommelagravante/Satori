"use client";

import React, { Fragment, useState } from "react";
import { BookOpen, Copy, Check } from "lucide-react";
import { CitationDetail } from "@/lib/chat";

interface MarkdownRendererProps {
  content: string;
  citations?: CitationDetail[];
  activeCitationId?: string | null;
  onSelectCitation?: (citation: CitationDetail) => void;
  isStreaming?: boolean;
}

/**
 * Streaming-safe rich Markdown renderer for Satori AI responses.
 * Provides typography hierarchy, lists, blockquotes, code blocks, tables,
 * and interactive inline citation badges.
 */
export function MarkdownRenderer({
  content,
  citations = [],
  activeCitationId,
  onSelectCitation,
  isStreaming = false,
}: MarkdownRendererProps) {
  if (!content) return null;

  // 1. Normalize citation brackets e.g. [[4]] -> [source-4], [1, 2] -> [source-1] [source-2]
  const normalized = normalizeCitations(content);

  // 2. Parse text into structured blocks (code blocks, tables, headers, lists, paragraphs)
  const blocks = parseMarkdownBlocks(normalized);

  return (
    <div className="space-y-3 text-[14px] sm:text-[14.5px] leading-[1.68] text-slate-800 dark:text-slate-100 font-normal break-words">
      {blocks.map((block, bIdx) => (
        <BlockItem
          key={bIdx}
          block={block}
          citations={citations}
          activeCitationId={activeCitationId}
          onSelectCitation={onSelectCitation}
        />
      ))}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-[#4F46E5] dark:bg-violet-400 animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Citation Normalizer
// ---------------------------------------------------------------------------
function normalizeCitations(text: string): string {
  // First normalize double brackets e.g. [[4]] -> [source-4]
  let result = text.replace(/\[\[\s*(\d+)\s*\]\]/g, "[source-$1]");

  // Normalize comma/space separated citations like [source-1, source-2] or [1, 2]
  result = result.replace(/\[([0-9\s,;a-z_-]+)\]/gi, (fullMatch, inner) => {
    const trimmed = inner.trim();
    if (/source/i.test(trimmed) || /^[0-9\s,;-]+$/.test(trimmed)) {
      const numbers = [...trimmed.matchAll(/\d+/g)].map((m) => m[0]);
      if (numbers.length > 1) {
        return numbers.map((n) => `[source-${n}]`).join(" ");
      }
      if (numbers.length === 1 && !/source/i.test(trimmed)) {
        return `[source-${numbers[0]}]`;
      }
    }
    return fullMatch;
  });

  return result;
}

// ---------------------------------------------------------------------------
// Block Parser
// ---------------------------------------------------------------------------
type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: { num: number; text: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(rawText: string): Block[] {
  const blocks: Block[] = [];
  const lines = rawText.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block
    if (line.trim().startsWith("```")) {
      const langMatch = line.trim().match(/^```([a-z0-9_-]*)/i);
      const language = langMatch ? langMatch[1] : "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```
      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // Markdown Table: header line followed by separator line
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith("|") &&
      /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())
    ) {
      const headers = line
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        rows.push(row);
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Headings: #, ##, ###
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "quote",
        text: quoteLines.join("\n"),
      });
      continue;
    }

    // Unordered List: * or -
    if (/^\s*[*+-]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[*+-]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[*+-]\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered List: 1. 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: { num: number; text: string }[] = [];
      while (i < lines.length && /^\s*(\d+)\.\s+/.test(lines[i])) {
        const match = lines[i].match(/^\s*(\d+)\.\s+(.*)$/);
        if (match) {
          items.push({
            num: parseInt(match[1], 10),
            text: match[2].trim(),
          });
        }
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph (accumulate non-empty lines)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*[*+-]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !(lines[i].trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().startsWith("|"))
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({
      type: "paragraph",
      text: pLines.join("\n"),
    });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Block Renderer
// ---------------------------------------------------------------------------
function BlockItem({
  block,
  citations,
  activeCitationId,
  onSelectCitation,
}: {
  block: Block;
  citations: CitationDetail[];
  activeCitationId?: string | null;
  onSelectCitation?: (citation: CitationDetail) => void;
}) {
  switch (block.type) {
    case "heading": {
      const renderText = (
        <InlineContent
          text={block.text}
          citations={citations}
          activeCitationId={activeCitationId}
          onSelectCitation={onSelectCitation}
        />
      );
      if (block.level === 1) {
        return (
          <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-foreground mt-4 mb-2 pb-1 border-b border-border/50">
            {renderText}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 className="font-heading text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-foreground mt-3.5 mb-1.5">
            {renderText}
          </h2>
        );
      }
      return (
        <h3 className="font-heading text-[15px] sm:text-base font-semibold tracking-tight text-slate-900 dark:text-foreground mt-3 mb-1 text-[#0F2D4A] dark:text-slate-100">
          {renderText}
        </h3>
      );
    }

    case "code":
      return <CodeBlock code={block.code} language={block.language} />;

    case "quote":
      return (
        <blockquote className="border-l-3 border-[#7C3AED] dark:border-violet-500 pl-4 py-1.5 my-2.5 bg-violet-50/50 dark:bg-violet-950/20 rounded-r-xl text-slate-700 dark:text-slate-300 italic text-[13.5px]">
          <InlineContent
            text={block.text}
            citations={citations}
            activeCitationId={activeCitationId}
            onSelectCitation={onSelectCitation}
          />
        </blockquote>
      );

    case "ul":
      return (
        <ul className="space-y-2 my-2.5 pl-1">
          {block.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7C3AED] dark:bg-violet-400 mt-2.5 shrink-0" />
              <div className="flex-1">
                <InlineContent
                  text={item}
                  citations={citations}
                  activeCitationId={activeCitationId}
                  onSelectCitation={onSelectCitation}
                />
              </div>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="space-y-2 my-2.5 pl-1">
          {block.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="font-mono text-xs font-bold text-[#7C3AED] dark:text-violet-400 shrink-0 mt-1 min-w-[18px]">
                {item.num}.
              </span>
              <div className="flex-1">
                <InlineContent
                  text={item.text}
                  citations={citations}
                  activeCitationId={activeCitationId}
                  onSelectCitation={onSelectCitation}
                />
              </div>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div className="my-3 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-border/80 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-muted/60 border-b border-border">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-foreground">
                    <InlineContent
                      text={h}
                      citations={citations}
                      activeCitationId={activeCitationId}
                      onSelectCitation={onSelectCitation}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-700 dark:text-slate-300">
                      <InlineContent
                        text={cell}
                        citations={citations}
                        activeCitationId={activeCitationId}
                        onSelectCitation={onSelectCitation}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "paragraph":
      return (
        <p className="leading-[1.68] text-slate-800 dark:text-slate-100">
          <InlineContent
            text={block.text}
            citations={citations}
            activeCitationId={activeCitationId}
            onSelectCitation={onSelectCitation}
          />
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Code Block with Copy Button
// ---------------------------------------------------------------------------
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-200/80 dark:border-[#27272A] bg-slate-900 text-slate-100 shadow-xs overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-[12.5px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Formatter (Bold, Italic, Code, Citations)
// ---------------------------------------------------------------------------
function InlineContent({
  text,
  citations = [],
  activeCitationId,
  onSelectCitation,
}: {
  text: string;
  citations: CitationDetail[];
  activeCitationId?: string | null;
  onSelectCitation?: (citation: CitationDetail) => void;
}) {
  // Regex splits by:
  // 1. [source-N] citations
  // 2. **bold**
  // 3. `inline code`
  const regex = /(\[source[-_:]?\s*\d+\]|\*\*[^*]+\*\*|`[^`]+`)/gi;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Citation match
        const citeMatch = part.match(/\[source[-_:]?\s*(\d+)\]/i);
        if (citeMatch) {
          const rank = parseInt(citeMatch[1], 10);
          const matched =
            citations.find((c) => c.rank === rank) || citations[rank - 1];

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (matched && onSelectCitation) {
                  onSelectCitation(matched);
                }
              }}
              className={`inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.2 rounded-md font-mono text-[11px] font-semibold transition-all cursor-pointer align-baseline select-none ${
                matched && matched.id === activeCitationId
                  ? "bg-[#7C3AED] text-white shadow-xs ring-2 ring-violet-500/20"
                  : "bg-violet-100/80 dark:bg-violet-950/40 text-[#7C3AED] dark:text-violet-300 hover:bg-violet-200/90 dark:hover:bg-violet-900/60 border border-violet-200/70 dark:border-violet-800/50"
              }`}
              title={
                matched
                  ? `Source ${rank}: ${matched.documentName || "Document"}${
                      matched.pageNumber ? ` (p.${matched.pageNumber})` : ""
                    }`
                  : `Source ${rank}`
              }
            >
              <BookOpen className="h-2.5 w-2.5 shrink-0" />
              <span>[{rank}]</span>
            </button>
          );
        }

        // Bold match: **text**
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          const inner = part.slice(2, -2);
          return (
            <strong
              key={index}
              className="font-semibold text-slate-900 dark:text-white"
            >
              {inner}
            </strong>
          );
        }

        // Inline code match: `code`
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          const inner = part.slice(1, -1);
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[12px] bg-slate-100 dark:bg-muted text-[#4F46E5] dark:text-indigo-300 border border-slate-200/60 dark:border-border/60"
            >
              {inner}
            </code>
          );
        }

        // Plain text: preserve line breaks
        const lines = part.split("\n");
        return (
          <Fragment key={index}>
            {lines.map((l, lIdx) => (
              <Fragment key={lIdx}>
                {l}
                {lIdx < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
