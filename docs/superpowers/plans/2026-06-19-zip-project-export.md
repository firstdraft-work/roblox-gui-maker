# ZIP Project Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-generated ZIP download containing the portable scene document, generated Luau, and Roblox Studio installation instructions.

**Architecture:** A pure `project-package.ts` module assembles named UTF-8 files and delegates ZIP encoding to `fflate`. `Editor` turns the returned bytes into a browser download, while `CodePanel` exposes the action beside existing Luau exports.

**Tech Stack:** TypeScript, React 19, Next.js 16 App Router, fflate, Vitest, Playwright

---

### Task 1: Package assembly

**Files:**
- Create: `app/editor/project-package.ts`
- Create: `app/editor/project-package.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add the ZIP dependency**

Run: `npm install fflate`

Expected: `fflate` appears under `dependencies` and the lockfile resolves it.

- [ ] **Step 2: Write failing package-content tests**

Create tests that call the wished-for API and decode the result with `unzipSync`:

```ts
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { SAMPLE_SCENE } from "./catalog";
import { createProjectPackage } from "./project-package";

describe("createProjectPackage", () => {
  it("packages the scene, client code, and installation guide", () => {
    const result = createProjectPackage(SAMPLE_SCENE, "client code", null);
    const files = unzipSync(result.bytes);

    expect(result.filename).toBe("game-menu.zip");
    expect(strFromU8(files["project.json"])).toContain('"format": "roblox-gui-maker"');
    expect(strFromU8(files["roblox-gui.client.lua"])).toBe("client code");
    expect(strFromU8(files["README.md"])).toContain("StarterGui");
    expect(files["roblox-gui.server.lua"]).toBeUndefined();
  });

  it("includes server installation output only when generated", () => {
    const files = unzipSync(
      createProjectPackage(SAMPLE_SCENE, "client code", "server code").bytes
    );

    expect(strFromU8(files["roblox-gui.server.lua"])).toBe("server code");
    expect(strFromU8(files["README.md"])).toContain("ServerScriptService");
  });
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `npm test -- app/editor/project-package.test.ts`

Expected: FAIL because `./project-package` does not exist.

- [ ] **Step 4: Implement the package builder**

Create `createProjectPackage(scene, clientCode, serverCode)` using `zipSync` and `strToU8`. Derive the archive name by replacing the `.json` suffix from `sceneDocumentFilename(scene)` with `.zip`. Always include `README.md`, `project.json`, and `roblox-gui.client.lua`; include `roblox-gui.server.lua` only when `serverCode` is non-null. The README must direct the client script to `StarterGui` and the optional server script to `ServerScriptService`.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `npm test -- app/editor/project-package.test.ts`

Expected: both package-content tests PASS.

- [ ] **Step 6: Commit the package core**

Stage only `package.json`, `package-lock.json`, and the two `project-package` files. Commit using the repository lore format, recording `fflate` as the chosen dependency and `.rbxmx` as rejected until Studio validation is available.

### Task 2: Editor download action

**Files:**
- Modify: `app/editor/CodePanel.tsx`
- Modify: `app/editor/Editor.tsx`
- Modify: `app/editor/project-package.test.ts`

- [ ] **Step 1: Add a failing fallback-filename test**

Use a root scene whose name cannot produce an ASCII slug and assert `createProjectPackage(...).filename === "roblox-gui-project.zip"`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- app/editor/project-package.test.ts`

Expected: FAIL if archive naming does not correctly reuse the JSON filename fallback.

- [ ] **Step 3: Complete filename behavior and add the UI callback**

Add `onDownloadPackage: () => void` to `CodePanel` and render a labelled `Download ZIP` button in the export action group. In `Editor`, call `createProjectPackage(scene, clientCode, serverCode)`, create an `application/zip` Blob, click a temporary anchor with the returned filename, and revoke the object URL.

- [ ] **Step 4: Run package tests and type checking**

Run: `npm test -- app/editor/project-package.test.ts && npx tsc --noEmit`

Expected: tests PASS and TypeScript exits zero.

- [ ] **Step 5: Commit the editor integration**

Stage only `CodePanel.tsx`, `Editor.tsx`, and the package test update. Commit using the lore format with the existing individual exports recorded as a compatibility constraint.

### Task 3: Browser download regression

**Files:**
- Modify: `e2e/editor-full.spec.ts`

- [ ] **Step 1: Write the failing Playwright assertion**

Before the individual Luau download assertions, click `Download ZIP`, assert the suggested filename is `game-menu.zip`, read the downloaded bytes, decode with `unzipSync`, and assert the client and server entries contain the already-configured Teleport behavior.

- [ ] **Step 2: Run the full browser spec and verify RED**

Run: `npm run test:e2e:full`

Expected: FAIL because the ZIP action is not yet exposed, or because its archive contract differs from the assertion.

- [ ] **Step 3: Make the minimum accessibility or wiring correction**

If needed, adjust only the button's accessible name or callback wiring so Playwright observes the user-facing download contract. Do not alter existing single-file export behavior.

- [ ] **Step 4: Re-run the full browser spec and verify GREEN**

Run: `npm run test:e2e:full`

Expected: the complete editor journey PASSes with no console errors.

- [ ] **Step 5: Commit the browser regression**

Stage `e2e/editor-full.spec.ts` and any narrowly required UI correction. Commit using the lore format.

### Task 4: Full verification and documentation state

**Files:**
- Modify: `docs/superpowers/plans/2026-06-19-zip-project-export.md`

- [ ] **Step 1: Run all verification gates**

Run sequentially:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:e2e:smoke
npm run test:e2e:full
git diff --check
```

Expected: all commands exit zero; Vitest, both Playwright suites, type checking, and production build pass.

- [ ] **Step 2: Mark completed plan checkboxes**

Change only completed `- [ ]` markers in this plan to `- [x]`, preserving the commands and expected evidence.

- [ ] **Step 3: Commit verification evidence**

Commit the checked plan using the lore format. Record Roblox Studio import as not tested because the required application and published experience remain unavailable.

- [ ] **Step 4: Push and verify remote CI**

Push `main` to `origin`, wait for the corresponding CI workflow to complete, and report its run result. Do not claim live Roblox runtime validation.
