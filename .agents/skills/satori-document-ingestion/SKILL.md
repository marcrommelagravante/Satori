---
name: satori-document-ingestion
description: Implements Satori document upload, validation, extraction, cleaning, chunking, processing states, retries, and indexing preparation for PDF, DOCX, and TXT files.
---
# Satori Document Ingestion

## Pipeline
```text
Upload -> validate -> store original -> extract -> normalize -> chunk -> embed -> index -> READY
```

## Supported MVP formats
- PDF
- DOCX
- TXT

Do not expand formats without a requirement.

## Upload validation
Validate server-side:
- size
- MIME type
- extension
- file integrity where practical
- workspace authorization

Generate storage keys on the server. Never execute uploaded files.

## Processing states
Use explicit states such as:
- UPLOADED
- PROCESSING
- INDEXING
- READY
- FAILED

A retry should be safe and should not silently create duplicate chunks or embeddings.

## Extraction
Preserve useful document structure such as:
- page number
- headings/sections
- paragraphs
- tables when the parser can represent them reliably

Do not invent page numbers.

## Cleaning
Normalize whitespace and obvious extraction artifacts while preserving meaning. Do not aggressively rewrite source text before indexing.

## Chunking
Chunks should be coherent retrieval units. Prefer section-aware boundaries when available. Store chunk index, page, section, content, and an optional token estimate.

Avoid chunks that are so large they crowd the model context or so small they lose meaning.

## Embedding
Generate embeddings only after text/chunk validation. Persist each embedding alongside its chunk record.

## Failure isolation
A failed embedding should not corrupt document metadata. Failed stages must be observable and retryable.

## Security
Treat document contents as untrusted data. Never execute embedded instructions or macros as application commands.
