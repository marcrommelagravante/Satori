# Satori Login Page — Implementation Guide

> **Purpose:** Rebuild the Satori login page to match the approved visual mockup while preserving the existing authentication flow.
>
> **Route:** `/login`
> **Project stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide icons, and the existing Google sign-in integration.
> **Design direction:** Calm, document-first, professional. Solid colors only. No gradients, neon glow, or decorative AI effects.

---

## 1. Design Goal

Create a quiet, trustworthy sign-in experience with two balanced areas:

- **Left brand panel:** Satori logo and wordmark, headline, concise value proposition, three product benefits, and a small trust statement near the bottom.
- **Right sign-in panel:** A centered white sign-in card with a clear heading, brief instruction, Google sign-in button, legal links, and a concise security note.

The page should feel like part of the Satori knowledge workspace—not a generic AI product landing page. Retain the current navy geometric S logo (Option 1) and use the same logo asset as the rest of the product.

## 2. Desktop Layout

Use a full-viewport two-column layout at desktop sizes.

### Overall page

- Minimum height: `100svh` (include a sensible `min-h-screen` fallback if needed).
- Left column: approximately `50%` width.
- Right column: approximately `50%` width.
- Add a thin vertical divider between panels: `1px solid #D7E0EA`.
- Keep both panels aligned to the same viewport height.
- Avoid gradients. Use flat background colors and subtle borders/shadows only.

### Left brand panel

Suggested layout:

1. **Brand row** aligned near the upper-left corner.
2. **Main content group** positioned vertically around the center of the left panel, not directly beneath the logo.
3. **Trust statement** close to the bottom-left with enough breathing room.

Suggested padding:

- Desktop: `clamp(32px, 5.2vw, 88px)`.
- Keep the text column at roughly `600px` maximum width so the headline does not become too wide.

### Right sign-in panel

- Center the login card both horizontally and vertically in the right panel.
- Card maximum width: `600px` in the reference image proportions; on ordinary laptop viewports, use a more practical `max-width` around `560px`.
- Suggested card width: `min(100%, 560px)` within its padded parent.
- Give the card comfortable internal padding of `clamp(28px, 3.2vw, 52px)`.
- Use a white surface, a thin cool-gray border, `12–16px` corner radius, and a restrained shadow.
- Do not make the shadow a colored glow.

## 3. Visual Reference and Copy

Use the following content as the starting point. Keep the wording concise and aligned to Satori's source-traceability positioning.

### Brand area

**Logo:** Existing Satori geometric `S` mark + `Satori` wordmark.

**Eyebrow:**

`YOUR KNOWLEDGE WORKSPACE`

**Headline:**

`Your knowledge, intelligently connected.`

Use the existing headline with a deliberate line break on larger screens if needed:

`Your knowledge,`  
`intelligently connected.`

**Supporting copy:**

`Search your documents. Get clear answers with sources you can verify.`

**Three feature points:**

1. `Source-backed answers`
2. `Private workspace`
3. `PDF, DOCX, TXT`

Use simple outline icons beside each point. Suggested Lucide icons: `file-text`, `lock-keyhole`, and `file-plus-2` (or equivalent icons already present in the project). Keep icons the same size and stroke weight.

**Bottom trust statement:**

`Knowledge you can trust. Sources you can inspect.`

Only present statements such as “Private workspace” if the current product's privacy and workspace isolation behavior supports them. Do not imply security certifications or guarantees that Satori does not have.

### Sign-in card

**Heading:**

`Welcome to Satori`

**Subheading:**

`Sign in to continue to your workspace.`

**Primary authentication action:**

`Continue with Google`

Use the existing Google OAuth provider and callback handling. This button must perform the real sign-in action; do not replace it with a decorative button or a mock flow.

**Legal line:**

`By continuing, you agree to Satori's Terms and Privacy Policy.`

Make `Terms` and `Privacy Policy` links only if valid pages/routes exist. Otherwise, wire them to the project's intended legal destinations before shipping.

**Security note:**

`Secure sign-in · Your documents stay in your workspace`

Keep this statement only if it accurately reflects Satori's actual data handling and workspace boundaries.

### Important note about the “OR” divider

The visual reference includes an `OR` divider below the Google button. Since the shown card only has Google sign-in, the divider is unnecessary unless another authentication method is actually available. **Do not render a divider that implies a second sign-in option exists when it does not.** If another real method is supported, add its functional control and retain the divider.

---

## 4. Color Palette

Use flat, solid colors. Do not add gradients to the backgrounds, card, logo, or buttons.

| Element | Color | Notes |
|---|---|---|
| Brand navy | `#0F2D4A` | Logo, headline, main text |
| Link / interactive blue | `#2563EB` | Links and restrained interactive emphasis |
| Left background | `#F8FAFC` | Warm-neutral/cool-white brand surface |
| Right background | `#EEF3F8` | Distinguishes the sign-in area without competing with the card |
| Card surface | `#FFFFFF` | Main authentication surface |
| Main text | `#0F172A` | Strong readability |
| Supporting text | `#64748B` | Descriptions and trust copy |
| Borders | `#D9E2EC` | Divider, card outline, and button border |
| Focus ring | `#2563EB` | Visible keyboard focus |

These are login-page-specific suggestions based on the mockup. Check them against the existing global theme tokens before introducing duplicates. Keep AI-specific violet out of the general brand layout; it is not needed on this screen.

## 5. Typography

Use the fonts already configured in the project:

- **Headings:** `Space Grotesk`, weight `600–700`.
- **Body and controls:** `DM Sans`, weight `400–500`.
- **Small labels:** `DM Sans` or `Geist Mono` sparingly; use uppercase letter spacing for the eyebrow.

Suggested sizes:

| Element | Desktop | Mobile |
|---|---:|---:|
| Main headline | `clamp(2.25rem, 3.2vw, 3.5rem)` | `2rem–2.5rem` |
| Card heading | `2rem` | `1.65rem–1.85rem` |
| Body / support text | `1.05rem–1.15rem` | `1rem` |
| Eyebrow | `0.75rem` | `0.7rem` |
| Feature labels | `0.95rem` | `0.9rem` |
| Trust/security note | `0.85rem–0.9rem` | `0.8rem–0.85rem` |

Use a body line-height around `1.5–1.65`. Headlines should have tight tracking, but should not become cramped.

## 6. Component Structure

Prefer to adapt the existing login route and shared components rather than duplicating authentication logic.

Suggested logical structure (adapt names to the existing project):

```text
src/app/login/page.tsx
└── LoginPage
    ├── LoginBrandPanel
    │   ├── SatoriLogo
    │   ├── BrandHeadline
    │   ├── BrandBenefits
    │   └── BrandTrustNote
    └── LoginPanel
        └── LoginCard
            ├── LoginHeading
            ├── GoogleSignInButton
            ├── LegalNotice
            └── SecureSignInNote
```

This is a logical structure, not a requirement to create a separate file for every component. Keep the implementation maintainable and reuse the logo, auth helpers, and button styles already present in the codebase.

## 7. Responsive Behavior

### Wide desktop (`min-width: 1024px`)

- Show the two-column split layout.
- Keep the left brand content vertically balanced and the sign-in card centered in the right column.
- Avoid excessive empty space between the logo and the main message.

### Tablet (`768px–1023px`)

- Continue with two columns only if the headline, benefits, and card can fit comfortably.
- Reduce panel padding and headline size.
- If the card becomes narrow or the left copy wraps awkwardly, transition to a stacked layout earlier rather than squeezing both columns.

### Mobile (`below 768px`)

Use a single-column layout:

1. Compact brand row at the top.
2. Shortened brand introduction and optional compact benefit row.
3. Sign-in card below it, spanning the available width with safe side padding.
4. Keep the legal notice and security note readable without horizontal overflow.

Mobile-specific rules:

- Remove the vertical divider.
- Do not use a fixed height that clips content on short screens.
- Use normal document flow and allow vertical scrolling when necessary.
- The Google sign-in control should be at least `48px` tall and full width.
- Keep touch targets comfortably sized.

## 8. Interactions and States

### Google sign-in button

- Trigger the existing Google authentication provider.
- Show a loading label/state while authentication starts, if the current auth library supports it.
- Prevent accidental repeated submissions while pending.
- Preserve existing error handling and callback behavior.
- Do not fake a successful sign-in or send users to the dashboard before authentication succeeds.

### Keyboard and accessibility

- All controls and links must be reachable by keyboard.
- Provide a visible focus indicator with sufficient contrast.
- Use a semantic `<main>` and meaningful headings.
- Give the logo appropriate alternative text if it is an image; if the wordmark is already visible as text, avoid redundant screen-reader announcements.
- Ensure the Google icon does not replace the accessible button label.
- Respect `prefers-reduced-motion`; this page does not need entrance animations.
- Do not communicate security or authentication errors by color alone.

### Theme behavior

The reference mockup is light. Prefer a polished light login screen if that matches the intended approved design. If the app supports system/dark theme on the login route, provide an intentional dark variant using existing theme tokens rather than allowing hard-coded text colors to become unreadable. Do not add gradients in dark mode either.

## 9. Implementation Guardrails

1. **Preserve authentication:** Keep the existing OAuth configuration, callbacks, session creation, redirect rules, and error behavior.
2. **Preserve routing:** Do not change the expected login or dashboard routes as part of visual work.
3. **Reuse the logo:** Use the approved Option 1 logo asset or shared `SatoriLogo` component, not a newly improvised symbol.
4. **No gradient:** No gradient fills, gradient text, glowing halos, or animated background decoration.
5. **No invented auth options:** Only show sign-in providers and dividers that correspond to working methods.
6. **No unsupported claims:** Keep privacy/security wording aligned with implemented behavior and published policies.
7. **Use real legal links:** Do not ship dead `#` links for Terms or Privacy Policy.
8. **Avoid unrelated refactors:** Change only the login page styles/components needed for this redesign unless a shared component must be updated deliberately.
9. **Use project tokens where possible:** If equivalent global theme variables exist, reuse them instead of scattering duplicate color literals throughout the page.
10. **Check the actual viewport:** Validate both a desktop browser and a narrow mobile viewport, not just the reference screenshot.

## 10. Suggested Implementation Sequence

1. Inspect the current `/login` page, auth provider action, logo component, global styles, and existing theme tokens.
2. Identify which existing files can be reused; do not rewrite the auth implementation.
3. Implement the two-panel desktop layout and sign-in card.
4. Add the brand copy, three feature points, legal notice, and security note.
5. Add the mobile stacked layout and intermediate breakpoint behavior.
6. Verify Google sign-in still works and existing error/loading behavior remains intact.
7. Check contrast, keyboard focus, responsive layout, long text wrapping, and overflow.
8. Run the repository's existing lint, type-check, and production build commands.

## 11. Acceptance Checklist

- [ ] The page closely follows the approved reference layout.
- [ ] The navy geometric Satori logo and wordmark are used consistently.
- [ ] No gradients or neon/glow effects are present.
- [ ] The left brand panel contains the headline, supporting copy, benefits, and trust statement.
- [ ] The right panel presents a visually clear and centered sign-in card.
- [ ] Google sign-in uses the real existing authentication flow.
- [ ] The `OR` divider is omitted unless a second real sign-in option is shown.
- [ ] Terms and Privacy Policy point to real destinations.
- [ ] Security and privacy claims accurately reflect the implementation.
- [ ] The interface is responsive at desktop, tablet, and mobile sizes.
- [ ] All actions are keyboard accessible and have visible focus states.
- [ ] Text remains readable and no elements overflow on narrow screens.
- [ ] Theme behavior is intentional and text remains legible in supported themes.
- [ ] Existing sign-in, callback, redirect, and error behavior has not regressed.
- [ ] Lint, type-check, and production build pass.

---

## Final Direction

The finished login page should feel calm, confident, and practical. The design should quickly establish Satori's value—**search documents, get clear answers, inspect the sources**—then direct attention to one obvious action: signing in with Google. Keep the design simple enough that the user's attention stays on trust and access, not decoration.
