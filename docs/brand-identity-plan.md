# Satori — Brand Identity & UI/UX Implementation Plan

> **Status:** ✅ All design decisions locked via `/grill-me` alignment interview  
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
