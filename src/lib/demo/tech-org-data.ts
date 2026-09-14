/**
 * Golden Demo Knowledge Base tailored for Tech Organizations & Engineering Teams.
 * Features comprehensive, realistic engineering bylaws, security protocols, and AI compliance standards.
 */

export interface DemoDocumentDefinition {
  filename: string;
  category: string;
  content: string;
}

export interface DemoBenchmarkCase {
  question: string;
  expectedAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export const TECH_ORG_DOCUMENTS: DemoDocumentDefinition[] = [
  {
    filename: "Synthetix-Engineering-Handbook-v2.4.txt",
    category: "Engineering",
    content: `SYNTHETIX SYSTEMS — ENGINEERING HANDBOOK & ARCHITECTURE STANDARDS
Document Reference: ENG-STD-2026-V2.4
Effective Date: Q1 2026

1. ARCHITECTURAL PRINCIPLES & BOUNDARIES
1.1 Modular Monolith First: All core platform capabilities must begin as clean, modular domains within our primary repository before any service extraction is considered. Domain boundaries are strictly enforced through explicit public APIs and TypeScript interfaces.
1.2 Multi-Tenant Data Isolation: Every database query accessing tenant-scoped data must explicitly include the tenant/workspace identifier. Never rely solely on client-provided query parameters without server-side verification.
1.3 Database Conventions: PostgreSQL is our designated system of record. Schema migrations must be managed declaratively using Drizzle ORM and executed during deployment pipelines. Direct destructive schema alterations in production environments are strictly forbidden.

2. SERVICE LEVEL OBJECTIVES (SLOs) & PERFORMANCE TARGETS
2.1 Availability Target: Core operational APIs must maintain 99.95% monthly uptime.
2.2 Latency Budgets:
- Synchronous API Read Operations: p50 < 45ms, p95 < 200ms, p99 < 500ms.
- Semantic RAG Search Retrieval: p50 < 120ms, p95 < 350ms.
- Grounded AI Generation: p50 < 2500ms, p95 < 5000ms.
2.3 Rate Limiting: All public-facing API endpoints must implement sliding-window rate limiters configured to 60 requests per minute per IP or authenticated user session.

3. PULL REQUEST (PR) & CODE REVIEW PROTOCOL
3.1 Reviewer Quorum: A minimum of two passing code reviews from staff or senior engineers is required for merges to main.
3.2 Automated Test Gates: All PRs must achieve 100% clean compilation, zero ESLint warnings, and pass all automated regression test suites before merge approval.
3.3 Branch Protection: Direct commits to main or staging branches are permanently disabled by GitHub branch rules.`,
  },
  {
    filename: "Synthetix-Security-Incident-Response-Policy.txt",
    category: "Security",
    content: `SYNTHETIX SYSTEMS — INFORMATION SECURITY & INCIDENT RESPONSE POLICY
Document Reference: SEC-POL-2026-09
Classification: Confidential — Internal Engineering Only

1. INCIDENT CLASSIFICATION & SEVERITY MATRIX
1.1 Severity 1 (Critical Incident): Immediate active breach, customer data exfiltration, or complete platform unavailability. Response time target: < 15 minutes. Incident Commander assigned immediately.
1.2 Severity 2 (High Severity): Partial service outage or critical vulnerability identified in production dependencies without evidence of active exploitation. Response time target: < 1 hour.
1.3 Severity 3 (Moderate Severity): Non-customer facing internal tool disruption or low-risk security scan finding. Response time target: < 24 hours.

2. CREDENTIAL & SECRETS MANAGEMENT
2.1 API Key Lifecycle: Production API credentials and database access secrets must be rotated every 90 days.
2.2 Compromised Credential Protocol:
- Step 1: Immediately revoke the affected token in the provider dashboard (Neon, Gemini, Vercel).
- Step 2: Issue an emergency replacement credential and deploy via automated environment variable secrets.
- Step 3: Inspect server audit logs covering the previous 72 hours to audit unauthorized data access.
- Step 4: File a Post-Mortem within 48 hours.
2.3 Prohibition on Hardcoded Secrets: API keys, database connection strings, and private certificates must never be committed to Git repositories or exposed to browser client bundles.

3. REGULATORY COMPLIANCE & NOTIFICATION
3.1 Breach Notification: In the event of confirmed personal data exposure, affected organizations and relevant authorities must be formally notified within 72 hours in compliance with SOC2 Type II and GDPR obligations.`,
  },
  {
    filename: "Synthetix-AI-Compliance-And-Guardrails.txt",
    category: "AI & Compliance",
    content: `SYNTHETIX SYSTEMS — ARTIFICIAL INTELLIGENCE & LLM USAGE GUARDRAILS
Document Reference: AI-GOV-2026-03
Governance Body: AI Ethics & Engineering Security Council

1. ACCEPTABLE USE & DATA PRIVACY RULES
1.1 Prohibition on Unapproved Public Models: Customer proprietary documents, intellectual property, and source code must never be submitted to unvetted external consumer AI interfaces.
1.2 Enterprise API Standards: All production AI workflows must utilize enterprise API endpoints (such as Google Gemini Enterprise) where vendor terms guarantee that customer prompts and documents are NOT used for model training or retained beyond inference execution.
1.3 Strict Data Boundaries: AI retrieval pipelines must only provide context authorized for the active tenant workspace. Cross-workspace retrieval is strictly prohibited under zero-trust tenant isolation.

2. GROUNDED GENERATION & CITATION MANDATE
2.1 Citation Requirement: Any AI-generated factual assertion, policy summary, or code recommendation derived from workspace documentation MUST include direct, verifiable source citations referencing specific document chunk IDs.
2.2 Anti-Hallucination Fallback: If retrieved workspace context does not contain sufficient factual evidence to answer a query, the AI system must explicitly state that insufficient information exists rather than generating plausible falsehoods.
2.3 Prompt Injection Defense: Retrieved text from user documents must be treated as untrusted data and wrapped in explicit containment tags (<untrusted_document_context>). Document text must never be allowed to override core application instructions.`,
  },
];

export const TECH_ORG_BENCHMARK_CASES: DemoBenchmarkCase[] = [
  {
    question: "What is the mandatory credential rotation period and protocol when an API key is compromised?",
    expectedAnswer: "API credentials must be rotated every 90 days. If compromised, revoke immediately, issue an emergency replacement via environment secrets, audit logs for the last 72 hours, and file a post-mortem within 48 hours.",
    category: "Security",
    difficulty: "easy",
  },
  {
    question: "What are the latency budgets and availability targets for the core microservices?",
    expectedAnswer: "Core operational APIs must maintain 99.95% availability. Read operations target p50 < 45ms and p95 < 200ms, semantic RAG search targets p50 < 120ms and p95 < 350ms, and grounded generation targets p50 < 2500ms and p95 < 5000ms.",
    category: "Engineering",
    difficulty: "medium",
  },
  {
    question: "What are the rules regarding data privacy and citation requirements for AI models?",
    expectedAnswer: "Customer data must never be submitted to public unvetted models; enterprise APIs must guarantee zero model training retention. Every factual assertion must include direct verifiable chunk citations, and untrusted document text must be contained to prevent prompt injection.",
    category: "AI & Compliance",
    difficulty: "hard",
  },
];
