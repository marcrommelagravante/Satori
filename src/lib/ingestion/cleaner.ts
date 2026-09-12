export function cleanText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Remove null bytes and non-printable control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize newlines
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, " ")
    // Trim trailing spaces on each line
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    // Collapse 3 or more consecutive newlines into 2 (preserving paragraph breaks)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
