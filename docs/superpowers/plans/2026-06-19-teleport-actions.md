# Secure Teleport Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TextButton Teleport action that generates a server-validated Place ID allowlist and secure `TeleportAsync` request flow.

**Architecture:** Keep Teleport parsing and scene selection in a focused `teleports.ts` module. Move combined server output into `server-luau.ts`, where custom RemoteEvents remain under `ReplicatedStorage.Remotes` and generated Teleport traffic uses the isolated `ReplicatedStorage.RGM/TeleportRequest` channel. Reuse the existing action-field draft pattern so invalid Place IDs never enter scene state.

**Tech Stack:** Next.js 16 client components, React 19, TypeScript, Vitest, Tailwind CSS, generated Luau.

---

### Task 1: Lock the Teleport action contract and persistence boundary

**Files:**
- Create: `app/editor/teleports.ts`
- Create: `app/editor/teleports.test.ts`
- Modify: `app/editor/catalog.ts`
- Modify: `app/editor/persistence.ts`
- Modify: `app/editor/persistence.test.ts`

- [ ] **Step 1: Add failing validation and persistence tests**

Create `teleports.test.ts` with a local TextButton fixture and assertions for:

```ts
expect(placeIdError("12345678901234")).toBeNull();
expect(placeIdError("")).toBe("Place ID is required.");
expect(placeIdError(" 123")).toBe("Place ID must contain digits only.");
expect(placeIdError("01")).toBe("Place ID cannot start with zero.");
expect(placeIdError("0")).toBe("Place ID must be greater than zero.");
expect(placeIdError("9007199254740992")).toBe("Place ID is too large.");
expect(sanitizeTeleportAction({ type: "teleport", placeId: "12345678901234" }))
  .toEqual({ type: "teleport", placeId: "12345678901234" });
expect(sanitizeTeleportAction({ type: "teleport", placeId: 123 })).toBeNull();
expect(teleportButtons([validButton, malformedButton, frame])).toEqual([validButton]);
expect(collectTeleportPlaceIds([first, duplicate, second])).toEqual(["123", "456"]);
```

Extend `persistence.test.ts` to verify a valid Teleport action survives `sanitizeScene()` and version-1 JSON round-trip, while invalid IDs remove only the action.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npx vitest run app/editor/teleports.test.ts app/editor/persistence.test.ts`

Expected: FAIL because `teleports.ts` and `TeleportAction` do not exist.

- [ ] **Step 3: Add the type and minimal validators**

In `catalog.ts` add:

```ts
export type TeleportAction = {
  type: "teleport";
  placeId: string;
};

export type NodeAction = VisibilityAction | RemoteEventAction | TeleportAction;
```

Implement `teleports.ts` with these public functions:

```ts
import type { SceneNode, TeleportAction } from "./catalog";

const MAX_SAFE_PLACE_ID = BigInt(Number.MAX_SAFE_INTEGER);

export function placeIdError(placeId: string): string | null {
  if (!placeId) return "Place ID is required.";
  if (!/^\d+$/.test(placeId)) return "Place ID must contain digits only.";
  if (placeId === "0") return "Place ID must be greater than zero.";
  if (placeId.startsWith("0")) return "Place ID cannot start with zero.";
  if (BigInt(placeId) > MAX_SAFE_PLACE_ID) return "Place ID is too large.";
  return null;
}

export function sanitizeTeleportAction(raw: unknown): TeleportAction | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const action = raw as Record<string, unknown>;
  if (action.type !== "teleport" || typeof action.placeId !== "string") return null;
  return placeIdError(action.placeId) ? null : { type: "teleport", placeId: action.placeId };
}
```

Add `teleportButtons(scene)` as a runtime-safe TextButton filter and `collectTeleportPlaceIds(scene)` as a first-seen-order unique list.

In `persistence.ts`, call `sanitizeTeleportAction(action)` after the RemoteEvent sanitizer and preserve the result when valid.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `npx vitest run app/editor/teleports.test.ts app/editor/persistence.test.ts`

Expected: both files pass.

- [ ] **Step 5: Commit the contract**

```bash
git add app/editor/catalog.ts app/editor/teleports.ts app/editor/teleports.test.ts app/editor/persistence.ts app/editor/persistence.test.ts
git commit -m "Persist validated Teleport actions"
```

### Task 2: Generate secure client and server Luau

**Files:**
- Create: `app/editor/server-luau.ts`
- Create: `app/editor/server-luau.test.ts`
- Modify: `app/editor/remote-events.ts`
- Modify: `app/editor/remote-events.test.ts`
- Modify: `app/editor/scene.ts`
- Modify: `app/editor/scene.test.ts`
- Modify: `app/editor/Editor.tsx`

- [ ] **Step 1: Add failing generator tests**

Create `server-luau.test.ts` covering Teleport-only and mixed RemoteEvent scenes. Require output containing:

```ts
expect(code).toContain('local TeleportService = game:GetService("TeleportService")');
expect(code).toContain('local rgm = ReplicatedStorage:FindFirstChild("RGM")');
expect(code).toContain('local teleportRequest = rgm:FindFirstChild("TeleportRequest")');
expect(code).toContain('["123"] = true');
expect(code).toContain('["456"] = true');
expect(code).toContain('if typeof(placeId) ~= "string" or not allowedPlaceIds[placeId] then');
expect(code).toContain('TeleportService:TeleportAsync(numericPlaceId, { player })');
expect(code).toContain('local success, message = pcall(function()');
expect(code).toContain('warn("Teleport to " .. placeId .. " failed: " .. tostring(message))');
```

Assert the allowlist deduplicates Place IDs, malformed actions emit nothing, a mixed scene contains both `Remotes` and `RGM`, and a custom event named `TeleportRequest` remains isolated under `Remotes`.

Extend `scene.test.ts` to require one client lookup and exact bindings:

```ts
expect(code.match(/WaitForChild\("TeleportRequest"\)/g)).toHaveLength(1);
expect(code).toContain('teleportRequest:FireServer("123")');
expect(code).toContain('teleportRequest:FireServer("456")');
```

Also test duplicate node IDs so only the emitted button receives a binding.

- [ ] **Step 2: Run generator tests and confirm RED**

Run: `npx vitest run app/editor/server-luau.test.ts app/editor/scene.test.ts app/editor/remote-events.test.ts`

Expected: FAIL because combined server generation and Teleport client bindings are absent.

- [ ] **Step 3: Separate combined server generation**

Move `generateServerLuau` from `remote-events.ts` to `server-luau.ts`. Keep `remote-events.ts` responsible only for RemoteEvent validation, collection, and `luauString`.

The new generator starts with:

```ts
export function generateServerLuau(scene: SceneNode[]): string | null {
  const remoteBindings = collectRemoteEventBindings(scene);
  const teleportPlaceIds = collectTeleportPlaceIds(scene);
  if (remoteBindings.length === 0 && teleportPlaceIds.length === 0) return null;

  const out = [
    "-- Generated by Roblox GUI Maker",
    "-- Place this Script in ServerScriptService",
    'local ReplicatedStorage = game:GetService("ReplicatedStorage")',
  ];
```

Emit the existing `Remotes` section only when `remoteBindings` is non-empty. Emit the `TeleportService`, `RGM` folder, `TeleportRequest`, deterministic `allowedPlaceIds` table, type/allowlist guard, `tonumber` conversion, and protected `TeleportAsync` handler only when `teleportPlaceIds` is non-empty.

Update `remote-events.test.ts` to import `generateServerLuau` from `server-luau.ts`, and update `Editor.tsx` to do the same.

- [ ] **Step 4: Add client Teleport bindings after node emission**

In `scene.ts`, collect Teleport IDs only from `scene.filter((node) => emittedNodes.has(node))`. When non-empty emit:

```ts
local rgm = ReplicatedStorage:WaitForChild("RGM")
local teleportRequest = rgm:WaitForChild("TeleportRequest")
```

Reuse a single `ReplicatedStorage` declaration when custom RemoteEvent and Teleport actions coexist. In the action connection loop, emit:

```ts
statement = `teleportRequest:FireServer(${luauString(node.action.placeId)})`;
```

Only do so when the runtime action passes `sanitizeTeleportAction`/Teleport collection checks.

- [ ] **Step 5: Run generator tests and confirm GREEN**

Run: `npx vitest run app/editor/server-luau.test.ts app/editor/scene.test.ts app/editor/remote-events.test.ts`

Expected: all tests pass with deterministic output.

- [ ] **Step 6: Commit generation**

```bash
git add app/editor/server-luau.ts app/editor/server-luau.test.ts app/editor/remote-events.ts app/editor/remote-events.test.ts app/editor/scene.ts app/editor/scene.test.ts app/editor/Editor.tsx
git commit -m "Generate secure Teleport client and server code"
```

### Task 3: Add Teleport editing and Preview feedback

**Files:**
- Create: `app/editor/TeleportActionFields.tsx`
- Modify: `app/editor/PropertiesPanel.tsx`
- Modify: `app/editor/Editor.tsx`
- Modify: `app/editor/scene.ts`
- Modify: `app/editor/scene.test.ts`

- [ ] **Step 1: Add failing preview regression tests**

Extend `scene.test.ts` with a Teleport action and assert:

```ts
const visibility = createPreviewVisibility(scene);
expect(applyPreviewAction(scene, visibility, "button")).toBe(visibility);
expect(previewActionNotice(scene, "button")).toBe(
  "Teleport to Place 123. Preview does not run live teleports."
);
```

Also verify `duplicateSubtree()` deep-clones a Teleport action and `removeSubtree()` does not interpret `placeId` as a target node ID.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npx vitest run app/editor/scene.test.ts`

Expected: FAIL because `previewActionNotice` does not exist.

- [ ] **Step 3: Implement the action field component**

Create `TeleportActionFields.tsx` following `RemoteEventActionFields.tsx`:

```tsx
type Props = {
  action: TeleportAction;
  onCommit: (action: TeleportAction) => void;
};

export function TeleportActionFields({ action, onCommit }: Props) {
  const [placeId, setPlaceId] = useState(action.placeId);
  const pendingLocalCommit = useRef<TeleportAction | null>(null);
  const placeIdInputId = useId();

  useEffect(() => {
    const pending = pendingLocalCommit.current;
    pendingLocalCommit.current = null;
    if (pending?.placeId === action.placeId) return;
    setPlaceId(action.placeId);
  }, [action.placeId]);

  const error = placeIdError(placeId);
  const commitIfValid = (nextPlaceId: string) => {
    if (placeIdError(nextPlaceId)) return;
    const nextAction: TeleportAction = { type: "teleport", placeId: nextPlaceId };
    pendingLocalCommit.current = nextAction;
    onCommit(nextAction);
  };

  return (
    <div className="flex flex-col gap-3 px-1 py-1">
      <div>
        <label htmlFor={placeIdInputId} className="mb-1 block text-[11px] text-ink-mute">
          Destination Place ID
        </label>
        <input
          id={placeIdInputId}
          inputMode="numeric"
          value={placeId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${placeIdInputId}-error` : `${placeIdInputId}-path`}
          onChange={(event) => {
            setPlaceId(event.target.value);
            commitIfValid(event.target.value);
          }}
          className="w-full rounded bg-input px-2 py-1 text-xs text-ink outline-none focus:ring-1 focus:ring-focus"
        />
        {error && <p id={`${placeIdInputId}-error`} className="mt-1 text-[10px] text-danger">{error}</p>}
        <p id={`${placeIdInputId}-path`} className="mt-1 break-all font-mono text-[10px] text-ink-mute">
          ReplicatedStorage / RGM / TeleportRequest
        </p>
      </div>
    </div>
  );
}
```

Render a text input with `inputMode="numeric"`, `aria-invalid`, an associated inline error, and the path hint `ReplicatedStorage / RGM / TeleportRequest`.

- [ ] **Step 4: Wire Properties and Preview**

In `PropertiesPanel.tsx`:

```ts
if (type === "teleport") return { type: "teleport", placeId: "1" };
```

Add `<option value="teleport">Teleport to place</option>` and render `TeleportActionFields` for Teleport actions. Update visibility-action narrowing so Teleport is never treated as an action with `targetId`.

Add `previewActionNotice(scene, buttonId)` in `scene.ts`; it returns the exact Teleport notice, the existing RemoteEvent notice, or `null`. In `Editor.tsx`, Preview click handling becomes:

```ts
const notice = previewActionNotice(scene, id);
if (notice) {
  setPreviewNotice(notice);
  return;
}
```

In `scene.ts`, return the existing visibility reference for both RemoteEvent and Teleport actions. Ensure subtree deletion only clears `show`, `hide`, or `toggle` target references.

- [ ] **Step 5: Run editor unit tests and type checking**

Run: `npm test`

Expected: all tests pass.

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 6: Commit editor behavior**

```bash
git add app/editor/TeleportActionFields.tsx app/editor/PropertiesPanel.tsx app/editor/Editor.tsx app/editor/scene.ts app/editor/scene.test.ts
git commit -m "Add Teleport action editing and preview feedback"
```

### Task 4: Verify the complete workflow

**Files:**
- Modify only if verification exposes a defect in the files above.

- [ ] **Step 1: Run repository verification**

Run: `git diff --check`

Expected: no output.

Run: `npm test`

Expected: all test files pass.

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build -- --webpack`

Expected: optimized production build succeeds. Use the explicit Webpack backend because Turbopack previously stalled on the external project volume while Webpack completed successfully.

- [ ] **Step 2: Run browser verification**

Start the production app and verify this sequence at desktop width:

1. Select a TextButton and choose `Teleport to place`.
2. Enter `12345678901234`; client output fires that string and server output allowlists it.
3. Enter `01`, non-digits, and a value above `9007199254740991`; each error stays visible while generated output retains the last valid ID.
4. Undo and redo the valid edit.
5. Enter Preview and click the button; confirm the exact non-live Teleport notice and no scene/history mutation.
6. Refresh and verify localStorage restoration.
7. Export and re-import JSON; verify the action remains intact.
8. Download client and server `.lua` files and inspect their contents.
9. Add a custom RemoteEvent named `TeleportRequest`; confirm it uses `Remotes` while Teleport uses `RGM`.
10. Confirm no console errors and no horizontal overflow at 1280px.

- [ ] **Step 3: Review the final diff**

Run: `git diff 24720b4...HEAD --stat`

Run: `git diff 24720b4...HEAD -- app/editor`

Expected: changes are limited to the approved Teleport feature, spec, plan, and necessary server-generator extraction.

- [ ] **Step 4: Commit any verification fixes**

If verification required edits, commit only those files with a message explaining the observed defect. If no edits were required, do not create an empty commit.
