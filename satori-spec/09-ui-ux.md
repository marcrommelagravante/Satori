# Satori — UI/UX Specification

## 1. Design Goal
Modern SaaS interface focused on clarity, trust, and document intelligence.
The UI should look professional enough for a portfolio and practical enough for real testing.

## 2. Main Routes
- /login
- /dashboard
- /documents
- /documents/[id]
- /chat
- /knowledge
- /reports
- /evaluations
- /settings

## 3. Navigation
Sidebar:
Dashboard, Documents, Knowledge, AI Chat, Reports, Evaluations, Settings.
Workspace switcher appears near the top.

## 4. Dashboard
Show:
- document count
- processed/failed counts
- recent documents
- recent conversations
- quick actions

## 5. Documents Page
Features:
- upload button/drop zone
- search/filter
- processing status
- document type
- size/date
- retry failed processing
- open document details

## 6. Document Details
Show metadata, processing state, versions, and safe preview/extracted content where supported.
Later include chunk/source inspection for debugging.

## 7. Chat Page
Layout:
- conversation list
- message area
- composer
- source/citation panel
- loading/streaming state where supported

## 8. Citation UI
Citations should be visually distinct and clickable.
Show document name plus page/section when available.
Opening a citation must identify the source chunk/document, not a fabricated location.

## 9. Empty States
Examples:
- no documents
- no conversations
- workspace not configured
- document processing failed

Each empty state should explain the next useful action.

## 10. Error States
Display friendly messages.
Keep technical details in server logs/observability, not in public UI.

## 11. Responsive Behavior
Desktop-first but usable on tablets/mobile.
Chat composer and document lists must not overflow small screens.

## 12. Accessibility
Use semantic HTML, keyboard navigation, visible focus states, labels, sufficient contrast, and accessible dialogs.

## 13. Visual Style
Prefer a clean professional knowledge-workspace look.
Avoid excessive animation, game-like styling, or decorative elements that distract from content.

## 14. Satori Visual System
### Brand
- Product name: Satori
- Meaning: Japanese 悟り (satori), associated with awakening, realization, and deep understanding
- Tagline: "Your knowledge, intelligently connected."

### Color Palette
- Primary Indigo: `#4F46E5`
- Primary Dark: `#3730A3`
- Secondary Violet: `#7C3AED`
- Accent Lavender: `#A78BFA`
- Light background: `#FAFAF9`
- Light surface: `#FFFFFF`
- Light text: `#171717`
- Light muted: `#737373`
- Light border: `#E5E5E5`
- Dark background: `#0B0B12`
- Dark surface: `#12121A`
- Dark elevated: `#181824`
- Dark text: `#F5F5F5`
- Dark muted: `#A1A1AA`
- Dark border: `#27272A`
- Success: `#059669`; Warning: `#D97706`; Error: `#DC2626`; Info: `#2563EB`

### Color Usage
- Indigo is for primary product actions, active navigation, links, focus, and controls.
- Violet is for AI-generated content, AI badges, retrieval/agent states, and intelligence indicators.
- Lavender is a restrained highlight/background color, not a dominant fill.
- Neutral colors should dominate the workspace so documents remain the visual priority.
- Support both light and dark modes; do not simply invert colors.

### Visual Direction
- Clean, modern, calm, premium knowledge-workspace aesthetic.
- Typography should be highly readable; use a contemporary sans-serif such as Inter.
- Use subtle indigo/violet gradients only for hero or special AI emphasis.
- Avoid excessive animation, neon effects, heavy glassmorphism, game-like visuals, and repeated AI robot imagery.

