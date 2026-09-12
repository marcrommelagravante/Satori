# Satori — RAG and Retrieval

## 1. RAG Principle
Satori answers workspace knowledge questions by retrieving relevant stored content and supplying that context to Gemini.

## 2. MVP Query Flow
```text
Question
 ↓
Authorize Workspace
 ↓
Generate Query Embedding
 ↓
Vector Search
 ↓
Top-K Chunks
 ↓
Context Builder
 ↓
Gemini
 ↓
Answer + Citations
```

## 3. Vector Search
Search document_chunks embeddings within the current workspace.
Retrieve a configurable top-K candidate set.
Store similarity/relevance values for diagnostics and citations.

## 4. Metadata Filtering
At minimum filter by workspace.
Future filters: document ID, category, file type, version, date, section.
Filters should be applied server-side.

## 5. Context Construction
Pass only the most useful chunks to Gemini.
Include source metadata such as document name, page, section, and chunk identifier.
Keep context within safe model limits.

## 6. Grounded Prompt Behavior
The model should:
- answer from supplied context for workspace questions
- avoid inventing unsupported facts
- state when the knowledge base lacks enough information
- cite source identifiers that map to retrieved chunks

## 7. Citation Mapping
For every cited source, the application must know the exact chunk/document/page metadata.
Do not invent citation labels after generation.
Prefer structured citation references in the model output or deterministic post-processing.

## 8. Post-MVP Hybrid Search
```text
Vector Search
+
PostgreSQL Keyword Search
+
Metadata Filters
 ↓
Candidate Pool
 ↓
Rank/Rerank
 ↓
Top Context
```

## 9. Reranking
Reranking is optional after MVP.
Only add it after baseline retrieval is measurable.
Compare retrieval metrics before and after the change.

## 10. Retrieval Failure
If no useful chunks are found, do not fabricate an answer.
Return a clear grounded response such as: "I couldn't find enough information in this workspace."

## 11. Conversation Context
Recent conversation messages may be included when relevant, but historical chat must not override workspace retrieval rules.

## 12. Retrieval Configuration
Keep top-K, similarity thresholds, context limits, and model settings configurable rather than hard-coded throughout the codebase.

## 13. Performance
Use vector indexes when dataset size warrants them.
Measure query latency and result quality separately.
Do not optimize based only on intuition.
