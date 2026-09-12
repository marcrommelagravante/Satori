---
name: satori-project-context
description: Provides the authoritative Satori project context, architecture, scope, technology decisions, naming, and implementation rules. Use when starting work on Satori or when a task may conflict with project requirements.
---
# Satori Project Context

## Purpose
Satori is an AI-powered knowledge and document intelligence platform for small businesses, organizations, and teams. Initial real-world testing may use school/community organization documents such as bylaws, policies, and guidelines only when the tester is authorized to use them.

## Product identity
- Name: Satori
- Meaning: Japanese 悟り (satori), associated with awakening, realization, and deep understanding.
- Tagline: Your knowledge, intelligently connected.

## Source of truth
Read the relevant files in the repository's specification package before changing architecture or behavior. The specification files are the authoritative requirements. Do not silently invent conflicting behavior.

## Architecture
Use a modular monolith in one Next.js application. Keep clear internal module boundaries rather than introducing microservices prematurely.

Core modules:
- auth
- workspaces
- documents
- ingestion
- retrieval
- chat
- AI tools/agents
- reports
- evaluation
- observability

## AI architecture
Satori uses a custom RAG pipeline. Do not replace it with Gemini File Search or another managed RAG service unless the specification is explicitly changed.

Core path:
Document -> extract -> clean -> chunk -> Gemini embedding -> PostgreSQL/pgvector
Question -> embedding -> retrieval -> ranking -> context -> Gemini -> cited answer

## Engineering rules
- PostgreSQL is the system of record.
- pgvector stores chunk embeddings.
- Original files live in object storage.
- Business logic must not call the database directly from UI components.
- AI tool calls must execute through authorized application services.
- Validate external input with Zod.
- Keep secrets server-side.
- Every workspace-scoped query must enforce authorization.

## MVP
Authentication, workspace creation/selection, PDF/DOCX/TXT upload, processing states, extraction, chunking, Gemini embeddings, pgvector semantic retrieval, RAG chat, citations, and conversation persistence.

Post-MVP includes hybrid retrieval, filters, reranking, comparison, summaries, reports, tool calling, research mode, evaluation, observability, rate limiting, and production hardening.

## Change rule
When requirements are missing, choose the smallest implementation consistent with the architecture. Record meaningful decisions. Do not add infrastructure only because it is popular.
