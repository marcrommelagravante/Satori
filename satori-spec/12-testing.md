# Satori — Testing Strategy

## 1. Testing Layers
- Unit
- Integration
- End-to-end
- AI evaluation
- Security-focused tests

## 2. Unit Tests
Cover:
- chunking
- text normalization
- metadata extraction helpers
- permission checks
- citation mapping
- retrieval ranking helpers
- Zod schemas
- tool validation

## 3. Integration Tests
Test with a real test PostgreSQL database:
- migrations
- document creation
- chunk persistence
- pgvector queries
- workspace isolation
- conversation persistence

## 4. End-to-End MVP Test
```text
Sign in
 ↓
Create workspace
 ↓
Upload PDF
 ↓
Wait for READY
 ↓
Ask question
 ↓
Receive grounded answer
 ↓
Open citation
```

## 5. Negative Tests
- unsupported file
- oversized file
- failed extraction
- embedding failure
- missing workspace membership
- unauthorized document ID
- deleted document
- AI unavailable
- retrieval returns no useful context

## 6. Retrieval Tests
Given a known test document set:
- verify expected chunks are retrieved
- verify unrelated chunks rank lower
- verify workspace filter is always applied
- verify citation IDs map to the retrieved chunks

## 7. AI Answer Tests
Create a fixed evaluation dataset with expected answers and source chunks.
Measure accuracy rather than relying only on manual observation.

## 8. Agent Tests
Test:
- valid tool call
- malformed arguments
- unauthorized document request
- tool failure
- max iteration limit
- structured output validation

## 9. Security Tests
Attempt cross-workspace access using:
- altered IDs
- direct endpoint calls
- search queries
- citation URLs
- tool arguments

Expected outcome: no protected data is returned.

## 10. Regression Rule
Whenever retrieval/chunking/prompt changes, rerun the AI evaluation dataset.

## 11. Test Data
Use synthetic/public/authorized files.
Include mixed document formats and deliberately tricky questions.

## 12. Definition of Done
A feature is not done when code compiles; it needs tests for its normal path and important failure/authorization cases.
