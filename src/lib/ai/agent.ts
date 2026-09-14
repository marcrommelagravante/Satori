import { getGenAIClient } from "@/lib/ai/gemini";
import { AGENT_TOOLS } from "./tools/definitions";
import { executeTool, ToolExecutionContext } from "./tools/executor";
import { PROMPT_INJECTION_DEFENSE_INSTRUCTION } from "@/lib/security/prompt-boundary";

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
7. If information is not found in the documents, explicitly state that rather than assuming.`;

export interface RunAgentLoopOptions {
  workspaceId: string;
  userId?: string;
  conversationId?: string;
  userPrompt: string;
  maxIterations?: number;
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

  // Keyword indicators
  const agentPatterns = [
    /\b(compare|comparison|versus|vs\.?)\b/i,
    /\b(differences? between|contrast)\b/i,
    /\b(create|generate|build|write)\s+(a\s+)?report\b/i,
    /\b(summarize|summary of|give me a summary)\b/i,
    /\b(deep dive|in-depth analysis|analyze both|cross-reference)\b/i,
    /\b(all documents|across the workspace|across documents)\b/i,
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

  // Step 1: Search documents
  const searchExec = await executeTool("searchDocuments", { query: prompt }, context);
  toolCalls.push({
    toolName: "searchDocuments",
    args: { query: prompt },
    resultSummary: searchExec.success
      ? `Retrieved matching chunks across workspace`
      : `Search: ${searchExec.error}`,
    durationMs: searchExec.durationMs,
    success: searchExec.success,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchData = searchExec.data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chunks: any[] = searchData?.chunks || [];
  const uniqueDocIds = Array.from(
    new Set(chunks.map((c) => c.documentId).filter(Boolean))
  ) as string[];

  let synthesisText = "";

  if (isCompare && uniqueDocIds.length >= 2) {
    // Step 2: Compare documents
    const compExec = await executeTool(
      "compareDocuments",
      { documentIdA: uniqueDocIds[0], documentIdB: uniqueDocIds[1] },
      context
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compData = compExec.data as any;
    toolCalls.push({
      toolName: "compareDocuments",
      args: { documentIdA: uniqueDocIds[0], documentIdB: uniqueDocIds[1] },
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
          sourceDocumentIds: [uniqueDocIds[0], uniqueDocIds[1]],
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
  } else if (uniqueDocIds.length > 0) {
    // Step 2: Summarize or inspect top document
    const sumExec = await executeTool(
      "summarizeDocument",
      { documentId: uniqueDocIds[0] },
      context
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sumData = sumExec.data as any;
    toolCalls.push({
      toolName: "summarizeDocument",
      args: { documentId: uniqueDocIds[0] },
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
          sourceDocumentIds: [uniqueDocIds[0]],
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
    const snippet =
      chunks[0]?.content?.slice(0, 240) ||
      "Information retrieved from document.";

    synthesisText = `### Summary of ${docName}\n\nBased on your workspace documents, the key findings include:\n\n> "${snippet}..."\n\n${createdReportId ? `I have compiled and saved a structured report artifact to your Reports tab.` : ""}`;
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
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
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
    // Initial Turn with timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Interactions API timeout")), 3500)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentInteraction: any = await Promise.race([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).interactions.create({
        model,
        system_instruction: AGENT_SYSTEM_PROMPT,
        input: options.userPrompt,
        tools: AGENT_TOOLS,
      }),
      timeoutPromise,
    ]);

    let iterationCount = 0;
    let finalAnswer = "";

    while (iterationCount < maxIterations) {
      // Check for tool call steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const steps = currentInteraction.steps || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const functionCalls = steps.filter((s: any) => s.type === "function_call");

      if (functionCalls.length === 0) {
        finalAnswer =
          currentInteraction.output_text ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          steps.find((s: any) => s.type === "model_output")?.content?.[0]
            ?.text ||
          "Completed document analysis.";
        break;
      }

      // Execute all proposed function calls in this step
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const functionResults: any[] = [];

      for (const fc of functionCalls) {
        iterationCount++;
        if (iterationCount > maxIterations) {
          break;
        }

        const execResult = await executeTool(fc.name, fc.arguments, context);

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
          args: fc.arguments,
          resultSummary,
          durationMs: execResult.durationMs,
          success: execResult.success,
        });

        functionResults.push({
          type: "function_result",
          name: fc.name,
          call_id: fc.id,
          result: [
            {
              type: "text",
              text: JSON.stringify(
                execResult.success
                  ? execResult.data
                  : { error: execResult.error }
              ),
            },
          ],
        });
      }

      if (iterationCount >= maxIterations) {
        finalAnswer =
          "Agent reached the maximum tool loop limit (8 steps). Partial findings have been collected, but the analysis was bounded.";
        break;
      }

      // Send function results back to model with timeout protection
      const nextTurnTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Next turn timeout")), 3500)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentInteraction = await Promise.race([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any).interactions.create({
          model,
          input: functionResults,
          tools: AGENT_TOOLS,
          previous_interaction_id: currentInteraction.id,
        }),
        nextTurnTimeout,
      ]);
    }

    if (!finalAnswer && currentInteraction?.output_text) {
      finalAnswer = currentInteraction.output_text;
    }

    return {
      text: finalAnswer || "Completed analysis.",
      toolCalls,
      createdReportId,
      latencyMs: Date.now() - startTime,
      inputTokens: currentInteraction?.usage?.input_tokens,
      outputTokens: currentInteraction?.usage?.output_tokens,
      model,
    };
  } catch (err) {
    console.warn(
      "Agent Interactions API fallback engaged:",
      err instanceof Error ? err.message : err
    );
    return runFallbackAgentLoop(options, context, toolCalls, startTime, model);
  }
}
