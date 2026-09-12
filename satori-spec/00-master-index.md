# Satori — Master Specification Index

## 1. Project Identity
- Product: Satori
- Brand meaning: Japanese 悟り (satori), associated with awakening, realization, and deep understanding
- Product tagline: Your knowledge, intelligently connected.
- Type: AI-powered knowledge management and document intelligence platform
- Primary users: Small businesses, organizations, and teams
- Initial real-world test case: school/community organization documents such as bylaws, policies, and guidelines, with permission
- Document scope: Mixed document types
- Development strategy: MVP first, then advanced AI capabilities
- Core AI approach: Custom RAG, not Gemini File Search

## 2. Source-of-Truth Rule
These 15 files collectively define the project. Do not invent requirements that conflict with them.
If implementation details are missing, choose the smallest solution consistent with the architecture and record the decision.
Do not replace custom RAG with a managed RAG service unless the specification is explicitly revised.

## 3. Technology Baseline
- Next.js + React + TypeScript
- Tailwind CSS + shadcn/ui
- Next.js server-side APIs
- PostgreSQL
- Drizzle ORM
- pgvector
- Gemini API for generation and embeddings
- Zod for validation
- Authentication provider selected during foundation setup
- Object/file storage selected during foundation setup; Vercel Blob is the default hosted choice
- GitHub + Vercel deployment

## 4. Architecture
- Architectural style: modular monolith
- Frontend and server-side application logic live in one Next.js project
- Core modules: auth, workspaces, documents, ingestion, retrieval, chat, AI tools, reports, evaluation, observability
- PostgreSQL is the system of record
- pgvector stores chunk embeddings and supports semantic retrieval
- Original files live in object storage; metadata/chunks/embeddings live in PostgreSQL

## 5. MVP Scope
1. Authentication
2. Workspace creation/selection
3. Document upload
4. PDF/DOCX/TXT ingestion
5. Text extraction
6. Cleaning and chunking
7. Gemini embeddings
8. PostgreSQL + pgvector indexing
9. Semantic retrieval
10. RAG chat
11. Source citations
12. Conversation persistence
13. Processing states and retry handling

## 6. Post-MVP Scope
- Hybrid retrieval
- Metadata filters
- Reranking
- Document comparison
- Summarization
- Structured reports
- AI tool calling
- Research mode
- Evaluation datasets and metrics
- AI run tracking
- Rate limiting and stronger security controls
- Production hardening

## 7. Core Flows
### Ingestion
Upload → validate → store → extract → clean → chunk → embed → index → ready
### Question answering
Question → authorize workspace → embed → retrieve → rank → construct context → Gemini → citations → persist → answer
### Agent task
Request → decide tools → execute tools → combine results → structured response → persist

## 8. Build Order
Follow files in numeric order unless a dependency requires otherwise.

1. 01-product-requirements.md
2. 02-architecture.md
3. 03-tech-stack.md
4. 04-database.md
5. 05-auth-workspaces.md
6. 06-document-ingestion.md
7. 07-rag-retrieval.md
8. 08-ai-agent-tools.md
9. 09-ui-ux.md
10. 10-api-contracts.md
11. 11-security.md
12. 12-testing.md
13. 13-evaluation-observability.md
14. 14-deployment-cost.md
15. 15-build-plan-acceptance.md

## 9. Visual Identity
- Primary: Indigo `#4F46E5`
- Primary dark: Indigo `#3730A3`
- Secondary: Violet `#7C3AED`
- Accent: Lavender `#A78BFA`
- Light background: `#FAFAF9`; surface: `#FFFFFF`; text: `#171717`; muted: `#737373`; border: `#E5E5E5`
- Dark background: `#0B0B12`; surface: `#12121A`; elevated: `#181824`; text: `#F5F5F5`; muted: `#A1A1AA`; border: `#27272A`
- Semantic: success `#059669`; warning `#D97706`; error `#DC2626`; info `#2563EB`
- Design rule: indigo represents the application; violet represents AI intelligence; neutrals carry the workspace.
- Style: clean, focused, premium, professional; avoid excessive gradients, neon/glow, glassmorphism, and decorative AI imagery.

## 10. Non-Goals
- No microservices-first architecture
- No unnecessary vector database in addition to PostgreSQL
- No game development features
- No dependency on enterprise customers for validation
- No assumption that uploaded documents are public
- No blind model-generated claims without retrieval evidence for knowledge-base questions
