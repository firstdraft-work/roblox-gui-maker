# Scene JSON Portability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe, versioned scene JSON import/export and correct Chinese language annotation and outdated exporter copy.

**Architecture:** Extract the existing localStorage sanitizer into a pure `persistence.ts` boundary, then build versioned project-document parsing and serialization on that same boundary. `Editor` owns atomic scene replacement and history, while `Toolbar` owns the browser file picker; static content corrections remain isolated from editor logic.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, browser `File`/`Blob` APIs.

---

## File Map

- Create `app/editor/persistence.ts`: scene sanitization, graph repair, project document parsing, serialization, and filenames.
- Create `app/editor/persistence.test.ts`: sanitizer and versioned document unit coverage.
- Modify `app/editor/Editor.tsx`: consume shared persistence APIs, atomic import, history integration, export download, and error state.
- Modify `app/editor/Toolbar.tsx`: accessible JSON import/export controls and import error display.
- Modify `app/zh/page.tsx`: annotate Chinese content with `lang="zh-CN"` and correct exporter copy.
- Modify `app/page.tsx`: correct structured data and body exporter copy.
- Modify `app/about/page.tsx`: correct exporter copy.
- Modify `README.md`: correct current exporter description.

### Task 1: Shared Scene Sanitization Boundary

**Files:**
- Create: `app/editor/persistence.ts`
- Create: `app/editor/persistence.test.ts`
- Modify: `app/editor/Editor.tsx`

- [ ] **Step 1: Write failing sanitizer tests**

Create `app/editor/persistence.test.ts` with real scene data:

```ts
import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import { sanitizeScene } from "./persistence";

const node = (overrides: Partial<SceneNode>): SceneNode => ({
  id: "node",
  cls: "Frame",
  name: "Node",
  parentId: null,
  pos: { x: 0, y: 0 },
  size: { x: 1, y: 1 },
  color: "#000000",
  transparency: 0,
  cornerRadius: 0,
  zindex: 1,
  ...overrides,
});

describe("sanitizeScene", () => {
  it("sanitizes responsive geometry without sharing vector references", () => {
    const raw = [node({
      id: "root",
      cls: "ScreenGui",
      posOffset: { x: 12.4, y: -3.6 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 2, y: -1 },
      minSize: { x: 320, y: 180 },
      maxSize: { x: 960, y: 540 },
    })];

    const scene = sanitizeScene(raw)!;
    scene[0].posOffset!.x = 99;

    expect(raw[0].posOffset?.x).toBe(12.4);
    expect(scene[0]).toMatchObject({
      posOffset: { x: 99, y: -4 },
      anchor: { x: 1, y: 0 },
      minSize: { x: 320, y: 180 },
      maxSize: { x: 960, y: 540 },
    });
  });

  it("drops invalid nodes, orphan parents, and cycles", () => {
    const raw = [
      node({ id: "a", parentId: "b" }),
      node({ id: "b", parentId: "a" }),
      node({ id: "orphan", parentId: "missing" }),
      { id: "bad", cls: "Bogus" },
    ];

    const scene = sanitizeScene(raw)!;

    expect(scene.map((item) => item.id)).toEqual(["a", "b", "orphan"]);
    expect(scene.find((item) => item.id === "orphan")?.parentId).toBeNull();
    expect(scene.some((item) => item.id === "a" && item.parentId === null)).toBe(true);
  });

  it("rejects non-arrays and scenes with no valid nodes", () => {
    expect(sanitizeScene({})).toBeNull();
    expect(sanitizeScene([{ id: "bad" }])).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- app/editor/persistence.test.ts`

Expected: FAIL because `./persistence` does not exist.

- [ ] **Step 3: Implement the pure sanitizer**

Create `app/editor/persistence.ts`. Move `VALID_CLS`, finite/hex checks, `sanitizeNode`, and parent repair from `Editor.tsx`. Export this public boundary:

```ts
export function sanitizeScene(raw: unknown): SceneNode[] | null {
  if (!Array.isArray(raw)) return null;
  const scene = raw
    .map(sanitizeNode)
    .filter((node): node is SceneNode => node !== null);
  if (scene.length === 0) return null;
  repairParents(scene);
  return scene;
}
```

Keep the existing `sanitizeResponsiveGeometry`, font allowlist, color checks,
action restrictions, clamping, rounding, orphan repair, and cycle repair exactly
as the current `Editor.tsx` behavior defines them.

- [ ] **Step 4: Make localStorage consume `sanitizeScene`**

In `Editor.tsx`, delete the moved sanitizer code, import `sanitizeScene`, and change `loadSaved` to:

```ts
const parsed = JSON.parse(raw) as Partial<Saved>;
const scene = sanitizeScene(parsed.scene);
if (!scene) return null;
const ids = new Set(scene.map((node) => node.id));
const selectedId =
  typeof parsed.selectedId === "string" && ids.has(parsed.selectedId)
    ? parsed.selectedId
    : null;
return { scene, selectedId };
```

- [ ] **Step 5: Run focused and regression tests**

Run: `npm test -- app/editor/persistence.test.ts app/editor/geometry.test.ts app/editor/scene.test.ts && npx tsc --noEmit`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit**

```bash
git add app/editor/persistence.ts app/editor/persistence.test.ts app/editor/Editor.tsx
git commit -m "Share scene sanitization across persistence inputs"
```

### Task 2: Versioned Project Document Codec

**Files:**
- Modify: `app/editor/persistence.ts`
- Modify: `app/editor/persistence.test.ts`

- [ ] **Step 1: Add failing codec tests**

Append these cases to `persistence.test.ts`:

```ts
import {
  parseSceneDocument,
  sceneDocumentFilename,
  serializeSceneDocument,
} from "./persistence";

describe("scene project documents", () => {
  it("round-trips responsive geometry and actions", () => {
    const scene = [
      node({ id: "root", cls: "ScreenGui", name: "Main Menu" }),
      node({
        id: "play",
        cls: "TextButton",
        name: "Play",
        parentId: "root",
        posOffset: { x: 12, y: -4 },
        sizeOffset: { x: 20, y: 10 },
        anchor: { x: 0.5, y: 1 },
        aspectRatio: 16 / 9,
        minSize: { x: 320, y: 180 },
        maxSize: { x: 960, y: 540 },
        action: { type: "hideGui" },
      }),
    ];

    const text = serializeSceneDocument(scene);

    expect(JSON.parse(text)).toMatchObject({
      format: "roblox-gui-maker",
      version: 1,
    });
    expect(parseSceneDocument(text)).toEqual(scene);
  });

  it.each([
    ["invalid JSON", "{"],
    ["wrong format", JSON.stringify({ format: "other", version: 1, scene: [] })],
    ["unsupported version", JSON.stringify({ format: "roblox-gui-maker", version: 2, scene: [] })],
    ["empty scene", JSON.stringify({ format: "roblox-gui-maker", version: 1, scene: [] })],
  ])("rejects %s", (_label, text) => {
    expect(() => parseSceneDocument(text)).toThrowError();
  });

  it("derives safe filenames with a stable fallback", () => {
    expect(sceneDocumentFilename([node({ cls: "ScreenGui", name: "Main Menu!" })]))
      .toBe("main-menu.json");
    expect(sceneDocumentFilename([node({ name: "Frame" })]))
      .toBe("roblox-gui-project.json");
  });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- app/editor/persistence.test.ts`

Expected: FAIL because the codec exports do not exist.

- [ ] **Step 3: Implement the codec**

Add exact document identity and parsing errors:

```ts
const PROJECT_FORMAT = "roblox-gui-maker";
const PROJECT_VERSION = 1;

export function parseSceneDocument(text: string): SceneNode[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!raw || typeof raw !== "object") {
    throw new Error("This is not a Roblox GUI Maker project.");
  }
  const document = raw as Record<string, unknown>;
  if (document.format !== PROJECT_FORMAT) {
    throw new Error("This is not a Roblox GUI Maker project.");
  }
  if (document.version !== PROJECT_VERSION) {
    throw new Error(`Project version ${String(document.version)} is not supported.`);
  }
  const scene = sanitizeScene(document.scene);
  if (!scene) throw new Error("The project contains no valid GUI elements.");
  return scene;
}

export function serializeSceneDocument(scene: SceneNode[]): string {
  return JSON.stringify(
    { format: PROJECT_FORMAT, version: PROJECT_VERSION, scene },
    null,
    2
  );
}

export function sceneDocumentFilename(scene: SceneNode[]): string {
  const rootName = scene.find((node) => node.cls === "ScreenGui" && !node.parentId)?.name;
  const slug = rootName
    ?.normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${slug}.json` : "roblox-gui-project.json";
}
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- app/editor/persistence.test.ts && npx tsc --noEmit`

Expected: codec tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add app/editor/persistence.ts app/editor/persistence.test.ts
git commit -m "Add versioned scene project documents"
```

### Task 3: Editor Import and Export Controls

**Files:**
- Modify: `app/editor/Editor.tsx`
- Modify: `app/editor/Toolbar.tsx`

- [ ] **Step 1: Read current Next.js client-component guidance**

Read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` before editing TSX. Preserve the existing client boundary and serializable server-to-client props.

- [ ] **Step 2: Add project export to `Editor`**

Import `parseSceneDocument`, `sceneDocumentFilename`, and `serializeSceneDocument`. Add:

```ts
function downloadProject() {
  const text = serializeSceneDocument(scene);
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = sceneDocumentFilename(scene);
  link.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 3: Add atomic import and history integration**

Add `importError` state and an async callback:

```ts
const [importError, setImportError] = useState<string | null>(null);

async function importProject(file: File) {
  setImportError(null);
  try {
    const imported = parseSceneDocument(await file.text());
    mutate(() => imported, true);
    const root = imported.find(
      (node) => node.cls === "ScreenGui" && !node.parentId
    );
    setSelectedId(root?.id ?? imported[0].id);
    setPreviewVisibility(null);
  } catch (error) {
    setImportError(
      error instanceof Error ? error.message : "Could not import this project."
    );
  }
}
```

The catch path must not call `mutate`, `setScene`, or alter history.

- [ ] **Step 4: Add accessible Toolbar controls**

Extend `Toolbar` props with:

```ts
onImportProject: (file: File) => void;
onExportProject: () => void;
importError: string | null;
```

Add `Upload` and `FileJson` to the existing `lucide-react` import, and add
`relative` to the header class so the alert can be positioned below it.

Add an `Upload` icon button backed by a visually hidden input:

```tsx
<label className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-dim hover:bg-raised hover:text-ink">
  <Upload className="h-4 w-4" />
  Import JSON
  <input
    type="file"
    accept="application/json,.json"
    className="sr-only"
    onChange={(event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) onImportProject(file);
    }}
  />
</label>
<button
  type="button"
  onClick={onExportProject}
  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink"
>
  <FileJson className="h-4 w-4" />
  Export JSON
</button>
```

Render the error immediately before `</header>` so the fixed toolbar height does not change:

```tsx
{importError && (
  <p
    role="alert"
    className="absolute right-4 top-full z-50 mt-2 max-w-sm rounded-md border border-danger/40 bg-panel px-3 py-2 text-xs text-danger shadow-lg"
  >
    {importError}
  </p>
)}
```

- [ ] **Step 5: Wire Toolbar props from `Editor`**

Pass `importProject`, `downloadProject`, and `importError`. Keep the existing Luau clipboard export and `.lua` download behavior unchanged.

- [ ] **Step 6: Run regression gates**

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all tests PASS, TypeScript exits 0, and the Next.js production build exits 0.

- [ ] **Step 7: Commit**

```bash
git add app/editor/Editor.tsx app/editor/Toolbar.tsx
git commit -m "Add scene project import and export controls"
```

### Task 4: Language and Exporter Copy Corrections

**Files:**
- Modify: `app/zh/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `README.md`

- [ ] **Step 1: Correct the Chinese content language annotation**

Wrap the Chinese page-owned content, excluding the shared English navigation and footer, with a semantic container:

```tsx
<main lang="zh-CN">
  {/* existing Chinese sections */}
</main>
```

The existing page already has one `<main>`; add only the `lang` attribute.

- [ ] **Step 2: Correct current exporter descriptions**

Change product descriptions of generated positioning from `UDim2.fromScale` to explicit `UDim2.new` in:

- `app/page.tsx` structured-data feature list and comparison paragraph.
- `app/about/page.tsx` comparison paragraph.
- `app/zh/page.tsx` comparison paragraph.
- `README.md` product summary.

Do not change tutorial snippets in `app/guides/guides-data.ts`, because those intentionally teach Roblox's valid `UDim2.fromScale` API.

- [ ] **Step 3: Verify content and build**

Run:

```bash
rg -n "Exports clean Luau.*UDim2\.fromScale|exported Luau.*UDim2\.fromScale|真实的 Instance.new、UDim2\.fromScale" app README.md
npm test
npx tsc --noEmit
npm run build
```

Expected: `rg` returns no product-copy matches, all tests PASS, TypeScript exits 0, and build exits 0.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/about/page.tsx app/zh/page.tsx README.md
git commit -m "Align language and exporter product copy"
```

### Task 5: Production Browser Verification

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] **Step 1: Run final automated gates**

Run:

```bash
git diff --check
npm test
npx tsc --noEmit
npm run build
```

Expected: zero whitespace errors, all tests PASS, TypeScript exits 0, and build exits 0.

- [ ] **Step 2: Start the production server**

Run `npm run start -- -p 4173` after the successful build.

- [ ] **Step 3: Verify project export**

Open `/editor?template=main-menu` at desktop width. Click `Export JSON` and confirm the download:

- Has filename `main-menu.json`.
- Parses to `format: "roblox-gui-maker"` and `version: 1`.
- Contains responsive optional geometry when present.

- [ ] **Step 4: Verify valid import and history**

Import a valid project whose root name and one button offset differ from the current scene. Confirm:

- Canvas and Luau update to the imported values.
- The imported root is selected.
- Undo restores the previous scene.
- Redo restores the imported scene.
- Refresh restores the imported scene from localStorage.

- [ ] **Step 5: Verify invalid import is atomic**

Import an invalid JSON file and confirm:

- A visible `role="alert"` explains the failure.
- Canvas and Luau remain unchanged.
- Undo history remains usable.

- [ ] **Step 6: Verify content semantics and console**

Open `/zh` and confirm the Chinese `<main>` has `lang="zh-CN"`. Confirm the browser console reports zero errors on `/editor` and `/zh`.

- [ ] **Step 7: Run React best-practices review**

Review edited TSX files for semantic controls, accessible file input labeling, stable state ownership, effect cleanup, and unnecessary re-renders. Apply only scoped fixes, then rerun Step 1 if code changes.

- [ ] **Step 8: Commit verification fixes if needed**

```bash
git add app/editor app/page.tsx app/about/page.tsx app/zh/page.tsx README.md
git commit -m "Polish project portability verification findings"
```

- [ ] **Step 9: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Merge locally only after verifying the merged result, and preserve the existing unrelated `.gitignore`, `.superpowers/`, and `docs/youtube-60s-script.md` changes.
