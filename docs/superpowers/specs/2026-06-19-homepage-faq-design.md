# Homepage FAQ Design

## Goal

Add concise, visible answers to the product questions most likely to block a Roblox creator from opening the editor. The same answers should give crawlers an accurate `FAQPage` representation without duplicating or hiding content.

## Content

The homepage adds six questions:

1. **Is Roblox GUI Maker free to use?** — Yes. The editor is free, requires no account, and keeps project work in the browser unless the user downloads it.
2. **What files can I export?** — Users can copy or download client Luau, download optional server Luau, export an editable JSON scene, or download a ZIP containing the project files and instructions.
3. **Can I design for phones and tablets?** — Yes. Device previews and responsive geometry controls cover scale, offset, anchors, aspect ratios, and size constraints.
4. **Does the editor generate game logic?** — It generates UI instances and selected interaction wiring, including separate RemoteEvent and Teleport server handlers. Secure economy, purchase, reward, permission, and datastore validation remains the creator's responsibility.
5. **Where do the generated scripts go in Roblox Studio?** — Client Luau belongs in a `LocalScript` under `StarterGui`; generated server Luau belongs in a `Script` under `ServerScriptService`.
6. **Is this an official Roblox product?** — No. It is an independent, unofficial creator tool and is not affiliated with or endorsed by Roblox Corporation.

These answers must stay factual and must not promise native `.rbxmx` output, automatic secure game logic, or a search-result rich snippet.

## Presentation

The FAQ appears after the existing educational body and before the footer. A single `Frequently asked questions` H2 introduces six native `<details>` elements. Each question is a `<summary>` and each answer is visible in the server-rendered HTML, with no client-side state or JavaScript.

The existing dark panel, border, typography, and spacing tokens are reused. The disclosure rows stack in one readable column on every viewport.

## Structured Data

A static `FAQS` array is the single source for visible text and JSON-LD. A separate `FAQPage` script maps each item to `Question` and `Answer` schema objects. The JSON-LD payload is serialized using the same less-than escaping already used for the `WebApplication` payload.

The structured data contains only the six questions and answers visible on the page. It does not claim that Google will display FAQ rich results.

## Architecture

The implementation remains in `app/page.tsx`. No component, client boundary, API route, state, dependency, or CSS file is added. This follows the existing static `STEPS` and `PRODUCT_PROOFS` patterns and keeps the FAQ contract easy to audit.

## Testing

The smoke Playwright journey checks the homepage before entering the editor:

- the FAQ H2 is visible;
- all six question summaries exist;
- expanding the game-logic question reveals its security boundary;
- the `FAQPage` JSON-LD contains exactly six entries;
- a representative structured answer exactly matches its visible answer.

The test is written and observed failing before production code changes. The normal unit, TypeScript, production build, smoke, full browser, responsive visual, and diff checks remain release gates.

## Non-Goals

- No standalone FAQ route.
- No additional long-form SEO copy.
- No topic pages or new templates in this increment.
- No claim of FAQ rich-result eligibility.
- No interactive animation beyond native disclosure behavior.
