# Secure Teleport Button Actions

## Goal

Add a `Teleport` action for `TextButton` nodes. Generated Roblox code must request teleports through a server-owned allowlist instead of calling `TeleportService` directly from the client.

## Scope

### Included

- A `teleport` `NodeAction` containing one destination Place ID.
- Positive integer Place ID validation in the editor and at persistence/generation boundaries.
- Client Luau that fires one shared `TeleportRequest` `RemoteEvent`.
- Server Luau that validates the requested Place ID against generated configuration and calls `TeleportService:TeleportAsync()` inside `pcall`.
- Preview feedback that identifies the destination without attempting a real teleport.
- JSON round-trip, localStorage, undo/redo, duplication, client/server downloads, and existing action compatibility.

### Excluded

- Reserved servers, specific public server instances, teleport data, spawn names, parties, or group teleports.
- Automatic retry policy or custom teleport loading screens.
- Live teleport execution from this web editor or Roblox Studio.
- Fetching Roblox place metadata or checking ownership.

## Scene Contract

Extend `NodeAction` with:

```ts
type TeleportAction = {
  type: "teleport";
  placeId: string;
};
```

The Place ID remains a decimal string so input and JSON do not normalize its representation. A valid value contains only ASCII digits, represents a positive integer, has no leading sign, whitespace, or zeroes, and is no greater than `9,007,199,254,740,991` (`Number.MAX_SAFE_INTEGER`). The upper bound prevents precision loss when the server converts the string to a Luau `number` for `TeleportAsync`.

Invalid imported actions are removed at the persistence boundary. Runtime generators independently ignore malformed actions so directly constructed scenes cannot emit unsafe or broken Luau.

## Editor Behavior

`Teleport` appears alongside existing button action types. Selecting it shows one `Place ID` input with concise validation text.

The input keeps a local draft. Invalid typing remains visible but does not overwrite the last valid scene action, matching the RemoteEvent field behavior. Switching action types discards the draft. A valid change is undoable and persists through localStorage and JSON export.

In Preview, clicking a Teleport button displays `Teleport to Place <id>`. Preview does not mutate the scene, add history entries, or invoke browser navigation.

## Generated Client Luau

When at least one emitted button has a valid Teleport action, client output:

1. Gets `ReplicatedStorage` and waits for the generator-owned `RGM` folder.
2. Waits once for `TeleportRequest`.
3. Connects each Teleport button and fires the configured Place ID as a decimal string.

Sending a string preserves the validated identifier exactly. The server converts the value only after matching it against the generated string allowlist.

If a scene has no valid Teleport actions, no Teleport-specific client setup is emitted.

## Generated Server Luau

When at least one valid Teleport action exists, server output:

1. Gets `ReplicatedStorage` and `TeleportService`.
2. Creates or reuses `ReplicatedStorage.RGM` using the existing class-conflict checks.
3. Creates or reuses a `RemoteEvent` named `TeleportRequest`.
4. Builds a deterministic allowlist from unique configured Place ID strings.
5. Rejects values whose type is not `string` or which are absent from the allowlist.
6. Converts an allowed value with `tonumber`, then calls `TeleportService:TeleportAsync(placeId, { player })` inside `pcall`.
7. Warns with the destination and failure reason if the call throws.

The shared event is intentionally generated once. A client exploiter may request any destination already present in the exported GUI, but cannot request arbitrary Place IDs. Per-button authorization is out of scope because UI visibility is not a security boundary.

Existing custom RemoteEvent handlers remain in the same server output and continue using `ReplicatedStorage.Remotes`. Keeping generated control traffic in `ReplicatedStorage.RGM` prevents a user-defined `TeleportRequest` event from accidentally receiving both custom and teleport handlers.

## Failure Handling

- Invalid editor input shows an inline error and preserves the last valid generated output.
- Invalid imported or runtime action data emits no Teleport binding.
- Server requests outside the allowlist return without teleporting.
- `TeleportAsync` failures are caught and reported with `warn`; no automatic retry is generated.
- Preview states explicitly that no live teleport occurs.

Roblox documents that `TeleportAsync` is server-only, recommends it over client teleports, and does not support teleport playtesting in Studio. End-to-end destination travel therefore requires a published experience and the Roblox client.

## Verification

- Unit tests for Place ID validation, persistence sanitization, duplication, and malformed runtime actions.
- Generator tests for one shared request event, deterministic allowlist output, client bindings, custom-event name conflicts, and absence when unused.
- Regression tests for visibility and custom RemoteEvent actions.
- TypeScript and production build verification.
- Browser verification for action editing, invalid drafts, undo/redo, Preview notice, refresh, JSON round-trip, and both Luau downloads.
- Generated Luau will be inspected but not claimed as live-teleport-tested.
