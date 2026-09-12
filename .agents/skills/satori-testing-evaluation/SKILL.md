---
name: satori-testing-evaluation
description: Tests Satori features across unit, integration, end-to-end, security, retrieval, agent, and AI evaluation layers, with regression baselines and measurable quality checks.
---
# Satori Testing and Evaluation

## Test layers
1. Unit
2. Integration
3. End-to-end
4. Security-focused
5. AI evaluation

## Unit coverage
Prioritize:
- chunking
- normalization
- citation mapping
- ranking helpers
- permissions
- Zod schemas
- tool validation

## Integration coverage
Use a real test PostgreSQL database where practical. Test migrations, chunk persistence, pgvector retrieval, workspace isolation, and conversation persistence.

## MVP E2E
```text
Sign in -> create/select workspace -> upload document -> READY -> ask question -> grounded answer -> open citation
```

## Failure tests
Include unsupported/oversized files, extraction failures, embedding failures, missing membership, unauthorized IDs, deleted documents, AI unavailable, and no useful retrieval context.

## Security tests
Attempt cross-workspace access through direct IDs, search, citation endpoints, and tool arguments. Expect no unauthorized data.

## Agent tests
Test valid calls, malformed arguments, unauthorized resources, tool failures, bounded iterations, and invalid structured outputs.

## AI evaluation
Each case should define:
- question
- expected answer or key facts
- expected source chunks
- optional category/difficulty

Track retrieval quality, answer correctness, groundedness, completeness, and citation correctness.

## Baselines
Save a baseline before changing chunking, retrieval, prompts, or ranking. Compare changes against the baseline.

## Rule
A feature is not done because the demo works. Normal paths and important failure/authorization paths require tests.
