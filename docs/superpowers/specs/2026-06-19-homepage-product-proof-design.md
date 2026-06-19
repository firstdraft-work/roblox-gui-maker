# Homepage Product Proof Design

## Goal

Make the homepage describe the editor that exists today, not the earlier copy-only Luau workflow. The page should give users and search engines immediate, truthful proof that the product supports responsive design, interaction previews, server-backed actions, portable JSON, and complete ZIP downloads.

## Page Structure

The existing dark visual language, navigation, editor preview, template gallery, and educational body remain in place.

The hero keeps a single `Roblox GUI Maker` H1. Its eyebrow and supporting copy change from a Luau-only promise to a browser-local workflow: visually design a Roblox GUI, preview its behavior, then download a complete project for Roblox Studio. The primary editor and secondary template calls to action remain unchanged.

Immediately beneath the existing editor preview, a four-card product-proof strip presents:

1. **Responsive Layout** — scale, offset, anchor, aspect-ratio, and size-constraint controls.
2. **Interaction Preview** — preview show, hide, toggle, RemoteEvent, and Teleport actions before export.
3. **Server-Safe Actions** — generate separate server handlers for RemoteEvent and allow-listed Teleport behavior.
4. **ZIP + JSON Export** — download a complete project package or preserve an editable scene document.

The third workflow step changes from copying Luau to downloading a complete project. It still names generated Luau so existing search and user intent remain represented.

## Metadata And Structured Data

The homepage title becomes `Free Online Roblox GUI Maker | Visual UI Builder`.

The description must say that the tool is free, requires no login, supports responsive design and interaction preview, and exports Luau, JSON, and ZIP for Roblox Studio. It must remain within a concise search-snippet length.

The `WebApplication` JSON-LD description and `featureList` mirror visible page content. New feature entries cover responsive geometry, interaction previews, server-side RemoteEvent and Teleport handlers, JSON round-tripping, and browser-local ZIP export. No unsupported native Roblox model format is named.

## Components And Data Flow

The change stays in `app/page.tsx`. A small static `PRODUCT_PROOFS` array drives the four cards, matching the existing `STEPS` pattern. No client component, API route, new state, or new dependency is introduced.

Metadata remains exported through the Next.js `Metadata` API. JSON-LD remains a server-rendered script derived from a static object. All product-proof text is visible HTML rather than hidden SEO content.

## Error Handling And Accessibility

The homepage adds no new failure path. Cards are informational, use semantic headings, and do not masquerade as interactive controls. The page retains one H1 and descriptive link text for its calls to action.

## Testing

The existing smoke Playwright journey gains homepage assertions before entering the editor:

- document title matches the new title;
- the meta description names the complete export workflow;
- one `Roblox GUI Maker` H1 is present;
- all four product-proof headings are visible;
- the JSON-LD feature list contains the new verified capabilities.

After the focused browser assertion passes, the normal Vitest, TypeScript, production build, smoke Playwright, full Playwright, and diff checks remain the release gates.

## Non-Goals

- No FAQ or FAQ schema in this increment.
- No new SEO topic route or template.
- No long-form keyword expansion beyond correcting stale product claims.
- No `.rbxmx` or other Studio-native model export claim.
- No visual redesign outside the hero copy and product-proof strip.
