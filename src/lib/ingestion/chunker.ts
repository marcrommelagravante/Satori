import type { ExtractedDocument } from "./extractors/types";
import { cleanText } from "./cleaner";

export interface ChunkOptions {
  targetChunkSize?: number; // Characters per chunk (default: 800)
  overlap?: number; // Overlap in characters (default: 150)
}

export interface GeneratedChunk {
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  section: string | null;
  tokenEstimate: number;
}

// Helper to detect if a line looks like a heading
function detectHeading(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Markdown headings (# Heading)
  if (/^#{1,6}\s+(.+)$/.test(trimmed)) {
    return trimmed.replace(/^#{1,6}\s+/, "");
  }

  // Numbered or named sections (e.g., "Section 1", "Article II", "Chapter 3")
  if (/^(Section|Article|Chapter|Policy|Guideline|Rule)\s+[\w\d.-]+[:\s]?/i.test(trimmed) && trimmed.length < 80) {
    return trimmed;
  }

  // Short all-caps headings
  if (trimmed.length > 3 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function chunkDocument(
  extracted: ExtractedDocument,
  options: ChunkOptions = {}
): GeneratedChunk[] {
  const targetChunkSize = options.targetChunkSize ?? 800;
  const overlap = options.overlap ?? 150;

  const chunks: GeneratedChunk[] = [];
  let chunkIndex = 0;
  let currentSection: string | null = null;

  for (const page of extracted.pages) {
    const cleanedPageText = cleanText(page.text);
    if (!cleanedPageText) continue;

    // Split page text into paragraphs
    const paragraphs = cleanedPageText.split(/\n\n+/);
    let currentChunkText = "";

    for (const paragraph of paragraphs) {
      const trimmedPara = paragraph.trim();
      if (!trimmedPara) continue;

      // Check if the paragraph starts with or is a heading
      const lines = trimmedPara.split("\n");
      const possibleHeading = detectHeading(lines[0]);
      if (possibleHeading) {
        currentSection = possibleHeading;
      }

      // If adding this paragraph exceeds target size and current chunk is non-empty, emit chunk
      if (
        currentChunkText.length > 0 &&
        currentChunkText.length + trimmedPara.length > targetChunkSize
      ) {
        const finalContent = currentChunkText.trim();
        chunks.push({
          chunkIndex: chunkIndex++,
          content: finalContent,
          pageNumber: page.pageNumber,
          section: currentSection,
          tokenEstimate: Math.ceil(finalContent.length / 4),
        });

        // Retain trailing characters as overlap
        const sliceStart = Math.max(0, currentChunkText.length - overlap);
        currentChunkText = currentChunkText.slice(sliceStart).trim() + "\n\n" + trimmedPara;
      } else {
        currentChunkText = currentChunkText
          ? `${currentChunkText}\n\n${trimmedPara}`
          : trimmedPara;
      }
    }

    // Flush any remaining text on the page
    if (currentChunkText.trim().length > 0) {
      const finalContent = currentChunkText.trim();
      chunks.push({
        chunkIndex: chunkIndex++,
        content: finalContent,
        pageNumber: page.pageNumber,
        section: currentSection,
        tokenEstimate: Math.ceil(finalContent.length / 4),
      });
    }
  }

  // Fallback: If no chunks produced (e.g. empty pages), chunk fullText
  if (chunks.length === 0 && extracted.fullText.trim().length > 0) {
    const cleaned = cleanText(extracted.fullText);
    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(start + targetChunkSize, cleaned.length);
      const textSlice = cleaned.slice(start, end).trim();
      if (textSlice) {
        chunks.push({
          chunkIndex: chunkIndex++,
          content: textSlice,
          pageNumber: 1,
          section: null,
          tokenEstimate: Math.ceil(textSlice.length / 4),
        });
      }
      start += targetChunkSize - overlap;
    }
  }

  return chunks;
}
