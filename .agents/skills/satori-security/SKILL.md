---
name: satori-security
description: Applies Satori security rules for authentication, workspace isolation, uploads, prompt injection, AI data boundaries, secrets, rate limits, deletion, and safe errors. Use for security-sensitive implementation or review.
---
# Satori Security

## Threats
Protect against unauthorized document access, cross-workspace retrieval, unsafe uploads, prompt injection, tool abuse, and secret exposure.

## Authentication and authorization
Protected routes require a valid session. Every resource access must verify workspace membership. A client-supplied workspace ID is never proof of access.

## Tenant isolation
Workspace filtering belongs in database/repository queries and service authorization. Apply it to:
- documents
- chunks/retrieval
- conversations
- citations
- reports
- AI tools

## Upload security
Validate size/MIME/extension. Server-generates storage keys. Never execute uploaded code or macros.

## Secrets
Gemini and database credentials are server-only. Never commit `.env` files or expose secrets to browser bundles.

## Prompt injection
Retrieved text is untrusted data. Do not let document content override system/application instructions. Tool calls require application-side validation and authorization.

## AI data boundary
Send Gemini only the minimum authorized context required for the current task. Do not retrieve unrelated workspace content to improve an answer.

## SQL safety
Use Drizzle parameterization/query builders. Never turn arbitrary natural-language input into unrestricted SQL operations.

## Logging
Log identifiers, timings, status, and safe metadata. Avoid logging full sensitive document contents, secrets, or unnecessary prompts/responses.

## Errors
Clients receive safe, actionable errors. Internal diagnostics stay server-side.

## Deletion
Deletion must clean related vector/chunk data and handle object-storage failures explicitly.

## Real-world testing
Only use documents the tester is authorized to use. Do not upload passwords, credentials, identity documents, API keys, or unnecessary personal records.
