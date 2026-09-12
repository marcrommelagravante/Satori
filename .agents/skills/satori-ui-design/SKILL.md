---
name: satori-ui-design
description: Implements Satori's UI/UX and visual identity using the approved Indigo/Violet palette, clean knowledge-workspace aesthetic, accessible dark/light modes, and AI-specific visual cues.
---
# Satori UI Design

## Brand
Satori means awakening, realization, and deep understanding. The UI should communicate calm intelligence rather than loud futuristic effects.

## Palette
Primary Indigo: `#4F46E5`
Primary Dark: `#3730A3`
Secondary Violet: `#7C3AED`
Accent Lavender: `#A78BFA`

Light:
- Background `#FAFAF9`
- Surface `#FFFFFF`
- Text `#171717`
- Muted `#737373`
- Border `#E5E5E5`

Dark:
- Background `#0B0B12`
- Surface `#12121A`
- Elevated `#181824`
- Text `#F5F5F5`
- Muted `#A1A1AA`
- Border `#27272A`

Semantic:
- Success `#059669`
- Warning `#D97706`
- Error `#DC2626`
- Info `#2563EB`

## Color semantics
- Indigo = primary application actions, active navigation, focus, controls.
- Violet = AI-generated content, AI badges, retrieval/agent states, intelligence indicators.
- Lavender = restrained highlights and AI backgrounds.
- Neutrals dominate documents/workspaces.

## Style
- Clean
- Calm
- Premium
- Professional
- Highly readable
- Subtle motion

Avoid:
- excessive gradients
- neon/glow effects
- heavy glassmorphism
- game-like styling
- repeated robot imagery

## Accessibility
Maintain readable contrast, visible focus states, semantic controls, keyboard navigation, meaningful labels, and reduced-motion support where appropriate.

## Components
Prefer shadcn/ui primitives and compose them consistently. Do not create near-duplicate button, dialog, card, or input variants without a real need.

## AI states
Use violet/lavender sparingly to make AI activity obvious without overwhelming the document workspace.
