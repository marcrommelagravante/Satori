# Satori — AI Agent and Tool Architecture

## 1. Purpose
Post-MVP adds controlled tool calling so Gemini can perform multi-step document tasks through application-defined capabilities.

## 2. Agent Flow
```text
User Request
 ↓
Gemini Agent
 ↓
Need a tool?
 ├─ No → final answer
 └─ Yes
      ↓
   Validate tool call
      ↓
   Execute server tool
      ↓
   Return tool result
      ↓
   Gemini continues
```

## 3. Core Tools
- searchDocuments(query, filters)
- getDocument(documentId)
- getRelevantChunks(documentId, query)
- summarizeDocument(documentId)
- compareDocuments(documentIdA, documentIdB)
- createReport(input)

## 4. Tool Rules
- Every tool is server-side.
- Validate arguments with Zod.
- Enforce current-user workspace authorization.
- Tools return structured results.
- Tools must not expose secrets or arbitrary database access.
- The model cannot bypass application permissions.

## 5. Search Tool
Input: natural-language query + optional safe filters.
Output: ranked chunks with source metadata.

## 6. Document Tool
Input: document ID.
Server verifies workspace access.
Output: safe document metadata and permitted content.

## 7. Compare Tool
Fetches relevant content from two authorized document versions.
Returns structured changes/differences for Gemini to explain.

## 8. Report Tool
Takes validated structured content and creates a report record or exportable artifact.
Do not allow the LLM to directly write arbitrary files or database rows.

## 9. Structured Output
Prefer schemas such as:
```json
{
  "title": "...",
  "changes": [
    {
      "topic": "...",
      "oldValue": "...",
      "newValue": "...",
      "importance": "low|medium|high"
    }
  ]
}
```
Validate the model output before rendering or persisting it.

## 10. Tool Loop Limits
Set a maximum tool-call/agent iteration count.
Stop and report a controlled failure if the agent loops or repeatedly requests invalid tools.

## 11. Agent vs RAG
Simple question → retrieval + generation.
Complex multi-step task → agent may call multiple tools.
Do not use an agent when a deterministic service call is enough.

## 12. Auditability
Record tool calls in AI run metadata where practical: tool name, duration, success/failure, and safe arguments/results summary.
