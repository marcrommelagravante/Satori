import { extractPdf } from "./pdf";
import { extractDocx } from "./docx";
import { extractTxt } from "./txt";
import type { ExtractedDocument } from "./types";

export * from "./types";

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ExtractedDocument> {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (mimeType === "application/pdf" || ext === "pdf") {
    return await extractPdf(buffer);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    return await extractDocx(buffer);
  }

  if (mimeType === "text/plain" || ext === "txt") {
    return extractTxt(buffer);
  }

  throw new Error(`Unsupported document format: ${mimeType || ext}`);
}
