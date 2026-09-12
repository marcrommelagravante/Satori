---
name: satori-rag-retrieval
description: Implements and improves Satori's custom RAG retrieval pipeline using Gemini embeddings, PostgreSQL pgvector, semantic search, hybrid retrieval, ranking, context construction, and citations.
---
# Satori RAG Retrieval

## Non-negotiable architecture
Satori owns its retrieval pipeline. Do not replace it with Gemini File Search or another managed RAG platform unless the project specification changes.

## MVP retrieval
```text
question -> Gemini embedding -> pgvector semantic search -> top chunks -> context builder
```

## Authorization
Every retrieval query must be scoped to the current authorized workspace before results are returned. Never use semantic similarity to bypass tenant isolation.

## Chunk selection
Return a bounded number of relevant chunks. Keep document, version, page, section, chunk ID, and relevance score available for citations/debugging.

## Context construction
Construct a compact, ordered context. Do not blindly send every retrieved chunk to Gemini. Preserve source identifiers alongside each context block.

## Grounding
The generation prompt must instruct the model to answer from supplied knowledge context. If useful evidence is absent, the system should say it cannot verify the answer from the knowledge base rather than inventing facts.

## Citations
Every displayed citation must map to a real chunk and then to a real document/version/page/section. Never fabricate source references.

## Post-MVP hybrid retrieval
Combine semantic/vector search with keyword search and metadata filtering. Only add reranking when evaluation shows that it improves retrieval enough to justify complexity/latency.

## Retrieval evaluation
Use a fixed dataset to measure Recall@K, Precision@K, MRR where useful, and expected-source retrieval rate.

## Debugging order
For a bad answer:
1. Inspect retrieved chunks.
2. Inspect ranking/filtering.
3. Inspect context construction.
4. Inspect prompt/model behavior.
5. Inspect citation mapping.

Do not blame the LLM first.
