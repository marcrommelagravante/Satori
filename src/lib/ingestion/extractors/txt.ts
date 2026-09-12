import type { ExtractedDocument } from "./types";

export function extractTxt(buffer: Buffer): ExtractedDocument {
  const fullText = buffer.toString("utf-8");

  return {
    fullText,
    pages: [
      {
        pageNumber: 1,
        text: fullText,
      },
    ],
  };
}
