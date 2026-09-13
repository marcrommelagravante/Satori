export interface ContextChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  versionNumber: number;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  section: string | null;
  tokenEstimate: number | null;
  similarityScore: number;
}

export interface SourceAttribution {
  sourceId: string;
  chunkId: string;
  documentId: string;
  documentName: string;
  versionNumber: number;
  chunkIndex: number;
  pageNumber: number | null;
  section: string | null;
  relevanceScore: number;
  contentSnippet: string;
}

export interface RagContextResult {
  formattedContext: string;
  includedChunks: ContextChunk[];
  totalTokenEstimate: number;
  citationMap: Record<string, SourceAttribution>;
}

export interface BuildRagContextOptions {
  maxTokens?: number; // Default 3000 tokens
}

/**
 * Builds an XML-structured context block for grounding LLM generation.
 * Enforces token limits, protects against prompt injection from document text,
 * and generates structured citation mappings for Phase 4.
 */
export function buildRagContext(
  chunks: ContextChunk[],
  options: BuildRagContextOptions = {}
): RagContextResult {
  const maxTokens = options.maxTokens ?? 3000;

  if (!chunks || chunks.length === 0) {
    return {
      formattedContext: "<context>\n  <!-- No relevant sources retrieved -->\n</context>",
      includedChunks: [],
      totalTokenEstimate: 0,
      citationMap: {},
    };
  }

  const includedChunks: ContextChunk[] = [];
  const citationMap: Record<string, SourceAttribution> = {};
  let currentTokenCount = 0;
  const sourceBlocks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const estimatedTokens =
      chunk.tokenEstimate ?? Math.ceil(chunk.content.length / 4);

    // Stop if adding this chunk exceeds the token budget (unless we haven't included any chunks yet)
    if (includedChunks.length > 0 && currentTokenCount + estimatedTokens > maxTokens) {
      break;
    }

    includedChunks.push(chunk);
    currentTokenCount += estimatedTokens;

    const sourceId = `source-${i + 1}`;
    citationMap[sourceId] = {
      sourceId,
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      versionNumber: chunk.versionNumber,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      section: chunk.section,
      relevanceScore: chunk.similarityScore,
      contentSnippet:
        chunk.content.length > 120
          ? `${chunk.content.slice(0, 120)}...`
          : chunk.content,
    };

    // Sanitize any accidental closing tags inside document content
    const sanitizedContent = chunk.content.replace(/<\/source>/gi, "&lt;/source&gt;");

    const attrs = [
      `id="${sourceId}"`,
      `chunk_id="${chunk.chunkId}"`,
      `document="${chunk.documentName.replace(/"/g, "&quot;")}"`,
      chunk.pageNumber !== null ? `page="${chunk.pageNumber}"` : null,
      chunk.section ? `section="${chunk.section.replace(/"/g, "&quot;")}"` : null,
      `score="${chunk.similarityScore.toFixed(4)}"`,
    ]
      .filter(Boolean)
      .join(" ");

    sourceBlocks.push(`  <source ${attrs}>\n${sanitizedContent}\n  </source>`);
  }

  const formattedContext = `<context>\n${sourceBlocks.join("\n")}\n</context>`;

  return {
    formattedContext,
    includedChunks,
    totalTokenEstimate: currentTokenCount,
    citationMap,
  };
}
