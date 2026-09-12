# Satori — Build Plan and Acceptance Criteria

## Phase 1 — Foundation
Deliver:
- repository
- Next.js app
- TypeScript
- Tailwind/shadcn
- Drizzle
- PostgreSQL connection
- authentication
- workspace model
- environment configuration

Acceptance: user can sign in, create/select workspace, and reach dashboard.

## Phase 2 — Documents
Deliver:
- upload UI/API
- object storage
- document metadata
- PDF/DOCX/TXT extraction
- processing states

Acceptance: uploaded documents appear and reach READY or FAILED with visible status.

## Phase 3 — Custom RAG
Deliver:
- cleaning
- chunking
- Gemini embeddings
- pgvector storage/indexing
- semantic retrieval
- context builder

Acceptance: known questions retrieve expected source chunks.

## Phase 4 — AI Chat
Deliver:
- conversations
- messages
- Gemini generation
- grounded prompt
- citations

Acceptance: user can ask a document question and verify the answer through real sources.

## Phase 5 — Retrieval Improvement
Deliver:
- keyword search
- hybrid retrieval
- metadata filters
- ranking/reranking if evaluation supports it

Acceptance: retrieval metrics improve or remain stable without unacceptable latency/cost.

## Phase 6 — Agent Features
Deliver:
- search tool
- document tool
- compare tool
- summary/report tools
- structured outputs

Acceptance: complex requests can execute bounded multi-step workflows without authorization bypass.

## Phase 7 — Evaluation/Observability
Deliver:
- evaluation cases
- retrieval metrics
- answer/citation scoring
- AI run metrics
- dashboard

Acceptance: the project can demonstrate measurable quality and performance.

## Phase 8 — Production Hardening
Deliver:
- rate limiting
- stronger upload security
- audit metadata
- error handling
- cleanup/deletion paths
- deployment

Acceptance: production environment is secure enough for controlled real-world testing.

## Final Portfolio Demo
Demo should show:
1. upload mixed documents
2. processing pipeline
3. searchable knowledge base
4. grounded question answering
5. citations
6. multi-step comparison/reporting
7. evaluation metrics
8. architecture explanation

## Final Engineering Rule
Do not skip evaluation because the demo "looks good."
Do not skip authorization because the app is "only a portfolio project."
Do not add infrastructure unless a real requirement needs it.
