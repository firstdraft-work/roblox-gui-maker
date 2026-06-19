# ZIP Project Export Design

## Goal

Let users download one self-contained Roblox GUI project package instead of collecting the scene document and generated Luau files separately.

## User Experience

The editor export area adds a **Download ZIP** action alongside the existing per-file downloads. The download is generated entirely in the browser and does not upload project data.

The archive filename is derived from the current scene document filename and ends in `.zip`. It contains:

- `README.md` with concise Roblox Studio installation instructions.
- `project.json` containing the existing portable scene document format.
- `roblox-gui.client.lua` containing the generated client Luau.
- `roblox-gui.server.lua` only when the scene generates server-side RemoteEvent or Teleport handlers.

Existing JSON export, client/server Luau downloads, and copy controls remain unchanged.

## Architecture

A pure package-building module accepts the scene, generated client Luau, and optional server Luau. It returns the archive filename and ZIP bytes. The module owns archive filenames and README content so they can be unit-tested independently of React and browser download APIs.

The editor calls this module and uses the existing Blob-and-anchor download pattern. `fflate` provides standards-compliant ZIP encoding without introducing a server route or maintaining a custom archive implementation.

The download control belongs in `CodePanel`, where generated Luau export already lives. The control invokes a dedicated package callback and remains available even when no server script is required.

## Error Handling

Package generation operates only on the editor's already-sanitized scene and generated strings. ZIP creation errors are not silently swallowed; they surface through the browser error path. Object URLs are revoked after the browser has accepted the download.

## Testing

Unit tests inspect the generated ZIP and verify:

- the stable required entries and their exact generated contents;
- conditional inclusion of the server script;
- a valid `.zip` filename derived from the scene document name;
- README placement instructions for client and optional server scripts.

The full Playwright editor journey downloads the package and verifies its suggested filename and archive entries. Existing unit, type, build, smoke, and full browser suites remain the regression gates.

## Constraints And Non-Goals

- No `.rbxmx` output is claimed because Roblox Studio is unavailable for compatibility validation.
- No server-side archive endpoint or project storage is introduced.
- No Rojo-specific project structure is promised; this is a portable handoff bundle for Roblox Studio.
- No changes are made to the scene JSON schema or generated Luau semantics.
