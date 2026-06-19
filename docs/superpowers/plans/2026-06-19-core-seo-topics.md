# Core SEO Topics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish unique, useful owners for Roblox GUI templates, script-generator, and beginner how-to search intents.

**Architecture:** Extend the existing authored `GUIDES` data model with two entries and optional related-guide links. Keep `/templates` as the sole template-topic owner, strengthen its supporting copy, and reuse the current dynamic guide route, FAQ schema, breadcrumbs, static generation, and sitemap integration.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Playwright

---

### Task 1: Guide topic data contract

**Files:**
- Create: `app/guides/guides-data.test.ts`
- Modify: `app/guides/guides-data.ts`

- [ ] **Step 1: Write failing guide data tests**

Create tests with these assertions:

```ts
import { describe, expect, it } from "vitest";
import { GUIDES, getGuide } from "./guides-data";

const topicSlugs = [
  "roblox-gui-script-generator",
  "how-to-make-a-gui-in-roblox",
];

describe("core SEO guide topics", () => {
  it("defines every guide slug once", () => {
    expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(GUIDES.length);
  });

  it.each(topicSlugs)("provides substantial authored content for %s", (slug) => {
    const guide = getGuide(slug);
    expect(guide).toBeDefined();
    expect(guide?.sections.length).toBeGreaterThanOrEqual(6);
    expect(guide?.faq.length).toBeGreaterThanOrEqual(3);
    expect(guide?.intro.length).toBeGreaterThan(140);
  });

  it("keeps template intent out of duplicate guide routes", () => {
    expect(getGuide("roblox-gui-templates")).toBeUndefined();
  });

  it("links only to existing related guides", () => {
    for (const guide of GUIDES) {
      for (const link of guide.relatedGuides ?? []) {
        expect(getGuide(link.slug), `${guide.slug} -> ${link.slug}`).toBeDefined();
      }
    }
  });
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- app/guides/guides-data.test.ts`

Expected: FAIL because both target guides are undefined and `relatedGuides` is not in the `Guide` type.

- [ ] **Step 3: Extend the guide type**

Add this optional field:

```ts
relatedGuides?: Array<{ slug: string; title: string }>;
```

- [ ] **Step 4: Author the script-generator guide**

Add `roblox-gui-script-generator` with category `Export`, related template `main-menu`, a reciprocal link to `how-to-make-a-gui-in-roblox`, and these six sections:

1. `What a Roblox GUI script generator should create`
2. `Turn a visual hierarchy into Roblox instances`
3. `Separate client UI from server-owned actions`
4. `Choose Luau, JSON, or ZIP export`
5. `Install the generated scripts in Roblox Studio`
6. `Test behavior and keep security on the server`

Include at least three FAQs covering generated output, script placement, and whether arbitrary game logic is generated. Every answer must match current product behavior.

- [ ] **Step 5: Author the beginner workflow guide**

Add `how-to-make-a-gui-in-roblox` with category `Getting Started`, related template `main-menu`, a reciprocal link to `roblox-gui-script-generator`, and these six sections:

1. `Decide what the GUI helps the player do`
2. `Build a clear ScreenGui hierarchy`
3. `Make the layout responsive`
4. `Connect buttons to visible states`
5. `Preview desktop, tablet, and mobile states`
6. `Export, install, and test in Roblox Studio`

Include at least three FAQs covering ScreenGui placement, mobile responsiveness, and when server code is required.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- app/guides/guides-data.test.ts`

Expected: all four data-contract tests PASS.

- [ ] **Step 7: Commit guide data**

Stage only `app/guides/guides-data.ts` and its test. Commit with the lore format, recording the two unique intents and explicit security boundaries.

### Task 2: Rendered topic pages and internal links

**Files:**
- Create: `e2e/seo-topics.spec.ts`
- Modify: `app/guides/[slug]/page.tsx`
- Modify: `app/templates/page.tsx`

- [ ] **Step 1: Write failing rendered-page assertions**

Create one test tagged `@smoke @full` that:

- loads `/templates`, checks the existing title/H1, and requires links named `How to make a GUI in Roblox` and `Understand generated Roblox GUI scripts`;
- loads both new guide URLs and checks each exact H1, six authored section H2s, the related-template CTA, reciprocal `Related guides` link, FAQPage and BreadcrumbList JSON-LD;
- verifies `document.documentElement.scrollWidth === window.innerWidth` and collects no console errors;
- requests `/roblox-gui-templates` and expects HTTP 404.

- [ ] **Step 2: Build and verify RED**

Run: `npm run build && npm run test:e2e:smoke`

Expected: FAIL because `/templates` does not link to the new guides and guide detail pages do not render `Related guides`.

- [ ] **Step 3: Render related guides safely**

In the dynamic guide page, escape `<` when serializing FAQ and breadcrumb JSON-LD. After the FAQ block, render a `Related guides` section only when `g.relatedGuides` has entries; each descriptive link targets `/guides/${link.slug}`.

- [ ] **Step 4: Strengthen the templates owner page**

Below the gallery, add two concise H2 sections:

- `How to choose a Roblox GUI template`, explaining task fit, hierarchy, real labels, and device checks.
- `Customize, preview, and export`, explaining responsive controls, interaction preview, Luau/JSON/ZIP output, and server boundaries.

Add descriptive links to `/guides/how-to-make-a-gui-in-roblox` and `/guides/roblox-gui-script-generator`. Keep `/templates` as the canonical and update its description to include responsive editing and ZIP/JSON export.

- [ ] **Step 5: Rebuild and verify GREEN**

Run: `npm run build && npm run test:e2e:smoke`

Expected: both smoke specs PASS, both schema types parse, reciprocal links work, duplicate route returns 404, and no console errors occur.

- [ ] **Step 6: Run type and unit gates**

Run: `npm test && npx tsc --noEmit && git diff --check`

Expected: all Vitest tests pass, TypeScript exits zero, and no whitespace errors are reported.

- [ ] **Step 7: Commit rendered topic pages**

Stage `e2e/seo-topics.spec.ts`, `app/guides/[slug]/page.tsx`, and `app/templates/page.tsx`. Commit with the lore format.

### Task 3: Visual and release verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-19-core-seo-topics.md`

- [ ] **Step 1: Verify responsive topic rendering**

Inspect 375 px, 768 px, and 1280 px screenshots for `/templates` and both new guides. Confirm code blocks, links, FAQ, and supporting copy have no horizontal overflow.

- [ ] **Step 2: Run every release gate**

Run sequentially:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:e2e:smoke
npm run test:e2e:full
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 3: Mark local plan steps and commit evidence**

Mark local steps complete, leave remote CI open, and commit this plan with the exact evidence.

- [ ] **Step 4: Push and verify remote CI**

Push `main`, wait for the matching CI workflow, and record its run ID. Preserve the user's existing worktree changes.
