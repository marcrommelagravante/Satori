import {
  getGenAIClient,
  GENERATION_MODEL,
  FALLBACK_GENERATION_MODEL,
} from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { documents, documentVersions, documentChunks } from "@/lib/db/schema";
import { inArray, eq, and } from "drizzle-orm";

export type ReportFormat = "summary" | "comparison" | "analysis";

export interface GenerateReportContentInput {
  workspaceId: string;
  format: ReportFormat;
  title: string;
  sourceDocumentIds: string[];
  focusTopic?: string;
}

export interface GeneratedReportContent {
  format: ReportFormat;
  summary?: string;
  executiveSummary?: string;
  keyFindings?: string[];
  keyDifferences?: string[];
  sections: Array<{ title: string; content: string }>;
  recommendations?: string[];
  generationSource?: string;
}

/**
 * Gathers authentic text extracts from workspace documents.
 */
async function getDocumentsContext(
  workspaceId: string,
  sourceDocumentIds: string[]
): Promise<Array<{ id: string; name: string; text: string }>> {
  if (sourceDocumentIds.length === 0) {
    return [];
  }

  // 1. Fetch documents ensuring workspace boundary
  const docs = await db
    .select({ id: documents.id, name: documents.name })
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        inArray(documents.id, sourceDocumentIds)
      )
    );

  if (docs.length === 0) {
    return [];
  }

  const result: Array<{ id: string; name: string; text: string }> = [];

  for (const doc of docs) {
    // Check latest document version
    const [latestVersion] = await db
      .select({ id: documentVersions.id, extractedText: documentVersions.extractedText })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, doc.id))
      .orderBy(documentVersions.versionNumber)
      .limit(1);

    let docText = "";

    if (latestVersion) {
      // Check chunks first
      const chunks = await db
        .select({ content: documentChunks.content })
        .from(documentChunks)
        .where(eq(documentChunks.documentVersionId, latestVersion.id))
        .orderBy(documentChunks.chunkIndex)
        .limit(30);

      if (chunks.length > 0) {
        docText = chunks.map((c) => c.content).join("\n\n");
      } else if (latestVersion.extractedText) {
        docText = latestVersion.extractedText.slice(0, 15000);
      }
    }

    if (docText.trim()) {
      result.push({
        id: doc.id,
        name: doc.name,
        text: docText.trim(),
      });
    }
  }

  return result;
}

/**
 * Normalizes error message for friendly user presentation.
 */
function formatGeminiError(error: unknown): Error {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (
    errMsg.includes("503") ||
    errMsg.includes("UNAVAILABLE") ||
    errMsg.includes("high demand") ||
    errMsg.includes("429") ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.toLowerCase().includes("overloaded")
  ) {
    return new Error(
      "AI report generation is temporarily unavailable due to high demand. Please try again in a few minutes."
    );
  }
  return new Error(`Gemini API error during report generation: ${errMsg}`);
}

/**
 * Calls Gemini model with retry logic and exponential backoff (1.5s -> 3s -> 6s).
 */
async function callModelWithRetry(
  client: NonNullable<ReturnType<typeof getGenAIClient>>,
  model: string,
  prompt: string,
  maxRetries = 3
): Promise<{ parsed: Record<string, unknown>; model: string }> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = 1500 * Math.pow(2, attempt - 1);
        console.warn(
          `[REPORT GENERATOR] Retry attempt ${attempt}/${maxRetries} for model ${model} after ${delayMs}ms delay...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const raw = response.text?.trim() || "";
      let cleanJson = raw;
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanJson);
      return { parsed, model };
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[REPORT GENERATOR] Call to model ${model} (attempt ${attempt + 1}/${maxRetries + 1}) failed: ${errMsg}`
      );
    }
  }

  throw lastError;
}

/**
 * Generates a grounded, authentic report synthesized from selected documents using Gemini.
 */
export async function generateGroundedReport(
  input: GenerateReportContentInput
): Promise<GeneratedReportContent> {
  const { workspaceId, format, title, sourceDocumentIds, focusTopic } = input;

  if (sourceDocumentIds.length === 0) {
    throw new Error("At least one source document must be selected to generate a report.");
  }

  const docs = await getDocumentsContext(workspaceId, sourceDocumentIds);
  if (docs.length === 0) {
    throw new Error(
      "Selected documents do not contain any extracted text. Please verify they are processed and ready."
    );
  }

  const client = getGenAIClient();
  if (!client) {
    throw new Error(
      "Gemini API key is not configured. Report generation requires a valid API key."
    );
  }

  // Format documents into context
  const context = docs
    .map(
      (d) =>
        `<document id="${d.id}" name="${d.name}">\n${d.text.slice(0, 10000)}\n</document>`
    )
    .join("\n\n");

  const prompt = `You are Satori's Executive Knowledge Analyst.
Your task is to analyze the provided documents and synthesize a professional, 100% grounded report in JSON format.

Report Title: "${title}"
Report Format: "${format}" (Options: summary, comparison, analysis)
${focusTopic ? `Special Guidance / Focus: "${focusTopic}"` : ""}

SOURCE DOCUMENTS:
${context}

INSTRUCTIONS BY FORMAT:
- If format is "summary":
  Provide an "executiveSummary" (or "summary"), an array of "keyFindings" (3-5 items), 3 structured "sections" each with "title" and "content", and an array of "recommendations" (2-3 items).
- If format is "comparison":
  Provide an "executiveSummary", an array of "keyDifferences" (3-5 items comparing policies, targets, or details across documents), 3 comparative "sections" each with "title" and "content", and an array of "recommendations" (2-3 items).
- If format is "analysis":
  Provide an "executiveSummary", an array of "keyFindings" with specific metrics/standards mentioned in documents, 3-4 detailed analytical "sections" each with "title" and "content", and an array of "recommendations" (2-4 items).

CRITICAL CITATION & FACTUAL GROUNDING RULES:
1. All assertions must strictly reflect the facts in the provided documents. Do NOT make up unsupported data.
2. Return ONLY valid JSON matching this structure without Markdown fences.`;

  let generationResult: { parsed: Record<string, unknown>; model: string } | null = null;
  const candidateModels = [
    GENERATION_MODEL,
    FALLBACK_GENERATION_MODEL,
    "gemini-3.5-flash",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  let lastError: unknown = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const modelToTry = candidateModels[i];
    const retries = i === 0 ? 3 : 2;
    try {
      if (i > 0) {
        console.warn(
          `[REPORT GENERATOR] Attempting fallback model (${i}/${candidateModels.length - 1}): ${modelToTry}...`
        );
      }
      generationResult = await callModelWithRetry(client, modelToTry, prompt, retries);
      break;
    } catch (err) {
      lastError = err;
      console.warn(
        `[REPORT GENERATOR] Model ${modelToTry} exhausted all ${retries} retries:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  if (!generationResult) {
    throw formatGeminiError(lastError);
  }

  const { parsed, model } = generationResult;

  const rawSummary =
    typeof parsed.summary === "string"
      ? parsed.summary
      : typeof parsed.executiveSummary === "string"
      ? parsed.executiveSummary
      : "";

  const rawExecutiveSummary =
    typeof parsed.executiveSummary === "string"
      ? parsed.executiveSummary
      : rawSummary;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: Array<{ title: string; content: string }> = Array.isArray(parsed.sections)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? parsed.sections.map((s: any) => ({
        title: typeof s?.title === "string" ? s.title : "Section",
        content: typeof s?.content === "string" ? s.content : "",
      }))
    : [];

  const keyFindings: string[] | undefined = Array.isArray(parsed.keyFindings)
    ? parsed.keyFindings.map(String)
    : undefined;

  const keyDifferences: string[] | undefined = Array.isArray(parsed.keyDifferences)
    ? parsed.keyDifferences.map(String)
    : undefined;

  const recommendations: string[] | undefined = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.map(String)
    : undefined;

  return {
    format,
    summary: rawSummary,
    executiveSummary: rawExecutiveSummary,
    keyFindings,
    keyDifferences,
    sections,
    recommendations,
    generationSource: model,
  };
}
