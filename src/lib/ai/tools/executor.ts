import { db } from "@/lib/db";
import {
  documents,
  documentVersions,
  documentChunks,
} from "@/lib/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { searchChunks, searchSimilarChunks } from "@/lib/rag/retrieval";
import { createReport } from "@/lib/reports";
import {
  SearchDocumentsArgsSchema,
  GetDocumentArgsSchema,
  GetRelevantChunksArgsSchema,
  SummarizeDocumentArgsSchema,
  CompareDocumentsArgsSchema,
  CreateReportArgsSchema,
  DocumentSummaryContentSchema,
  DocumentComparisonContentSchema,
} from "./schemas";

export interface ToolExecutionContext {
  workspaceId: string;
  userId?: string;
  conversationId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  args: unknown;
  data?: unknown;
  error?: string;
  durationMs: number;
}

/**
 * Dispatches and executes a tool call proposed by the Gemini model.
 * Enforces:
 * 1. Tool name validation
 * 2. Zod argument schema validation
 * 3. Strict workspace authorization
 * 4. Safe structured return data
 * 5. Execution latency logging
 */
export async function executeTool(
  toolName: string,
  rawArgs: unknown,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const startTime = Date.now();

  try {
    let data: unknown;

    switch (toolName) {
      case "searchDocuments": {
        const validated = SearchDocumentsArgsSchema.parse(rawArgs);
        const results = await searchChunks({
          workspaceId: context.workspaceId,
          query: validated.query,
          documentIds: validated.filters?.documentIds,
          topK: 8,
        });

        data = {
          totalMatches: results.length,
          chunks: results.map((c) => ({
            documentId: c.documentId,
            documentName: c.documentName,
            pageNumber: c.pageNumber,
            section: c.section,
            content: c.content,
            score: c.rrfScore ?? c.similarityScore,
          })),
        };
        break;
      }

      case "getDocument": {
        const validated = GetDocumentArgsSchema.parse(rawArgs);

        const [doc] = await db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.id, validated.documentId),
              eq(documents.workspaceId, context.workspaceId)
            )
          )
          .limit(1);

        if (!doc) {
          return {
            success: false,
            toolName,
            args: rawArgs,
            error: "Document not found or access denied.",
            durationMs: Date.now() - startTime,
          };
        }

        const [version] = await db
          .select()
          .from(documentVersions)
          .where(eq(documentVersions.documentId, doc.id))
          .orderBy(asc(documentVersions.versionNumber))
          .limit(1);

        data = {
          documentId: doc.id,
          name: doc.name,
          mimeType: doc.mimeType,
          sizeBytes: doc.sizeBytes,
          category: doc.category,
          status: doc.status,
          excerpt: version?.extractedText
            ? version.extractedText.slice(0, 600)
            : "No text available.",
        };
        break;
      }

      case "getRelevantChunks": {
        const validated = GetRelevantChunksArgsSchema.parse(rawArgs);

        // Verify workspace ownership
        const [doc] = await db
          .select({ id: documents.id })
          .from(documents)
          .where(
            and(
              eq(documents.id, validated.documentId),
              eq(documents.workspaceId, context.workspaceId)
            )
          )
          .limit(1);

        if (!doc) {
          return {
            success: false,
            toolName,
            args: rawArgs,
            error: "Document not found or access denied.",
            durationMs: Date.now() - startTime,
          };
        }

        const chunks = await searchSimilarChunks({
          workspaceId: context.workspaceId,
          query: validated.query,
          documentIds: [validated.documentId],
          topK: validated.limit ?? 5,
        });

        data = {
          documentId: validated.documentId,
          chunks: chunks.map((c) => ({
            chunkIndex: c.chunkIndex,
            pageNumber: c.pageNumber,
            section: c.section,
            content: c.content,
            score: c.similarityScore,
          })),
        };
        break;
      }

      case "summarizeDocument": {
        const validated = SummarizeDocumentArgsSchema.parse(rawArgs);

        const [doc] = await db
          .select()
          .from(documents)
          .where(
            and(
              eq(documents.id, validated.documentId),
              eq(documents.workspaceId, context.workspaceId)
            )
          )
          .limit(1);

        if (!doc) {
          return {
            success: false,
            toolName,
            args: rawArgs,
            error: "Document not found or access denied.",
            durationMs: Date.now() - startTime,
          };
        }

        // Fetch sequential chunks
        const chunks = await db
          .select({
            chunkIndex: documentChunks.chunkIndex,
            pageNumber: documentChunks.pageNumber,
            section: documentChunks.section,
            content: documentChunks.content,
          })
          .from(documentChunks)
          .innerJoin(
            documentVersions,
            eq(documentChunks.documentVersionId, documentVersions.id)
          )
          .where(eq(documentVersions.documentId, doc.id))
          .orderBy(asc(documentChunks.chunkIndex))
          .limit(16);

        const concatenated = chunks.map((c) => c.content).join("\n\n---\n\n");

        data = {
          documentId: doc.id,
          documentName: doc.name,
          totalChunksLoaded: chunks.length,
          content: concatenated.slice(0, 14000),
        };
        break;
      }

      case "compareDocuments": {
        const validated = CompareDocumentsArgsSchema.parse(rawArgs);

        // Verify both documents exist in this workspace
        const docs = await db
          .select()
          .from(documents)
          .where(
            and(
              inArray(documents.id, [
                validated.documentIdA,
                validated.documentIdB,
              ]),
              eq(documents.workspaceId, context.workspaceId)
            )
          );

        if (docs.length < 2) {
          return {
            success: false,
            toolName,
            args: rawArgs,
            error:
              "One or both documents not found in the authorized workspace.",
            durationMs: Date.now() - startTime,
          };
        }

        const docA = docs.find((d) => d.id === validated.documentIdA)!;
        const docB = docs.find((d) => d.id === validated.documentIdB)!;

        let contentA = "";
        let contentB = "";

        if (validated.focusArea && validated.focusArea.trim().length > 0) {
          const chunksA = await searchSimilarChunks({
            workspaceId: context.workspaceId,
            query: validated.focusArea,
            documentIds: [docA.id],
            topK: 4,
          });
          const chunksB = await searchSimilarChunks({
            workspaceId: context.workspaceId,
            query: validated.focusArea,
            documentIds: [docB.id],
            topK: 4,
          });
          contentA = chunksA.map((c) => c.content).join("\n\n");
          contentB = chunksB.map((c) => c.content).join("\n\n");
        } else {
          const fetchSequential = async (docId: string) => {
            const chunks = await db
              .select({ content: documentChunks.content })
              .from(documentChunks)
              .innerJoin(
                documentVersions,
                eq(documentChunks.documentVersionId, documentVersions.id)
              )
              .where(eq(documentVersions.documentId, docId))
              .orderBy(asc(documentChunks.chunkIndex))
              .limit(8);
            return chunks.map((c) => c.content).join("\n\n");
          };
          contentA = await fetchSequential(docA.id);
          contentB = await fetchSequential(docB.id);
        }

        data = {
          documentA: {
            id: docA.id,
            name: docA.name,
            content: contentA.slice(0, 8000),
          },
          documentB: {
            id: docB.id,
            name: docB.name,
            content: contentB.slice(0, 8000),
          },
          focusArea: validated.focusArea ?? null,
        };
        break;
      }

      case "createReport": {
        const validated = CreateReportArgsSchema.parse(rawArgs);

        // Validate structured content
        let validatedContent = validated.content;
        if (validated.type === "document_summary") {
          const parsed = DocumentSummaryContentSchema.safeParse(
            validated.content
          );
          if (parsed.success) {
            validatedContent = parsed.data;
          }
        } else if (validated.type === "document_comparison") {
          const parsed = DocumentComparisonContentSchema.safeParse(
            validated.content
          );
          if (parsed.success) {
            validatedContent = parsed.data;
          }
        }

        // Validate source document IDs belong to workspace
        let verifiedDocIds: string[] = [];
        if (
          validated.sourceDocumentIds &&
          validated.sourceDocumentIds.length > 0
        ) {
          const validDocs = await db
            .select({ id: documents.id })
            .from(documents)
            .where(
              and(
                inArray(documents.id, validated.sourceDocumentIds),
                eq(documents.workspaceId, context.workspaceId)
              )
            );
          verifiedDocIds = validDocs.map((d) => d.id);
        }

        const report = await createReport({
          workspaceId: context.workspaceId,
          userId: context.userId,
          conversationId: context.conversationId,
          title: validated.title,
          type: validated.type,
          content: validatedContent,
          sourceDocumentIds: verifiedDocIds,
        });

        data = {
          reportId: report.id,
          title: report.title,
          type: report.type,
          status: "completed",
          message: `Report "${report.title}" created successfully.`,
          viewUrl: `/reports/${report.id}`,
        };
        break;
      }

      default:
        return {
          success: false,
          toolName,
          args: rawArgs,
          error: `Unknown tool name: "${toolName}"`,
          durationMs: Date.now() - startTime,
        };
    }

    return {
      success: true,
      toolName,
      args: rawArgs,
      data,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      success: false,
      toolName,
      args: rawArgs,
      error:
        err instanceof Error ? err.message : "Internal tool execution error.",
      durationMs: Date.now() - startTime,
    };
  }
}
