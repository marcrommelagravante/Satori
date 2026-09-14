/**
 * Security validation for uploaded file payloads and file signatures (magic bytes).
 */

export interface FileValidationResult {
  valid: boolean;
  detectedType?: "pdf" | "docx" | "txt";
  sanitizedFilename: string;
  error?: string;
}

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // "PK\x03\x04" (DOCX)

const DANGEROUS_EXTENSIONS = new Set([
  "exe", "dll", "bat", "cmd", "sh", "ps1", "vbs", "js", "ts", "py",
  "php", "rb", "pl", "cgi", "jar", "war", "msi", "com", "scr", "pif"
]);

/**
 * Sanitizes a filename to protect against path traversal, control characters, and hidden files.
 */
export function sanitizeFilename(filename: string): string {
  // Strip path traversal and slashes
  let clean = filename
    .replace(/^.*[\\\/]/, "") // strip leading paths
    .replace(/\.\./g, "") // remove double dots
    .replace(/[\x00-\x1f\x7f]/g, "") // remove control characters
    .trim();

  // Strip leading dots to prevent hidden files
  clean = clean.replace(/^\.+/, "");

  if (!clean || clean.length === 0) {
    clean = `document-${Date.now()}`;
  }

  // Cap filename length
  if (clean.length > 200) {
    const ext = clean.split(".").pop() || "";
    const base = clean.slice(0, 190);
    clean = ext ? `${base}.${ext}` : base;
  }

  return clean;
}

/**
 * Inspects raw buffer bytes to verify actual file signature rather than trusting client MIME/extension.
 */
export function validateFileSignature(
  buffer: Buffer,
  filename: string
): FileValidationResult {
  const sanitizedFilename = sanitizeFilename(filename);
  const ext = sanitizedFilename.split(".").pop()?.toLowerCase() || "";

  // Check for dangerous extensions disguised in filename
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      sanitizedFilename,
      error: `Upload rejected: file extension '.${ext}' is prohibited for security.`,
    };
  }

  if (buffer.length < 4) {
    return {
      valid: false,
      sanitizedFilename,
      error: "Upload rejected: file is empty or corrupted (under 4 bytes).",
    };
  }

  // 1. Check for PDF Magic Bytes: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).equals(PDF_MAGIC)) {
    if (ext !== "pdf") {
      return {
        valid: false,
        sanitizedFilename,
        error: `File signature mismatch: content is a PDF, but file extension is '.${ext}'.`,
      };
    }
    return {
      valid: true,
      detectedType: "pdf",
      sanitizedFilename,
    };
  }

  // 2. Check for DOCX Magic Bytes: PK\x03\x04 (ZIP archive)
  if (buffer.subarray(0, 4).equals(ZIP_MAGIC)) {
    if (ext !== "docx") {
      return {
        valid: false,
        sanitizedFilename,
        error: `File signature mismatch: content is an OpenXML document, but file extension is '.${ext}'.`,
      };
    }
    return {
      valid: true,
      detectedType: "docx",
      sanitizedFilename,
    };
  }

  // 3. Check for Plain Text (TXT)
  if (ext === "txt") {
    // Binary check: plain text files should not contain null bytes (0x00)
    const scanLimit = Math.min(buffer.length, 4096);
    for (let i = 0; i < scanLimit; i++) {
      if (buffer[i] === 0x00) {
        return {
          valid: false,
          sanitizedFilename,
          error: "File signature mismatch: file with .txt extension contains binary executable null bytes.",
        };
      }
    }

    return {
      valid: true,
      detectedType: "txt",
      sanitizedFilename,
    };
  }

  return {
    valid: false,
    sanitizedFilename,
    error: `Unsupported file format. Satori only accepts validated PDF (%PDF-), DOCX (OpenXML), and UTF-8 TXT files.`,
  };
}
