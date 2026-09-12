# Satori — Evaluation and Observability

## 1. Goal
Measure whether Satori retrieves the right information, answers correctly, cites correctly, and performs reliably.

## 2. Evaluation Dataset
Each case should contain:
- question
- expected answer or key facts
- expected source chunk IDs
- optional category/difficulty

## 3. Retrieval Metrics
Useful metrics:
- Recall@K
- Precision@K
- MRR where applicable
- percentage of questions retrieving at least one expected source

## 4. Answer Metrics
Track a practical rubric:
- correctness
- groundedness
- completeness
- citation correctness

Automated LLM-as-judge metrics may be added, but keep a human-review sample for calibration.

## 5. Citation Metrics
Measure whether:
- every citation maps to a real chunk
- cited chunk supports the claim
- page/section metadata is accurate

## 6. Performance Metrics
Track:
- total request latency
- retrieval latency
- model latency
- processing latency
- embedding latency
- token usage where provider data is available
- failure rate

## 7. AI Run Record
Each major AI operation should record safe metadata:
operation, model, workspace, user, status, latency, token usage, error code, created time.
Avoid storing sensitive prompts/responses unnecessarily.

## 8. Evaluation Dashboard
Suggested MVP/post-MVP dashboard:
```text
Evaluation Cases
Retrieval Accuracy
Answer Accuracy
Citation Accuracy
Average Latency
Failure Rate
Token Usage
```

## 9. Baseline Rule
Before optimizing retrieval, save a baseline evaluation result.
Every significant retrieval/chunking/prompt change should be compared to that baseline.

## 10. Debugging Workflow
```text
Bad Answer
 ↓
Check retrieved chunks
 ↓
Check ranking
 ↓
Check context construction
 ↓
Check prompt/model
 ↓
Check citation mapping
```
Do not blame the model first.

## 11. Observability Philosophy
Logs explain failures; metrics show trends; evaluation measures quality.
These are different concerns and should not be mixed together.
