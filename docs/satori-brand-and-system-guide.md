# Satori — Brand Identity, Design System & System Architecture Guide

> **Single Source of Truth**  
> **Product:** Satori Knowledge Platform  
> **Core Identity:** 悟り (*satori*) — Awakening, Realization, and Deep Understanding  
> **Master Tagline:** *Your knowledge, intelligently connected.*  
> **Design Philosophy:** Calm Intelligence · Document-First Workspace · Verifiable Grounded AI  

---

## 1. Brand Identity & Core Purpose

### 1.1 Name & Etymology
* **Name:** **Satori**
* **Origin:** Japanese **悟り** (*satori*), rooted in Zen Buddhist philosophy, representing sudden awakening, comprehension, and intuitive realization.
* **Product Translation:** Turning chaotic, fragmented piles of organizational documents into immediate, crystal-clear understanding.

### 1.2 Core Mission
Satori is an **AI-powered knowledge and document intelligence platform** designed for teams, researchers, organizations, and small businesses. It enables users to assemble policies, by-laws, research papers, and technical manuals into a centralized, searchable intelligence workspace where every answer is strictly verifiable and cited down to the document chunk, page, and section.

### 1.3 Brand Character & Aesthetic Thesis: *Calm Intelligence*
* **Calm, not chaotic:** A quiet, professional workspace where documents remain the hero. Zero distracting neon halos, cyberpunk gradients, or dancing mascot robots.
* **Grounded, not hallucinatory:** We prioritize provenance and citations over generic chatbot banter.
* **Authoritative, not sterile:** Warm geometric typography balanced by rich indigo and violet undertones in both Light and Dark modes.

---

## 2. Brandlines, Messaging & Copywriting Arsenal

### 2.1 Master Taglines & One-Liners
* **Master Tagline:**
  > **Your knowledge, intelligently connected.**
* **Short Elevator Pitch (1 Sentence / Subheading):**
  > Turn scattered team documents into a searchable workspace where every answer traces directly back to verified sources.
* **Medium Elevator Pitch (2 Sentences / Social & Meta Description):**
  > Satori unites your policies, research, and operating procedures into a calm, intelligent knowledge base. Ask questions in natural language and receive answers grounded strictly in your own files.
* **B2B / Team Value Proposition:**
  > Stop hunting across disparate folders, chats, and outdated wikis. Satori extracts, chunks, and indexes your institutional knowledge with custom RAG, delivering verifiable intelligence without hallucination.

### 2.2 Core Value Pillars

| Pillar | Headline | Promise & Narrative |
| :--- | :--- | :--- |
| **01. Source Traceability** | *Answers you can trace back to the source.* | Every AI response is backed by interactive citation chips linking directly to the underlying document chunk, section, and page number. |
| **02. Calm Intelligence** | *Less interface. More understanding.* | A distraction-free knowledge environment engineered for deep work, eliminating noisy AI gimmicks in favor of clean information hierarchy. |
| **03. Frictionless Ingestion** | *From raw documents to indexed knowledge in seconds.* | Seamless multi-format extraction for PDF, DOCX, and TXT files with live processing states, automated chunking, and zero manual schema overhead. |
| **04. Enterprise Isolation** | *Strict boundaries for your sensitive data.* | Multi-tenant workspace partitioning, server-only secret enforcement, and granular access control built into every query. |

### 2.3 Microcopy & UI Label Standards
* **Supported File Proof Line:**
  `PDF, DOCX, and TXT files · Grounded in your workspace`
* **Eyebrows & Section Headers:**
  `DM Sans 500`, uppercase, `tracking-widest` (e.g., `GROUNDED KNOWLEDGE WORKSPACE`, `DOCUMENT INGESTION`, `SYSTEM VERIFIED`)
* **Status Badges:**
  - `INDEXED` (Green Emerald `#059669`)
  - `PROCESSING` (Amber `#D97706`)
  - `FAILED` (Red `#DC2626`)
  - `RETRIEVED FROM KNOWLEDGE BASE` (Violet `#7C3AED`)

### 2.4 Voice & Tone Rules (Anti-Slop Guidelines)

| ✅ What Satori Sounds Like | ❌ What Satori NEVER Sounds Like |
| :--- | :--- |
| **Calm, articulate, and technical:** Speaks with quiet confidence and clarity. | **Over-hyped marketing jargon:** No *"supercharge"*, *"revolutionary"*, or *"magic"*. |
| **Transparent about provenance:** *"Retrieved 3 chunks from 2025_Bylaws.pdf (Article V, p. 6)."* | **Unqualified claims:** No *"100% infallible AI god-mode"*. |
| **Document-centric:** Focuses on the user's data and institutional memory. | **Chatbot persona slop:** No *"Hey bestie! I'm your friendly AI assistant!"*. |
| **Concise action labels:** *"Open dashboard"*, *"Add documents"*, *"Inspect source"*. | **Wordy, generic CTA text:** *"Click here to begin your incredible AI transformation journey"*. |

---

## 3. System Architecture & Technology Stack

The platform is engineered as a **modular monolith** within Next.js, prioritizing simplicity, type safety, low operational overhead, and full developer control over the RAG pipeline.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SATORI PLATFORM ARCHITECTURE                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Frontend & Client: Next.js 16 App Router · React 19 · Tailwind v4    │
│ 2. Design System: shadcn/ui · Radix UI · Lucide Icons · Motion (v14)   │
│ 3. Database Layer: PostgreSQL (Neon Serverless) · Drizzle ORM          │
│ 4. Vector Store: pgvector Extension (Cosine Similarity Indexing)       │
│ 5. AI Engine: Google Gemini 2.5 Flash (@google/genai)                  │
│ 6. Storage: Object Storage (Vercel Blob / Local Filesystem)            │
│ 7. Ingestion: unpdf (PDF) · mammoth (DOCX) · UTF-8 Streaming (TXT)     │
│ 8. Security & Auth: NextAuth.js v5 · Zod Runtime Validation            │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Stack Breakdown
* **Framework:** Next.js 16 (App Router, Server Components, Route Handlers, Server Actions).
* **Language & Runtime:** TypeScript 5 (Strict mode) on Node.js 20+.
* **Styling Engine:** Tailwind CSS v4 using CSS-first `@theme` declarations and PostCSS.
* **Component Primitives:** Radix UI primitives composed via `cva` (Class Variance Authority) and `clsx`/`tailwind-merge`.
* **Icons & Animation:** `lucide-react` (standard 18px stroke) and `motion` (v14.0.0).
* **Database & ORM:** PostgreSQL managed on Neon Serverless, queried via Drizzle ORM (`drizzle-orm` + `drizzle-kit`).
* **Vector Persistence:** `pgvector` storing chunk embeddings directly within PostgreSQL tables.
* **LLM & Embeddings:** Google Gemini 2.5 Flash via `@google/genai` (structured outputs, streaming text, and semantic vector embeddings).
* **Authentication:** NextAuth.js v5 (`@auth/drizzle-adapter`) with session-based workspace scoping.
* **Data Validation:** Zod (`zod`) across all external API boundaries, file metadata, and AI structured tool payloads.

### 3.2 The Custom RAG Pipeline
Satori purposefully avoids black-box wrappers (e.g., LangChain) in favor of an explicit, auditable retrieval pipeline:
1. **Ingest & Extract:** Uploaded documents are parsed via specialized extractors (`unpdf` for PDF, `mammoth` for DOCX, raw text normalizer for TXT).
2. **Chunk & Clean:** Text is stripped of artifacts, normalized, and split into overlapping semantic chunks with document/section/page metadata preserved.
3. **Embed:** Chunks are vectorized using Google Gemini's embedding model and stored alongside metadata in PostgreSQL via `pgvector`.
4. **Hybrid Retrieval:** Queries execute a hybrid lookup combining **pgvector Cosine Similarity** and **PostgreSQL Full-Text Search (FTS)**, merged via **Reciprocal Rank Fusion (RRF)**.
5. **Grounded Synthesis:** Top-ranked chunks are formatted into an explicit context boundary and supplied to Gemini 2.5 Flash to generate a cited response.

---

## 4. Color Palette & Semantic Token Architecture

The Satori color system balances calm neutral document surfaces with purposeful semantic accents.

### 4.1 Core Brand Anchors

```
Primary Indigo:    #4F46E5   → User actions, primary buttons, active navigation, focus rings
Primary Dark:      #3730A3   → Hover and active button states
Secondary Violet:  #7C3AED   → AI-generated content ONLY (Strict Semantic Lock)
Accent Lavender:   #A78BFA   → AI card washes, subtle citation borders, intelligence chips
```

### 4.2 The Strict Violet Semantic Rule
> **RULE:** The color **Violet (`#7C3AED` / `#8B5CF6`) is strictly reserved for AI origins.**
* **ALLOWED:** "✦ Satori AI" badge, AI response border, streaming token indicator, citation highlight chips, retrieved chunk tags.
* **FORBIDDEN:** User buttons, standard navigation links, page titles, non-AI cards, marketing banners.

### 4.3 Color Tokens & CSS Variables

#### Light Mode (`:root`) — Calibrated for Document Reading
| Token | Hex Value | Purpose / Role |
| :--- | :--- | :--- |
| `--background` | `#EEF2F6` | Calm cool slate-violet canvas; prevents harsh white eye fatigue |
| `--foreground` | `#171717` | Neutral high-contrast text (18.9:1 contrast ratio) |
| `--card` | `#FFFFFF` | Document cards, panels, reader sheets |
| `--card-foreground` | `#171717` | Card text and headings |
| `--popover` | `#FFFFFF` | Dropdowns, dialogs, floating context menus |
| `--muted` | `#F1F5F9` | Secondary surfaces, inactive tabs, table header rows |
| `--muted-foreground` | `#64748B` | Slate-600; metadata, timestamps, chunk IDs |
| `--border` / `--input`| `#E2E8F0` | Structural panel dividers and form borders |
| `--ring` | `#4F46E5` | Focus ring (Primary Indigo) |
| `--primary` | `#4F46E5` | Interactive buttons, primary links |
| `--primary-foreground`| `#FFFFFF` | Text on primary buttons |
| `--primary-dark` | `#3730A3` | Hover / active states |
| `--secondary` | `#7C3AED` | AI badges, AI action pills, citation chips |
| `--accent` | `#F5F3FF` | Lavender background wash for AI answer blocks |
| `--accent-foreground` | `#6D28D9` | AI response highlight text |
| `--lavender` | `#A78BFA` | Subtle AI chip borders and highlights |

#### Dark Mode (`.dark`) — Calibrated for Low-Light Focus
| Token | Hex Value | Purpose / Role |
| :--- | :--- | :--- |
| `--background` | `#0B0B12` | Deep violet-black foundation (NOT pure #000000) |
| `--foreground` | `#F5F5F5` | Crisp white-slate text (17.8:1 contrast ratio) |
| `--card` | `#13121E` | Elevated surface with subtle violet warmth |
| `--card-foreground` | `#F5F5F5` | Card text |
| `--popover` | `#13121E` | Dropdowns and dialogs |
| `--muted` | `#181824` | Inactive tabs, secondary controls |
| `--muted-foreground` | `#A1A1AA` | Zinc-400 for secondary metadata |
| `--border` / `--input`| `#2A2840` | Subtle violet-tinted borders |
| `--ring` | `#6D69F5` | Indigo focus ring tuned for dark surfaces |
| `--primary` | `#6D69F5` | Vibrant indigo for dark contrast |
| `--primary-foreground`| `#FFFFFF` | Text on primary buttons |
| `--primary-dark` | `#4F46E5` | Active / hover state |
| `--secondary` | `#8B5CF6` | Lighter violet tuned for dark-mode readability |
| `--accent` | `#1E1B4B` | Deep indigo-violet surface for AI response cards |
| `--accent-foreground` | `#C4B5FD` | Lavender text for AI citations |
| `--lavender` | `#A78BFA` | AI border tints and badge highlights |

#### Functional Feedback Tokens
* `--success`: `#059669` (Emerald 600 — File Indexed, Synced, Query Validated)
* `--warning`: `#D97706` (Amber 600 — Ingestion In Progress, Re-indexing, Caution)
* `--error`: `#DC2626` (Red 600 — Parsing Failed, Network Error, Unauthorized)
* `--info`: `#2563EB` (Blue 600 — System notices, storage quotas)

---

## 5. Typography System

Satori pairs a distinctive geometric display face with an ultra-legible body font and a precision monospace typeface.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Headings / Display:   Space Grotesk  (Distinctive, tech-forward geometry)│
│ Body & UI Interface:  DM Sans        (Clean, neutral, highly legible)   │
│ Code & Citations:     Geist Mono     (Precision data, hashes, chunks)   │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Type Scale Specification

| Role | Font Family | Weight | Size | Line Height | Letter Spacing | CSS Utility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Page Title (H1)** | Space Grotesk | `700` | 32–44px | `1.12` | `-0.025em` | `font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight` |
| **Section Header (H2)** | Space Grotesk | `600` | 22–26px | `1.2` | `-0.02em` | `font-heading text-2xl font-semibold tracking-tight` |
| **Card / Panel Header (H3)** | Space Grotesk | `600` | 17–19px | `1.3` | `-0.01em` | `font-heading text-lg font-semibold` |
| **Subhead / Lead Text** | DM Sans | `400` / `500`| 15–16px | `1.5` | `normal` | `text-base text-muted-foreground leading-relaxed` |
| **Body (Default)** | DM Sans | `400` | 14–15px | `1.6` | `normal` | `text-sm sm:text-[15px] leading-relaxed` |
| **UI Labels & Actions** | DM Sans | `500` | 13–14px | `1.4` | `normal` | `text-sm font-medium` |
| **Eyebrows & Badges** | DM Sans | `500` / `600`| 10–11px | `1.0` | `+0.10em` | `font-mono text-[11px] uppercase tracking-wider font-semibold` |
| **Code / Citations / Hash** | Geist Mono | `400` / `500`| 12–13px | `1.5` | `normal` | `font-mono text-xs` |

### 5.2 Next.js Font Configuration (`src/app/layout.tsx`)
```tsx
import { Space_Grotesk, DM_Sans, Geist_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
```

---

## 6. Geometry, Spacing & Density Contract

### 6.1 Soft Border Radius Scale
To maintain geometric harmony across the product without feeling childish or clinical:

| Component Category | Radius | Tailwind Class | Applied Elements |
| :--- | :--- | :--- | :--- |
| **Buttons & Badges** | `6px` | `rounded-md` | Primary buttons, icon toggles, tag chips |
| **Form Controls** | `8px` | `rounded-[8px]` | Text inputs, search bars, dropdown triggers |
| **Cards & Panels** | `10px` | `rounded-[10px]` | Document list items, stat cards, AI response containers |
| **Navigation Elements**| `8px` | `rounded-[8px]` | Sidebar items, workspace switcher rows, tabs |
| **Modals & Dialogs** | `12px` | `rounded-xl` | Upload modal, delete confirmation, settings sheets |
| **Floating Popovers** | `6px` | `rounded-md` | Context tooltips, citation popover previews |
| **Avatars** | `50%` | `rounded-full` | User avatars, status indicator dots |

### 6.2 Per-Page Density Modes (`data-density`)
Density adapts per route to match the user's cognitive load:

```css
/* High Density: Dashboard & Analytics */
[data-density="high"] {
  --row-gap: 8px;
  --section-pad: 16px;
  --card-pad: 12px;
  --item-height: 36px;
}

/* Medium Density: Document Management & Knowledge Hub */
[data-density="medium"] {
  --row-gap: 12px;
  --section-pad: 24px;
  --card-pad: 16px;
  --item-height: 44px;
}

/* Low / Relaxed Density: AI Chat & Long-Form Reading */
[data-density="low"] {
  --row-gap: 16px;
  --section-pad: 32px;
  --card-pad: 24px;
  --item-height: 52px;
}
```

---

## 7. Motion & Interaction Design

* **Global Dial 4 (Functional & Subtle):** Micro-interactions (hover, focus, dropdown open) run at **150–220ms** with standard cubic bezier curves (`cubic-bezier(0.4, 0, 0.2, 1)`).
* **AI Dial 5 (Responsive & Dynamic):** AI streaming tokens render smoothly at 25–35ms intervals; citation chips pop in with a crisp spring animation (`stiffness: 350, damping: 25`).
* **Reduced Motion:** All transitions must honor `@media (prefers-reduced-motion: reduce)`.
* **Anti-Slop Motion Guardrails:** No continuous infinite glow loops, no pulsing card borders, no route transitions exceeding 250ms.

---

## 8. Summary Checklist for Builders

* [ ] **Color Check:** Is Violet (`#7C3AED`) used *exclusively* for AI-originated elements and citation chips?
* [ ] **Font Check:** Are headings using `Space Grotesk`, body copy using `DM Sans`, and citation metadata using `Geist Mono`?
* [ ] **Radius Check:** Are cards using `10px` radius, form controls `8px`, and buttons `6px`?
* [ ] **Copy Check:** Does all copy reflect the *Calm Intelligence* thesis without buzzword hype?
* [ ] **Traceability Check:** Does every AI answer UI provide a verifiable source attribution chip?
