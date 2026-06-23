# Roblox GUI Maker — Fiverr-counter progress

**Snapshot:** 2026-06-23
**Context:** Closing the gap between this DIY Roblox GUI builder and the commissioned UI sold on freelance marketplaces (e.g. Fiverr's `roblox-gui` gigs).

## The original diagnosis

Fiverr sellers ship **game-level UI**: a cohesive, themed, animated, art-rich set for a whole game (menu + HUD + shop + settings + loading + rewards), delivered as polished mockups plus scripts, typically $25–150+. This tool was producing **fragment-level** output — one static, flat-color screen at a time — and was positioned as a generic "free tool" with no comparison to the hire-a-designer path.

The agreed roadmap had three phases: **0** reposition, **1** Kit foundation, **2** animation.

## What shipped

### Phase 0 — reposition (commit `073abe5`, on `main`)
- `/showcase` gallery: portfolio-style render of every template (the Fiverr-portfolio equivalent).
- Homepage **hire-vs-build** comparison section ("$25–150 + days" vs "free + minutes").
- Showcase wired into SiteNav + sitemap.
- Housekeeping: gitignore `.superpowers/` (`8dfa4fd`), SEO metadata tweaks (`5a0c8ab`).

### Phase 1 — Kit foundation (commit `566f118`, on `main`)
- `themes.ts`: `Theme`/`Palette` types, 3 named themes (nexus / sunset / arctic), `applyTheme` — a recolor transform that maps the base palette onto a theme **without changing `SceneNode`**. Decorative colors pass through.
- `kits.ts`: `Kit` type + 2 kits (`simulator-kit` / sunset, `quest-rpg-kit` / arctic), each bundling several templates under one theme.
- `/kits` gallery + `/kits/[slug]` detail (renders all screens recolored) + `KitCard` shared component.
- Editor `?theme=<name>` loads a template already recolored.
- Kits wired into SiteNav, sitemap, and the homepage.
- `4ecddfe`: realigned the stale sitemap test and dropped the fake `lastModified` dates.

### Phase 2 — tween animation (commit `8cd7164`)
- `catalog.ts`: `Transition` type + `VisibilityAction` split so `transition` is type-locked to show/hide (toggle stays instant).
- `scene.ts`: `tweenBody` generates `TweenService` code for scale/slide show & hide (show → set small then tween to rest; hide → tween away then `Visible = false` on `Completed`), with the `TweenService` header emitted once. Action loop refactored to multi-line bodies.
- `PropertiesPanel.tsx`: **Animate** picker (Instant / Scale pop / Slide + seconds + slide direction) for show/hide actions.
- `Canvas.tsx`: opacity-fade preview — transition targets stay mounted and animate opacity instead of popping.
- 4 tween tests (TDD); verified end-to-end in the editor (Animate → Scale produces real `TweenService:Create` with the node's true rest size).

### Phase 3 — visual richness (commit `8cd7164`, with Phase 2)
Multi-stop gradient + UIStroke — both fully native and export-honest:
- `catalog.ts`: `Gradient { stops, rotation }` replacing `{ from, to }`.
- `scene.ts`: multi-stop `ColorSequence` + `Rotation` (also fixes a preview/export direction mismatch); `gradientColorSequence` helper.
- `ScenePreview.tsx`: multi-stop gradient render + UIStroke render (inset shadow + text stroke) — kit/showcase pages now show borders and glow.
- `templates.ts`: game-pass-shop upgraded (card gradients + accent UIStroke glow).
- themes / persistence / Editor migrated to `{ stops }`.
- 1 gradient test added; suite now **192 / 0**.

## Scorecard — original gap vs Fiverr

| Gap | Status |
|---|---|
| Fragment output → game-level cohesive set | ✅ Closed (Kits: multi-screen, one theme) |
| Static → animated | ✅ Closed in **export** (TweenService scale/slide); editor preview is fade-only |
| No portfolio → visual proof | ✅ Closed (`/showcase` + Kit pages) |
| No positioning → "hire vs build" | ✅ Closed (comparison section) |
| Theme cohesion (shared color/font/shape) | ✅ Closed (3 themes + recolor) |
| Flat → rich native UI | 🟡 Partial — multi-stop gradient + UIStroke glow added (game-pass-shop); most templates still flat |
| Rendered 3D game art (Fiverr-style) | ❌ Fundamental — needs real art assets; native instances can't produce rendered 3D |
| Social proof (reviews / usage) | ❌ Open |

## How to see it (dev server on `localhost:3000`)

- `/` — comparison section + Game UI Kits strip.
- `/kits/simulator-kit` — flagship: 5 cohesive screens under the sunset theme.
- `/kits/quest-rpg-kit` — same idea, arctic theme.
- `/showcase` — full template gallery.
- `/editor?template=main-menu` → click SETTINGS → Animate: Scale → CodePanel shows `TweenService`.

## Bottom line

Architecturally the tool is now **game-level**: it can produce a cohesive themed multi-screen set, animate it, and export clean Luau — with a portfolio and a clear positioning against commissioned UI. The structural part of the "we're only fragment-level" diagnosis is fully addressed.

The remaining gap is **content, not capability**:
- **Art richness** — Phase 3 added native gradient/UIStroke richness (game-pass-shop), moving from "flat" toward "rich flat UI". But Fiverr's premium look is rendered 3D art (characters, items, glows baked in Photoshop) — native Roblox instances can't produce that. Closing it fully means real art assets (commission/curate) or positioning the tool as "skeleton + theme + animation + scripts; you bring the art" (rbxassetid already supports user art).
- **Social proof** — no reviews/usage signals yet.

## Deliberately not done (scope notes)

- **Preview fidelity:** editor preview animates opacity only (scale/slide both look like fade). Faithful transform-based preview was deferred to avoid conflicting with the existing rotation/aspect `transform` and because the Canvas has no component tests. The **exported Luau** is faithful (real scale/slide).
- **Fade (group opacity):** deferred — needs `CanvasGroup`, a larger change.
- **Art richness & social proof:** open by design (content/trust decisions, not engineering).

## Decision point

Where to invest next:
1. **Content** — real art in templates (commission or curate), closing the last visual gap.
2. **Thicken the skeleton** — more kits/themes, faithful preview, SEO harvest on the kit/showcase keywords.
3. **Trust** — add usage signals / testimonials / "built with" proof.
