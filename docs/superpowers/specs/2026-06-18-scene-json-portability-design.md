# Scene JSON Portability Design

## Goal

Add a versioned project-file format so users can move Roblox GUI Maker scenes
between browsers, keep backups, and provide a stable input boundary for future
AI scene generation. Also correct the current Chinese language annotation and
outdated `UDim2.fromScale` marketing copy.

## Scope

### Included

- Export the current scene as a versioned JSON project file.
- Import a project file through the editor toolbar.
- Validate imported nodes with the same rules used for localStorage recovery.
- Repair missing parents and cycles before accepting an imported scene.
- Replace the current scene as one undoable editor operation.
- Select the imported root `ScreenGui` after a successful import.
- Show a concise, accessible error when import fails.
- Mark the Chinese page content as `zh-CN`.
- Update product copy to describe explicit `UDim2.new` export accurately.

### Excluded

- AI prompt-to-scene generation.
- Importing arbitrary Roblox XML, `.rbxl`, `.rbxm`, or Luau.
- Merging an imported scene into the current scene.
- Supporting multiple project-file versions in this first implementation.
- Adding cloud storage or accounts.

## File Format

The exported document is UTF-8 JSON with two-space indentation:

```json
{
  "format": "roblox-gui-maker",
  "version": 1,
  "scene": []
}
```

`format` and `version` are required and exact. `scene` must be a non-empty
array after sanitization. Optional `SceneNode` fields remain optional so old
scale-only scenes do not gain mechanical data churn.

The downloaded filename is derived from the root `ScreenGui` name, normalized
to a lowercase ASCII-safe slug, with `roblox-gui-project.json` as the fallback.

## Architecture

Create `app/editor/persistence.ts` as the pure project-data boundary. Move the
existing node sanitization and parent repair logic out of `Editor.tsx` into this
module so localStorage loading and JSON import cannot diverge.

The module exposes operations equivalent to:

- `sanitizeScene(raw): SceneNode[] | null`
- `parseSceneDocument(text): SceneNode[]`
- `serializeSceneDocument(scene): string`
- `sceneDocumentFilename(scene): string`

Parsing throws a specific `Error` for invalid JSON, wrong format, unsupported
version, or an empty/invalid scene. Serialization accepts the current trusted
editor scene and emits the versioned envelope.

## Editor Flow

`Toolbar` receives import and export callbacks. Import uses a hidden
`input[type=file]` restricted to JSON. Selecting a file reads it as text and
passes the text to `Editor`.

On successful import, `Editor`:

1. Parses and sanitizes the document.
2. Replaces the scene.
3. Records the replacement as one immediate history entry.
4. Selects the root `ScreenGui`, or the first imported node if no root exists.
5. Clears any previous import error.

Undo restores the scene that existed immediately before import. Redo restores
the imported scene.

On failure, the current scene and history remain unchanged. The toolbar area
shows a short `role="alert"` message. Selecting another file or completing a
successful import clears the message.

Export serializes the current scene and downloads it with the derived filename.
It does not mutate scene state or history.

## Content Corrections

The `/zh` page marks its main Chinese content container with `lang="zh-CN"`.
The shared English navigation and footer remain unchanged in this phase.

Marketing references that describe this editor's generated positioning change
from `UDim2.fromScale` to `UDim2.new`, matching the current four-value exporter.
Tutorial code examples that intentionally teach `UDim2.fromScale` remain
unchanged.

## Testing

Unit tests cover:

- Round-trip serialization of responsive geometry and actions.
- Rejection of invalid JSON, wrong format, and unsupported versions.
- Sanitization of malformed optional geometry.
- Parent repair and cycle removal.
- Stable fallback and normalized filenames.
- Imported scene independence from parsed input object references.

Existing scene, geometry, type, and production-build checks remain required.
The browser verification covers export download, successful import, invalid
import feedback, and undo/redo around a scene replacement.

## Success Criteria

- A project exported in one browser can be imported into a fresh editor and
  produces equivalent canvas geometry and Luau.
- Invalid files never replace or partially mutate the current scene.
- Import is one undoable operation.
- localStorage and file import use the same sanitization rules.
- All tests, TypeScript checks, and the production build pass.
