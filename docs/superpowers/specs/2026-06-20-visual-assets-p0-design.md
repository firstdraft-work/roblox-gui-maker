# Visual Assets P0 Design

## Goal

Close the highest-impact visual fidelity gap in the Roblox GUI Maker editor by
supporting real Roblox image assets, strokes, rotation, and responsive text
flags across editing, browser preview, persistence, and generated Luau.

This is the first delivery phase from the YouTube workflow comparison. Complete
layout controls, animation presets, Studio round-tripping, and dynamic data
binding remain separate later phases.

## User Outcome

A creator can select an `ImageLabel`, enter a Roblox asset ID, tint it, rotate
it, add a stroke, and see a useful browser preview. Text elements can opt into
Roblox-native scaled or wrapped text behavior. Exported projects retain those
choices, and generated Luau recreates them without manual cleanup.

## Scope

### Include

- `ImageLabel.Image` using a numeric Roblox asset ID or an
  `rbxassetid://<digits>` value.
- `ImageLabel.ImageColor3`.
- `GuiObject.Rotation` for visual scene nodes.
- `TextLabel`, `TextButton`, and `TextBox` `TextScaled` and `TextWrapped`.
- `UIStroke` decoration with color, transparency, and thickness.
- Browser preview for public Roblox image assets through the official Roblox
  thumbnails API.
- Persistence sanitization, JSON round-trip, subtree duplication, undo/redo,
  canvas rendering, template compatibility, and Luau generation.

### Exclude

- Uploading local files or publishing assets to Roblox.
- Arbitrary HTTP image URLs, third-party image proxies, or authenticated/private
  asset access.
- Image crop, slice, tiling, resampling, or `ImageRectOffset` controls.
- Stroke line joins, stroke sizing modes, gradients on strokes, or independent
  `UIStroke` hierarchy nodes.
- Animation, hover states, layout expansion, data binding, `.rbxmx`, and Studio
  plugin work.

## Approaches Considered

### Selected: Scene Node Properties

Store these capabilities as optional `SceneNode` fields. This matches existing
decorators such as corner radius, gradient, layout, and padding. It preserves
the current editing and history model while keeping export deterministic.

### Rejected: Independent Decorator Nodes

Representing `UIStroke` as a hierarchy node mirrors Roblox more closely, but it
would expand selection, drag-and-drop, deletion, duplication, and persistence
rules for no immediate user benefit.

### Rejected: Preview-Only CSS With Export Overrides

Keeping the new values outside the scene contract would be faster initially,
but preview, saved projects, undo history, and generated Luau could disagree.

## Scene Contract

Add these optional fields to `SceneNode`:

```ts
image?: string;
imageColor?: string;
rotation?: number;
textScaled?: boolean;
textWrapped?: boolean;
stroke?: {
  color: string;
  transparency: number;
  thickness: number;
};
```

`image` uses the canonical form `rbxassetid://<digits>`. Editor input accepts
either digits or that canonical form. Empty input removes the property. Other
schemes, decimal values, signs, whitespace within the number, and non-numeric
identifiers are invalid and must not overwrite the last valid scene value.

Defaults preserve existing projects:

- missing `imageColor` renders and exports as white;
- missing `rotation` means zero degrees;
- missing text flags means Roblox defaults (`false`);
- missing `stroke` means no `UIStroke` instance.

## Asset Preview

The browser cannot render `rbxassetid://` directly. A focused client hook or
component extracts the numeric ID, requests:

`https://thumbnails.roblox.com/v1/assets?assetIds=<id>&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`

and uses the returned Roblox CDN URL for the canvas preview.

The preview layer must:

- cache the resolved URL by asset ID in memory;
- ignore stale responses after the selected ID changes;
- treat non-`Completed` states, malformed JSON, HTTP errors, and network errors
  as an unavailable preview;
- show a stable asset placeholder containing the ID when unavailable;
- never block editing, persistence, or Luau export on thumbnail resolution.

No server route or third-party proxy is introduced in this phase. The thumbnail
endpoint is public but rate-limited, so one cached request per ID is the intended
boundary.

## Properties Panel

The existing property groups remain intact.

- `Rotation` appears in the Layout group for all visual nodes except
  `ScreenGui`.
- An Image group appears only for `ImageLabel`, with Asset ID and ImageColor3.
- `TextScaled` and `TextWrapped` appear in the existing Text group.
- A Stroke group appears for `Frame`, `TextLabel`, `TextButton`, `TextBox`,
  `ImageLabel`, and `ScrollingFrame`.
- Enabling Stroke creates the default `{ color: "#000000", transparency: 0,
  thickness: 1 }`; disabling it removes the property.

Asset ID input keeps a local draft so an incomplete or invalid edit remains
visible without corrupting the scene. A concise inline error explains that only
a numeric Roblox asset ID is accepted.

## Canvas Rendering

- `rotation` maps to CSS `transform: rotate(...)` while preserving the existing
  anchor translation from responsive geometry.
- `stroke` maps to an inset CSS box shadow for containers and text shadow for
  text. This is an editor approximation; generated Luau remains authoritative.
- `imageColor` applies a browser tint approximation only when an image preview
  is available.
- `textScaled` uses a container-relative CSS size approximation while
  `textWrapped` controls wrapping. The editor need not reproduce Roblox's text
  engine pixel-for-pixel.
- The resolved thumbnail is decorative editor content and carries empty alt
  text so the selected node name remains the accessible identity.

Canvas approximations must not change exported Roblox values.

## Luau Generation

For applicable nodes, emit:

```luau
image.Image = "rbxassetid://123"
image.ImageColor3 = Color3.fromRGB(...)
element.Rotation = 15
text.TextScaled = true
text.TextWrapped = true

local element_stroke = Instance.new("UIStroke")
element_stroke.Color = Color3.fromRGB(...)
element_stroke.Transparency = 0.25
element_stroke.Thickness = 2
element_stroke.Parent = element
```

Do not emit default-valued optional properties unless the user explicitly
enabled the corresponding capability. Variable naming follows the existing
deterministic element-index convention.

## Persistence And Compatibility

Keep project document version `1` because all new fields are optional and old
documents retain identical meaning.

At the import boundary:

- accept only canonicalizable image asset IDs;
- accept `imageColor` and stroke color only as six-digit hex values;
- clamp stroke transparency to `0..1`;
- clamp stroke thickness to `0..100`;
- clamp rotation to `-360..360`;
- accept text flags only as booleans;
- discard class-inapplicable image and text fields;
- repair malformed optional fields without rejecting an otherwise valid scene.

Subtree duplication and undo/redo use scene snapshots, so optional scalar fields
copy naturally. The nested `stroke` object must be cloned to prevent mutations
from aliasing the source node.

## Error Handling

- Invalid asset input produces an inline validation error and no scene mutation.
- Thumbnail failures produce the stable placeholder and no global editor error.
- Import sanitization fails closed for malformed optional values by dropping or
  clamping them according to the rules above.
- Luau generation never performs network access and requires only the canonical
  scene value.

## Testing

Use test-driven development for every production behavior.

### Unit

- Canonicalize accepted asset ID forms and reject invalid forms.
- Sanitize every new optional property, including bounds and class applicability.
- Preserve new fields through JSON serialization and parsing.
- Deep-clone stroke data when duplicating a subtree.
- Generate exact Luau assignments and `UIStroke` parenting.
- Resolve completed thumbnail responses and reject unavailable or malformed
  responses through a pure parser that does not require network mocks.

### Component And Browser

- Edit an ImageLabel asset ID, tint, rotation, stroke, and text flags where
  applicable.
- Verify the canvas exposes the expected preview state without depending on a
  live thumbnail response.
- Export JSON, import it again, and verify values remain present.
- Inspect generated Luau for all new Roblox properties.
- Confirm existing templates still open and export.

### Release Gates

- focused Vitest suites during each red-green cycle;
- full `npm test`;
- `npx tsc --noEmit`;
- `npm run build`;
- relevant Playwright smoke/full journey against the production build.

## Delivery Order

1. Asset ID normalization and persistence contract.
2. Luau output and deep-copy guarantees.
3. Properties panel controls.
4. Thumbnail resolution and canvas approximations.
5. Browser regression coverage and full verification.

## Risks And Mitigations

- **Thumbnail rate limits:** cache by ID and fall back without blocking editing.
- **Browser/Roblox visual mismatch:** label canvas effects as approximations in
  implementation comments only where necessary; generated Luau is authoritative.
- **Scene contract drift:** keep one canonical property model across editor,
  persistence, preview, and export.
- **Scope expansion:** defer uploads, advanced image controls, layout, and
  animation to their own specifications.

## Follow-On Roadmap

After this phase is verified and released:

1. Complete layout controls: list/grid direction and alignment, cell size and
   padding, automatic scrolling canvas, and page layout.
2. Tween presets for open, close, fade, slide, scale, and hover.
3. Studio handoff through a validated plugin or `.rbxmx` path.
4. Dynamic data binding for player values, text input, progress, and repeated
   collections.
