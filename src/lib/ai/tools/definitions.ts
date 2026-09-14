export interface FunctionToolDeclaration {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const searchDocumentsDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "searchDocuments",
  description:
    "Searches the workspace documents using hybrid keyword and semantic retrieval. Use this to find documents, chunks, or answers across the knowledge base.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to retrieve relevant chunks or documents.",
      },
      filters: {
        type: "object",
        description: "Optional filters to restrict the search scope.",
        properties: {
          documentIds: {
            type: "array",
            items: { type: "string" },
            description: "Optional list of document IDs to restrict search to.",
          },
        },
      },
    },
    required: ["query"],
  },
};

export const getDocumentDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "getDocument",
  description:
    "Retrieves metadata and initial text excerpt for a specific document by its ID.",
  parameters: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "The unique ID of the document.",
      },
    },
    required: ["documentId"],
  },
};

export const getRelevantChunksDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "getRelevantChunks",
  description:
    "Retrieves top relevant chunks from a specific document matching a query or topic.",
  parameters: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "The unique ID of the target document.",
      },
      query: {
        type: "string",
        description: "The topic or query to search for within the document.",
      },
      limit: {
        type: "number",
        description: "Maximum number of chunks to return (default 5, max 20).",
      },
    },
    required: ["documentId", "query"],
  },
};

export const summarizeDocumentDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "summarizeDocument",
  description:
    "Fetches key sequential content from a document ordered by chunk index to support creating a comprehensive summary.",
  parameters: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "The unique ID of the document to summarize.",
      },
    },
    required: ["documentId"],
  },
};

export const compareDocumentsDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "compareDocuments",
  description:
    "Fetches and aligns content from two documents to compare policies, terms, differences, or metrics.",
  parameters: {
    type: "object",
    properties: {
      documentIdA: {
        type: "string",
        description: "The unique ID of the first document.",
      },
      documentIdB: {
        type: "string",
        description: "The unique ID of the second document.",
      },
      focusArea: {
        type: "string",
        description:
          "Optional specific topic, policy, or aspect to focus the comparison on.",
      },
    },
    required: ["documentIdA", "documentIdB"],
  },
};

export const createReportDeclaration: FunctionToolDeclaration = {
  type: "function",
  name: "createReport",
  description:
    "Saves a structured report artifact (summary or comparison) to the workspace library so the user can review and share it.",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Clear and descriptive title for the report.",
      },
      type: {
        type: "string",
        description:
          "Type of report: 'document_summary' or 'document_comparison'.",
      },
      content: {
        type: "object",
        description:
          "Structured JSON content. For document_summary: { summary: string, keyFindings: string[], sections: [{ title: string, content: string }] }. For document_comparison: { executiveSummary: string, keyDifferences: string[], comparisonMatrix: [{ topic: string, documentA: string, documentB: string, importance: 'low'|'medium'|'high' }], recommendations: string[] }.",
      },
      sourceDocumentIds: {
        type: "array",
        items: { type: "string" },
        description: "IDs of the documents referenced in the report.",
      },
    },
    required: ["title", "type", "content"],
  },
};

export const AGENT_TOOLS: FunctionToolDeclaration[] = [
  searchDocumentsDeclaration,
  getDocumentDeclaration,
  getRelevantChunksDeclaration,
  summarizeDocumentDeclaration,
  compareDocumentsDeclaration,
  createReportDeclaration,
];
