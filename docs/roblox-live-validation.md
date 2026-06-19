# Roblox Live Validation

**Status:** BLOCKED — no authenticated Roblox Studio/client or published test experience is available on this machine.

This checklist is the release gate for behavior that cannot be proven by browser, TypeScript, or generated-code tests. Roblox TeleportService must be exercised from a published experience in the Roblox client, not Studio playtesting.

## Prerequisites

- [ ] Install Roblox Studio and the Roblox client.
- [ ] Authenticate with an account authorized to edit the source experience.
- [ ] Provide a published source experience.
- [ ] Provide a published destination Place owned by the tester.
- [ ] Enable third-party teleports only if the destination is outside the source experience and the test explicitly requires it.
- [ ] Generate fresh client and server Luau from the commit being validated.

Credentials, session cookies, private server access codes, and API keys must never be committed to this repository or pasted into this document.

## Installation

- [ ] Paste `roblox-gui.client.lua` from the ZIP package into a `LocalScript` under `StarterGui` (or use the equivalent single-file `roblox-gui.lua` download).
- [ ] Paste `roblox-gui.server.lua` into a `Script` under `ServerScriptService`.
- [ ] Confirm `ReplicatedStorage.Remotes` contains the configured user RemoteEvents.
- [ ] Confirm `ReplicatedStorage.RGM.TeleportRequest` exists and is a `RemoteEvent`.

## RemoteEvent Checks

- [ ] Clicking the configured RemoteEvent button reaches only its expected server handler.
- [ ] A custom event named `TeleportRequest` remains under `ReplicatedStorage.Remotes` and does not invoke the generated Teleport handler.
- [ ] An unexpected RemoteEvent argument produces the generated warning and does not execute gameplay logic.

## Teleport Checks

- [ ] Clicking the configured Teleport button moves the player to the allowlisted destination in the Roblox client.
- [ ] A request for an unlisted Place ID is rejected and produces the generated server warning.
- [ ] A failed allowed Teleport is caught by `pcall` and records the destination and failure reason.
- [ ] No client-side call can bypass the generated server allowlist.

## Evidence

| Field | Value |
| --- | --- |
| Source universe ID | Not recorded |
| Source Place ID | Not recorded |
| Destination Place ID | Not recorded |
| Generated commit | Not recorded |
| Test date and timezone | Not recorded |
| Tester | Not recorded |
| Roblox client version | Not recorded |
| Result | BLOCKED |

## Observations

No live Roblox runtime observations have been recorded. Replace this sentence with concise results only after every relevant checkbox has evidence.
