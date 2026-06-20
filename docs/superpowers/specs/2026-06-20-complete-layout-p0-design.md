# Complete Layout P0 Design

## Goal

Make list, grid, and scrolling layouts usable for production Roblox shops,
inventories, menus, and leaderboards without requiring creators to replace the
generated layout code in Studio.

This phase follows Visual Assets P0. It adds explicit List and Grid controls,
responsive Scale plus Offset values, alignment, and automatic scrolling canvas
behavior across editor controls, canvas preview, public template previews,
persistence, and generated Luau.

## User Outcome

A creator can select a container and control how its children flow:

- switch a list between vertical and horizontal;
- set list spacing with Roblox-native Scale and Offset;
- align list or grid content horizontally and vertically;
- set responsive grid cell size and cell padding;
- make a ScrollingFrame grow its canvas on the X axis, Y axis, or both;
- preview the result in the editor and export matching Luau.

## Scope

### Include

- UIListLayout fill direction, padding, horizontal alignment, and vertical
  alignment.
- UIGridLayout cell size, cell padding, horizontal alignment, and vertical
  alignment.
- ScrollingFrame AutomaticCanvasSize for None, X, Y, and XY.
- Shared layout behavior for editor Canvas and public ScenePreview.
- Version 1 JSON persistence, subtree duplication, undo/redo, template loading,
  project package export, and deterministic Luau generation.
- Explicit Shop and Inventory template examples using the new fields.

### Exclude

- UIPageLayout and page navigation.
- UIGridLayout StartCorner, FillDirection, and FillDirectionMaxCells.
- Manual ScrollingFrame CanvasSize editing.
- Scroll bar thickness, color, position, or elastic behavior.
- Per-child flex, UIFlexItem, wrap layouts, and automatic size controls.
- Tween animation and dynamic repeated data.
- Visual redesign of existing templates.

## Approaches Considered

### Selected: Optional SceneNode Fields

Keep the existing `layout?: "list" | "grid"` discriminator and add optional,
namespaced layout fields. This preserves every existing template and version 1
project while allowing current defaults to remain implicit.

### Rejected: Replace Layout With A Union Object

A discriminated `layout` object would be tidy in isolation, but it would force a
scene migration, rewrite every template, and complicate version 1 compatibility
for no immediate user benefit.

### Rejected: Independent Layout Hierarchy Nodes

Standalone UIListLayout and UIGridLayout tree nodes match Roblox Explorer, but
they would expand hierarchy selection, drag/drop, duplication, deletion, and
container ownership rules beyond this phase.

## Scene Contract

Add these optional fields to `SceneNode`:

```ts
type UDimValue = {
  scale: number;
  offset: number;
};

type UDim2Value = {
  scale: { x: number; y: number };
  offset: { x: number; y: number };
};

listDirection?: "vertical" | "horizontal";
listGap?: UDimValue;

layoutHorizontalAlignment?: "left" | "center" | "right";
layoutVerticalAlignment?: "top" | "center" | "bottom";

gridCellSize?: UDim2Value;
gridCellPadding?: UDim2Value;

automaticCanvasSize?: "none" | "x" | "y" | "xy";
```

Defaults preserve existing output:

```ts
listDirection = "vertical"
listGap = { scale: 0, offset: 8 }
layoutHorizontalAlignment = "left"
layoutVerticalAlignment = "top"
gridCellSize = { scale: { x: 0, y: 0 }, offset: { x: 100, y: 100 } }
gridCellPadding = { scale: { x: 0, y: 0 }, offset: { x: 8, y: 8 } }
automaticCanvasSize = "none"
```

Inactive List and Grid fields remain in the scene when creators switch layout
type. Switching back restores the previous settings. Canvas and Luau use only
the fields applicable to the active layout.

## Shared Layout Module

Create `app/editor/layout.ts` as the single source for layout defaults and
mapping behavior. It owns:

- default-resolving helpers for List and Grid configuration;
- Scale and Offset normalization;
- enum validation and persistence sanitization helpers;
- CSS `calc(...)` conversion for UDim values;
- shared container style generation for Canvas and ScenePreview;
- Roblox enum mapping used by Luau generation.

The module remains pure and has no network or browser side effects. CSS mapping
returns serializable style data so both client and server-rendered previews can
consume it.

## Properties Panel

Create `app/editor/LayoutProperties.tsx` and render it from the current
PropertiesPanel for ScreenGui, Frame, and ScrollingFrame containers.

The controls are conditional:

- no active layout: show Layout and existing content Padding only;
- List: show Direction, Gap Scale/Offset, horizontal alignment, and vertical
  alignment;
- Grid: show CellSize Scale/Offset for X and Y, CellPadding Scale/Offset for X
  and Y, horizontal alignment, and vertical alignment;
- ScrollingFrame: always show AutomaticCanvasSize in the same layout section.

Existing `padding` remains UIPadding around the container content. `listGap`
and `gridCellPadding` remain spacing between children. Labels must use the
Roblox property names in supporting copy so creators can transfer knowledge to
Studio.

Applying UIListLayout or UIGridLayout from the palette continues toggling the
active `layout` value. Newly created explicit settings are optional; applying a
layout to an old node immediately uses the compatibility defaults.

## Canvas And Public Preview

Canvas and ScenePreview call the same layout-style helper.

### List

- Vertical uses `flex-direction: column`.
- Horizontal uses `flex-direction: row`.
- Gap uses `calc(scale * 100% + offset px)`.
- Horizontal and vertical alignment map to the correct flex cross/main axis
  based on list direction.

### Grid

- Cell width drives `grid-template-columns` through repeated fixed responsive
  tracks.
- Cell height drives `grid-auto-rows`.
- X padding maps to column gap; Y padding maps to row gap.
- Horizontal and vertical alignment map to `justify-content` and
  `align-content`.

### ScrollingFrame

- None keeps hidden overflow, matching current editor behavior.
- X enables horizontal scrolling only.
- Y enables vertical scrolling only.
- XY enables both axes.
- List/Grid content is allowed to exceed the visible frame so scroll behavior
  is observable.
- Manual-position children continue using their absolute geometry and can
  contribute to scroll overflow when they extend beyond the frame.

Browser CSS remains an approximation of Roblox layout rounding. The same Scale
and Offset values are preserved exactly for Luau.

## Luau Generation

List output uses:

```luau
layout.FillDirection = Enum.FillDirection.Vertical
layout.Padding = UDim.new(0, 8)
layout.HorizontalAlignment = Enum.HorizontalAlignment.Left
layout.VerticalAlignment = Enum.VerticalAlignment.Top
```

Grid output uses:

```luau
grid.CellSize = UDim2.new(0, 100, 0, 100)
grid.CellPadding = UDim2.new(0, 8, 0, 8)
grid.HorizontalAlignment = Enum.HorizontalAlignment.Left
grid.VerticalAlignment = Enum.VerticalAlignment.Top
```

ScrollingFrame output uses:

```luau
scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
scroll.CanvasSize = UDim2.fromScale(0, 0)
```

`CanvasSize` is emitted only when AutomaticCanvasSize is not None. Existing
default layout output remains byte-for-byte equivalent apart from explicit
alignment assignments if the generator standardizes them for all layouts.

## Persistence And Compatibility

Keep project document version 1 because all fields are optional and existing
meaning is unchanged.

At the import boundary:

- clamp every Scale value to `0..1`;
- clamp List Gap and Grid Offset values to `0..4096`;
- round Offset values to integers;
- accept only defined direction and alignment values;
- accept AutomaticCanvasSize only on ScrollingFrame;
- discard malformed optional layout fields without removing an otherwise valid
  scene node;
- deep-clone nested Scale and Offset objects during subtree duplication.

The editor controls apply the same bounds before writing to the live scene.

## Template Policy

- Shop explicitly configures its ItemGrid ScrollingFrame with Y automatic
  canvas sizing and responsive Grid cell settings.
- Inventory explicitly configures its Slots Grid cell size and padding.
- Other templates keep implicit compatibility defaults.
- Template colors, text, hierarchy, and purpose do not change in this phase.

ScenePreview must consume the same layout rules before these template changes
are accepted, preventing public template pages from drifting from the editor.

## Error Handling

- Invalid numeric drafts remain visible locally and do not overwrite the last
  valid scene value.
- Invalid imported fields are omitted or clamped according to the rules above.
- Layout removal never deletes children or their explicit LayoutOrder.
- AutomaticCanvasSize on a non-ScrollingFrame is ignored during import and
  export.
- Luau generation does not throw when optional layout fields are absent or
  malformed at runtime; it resolves compatibility defaults.

## Testing

Use test-driven development for every production behavior.

### Unit

- Resolve all compatibility defaults.
- Sanitize every new field, including enum and numeric boundaries.
- Preserve valid fields through version 1 JSON round-trip.
- Deep-clone List and Grid nested values.
- Map vertical and horizontal List settings to CSS.
- Map Grid cells, gaps, and alignment to CSS.
- Map each AutomaticCanvasSize mode.
- Generate exact Luau for List, Grid, and ScrollingFrame.
- Preserve existing generated defaults for legacy scenes.

### Template Contracts

- Shop ItemGrid is a ScrollingFrame with Grid layout and Y automatic canvas.
- Inventory Slots has explicit Grid cell size and padding.
- Every template retains valid IDs, parent references, and action targets.

### Browser

- Edit List direction, gap, and alignment.
- Edit Grid cell size, padding, and alignment.
- Enable automatic Y scrolling and observe overflow behavior without depending
  on browser-native scrollbar appearance.
- Verify Undo/Redo, refresh, JSON export/import, ZIP, and Luau output.
- Verify Shop and Inventory public previews and editor entry paths.
- Verify no horizontal page overflow or console errors.

### Release Gates

- focused Vitest suites during red-green cycles;
- full `npm test`;
- `npx tsc --noEmit`;
- `npm run build`;
- `npm run test:e2e:smoke`;
- `npm run test:e2e:full`.

## Delivery Order

1. Shared types, defaults, sanitization, and pure CSS mapping.
2. Persistence compatibility and deep-copy behavior.
3. Exact Luau generation.
4. Conditional layout property controls.
5. Canvas and ScenePreview integration.
6. Shop and Inventory template adoption.
7. Browser journey and full release verification.

## Risks And Mitigations

- **Canvas/Roblox drift:** use one shared default and mapping module; generated
  Roblox values remain authoritative.
- **Existing template changes:** preserve implicit defaults and update only Shop
  and Inventory with intentional explicit settings.
- **Nested object aliasing:** deep-copy layout values in duplication and
  persistence sanitization tests.
- **Property-panel growth:** keep layout-specific controls in a focused
  LayoutProperties component.
- **Scope expansion:** defer page layouts, grid traversal controls, manual
  canvas size, scroll styling, and animation.

## Next Phase Rule

When Complete Layout P0 is implemented and verified, the phase closeout must
record evidence and produce the reviewed specification and implementation plan
for Tween Presets before stopping.
