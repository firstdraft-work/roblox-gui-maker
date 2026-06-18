# RemoteEvent Button Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add validated `RemoteEvent` button actions and export separate client GUI and server handler Luau files.

**Architecture:** Extend the scene action union without changing project document version `1`. Put RemoteEvent validation, binding collection, Luau string escaping, and server template generation in a pure `remote-events.ts` module; keep GUI/client generation in `scene.ts`. React components edit only valid persisted actions, show UI-local Preview feedback, and render client/server outputs through one code panel.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, browser Clipboard/Blob APIs, Roblox Luau.

---

## File Map

- Modify `app/editor/catalog.ts`: discriminated action union.
- Create `app/editor/remote-events.ts`: validation, sanitization, deterministic binding collection, string escaping, and server Luau generation.
- Create `app/editor/remote-events.test.ts`: pure validation and server generator coverage.
- Modify `app/editor/persistence.ts`: accept only sanitized RemoteEvent actions.
- Modify `app/editor/persistence.test.ts`: import and JSON round-trip coverage.
- Modify `app/editor/scene.ts`: generate RemoteEvent client lookups/calls while preserving visibility actions.
- Modify `app/editor/scene.test.ts`: client output, escaping, duplication, deletion, and Preview invariants.
- Create `app/editor/RemoteEventActionFields.tsx`: local invalid draft state and validated commits.
- Modify `app/editor/PropertiesPanel.tsx`: action selector and RemoteEvent fields.
- Modify `app/editor/Canvas.tsx`: render UI-local Preview notice.
- Modify `app/editor/Editor.tsx`: Preview routing, client/server output ownership, copy/download handlers.
- Modify `app/editor/CodePanel.tsx`: Client/Server tabs and server empty state.

### Task 1: RemoteEvent Action Contract And Persistence Boundary

**Files:**
- Modify: `app/editor/catalog.ts:17-21`
- Create: `app/editor/remote-events.ts`
- Create: `app/editor/remote-events.test.ts`
- Modify: `app/editor/persistence.ts:92-107`
- Modify: `app/editor/persistence.test.ts:1-123`

- [ ] **Step 1: Define failing validation tests**

Create `app/editor/remote-events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  remoteEventNameError,
  sanitizeRemoteEventAction,
} from "./remote-events";

describe("RemoteEvent action validation", () => {
  it.each(["ShopAction", "Admin_Action_2", "A"])(
    "accepts event name %s",
    (eventName) => {
      expect(remoteEventNameError(eventName)).toBeNull();
      expect(
        sanitizeRemoteEventAction({
          type: "remoteEvent",
          eventName: `  ${eventName}  `,
          argument: "buy_sword",
        })
      ).toEqual({ type: "remoteEvent", eventName, argument: "buy_sword" });
    }
  );

  it.each(["", "has space", "slash/name", "hyphen-name", "a".repeat(51)])(
    "rejects event name %s",
    (eventName) => {
      expect(remoteEventNameError(eventName)).not.toBeNull();
      expect(
        sanitizeRemoteEventAction({ type: "remoteEvent", eventName, argument: "go" })
      ).toBeNull();
    }
  );

  it("accepts an empty argument and rejects oversized arguments", () => {
    expect(
      sanitizeRemoteEventAction({
        type: "remoteEvent",
        eventName: "ShopAction",
        argument: "",
      })
    ).toEqual({ type: "remoteEvent", eventName: "ShopAction", argument: "" });
    expect(
      sanitizeRemoteEventAction({
        type: "remoteEvent",
        eventName: "ShopAction",
        argument: "x".repeat(201),
      })
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `npm test -- app/editor/remote-events.test.ts`

Expected: FAIL because `./remote-events` does not exist.

- [ ] **Step 3: Add the discriminated action types**

Replace the current `NodeAction` declaration in `catalog.ts` with:

```ts
export type VisibilityAction =
  | { type: "show" | "hide" | "toggle"; targetId?: string }
  | { type: "hideGui" };

export type RemoteEventAction = {
  type: "remoteEvent";
  eventName: string;
  argument: string;
};

export type NodeAction = VisibilityAction | RemoteEventAction;
```

- [ ] **Step 4: Implement the pure validator and sanitizer**

Create `app/editor/remote-events.ts` with:

```ts
import type { RemoteEventAction, SceneNode } from "./catalog";

export const MAX_REMOTE_EVENT_NAME = 50;
export const MAX_REMOTE_ARGUMENT = 200;
const EVENT_NAME = /^[A-Za-z0-9_]+$/;

export function remoteEventNameError(value: string): string | null {
  const eventName = value.trim();
  if (!eventName) return "Event name is required.";
  if (eventName.length > MAX_REMOTE_EVENT_NAME) {
    return `Event name must be ${MAX_REMOTE_EVENT_NAME} characters or fewer.`;
  }
  if (!EVENT_NAME.test(eventName)) {
    return "Use only letters, numbers, and underscores.";
  }
  return null;
}

export function sanitizeRemoteEventAction(
  raw: unknown
): RemoteEventAction | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (
    source.type !== "remoteEvent" ||
    typeof source.eventName !== "string" ||
    typeof source.argument !== "string" ||
    remoteEventNameError(source.eventName) ||
    source.argument.length > MAX_REMOTE_ARGUMENT
  ) {
    return null;
  }
  return {
    type: "remoteEvent",
    eventName: source.eventName.trim(),
    argument: source.argument,
  };
}

export function remoteEventButtons(scene: SceneNode[]) {
  return scene.filter(
    (node): node is SceneNode & { action: RemoteEventAction } =>
      node.cls === "TextButton" && node.action?.type === "remoteEvent"
  );
}
```

- [ ] **Step 5: Route imported actions through the shared sanitizer**

In `persistence.ts`, keep the existing visibility-action branch and add a separate RemoteEvent branch:

```ts
const action = source.action as Record<string, unknown> | undefined;
if (
  source.cls === "TextButton" &&
  action &&
  (action.type === "show" ||
    action.type === "hide" ||
    action.type === "toggle" ||
    action.type === "hideGui")
) {
  node.action = {
    type: action.type,
    ...(typeof action.targetId === "string" ? { targetId: action.targetId } : {}),
  };
} else if (source.cls === "TextButton") {
  node.action = sanitizeRemoteEventAction(action) ?? undefined;
}
```

Import `sanitizeRemoteEventAction` from `./remote-events`.

- [ ] **Step 6: Add persistence regression cases**

Add to `persistence.test.ts`:

```ts
it("sanitizes RemoteEvent actions without rejecting their buttons", () => {
  const valid = sanitizeScene([
    node({
      id: "buy",
      cls: "TextButton",
      action: {
        type: "remoteEvent",
        eventName: "  ShopAction  ",
        argument: "buy_sword",
      },
    }),
  ]);
  expect(valid?.[0].action).toEqual({
    type: "remoteEvent",
    eventName: "ShopAction",
    argument: "buy_sword",
  });

  const invalid = sanitizeScene([
    node({
      id: "buy",
      cls: "TextButton",
      action: {
        type: "remoteEvent",
        eventName: "bad/name",
        argument: "buy_sword",
      },
    }),
  ]);
  expect(invalid?.[0].action).toBeUndefined();
});

it("round-trips RemoteEvent actions in version 1 documents", () => {
  const scene = [
    node({ id: "root", cls: "ScreenGui" }),
    node({
      id: "buy",
      cls: "TextButton",
      parentId: "root",
      action: {
        type: "remoteEvent",
        eventName: "ShopAction",
        argument: "buy_sword",
      },
    }),
  ];
  expect(parseSceneDocument(serializeSceneDocument(scene))).toEqual(scene);
});
```

- [ ] **Step 7: Run focused tests and TypeScript**

Run: `npm test -- app/editor/remote-events.test.ts app/editor/persistence.test.ts && npx tsc --noEmit`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 8: Commit the contract boundary**

```bash
git add app/editor/catalog.ts app/editor/remote-events.ts app/editor/remote-events.test.ts app/editor/persistence.ts app/editor/persistence.test.ts
git commit -m "Validate RemoteEvent scene actions"
```

### Task 2: Deterministic Client And Server Luau Generation

**Files:**
- Modify: `app/editor/remote-events.ts`
- Modify: `app/editor/remote-events.test.ts`
- Modify: `app/editor/scene.ts:278-500`
- Modify: `app/editor/scene.test.ts:29-74`

- [ ] **Step 1: Add failing binding and server generator tests**

Append to `remote-events.test.ts`:

```ts
import type { SceneNode } from "./catalog";
import {
  collectRemoteEventBindings,
  generateServerLuau,
  luauString,
} from "./remote-events";

const remoteButton = (
  id: string,
  eventName: string,
  argument: string
): SceneNode => ({
  id,
  cls: "TextButton",
  name: id,
  parentId: null,
  pos: { x: 0, y: 0 },
  size: { x: 1, y: 1 },
  color: "#000000",
  transparency: 0,
  cornerRadius: 0,
  zindex: 1,
  action: { type: "remoteEvent", eventName, argument },
});

describe("RemoteEvent Luau support", () => {
  it("escapes strings used by both exporters", () => {
    expect(luauString('say "hi"\\next\nline\tend\r')).toBe(
      '"say \\"hi\\"\\\\next\\nline\\tend\\r"'
    );
  });

  it("deduplicates events and repeated arguments in first-seen order", () => {
    const bindings = collectRemoteEventBindings([
      remoteButton("one", "ShopAction", "buy_sword"),
      remoteButton("two", "ShopAction", "buy_shield"),
      remoteButton("three", "ShopAction", "buy_sword"),
      remoteButton("four", "AdminAction", "kick"),
    ]);
    expect(bindings.map(({ eventName, arguments: args }) => [eventName, args])).toEqual([
      ["ShopAction", ["buy_sword", "buy_shield"]],
      ["AdminAction", ["kick"]],
    ]);
  });

  it("generates safe server ownership and one connection per event", () => {
    const code = generateServerLuau([
      remoteButton("one", "ShopAction", "buy_sword"),
      remoteButton("two", "ShopAction", "buy_shield"),
    ]);
    expect(code).toContain('ReplicatedStorage:FindFirstChild("Remotes")');
    expect(code).toContain('Instance.new("Folder")');
    expect(code).toContain('remote0 = remotes:FindFirstChild("ShopAction")');
    expect(code).toContain('not remote0:IsA("RemoteEvent")');
    expect(code.match(/remote0\.OnServerEvent:Connect/g)).toHaveLength(1);
    expect(code).toContain('if action == "buy_sword" then');
    expect(code).toContain('elseif action == "buy_shield" then');
  });

  it("returns null when no server output is required", () => {
    expect(generateServerLuau([])).toBeNull();
  });
});
```

- [ ] **Step 2: Add failing client generation tests**

Add these cases to the existing `button actions` and `scene action state` suites in `scene.test.ts`:

```ts
it("generates deduplicated RemoteEvent client calls", () => {
  const scene = actionScene({
    type: "remoteEvent",
    eventName: "ShopAction",
    argument: 'buy_"sword"',
  });
  scene.push({
    ...scene[2],
    id: "second-button",
    name: "SecondButton",
    action: {
      type: "remoteEvent",
      eventName: "ShopAction",
      argument: "buy_shield",
    },
  });

  const code = generateLuau(scene);

  expect(code.match(/WaitForChild\("ShopAction"\)/g)).toHaveLength(1);
  expect(code).toContain('remote0:FireServer("buy_\\"sword\\"")');
  expect(code).toContain('remote0:FireServer("buy_shield")');
});

it("deep-clones RemoteEvent actions and does not clear them on node deletion", () => {
  const scene = actionScene({
    type: "remoteEvent",
    eventName: "ShopAction",
    argument: "buy_sword",
  });
  const duplicate = duplicateSubtree(scene, "button")!;
  const clonedAction = duplicate.nodes[0].action;
  if (clonedAction?.type !== "remoteEvent") throw new Error("Expected RemoteEvent action");
  clonedAction.argument = "changed";
  expect(scene[2].action).toEqual({
    type: "remoteEvent",
    eventName: "ShopAction",
    argument: "buy_sword",
  });
  expect(removeSubtree(scene, "panel").find((item) => item.id === "button")?.action)
    .toEqual(scene[2].action);
});

it("does not simulate RemoteEvent actions in Preview visibility", () => {
  const scene = actionScene({
    type: "remoteEvent",
    eventName: "ShopAction",
    argument: "buy_sword",
  });
  const visibility = createPreviewVisibility(scene);
  expect(applyPreviewAction(scene, visibility, "button")).toBe(visibility);
});
```

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- app/editor/remote-events.test.ts app/editor/scene.test.ts`

Expected: FAIL because binding/server exports and RemoteEvent client generation do not exist.

- [ ] **Step 4: Implement shared binding collection and server generation**

Add these public types/functions to `remote-events.ts`:

```ts
export type RemoteEventBinding = {
  eventName: string;
  variable: string;
  arguments: string[];
};

export function luauString(value: string): string {
  return `"${value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")}"`;
}

export function collectRemoteEventBindings(
  scene: SceneNode[]
): RemoteEventBinding[] {
  const byName = new Map<string, RemoteEventBinding>();
  for (const button of remoteEventButtons(scene)) {
    const action = button.action;
    let binding = byName.get(action.eventName);
    if (!binding) {
      binding = {
        eventName: action.eventName,
        variable: `remote${byName.size}`,
        arguments: [],
      };
      byName.set(action.eventName, binding);
    }
    if (!binding.arguments.includes(action.argument)) {
      binding.arguments.push(action.argument);
    }
  }
  return [...byName.values()];
}

export function generateServerLuau(scene: SceneNode[]): string | null {
  const bindings = collectRemoteEventBindings(scene);
  if (bindings.length === 0) return null;

  const out = [
    "-- Generated by Roblox GUI Maker",
    '-- Place this Script in ServerScriptService',
    'local ReplicatedStorage = game:GetService("ReplicatedStorage")',
    "",
    'local remotes = ReplicatedStorage:FindFirstChild("Remotes")',
    'if remotes and not remotes:IsA("Folder") then',
    '\terror("ReplicatedStorage.Remotes must be a Folder")',
    "end",
    "if not remotes then",
    '\tremotes = Instance.new("Folder")',
    '\tremotes.Name = "Remotes"',
    "\tremotes.Parent = ReplicatedStorage",
    "end",
  ];

  for (const binding of bindings) {
    out.push(
      "",
      `local ${binding.variable} = remotes:FindFirstChild(${luauString(binding.eventName)})`,
      `if ${binding.variable} and not ${binding.variable}:IsA("RemoteEvent") then`,
      `\terror(${luauString(`ReplicatedStorage.Remotes.${binding.eventName} must be a RemoteEvent`)})`,
      "end",
      `if not ${binding.variable} then`,
      `\t${binding.variable} = Instance.new("RemoteEvent")`,
      `\t${binding.variable}.Name = ${luauString(binding.eventName)}`,
      `\t${binding.variable}.Parent = remotes`,
      "end",
      "",
      `${binding.variable}.OnServerEvent:Connect(function(player, action)`
    );
    binding.arguments.forEach((argument, index) => {
      out.push(`${index === 0 ? "\tif" : "\telseif"} action == ${luauString(argument)} then`);
      out.push("\t\t-- Validate the player and action before changing game state.");
    });
    out.push(
      "\telse",
      `\t\twarn(${luauString(`Unexpected ${binding.eventName} action`)}, player.Name, action)`,
      "\tend",
      "end)"
    );
  }
  return out.join("\n");
}
```

- [ ] **Step 5: Extend client generation without changing its public API**

In `scene.ts`:

1. Import `collectRemoteEventBindings` and `luauString`.
2. Replace the private `luaStr` body with `const luaStr = luauString`.
3. Near the start of `generateLuau`, collect bindings and emit `ReplicatedStorage`, `remotes`, and one lookup per binding.
4. Build `remoteByName = new Map(bindings.map((binding) => [binding.eventName, binding.variable]))`.
5. In the action loop, handle `remoteEvent` before the visibility target branch:

```ts
if (node.action.type === "remoteEvent") {
  const remote = remoteByName.get(node.action.eventName);
  if (remote) statement = `${remote}:FireServer(${luauString(node.action.argument)})`;
} else if (node.action.type === "hideGui") {
  statement = "gui.Enabled = false";
} else {
  // existing target lookup and show/hide/toggle statement
}
```

Do not rename `generateLuau`; callers and the toolbar continue treating it as the client generator.

Update the two existing action-state helpers for the expanded union:

```ts
// applyPreviewAction: remote calls are represented by UI-only feedback in Editor.
if (action.type === "remoteEvent") return visibility;

// removeSubtree: only visibility actions contain scene target IDs.
.map((node) =>
  node.action &&
  (node.action.type === "show" ||
    node.action.type === "hide" ||
    node.action.type === "toggle") &&
  node.action.targetId &&
  doomed.has(node.action.targetId)
    ? { ...node, action: undefined }
    : node
)
```

- [ ] **Step 6: Run focused and regression tests**

Run: `npm test -- app/editor/remote-events.test.ts app/editor/scene.test.ts app/editor/persistence.test.ts && npx tsc --noEmit`

Expected: all tests PASS and existing action/geometry assertions remain green.

- [ ] **Step 7: Commit both generators**

```bash
git add app/editor/remote-events.ts app/editor/remote-events.test.ts app/editor/scene.ts app/editor/scene.test.ts
git commit -m "Generate RemoteEvent client and server Luau"
```

### Task 3: Validated Action Editing And Preview Feedback

**Files:**
- Create: `app/editor/RemoteEventActionFields.tsx`
- Modify: `app/editor/PropertiesPanel.tsx:339-382`
- Modify: `app/editor/Canvas.tsx:27-84`
- Modify: `app/editor/Editor.tsx:69-78,393-476`

- [ ] **Step 1: Read the local Next.js client guidance**

Read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` before editing TSX. Keep interactive editor files inside the existing client boundary and do not pass functions across a server/client boundary.

- [ ] **Step 2: Create a focused RemoteEvent field editor**

Create `RemoteEventActionFields.tsx` as a client component with this contract:

```ts
type Props = {
  action: RemoteEventAction;
  onCommit: (action: RemoteEventAction) => void;
};
```

Use local `eventName` and `argument` draft state, synchronized when `action` changes. On each draft edit:

- Show `remoteEventNameError(eventName)` under the name input.
- Show `Argument must be 200 characters or fewer.` when oversized.
- Call `onCommit` only when both drafts are valid.
- Trim `eventName` only in the committed action; keep the visible draft unchanged until blur.
- On blur, replace the draft with the committed trimmed event name when valid.

The rendered fields must include:

```tsx
<input aria-label="RemoteEvent name" maxLength={51} />
<input aria-label="RemoteEvent argument" maxLength={201} />
<p>ReplicatedStorage / Remotes / {validName || "<event>"}</p>
<p className="text-warning">
  Validate the player, argument, price, permissions, and target on the server.
</p>
```

- [ ] **Step 3: Extend the Action selector safely**

In `PropertiesPanel.tsx`:

- Add `<option value="remoteEvent">Fire RemoteEvent</option>`.
- Replace the cast-based generic construction with an explicit action factory:

```ts
function actionForType(type: string): SceneNode["action"] {
  if (type === "show" || type === "hide" || type === "toggle") return { type };
  if (type === "hideGui") return { type };
  if (type === "remoteEvent") {
    return { type, eventName: "RemoteAction", argument: "" };
  }
  return undefined;
}
```

- Render target selection only for `show`, `hide`, and `toggle`.
- Render `RemoteEventActionFields` only for `remoteEvent` and commit through `onChange(node.id, { action })`.

- [ ] **Step 4: Add UI-local Preview feedback**

In `Editor.tsx`, add:

```ts
const [previewNotice, setPreviewNotice] = useState<string | null>(null);

function runPreviewAction(id: string) {
  const action = scene.find((node) => node.id === id)?.action;
  if (action?.type === "remoteEvent") {
    setPreviewNotice("RemoteEvent actions run in Roblox Studio.");
    return;
  }
  setPreviewNotice(null);
  setPreviewVisibility((current) =>
    current ? applyPreviewAction(scene, current, id) : current
  );
}
```

Clear `previewNotice` when entering/leaving Preview, starting a new workspace, or importing a project. Pass `runPreviewAction` and the notice to `Canvas`.

In `Canvas.tsx`, add `previewNotice: string | null` and render this inside the canvas shell without affecting layout:

```tsx
{previewNotice && (
  <p
    role="status"
    className="absolute left-1/2 top-3 z-[100] -translate-x-1/2 rounded-md border border-line bg-panel px-3 py-2 text-xs text-ink shadow-lg"
  >
    {previewNotice}
  </p>
)}
```

Make the canvas content wrapper `relative` if needed for positioning.

- [ ] **Step 5: Run type and regression gates**

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all tests PASS, TypeScript exits 0, and the Next.js production build succeeds.

- [ ] **Step 6: Commit editor and Preview behavior**

```bash
git add app/editor/RemoteEventActionFields.tsx app/editor/PropertiesPanel.tsx app/editor/Canvas.tsx app/editor/Editor.tsx
git commit -m "Edit and preview RemoteEvent actions"
```

### Task 4: Client And Server Code Panel

**Files:**
- Modify: `app/editor/CodePanel.tsx`
- Modify: `app/editor/Editor.tsx:69-92,329-345,428-476`
- Modify: `app/editor/Toolbar.tsx` only if its existing copied boolean wiring needs a naming-only adjustment.

- [ ] **Step 1: Replace the code panel contract**

Change `CodePanel` props to:

```ts
export type CodeOutput = "client" | "server";

type Props = {
  clientCode: string;
  serverCode: string | null;
  copied: CodeOutput | null;
  onCopy: (output: CodeOutput) => void;
  onDownload: (output: CodeOutput) => void;
};
```

Add `const [active, setActive] = useState<CodeOutput>("client")`. Render semantic tab buttons with `role="tablist"`, `role="tab"`, `aria-selected`, and keyboard-focus styles already used by the editor.

The active output is:

```ts
const code = active === "client" ? clientCode : serverCode;
const disabled = code === null;
```

When Server is active and `serverCode` is null, render:

```tsx
<div className="flex flex-1 items-center justify-center text-sm text-ink-mute">
  Add a Fire RemoteEvent button action to generate a server handler.
</div>
```

Disable copy/download in that state. Client description remains `ScreenGui — paste into a LocalScript`; server description is `Remote handlers — place in ServerScriptService`.

- [ ] **Step 2: Give Editor explicit output ownership**

In `Editor.tsx`:

```ts
const clientCode = generateLuau(scene);
const serverCode = generateServerLuau(scene);
const [copied, setCopied] = useState<CodeOutput | null>(null);

async function copyCode(output: CodeOutput) {
  const code = output === "client" ? clientCode : serverCode;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    setCopied(output);
    setTimeout(() => setCopied((current) => (current === output ? null : current)), 1600);
  } catch {
    setCopied(null);
  }
}

function downloadCode(output: CodeOutput) {
  const code = output === "client" ? clientCode : serverCode;
  if (!code) return;
  const url = URL.createObjectURL(
    new Blob([code], { type: "text/plain;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = output === "client" ? "roblox-gui.lua" : "roblox-gui.server.lua";
  link.click();
  URL.revokeObjectURL(url);
}
```

Import `generateServerLuau` and `CodeOutput`. Keep Toolbar's `Export Luau` wired to `copyCode("client")`, with its copied indicator driven by `copied === "client"`.

- [ ] **Step 3: Wire the dual-output panel**

Render:

```tsx
<CodePanel
  clientCode={clientCode}
  serverCode={serverCode}
  copied={copied}
  onCopy={copyCode}
  onDownload={downloadCode}
/>
```

Do not persist the active tab, copied state, or generated strings.

- [ ] **Step 4: Run the full automated gates**

Run: `npm test && npx tsc --noEmit && npm run build && git diff --check`

Expected: all tests PASS, TypeScript and build exit 0, and no whitespace errors are reported.

- [ ] **Step 5: Run React best-practices review**

Review edited TSX files for hook dependencies, draft synchronization, semantic tabs, focus visibility, stable keys, state ownership, and Blob URL cleanup. Apply only scoped fixes, then rerun Step 4 if files change.

- [ ] **Step 6: Commit the dual-output UI**

```bash
git add app/editor/CodePanel.tsx app/editor/Editor.tsx app/editor/Toolbar.tsx
git commit -m "Export separate client and server scripts"
```

### Task 5: Production Browser Verification And Integration

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] **Step 1: Run final branch gates**

Run:

```bash
git diff --check
npm test
npx tsc --noEmit
npm run build
```

Expected: zero whitespace errors, all tests PASS, TypeScript exits 0, and the production build succeeds.

- [ ] **Step 2: Start the production server**

Run: `npm run start -- -p 4173`

Expected: Next.js reports ready at `http://localhost:4173`.

- [ ] **Step 3: Verify action editing**

Open `/editor?template=main-menu` at 1280x900. Select the Play button and change Action to `Fire RemoteEvent`. Enter `ShopAction` and `buy_sword`. Confirm the resolved path and server-validation warning are visible.

Enter `bad/name` and confirm an inline error appears while client/server output retains the last valid `ShopAction` action. Restore `ShopAction`.

- [ ] **Step 4: Verify Preview semantics**

Enter Preview and click Play. Confirm a visible `role="status"` says the action runs in Roblox Studio. Confirm the scene and undo history do not change.

- [ ] **Step 5: Verify both exports**

Confirm Client output contains:

```luau
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local remote0 = remotes:WaitForChild("ShopAction")
remote0:FireServer("buy_sword")
```

Confirm Server output creates `Remotes` and `ShopAction`, checks existing class types, connects once, and contains the `buy_sword` validation branch. Download filenames must be `roblox-gui.lua` and `roblox-gui.server.lua`.

- [ ] **Step 6: Verify state round trips**

Undo and redo the action. Wait for autosave, refresh, export project JSON, start a clean workspace, and import the JSON. Confirm the RemoteEvent action and both outputs survive each transition.

- [ ] **Step 7: Verify compatibility and console**

Configure another button with `Show panel` and confirm Preview and client Luau remain unchanged. Confirm scenes with no RemoteEvent action show the Server empty state with disabled copy/download. Check the console reports zero errors.

- [ ] **Step 8: Commit verification fixes if required**

If verification required code changes:

```bash
git add app/editor
git commit -m "Polish RemoteEvent export verification findings"
```

If no changes were required, do not create an empty commit.

- [ ] **Step 9: Finish the branch**

Use `superpowers:finishing-a-development-branch`. Merge locally only after the merged result passes `npm test`, `npx tsc --noEmit`, and `npm run build`. Preserve the existing unrelated `.gitignore`, `.superpowers/`, and `docs/youtube-60s-script.md` working-tree changes.
