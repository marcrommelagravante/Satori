# Satori — Deployment and Cost Plan

## 1. Development Goal
Keep the student/portfolio development environment as close to zero cost as practical.
Use free/local resources where reasonable and scale only when required.

## 2. Local Development
- Next.js locally
- Local PostgreSQL
- Local file storage adapter
- Gemini API using available free/low-cost quota
- GitHub for source control

## 3. Hosted Development/Portfolio
Target architecture:
```text
GitHub
 ↓
Vercel
 ↓
Next.js app
 ↓
Managed PostgreSQL + pgvector
 ↓
Object storage
 ↓
Gemini API
```

## 4. Main Cost Drivers
Costs can come from:
- LLM input/output tokens
- embedding requests
- database storage/compute
- object storage and operations
- hosting usage

## 5. Cost Controls
- Keep retrieved context small
- Use chunk limits and top-K limits
- Cache safe repeated operations where useful
- Avoid regenerating embeddings unnecessarily
- Make processing idempotent
- Rate-limit public AI operations
- Track token usage and latency

## 6. Environment Variables
Examples:
DATABASE_URL
GEMINI_API_KEY
AUTH_SECRET/provider settings
BLOB/storage credentials
APP_URL

Never commit actual secret values.

## 7. Environments
Use at least:
- development
- production
A preview/staging environment may be added through Vercel later.

## 8. Production Database
Use a managed PostgreSQL service that supports pgvector.
Apply migrations through the deployment workflow.

## 9. Production File Storage
Use object storage for originals.
Database stores metadata and stable storage keys, not huge binary payloads.

## 10. Cost Policy
Do not upgrade services solely for portfolio prestige.
Upgrade only when actual usage or a required production capability justifies it.

## 11. Current Pricing Caution
Vendor pricing and free tiers change. Before deploying publicly, verify the current Gemini, Vercel, storage, and database pricing/limits from their official pricing pages.
The architecture must not depend on a specific free-tier assumption.

## 12. Backup/Recovery
For any real organization test dataset, keep an original authorized copy outside Satori.
Database backups should be enabled according to the managed provider's available plan.
