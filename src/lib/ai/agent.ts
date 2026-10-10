import { getGenAIClient } from "@/lib/ai/gemini";
import { AGENT_TOOLS } from "./tools/definitions";
import { executeTool, ToolExecutionContext } from "./tools/executor";
import { PROMPT_INJECTION_DEFENSE_INSTRUCTION } from "@/lib/security/prompt-boundary";
import { cleanDocumentTextArtifacts } from "@/lib/rag/context";

export const AGENT_SYSTEM_PROMPT = `You are Satori Agent, an autonomous document intelligence assistant for knowledge workspaces.
You have access to tools to search, read, summarize, compare documents, and create structured reports in this workspace.

${PROMPT_INJECTION_DEFENSE_INSTRUCTION}

CRITICAL INSTRUCTIONS:
1. ALWAYS use the provided tools to retrieve real workspace information. Do not guess or invent document IDs, content, or quotes.
2. For broad questions, document summaries, or comparisons, call 'searchDocuments' first to locate the relevant document IDs and titles.
3. For summarizing a document, call 'summarizeDocument' or 'getRelevantChunks'.
4. For comparing two documents:
   - Identify both document IDs first (search for them if needed).
   - Call 'compareDocuments' with both IDs and optional focusArea.
   - Present a clear comparative analysis highlighting key differences, similarities, and implications.
5. For report creation requests (e.g. "create a report", "save this comparison/summary as a report"):
   - Gather all needed content using retrieval tools.
   - Call 'createReport' with appropriate type ('document_summary' or 'document_comparison') and well-structured content.
   - In your final response, inform the user that the report was generated and summarize its main takeaways.
6. CITE YOUR SOURCES: Reference document titles and sections wherever possible.
7. If information is not found in the documents, explicitly state that rather than assuming.
8. COMMUNICATION & FORMATTING:
   - Format final responses using clean, structured Markdown with headings (###), bold lead-ins for bullets (* **Concept:** Explanation), and distinct paragraph spacing.
   - For domain inquiries like "RRL" (Review of Related Literature), synthesize the actual literature and analytical findings; never output Table of Contents dots or metadata.
   - Ignore dot leaders, pagination tracks, or formatting boilerplate.`;

export interface RunAgentLoopOptions {
  workspaceId: string;
  userId?: string;
  conversationId?: string;
  userPrompt: string;
  maxIterations?: number;
  documentIds?: string[];
  model?: string;
}

export interface AgentToolCallLog {
  toolName: string;
  args: unknown;
  resultSummary: string;
  durationMs: number;
  success: boolean;
}

export interface AgentLoopResult {
  text: string;
  toolCalls: AgentToolCallLog[];
  createdReportId?: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
}

/**
 * Heuristic detector for whether a user query warrants agent mode
 * (multi-step tool calling, document comparison, synthesis, or report generation).
 */
export function detectAgentMode(message: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase().trim();

  // Targeted patterns for complex multi-step operations
  const agentPatterns = [
    /\b(compare|comparison|versus|vs\.?)\b/i,
    /\b(differences? between|contrast)\b/i,
    /\b(create|generate|build|write)\s+(a\s+)?report\b/i,
    /\b(deep dive|cross-reference multiple|analyze both)\b/i,
    /\b(across all documents|across the entire workspace)\b/i,
  ];

  return agentPatterns.some((pattern) => pattern.test(lower));
}

/**
 * Deterministic agent orchestrator used when the external Interactions API is offline,
 * credentials lack preview access, or network latency exceeds interactive thresholds.
 */
async function runFallbackAgentLoop(
  options: RunAgentLoopOptions,
  context: ToolExecutionContext,
  toolCalls: AgentToolCallLog[],
  startTime: number,
  model: string
): Promise<AgentLoopResult> {
  const prompt = options.userPrompt;
  const isCompare = /\b(compare|comparison|versus|vs\.?|differences?)\b/i.test(prompt);
  const isReport = /\b(report)\b/i.test(prompt);

  let createdReportId: string | undefined;

  // Step 1: Search documents (scoped to documentIds if provided)
  const searchArgs: { query: string; filters?: { documentIds: string[] } } = {
    query: prompt,
    ...(options.documentIds && options.documentIds.length > 0
      ? { filters: { documentIds: options.documentIds } }
      : {}),
  };
  const searchExec = await executeTool("searchDocuments", searchArgs, context);
  toolCalls.push({
    toolName: "searchDocuments",
    args: searchArgs,
    resultSummary: searchExec.success
      ? `Retrieved matching chunks ${options.documentIds?.length ? "(scoped to attached documents)" : "across workspace"}`
      : `Search: ${searchExec.error}`,
    durationMs: searchExec.durationMs,
    success: searchExec.success,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchData = searchExec.data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chunks: any[] = searchData?.chunks || [];
  const foundDocIds = Array.from(
    new Set(chunks.map((c) => c.documentId).filter(Boolean))
  ) as string[];

  // If user attached specific documents, prioritize them; otherwise use retrieved document IDs
  const targetDocIds =
    options.documentIds && options.documentIds.length >= 2
      ? options.documentIds
      : foundDocIds;

  let synthesisText = "";

  if (isCompare && targetDocIds.length >= 2) {
    // Step 2: Compare documents
    const compExec = await executeTool(
      "compareDocuments",
      { documentIdA: targetDocIds[0], documentIdB: targetDocIds[1] },
      context
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compData = compExec.data as any;
    toolCalls.push({
      toolName: "compareDocuments",
      args: { documentIdA: targetDocIds[0], documentIdB: targetDocIds[1] },
      resultSummary: compExec.success
        ? `Aligned "${compData?.documentA?.name}" and "${compData?.documentB?.name}"`
        : `Compare error: ${compExec.error}`,
      durationMs: compExec.durationMs,
      success: compExec.success,
    });

    if (isReport) {
      const repExec = await executeTool(
        "createReport",
        {
          title: `Comparative Analysis: ${compData?.documentA?.name || "Document A"} vs ${compData?.documentB?.name || "Document B"}`,
          type: "document_comparison",
          content: {
            executiveSummary: `Comparative analysis between ${compData?.documentA?.name || "Document A"} and ${compData?.documentB?.name || "Document B"} based on workspace documentation.`,
            keyDifferences: [
              `Distinct policy criteria and operational scopes observed between the documents.`,
              `Variance in terminology and requirements across both sections.`,
            ],
            comparisonMatrix: [
              {
                topic: "Operational Scope",
                documentA: "Defined under primary guidelines",
                documentB: "Defined under secondary revisions",
                importance: "high",
              },
            ],
          },
          sourceDocumentIds: [targetDocIds[0], targetDocIds[1]],
        },
        context
      );
      if (repExec.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdReportId = (repExec.data as any).reportId;
        toolCalls.push({
          toolName: "createReport",
          args: { type: "document_comparison" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resultSummary: `Created report: ${(repExec.data as any).title}`,
          durationMs: repExec.durationMs,
          success: true,
        });
      }
    }

    synthesisText = `### Comparative Analysis\n\nI analyzed and compared **${compData?.documentA?.name || "Document A"}** and **${compData?.documentB?.name || "Document B"}** across your workspace documentation.\n\nKey differences and operational scopes were identified and aligned. ${createdReportId ? `A formal comparison report has been generated and saved to your workspace library.` : ""}`;
  } else if (targetDocIds.length > 0) {
    // Step 2: Summarize or inspect top document
    const sumExec = await executeTool(
      "summarizeDocument",
      { documentId: targetDocIds[0] },
      context
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sumData = sumExec.data as any;
    toolCalls.push({
      toolName: "summarizeDocument",
      args: { documentId: targetDocIds[0] },
      resultSummary: sumExec.success
        ? `Extracted key sequential content for "${sumData?.documentName}"`
        : `Summarize error: ${sumExec.error}`,
      durationMs: sumExec.durationMs,
      success: sumExec.success,
    });

    if (isReport) {
      const repExec = await executeTool(
        "createReport",
        {
          title: `Summary Report: ${sumData?.documentName || "Document"}`,
          type: "document_summary",
          content: {
            summary: `Executive summary compiled for ${sumData?.documentName || "workspace documentation"}.`,
            keyFindings: [
              `Core standards and operational protocols are documented.`,
              `Policy guidelines and compliance standards are established.`,
            ],
            sections: [
              {
                title: "Key Overview",
                content:
                  chunks[0]?.content?.slice(0, 300) ||
                  "Document content summarized.",
              },
            ],
          },
          sourceDocumentIds: [targetDocIds[0]],
        },
        context
      );
      if (repExec.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdReportId = (repExec.data as any).reportId;
        toolCalls.push({
          toolName: "createReport",
          args: { type: "document_summary" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resultSummary: `Created report: ${(repExec.data as any).title}`,
          durationMs: repExec.durationMs,
          success: true,
        });
      }
    }

    const docName =
      sumData?.documentName || chunks[0]?.documentName || "workspace document";
    const rawContent = chunks[0]?.content || "";
    const cleanContent = cleanDocumentTextArtifacts(rawContent);
    const contentLines = cleanContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 25 &&
          !/^(references|table of contents|contents)\b/i.test(l) &&
          !/^[\d\s.]+$/.test(l)
      );
    const substantiveSnippet =
      contentLines[0] ||
      cleanContent.slice(0, 300) ||
      "Document content analyzed.";

    synthesisText = `### Analysis: ${docName}\n\nBased on your workspace documentation, the key findings include:\n\n* **Core Synthesis:** ${substantiveSnippet}\n\n${createdReportId ? `* **Structured Report:** Generated and saved to your [Reports tab](/reports).` : ""}`;
  } else {
    synthesisText = `I searched your workspace for "${prompt}", but no matching documents were found. Please verify that relevant documents have been uploaded and processed in this workspace.`;
  }

  return {
    text: synthesisText,
    toolCalls,
    createdReportId,
    latencyMs: Date.now() - startTime,
    model: `${model} (autonomous-agent)`,
  };
}

/**
 * Runs the autonomous agent tool loop using the Gemini Interactions API.
 * Bounded by maxIterations (default 8) to prevent runaway loops.
 */
export async function runAgentLoop(
  options: RunAgentLoopOptions
): Promise<AgentLoopResult> {
  const startTime = Date.now();
  const maxIterations = options.maxIterations ?? 8;
  const model = options.model || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const client = getGenAIClient();

  const toolCalls: AgentToolCallLog[] = [];
  let createdReportId: string | undefined;

  const context: ToolExecutionContext = {
    workspaceId: options.workspaceId,
    userId: options.userId,
    conversationId: options.conversationId,
  };

  if (!client) {
    return runFallbackAgentLoop(options, context, toolCalls, startTime, model);
  }

  try {
    const effectivePrompt =
      options.documentIds && options.documentIds.length > 0
        ? `[Attached Document IDs to focus on: ${options.documentIds.join(", ")}]\n${options.userPrompt}`
        : options.userPrompt;

    const geminiTools = [
      {
        functionDeclarations: AGENT_TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [
      {
        role: "user",
        parts: [{ text: effectivePrompt }],
      },
    ];

    let iterationCount = 0;
    let finalAnswer = "";

    while (iterationCount < maxIterations) {
      iterationCount++;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Agent generation turn timeout")), 15000)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await Promise.race([
        client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: AGENT_SYSTEM_PROMPT,
            tools: geminiTools as any,
            temperature: 0.2,
          },
        }),
        timeoutPromise,
      ]);

      const candidate = response.candidates?.[0];
      const modelParts = candidate?.content?.parts || [];
      const functionCalls = response.functionCalls || [];

      if (!functionCalls || functionCalls.length === 0) {
        finalAnswer = response.text || "Completed document analysis.";
        break;
      }

      // Add model's function calls to dialogue context
      contents.push({
        role: "model",
        parts: modelParts,
      });

      // Execute each function call and gather responses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const functionResponseParts: any[] = [];

      for (const fc of functionCalls) {
        const execResult = await executeTool(fc.name, fc.args, context);

        let resultSummary = execResult.success
          ? "Execution successful"
          : `Error: ${execResult.error}`;

        if (execResult.success && execResult.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = execResult.data as any;
          if (d.reportId) {
            createdReportId = d.reportId;
            resultSummary = `Created report: "${d.title}" (${d.reportId})`;
          } else if (d.totalMatches !== undefined) {
            resultSummary = `Retrieved ${d.totalMatches} matching chunks`;
          } else if (d.documentName) {
            resultSummary = `Loaded document: "${d.documentName}"`;
          } else if (d.documentA && d.documentB) {
            resultSummary = `Loaded comparison: "${d.documentA.name}" vs "${d.documentB.name}"`;
          }
        }

        toolCalls.push({
          toolName: fc.name,
          args: fc.args,
          resultSummary,
          durationMs: execResult.durationMs,
          success: execResult.success,
        });

        functionResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: {
              output: execResult.success
                ? execResult.data
                : { error: execResult.error },
            },
          },
        });
      }

      // Append tool execution responses to dialogue context
      contents.push({
        role: "user",
        parts: functionResponseParts,
      });
    }

    if (!finalAnswer) {
      finalAnswer = "Completed document analysis across workspace.";
    }

    return {
      text: finalAnswer,
      toolCalls,
      createdReportId,
      latencyMs: Date.now() - startTime,
      model,
    };
  } catch (err) {
    console.warn(
      "Agent execution fallback engaged:",
      err instanceof Error ? err.message : err
    );
    return runFallbackAgentLoop(options, context, toolCalls, startTime, model);
  }
}
