# Homepage Product Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the homepage so visible content, metadata, and JSON-LD accurately prove the editor's responsive, interactive, server-backed, and portable export capabilities.

**Architecture:** Keep the homepage as a single server component. Static `PRODUCT_PROOFS` data renders four semantic cards, while the existing Next.js metadata export and JSON-LD object mirror the same verified claims.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Playwright

---

### Task 1: Lock the homepage contract with a browser test

**Files:**
- Modify: `e2e/editor-smoke.spec.ts`

- [ ] **Step 1: Add failing homepage assertions**

At the beginning of the smoke journey, load `/` and assert the new public contract before navigating to `/editor`:

```ts
await page.goto("/");
await expect(page).toHaveTitle(
  "Free Online Roblox GUI Maker | Visual UI Builder"
);
await expect(page.locator('meta[name="description"]')).toHaveAttribute(
  "content",
  /responsive designs, preview interactions, and export Luau, JSON, and ZIP/
);
await expect(
  page.getByRole("heading", { level: 1, name: "Roblox GUI Maker" })
).toBeVisible();
for (const heading of [
  "Responsive Layout",
  "Interaction Preview",
  "Server-Safe Actions",
  "ZIP + JSON Export",
]) {
  await expect(page.getByRole("heading", { level: 3, name: heading })).toBeVisible();
}
const schema = await page
  .locator('script[type="application/ld+json"]')
  .textContent();
expect(schema).toContain("Browser-local ZIP project export");
expect(schema).toContain("Server handlers for RemoteEvent and Teleport actions");

await page.goto("/editor");
```

- [ ] **Step 2: Build the existing app and verify RED**

Run: `npm run build && npm run test:e2e:smoke`

Expected: FAIL on the old homepage title before reaching the existing editor assertions.

- [ ] **Step 3: Commit the failing regression test**

Stage only `e2e/editor-smoke.spec.ts`. Commit with the lore format and record that the old homepage still describes Luau-only export.

### Task 2: Render current product proof

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update metadata and structured data**

Set the page title to `Free Online Roblox GUI Maker | Visual UI Builder`. Use this concise description:

```ts
"Free online Roblox GUI maker. Create responsive designs, preview interactions, and export Luau, JSON, and ZIP for Roblox Studio. No login required."
```

Update JSON-LD to use the same product scope and add feature strings for responsive geometry, interaction previews, server handlers, JSON import/export, and browser-local ZIP export.

- [ ] **Step 2: Add product-proof content**

Add a static `PRODUCT_PROOFS` array with the four approved headings and factual descriptions. Update the hero eyebrow and body to describe a free browser-local builder that downloads a complete project. Render the proof strip directly beneath the existing `ScenePreview` using four semantic article/card blocks. Update workflow step three to `Download a complete project` while retaining generated Luau language.

- [ ] **Step 3: Rebuild and verify GREEN**

Run: `npm run build && npm run test:e2e:smoke`

Expected: the homepage contract and existing Teleport editor journey both PASS with zero captured console errors.

- [ ] **Step 4: Run type and unit gates**

Run: `npm test && npx tsc --noEmit && git diff --check`

Expected: all Vitest tests pass, TypeScript exits zero, and no whitespace errors are reported.

- [ ] **Step 5: Commit the homepage implementation**

Stage only `app/page.tsx`. Commit with the lore format, noting that FAQ and new topic routes remain separate planned increments.

### Task 3: Release verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-19-homepage-product-proof.md`

- [ ] **Step 1: Run the full browser journey**

Run: `npm run test:e2e:full`

Expected: the complete editor import/export journey PASSes.

- [ ] **Step 2: Mark completed plan steps**

Change completed `- [ ]` markers in this plan to `- [x]`. Leave remote CI open until the pushed workflow succeeds.

- [ ] **Step 3: Commit verification evidence**

Commit the checked plan with the lore format and list the exact local verification commands.

- [ ] **Step 4: Push and verify remote CI**

Push `main` to `origin`, wait for the matching CI workflow, and report its run ID and conclusion. Preserve the user's existing `.gitignore`, `.superpowers/`, and `docs/youtube-60s-script.md` worktree changes.
