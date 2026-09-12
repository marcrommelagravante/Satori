# Satori — Technology Stack

## 1. Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Use server components where appropriate and client components only when interactivity requires them.

## 2. Application Layer
- Next.js App Router
- Route handlers/server-side actions as appropriate
- Typed service modules
- Zod for request and AI output validation

## 3. Database
- PostgreSQL
- Drizzle ORM
- pgvector extension

PostgreSQL stores relational records plus vector embeddings.

## 4. AI
Use Gemini as the only LLM provider in the project baseline.
Use Gemini for generation and embeddings where supported by the selected current model/API.
Keep model calls behind an internal AI service so business logic does not depend on raw SDK calls.

## 5. Storage
Original files use object storage.
Default hosted choice: Vercel Blob.
Local development may use a filesystem/local storage adapter.

## 6. Authentication
Use one maintained authentication solution such as Clerk or Auth.js.
The exact provider can be selected during Stage 1 without changing the core domain model.

## 7. Validation
Use Zod at external boundaries:
- API input
- upload metadata
- AI structured output
- tool arguments
- configuration validation

## 8. Testing
- Unit tests for chunking, retrieval helpers, permissions, and services
- Integration tests for database and API flows
- End-to-end tests for upload → process → ask → cite
- AI evaluation tests for retrieval and answer quality

## 9. Deployment
- GitHub repository
- Vercel application deployment
- Managed PostgreSQL for production
- Hosted object storage
- Gemini API key stored as server-only environment variable

## 10. Explicitly Avoid at MVP
- LangChain as a mandatory abstraction
- Separate vector DB
- MongoDB
- Kubernetes
- Microservices
- Multiple LLM providers
- Complex event streaming

## 11. Why This Stack
The stack is modern, portfolio-relevant, relatively inexpensive, and lets the developer understand the underlying RAG pipeline instead of hiding it behind a managed AI platform.
