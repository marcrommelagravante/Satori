import { z } from "zod";

export const SearchDocumentsArgsSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty").max(500),
  filters: z
    .object({
      documentIds: z.array(z.string()).optional(),
    })
    .optional(),
});
export type SearchDocumentsArgs = z.infer<typeof SearchDocumentsArgsSchema>;

export const GetDocumentArgsSchema = z.object({
  documentId: z.string().min(1, "documentId is required"),
});
export type GetDocumentArgs = z.infer<typeof GetDocumentArgsSchema>;

export const GetRelevantChunksArgsSchema = z.object({
  documentId: z.string().min(1, "documentId is required"),
  query: z.string().min(1, "query is required").max(500),
  limit: z.number().int().min(1).max(20).optional().default(5),
});
export type GetRelevantChunksArgs = z.infer<typeof GetRelevantChunksArgsSchema>;

export const SummarizeDocumentArgsSchema = z.object({
  documentId: z.string().min(1, "documentId is required"),
});
export type SummarizeDocumentArgs = z.infer<typeof SummarizeDocumentArgsSchema>;

export const CompareDocumentsArgsSchema = z.object({
  documentIdA: z.string().min(1, "documentIdA is required"),
  documentIdB: z.string().min(1, "documentIdB is required"),
  focusArea: z.string().max(500).optional(),
});
export type CompareDocumentsArgs = z.infer<typeof CompareDocumentsArgsSchema>;

export const DocumentSummaryContentSchema = z.object({
  summary: z.string().min(1, "summary is required"),
  keyFindings: z.array(z.string()).default([]),
  sections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .default([]),
});
export type DocumentSummaryContent = z.infer<typeof DocumentSummaryContentSchema>;

export const DocumentComparisonContentSchema = z.object({
  executiveSummary: z.string().min(1, "executiveSummary is required"),
  keyDifferences: z.array(z.string()).default([]),
  comparisonMatrix: z
    .array(
      z.object({
        topic: z.string(),
        documentA: z.string(),
        documentB: z.string(),
        importance: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .default([]),
  recommendations: z.array(z.string()).optional(),
});
export type DocumentComparisonContent = z.infer<
  typeof DocumentComparisonContentSchema
>;

export const CreateReportArgsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["document_summary", "document_comparison"]),
  content: z.record(z.string(), z.any()),
  sourceDocumentIds: z.array(z.string()).optional(),
});
export type CreateReportArgs = z.infer<typeof CreateReportArgsSchema>;
