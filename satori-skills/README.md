# Satori — Antigravity Skills

These are project-scoped Agent Skills for the Satori AI knowledge and document intelligence platform.

## Install in Antigravity

Copy the `.agents/skills/` directory into the root of the Satori repository:

```text
Satori repo/
└── .agents/
    └── skills/
        ├── satori-project-context/
        ├── satori-nextjs/
        ├── satori-database/
        ├── satori-document-ingestion/
        ├── satori-rag-retrieval/
        ├── satori-gemini-ai/
        ├── satori-ui-design/
        ├── satori-security/
        ├── satori-testing-evaluation/
        └── satori-vercel-deployment/
```

Restart/reload Antigravity if needed, then ask the agent which Satori skills are available.

## Design principle
Each skill is narrowly focused. `satori-project-context` provides the project-wide rules; the other skills specialize in their respective engineering areas.

## Important
Keep these skills committed to the Satori repository so the project's AI agent has the same engineering guidance after cloning the repo. Do not put secrets or private organizational documents into these skill files.
