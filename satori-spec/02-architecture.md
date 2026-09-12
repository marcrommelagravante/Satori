# Satori — System Architecture

## 1. Architecture Style
Use a modular monolith.
One Next.js application contains the UI, server routes, domain services, AI orchestration, retrieval logic, and authentication integration.

## 2. Logical Architecture
```text
Browser
  ↓
Next.js UI
  ↓
Server/API Layer
  ├─ Auth
  ├─ Workspace Service
  ├─ Document Service
  ├─ Ingestion Service
  ├─ Retrieval Service
  ├─ Chat Service
  ├─ Agent/Tool Service
  └─ Evaluation/Observability
       ↓
PostgreSQL + pgvector
       ↕
Gemini API
       ↕
Object/File Storage
```

## 3. Request Flow
Browser requests a server capability → authenticate user → authorize workspace/resource → validate input → execute domain service → persist result → return typed response.

## 4. AI Boundary
The AI layer must not directly mutate the database without going through application tools/services.
Gemini proposes tool calls; application code validates and executes them.

## 5. Data Boundary
PostgreSQL is the system of record for relational data, chunks, embeddings, messages, citations, and metrics.
Object storage holds original uploaded files.

## 6. Ingestion Boundary
Ingestion is a pipeline, not a UI concern.
The UI starts an ingestion workflow and displays status.
The document processor performs extraction, normalization, chunking, embedding, and indexing.

## 7. Retrieval Boundary
Retrieval is a dedicated service so search logic can evolve independently from chat presentation.
MVP uses vector search. Post-MVP adds keyword search, filters, and reranking.

## 8. Chat Boundary
Chat service handles conversation persistence, retrieval orchestration, prompt/context construction, model invocation, citations, and response persistence.

## 9. Agent Boundary
Agent service owns tool definitions and tool execution contracts.
Tools call normal application services rather than duplicate business logic.

## 10. Failure Isolation
A failed embedding call must not corrupt document metadata.
A failed chunk must be traceable to a document version.
A failed AI response must not destroy conversation history.
Retry operations must be idempotent where practical.

## 11. Scalability Path
Initial: synchronous server calls + database-backed processing state.
Later: move heavy ingestion jobs to a background worker/queue without changing the domain contracts.

## 12. Design Principle
Prefer clear module boundaries and simple infrastructure over premature distributed systems.
