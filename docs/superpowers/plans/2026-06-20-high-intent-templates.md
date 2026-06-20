# High-Intent Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four polished, honest Roblox GUI templates for game passes, code redemption, daily rewards, and quest tracking.

**Architecture:** Extend the existing static `TEMPLATES` data source with four `SceneNode[]` scenes built through `mk`; current template pages, editor query loading, and sitemap generation consume them automatically. Add focused data-contract tests first, then extend the existing SEO browser test to prove public discovery and editor loading without changing the action schema or Next.js routes.

**Tech Stack:** TypeScript, React 19, Next.js 16 App Router, Vitest, Playwright

---

## File Structure

- Create `app/editor/templates.test.ts`: owns invariant and behavior tests for template data.
- Modify `app/editor/templates.ts`: owns the four new scene definitions and their public template metadata.
- Modify `e2e/seo-topics.spec.ts`: owns public template-page, editor-entry, console, and overflow coverage.

### Task 1: Lock The Template Data Contract

**Files:**
- Create: `app/editor/templates.test.ts`
- Test: `app/editor/templates.test.ts`

- [x] **Step 1: Write the failing data-contract tests**

Create the test file with helpers that resolve the four required templates and inspect their scene nodes:

```ts
import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import { TEMPLATES } from "./templates";

const expectedSlugs = [
  "game-pass-shop",
  "code-redeem",
  "daily-rewards",
  "quest-tracker",
] as const;

function requiredTemplate(slug: (typeof expectedSlugs)[number]) {
  const template = TEMPLATES.find((candidate) => candidate.slug === slug);
  if (!template) throw new Error(`Missing template: ${slug}`);
  return template;
}

function actionNodes(scene: SceneNode[]) {
  return scene.filter((node) => node.action);
}

describe("high-intent templates", () => {
  it("defines every required slug exactly once", () => {
    for (const slug of expectedSlugs) {
      expect(TEMPLATES.filter((template) => template.slug === slug)).toHaveLength(1);
    }
    expect(new Set(TEMPLATES.map((template) => template.slug)).size).toBe(TEMPLATES.length);
  });

  it("keeps node IDs and references valid within every scene", () => {
    for (const template of TEMPLATES) {
      const ids = template.scene.map((node) => node.id);
      const idSet = new Set(ids);
      expect(idSet.size, template.slug).toBe(ids.length);
      for (const node of template.scene) {
        if (node.parentId) expect(idSet.has(node.parentId), `${template.slug}:${node.name}`).toBe(true);
        if (node.action && ["show", "hide", "toggle"].includes(node.action.type)) {
          expect(node.action).toHaveProperty("targetId");
          expect(idSet.has("targetId" in node.action ? node.action.targetId ?? "" : ""), `${template.slug}:${node.name}`).toBe(true);
        }
      }
    }
  });

  it("configures distinct game-pass purchase requests", () => {
    const actions = actionNodes(requiredTemplate("game-pass-shop").scene).map((node) => node.action);
    expect(actions).toEqual([
      { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "vip" },
      { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "double-coins" },
      { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "speed-coil" },
    ]);
  });

  it("does not fake dynamic code redemption with a static action", () => {
    const template = requiredTemplate("code-redeem");
    expect(template.scene.some((node) => node.cls === "TextBox" && node.name === "CodeInput")).toBe(true);
    expect(actionNodes(template.scene)).toHaveLength(0);
  });

  it("configures the daily claim request", () => {
    expect(actionNodes(requiredTemplate("daily-rewards").scene).map((node) => node.action)).toEqual([
      { type: "remoteEvent", eventName: "ClaimDailyReward", argument: "day-4" },
    ]);
  });

  it("keeps the quest toggle outside the details it controls", () => {
    const scene = requiredTemplate("quest-tracker").scene;
    const details = scene.find((node) => node.name === "QuestDetails");
    const toggle = scene.find((node) => node.name === "ToggleDetails");
    expect(details).toBeDefined();
    expect(toggle?.parentId).not.toBe(details?.id);
    expect(toggle?.action).toEqual({ type: "toggle", targetId: details?.id });
  });
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm test -- app/editor/templates.test.ts`

Expected: FAIL because the four slugs do not exist.

- [x] **Step 3: Commit the failing contract test**

Stage only `app/editor/templates.test.ts` and commit with the repository lore format. Record that failure is expected because implementation is intentionally absent.

### Task 2: Add The Four Scene Templates

**Files:**
- Modify: `app/editor/templates.ts`
- Test: `app/editor/templates.test.ts`

- [x] **Step 1: Add the Game Pass Shop scene**

Use one `ScreenGui`, a centered dark panel, header and subtitle labels, then three horizontally arranged pass cards. Each card contains a pass name, benefit label, price label, and purchase button. Configure the buttons exactly as follows:

```ts
action: { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "vip" }
action: { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "double-coins" }
action: { type: "remoteEvent", eventName: "PurchaseGamePass", argument: "speed-coil" }
```

Use `#0b0d14` and `#151923` for the foundation, cyan `#38bdf8` for the accent, and gold `#fbbf24` for prices. Name the scene root `GamePassShop` and purchase controls `BuyVip`, `BuyDoubleCoins`, and `BuySpeedCoil`.

- [x] **Step 2: Add the Code Redeem scene**

Use a centered violet-accented dark panel with `Redeem a Code`, explanatory copy, a `TextBox` named `CodeInput`, a `TextButton` named `RedeemCode`, a status label reading `Enter a code to check your reward`, and two example reward rows. Do not attach an action to the button because the action model cannot read current TextBox content.

- [x] **Step 3: Add the Daily Rewards scene**

Use a wide dark panel with a streak header, seven day cards, claimed/current/upcoming visual states, a current reward summary, and a `ClaimReward` button configured exactly as:

```ts
action: { type: "remoteEvent", eventName: "ClaimDailyReward", argument: "day-4" }
```

Use amber `#fbbf24` as the accent and keep the day labels and reward amounts as real editable text.

- [x] **Step 4: Add the Quest Tracker scene**

Use a compact top-right HUD card named `QuestTracker`. Put `ToggleDetails` in its header and `QuestDetails` as a sibling below that header. Configure:

```ts
action: { type: "toggle", targetId: details.id }
```

Inside the details add the quest name `Crystal Collector`, objective `Collect crystal shards`, progress `8 / 12`, a 66% progress fill, and reward `Reward: 350 Coins` using emerald `#34d399` as the accent.

- [x] **Step 5: Register public template metadata**

Append these entries to `TEMPLATES` before the closing bracket:

```ts
{
  slug: "game-pass-shop",
  title: "Roblox Game Pass Shop GUI",
  category: "Shop",
  tagline: "Premium pass cards with purchase requests",
  description: "A polished game pass storefront with three editable offers and RemoteEvent purchase requests. Connect each trusted server handler to your Roblox Marketplace purchase flow before release.",
  scene: gamePassShop,
},
{
  slug: "code-redeem",
  title: "Roblox Code Redeem GUI",
  category: "Menus",
  tagline: "Code input, reward examples, and status states",
  description: "A focused code redemption panel with editable input, feedback, and reward examples. Connect TextBox reading, validation, rate limits, and reward granting in Roblox Studio.",
  scene: codeRedeem,
},
{
  slug: "daily-rewards",
  title: "Roblox Daily Rewards GUI",
  category: "Menus",
  tagline: "Seven-day streak with a server request",
  description: "A seven-day reward calendar with claimed, current, and upcoming states plus a claim RemoteEvent. Validate time, streak, and duplicate claims on the server.",
  scene: dailyRewards,
},
{
  slug: "quest-tracker",
  title: "Roblox Quest Tracker GUI",
  category: "HUD",
  tagline: "Expandable objective and progress HUD",
  description: "A compact quest HUD with editable objective, progress, reward, and a previewable details toggle. Connect live quest data and completion rewards in your game code.",
  scene: questTracker,
},
```

- [x] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- app/editor/templates.test.ts`

Expected: all high-intent template tests pass.

- [x] **Step 7: Run type checking**

Run: `npx tsc --noEmit`

Expected: exit zero with no diagnostics.

- [x] **Step 8: Commit the template implementation**

Stage only `app/editor/templates.ts`. Commit with lore describing the honest server boundary and focused test evidence; the contract test remains tracked from Task 1 and becomes green without another staged change.

### Task 3: Prove Public Discovery And Editor Loading

**Files:**
- Modify: `e2e/seo-topics.spec.ts`
- Test: `e2e/seo-topics.spec.ts`

- [x] **Step 1: Extend the browser test before implementation verification**

Inside the existing `@smoke @full` test, after the `/templates` guide-link assertions, add:

```ts
const templates = [
  { slug: "game-pass-shop", title: "Roblox Game Pass Shop GUI" },
  { slug: "code-redeem", title: "Roblox Code Redeem GUI" },
  { slug: "daily-rewards", title: "Roblox Daily Rewards GUI" },
  { slug: "quest-tracker", title: "Roblox Quest Tracker GUI" },
];

for (const template of templates) {
  await page.goto("/templates");
  const card = page.getByRole("link", {
    name: new RegExp(template.title.replace("Roblox ", "").replace(" GUI", "")),
  });
  await expect(card).toHaveAttribute("href", `/templates/${template.slug}`);

  await page.goto(`/templates/${template.slug}`);
  await expect(page).toHaveTitle(`${template.title} — Free Template | Roblox GUI Maker`);
  await expect(page.getByRole("heading", { level: 1, name: template.title })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open in Editor/ })).toHaveAttribute(
    "href",
    `/editor?template=${template.slug}`
  );
  expect(
    await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
  ).toEqual({ innerWidth: 1280, scrollWidth: 1280 });
}

await page.goto(`/editor?template=${templates[0].slug}`);
await expect(page.getByLabel("Client Luau code")).toContainText("GamePassShop");
await expect(page.getByLabel("Client Luau code")).toContainText("PurchaseGamePass");
```

- [x] **Step 2: Build the production application**

Run: `npm run build`

Expected: exit zero and static output includes all four `/templates/<slug>` routes.

- [x] **Step 3: Run the focused browser spec**

Run: `npx playwright test e2e/seo-topics.spec.ts`

Expected: 1 passed, no console errors, no horizontal overflow.

- [x] **Step 4: Commit browser coverage**

Stage only `e2e/seo-topics.spec.ts` and commit with lore including the exact build and Playwright evidence.

### Task 4: Release Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-20-high-intent-templates.md`

- [x] **Step 1: Run the full local verification sequence**

Run sequentially:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:e2e:smoke
npm run test:e2e:full
git diff --check
```

Expected: every command exits zero.

- [x] **Step 2: Perform responsive visual checks**

Open `/templates` and each new detail page at 375, 768, and 1280 pixel widths. Verify previews remain contained, text and calls to action are legible, cards do not overlap, and no page has horizontal overflow. Save screenshots only as untracked verification artifacts.

- [x] **Step 3: Review scope and working tree**

Run: `git status --short` and `git diff --stat HEAD~3..HEAD`.

Expected: implementation commits contain only the planned source, test, and plan files. Preserve pre-existing `.gitignore`, `.superpowers/`, and `docs/youtube-60s-script.md` changes.

- [x] **Step 4: Record completion and commit the plan evidence**

Mark completed checkboxes, record exact test counts and visual widths, and commit only this plan file with lore. Leave remote CI unchecked until the pushed workflow succeeds.

Local evidence:

- RED contract run: 5 failed and 1 passed before implementation.
- GREEN contract run: 6 passed after implementation and layout corrections.
- Full Vitest run: 10 files and 158 tests passed.
- TypeScript: `npx tsc --noEmit` exited zero.
- Production build: 42 static pages generated, including all four new template routes.
- Focused browser run: 1 passed with all four gallery-to-editor journeys.
- Smoke browser run: 2 passed.
- Full browser run: 2 passed.
- Responsive matrix: `/templates` and four detail pages checked at 375, 768, and 1280 pixels; all reported `scrollWidth === innerWidth` after the shared navigation fix.
- Visual review: Game Pass cards, Code Redeem panel, Daily Rewards row, and Quest Tracker were inspected at mobile and desktop widths. The fixed Roblox canvas scales down on mobile, while page copy and calls to action remain readable and contained.
- Additional release fix: CSP now permits the Google Tag Manager transport origin already used by the installed GA script, eliminating console policy errors during repeated navigation.

- [ ] **Step 5: Push and verify remote CI**

Push `main`, wait for the matching GitHub Actions run to finish, record its run ID, then mark the remote gate complete in a final narrow commit and push it.
