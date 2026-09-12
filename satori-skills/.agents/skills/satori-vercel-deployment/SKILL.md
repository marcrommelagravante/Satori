---
name: satori-vercel-deployment
description: Deploys and configures Satori for Vercel with safe environment variables, production storage/database settings, build validation, and deployment checks.
---
# Satori Vercel Deployment

## Deployment baseline
- GitHub repository
- Vercel application
- Managed PostgreSQL for production
- Hosted object storage
- Gemini API key as a server-only environment variable

## Environment separation
Maintain separate values for local development and production. Never hardcode credentials in source files.

## Pre-deploy checks
- typecheck
- lint
- unit tests
- integration tests where available
- production build
- environment variable validation
- database migrations reviewed

## Runtime boundaries
Browser code must not receive Gemini/database secrets. Server routes perform privileged operations.

## Database
Run migrations intentionally against the target environment. Do not rely on accidental local schema state.

## Storage
Production file storage must use a hosted object-storage adapter. Preserve server-generated storage keys and document ownership metadata.

## Reliability
Use safe error handling and explicit processing states. Do not assume a serverless request can run a long document-ingestion job synchronously forever; preserve a migration path to background jobs when needed.

## Cost awareness
Avoid unnecessary AI calls, oversized retrieval contexts, duplicate embeddings, and unbounded file uploads. Track usage where practical.

## Verification
After deployment, verify the production UI, authentication, document upload, processing, retrieval, and AI response path with non-sensitive test data.
