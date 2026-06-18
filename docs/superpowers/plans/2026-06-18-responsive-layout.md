# Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Roblox-native Scale/Offset, AnchorPoint, aspect ratio, and min/max size editing while preserving existing scenes.

**Architecture:** Extend `SceneNode` with optional geometry fields and centralize all CSS geometry, anchor compensation, alignment, and validation in a pure `geometry.ts` module. Existing React components consume that module, while `scene.ts` remains responsible for deterministic Luau generation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest.

---

## File Map

- Create `app/editor/geometry.ts`: pure layout math, CSS values, validation, and alignment patches.
- Create `app/editor/geometry.test.ts`: responsive geometry and validation unit tests.
- Modify `app/editor/catalog.ts`: optional responsive fields on `SceneNode`.
- Modify `app/editor/Editor.tsx`: deep cloning and localStorage sanitization.
- Modify `app/editor/scene.ts`: subtree cloning and Luau export.
- Modify `app/editor/scene.test.ts`: Luau and duplication regression coverage.
- Modify `app/editor/Canvas.tsx`: apply generated geometry styles.
- Modify `app/editor/PropertiesPanel.tsx`: four-value editors, anchors, presets, and constraints.

### Task 1: Responsive Geometry Contract

**Files:**
- Create: `app/editor/geometry.ts`
- Create: `app/editor/geometry.test.ts`
- Modify: `app/editor/catalog.ts`

- [ ] **Step 1: Add failing geometry tests**

Test these APIs before they exist:

```ts
import { describe, expect, it } from "vitest";
import {
  alignNode,
  canvasGeometryStyle,
  setAnchorPreservingPosition,
  validSizeConstraints,
} from "./geometry";

describe("canvasGeometryStyle", () => {
  it("combines scale, offset, and anchor", () => {
    expect(canvasGeometryStyle({
      pos: { x: 0.5, y: 0.25 },
      posOffset: { x: 12, y: -4 },
      size: { x: 0.4, y: 0.2 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 0.5, y: 1 },
    })).toMatchObject({
      left: "calc(50% + 12px)",
      top: "calc(25% - 4px)",
      width: "calc(40% + 20px)",
      height: "calc(20% + 10px)",
      transform: "translate(-50%, -100%)",
    });
  });
});

describe("setAnchorPreservingPosition", () => {
  it("compensates scale and offset", () => {
    expect(setAnchorPreservingPosition({
      pos: { x: 0.2, y: 0.3 },
      posOffset: { x: 4, y: 8 },
      size: { x: 0.4, y: 0.2 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 0, y: 0 },
    }, { x: 0.5, y: 1 })).toEqual({
      anchor: { x: 0.5, y: 1 },
      pos: { x: 0.4, y: 0.5 },
      posOffset: { x: 14, y: 18 },
    });
  });
});

describe("alignNode", () => {
  it("centers with zero offsets", () => {
    expect(alignNode({ x: 0.5, y: 0.5 })).toEqual({
      anchor: { x: 0.5, y: 0.5 },
      pos: { x: 0.5, y: 0.5 },
      posOffset: { x: 0, y: 0 },
    });
  });
});

it("rejects max size below min size", () => {
  expect(validSizeConstraints({ x: 400, y: 200 }, { x: 300, y: 300 })).toBe(false);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: FAIL because `./geometry` does not exist.

- [ ] **Step 3: Extend `SceneNode`**

Add:

```ts
posOffset?: { x: number; y: number };
sizeOffset?: { x: number; y: number };
anchor?: { x: number; y: number };
aspectRatio?: number;
minSize?: { x: number; y: number };
maxSize?: { x: number; y: number };
```

- [ ] **Step 4: Implement minimal pure geometry APIs**

Use finite-number checks, `0..1` anchor clamping, two-decimal scale rounding, integer pixel rounding, `calc(...)` CSS formatting, and width-dominant `aspectRatio` styling. `canvasGeometryStyle` must also emit `minWidth`, `minHeight`, `maxWidth`, and `maxHeight` when present.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: all geometry tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/editor/catalog.ts app/editor/geometry.ts app/editor/geometry.test.ts
git commit -m "Add responsive GUI geometry primitives"
```

### Task 2: Persistence and Clone Compatibility

**Files:**
- Modify: `app/editor/Editor.tsx`
- Modify: `app/editor/scene.ts`
- Test: `app/editor/geometry.test.ts`
- Test: `app/editor/scene.test.ts`

- [ ] **Step 1: Add failing sanitization and duplication tests**

Export `sanitizeResponsiveGeometry(raw)` from `geometry.ts`. Verify valid optional vectors survive, invalid values are omitted, anchor values clamp to `0..1`, ratio must be positive, and invalid min/max pairs are omitted together. Extend the duplication test so mutating a clone's `posOffset`, `sizeOffset`, `anchor`, `minSize`, or `maxSize` does not mutate the source.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- app/editor/geometry.test.ts app/editor/scene.test.ts`

Expected: FAIL on missing sanitizer and shared optional-vector references.

- [ ] **Step 3: Implement compatibility**

- Merge `sanitizeResponsiveGeometry(n)` into `sanitizeNode` after core node validation.
- Deep-clone every optional vector in `cloneScene`.
- Deep-clone every optional vector in `duplicateSubtree`.
- Leave absent fields absent so old scenes serialize without mechanical churn.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- app/editor/geometry.test.ts app/editor/scene.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/editor/Editor.tsx app/editor/scene.ts app/editor/geometry.ts app/editor/geometry.test.ts app/editor/scene.test.ts
git commit -m "Keep responsive layout state backward compatible"
```

### Task 3: Roblox Luau Export

**Files:**
- Modify: `app/editor/scene.ts`
- Test: `app/editor/scene.test.ts`

- [ ] **Step 1: Add failing Luau tests**

Create a node containing offsets, anchor, aspect ratio, min size, and max size. Assert output includes:

```lua
.Position = UDim2.new(0.5, 12, 0.25, -4)
.Size = UDim2.new(0.4, 20, 0.2, 10)
.AnchorPoint = Vector2.new(0.5, 1)
Instance.new("UIAspectRatioConstraint")
.AspectRatio = 1.778
.DominantAxis = Enum.DominantAxis.Width
Instance.new("UISizeConstraint")
.MinSize = Vector2.new(320, 180)
.MaxSize = Vector2.new(960, 540)
```

Add a scale-only test that expects `UDim2.new(scale, 0, scale, 0)` and no constraint instances.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/editor/scene.test.ts`

Expected: FAIL because export still uses `UDim2.fromScale` and emits no constraints.

- [ ] **Step 3: Implement Luau generation**

Add `vector2` and four-value UDim formatting helpers. Emit AnchorPoint only when non-zero. Create aspect and size constraint instances immediately before assigning the GUI object's parent, using the existing generated variable name as the constraint prefix.

- [ ] **Step 4: Run test and verify GREEN**

Run: `npm test -- app/editor/scene.test.ts`

Expected: all scene tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/editor/scene.ts app/editor/scene.test.ts
git commit -m "Export responsive geometry as Roblox Luau"
```

### Task 4: Canvas Rendering

**Files:**
- Modify: `app/editor/Canvas.tsx`
- Test: `app/editor/geometry.test.ts`

- [ ] **Step 1: Expand failing CSS style tests**

Assert aspect ratio makes the returned height `auto`, width remains the four-value expression, and min/max vectors become pixel CSS properties. Assert scale-only input produces the existing percentage geometry and no transform.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: FAIL for missing aspect and constraint style behavior.

- [ ] **Step 3: Apply pure geometry style in Canvas**

Replace manual `left`, `top`, `width`, and `height` construction in `NodeView` with `canvasGeometryStyle(node)`. Apply position only for non-flow children. Preserve background, z-index, border radius, visibility, selection handles, and Preview behavior.

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test -- app/editor/geometry.test.ts && npx tsc --noEmit`

Expected: tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add app/editor/Canvas.tsx app/editor/geometry.ts app/editor/geometry.test.ts
git commit -m "Render responsive geometry on the editor canvas"
```

### Task 5: Properties Panel Controls

**Files:**
- Modify: `app/editor/PropertiesPanel.tsx`
- Modify: `app/editor/geometry.ts`
- Test: `app/editor/geometry.test.ts`

- [ ] **Step 1: Add failing preset and validation tests**

Test all nine `{0, 0.5, 1}` alignment pairs with `it.each`. Test valid ratio, invalid ratio, non-negative bounds, and equal min/max bounds. Test anchor compensation when optional offsets are absent.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/editor/geometry.test.ts`

Expected: FAIL on uncovered validation or preset behavior.

- [ ] **Step 3: Implement the four-value editor**

Create a private `UDim2Input` component in `PropertiesPanel.tsx` that renders X/Y rows with Scale and Offset number inputs. Position and Size use zero offsets when absent and remove the optional field when both offsets return to zero.

- [ ] **Step 4: Implement anchors and presets**

Anchor numeric changes call `setAnchorPreservingPosition(node, nextAnchor)` and pass the complete patch to `onChange`. Nine preset buttons call `alignNode({x, y})`, expose descriptive `aria-label` values, and show the active anchor.

- [ ] **Step 5: Implement constraint toggles**

- Aspect toggle initializes to `16 / 9`; disabling sets `aspectRatio: undefined`.
- Size toggle initializes `minSize` to `{x: 0, y: 0}` and `maxSize` to `{x: 1920, y: 1080}`; disabling clears both.
- Numeric updates only call `onChange` when validation succeeds.
- Show “Width controls height” beneath the ratio input.

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test && npx tsc --noEmit`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 7: Commit**

```bash
git add app/editor/PropertiesPanel.tsx app/editor/geometry.ts app/editor/geometry.test.ts
git commit -m "Add Roblox-native responsive layout controls"
```

### Task 6: Production Verification

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] **Step 1: Run automated gates**

```bash
git diff --check
npm test
npx tsc --noEmit
npm run build
```

Expected: zero test failures, TypeScript exit 0, build exit 0, and no whitespace errors.

- [ ] **Step 2: Run production browser verification**

Start `next start` on an unused port. In `/editor?template=main-menu`:

1. Select a button from Hierarchy.
2. Enter non-zero Position and Size offsets.
3. Change AnchorPoint and verify the element does not jump.
4. Apply center and top-right presets.
5. Enable aspect and size constraints.
6. Switch Desktop, Tablet, and Mobile.
7. Undo and redo.
8. Navigate to `/editor` and confirm saved values restore.
9. Confirm generated Luau contains the matching values.
10. Confirm browser console has zero errors.

- [ ] **Step 3: Run React best-practices review**

Review edited TSX files for semantic controls, keyboard labels, stable keys, colocated state, and unnecessary effects. Apply only scoped fixes and rerun Step 1 if code changes.

- [ ] **Step 4: Commit verification fixes if needed**

```bash
git add app/editor
git commit -m "Polish responsive layout verification findings"
```

- [ ] **Step 5: Finish the development branch**

Use `superpowers:finishing-a-development-branch`, merge locally only after merged-result verification, and preserve unrelated main-worktree changes.
