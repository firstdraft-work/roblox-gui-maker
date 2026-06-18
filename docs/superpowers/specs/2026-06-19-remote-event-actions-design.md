# RemoteEvent Button Actions Design

## Goal

Let a `TextButton` fire a named Roblox `RemoteEvent` with one string argument, while preserving the editor's current scene model, Preview behavior, project JSON compatibility, and existing client Luau export.

The feature must generate two explicit outputs:

- A client `LocalScript` containing the GUI and `FireServer` calls.
- A server handler template that owns RemoteEvent creation and leaves business validation to the developer.

## Scope

### Include

- A `remoteEvent` button action with an event name and one string argument.
- A fixed event location: `ReplicatedStorage/Remotes/<eventName>`.
- Client and server Luau outputs with separate copy and download controls.
- Project JSON persistence, import, sanitization, undo, and refresh support.
- Browser Preview feedback explaining that server behavior only runs in Roblox.
- Deduplication when multiple buttons use the same event or argument.

### Exclude

- Arbitrary or multiple argument types.
- Custom RemoteEvent paths.
- `RemoteFunction`, `TeleportService`, or direct server-side gameplay logic.
- User-authored Luau snippets.
- Automatic price, inventory, permission, or ownership validation.
- A Studio plugin or `.rbxmx` export.

## Scene Contract

`NodeAction` becomes a discriminated union:

```ts
type NodeAction =
  | { type: "show" | "hide" | "toggle"; targetId?: string }
  | { type: "hideGui" }
  | {
      type: "remoteEvent";
      eventName: string;
      argument: string;
    };
```

RemoteEvent actions are valid only on `TextButton` nodes.

### Validation

- `eventName` is trimmed, must be 1-50 characters, and may contain ASCII letters, digits, and underscores only.
- `argument` is a string of at most 200 characters. An empty argument is valid and is emitted as `""`.
- Invalid RemoteEvent actions are removed at the `sanitizeScene` boundary. Nodes remain valid.
- User edits that would produce an invalid event name show an inline error and do not commit an invalid action.
- Luau string literals escape backslashes, quotes, newlines, carriage returns, and tabs.

The project document remains version `1`. The new action is an optional, backward-compatible scene field; older documents remain readable.

## Properties Panel

The Action selector for `TextButton` adds `Fire RemoteEvent`.

When selected, the panel shows:

1. `Event name`, with `ShopAction` as an example.
2. `Argument`, with `buy_sword` as an example.
3. The resolved path: `ReplicatedStorage / Remotes / <eventName>`.
4. A warning that the server must validate the player, argument, price, permissions, and target before changing game state.

The action type change is undoable through the editor's existing history path. Event name and argument edits use the existing debounced property-edit behavior.

## Preview Behavior

Browser Preview does not simulate a server or pretend that the action succeeded.

Clicking a RemoteEvent button records a short UI-local notice such as `RemoteEvent actions run in Roblox Studio.` The notice does not mutate the scene, enter undo history, or persist to project JSON.

Existing `show`, `hide`, `toggle`, and `hideGui` Preview behavior remains unchanged.

## Client Export

The current generated GUI remains the client output. For every valid RemoteEvent action, generation adds a reference under `ReplicatedStorage.Remotes` and connects the button:

```luau
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local shopAction = remotes:WaitForChild("ShopAction")

buyButton.Activated:Connect(function()
    shopAction:FireServer("buy_sword")
end)
```

Client export rules:

- The client never creates `Folder` or `RemoteEvent` instances.
- Each distinct event name is looked up once.
- Multiple buttons may reuse the same event reference.
- Existing visibility actions keep their current generated code.
- Generated local identifiers remain deterministic and collision-safe.

## Server Export

The server output is a template intended for `ServerScriptService`.

It creates the shared folder and each distinct event only when missing:

```luau
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local remotes = ReplicatedStorage:FindFirstChild("Remotes")
if not remotes then
    remotes = Instance.new("Folder")
    remotes.Name = "Remotes"
    remotes.Parent = ReplicatedStorage
end
```

For each event, it verifies that an existing object is a `RemoteEvent`; otherwise it raises a descriptive error instead of replacing user-owned instances.

Each event receives one connection. Distinct arguments generate deterministic branches:

```luau
shopAction.OnServerEvent:Connect(function(player, action)
    if action == "buy_sword" then
        -- Validate price, ownership, and player state before granting anything.
    elseif action == "buy_shield" then
        -- Validate price, ownership, and player state before granting anything.
    else
        warn(`Unexpected ShopAction action from {player.Name}: {tostring(action)}`)
    end
end)
```

Repeated event/argument pairs produce one branch. The generator must not infer or implement gameplay behavior.

## Code Panel And Downloads

The code panel gains `Client` and `Server` tabs.

- `Client` is the default and retains the existing copy behavior.
- The toolbar's `Export Luau` continues copying client code to avoid changing established behavior.
- Client download keeps the `.lua` output.
- Server download uses a `.server.lua` filename.
- When the scene has no RemoteEvent actions, the Server tab displays an empty state and disables copy/download instead of generating an unused script.

Tab selection is UI-local state and is not saved in the scene or undo history.

## Data Flow

1. The properties panel emits a validated `NodeAction` patch.
2. `Editor` stores it through the existing mutation/history path.
3. localStorage and project JSON serialize the scene unchanged.
4. `sanitizeScene` reconstructs only valid RemoteEvent actions on load or import.
5. Pure scene generators derive the client script and optional server script from the same scene snapshot.
6. The code panel renders and downloads the selected output.

No network request or application API key is required.

## Error Handling

- Invalid editor input stays visible with an inline explanation and does not enter persisted scene state.
- Invalid imported RemoteEvent actions are discarded without rejecting otherwise valid nodes or scenes.
- A missing event at runtime yields through `WaitForChild`, matching current Roblox object-loading conventions.
- A conflicting non-RemoteEvent object in the server path raises a descriptive server error.
- Preview clearly states that the action requires Roblox instead of silently doing nothing.

## Compatibility

- Existing scenes and project files remain valid.
- Existing action targets and deletion cleanup retain their current semantics.
- Deleting a scene node does not remove RemoteEvent actions, because they do not reference scene node IDs.
- Duplicating a button deep-clones the RemoteEvent action.
- Hierarchy reparenting and sibling ordering do not alter actions.

## Verification

### Unit Tests

- Sanitize valid and invalid RemoteEvent actions.
- Preserve RemoteEvent actions through JSON round-trip and clone/duplicate operations.
- Escape all supported special characters in Luau strings.
- Generate one client lookup per event and one call per button.
- Generate one server event and connection per event name.
- Deduplicate repeated arguments and keep distinct branches deterministic.
- Preserve existing visibility action output and deletion behavior.

### Browser Verification

1. Configure a button with `ShopAction` and `buy_sword`.
2. Confirm Preview shows the server-only notice without scene mutation.
3. Inspect client and server outputs.
4. Copy and download both scripts.
5. Undo, redo, refresh, export JSON, and re-import JSON.
6. Confirm the action and generated code survive the full round trip.
7. Confirm invalid event names show an inline error and do not affect export.

### Gates

- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- Production browser flow with zero console errors

## Risks And Mitigations

- **Client trust:** Generated server comments and fallback warnings explicitly require validation; no generated branch changes game state.
- **Name collisions:** Event names use a restricted character set, while generated local identifiers use deterministic collision handling.
- **Existing instance conflicts:** Server code validates class type and never replaces an existing object.
- **Export complexity:** Client and server outputs remain separate tabs and files rather than combining execution contexts.
- **Format drift:** Sanitization and project JSON round-trip tests lock the action contract without requiring a document version bump.
