# Visual Assets P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add Roblox image assets, tint, rotation, responsive text flags, and UIStroke across editor controls, preview, persistence, and generated Luau.

**Architecture:** Extend the existing optional-property `SceneNode` contract and keep project format version 1. Put asset normalization and thumbnail-response parsing in a focused pure module, keep thumbnail fetching in a client hook, compose rotation into the existing geometry transform, and use the current property-panel and scene-export patterns rather than introducing decorator hierarchy nodes.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, Tailwind CSS v4, Vitest, Playwright, Roblox Luau generation.

---

## File Map

- Create `app/editor/image-assets.ts`: canonical Roblox asset ID parsing, thumbnail request URL, response parsing, and in-memory cached thumbnail resolution.
- Create `app/editor/image-assets.test.ts`: pure asset and thumbnail contract tests.
- Create `app/editor/ImageAssetField.tsx`: local-draft asset ID editor with fail-fast inline validation.
- Modify `app/editor/catalog.ts`: optional visual property types.
- Modify `app/editor/persistence.ts`: import-boundary sanitization and class applicability.
- Modify `app/editor/persistence.test.ts`: JSON compatibility and malformed-input coverage.
- Modify `app/editor/scene.ts`: deep cloning and exact Luau output.
- Modify `app/editor/scene.test.ts`: duplication and Luau regression coverage.
- Modify `app/editor/geometry.ts`: compose Roblox rotation with anchor translation.
- Modify `app/editor/geometry.test.ts`: exact transform behavior.
- Modify `app/editor/PropertiesPanel.tsx`: Image, Rotation, Text flags, and Stroke controls.
- Modify `app/editor/Canvas.tsx`: thumbnail, tint, stroke, and text approximations.
- Modify `e2e/editor-full.spec.ts`: browser-local edit, undo, persistence, JSON, Luau, and thumbnail-independent preview journey.
- Modify `next.config.ts`: permit the exact Roblox thumbnails API in the production CSP.

### Task 1: Roblox Asset Boundary

**Files:**
- Create: `app/editor/image-assets.ts`
- Create: `app/editor/image-assets.test.ts`

- [x] **Step 1: Write failing asset normalization tests**

```ts
import { describe, expect, it } from "vitest";
import {
  normalizeRobloxAssetId,
  parseThumbnailResponse,
  thumbnailRequestUrl,
} from "./image-assets";

describe("Roblox image assets", () => {
  it.each([
    ["123", "rbxassetid://123"],
    ["  rbxassetid://456  ", "rbxassetid://456"],
  ])("canonicalizes %s", (input, expected) => {
    expect(normalizeRobloxAssetId(input)).toBe(expected);
  });

  it.each(["", "-1", "1.5", "https://example.com/a.png", "rbxassetid://1 2"])(
    "rejects %s",
    (input) => expect(normalizeRobloxAssetId(input)).toBeNull()
  );

  it("builds the official thumbnail request", () => {
    expect(thumbnailRequestUrl("rbxassetid://1818")).toContain(
      "assetIds=1818"
    );
  });

  it("accepts only completed Roblox CDN thumbnail responses", () => {
    expect(
      parseThumbnailResponse({
        data: [{ state: "Completed", imageUrl: "https://tr.rbxcdn.com/example" }],
      })
    ).toBe("https://tr.rbxcdn.com/example");
    expect(parseThumbnailResponse({ data: [{ state: "Pending" }] })).toBeNull();
    expect(parseThumbnailResponse({ data: "bad" })).toBeNull();
  });
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm test -- app/editor/image-assets.test.ts`

Expected: FAIL because `./image-assets` does not exist.

- [x] **Step 3: Implement the pure boundary and cached resolver**

Implement:

```ts
const ASSET_PATTERN = /^(?:rbxassetid:\/\/)?([0-9]+)$/;
const thumbnailCache = new Map<string, Promise<string | null>>();

export function normalizeRobloxAssetId(input: string): string | null {
  const match = ASSET_PATTERN.exec(input.trim());
  return match ? `rbxassetid://${match[1]}` : null;
}

export function assetIdNumber(image: string): string | null {
  return normalizeRobloxAssetId(image)?.slice("rbxassetid://".length) ?? null;
}

export function thumbnailRequestUrl(image: string): string {
  const id = assetIdNumber(image);
  if (!id) throw new Error(`Invalid Roblox asset ID: ${image}`);
  const query = new URLSearchParams({
    assetIds: id,
    returnPolicy: "PlaceHolder",
    size: "420x420",
    format: "Png",
    isCircular: "false",
  });
  return `https://thumbnails.roblox.com/v1/assets?${query}`;
}

export function parseThumbnailResponse(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const data = (value as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length !== 1) return null;
  const item = data[0] as { state?: unknown; imageUrl?: unknown };
  return item.state === "Completed" &&
    typeof item.imageUrl === "string" &&
    item.imageUrl.startsWith("https://tr.rbxcdn.com/")
    ? item.imageUrl
    : null;
}

export function resolveThumbnail(image: string): Promise<string | null> {
  const canonical = normalizeRobloxAssetId(image);
  if (!canonical) return Promise.resolve(null);
  const existing = thumbnailCache.get(canonical);
  if (existing) return existing;
  const request = fetch(thumbnailRequestUrl(canonical))
    .then((response) => (response.ok ? response.json() : null))
    .then(parseThumbnailResponse)
    .catch(() => null);
  thumbnailCache.set(canonical, request);
  return request;
}
```

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- app/editor/image-assets.test.ts`

Expected: PASS with all asset-boundary cases green.

- [x] **Step 5: Commit the asset boundary**

Stage only the two task files and commit with the repository lore format. Record that thumbnail networking is fail-soft and not exercised by unit tests.

### Task 2: Scene And Persistence Contract

**Files:**
- Modify: `app/editor/catalog.ts`
- Modify: `app/editor/persistence.ts`
- Modify: `app/editor/persistence.test.ts`

- [x] **Step 1: Add failing persistence tests**

Extend the existing node fixture with optional overrides, then assert:

```ts
it("round-trips visual asset properties", () => {
  const scene = [node({
    cls: "ImageLabel",
    image: "rbxassetid://1818",
    imageColor: "#12abef",
    rotation: 15,
    stroke: { color: "#010203", transparency: 0.25, thickness: 2 },
  })];
  expect(parseSceneDocument(serializeSceneDocument(scene))).toEqual(scene);
});

it("sanitizes visual fields by class and bounds", () => {
  const result = sanitizeScene([
    node({
      cls: "ImageLabel",
      image: "1818",
      imageColor: "#abcdef",
      rotation: 999,
      stroke: { color: "#123456", transparency: 3, thickness: 200 },
    }),
    node({ cls: "TextLabel", image: "rbxassetid://9", textScaled: true, textWrapped: true }),
  ])!;
  expect(result[0]).toMatchObject({
    image: "rbxassetid://1818",
    imageColor: "#abcdef",
    rotation: 360,
    stroke: { color: "#123456", transparency: 1, thickness: 100 },
  });
  expect(result[1]).not.toHaveProperty("image");
  expect(result[1]).toMatchObject({ textScaled: true, textWrapped: true });
});
```

Add a malformed optional-field case proving an otherwise valid node survives with invalid image, color, stroke, and non-boolean text flags omitted.

- [x] **Step 2: Run persistence tests and verify RED**

Run: `npm test -- app/editor/persistence.test.ts`

Expected: FAIL because `SceneNode` and `sanitizeNode` do not preserve the new fields.

- [x] **Step 3: Add the typed optional properties**

In `catalog.ts`, add:

```ts
export type StrokeStyle = {
  color: string;
  transparency: number;
  thickness: number;
};

// Inside SceneNode
image?: string;
imageColor?: string;
rotation?: number;
textScaled?: boolean;
textWrapped?: boolean;
stroke?: StrokeStyle;
```

- [x] **Step 4: Implement import-boundary sanitization**

Import `normalizeRobloxAssetId`. In `sanitizeNode`, clamp finite rotation to
`-360..360`, accept stroke only when it is an object with a valid hex color and
finite transparency/thickness, and clamp those numeric values. Only copy image
fields for `ImageLabel`; only copy text flags when `source.text` is a string.

- [x] **Step 5: Run persistence tests and verify GREEN**

Run: `npm test -- app/editor/persistence.test.ts`

Expected: PASS, including all existing version-1 project tests.

- [x] **Step 6: Commit the contract**

Stage the three task files and commit with the lore format. State that project version 1 remains valid because every new field is optional.

### Task 3: Luau Output And Deep Copy

**Files:**
- Modify: `app/editor/scene.test.ts`
- Modify: `app/editor/scene.ts`

- [x] **Step 1: Write failing Luau and duplication tests**

Add one ImageLabel with image, imageColor, rotation, and stroke plus one
TextLabel with `textScaled: true` and `textWrapped: true`. Assert exact
generated fragments:

```ts
expect(code).toContain('el0.Image = "rbxassetid://1818"');
expect(code).toContain("el0.ImageColor3 = Color3.fromRGB(18, 171, 239)");
expect(code).toContain("el0.Rotation = 15");
expect(code).toContain('local el0_stroke = Instance.new("UIStroke")');
expect(code).toContain("el0_stroke.Color = Color3.fromRGB(1, 2, 3)");
expect(code).toContain("el0_stroke.Transparency = 0.25");
expect(code).toContain("el0_stroke.Thickness = 2");
expect(code).toContain("el0_stroke.Parent = el0");
expect(code).toContain("el1.TextScaled = true");
expect(code).toContain("el1.TextWrapped = true");
```

For duplication, mutate `clone.stroke.color` and assert the source stroke color
is unchanged.

- [x] **Step 2: Run scene tests and verify RED**

Run: `npm test -- app/editor/scene.test.ts`

Expected: FAIL on missing generated assignments and aliased stroke data.

- [x] **Step 3: Implement minimal export and cloning**

Deep-copy `stroke` beside `gradient` in `duplicateSubtree`. In `emit`, write
non-zero rotation, ImageLabel image/tint fields, enabled text flags, and a
deterministically named `UIStroke` block before parenting the visual node.

- [x] **Step 4: Run scene tests and verify GREEN**

Run: `npm test -- app/editor/scene.test.ts`

Expected: PASS with existing hierarchy, action, responsive, and export tests unchanged.

- [x] **Step 5: Commit generated-code support**

Stage `scene.ts` and `scene.test.ts` and commit with exact generated-code evidence in `Tested:`.

### Task 4: Rotation Geometry

**Files:**
- Modify: `app/editor/geometry.test.ts`
- Modify: `app/editor/geometry.ts`

- [x] **Step 1: Write failing transform-composition tests**

```ts
it("composes anchor translation and rotation", () => {
  expect(canvasGeometryStyle(node({ anchor: { x: 0.5, y: 1 }, rotation: 15 }))).toMatchObject({
    transform: "translate(-50%, -100%) rotate(15deg)",
  });
});

it("renders rotation without an anchor", () => {
  expect(canvasGeometryStyle(node({ rotation: -20 })).transform).toBe("rotate(-20deg)");
});
```

- [x] **Step 2: Run geometry tests and verify RED**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: FAIL because `GeometryNode` excludes rotation and the transform omits it.

- [x] **Step 3: Compose the transform in one function**

Include `rotation` in `GeometryNode`, build an ordered transform array, append
anchor translation first and non-zero rotation second, then join with one space.

- [x] **Step 4: Run geometry tests and verify GREEN**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: PASS for old responsive geometry and new rotation cases.

- [x] **Step 5: Commit rotation geometry**

Stage only geometry implementation and tests, then commit with the lore format.

### Task 5: Property Controls

**Files:**
- Create: `app/editor/ImageAssetField.tsx`
- Modify: `app/editor/PropertiesPanel.tsx`
- Modify: `e2e/editor-full.spec.ts`

- [x] **Step 1: Add a failing browser slice for property editing**

At the beginning of the full journey, click Components, add an ImageLabel, and
assert these accessible controls exist and behave:

```ts
await page.getByRole("button", { name: /ImageLabel/ }).click();
const assetId = page.getByRole("textbox", { name: "Roblox asset ID" });
await assetId.fill("https://example.com/a.png");
await expect(page.getByText("Enter a numeric Roblox asset ID.")).toBeVisible();
await assetId.fill("1818");
await expect(page.getByLabel("Client Luau code")).toContainText(
  'Image = "rbxassetid://1818"'
);
await page.getByRole("checkbox", { name: "Enable stroke" }).check();
await page.getByRole("spinbutton", { name: "Rotation" }).fill("15");
```

Select `[data-node-id="title"]`, check the `Scale text to fit` and `Wrap text`
checkboxes, and assert client Luau contains `TextScaled = true` and
`TextWrapped = true`.

- [x] **Step 2: Run the full browser test and verify RED**

Run: `npm run build && npx playwright test e2e/editor-full.spec.ts`

Expected: FAIL because the new controls are absent.

- [x] **Step 3: Implement `ImageAssetField` local-draft validation**

Use `useEffect` and `useState`. Reset the draft when `node.id` or committed
image changes. Empty input commits `undefined`; valid input commits the
canonical value; invalid input displays exactly `Enter a numeric Roblox asset ID.`
without calling `onCommit`.

- [x] **Step 4: Add type-specific property groups**

In `PropertiesPanel.tsx`:

- add an accessible Rotation `NumberInput` for non-ScreenGui nodes;
- add Image Asset ID and ImageColor3 for ImageLabel;
- add TextScaled and TextWrapped checkboxes inside Text;
- add Enable stroke plus color, transparency, and thickness controls for all
  non-ScreenGui visual nodes;
- use the default stroke from the approved design when enabling it.

Give `NumberInput` an optional `ariaLabel` prop so the browser journey does not
depend on visual layout to identify Rotation and Stroke thickness.

- [x] **Step 5: Rebuild and rerun the browser test for GREEN**

Run: `npm run build && npx playwright test e2e/editor-full.spec.ts`

Expected: property-control assertions pass; the ImageLabel displays its asset
ID placeholder because thumbnail rendering is intentionally introduced in Task 6.

- [x] **Step 6: Commit property controls**

Stage the new field, property panel, and browser test. Commit with the lore format and state that live thumbnail success is not yet claimed.

### Task 6: Thumbnail And Canvas Preview

**Files:**
- Modify: `app/editor/image-assets.test.ts`
- Modify: `app/editor/image-assets.ts`
- Modify: `app/editor/Canvas.tsx`
- Modify: `e2e/editor-full.spec.ts`

- [x] **Step 1: Add failing stable-preview tests**

Extend pure tests to prove an invalid CDN host is rejected. In Playwright,
route `https://thumbnails.roblox.com/**` to return a deterministic completed
response with `imageUrl: "https://tr.rbxcdn.com/editor-test.png"`. Route that
CDN URL with `contentType: "image/png"` and body
`Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64")`.
Assert the selected ImageLabel exposes `data-image-state="loaded"`. In a
second page reload, return a successful API response with state `Pending` and
assert `data-image-state="unavailable"`; the editor controls and Luau output
must remain usable without creating an expected browser console error.

- [x] **Step 2: Run focused tests and verify RED**

Run: `npm test -- app/editor/image-assets.test.ts && npx playwright test e2e/editor-full.spec.ts`

Expected: FAIL because Canvas has no thumbnail state or visual rendering.

- [x] **Step 3: Implement a focused thumbnail hook**

Place `useRobloxThumbnail(image?: string)` in `Canvas.tsx` so
`image-assets.ts` stays pure apart from its explicit cached fetch function. Use
an effect cancellation flag so stale responses cannot replace the current ID.
Return `idle | loading | loaded | unavailable` plus the URL.

- [x] **Step 4: Render canvas approximations**

For ImageLabel, render an absolutely positioned decorative `<img alt="">` only
when loaded, otherwise render an ID placeholder. Apply ImageColor3 as an overlay
using `mix-blend-mode: multiply` so the original thumbnail URL remains untouched.
Apply stroke as inset box-shadow; apply text stroke as four-direction text-shadow.
Set `containerType: "inline-size"` on visual nodes. For `textScaled`, use
`fontSize: clamp(10px, 8cqw, ${node.textSize ?? 14}px)`; for `textWrapped`, use
`whiteSpace: "normal"` and `overflowWrap: "anywhere"`, otherwise preserve the
existing single-line behavior.

Do not use `next/image`: the CDN URL is runtime-resolved, the editor box already
defines dimensions, and avoiding the optimizer prevents an extra remote-host
configuration and request layer.

- [x] **Step 5: Run focused unit and browser tests for GREEN**

Run: `npm test -- app/editor/image-assets.test.ts && npx playwright test e2e/editor-full.spec.ts`

Expected: PASS for loaded and unavailable preview states with zero console errors.

- [x] **Step 6: Commit canvas preview**

Stage only Task 6 files and commit with the lore format. Record that Roblox
thumbnail availability is external and the fallback is the product guarantee.

### Task 7: Full Regression And Release Proof

**Files:**
- Modify: `docs/superpowers/plans/2026-06-20-visual-assets-p0.md`

- [x] **Step 1: Complete the full browser journey**

Extend `e2e/editor-full.spec.ts` to verify:

- asset ID, tint, rotation, stroke, and text flags persist after reload;
- Undo/Redo restores the previous canonical asset ID;
- exported JSON contains the canonical fields;
- importing that JSON restores all controls;
- client Luau contains all exact assignments;
- ZIP `project.json` and client Luau contain the same values;
- no horizontal overflow or console errors are introduced.

- [x] **Step 2: Run the focused editor suites**

Run:

```bash
npm test -- app/editor/image-assets.test.ts app/editor/persistence.test.ts app/editor/scene.test.ts app/editor/geometry.test.ts
```

Expected: all focused Vitest files pass with zero failures.

- [x] **Step 3: Run the full unit suite**

Run: `npm test`

Expected: every Vitest file passes with zero failures.

- [x] **Step 4: Run TypeScript and production build sequentially**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: both commands exit 0; production routes generate successfully.

- [x] **Step 5: Run smoke and full browser suites against the fresh build**

Run:

```bash
npm run test:e2e:smoke
npm run test:e2e:full
```

Expected: both Playwright suites pass with zero browser console errors.

- [x] **Step 6: Inspect the final diff and plan coverage**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD~1..HEAD
```

Review every approved requirement against the implementation. Do not stage or
modify the user's existing `.gitignore`, `.superpowers/`, or
`docs/youtube-60s-script.md` changes.

- [x] **Step 7: Record evidence and commit release proof**

Update this plan's checkboxes and append the exact test counts and commands.
Commit only the plan update with the lore format. `Not-tested:` must mention
live private assets and Roblox Studio runtime behavior.

## Execution Evidence

- Baseline: 11 Vitest files, 160 tests passed before implementation.
- Asset boundary: `npm test -- app/editor/image-assets.test.ts` — 9 passed.
- Persistence: `npm test -- app/editor/persistence.test.ts` — 28 passed.
- Scene export: `npm test -- app/editor/scene.test.ts` — 42 passed.
- Geometry: `npm test -- app/editor/geometry.test.ts` — 27 passed.
- Focused final: 4 Vitest files, 106 tests passed.
- Full unit: 12 Vitest files, 176 tests passed.
- TypeScript: `npx tsc --noEmit` exited 0.
- Production: `npm run build` generated 42 routes and exited 0.
- Smoke browser: 3 tests passed.
- Full browser: 2 tests passed.
- React review: no hook, accessibility, component-boundary, or TypeScript
  issues remained after the final TSX review.
- Not tested: private/authenticated Roblox image assets, live API rate-limit
  behavior, and pixel/runtime parity inside Roblox Studio.
