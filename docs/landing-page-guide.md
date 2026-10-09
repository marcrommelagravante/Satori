# Satori — Landing Page Architecture & Agent Guide

> **Single Source of Truth for AI Agents & Developers**  
> **Route:** `src/app/page.tsx` (`/`)  
> **Design Thesis:** B2B/prosumer AI knowledge workspace. Calm-intelligence aesthetic, document-first, source-traceable. Marketing & product-introduction front door (NOT an application dashboard).  
> **Status:** Production-Ready & Verified  

---

## 1. High-Level Overview & Page Mission

The landing page is Satori's public-facing front door. Its goal is to communicate five key points to a visitor within 3 to 5 seconds:
1. **What Satori is:** An AI knowledge and document intelligence platform for teams and organizations.
2. **What problem it solves:** Turns scattered, disorganized files (PDF, DOCX, TXT) into a centralized, searchable knowledge base.
3. **How it works:** Extract $\to$ Chunk $\to$ Vectorize (pgvector) $\to$ Hybrid RRF Retrieval $\to$ Grounded Synthesis.
4. **Why it is trustworthy:** Every statement cites verifiable document chunks, sections, and page numbers (zero hallucination).
5. **How to get started:** Frictionless workspace creation and document upload.

---

## 2. File & Component Architecture

All landing page components reside in `src/components/landing/` and are cleanly separated from authenticated application views.

```
src/
├── app/
│   └── page.tsx                     # Server component entry point (fetches session, renders landing)
└── components/
    └── landing/
        ├── landing.css              # Progressive CSS scroll-driven reveal animations
        ├── landing-navbar.tsx       # Sticky responsive navbar with theme toggle & auth buttons
        ├── hero-section.tsx         # Hero copy, primary CTAs, proof lines, and Convergence Stage
        ├── convergence-stage.tsx    # Live animated simulation of the RAG pipeline & token streaming
        ├── convergence-scenarios.ts # Data structures and mock scenarios for Convergence Stage
        ├── how-it-works.tsx         # 3-step linear ingestion & discovery flow
        ├── capability-bento.tsx     # 4-cell asymmetric Bento grid highlighting core capabilities
        ├── source-inspector.tsx     # Interactive dual-pane citation & excerpt inspector
        ├── workspace-showcase.tsx   # Simulated desktop application shell & chat interface
        ├── use-cases.tsx            # Segmented interactive tabs (Organizations, Researchers, etc.)
        ├── architecture-section.tsx # Tech stack marquee & native disclosure for architecture details
        ├── final-cta.tsx            # High-conversion closing banner with auth-aware CTAs
        └── landing-footer.tsx       # Brand wordmark, navigation links, copyright & stack tags
```

---

## 3. Section-by-Section Specification

### 3.1 Server Page Entry Point (`src/app/page.tsx`)
* **Type:** React Server Component (`async function HomePage()`).
* **Session Handling:** Calls `getCurrentUser()` from `@/lib/auth/session` to pass the `user` object to components that adapt CTAs (`LandingNavbar`, `HeroSection`, `WorkspaceShowcase`, `FinalCta`).
* **Styling Wrapper:** `min-h-screen flex flex-col bg-[#EEF2F6] dark:bg-background text-foreground transition-colors`.
* **Motion Wrapper:** Sections below the hero are wrapped in `<div className="scroll-reveal">` for smooth scroll-driven entry animations (via `landing.css`).

---

### 3.2 Navigation Bar (`src/components/landing/landing-navbar.tsx`)
* **Behavior:** Client component (`"use client"`). Sticky header (`sticky top-0 z-50`).
* **Scroll Detection:** Background transitions from transparent to blurred glass (`bg-white/85 dark:bg-[#0B0B12]/85 backdrop-blur-md border-b`) once `window.scrollY > 20`.
* **Left:** `SatoriLogo` component with wordmark (`showWordmark={true}`).
* **Center (Desktop):** In-page smooth scroll anchor links:
  * `#how-it-works` $\to$ *How it works*
  * `#capabilities` $\to$ *Capabilities*
  * `#traceability` $\to$ *Traceability*
  * `#architecture` $\to$ *Architecture*
* **Right:**
  * **Theme Toggle Button:** Client-side theme switcher utilizing `next-themes` (toggles Light / Dark with `Sun`/`Moon` Lucide icons). Uses `React.useSyncExternalStore` to avoid SSR hydration mismatch.
  * **Auth State Awareness:**
    * If `user` is logged in: Renders an indigo button linking to `/dashboard` (*"Open dashboard"*).
    * If `user` is unauthenticated: Renders `/login` link (*"Sign in"*) and primary CTA (*"Get started"*).
* **Mobile Support:** Responsive slide-down menu sheet toggled via hamburger / close icons (`Menu`, `X`).

---

### 3.3 Hero Section & Convergence Stage (`hero-section.tsx` & `convergence-stage.tsx`)

#### Hero Left Column (Value Copy & Action)
* **Eyebrow 1 of 3:**
  ```tsx
  <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
    Grounded Knowledge Workspace
  </span>
  ```
  *(Follows strict Anti-Slop rule: DM Sans 500 / Geist Mono uppercase, no emojis, no em-dashes).*
* **Headline:** *"Your knowledge, intelligently connected."* (Space Grotesk, max 2 lines, `text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight`).
* **Subtext:** *"Turn scattered team documents into a searchable workspace where every answer traces directly back to verified sources."* ($\le$ 20 words, precise value proposition).
* **Primary CTAs:**
  * Primary: `Get started` / `Open dashboard` (`bg-[#4F46E5] hover:bg-[#4338CA] text-white`).
  * Secondary: `See how it works` (Smooth scrolls to `#how-it-works`).
* **Proof Line:** `PDF, DOCX, and TXT files · Grounded in your workspace` (Emerald check icon, exactly one dot separator, zero fluff).

#### Hero Right Column — The Convergence Stage (`convergence-stage.tsx`)
* **Purpose:** The signature visual component of the landing page. It visually demonstrates the entire Satori custom RAG pipeline in real time.
* **Pipeline Phases (0 to 5):**
  1. `Phase 0 (Scatter)`: Raw documents appear scattered in the workspace.
  2. `Phase 1 (Chunking)`: Documents break apart into semantically bounded text chunks.
  3. `Phase 2 (Indexing)`: Chunks receive vector embeddings and flow into the pgvector database.
  4. `Phase 3 (Question)`: A natural-language question enters the prompt boundary.
  5. `Phase 4 (Answering)`: Live token-by-token streaming response (22–32ms intervals).
  6. `Phase 5 (Resolved)`: Interactive citation badges pop in (`[1]`, `[2]`), allowing the user to click and inspect source excerpts.
* **Scenarios (`convergence-scenarios.ts`):** Includes 3 realistic domain datasets:
  * `bylaws`: Board quorum and notice requirements from `Organization_Bylaws_2025.pdf`.
  * `expenses`: Travel approval tiers and deadlines from `Travel_and_Expense_Policy.docx`.
  * `security`: Multi-tenant workspace data isolation from `Security_Architecture_Whitepaper.pdf`.
* **Controls:** Replay sequence button (`RotateCcw`), scenario tab switcher, citation highlight drawer.
* **Accessibility:** Automatically honors `useReducedMotion()` by skipping directly to Phase 5 without animation delays.

---

### 3.4 How It Works (`src/components/landing/how-it-works.tsx`)
* **ID:** `#how-it-works`.
* **Layout:** Centered stacked header with a 3-step horizontal card grid connected by a subtle gradient bar.
* **Step Breakdown:**
  1. **Add your documents:** Upload PDF, DOCX, TXT files directly to isolated workspaces. Footnote: `Automatic validation & sanitization`.
  2. **Index and vectorize:** Text extraction, semantic chunking, and embedding indexing. Footnote: `768-dim embeddings + full-text vectors`.
  3. **Ask and discover:** Natural-language discovery with verified citations. Footnote: `Reciprocal Rank Fusion hybrid retrieval`.

---

### 3.5 Core Capabilities Bento Grid (`src/components/landing/capability-bento.tsx`)
* **ID:** `#capabilities`.
* **Layout:** Asymmetric 4-cell Bento grid (7+5 / 5+7 column layout):
  * **Cell 1 (col-span-7) — Universal Knowledge Search:** Explains hybrid search combining pgvector semantic search and PostgreSQL full-text search with Reciprocal Rank Fusion (RRF). Contains an interactive search mock with match percentages.
  * **Cell 2 (col-span-5) — Grounded AI Answers:** Explains context-bound generation. Styled with the **Strict AI Violet** border (`#7C3AED`) and lavender wash (`#F5F3FF`).
  * **Cell 3 (col-span-5) — Exact Source Citations:** Details interactive source pills linking to document, page, and chunk excerpts (`[1] Bylaws.pdf · p.6`).
  * **Cell 4 (col-span-7) — Understand and Compare:** Details cross-document synthesis, policy version comparison, and markdown/print-ready report export.

---

### 3.6 Source Inspector (`src/components/landing/source-inspector.tsx`)
* **ID:** `#traceability`.
* **Eyebrow 2 of 3:** `SOURCE TRACEABILITY`.
* **Headline:** *"Answers you can trace back to the source"*.
* **Layout:** Dual-pane interactive inspection container:
  * **Left Pane:** A realistic question about emergency board quorum and notice periods, followed by a Satori AI answer containing interactive citation buttons `[1]` and `[2]`.
  * **Right Pane:** The full document viewer displaying `Organization_Bylaws_2025.pdf` (Article V, Page 6).
  * **Interactivity:** Clicking citation button `[1]` or `[2]` dynamically shifts focus and amber/violet text highlights onto the corresponding legal paragraph in the right pane.

---

### 3.7 Workspace Showcase (`src/components/landing/workspace-showcase.tsx`)
* **Purpose:** Proves that Satori is a real, high-utility product rather than a vaporware concept.
* **Visual:** Full-bleed desktop mockup of the actual authenticated application:
  * **Window Chrome:** Mac-style traffic light dots, workspace indicator (`Community Foundation`), and a direct launch link.
  * **Simulated Sidebar:** Navigation items (*Dashboard*, *Documents (18)*, *AI Chat & Research*, *Knowledge Hub*, *Reports*), plus a vectorized chunk metric (`1,420 chunks vectorized`).
  * **Simulated Chat Canvas:** Realistic conversation with source badges, chunk inspection chips, and clean neutral/violet split.

---

### 3.8 Use Cases (`src/components/landing/use-cases.tsx`)
* **Layout:** Interactive tabbed interface covering 4 key personas:
  1. **Community Organizations:** Bylaws, committee charters, voting procedures, trustee minutes.
  2. **Researchers:** Clinical trial protocols, IRB submissions, statistical analysis plans.
  3. **Technical Teams:** Architecture RFCs, security remediation runbooks, API gateway configs.
  4. **Small Businesses:** Standard operating procedures, master service agreements, vendor payment terms.
* **Interactivity:** Switching tabs instantly updates the document list, sample query, cited answer, and exact document citation.

---

### 3.9 Architecture Section (`src/components/landing/architecture-section.tsx`)
* **ID:** `#architecture`.
* **Eyebrow 3 of 3:** `TECHNICAL CREDIBILITY`.
* **Headline:** *"A custom retrieval pipeline, not an opaque wrapper"*.
* **Tech Stack Pills:** Marquee pill row: `Next.js 16 App Router`, `TypeScript`, `PostgreSQL`, `pgvector`, `Gemini Embeddings`, `Drizzle ORM`, `Tailwind CSS v4`, `Vercel Blob Storage`.
* **Progressive Disclosure (`<details><summary>`):**
  * Clicking *"Under the hood: Architecture deep dive"* reveals a 3-part technical breakdown:
    * **pgvector Storage:** 768-dimensional embeddings stored directly in PostgreSQL with cosine distance indexing.
    * **Reciprocal Rank Fusion:** Formula displayed (`Score = 1/(60+rank_vector) + 1/(60+rank_fts)`).
    * **Tenant Partitioning:** Strict multi-tenant `workspaceId` enforcement on every query.

---

### 3.10 Final CTA & Footer (`final-cta.tsx` & `landing-footer.tsx`)
* **Final CTA:**
  * Headline: *"Bring your documents together."*
  * Subtext: *"Start turning scattered organizational files into searchable, source-grounded intelligence today."*
  * Responsive button group providing login or direct dashboard routing.
* **Footer:**
  * Wordmark with product description.
  * Anchor navigation links (`How it works`, `Capabilities`, `Traceability`, `Architecture`, `Sign in`).
  * Copyright notice and tech stack tag line: `Next.js 16 · PostgreSQL · pgvector · Gemini`.

---

## 4. Design System & Anti-Slop Rules for the Landing Page

Any agent modifying or extending the landing page must adhere to these rules:

### 4.1 Strict Eyebrow Rule
* The landing page permits **exactly three (3) eyebrow badges** across the entire page:
  1. Hero: `GROUNDED KNOWLEDGE WORKSPACE`
  2. Traceability: `SOURCE TRACEABILITY`
  3. Architecture: `TECHNICAL CREDIBILITY`
* **Rule:** Do NOT add new eyebrows to intermediate cards or sections.

### 4.2 The Violet Semantic Boundary
* **Indigo (`#4F46E5`):** Used for primary buttons, active navigation, focus states, and user actions.
* **Violet (`#7C3AED` / `#8B5CF6`):** **STRICTLY RESERVED FOR AI.** Only appears on:
  * Satori AI message boxes
  * Citation highlight chips and pills
  * Streaming token indicators
  * The Grounded AI Answers bento cell
* **Rule:** Never style a general marketing button or general navigation element in Violet.

### 4.3 Typography Hierarchy
* **Headings:** `font-heading` (`Space Grotesk`) with `tracking-tight`.
* **Body Text:** `font-body` (`DM Sans`) with `leading-relaxed`.
* **Badges, Citations, Hashes:** `font-mono` (`Geist Mono`) with uppercase tracking where applicable.

### 4.4 Motion & Scroll Guidelines (`src/components/landing/landing.css`)
* Uses progressive enhancement CSS `@supports ((animation-timeline: view()) and (animation-range: entry))` for scroll reveals.
* Never add continuous looping pulse animations or neon glow halos.
* Always wrap custom animation triggers with `useReducedMotion()`.

---

## 5. State & Performance Rules

1. **Zero External API Calls at Page Load:** The public landing page performs no expensive database queries or LLM calls on load. All interactive scenarios (`convergence-scenarios.ts`, `use-cases.tsx`, `source-inspector.tsx`) run in-memory on the client for near-instant Time to First Byte (TTFB).
2. **Dynamic Auth Hydration:** Only one lightweight server call (`getCurrentUser()`) occurs in `src/app/page.tsx` to resolve whether to show *"Sign in"* vs *"Open dashboard"*.
3. **No Layout Shift:** Fonts are loaded via `next/font/google` in `layout.tsx` with `display: swap` and zero Cumulative Layout Shift (CLS).
