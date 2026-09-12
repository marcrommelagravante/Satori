---
name: satori-nextjs
description: Implements Satori frontend and server application work using Next.js App Router, React, and TypeScript while preserving the modular monolith architecture and server/client boundaries.
---
# Satori Next.js Engineering

## Stack
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Rules
- Prefer Server Components by default.
- Use Client Components only for interactive browser behavior.
- Keep secrets and privileged database/AI operations on the server.
- Route handlers and server actions must validate inputs before calling services.
- UI components should call application services through typed server boundaries rather than embedding business logic.
- Keep domain logic out of visual components.

## Module pattern
Prefer a structure similar to:
```text
src/
  app/
  components/
  lib/
    auth/
    workspaces/
    documents/
    ingestion/
    retrieval/
    chat/
    ai/
    evaluation/
    db/
```
Adapt names only when the existing repository structure makes a better local choice.

## API/UI flow
```text
UI -> route/server action -> validation -> domain service -> persistence/AI -> typed result -> UI
```

## Error handling
Expose safe user-facing errors. Keep diagnostic details in server logs. Never leak API keys, stack traces, database credentials, or sensitive document contents.

## Type discipline
Avoid `any` unless there is a documented unavoidable boundary. Prefer inferred Drizzle types, explicit domain types, and Zod schemas.

## Data loading
Fetch only the data required for the current page. Avoid turning the entire dashboard into one client component.

## Performance
Avoid unnecessary client-side fetching, duplicate requests, giant context payloads, and rendering large document contents without pagination/windowing.

## Completion checklist
- Correct server/client boundary
- Zod validation at external input
- Authorization before protected resource access
- Loading, empty, success, and failure states
- No secrets in client code
- Tests added where behavior is non-trivial
