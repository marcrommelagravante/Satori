import { extractText } from "unpdf";
import type { ExtractedDocument, ExtractedPage } from "./types";

export async function extractPdf(buffer: Buffer): Promise<ExtractedDocument> {
  const result = await extractText(new Uint8Array(buffer), { mergePages: false });

  const rawPages = Array.isArray(result.text) ? result.text : [result.text];
  const pages: ExtractedPage[] = rawPages.map((pageText, idx) => ({
    pageNumber: idx + 1,
    text: pageText || "",
  }));

  const fullText = pages.map((p) => p.text).join("\n\n");

  return {
    fullText,
    pages,
    metadata: {
      totalPages: result.totalPages || pages.length,
    },
  };
}
