import mammoth from "mammoth";
import type { ExtractedDocument } from "./types";

export async function extractDocx(buffer: Buffer): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const fullText = result.value || "";

  return {
    fullText,
    pages: [
      {
        pageNumber: 1,
        text: fullText,
      },
    ],
    metadata: {
      messages: result.messages,
    },
  };
}
