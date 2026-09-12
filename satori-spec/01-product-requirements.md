# Satori — Product Requirements

## 1. Vision
Satori turns organizational and personal documents into a searchable knowledge workspace where users can ask grounded questions, inspect sources, compare content, and later perform AI-assisted document tasks.

## 2. Product Identity
Satori represents awakening/realization and deep understanding. The product turns scattered documents into clear, actionable knowledge.

## 3. Problem
Important knowledge is scattered across PDFs, Word files, notes, policies, manuals, and other documents. Traditional file browsing is slow, while generic AI answers may lack source grounding. Satori combines document organization, retrieval, and AI reasoning.

## 4. Target Users
Primary: small businesses, organizations, and teams.
Secondary: student organizations, researchers, project teams, and individual users.

## 5. Core User Goals
- Upload documents safely
- Know when documents are fully processed
- Search knowledge naturally
- Ask questions without manually opening many files
- Verify answers through sources
- Compare documents or versions
- Generate useful summaries/reports
- Keep data isolated by workspace

## 6. MVP User Stories
### Authentication
- As a user, I can sign in and access my workspace.
### Workspace
- As a user, I can create/select a workspace.
### Documents
- As a user, I can upload supported files.
- As a user, I can see processing status.
- As a user, I can inspect document metadata.
### AI chat
- As a user, I can ask a question about workspace knowledge.
- As a user, I can see grounded answers and source citations.
- As a user, I can continue a conversation.

## 7. Supported MVP Formats
- PDF
- DOCX
- TXT
CSV is post-MVP unless the implementation proves it is needed for the initial test case.

## 8. Core Entities
User, Workspace, Membership, Document, DocumentVersion, DocumentChunk, Conversation, Message, Citation.

## 9. Product Rules
- A document belongs to exactly one workspace.
- Retrieval must be workspace-scoped.
- A document is not queryable until indexing succeeds.
- Failed processing must be visible and retryable.
- AI answers should be grounded in retrieved workspace content when the question concerns workspace knowledge.
- Sources shown to users must map to real stored chunks/documents.

## 10. Later Capabilities
- Hybrid search
- Version comparison
- AI reports
- Tool-calling agent
- Research mode
- Evaluation dashboard
- AI run/latency/token metrics

## 11. Non-Functional Requirements
- Responsive UI
- Clear loading and failure states
- Server-side authorization
- Input validation
- Predictable error handling
- Observable AI requests
- Reasonable response latency
- No cross-workspace retrieval

## 12. Success Definition
The MVP is successful when a user can upload a real, permissioned mixed-document dataset, wait for indexing, ask questions, receive accurate source-grounded answers, and verify each cited source in the UI.
