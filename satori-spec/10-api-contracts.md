# Satori — API and Service Contracts

## 1. Principle
APIs expose domain capabilities, not raw database operations.
Validate all inputs and return predictable typed responses.

## 2. Auth
GET /api/auth/session
Returns current authenticated user/session metadata.

## 3. Workspaces
GET /api/workspaces
POST /api/workspaces
GET /api/workspaces/:id
POST /api/workspaces/:id/members
Authorization required.

## 4. Documents
GET /api/workspaces/:workspaceId/documents
POST /api/workspaces/:workspaceId/documents/upload
GET /api/documents/:id
DELETE /api/documents/:id
POST /api/documents/:id/retry

Upload endpoint creates/updates metadata and starts processing.

## 5. Ingestion Status
GET /api/documents/:id/status
Returns overall status plus optional current stage and safe error information.

## 6. Chat
GET /api/workspaces/:workspaceId/conversations
POST /api/workspaces/:workspaceId/conversations
GET /api/conversations/:id/messages
POST /api/conversations/:id/messages
The server resolves workspace access from the authenticated user and conversation ownership.

## 7. Search
POST /api/workspaces/:workspaceId/search
MVP supports semantic search; later supports hybrid filters.

## 8. Reports
POST /api/workspaces/:workspaceId/reports
GET /api/reports/:id

## 9. Evaluations
GET /api/workspaces/:workspaceId/evaluations
POST /api/workspaces/:workspaceId/evaluations/run

## 10. Response Pattern
Success:
```json
{ "data": {}, "error": null }
```
Failure:
```json
{ "data": null, "error": { "code": "SAFE_CODE", "message": "User-safe message" } }
```

## 11. Error Codes
Examples: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, FILE_UNSUPPORTED, PROCESSING_FAILED, AI_UNAVAILABLE, RATE_LIMITED.

## 12. AI Service Contract
Inputs: operation, user/workspace context, prompt/context, model configuration.
Outputs: validated text/structured result, citations when applicable, usage/latency metadata.

## 13. Tool Contract
Tools receive typed validated arguments and an authorization context.
Return structured typed data.

## 14. Streaming
Streaming chat responses can be added after basic request/response behavior is stable.
Streaming must not bypass persistence, authorization, or citation tracking.
