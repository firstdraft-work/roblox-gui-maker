# Roblox GUI Maker

A free, browser-based visual builder for Roblox game interfaces. Drag and drop
`ScreenGui`, `Frame`, `TextButton` and friends onto a canvas, tweak real Roblox
properties, and export clean Luau you can paste straight into Studio.

The differentiator vs "AI GUI" tools: **precise, you stay in control, and the
exported Luau is clean** (real `Instance.new` calls, `UDim2.fromScale`
positioning, correct parenting) — not placeholder output to clean up.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `app/globals.css`)
- **lucide-react** icons
- **@fontsource** Inter + JetBrains Mono (no Google Fonts network dependency)

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
    CodePanel.tsx         # live Luau output + copy
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

## Build / verify

```bash
npm run build    # production build — the deploy gate
npm run start    # serve the production build
```

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
