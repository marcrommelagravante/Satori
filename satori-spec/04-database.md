# Satori — Database Design

## 1. Main Tables
### users
id, email, name, created_at, updated_at

### workspaces
id, name, slug, created_at, updated_at

### workspace_members
id, workspace_id, user_id, role, created_at

### documents
id, workspace_id, name, mime_type, size_bytes, status, category, created_at, updated_at

### document_versions
id, document_id, version_number, storage_key, checksum, extracted_text, created_at

### document_chunks
id, document_version_id, chunk_index, content, page_number, section, token_estimate, embedding, metadata, created_at

### conversations
id, workspace_id, user_id, title, created_at, updated_at

### messages
id, conversation_id, role, content, model, created_at

### citations
id, message_id, chunk_id, relevance_score, rank, created_at

### ai_runs
id, workspace_id, user_id, conversation_id, model, operation, latency_ms, input_tokens, output_tokens, status, error_code, created_at

### evaluation_cases
id, workspace_id, question, expected_answer, expected_chunk_ids, created_at

### evaluation_results
id, evaluation_case_id, actual_answer, retrieved_chunk_ids, answer_score, retrieval_score, citation_score, latency_ms, created_at

## 2. Key Relationships
User → many workspace memberships.
Workspace → many members and documents.
Document → many versions.
DocumentVersion → many chunks.
Conversation → many messages.
Message → many citations.
Citation → one source chunk.

## 3. Important Constraints
- workspace_members unique(workspace_id, user_id)
- document_versions unique(document_id, version_number)
- document_chunks unique(document_version_id, chunk_index)
- conversation must belong to a workspace the user can access
- citations must reference chunks visible through the same workspace boundary

## 4. Vector Data
embedding column lives on document_chunks.
Use pgvector with a dimension matching the selected embedding model.
Do not hard-code an incorrect dimension; configure migration/schema from the chosen production embedding model.

## 5. Indexing
Use normal B-tree indexes for foreign keys/status/timestamps as needed.
Use vector indexing after measuring the dataset; HNSW is a strong default for production-scale semantic search.
Use PostgreSQL full-text indexes later for hybrid search.

## 6. Data Lifecycle
Deleting a document should remove or archive its versions/chunks according to the chosen retention policy.
Do not leave orphaned embeddings.

## 7. Multi-Tenancy Rule
Every document/retrieval query must be scoped by workspace_id derived from the authenticated session, never from arbitrary client input alone.

## 8. Migration Rule
All schema changes go through Drizzle migrations.
No manual production schema edits as the normal workflow.
