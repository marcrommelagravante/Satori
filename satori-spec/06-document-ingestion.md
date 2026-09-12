# Satori — Document Ingestion Pipeline

## 1. Goal
Turn an uploaded file into searchable chunks with reliable metadata and embeddings.

## 2. Pipeline
```text
Upload
 ↓
Validate
 ↓
Store Original
 ↓
Create Document Record
 ↓
Extract Text
 ↓
Normalize/Clean
 ↓
Chunk
 ↓
Generate Embeddings
 ↓
Persist Chunks + Vectors
 ↓
Mark READY
```

## 3. Processing States
PENDING, PROCESSING, READY, FAILED.
Optional internal sub-states: EXTRACTING, CHUNKING, EMBEDDING, INDEXING.

## 4. Validation
Check extension, MIME type, file size, user/workspace authorization, and basic file integrity.
Reject unsupported or invalid files before expensive AI processing.

## 5. Original File
Store the original object in object storage.
Store only a stable storage key/reference in the database.

## 6. Extraction
PDF: extract text while preserving page boundaries when possible.
DOCX: extract paragraphs/headings and relevant table text when supported.
TXT: read and normalize text.
Keep page/section metadata whenever the format allows it.

## 7. Cleaning
Normalize whitespace.
Remove obvious extraction noise.
Preserve headings, lists, and meaningful boundaries.
Do not rewrite content in a way that changes its meaning.

## 8. Chunking Strategy
MVP uses semantic/structural chunking with a target size and overlap.
Prefer splitting at headings/paragraphs before hard token/character limits.
Keep small overlap to preserve context across boundaries.
Measure chunk quality during evaluation; do not assume one chunk size is universally correct.

## 9. Chunk Metadata
Each chunk should retain:
- document version ID
- chunk index
- page number when known
- section/heading when known
- source text
- token estimate
- embedding

## 10. Embeddings
Generate one vector per stored chunk using the selected Gemini embedding model.
The query uses the same embedding space.
Never mix embeddings from incompatible models in one index.

## 11. Idempotency
Use document version/checksum/chunk index to prevent duplicate processing.
Retries should update/replace deterministic records rather than create uncontrolled duplicates.

## 12. Errors
Save processing failure state and a safe error code/message.
Do not expose internal stack traces to end users.
Provide a retry action for recoverable failures.

## 13. Large Files
Do not send an entire large document to the LLM as one prompt.
Processing and retrieval must work at chunk level.

## 14. Completion Condition
A document version is READY only when all required chunks have successfully stored embeddings and metadata.
