# Roblox GUI Maker

A free, browser-based visual builder for Roblox game interfaces. Drag and drop
`ScreenGui`, `Frame`, `TextButton` and friends onto a canvas, tweak real Roblox
properties, preview interactions, and download a Studio-ready project package.

The differentiator vs "AI GUI" tools: **precise, you stay in control, and the
exported Luau is clean** (real `Instance.new` calls, `UDim2.new`
positioning, correct parenting) — not placeholder output to clean up. Projects
can also round-trip through JSON or download as a ZIP with client code, optional
server handlers, and installation instructions.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `app/globals.css`)
- **lucide-react** icons
- **@fontsource** Inter + JetBrains Mono (no Google Fonts network dependency)
- **fflate** for browser-local ZIP generation
- **Vitest** + **Playwright** regression coverage

## Structure

```
app/
  layout.tsx              # fonts, root metadata (metadataBase, OG)
  page.tsx                # / — SEO landing (exact-match keyword page)
  opengraph-image.tsx     # dynamic OG image
  sitemap.ts / robots.ts  # SEO plumbing
  editor/
    page.tsx              # /editor — reads ?template=<slug>
    Editor.tsx            # client shell: scene state + handlers
    Canvas.tsx            # recursive renderer + drag/resize
    useInteraction.ts     # pointer move/resize hook (UDim-scale aware)
    PropertiesPanel.tsx   # two-way property editing
    Palette.tsx           # component palette (add / apply / soon)
    CodePanel.tsx         # live Luau output + copy/download actions
    persistence.ts        # versioned JSON import/export
    project-package.ts    # ZIP project package assembly
    server-luau.ts        # RemoteEvent + Teleport server handlers
    scene.ts              # createNode + generateLuau (pure)
    catalog.ts            # types + palette data + sample scene
    templates.ts          # 6 templates as SceneNode[] + getTemplate()
    ScenePreview.tsx      # read-only SSR renderer (for marketing pages)
  templates/
    page.tsx              # /templates — gallery by category
    [slug]/page.tsx       # /templates/<slug> — SSG detail page
  components/
    SiteNav.tsx / SiteFooter.tsx
```

## Develop

```bash
npm install
npm run dev      # http://localhost:3000  (editor at /editor)
```

> Local dev server must run inside tmux in this environment
> (`tmux new-session -d -s dev "npm run dev"`).

## Export

The editor supports four complementary handoff paths:

- **Download ZIP** for `README.md`, `project.json`, client Luau, and optional
  server Luau in one package.
- **Export JSON** for an editable project that can be imported later.
- **Download .lua / .server.lua** for individual generated scripts.
- **Copy** for pasting the active Luau output directly into Studio.

Native `.rbxmx` export is intentionally not claimed until it can be validated
against Roblox Studio.

## Build / verify

```bash
npm test                 # Vitest unit suite
npx tsc --noEmit         # TypeScript
npm run build            # production build — required before local E2E
npm run test:e2e:smoke   # critical editor path
npm run test:e2e:full    # complete import/export journey
npm run start            # serve the production build
```

Browser, type, and generated-code checks cannot prove Roblox runtime behavior.
Published-experience validation remains tracked in
[`docs/roblox-live-validation.md`](docs/roblox-live-validation.md).

## Deploy (Vercel)

1. Push this folder to a Git repo.
2. In Vercel, import the repo and set **Root Directory = `roblox-gui-maker`**
   (the parent workspace has its own lockfile, which is why `turbopack.root`
   is pinned in `next.config.ts`).
3. Add the custom domain **robloxguimaker.app** and point DNS at Vercel.
4. After deploy, submit `https://robloxguimaker.app/sitemap.xml` to
   Google Search Console so indexing starts.

## Disclaimer

Independent, unofficial tool. Not affiliated with or endorsed by Roblox
Corporation. "Roblox" is a trademark of Roblox Corporation.
