# Satori — Brand Identity & UI/UX Implementation Plan

> **Status:** ✅ Core brand/UI decisions locked; landing-page and UX simplification plan added  
> **Target:** Satori Knowledge Platform  
> **Tech Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui + next-themes  
> **Design Thesis:** B2B/prosumer AI knowledge workspace for teams, researchers, and organizations. Calm-intelligence aesthetic. Document-first workspace, not a generic chatbot skin.

---

## 1. Locked Decisions (Alignment Summary)

| # | Design Dimension | Locked Decision | Rationale |
|---|------------------|-----------------|-----------|
| 1 | **Display / Headings Font** | **Space Grotesk** (`400`, `500`, `600`, `700`) | Distinctive tech-forward geometry with human warmth; differentiates from generic Inter/Roboto enterprise apps. |
| 2 | **Body & UI Font** | **DM Sans** (`400`, `500`, `700`) | Highly legible, clean geometric sans-serif tailored for long-form reading and dense data displays. |
| 3 | **Monospace / Data Font** | **Geist Mono** (`400`, `500`) | Precision mono from Vercel for code blocks, file hashes, timestamps, chunk IDs, and citation references. |
| 4 | **Default Color Scheme** | **System (`prefers-color-scheme`)** | Respects OS settings with zero flash via `next-themes` (`enableSystem`, `attribute="class"`). |
| 5 | **Border Radius Scale** | **Soft Scale** (6px buttons, 8px inputs, 10px cards, 12px modals) | Balanced modernity — structured for documents without feeling harsh or toy-like. |
| 6 | **Violet Semantic Role** | **Strictly AI-Originated Content Only** | Never used as generic accent or brand fill; immediate visual cue that an item was generated or retrieved by AI. |
| 7 | **Motion / Animation Dial** | **Dial 4 Global / Dial 5 Chat & Streaming** | Fast, subtle functional micro-transitions globally; responsive, lively streaming and citation reveals in AI views. |
| 8 | **Density Strategy** | **Per-Page Density Modes** | Dashboard = High (7), Documents = Medium (6), Chat/Analysis = Low/Comfortable (4). |
| 9 | **Eyebrows & Status Labels** | **DM Sans 500 Uppercase with `tracking-widest`** | Crisp structural categorization across cards and tables without shouting. |

---

## 2. Color Palette & Token System

### 2.1 Core Brand Anchors

```
Primary Indigo:    #4F46E5   → User actions, primary buttons, active navigation, focus rings
Primary Dark:      #3730A3   → Primary hover state, dark-mode active states
Secondary Violet:  #7C3AED   → AI-generated content ONLY (strict semantic boundary)
Accent Lavender:   #A78BFA   → AI background tints, subtle AI highlights, badge borders
```

### 2.2 Light Mode Palette (Calibrated for Knowledge Work)

Replaces generic grays with tailored violet/indigo undertones to create a cohesive workspace atmosphere.

| CSS Variable | Hex / Value | Semantic Role |
|--------------|-------------|---------------|
| `--background` | `#F8F8FC` | Main workspace background (delicate cool violet tint; reduces eye strain) |
| `--foreground` | `#171717` | High-contrast body text for maximum reading comfort |
| `--card` | `#FFFFFF` | Document cards, panels, and sheet surfaces |
| `--card-foreground` | `#171717` | Card text and headers |
| `--popover` | `#FFFFFF` | Dropdowns, tooltips, and floating menus |
| `--popover-foreground` | `#171717` | Popover text |
| `--muted` | `#F0EFF8` | Secondary surfaces, inactive tabs, table headers |
| `--muted-foreground` | `#64748B` | Slate-600; metadata, timestamps, helper text |
| `--border` | `#E4E3F0` | Subtle tinted borders separating panels and cards |
| `--input` | `#E4E3F0` | Input and form control borders |
| `--ring` | `#4F46E5` | Focus ring = Primary Indigo |
| `--primary` | `#4F46E5` | Interactive buttons, primary links |
| `--primary-foreground`| `#FFFFFF` | Primary button text |
| `--primary-dark` | `#3730A3` | Primary hover state |
| `--secondary` | `#7C3AED` | AI actions, AI state indicators, citations |
| `--secondary-foreground`| `#FFFFFF` | AI button text |
| `--accent` | `#F5F3FF` | Lavender wash background for AI responses |
| `--accent-foreground` | `#6D28D9` | AI response highlight text |
| `--lavender` | `#A78BFA` | AI border tints and subtle badges |

### 2.3 Dark Mode Palette (Calibrated for Low-Light Focus)

Uses deep violet-slate tones instead of sterile pure black or washed-out zinc.

| CSS Variable | Hex / Value | Semantic Role |
|--------------|-------------|---------------|
| `--background` | `#0B0B12` | Deep violet-black foundation |
| `--foreground` | `#F5F5F5` | Crisp white-slate text |
| `--card` | `#13121E` | Elevated surface with subtle violet warmth |
| `--card-foreground` | `#F5F5F5` | Card text |
| `--popover` | `#13121E` | Dropdowns and modals |
| `--popover-foreground` | `#F5F5F5` | Popover text |
| `--muted` | `#181824` | Inactive tracks, secondary controls |
| `--muted-foreground` | `#A1A1AA` | Zinc-400 for secondary metadata |
| `--border` | `#2A2840` | Cohesive violet-tinted border |
| `--input` | `#2A2840` | Input borders |
| `--ring` | `#6D69F5` | Indigo focus ring tuned for dark contrast |
| `--primary` | `#6D69F5` | Vibrant indigo for dark surfaces |
| `--primary-foreground`| `#FFFFFF` | Primary button text |
| `--primary-dark` | `#4F46E5` | Active/hover state |
| `--secondary` | `#8B5CF6` | Lighter violet for dark mode legibility |
| `--secondary-foreground`| `#FFFFFF` | AI button text |
| `--accent` | `#1E1B4B` | Deep indigo-violet surface for AI cards |
| `--accent-foreground` | `#C4B5FD` | Lavender text for AI callouts |
| `--lavender` | `#A78BFA` | AI badge and border highlights |

### 2.4 Functional Semantic Feedback

```css
--success: #059669; /* Emerald 600 - Validated, Indexed, Synced */
--warning: #D97706; /* Amber 600   - Processing, Re-indexing, Caution */
--error:   #DC2626; /* Red 600     - Ingestion Failed, Auth Error */
--info:    #2563EB; /* Blue 600    - System notices */
```

---

## 3. Typography Hierarchy

### 3.1 Type Spec Scale

| Role | Font Family | Weight | Size | Line Height | Letter Spacing |
|------|-------------|--------|------|-------------|----------------|
| **Display / Page Title (H1)** | Space Grotesk | 700 | 32–40px (`text-3xl`/`text-4xl`) | 1.1 | `-0.025em` (`tracking-tight`) |
| **Section Header (H2)** | Space Grotesk | 600 | 22–26px (`text-2xl`) | 1.2 | `-0.02em` |
| **Card / Panel Header (H3)** | Space Grotesk | 600 | 17–19px (`text-lg`) | 1.3 | `-0.01em` |
| **Subhead / Lead** | DM Sans | 400/500 | 15–16px (`text-base`) | 1.5 | `normal` |
| **Body (Default)** | DM Sans | 400 | 14–15px (`text-[15px]` / `text-sm`) | 1.6 | `normal` |
| **Body Medium / Strong** | DM Sans | 500 | 14–15px | 1.6 | `normal` |
| **UI Labels & Actions** | DM Sans | 500 | 13–14px (`text-sm`) | 1.4 | `normal` |
| **Eyebrow / Status Badges** | DM Sans | 500 | 10–11px (`text-[11px]`) | 1.0 | `0.08–0.12em` (`uppercase tracking-widest`) |
| **Code / Chunk / Citations** | Geist Mono | 400/500 | 12–13px (`text-xs`) | 1.5 | `normal` |

### 3.2 Font Loading Implementation (`src/app/layout.tsx`)

Loaded with zero Layout Shift (`font-display: swap`) using `next/font/google`:

```tsx
import { Space_Grotesk, DM_Sans, Geist_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Applied to <html>:
// <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
```

### 3.3 Tailwind v4 Theme Integration (`src/app/globals.css`)

```css
@theme {
  --font-heading: var(--font-heading), system-ui, sans-serif;
  --font-body: var(--font-body), system-ui, sans-serif;
  --font-mono: var(--font-mono), monospace;
  --font-sans: var(--font-body), system-ui, sans-serif;
}
```

---

## 4. Geometry & Border Radius Contract

Strict geometric continuity prevents jarring visual disparities (e.g. sharp cards with pill buttons).

| Component Category | Radius Value | Tailwind Class | Usage Guidelines |
|--------------------|--------------|----------------|------------------|
| **Buttons & Badges** | `6px` | `rounded-md` | Primary, secondary, ghost buttons; tag chips |
| **Form Controls** | `8px` | `rounded-[8px]` | Text inputs, dropdown triggers, search bars |
| **Cards & Panels** | `10px` | `rounded-[10px]` | Document cards, stat widgets, RAG response boxes |
| **Navigation Elements** | `8px` | `rounded-[8px]` | Sidebar items, tab items, dropdown menu rows |
| **Modals & Dialogs** | `12px` | `rounded-xl` | Dialog windows, upload modals, sheet overlays |
| **Floating Popovers** | `6px` | `rounded-md` | Context tooltips, citation popups |
| **Avatars** | `50%` | `rounded-full` | User and workspace avatars |

---

## 5. Spacing & Density Architecture

### 5.1 Base Spacing Scale

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 5.2 Contextual Density Modes

Density is declared at the view container level via `data-density`:

```css
/* High Density (Dashboard & Analytics) */
[data-density="high"] {
  --row-gap: var(--space-2);       /* 8px */
  --section-pad: var(--space-4);   /* 16px */
  --card-pad: var(--space-3);      /* 12px */
  --item-height: 36px;
}

/* Medium Density (Document Workspace & Knowledge Base) */
[data-density="medium"] {
  --row-gap: var(--space-3);       /* 12px */
  --section-pad: var(--space-6);   /* 24px */
  --card-pad: var(--space-4);      /* 16px */
  --item-height: 44px;
}

/* Low / Relaxed Density (Chat, Q&A, Long-Form Reading) */
[data-density="low"] {
  --row-gap: var(--space-4);       /* 16px */
  --section-pad: var(--space-8);   /* 32px */
  --card-pad: var(--space-6);      /* 24px */
  --item-height: 52px;
}
```

---

## 6. Motion & Interaction Design

### 6.1 Motion Parameters

* **Global Dial 4 (Subtle & Functional):** Applied to core navigation, modals, and hover states.
* **Chat Dial 5 (Responsive & Dynamic):** Applied specifically to token streaming, citation badges, and status reveals.

| Interaction | Duration | Curve / Easing | Description |
|-------------|----------|----------------|-------------|
| **Button / Hover State** | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Color and background fill transitions |
| **Modal / Dialog Entrance** | 180ms | `cubic-bezier(0, 0, 0.2, 1)` | Fade in + subtle scale `0.98 -> 1.0` |
| **Sidebar Collapse/Expand** | 220ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Width transition |
| **Card List Stagger** | 300ms total | `cubic-bezier(0.16, 1, 0.3, 1)` | 30ms stagger per item on initial route render |
| **Token Streaming** | 25–35ms/token | Linear | Smooth continuous render without jarring reflow |
| **Citation Chip Reveal** | 200ms | Spring `stiffness: 350, damping: 25` | Pop-in upon chunk attribution |
| **Skeleton Pulse** | 1400ms cycle | `ease-in-out` | Low-contrast shimmer during document indexing |

### 6.2 Prohibited Animation Patterns (Anti-Slop Rules)
- ❌ No continuous looping animations on static content cards.
- ❌ No neon glow halos or pulsing borders.
- ❌ No blocking route transitions exceeding 250ms.
- ❌ Must honor `@media (prefers-reduced-motion: reduce)` globally.

---

## 7. AI Visual Identity & Semantic Rules

The color Violet (`#7C3AED` / `#8B5CF6`) is **strictly reserved for AI origins**. It must never appear on user-authored components or general navigation.

```
┌─────────────────────────────────────────────────────────────┐
│ USER AREA (Indigo Anchor)                                  │
│ - Prompt box active border: #4F46E5                         │
│ - User message bubble: Neutral dark/light surface           │
│ - Action buttons: Indigo                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ AI RESPONSE AREA (Violet Semantic Lock)                    │
│ - Header: "✦ Satori AI" in Violet (#7C3AED)                │
│ - Background Tint: Lavender wash (8–10% opacity)            │
│ - Left border accent: 2px solid #7C3AED                     │
│ - Streaming Indicator: 3-dot violet pulse                   │
│ - Citation Chips: Geist Mono, Violet hover, Source preview  │
│ - Processing Tag: [RETRIEVING FROM KNOWLEDGE BASE]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Roadmap

### Phase 1: Foundational Design Tokens & Typography (Zero Visual Regressions)
1. **Calibrate `src/app/globals.css`**:
   - Update `--background`, `--card`, `--muted`, `--border`, and `--muted-foreground` for Light & Dark modes.
   - Inject `@theme` font variables (`--font-heading`, `--font-body`, `--font-mono`).
   - Define spacing scale and `[data-density]` definitions.
2. **Configure `src/app/layout.tsx`**:
   - Import `Space_Grotesk`, `DM_Sans`, and `Geist_Mono` via `next/font/google`.
   - Apply CSS font variables to `<html>` and default body font family to `<body>`.

### Phase 2: Shell & Navigation Polish
1. **Sidebar Navigation**:
   - Standardize icon sizes (18px) and row radius (`rounded-[8px]`).
   - Apply Indigo `#4F46E5` for active routes; muted slate for idle.
2. **Top Navigation & Workspace Switcher**:
   - Implement DM Sans typography and cohesive border tokens.
   - Theme toggle verification (Light, Dark, System).

### Phase 3: Domain Components (Documents, Chat & Dashboard)
1. **Document Management (`/documents`)**:
   - Apply medium density (`data-density="medium"`).
   - Filenames and hashes in `Geist Mono`.
   - Status badges: DM Sans 500 uppercase `tracking-widest` (e.g. `INDEXED`, `PROCESSING`, `ERROR`).
2. **AI Chat & Intelligence (`/chat`)**:
   - Apply relaxed density (`data-density="low"`).
   - Semantic split: User messages (Indigo/Neutral) vs AI messages (Lavender tint + Violet markers).
   - Interactive citation chips displaying chunk excerpts on hover/click.
3. **Dashboard (`/dashboard`)**:
   - Apply high density (`data-density="high"`).
   - Stat cards with 10px radius and subtle tinted borders.

---

## 9. Verification & Acceptance Checklist

### 9.1 Contrast Ratio Verification (WCAG 2.1 AA)

| Test Pair | Light Mode | Dark Mode | Minimum | Status |
|-----------|------------|-----------|---------|--------|
| Body Text on Background | `#171717` on `#F8F8FC` (**18.9:1**) | `#F5F5F5` on `#0B0B12` (**17.8:1**) | 4.5:1 | ✅ Pass |
| Secondary Text on Background | `#64748B` on `#F8F8FC` (**4.9:1**) | `#A1A1AA` on `#0B0B12` (**8.2:1**) | 4.5:1 | ✅ Pass |
| Primary Indigo Button | `#FFFFFF` on `#4F46E5` (**4.6:1**) | `#FFFFFF` on `#6D69F5` (**4.8:1**) | 4.5:1 | ✅ Pass |
| AI Violet Badge Text | `#7C3AED` on `#F5F3FF` (**6.8:1**) | `#C4B5FD` on `#1E1B4B` (**6.9:1**) | 4.5:1 | ✅ Pass |

### 9.2 Build & Code Quality Validation

```bash
# Verify TypeScript definitions and Next.js font compilation
npm run build

# Verify linting
npm run lint
```

### 9.3 Visual Inspection Walkthrough
- [ ] `/dashboard`: High density view, responsive cards, no font jitter on load.
- [ ] `/documents`: Medium density view, monospace document metadata, uppercase status chips.
- [ ] `/chat`: AI responses strictly distinguished with violet indicators and lavender background wash.
- [ ] Theme switching: Seamless transition between System, Dark, and Light without FOUC (flash of unstyled content).

---

## 10. Landing Page Design & UX

### 10.1 Purpose

The public landing page introduces Satori before the visitor enters an authenticated workspace.

The visitor should understand within a few seconds:
1. What Satori is.
2. What problem it solves.
3. How it works.
4. Why grounded answers matter.
5. How to start.

The landing page is a marketing/product-introduction experience, **not another application dashboard**.

### 10.2 Product Positioning

**Satori**  
**AI Knowledge & Document Intelligence Platform**

Primary message:

> **Your knowledge, intelligently connected.**

Supporting message:

> Satori turns scattered documents into a searchable knowledge workspace where teams can ask questions, discover information, and get answers grounded in their own sources.

Do not position Satori as only a "chat with PDF" application.

### 10.3 Landing Page Narrative

```text
Problem
  ↓
Satori
  ↓
How it works
  ↓
Capabilities
  ↓
Grounded AI / Source Traceability
  ↓
Start using Satori
```

Each section must have one clear purpose. Do not add sections simply to fill vertical space.

### 10.4 Navbar

Desktop:

```text
Satori   Product   How it works   Use cases       Sign in   Get started
```

Rules:
- Wordmark on the left.
- Three lightweight navigation links.
- `Sign in` is secondary.
- `Get started` is the single prominent CTA.
- Do not use an application-style sidebar.
- Use a transparent/subtle header surface.

Mobile:
- Satori logo.
- Compact menu.
- Primary CTA when space allows.

### 10.5 Hero

Recommended content:

**Headline:**  
Your knowledge, intelligently connected.

**Body:**  
Turn scattered documents into a searchable knowledge workspace where teams can ask questions, discover information, and get answers grounded in their own sources.

**Primary CTA:** `Start with your documents`  
**Secondary CTA:** `See how it works`

Supporting capability line:

`PDF · DOCX · TXT · Source-grounded answers`

Desktop composition:

```text
┌─────────────────────────┬─────────────────────────┐
│ Headline                │ Simplified Satori UI    │
│ Short explanation       │ Documents → Question    │
│ Primary CTA             │ → Answer → Citation     │
│ Secondary CTA           │                         │
└─────────────────────────┴─────────────────────────┘
```

On mobile, stack copy, actions, then the product preview.

Do not place multiple statistics or several feature cards beside the hero.

### 10.6 Hero Product Preview

Show one simplified, believable Satori workspace containing:
- a few documents;
- one natural-language question;
- one concise AI answer;
- visible source document/page/section;
- subtle AI Violet/Lavender indicators.

The preview should explain:

```text
Documents
   ↓
Question
   ↓
AI Answer
   ↓
Source Citation
```

Avoid showing the entire application dashboard in miniature.

### 10.7 Value Transition

Headline:

> **Your information is already there. Satori helps you find it.**

Show scattered examples:

```text
Policies
By-laws
Research papers
Manuals
Meeting notes
Guidelines
        ↓
     Satori
        ↓
Knowledge workspace
```

Keep this section to one message and one supporting visual.

### 10.8 How It Works

Use three steps:

**01 — Add your documents**  
Upload supported documents to a workspace.

**02 — Build your knowledge base**  
Satori extracts content, creates useful chunks, generates embeddings, and indexes the knowledge.

**03 — Ask and discover**  
Ask natural-language questions and receive responses grounded in retrieved source material.

Visual:

```text
ADD → INDEX → ASK
```

Technical terms are secondary to user value.

### 10.9 Core Capabilities

Use four large sections instead of many small cards:

- **Search across your knowledge** — natural-language discovery across documents.
- **Grounded AI answers** — responses use retrieved workspace knowledge as context.
- **Source citations** — inspect the supporting document, page, section, or chunk.
- **Understand and compare** — summarize, compare, and analyze related documents.

### 10.10 Use Cases

Show realistic examples:

**Organizations** — by-laws, policies, procedures, guidelines.  
**Researchers** — research papers, references, study materials.  
**Teams** — technical documentation, manuals, project information.  
**Small businesses** — operating procedures and shared references.

Avoid unsupported enterprise claims.

### 10.11 Grounded AI / Trust Section

Headline:

> **Answers you can trace back to the source.**

Show:

```text
Question
   ↓
Retrieved knowledge
   ↓
Satori answer
   ↓
Source citation
```

Example:

`Organization By-Laws.pdf · Article V · Page 6`

The UI communicates traceability; it must not claim perfect AI accuracy.

### 10.12 Technical Credibility

Place technical details lower on the page:

```text
CUSTOM RAG
POSTGRESQL
PGVECTOR
GEMINI
NEXT.JS
TYPESCRIPT
```

Use one concise explanation of the custom retrieval architecture. Do not make the technical stack the primary marketing message.

### 10.13 Final CTA & Footer

CTA:

**Bring your documents together.**

Primary: `Start with Satori`  
Secondary: `Sign in`

Footer:
- Satori branding.
- Short product description.
- Product / How it works / Use cases.
- Sign in.
- GitHub when public.
- Documentation when available.
- Copyright.

Avoid a large enterprise-style footer.

---

## 11. Application UX Simplification

### 11.1 Global Rule

> **One page = one primary task.**

A user should understand what they are looking at within roughly 2–3 seconds.

Use:

```text
Page title
  ↓
Short purpose statement
  ↓
Primary action
  ↓
Main content
  ↓
Secondary information
  ↓
Optional advanced details
```

Do not make every section a card. Use typography and whitespace to establish hierarchy.

### 11.2 Dashboard

**Primary question:** “What is happening in my workspace?”

Prioritize:
- Workspace greeting/header.
- 3–4 key metrics.
- Recent documents.
- One clear `Ask Satori` entry point.
- One compact activity/health area.

Move advanced retrieval details out of the default dashboard view.

### 11.3 Documents

**Primary question:** “How do I manage my documents?”

Priority order:

```text
Title + description
      ↓
Upload
      ↓
Search / Filter
      ↓
Document list
```

Processing details should appear in the document row/status area rather than competing with the upload task.

Use Medium Density.

### 11.4 Knowledge Hub

**Primary question:** “What does Satori know, and what can I retrieve?”

The primary element is the search interface.

Recommended flow:

```text
Search
  ↓
Results
  ↓
Chunk preview
  ↓
Optional retrieval details
```

Move technical information such as vector score, FTS score, RRF score, index health, and parameters behind a secondary/collapsible `Retrieval details` control.

This keeps the page useful for normal users while preserving a technical inspection mode.

### 11.5 AI Chat

**Primary question:** “Can Satori answer my question?”

The conversation should dominate the page.

Default visibility:
- User question.
- AI response.
- Source citations.

Secondary/advanced information:
- Retrieval status.
- Tool activity.
- Model information.
- Detailed retrieved chunks.

These should be compact, collapsible, or shown on demand.

The chat page uses Low/Relaxed Density.

### 11.6 Reports

**Primary question:** “What reports have been generated, and how do I create one?”

Priority:

```text
Title + description
      ↓
Generate Report
      ↓
Recent Reports
      ↓
Optional summary statistics
```

Do not make empty analytics metrics visually compete with an empty report library.

### 11.7 Settings

The settings page should be organized around categories rather than a large undifferentiated form:

```text
Workspace
Members
General
Integrations
Notifications
Security
```

Each category should expose only the controls relevant to that category.

### 11.8 RAG Playground / Phase 7

The technical playground is intentionally more advanced than normal product pages.

Use it for:
- retrieval experiments;
- query inspection;
- chunk inspection;
- RRF/FTS/vector diagnostics;
- AI pipeline testing.

Technical density is acceptable here because this is an expert/engineering view.

Its advanced nature should be communicated clearly in the page heading and description.

### 11.9 Empty States

Every empty state should explain:

1. What is empty.
2. Why it matters.
3. The next action.

Pattern:

```text
Icon
Title
One-sentence explanation
Primary action
```

Avoid generic phrases such as only `No data yet`.

### 11.10 Loading & Error States

Use the same hierarchy as normal content.

Processing:

```text
Document
  ↓
Processing
  ↓
Indexed
```

Failure:

```text
Document
  ↓
Failed
  ↓
Reason
  ↓
Retry
```

Do not use animation to communicate status when a static status label is sufficient.

### 11.11 Color Discipline

Keep the existing palette.

```text
Indigo  = application actions
Violet  = AI-originated content
Neutral = document/content structure
Green   = success
Amber   = processing/warning
Red     = errors
Blue    = informational notices
```

Do not introduce additional decorative colors merely to differentiate cards.

### 11.12 Visual Container Rule

A card should exist because it groups related information or an interaction.

Avoid:

```text
card
  card
    card
      card
```

Prefer:

```text
Page
 ├── Section
 │    ├── Heading
 │    └── Content
 └── Section
      ├── Heading
      └── Content
```

Use cards only where they improve grouping, hierarchy, or interaction.

---

## 12. Landing Page Component Structure

Recommended:

```text
src/components/landing/
├── landing-navbar.tsx
├── hero-section.tsx
├── product-preview.tsx
├── value-transition.tsx
├── how-it-works.tsx
├── capability-section.tsx
├── use-cases.tsx
├── grounded-ai-section.tsx
├── technical-stack.tsx
├── final-cta.tsx
└── landing-footer.tsx
```

Keep marketing components separate from authenticated application components.

---

## 13. Updated Implementation Roadmap Addendum

### Phase 0 — UX Alignment

Before visual refactoring:
1. Establish `data-density` per page.
2. Identify each page's primary user task.
3. Remove redundant/secondary cards from the default view.
4. Move technical diagnostics behind progressive disclosure.
5. Keep existing business logic and API contracts unchanged.

### Phase 4 — Landing Page

1. Build the public landing-page route.
2. Implement Navbar and responsive hero.
3. Add a simplified Satori product preview.
4. Add Value Transition and How It Works.
5. Add Capabilities and Use Cases.
6. Add Grounded AI / source-traceability section.
7. Add Technical Credibility section.
8. Add final CTA and footer.
9. Verify Light/Dark/System themes.
10. Verify mobile/tablet/desktop layouts.

### Phase 5 — Application UX Refinement

1. Simplify Dashboard hierarchy.
2. Make Documents upload/search/list the dominant workflow.
3. Simplify Knowledge Hub default state.
4. Make AI Chat conversation-first.
5. Make Reports library-first.
6. Organize Settings by clear categories.
7. Keep RAG Playground intentionally technical.
8. Normalize empty/loading/error states.
9. Reduce unnecessary card nesting.
10. Verify Violet is used only for AI-originated content.

### Phase 6 — Final Visual QA

Validate:
- typography;
- spacing;
- radius;
- color semantics;
- responsive layout;
- keyboard navigation;
- reduced-motion behavior;
- contrast;
- page-specific density;
- empty/loading/error states.

### Note on Unreviewed Pages

The current supplied visual references cover the Dashboard, Documents, Knowledge Hub, AI Chat, and Reports views. The Login Demo, Phase 7/RAG Playground, and Settings implementations were not supplied for visual review in this iteration.

Their existing behavior should be preserved unless a later visual review identifies changes. The UX rules above provide their intended direction without assuming details not visually reviewed.

---

## 14. Final Experience Principle

Satori should feel like:

**Calm. Clear. Intelligent. Technical.**

The user should never have to decode the interface.

The landing page answers:

```text
What is Satori?
How does it work?
What can I do with it?
Can I trace its answers?
How do I start?
```

The application answers:

```text
What am I looking at?
What can I do here?
What should I do next?
```

> **Less interface. More understanding.**
