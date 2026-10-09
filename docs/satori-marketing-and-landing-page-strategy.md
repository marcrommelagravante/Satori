# Satori — Marketing & Landing Page Improvement Strategy

> **Purpose:** Improve how Satori explains its value, attracts the right users, and guides visitors toward their first useful result.
> **Product:** Satori Knowledge Platform
> **Brand direction:** Calm intelligence, document-first, source-traceable, solid colors only.
> **Status:** Recommendations to test and validate; not all recommendations are confirmed product capabilities.

---

## 1. Executive Recommendation

Keep the existing landing-page foundation and brand identity, but organize the experience around the visitor's decision process:

1. Recognize a document-related problem.
2. Understand what Satori does in plain language.
3. See a convincing question-to-answer-to-source demonstration.
4. Understand how to start and what happens to their documents.
5. Create a workspace and reach a useful, verifiable result.

The website should sell the practical outcome first and explain the technical architecture second. Satori should feel like a dependable knowledge-work tool, not a generic chatbot or an exaggerated AI product.

## 2. Product Positioning

### Recommended positioning statement

**Satori is a document knowledge workspace that helps teams find answers across their files and inspect the source passages behind those answers.**

### The core problem

Important information is spread across PDFs, Word documents, policies, research papers, bylaws, manuals, and operating procedures. Finding the right paragraph can take time, and a generated answer is difficult to trust if the user cannot check its source.

### The value proposition

Satori lets people ask questions in plain language and inspect the document passages that support the response.

### Messaging hierarchy

1. **Problem:** Important knowledge is scattered across documents.
2. **Outcome:** Ask questions rather than manually searching every file.
3. **Differentiator:** Inspect citations and the supporting passage when the product provides that source information.
4. **Action:** Start a workspace, add a document, ask a question, and inspect a citation.

Avoid positioning Satori as an infallible decision-maker or a replacement for human judgment.

---

## 3. Brand and Visual Direction

### Logo direction

Use **Option 1**, the compact geometric “S” mark, paired with the Satori wordmark.

- Primary logo: deep navy geometric mark and wordmark on light surfaces.
- Dark-surface version: white mark and wordmark on a solid dark surface.
- Favicon: standalone simplified “S” mark in a solid navy square with adequate clear space.
- Small-size version: keep the mark bold and legible at 16×16 and 32×32 pixels.
- Prepare a clean SVG master and export the required favicon formats from that master.

### Suggested brand-mark colors

| Token | Hex | Role |
|---|---|---|
| Satori Navy | `#0F2D4A` | Primary logo and wordmark |
| Satori Blue | `#386FB6` | Optional, restrained supporting accent |
| Satori Paper | `#F5F7FA` | Light marketing surface |
| White | `#FFFFFF` | Logo reversal and clear surfaces |
| Slate | `#64748B` | Supporting text and metadata |

### Visual guardrails

- Use solid fills; no gradients.
- Avoid neon glows, AI orbs, robot mascots, decorative particle fields, and unnecessary motion.
- Keep documents, answers, and citations central to product visuals.
- Continue using Space Grotesk for headings, DM Sans for body/UI, and Geist Mono for code-like metadata as defined by the existing design system.
- Preserve the current application token system unless a separate palette migration is intentionally planned. The navy logo does not automatically require replacing all indigo application buttons.
- Keep violet reserved for AI-originated UI elements according to the current design guide.

---

## 4. Landing Page Review

The current landing-page guide already describes a hero section, an interactive Convergence Stage, a three-step “How it works” section, capability cards, source inspector, workspace showcase, use-case tabs, architecture section, and final CTA.

These are useful foundations. The main improvement is to prioritize **visitor comprehension and product proof** before deep technical detail.

### Recommended hero copy to test

**Eyebrow**

`GROUNDED KNOWLEDGE WORKSPACE`

**Headline**

# Find the answer. See the source.

**Subheading**

Search across your PDFs, Word documents, and text files. Ask questions in plain language and inspect the passages behind Satori’s answers.

**Primary CTA:** `Get started`

**Secondary CTA:** `Explore the demo` or `See how it works` — choose one label and use it consistently.

**Proof line:** `PDF, DOCX, and TXT support · Source-linked answers`

This headline is a test candidate, not a mandatory replacement. Keep **“Your knowledge, intelligently connected.”** as the master brand tagline in the wordmark lockup, footer, or brand introduction. Avoid making two different lines compete as the hero headline.

### Recommended page section order

1. **Hero:** Explain the outcome, problem, and primary action.
2. **Question-to-citation demonstration:** Show a realistic question, the answer, and the opened source passage.
3. **How it works:** Add documents, ask a question, inspect the source.
4. **Capabilities and traceability:** Demonstrate the benefits with examples.
5. **Workspace showcase:** Help visitors recognize the actual application.
6. **Use cases:** Show examples relevant to organizations, researchers, technical teams, and small businesses.
7. **Trust and data handling:** Answer privacy, access, storage, and processing questions with verified information.
8. **Technical architecture:** Keep details available for technical evaluators without making every visitor read them.
9. **Final CTA:** Repeat the main action and explain the immediate next step.

Preserve the existing page rule that limits eyebrow labels to three. Do not add extra labels simply to decorate sections.

---

## 5. Make the Demonstration Explain the Product

The landing-page guide describes the Convergence Stage and workspace showcase as simulated examples. These can be valuable, but make their status clear.

A strong product demonstration should show this sequence:

1. A relevant document or a small collection of documents.
2. A realistic question a user might ask.
3. A concise answer with numbered citations.
4. A click on a citation.
5. The corresponding source passage highlighted in the document.
6. A brief explanation that the user can inspect the evidence themselves.

Label a simulated interaction **“Interactive example”** or **“Product walkthrough”** when it does not process a visitor’s own files. Do not imply that mock content is a live user workspace or a real-time AI result if it is not.

### Explain “How it works” in user language

**Step 1 — Add your documents**

Upload supported files to your workspace.

**Step 2 — Ask a question**

Use natural language to find information across those documents.

**Step 3 — Inspect the source**

Open the citation and review the passage behind the answer.

Keep technical terminology such as embeddings, vector dimensions, pgvector, and Reciprocal Rank Fusion in the architecture section or progressive disclosure area.

---

## 6. Trust, Accuracy, Privacy, and Product Claims

Avoid absolute claims such as **“zero hallucination”** or promises that every answer is always correct.

### Suggested accuracy wording

> Satori grounds its responses in information retrieved from your workspace and provides source citations so you can inspect the supporting passages.

Use this only if the live product consistently provides the described citations. Encourage users to verify source passages before acting on important information.

Before publishing privacy or security claims, verify actual behavior for:

- File storage and deletion
- Workspace access control and isolation
- Data retention and backups
- Processing by external AI providers
- Whether uploaded content is used for model training
- Applicable policies, contractual promises, or compliance certifications

Do not claim that data is never used for model training, that the service is completely private, or that Satori complies with a particular standard unless the implementation and published policy support the claim.

### FAQ topics to consider

- Which file types can I upload?
- How do source citations work?
- Can I ask questions across multiple documents?
- What happens when Satori cannot find a relevant answer?
- Who can access the files in a workspace?
- How are uploaded files stored and processed?
- Is there a free plan or trial? *(Publish only once the pricing decision is confirmed.)*

---

## 7. Initial Audience and User Acquisition

Treat the first audience as a hypothesis to validate, not a permanent decision. A practical starting point is **small organizations and operations teams** that repeatedly search policies, procedures, bylaws, manuals, and internal documents.

Compare that audience with the existing alternatives:

- Community and membership organizations
- Researchers
- Technical teams
- Small businesses

### Acquisition channels to test first

**1. Direct walkthroughs and user interviews**

Invite a small number of people in the initial audience to try a realistic workflow. Watch where they hesitate: understanding the product, creating an account, uploading a file, asking a question, trusting the response, or opening a citation.

**2. Short product demonstrations**

Create concise videos or screen recordings showing one real problem and one Satori workflow. The key moment is not a flashy animation; it is the user opening a citation and seeing the source passage.

**3. Useful search-focused content**

Create genuinely helpful content around problems such as:

- How to search long policy documents more effectively
- How to find a clause in a PDF and verify its context
- How teams can make standard operating procedures easier to search
- How source citations help people check AI-generated answers

**4. Focused use-case page**

After user interviews reveal which use case resonates most, create a page for that audience with its document types, common questions, and a representative walkthrough.

**Paid advertising should come later.** First verify that people understand the offer, sign-up works, and new users can reach a meaningful result. Paid traffic cannot repair unclear positioning or confusing onboarding.

### Example social post

> Need to find a rule buried in a long policy or bylaws document? Ask Satori a question, then open the citation to inspect the passage behind the answer. Your documents stay at the center of the workflow.
>
> Explore Satori and see how source-linked document search works.

Before publishing, ensure the CTA leads to a working destination and use a genuine product screenshot or a clearly labeled demonstration.

---

## 8. Convert Sign-Ups into First Value

The goal is not merely an account creation. The goal is to help a new user reach a useful answer that they can verify.

### Recommended first-session flow

1. Create or open a workspace.
2. Upload the first supported document, with file requirements visible before selection.
3. Offer a suggested question relevant to the document type.
4. Display the answer and its source citations together.
5. Provide a lightweight prompt showing how to inspect a citation.
6. Offer a useful next step, such as asking another question or adding another document. Include sharing, export, or team invites only if those capabilities are supported.

Avoid a large, blocking product tour. Prefer lightweight, dismissible guidance.

### Reduce the empty-state problem

Consider a sample workspace or sample document for visitors who do not have a suitable file ready. Clearly label all sample content as demo data, and implement this only if the product can distinguish it from the user’s own data and explain how to reset or remove it.

### Suggested activation metric

For initial measurement, define an activated user as someone who:

- Uploads at least one supported document
- Asks at least one question about workspace content
- Opens at least one source citation

This is a proposed definition. Adjust it after observing real user behavior.

---

## 9. Measurement Plan

Track a small number of events that connect marketing to actual product use.

| Metric | Suggested definition | What it helps answer |
|---|---|---|
| Hero CTA click rate | Unique hero CTA clicks ÷ unique landing visitors | Is the first screen compelling? |
| Sign-up completion | Completed sign-ups ÷ sign-up starts | Is account creation clear? |
| First-document rate | New users uploading a first document ÷ new users | Do people begin using the product? |
| Activation rate | New users who upload, ask, and inspect a citation ÷ new users | Do users reach the core value? |
| Citation interaction rate | Answer sessions with a citation opened ÷ answer sessions with citations | Are users verifying the answer? |
| Week-one return rate | Activated users returning within seven days ÷ activated users | Is the workflow valuable beyond one attempt? |

Interpret metrics together. High CTA clicks but low activation may mean the first-run experience does not fulfill the landing-page promise. Low CTA clicks may point to unclear messaging, insufficient proof, or the wrong audience.

Instrument only necessary analytics. Disclose relevant tracking in the privacy notice and avoid collecting the text of private documents or questions unless there is a clear, disclosed need and appropriate data-handling safeguards.

---

## 10. First 30 Days

| Timing | Priority | Deliverable | What to learn |
|---|---|---|---|
| Week 1 | Clarify the message | Choose an initial audience to test; test the hero headline and proof line; verify all product claims | Can target users explain Satori’s value after a brief look? |
| Week 2 | Improve first value | Record a question-to-citation demo; inspect sign-up and first-upload flow; add suggested questions | Where do new users get stuck before seeing a useful result? |
| Week 3 | Reach relevant users | Conduct direct walkthroughs; publish 2–3 problem-led demos or helpful posts; outline one focused use-case page | Which audience and task get the strongest response? |
| Week 4 | Measure and refine | Review funnel events; fix the largest drop-off; adjust copy based on real objections | Are visitors becoming active users, not just clicking CTAs? |

This is an order of work, not a promise of growth. Do not scale paid campaigns until activation is understandable and measurable.

---

## 11. Pre-Publication Checklist

- [ ] The first screen explains the user benefit in plain language.
- [ ] The primary CTA leads to a working route and says what happens next.
- [ ] The product demo shows a question, answer, and inspectable source passage.
- [ ] Simulated content is clearly labeled as a demonstration.
- [ ] Supported file types and upload limits match the running product.
- [ ] Citation behavior matches the product; no promise of infallibility is made.
- [ ] Privacy, security, retention, and AI-provider statements have been verified.
- [ ] Pricing and free-trial claims are current and confirmed.
- [ ] The logo and favicon use approved solid-color assets without gradients.
- [ ] The site works on mobile and supports reduced motion and readable contrast.
- [ ] Analytics measure activation, not only page views and CTA clicks.

---

## 12. Questions to Validate with Users

Use interviews, usability sessions, and funnel data to resolve these open decisions:

1. Which audience is most likely to upload real documents and return: community organizations, small businesses, researchers, or technical teams?
2. Which first use case resonates most: policy/bylaws lookup, SOP search, research-paper discovery, or technical documentation search?
3. Does the buyer care most about saving time, checking answers, sharing institutional knowledge, or a combination?
4. What can honestly be promised about data handling, availability, pricing, and collaboration today?
5. Which hero message leads to more activated users rather than just more clicks?

Do not change the product architecture or visual identity only because a marketing trend suggests it. Use evidence from users and the product itself.

---

## 13. Relationship to Existing Guides

This strategy supplements, rather than replaces, the existing Satori brand identity and landing-page implementation guides.

- Keep the existing type, spacing, motion, density, and semantic color rules as the UI implementation baseline.
- Use the Option 1 geometric S as the logo direction, subject to final SVG production and small-size testing.
- Keep the current landing-page components where they are useful; prioritize copy, proof, section order, onboarding, and measurement before rebuilding the page.
- Treat all recommendations in this document as hypotheses to test against the live product and real user feedback.
