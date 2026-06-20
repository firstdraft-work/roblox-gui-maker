# High-Intent Templates Design

## Goal

Add four useful, editable Roblox GUI starting points for high-intent creator tasks: selling game passes, entering redemption codes, claiming daily rewards, and tracking quests. Each template must look credible on its public detail page, open directly in the editor, and remain honest about which behavior is previewable versus which behavior requires Roblox Studio server logic.

## Visual Direction

Use the approved productized-controls direction:

- a consistent dark interface foundation across all four templates;
- one restrained accent color per template so their purpose remains recognizable;
- real labels, states, prices, progress, and reward details instead of placeholder boxes;
- readable hierarchy and practical controls rather than decorative game art;
- layouts that remain editable and understandable in the existing visual editor.

This direction fits the current product and produces stronger public template previews without forcing creators to undo a highly specific game theme.

## Template Definitions

### Game Pass Shop

- **Slug:** `game-pass-shop`
- **Category:** `Shop`
- **Purpose:** A premium pass storefront with a title, supporting copy, three pass cards, benefit summaries, prices, and purchase controls.
- **Interaction:** Each purchase button fires the same `PurchaseGamePass` RemoteEvent with a distinct static pass key such as `vip`, `double-coins`, or `speed-coil`.
- **Boundary:** The generated client request does not grant ownership or complete a Marketplace purchase. The creator must validate the request and call the appropriate Roblox purchase flow from trusted game code.

### Code Redeem

- **Slug:** `code-redeem`
- **Category:** `Menus`
- **Purpose:** A code entry panel with a TextBox, redeem control, status copy, and a small list of example rewards or recent codes.
- **Interaction:** The layout is immediately editable, but the redeem control does not pretend to transmit the current TextBox value through the existing static action model.
- **Boundary:** Dynamic input reading, code validation, rate limiting, and reward granting must be connected in Roblox Studio. The template description and generated output must not claim otherwise.

### Daily Rewards

- **Slug:** `daily-rewards`
- **Category:** `Menus`
- **Purpose:** A seven-day reward panel that distinguishes claimed, current, and upcoming days, shows the current streak, and includes a clear claim control.
- **Interaction:** The claim button fires `ClaimDailyReward` with a static current-day key such as `day-4`.
- **Boundary:** The server remains responsible for elapsed-time checks, streak state, duplicate-claim prevention, and inventory or currency changes.

### Quest Tracker

- **Slug:** `quest-tracker`
- **Category:** `HUD`
- **Purpose:** A compact in-game quest tracker with a quest title, objective, progress bar, numeric progress, reward preview, and expandable details.
- **Interaction:** A header control remains outside the details panel and toggles that panel with the existing visibility action. This keeps collapse and re-open behavior previewable in the editor.
- **Boundary:** Gameplay progress and reward completion remain game-owned data; the template only provides the visual state and local disclosure interaction.

## Scene Architecture

All templates use the existing `Template`, `SceneNode`, and `mk` patterns in `app/editor/templates.ts`. No new scene classes, template category, action type, or dependency is introduced.

Node names describe their Roblox purpose, and every action target references a node in the same scene. Layout uses the existing scale-and-offset value format and established editor-safe properties. Shared visual language is expressed through repeated property choices rather than a new abstraction used only four times.

The Code Redeem template deliberately remains action-free unless the current action model can truthfully represent its behavior. A decorative or misleading static RemoteEvent argument would be worse than an honest integration boundary.

## Public Pages And Discovery

The existing template data flow automatically provides:

- cards on `/templates`;
- static detail pages under `/templates/[slug]`;
- editor launch links carrying the selected template slug;
- sitemap entries for every template.

Titles, taglines, and descriptions must name the creator task clearly and state integration boundaries where relevant. Copy should explain what is included without claiming secure purchase, redemption, reward, or quest systems.

## Testing

Vitest adds template-data coverage for:

- all four slugs existing exactly once;
- globally unique template slugs and scene node IDs;
- valid parent references;
- visibility actions targeting existing nodes;
- expected RemoteEvent names and static arguments;
- Code Redeem not exposing a misleading static redemption action;
- each template containing the key control or content nodes promised by its description.

Playwright validates:

- all four detail pages render their unique H1 and editor CTA;
- `/templates` links to each new page;
- each editor CTA opens the editor with the correct template selected;
- the editor produces non-empty Luau output for each template;
- pages do not introduce console errors or horizontal overflow at the standard test viewport.

The normal unit, TypeScript, production build, smoke, full browser, and focused responsive checks remain release gates.

## Non-Goals

- No Marketplace purchase implementation.
- No redemption database or dynamic TextBox-to-RemoteEvent binding.
- No persistent streak, inventory, currency, or quest backend.
- No new template category or action schema.
- No general template refactor or visual theme system.
- No claim that the generated UI alone is a secure production gameplay system.
