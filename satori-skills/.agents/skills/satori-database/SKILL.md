---
name: satori-database
description: Designs and implements Satori PostgreSQL, Drizzle ORM, schema, migrations, indexes, and pgvector persistence. Use for database or data-model work.
---
# Satori Database Engineering

## Database baseline
- PostgreSQL
- Drizzle ORM
- pgvector

PostgreSQL is the system of record for relational data, document metadata, chunks, embeddings, conversations, citations, AI runs, and evaluation records.

## Core entities
- users
- workspaces
- workspace_members
- documents
- document_versions
- document_chunks
- conversations
- messages
- citations
- ai_runs
- evaluation_cases
- evaluation_results

## Rules
- Model ownership and workspace scope explicitly.
- Every protected resource must be traceable to an authorized workspace.
- Use Drizzle query builders/parameterization for normal queries.
- Do not interpolate user input into SQL.
- Keep embeddings attached to document chunks/version records.
- Preserve page, section, and chunk index metadata for citations.
- Use appropriate indexes for workspace lookups and common retrieval filters.
- Add vector indexes only after the retrieval behavior and distance metric are defined.

## Migrations
Schema changes must be represented by repeatable migrations. Do not edit production schema manually and forget to capture the change.

## Vector data
Use a fixed embedding dimensionality matching the selected Gemini embedding model. Store the dimension in the schema/configuration and keep it consistent.

## Transactions
Use transactions where multiple related records must succeed together. Avoid long transactions around external Gemini calls.

## Deletion
Deleting a document must have a deterministic cleanup path for versions, chunks, citations where applicable, and object storage. Handle partial storage failure explicitly.

## Performance
Start simple. Measure retrieval queries before adding additional indexes. Keep tenant/workspace filtering in the database query itself.
