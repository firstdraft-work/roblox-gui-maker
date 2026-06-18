# Responsive Layout Design

## Goal

Add Roblox-native responsive layout editing without breaking existing scenes or expanding into device-specific overrides. Users can edit Scale and Offset together, set AnchorPoint, and add common size constraints while canvas preview and exported Luau remain consistent.

## Scope

### Included

- Four-value Position editing: X Scale, X Offset, Y Scale, Y Offset.
- Four-value Size editing: X Scale, X Offset, Y Scale, Y Offset.
- AnchorPoint X/Y editing.
- Nine-point alignment shortcuts.
- Optional aspect-ratio constraint.
- Optional minimum and maximum pixel size constraints.
- Canvas rendering for offsets, anchors, aspect ratio, and min/max size.
- Luau export using `UDim2.new(...)`, `UIAspectRatioConstraint`, and `UISizeConstraint`.
- Backward-compatible localStorage loading, undo/redo, duplication, and templates.

### Excluded

- Per-device property overrides or breakpoint rules.
- Automatic responsive layout generation.
- Full Roblox constraint property coverage such as selectable dominant axes or aspect types.
- Alignment guides, snapping, multi-select, and distribution tools.

## Data Model

Extend `SceneNode` with optional fields so all existing scenes retain their current meaning:

```ts
pos: { x: number; y: number }
posOffset?: { x: number; y: number }
size: { x: number; y: number }
sizeOffset?: { x: number; y: number }
anchor?: { x: number; y: number }
aspectRatio?: number
minSize?: { x: number; y: number }
maxSize?: { x: number; y: number }
```

Defaults are Offset `0,0`, AnchorPoint `0,0`, and no constraints. Optional vectors are deep-cloned in history snapshots and subtree duplication.

## Geometry Rules

Create `app/editor/geometry.ts` for pure responsive-layout operations.

### Canvas Style

- Position axes render as `calc(scale * 100% + offset px)`.
- Size axes render using the same formula.
- AnchorPoint renders as `translate(-anchorX * 100%, -anchorY * 100%)`.
- Min and max sizes render as CSS pixel constraints.
- Aspect ratio uses width as the dominant axis in the editor and exported constraint. This phase does not expose dominant-axis selection.

### Anchor Compensation

Changing AnchorPoint must preserve the element's visible top-left position:

```text
newPositionScale  = oldPositionScale  + (newAnchor - oldAnchor) * sizeScale
newPositionOffset = oldPositionOffset + (newAnchor - oldAnchor) * sizeOffset
```

The operation returns one patch so undo restores both AnchorPoint and Position in one step.

### Nine-Point Alignment

The preset grid represents X/Y values `0`, `0.5`, and `1`.

- Set AnchorPoint to the selected values.
- Set Position Scale to the same values.
- Set Position Offset to `0,0`.
- Preserve Size.

This gives deterministic top-left, edge-center, center, and corner alignment against the current parent.

### Direct Manipulation

Canvas move and resize continue changing Scale values based on pointer deltas. Existing Position and Size Offset values remain unchanged. Flow-layout children remain non-draggable as before.

## Properties Panel

Replace each two-value Position/Size row with a compact four-value editor:

- X row: Scale and Offset
- Y row: Scale and Offset

Add an AnchorPoint numeric pair and a labeled nine-point preset grid. Add separate toggles for Aspect Ratio and Size Constraints so absent constraints do not clutter Luau output.

Validation rules:

- Scale and Offset must be finite numbers.
- AnchorPoint is clamped to `0..1`.
- Aspect ratio must be finite and greater than zero.
- Min and max dimensions must be finite and non-negative.
- When both bounds exist, Max must be greater than or equal to Min on each axis.
- Invalid optional saved values are dropped during sanitization; they do not invalidate the whole saved scene.

## Luau Export

Position and Size always export with explicit scale and offset values:

```lua
element.Position = UDim2.new(xScale, xOffset, yScale, yOffset)
element.Size = UDim2.new(xScale, xOffset, yScale, yOffset)
element.AnchorPoint = Vector2.new(x, y)
```

`AnchorPoint` may be omitted when both values are zero. When enabled, constraints are created after the GUI object and parented to it:

```lua
local element_aspect = Instance.new("UIAspectRatioConstraint")
element_aspect.AspectRatio = 1.778
element_aspect.DominantAxis = Enum.DominantAxis.Width
element_aspect.Parent = element

local element_size = Instance.new("UISizeConstraint")
element_size.MinSize = Vector2.new(320, 180)
element_size.MaxSize = Vector2.new(960, 540)
element_size.Parent = element
```

No constraint instance is generated when its corresponding scene field is absent.

## Compatibility

- Existing templates need no data migration or mechanical rewrite.
- Missing optional fields retain the exact current scale-only canvas geometry.
- localStorage sanitization accepts both old and new scene shapes.
- New optional vectors are cloned during history snapshots and subtree duplication to prevent shared references.
- Existing hierarchy, actions, Preview mode, and `LayoutOrder` generation remain unchanged.

## Testing

### Unit Tests

- CSS geometry with scale-only, offset, anchor, aspect, and min/max combinations.
- Anchor compensation for scale-only, offset-only, and mixed sizes.
- All nine alignment presets.
- Constraint validation and invalid saved-field sanitization.
- Luau `UDim2.new`, `Vector2`, and optional constraint generation.
- Duplication and history cloning of all optional vectors.

### Browser Verification

- Edit all four Position and Size values and confirm canvas updates.
- Change AnchorPoint without a visible jump.
- Apply center and corner presets.
- Enable aspect and size constraints.
- Compare Desktop, Tablet, and Mobile previews.
- Undo/redo, refresh, and inspect generated Luau.
- Confirm zero console errors.

### Completion Gates

- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- Production-mode browser verification

## Risks

- **Canvas/Roblox geometry drift:** keep geometry calculations in one pure module and test representative parent sizes.
- **Anchor changes causing jumps:** only expose the compensated anchor operation to the properties panel.
- **Old saved scenes becoming invalid:** treat every new field as optional and independently sanitized.
- **Constraint behavior ambiguity:** fix the first version to width-dominant aspect ratio and document that limitation in the UI.
