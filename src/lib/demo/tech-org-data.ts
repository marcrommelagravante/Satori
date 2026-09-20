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

export interface DemoReportDefinition {
  title: string;
  type: "document_summary" | "document_comparison";
  sourceDocNames: string[];
  content: {
    executiveSummary: string;
    sections: Array<{ title: string; content: string }>;
    keyFindings?: string[];
    recommendations?: string[];
  };
}

export const TECH_ORG_REPORTS: DemoReportDefinition[] = [
  {
    title: "Synthetix Engineering Architecture Standards Summary",
    type: "document_summary",
    sourceDocNames: ["Synthetix-Engineering-Handbook-v2.4.txt"],
    content: {
      executiveSummary:
        "High-level synthesis of Synthetix Systems engineering bylaws, modular monolith architectural boundaries, multi-tenant database conventions, latency budgets, and PR review protocols.",
      sections: [
        {
          title: "1. Architectural Boundaries & Monolith Principles",
          content:
            "Synthetix enforces a modular monolith first strategy. Domain boundaries are strictly preserved via explicit TypeScript public interfaces. Cross-tenant data isolation requires explicit workspaceId inclusion in every database query.",
        },
        {
          title: "2. Service Level Objectives & Performance Budgets",
          content:
            "Core platform uptime target is 99.95%. Read latency budgets target p95 < 200ms, semantic search retrieval targets p95 < 350ms, and grounded AI generation targets p95 < 5000ms with sliding-window rate limiters.",
        },
        {
          title: "3. Pull Request Review & Code Gates",
          content:
            "A minimum quorum of 2 staff or senior engineers must approve each PR. Automated CI pipelines require 100% clean compilation, zero lint warnings, and passing automated test suites before merge approval.",
        },
      ],
      keyFindings: [
        "Modular monolith architecture eliminates distributed network latency while enforcing strict internal domain boundaries.",
        "Zero-trust tenant isolation is verified at the database query layer rather than relying on client parameters.",
        "Strict latency budgets ensure rapid user interactions across semantic search and grounded AI chat.",
      ],
      recommendations: [
        "Monitor latency budgets continuously using automated application telemetry dashboards.",
        "Enforce pre-commit type-check and lint hooks across all local developer environments.",
      ],
    },
  },
  {
    title: "Security Incident Response & Compliance Analysis",
    type: "document_summary",
    sourceDocNames: ["Synthetix-Security-Incident-Response-Policy.txt"],
    content: {
      executiveSummary:
        "Comprehensive risk and analytical breakdown detailing Synthetix Systems information security incident response procedures, credential rotation cycles, emergency revocation protocols, and 72-hour regulatory breach notification mandates.",
      sections: [
        {
          title: "1. Incident Classification & Response Timelines",
          content:
            "Incidents are categorized into three severity tiers. Severity 1 (Critical Incident) requires an Incident Commander assigned within 15 minutes. Severity 2 requires mitigation within 1 hour.",
        },
        {
          title: "2. Secrets Management & Credential Lifecycle",
          content:
            "All API credentials and database secrets must rotate every 90 days. If compromised, credentials must be revoked immediately, emergency replacement tokens deployed via secrets managers, and 72 hours of audit logs inspected.",
        },
        {
          title: "3. Regulatory Compliance & Notification Protocol",
          content:
            "Under SOC2 Type II and GDPR obligations, confirmed personal data exposures require formal notification to authorities and affected client organizations within 72 hours.",
        },
      ],
      keyFindings: [
        "90-day credential rotation cycles minimize exposure windows for production API keys.",
        "Structured audit logging captures all database queries and report generation events for forensic tracking.",
      ],
      recommendations: [
        "Automate secrets scanning pre-commit hooks to block hardcoded keys from entering Git history.",
        "Schedule quarterly simulated incident response drills across all engineering teams.",
      ],
    },
  },
  {
    title: "Engineering Bylaws vs Security Policy Comparison",
    type: "document_comparison",
    sourceDocNames: [
      "Synthetix-Engineering-Handbook-v2.4.txt",
      "Synthetix-Security-Incident-Response-Policy.txt",
    ],
    content: {
      executiveSummary:
        "Comparative evaluation mapping operational engineering guidelines against security compliance mandates to ensure compatibility between developer velocity and security compliance.",
      sections: [
        {
          title: "1. Data Isolation & Tenant Boundaries",
          content:
            "Both policies mandate zero-trust isolation and prohibit hardcoded credentials across source repositories and runtime bundles.",
        },
        {
          title: "2. Performance vs Audit Overhead",
          content:
            "Grounded AI generation latency targets (< 5000ms p95) comfortably absorb the security requirement for synchronous audit log event recording.",
        },
        {
          title: "3. Quorum vs Emergency Action Protocols",
          content:
            "While standard PRs require 2 senior approvals, emergency hotfixes during Severity 1 incidents follow an accelerated single-approver protocol.",
        },
      ],
      keyFindings: [
        "Operational SLOs and security SLAs are fully compatible under the current modular monolith framework.",
        "Tenant-scoped audit trails provide complete provenance for compliance investigations.",
      ],
      recommendations: [
        "Align automated test gates with security dependency scanning in CI/CD pipelines.",
      ],
    },
  },
];

