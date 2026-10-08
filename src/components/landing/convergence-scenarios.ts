export interface DocumentFragment {
  id: string;
  name: string;
  format: "pdf" | "docx" | "txt";
  size: string;
}

export interface ChunkFragment {
  id: string;
  docId: string;
  docName: string;
  section: string;
  page?: number;
  previewText: string;
}

export interface CitationData {
  id: string;
  index: number;
  chunkId: string;
  docName: string;
  section: string;
  page?: number;
  snippet: string;
}

export interface Scenario {
  id: string;
  tabLabel: string;
  question: string;
  documents: DocumentFragment[];
  chunks: ChunkFragment[];
  answerTokens: string[];
  citations: CitationData[];
  fullDocumentExcerpt: {
    docName: string;
    section: string;
    page: number;
    paragraphs: {
      id: string;
      text: string;
      isHighlightedForCitation?: string;
    }[];
  };
}

export const CONVERGENCE_SCENARIOS: Scenario[] = [
  {
    id: "bylaws",
    tabLabel: "Bylaws & Governance",
    question: "What is the quorum requirement for special board meetings?",
    documents: [
      { id: "doc-1", name: "Organization_Bylaws_2025.pdf", format: "pdf", size: "480 KB" },
      { id: "doc-2", name: "Board_Charter_Amendments.docx", format: "docx", size: "128 KB" },
      { id: "doc-3", name: "Voting_Procedures_Summary.txt", format: "txt", size: "32 KB" },
    ],
    chunks: [
      {
        id: "chunk-1",
        docId: "doc-1",
        docName: "Organization_Bylaws_2025.pdf",
        section: "Article V: Special Meetings",
        page: 6,
        previewText: "Special meetings require a written notice sent five business days prior...",
      },
      {
        id: "chunk-2",
        docId: "doc-1",
        docName: "Organization_Bylaws_2025.pdf",
        section: "Article V: Section 2 (Quorum)",
        page: 6,
        previewText: "A quorum for any special meeting consists of fifty-one percent of active voting members.",
      },
      {
        id: "chunk-3",
        docId: "doc-2",
        docName: "Board_Charter_Amendments.docx",
        section: "Section 3.1: Electronic Voting",
        previewText: "Electronic presence via verified conference constitutes in-person attendance for quorum.",
      },
      {
        id: "chunk-4",
        docId: "doc-3",
        docName: "Voting_Procedures_Summary.txt",
        section: "Procedural Rules",
        previewText: "If quorum is not met within thirty minutes of the scheduled call, the chair must adjourn.",
      },
    ],
    answerTokens: [
      "Special",
      "board",
      "meetings",
      "require",
      "a",
      "minimum",
      "quorum",
      "of",
      "51%",
      "of",
      "active",
      "voting",
      "members",
      "present",
      "in",
      "person",
      "or",
      "verified",
      "electronically.",
      "Notice",
      "must",
      "be",
      "distributed",
      "at",
      "least",
      "five",
      "business",
      "days",
      "in",
      "advance.",
    ],
    citations: [
      {
        id: "cite-1",
        index: 1,
        chunkId: "chunk-2",
        docName: "Organization_Bylaws_2025.pdf",
        section: "Article V, Section 2",
        page: 6,
        snippet: "A quorum for any special meeting consists of fifty-one percent of active voting members.",
      },
      {
        id: "cite-2",
        index: 2,
        chunkId: "chunk-3",
        docName: "Board_Charter_Amendments.docx",
        section: "Section 3.1",
        snippet: "Electronic presence via verified conference constitutes in-person attendance for quorum.",
      },
    ],
    fullDocumentExcerpt: {
      docName: "Organization_Bylaws_2025.pdf",
      section: "Article V: Meetings of the Board",
      page: 6,
      paragraphs: [
        {
          id: "p-1",
          text: "Section 1. Regular Meetings. The Board of Directors shall hold regular quarterly sessions at the registered office or at such other location determined by resolution.",
        },
        {
          id: "p-2",
          text: "Section 2. Quorum for Special Sessions. A quorum for any special meeting consists of fifty-one percent (51%) of all active voting members in good standing.",
          isHighlightedForCitation: "cite-1",
        },
        {
          id: "p-3",
          text: "Section 3. Adjournment. In the absence of a quorum, the presiding officer shall adjourn the session without taking action on submitted agenda items.",
        },
      ],
    },
  },
  {
    id: "expenses",
    tabLabel: "Expense Policy",
    question: "What is the approval threshold and timeline for team travel expenses?",
    documents: [
      { id: "doc-1", name: "Employee_Handbook_2025.pdf", format: "pdf", size: "1.2 MB" },
      { id: "doc-2", name: "Travel_and_Expense_Policy.docx", format: "docx", size: "94 KB" },
      { id: "doc-3", name: "Finance_Approval_Matrix.txt", format: "txt", size: "18 KB" },
    ],
    chunks: [
      {
        id: "chunk-1",
        docId: "doc-2",
        docName: "Travel_and_Expense_Policy.docx",
        section: "Section 4: Approval Tiers",
        previewText: "Expenses under $500 require direct manager approval. Expenses over $500 require director sign-off...",
      },
      {
        id: "chunk-2",
        docId: "doc-2",
        docName: "Travel_and_Expense_Policy.docx",
        section: "Section 5: Submission Deadlines",
        previewText: "Receipts must be filed within fourteen calendar days following the conclusion of travel.",
      },
      {
        id: "chunk-3",
        docId: "doc-1",
        docName: "Employee_Handbook_2025.pdf",
        section: "Chapter 8: Reimbursements",
        page: 42,
        previewText: "Approved travel disbursements are remitted on the next scheduled biweekly payroll cycle.",
      },
    ],
    answerTokens: [
      "Travel",
      "expenses",
      "up",
      "to",
      "$500",
      "require",
      "direct",
      "manager",
      "approval,",
      "while",
      "items",
      "exceeding",
      "$500",
      "require",
      "director",
      "sign-off.",
      "Itemized",
      "receipts",
      "must",
      "be",
      "submitted",
      "within",
      "14",
      "calendar",
      "days.",
    ],
    citations: [
      {
        id: "cite-1",
        index: 1,
        chunkId: "chunk-1",
        docName: "Travel_and_Expense_Policy.docx",
        section: "Section 4",
        snippet: "Expenses under $500 require direct manager approval. Expenses over $500 require director sign-off.",
      },
      {
        id: "cite-2",
        index: 2,
        chunkId: "chunk-2",
        docName: "Travel_and_Expense_Policy.docx",
        section: "Section 5",
        snippet: "Receipts must be filed within fourteen calendar days following the conclusion of travel.",
      },
    ],
    fullDocumentExcerpt: {
      docName: "Travel_and_Expense_Policy.docx",
      section: "Section 4: Travel Authorizations and Thresholds",
      page: 3,
      paragraphs: [
        {
          id: "p-1",
          text: "4.1 General Guideline. Team members must obtain advance written approval for non-routine travel from their respective department leads.",
        },
        {
          id: "p-2",
          text: "4.2 Authorization Thresholds. Expenses under $500 require direct manager approval. Expenses over $500 require director sign-off prior to ticket booking.",
          isHighlightedForCitation: "cite-1",
        },
        {
          id: "p-3",
          text: "5.1 Submission Schedule. All itemized receipts must be filed within fourteen calendar days following the conclusion of travel.",
          isHighlightedForCitation: "cite-2",
        },
      ],
    },
  },
  {
    id: "security",
    tabLabel: "Workspace Security",
    question: "How does Satori enforce workspace data isolation across tenants?",
    documents: [
      { id: "doc-1", name: "Security_Architecture_Whitepaper.pdf", format: "pdf", size: "640 KB" },
      { id: "doc-2", name: "Multi_Tenant_Data_Controls.docx", format: "docx", size: "110 KB" },
      { id: "doc-3", name: "Compliance_Checklist.txt", format: "txt", size: "24 KB" },
    ],
    chunks: [
      {
        id: "chunk-1",
        docId: "doc-1",
        docName: "Security_Architecture_Whitepaper.pdf",
        section: "Section 2.4: Tenant Boundary",
        page: 8,
        previewText: "All SQL queries include workspaceId in where clauses, verified against active user membership.",
      },
      {
        id: "chunk-2",
        docId: "doc-1",
        docName: "Security_Architecture_Whitepaper.pdf",
        section: "Section 3.1: Vector Indexing",
        page: 11,
        previewText: "pgvector similarity scans are strictly partitioned by tenant ID to guarantee cross-tenant isolation.",
      },
      {
        id: "chunk-3",
        docId: "doc-2",
        docName: "Multi_Tenant_Data_Controls.docx",
        section: "Section 4: Object Storage",
        previewText: "File payloads in object storage use random UUID keys scoped by workspace directory prefixes.",
      },
    ],
    answerTokens: [
      "Every",
      "retrieval",
      "and",
      "storage",
      "operation",
      "enforces",
      "workspace-level",
      "tenant",
      "isolation.",
      "Database",
      "queries",
      "and",
      "pgvector",
      "similarity",
      "searches",
      "are",
      "partitioned",
      "by",
      "workspace",
      "ID,",
      "preventing",
      "cross-tenant",
      "data",
      "access.",
    ],
    citations: [
      {
        id: "cite-1",
        index: 1,
        chunkId: "chunk-1",
        docName: "Security_Architecture_Whitepaper.pdf",
        section: "Section 2.4",
        page: 8,
        snippet: "All SQL queries include workspaceId in where clauses, verified against active user membership.",
      },
      {
        id: "cite-2",
        index: 2,
        chunkId: "chunk-2",
        docName: "Security_Architecture_Whitepaper.pdf",
        section: "Section 3.1",
        page: 11,
        snippet: "pgvector similarity scans are strictly partitioned by tenant ID to guarantee cross-tenant isolation.",
      },
    ],
    fullDocumentExcerpt: {
      docName: "Security_Architecture_Whitepaper.pdf",
      section: "Section 2: Tenant Isolation and Query Authorization",
      page: 8,
      paragraphs: [
        {
          id: "p-1",
          text: "2.3 System of Record. PostgreSQL acts as the authoritative multi-tenant database. Row-level filters prevent data bleed between independent organizations.",
        },
        {
          id: "p-2",
          text: "2.4 Query Authorization. All SQL queries include workspaceId in where clauses, verified against active user membership in server session handlers.",
          isHighlightedForCitation: "cite-1",
        },
        {
          id: "p-3",
          text: "3.1 Vector Indexing Isolation. pgvector similarity scans are strictly partitioned by tenant ID to guarantee cross-tenant isolation during semantic searches.",
          isHighlightedForCitation: "cite-2",
        },
      ],
    },
  },
];
