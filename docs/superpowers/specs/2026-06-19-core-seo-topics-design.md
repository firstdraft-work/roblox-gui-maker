# Core SEO Topics Design

## Goal

Give three high-intent search themes one clear owner each without creating duplicate routes that compete with existing pages. Every page must help a Roblox creator complete a real task and move naturally into the editor or a relevant template.

## Keyword And URL Ownership

### Roblox GUI Templates

`/templates` remains the canonical owner. The existing gallery gains concise guidance on choosing a starting template, adapting it across device sizes, and understanding what the editor exports. It links to the two new guides as next steps.

No `/roblox-gui-templates` route is created. A second page with the same intent would split internal links and make canonical ownership ambiguous.

### Roblox GUI Script Generator

`/guides/roblox-gui-script-generator` becomes the canonical educational page for creators evaluating generated Luau. It explains:

1. What the visual generator creates.
2. How scene hierarchy becomes Roblox instances.
3. The difference between client and server output.
4. JSON and ZIP export choices.
5. Where scripts belong in Roblox Studio.
6. Which security checks remain the creator's responsibility.

The guide links to a real editable template and the templates index. It does not claim to generate arbitrary gameplay systems or native `.rbxmx` files.

### How To Make A GUI In Roblox

`/guides/how-to-make-a-gui-in-roblox` becomes the canonical beginner workflow. It covers:

1. Define the screen's player task.
2. Build a clear ScreenGui hierarchy.
3. Use responsive scale, offset, anchors, and constraints.
4. Add button interactions and identify server-owned behavior.
5. Preview common states and device sizes.
6. Export, install, and test in Roblox Studio.

The guide links to the main-menu template as a concrete starting point and directs readers to the script-generator guide when they need export details.

## Content Model

The two guides are new entries in the existing `GUIDES` array. They use the established title, description, category, intro, sections, optional code/tip, related-template, and FAQ fields. They are automatically rendered by the current dynamic guide route, listed on `/guides`, statically generated, and included in `sitemap.xml`.

Each guide includes at least six substantive sections and three factual FAQs. Copy must be original, task-focused, and free of commentary about rankings, keywords, page length, or search engines.

The templates page remains its own server component. New explanatory sections appear below the gallery so users see actual templates before supporting text. Links use descriptive anchor text rather than generic “learn more” labels.

## Internal Linking

- `/templates` links to both new guides.
- The script-generator guide uses the existing related-template CTA and names the broader beginner guide in its content.
- The beginner guide uses the main-menu related-template CTA and names the script-generator guide in its content.
- `/guides` automatically links both pages from the `GUIDES` array.
- Existing homepage and navigation links continue to reinforce `/templates` as the template owner.

Because the current guide section model stores paragraphs as plain strings, cross-guide links are added through a small optional `links` field on `Guide`. The guide detail page renders a `Related guides` block when links exist. This avoids embedding HTML in content strings or special-casing slugs.

## Metadata And Structured Data

Existing `generateMetadata` creates unique titles, descriptions, and canonical URLs from the guide entries. The two new descriptions state the task and verified product boundary concisely.

Existing FAQ and breadcrumb JSON-LD remain. Their serialization is updated to escape `<` in line with the installed Next.js JSON-LD guidance. Visible FAQ answers continue to match structured answers exactly.

The templates page keeps its canonical `/templates` and existing exact topic title. Its description is updated only if needed to mention responsive editing and JSON/ZIP export truthfully.

## Testing

Vitest validates:

- both guide slugs exist exactly once;
- each guide has at least six sections and three FAQs;
- related links point to valid guide slugs;
- the templates topic has one canonical owner and no duplicate route is added.

Playwright validates rendered output:

- `/templates` keeps the expected title and H1 and links to both new guides;
- each new guide has its unique title, H1, related-template CTA, at least six H2 sections, and valid FAQ/breadcrumb JSON-LD;
- the beginner and generator pages link to each other through `Related guides`;
- pages render without console errors or horizontal overflow at the standard viewport.

The normal unit, TypeScript, production build, smoke, full browser, responsive visual, and diff checks remain release gates.

## Non-Goals

- No duplicate `/roblox-gui-templates` route.
- No new template designs in this increment.
- No changes to editor behavior or generated code.
- No bulk programmatic page generation beyond two authored guides.
- No ranking or rich-result guarantees.
