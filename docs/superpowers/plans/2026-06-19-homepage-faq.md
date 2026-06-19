# Homepage FAQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add six visible, native homepage disclosures whose answers exactly match a `FAQPage` JSON-LD payload.

**Architecture:** A static `FAQS` array in the homepage server component drives both `<details>` elements and structured data. The smoke browser journey parses every JSON-LD script by type so WebApplication and FAQ contracts remain independently testable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Playwright

---

### Task 1: Lock the visible and structured FAQ contract

**Files:**
- Modify: `e2e/editor-smoke.spec.ts`

- [x] **Step 1: Write failing FAQ assertions**

Replace the single-script schema lookup with all JSON-LD payloads:

```ts
const structuredData = (
  await page.locator('script[type="application/ld+json"]').allTextContents()
).map((value) => JSON.parse(value) as { "@type": string; [key: string]: unknown });
const webAppSchema = structuredData.find(
  (value) => value["@type"] === "WebApplication"
);
expect(JSON.stringify(webAppSchema)).toContain("Browser-local ZIP project export");
```

Then assert the FAQ region, six summaries, security answer, and schema:

```ts
const faq = page.getByRole("region", { name: "Frequently asked questions" });
await expect(faq.locator("summary")).toHaveCount(6);
await faq.getByText("Does the editor generate game logic?").click();
await expect(
  faq.getByText(/Secure economy, purchase, reward, permission, and datastore validation/)
).toBeVisible();
const faqSchema = structuredData.find((value) => value["@type"] === "FAQPage") as {
  mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>;
};
expect(faqSchema.mainEntity).toHaveLength(6);
expect(faqSchema.mainEntity?.find((item) => item.name === "Is Roblox GUI Maker free to use?")?.acceptedAnswer.text).toBe(
  "Yes. The editor is free, requires no account, and keeps project work in your browser unless you download it."
);
```

- [x] **Step 2: Build and verify RED**

Run: `npm run build && npm run test:e2e:smoke`

Expected: FAIL because the `Frequently asked questions` region does not exist.

- [x] **Step 3: Commit the failing regression test**

Stage only `e2e/editor-smoke.spec.ts`. Commit using the lore format and record that the FAQ schema is required to match visible content.

### Task 2: Render FAQ from one static source

**Files:**
- Modify: `app/page.tsx`

- [x] **Step 1: Add the six approved FAQ entries**

Define `FAQS` as six `{ question, answer }` objects with the exact wording approved in `docs/superpowers/specs/2026-06-19-homepage-faq-design.md`. Do not add questions or split answers into HTML fragments.

- [x] **Step 2: Generate FAQPage JSON-LD**

Map `FAQS` to a static object with `@context`, `@type: "FAQPage"`, and `mainEntity` entries containing `Question` and `Answer`. Render it as a second native JSON-LD script with `<` escaped as `\u003c`.

- [x] **Step 3: Render the native disclosures**

After the existing educational body and before `</main>`, add a section labelled by `faq-heading`. Render one bordered `<details>` per item with a keyboard-accessible `<summary>` and answer paragraph. Reuse existing `max-w-3xl`, panel, line, ink, and spacing tokens.

- [x] **Step 4: Rebuild and verify GREEN**

Run: `npm run build && npm run test:e2e:smoke`

Expected: FAQ assertions and the existing secure Teleport journey PASS with no captured console errors.

- [x] **Step 5: Run local quality gates**

Run: `npm test && npx tsc --noEmit && git diff --check`

Expected: 147 Vitest tests pass, TypeScript exits zero, and no whitespace errors are reported.

- [x] **Step 6: Commit the FAQ implementation**

Stage only `app/page.tsx`. Commit with the lore format, recording native disclosure semantics and single-source schema content.

### Task 3: Visual and release verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-19-homepage-faq.md`

- [x] **Step 1: Verify responsive FAQ rendering**

Serve the current production build and inspect 375 px, 768 px, and 1280 px screenshots. Confirm the disclosure rows do not overflow and expanded answer text remains readable.

- [x] **Step 2: Run the complete browser journey**

Run: `npm run test:e2e:full`

Expected: the full editor import/export journey PASSes.

- [x] **Step 3: Mark completed plan steps and commit evidence**

Mark local steps complete, leave remote CI open, and commit this plan using the lore format with exact verification evidence.

- [x] **Step 4: Push and verify remote CI**

Push `main`, wait for the matching CI workflow to succeed, then mark the overall FAQ task complete. Preserve all user-owned worktree changes.
