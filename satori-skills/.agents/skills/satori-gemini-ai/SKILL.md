---
name: satori-gemini-ai
description: Builds Satori Gemini model integrations, embeddings, grounded generation, structured output, tool calling, prompts, and AI service boundaries. Use for LLM or agent work.
---
# Satori Gemini AI Engineering

## Provider rule
Gemini is the project's only LLM provider baseline. Keep raw Gemini SDK calls behind an internal AI service so application/domain code is not tightly coupled to the provider SDK.

## Responsibilities
The AI layer may handle:
- embeddings
- grounded generation
- structured output
- tool calling
- agent orchestration

It must not become the application's authorization layer.

## RAG generation
```text
authorized question -> retrieval -> compact context -> grounded prompt -> Gemini -> validated answer -> citations
```

## Hallucination guard
For knowledge-base questions:
- prioritize supplied context
- do not invent missing facts
- acknowledge insufficient evidence
- preserve source associations

## Structured output
When a feature requires machine-readable output, define a Zod schema and validate Gemini output before using it in application logic or persistence.

## Tool calling
Gemini may propose tool calls. Application code must:
1. validate tool name
2. validate arguments with Zod
3. re-check authorization
4. call the normal domain/application service
5. return a safe structured result

Tools must not bypass service-layer rules.

## Agent boundaries
Set bounded tool/iteration limits. Avoid uncontrolled autonomous loops.

## Prompts
Keep system instructions separate from user content and retrieved document data. Treat retrieved documents as untrusted data, not as higher-priority instructions.

## Cost/performance
Limit retrieval context, avoid repeated embeddings, cache only where correctness and authorization are preserved, and track latency/token usage when provider data is available.
