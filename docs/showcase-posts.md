# Showcase posts — robloxguimaker.app

Two drafts for the two communities most likely to care. Both lead with the
problem (Studio's GUI builder is slow), are honest about what's rough, and ask
for feedback rather than "use my thing." Communities downvote overt promo;
value-first + humble wins.

**Before posting, capture a screenshot or short GIF of the editor** (drag a
button, change a color, watch the Luau update). A visual tool needs visual
proof — text alone underperforms badly on both forums.

---

## 1. DevForum (devforum.roblox.com) — category: Showcase

> DevForum is stricter about self-promo. Frame it as "I built this to scratch my
> own itch, here's how it works, feedback welcome." A Showcase post needs you to
> be a DevForum member (trust level); if you're not, start with Reddit + the
> #resources thread.

**Title:**
`Roblox GUI Maker — a free, browser-based visual GUI builder that exports clean Luau`

**Body:**

```
I've spent more time than I want to admit nudging UDim2 offsets and rebuilding
the same menu pattern game after game, so I built a small tool to speed it up.
It's free, runs in the browser, no login, and the whole pitch is: design a GUI
visually, then copy out clean Luau you can paste straight into a LocalScript.

https://robloxguimaker.app

[ screenshot or short GIF of the editor: drag an element, tweak a color,
  watch the code panel update ]

### What it does
- Drag-and-drop ScreenGui, Frame, TextButton, TextLabel, TextBox, ImageLabel,
  ScrollingFrame onto a desktop / tablet / mobile canvas.
- Resize from any corner, nest containers (parent-child), and auto-arrange
  children with UIListLayout / UIGridLayout, plus UICorner, UIGradient, UIPadding.
- The property panel uses the real names — BackgroundColor3, BackgroundTransparency,
  ZIndex, Font, TextSize — so there's nothing to relearn.
- Undo/redo, duplicate (Cmd/Cmd+D), arrow-key nudge, Delete, Esc.
- Exports Luau built from real Instance.new / UDim2.fromScale calls, parented
  correctly, with the layout instances included. Paste it into a LocalScript
  inside a ScreenGui and it runs as-is.
- It auto-saves to your browser, so a refresh doesn't lose your work.
- Ships with 6 templates (main menu, shop, settings, inventory, loading screen,
  leaderboard) and a few written guides, all editable.

### What's still rough (being honest)
- No image upload yet — ImageLabel is a placeholder box for now.
- The preview can't render Roblox's actual fonts, so text uses a close
  weight approximation; the content and size are correct.
- UIGridLayout cells export at a fixed 100x100 (Roblox's CellSize), so they
  won't match an arbitrary per-cell size in the preview.
- No multi-select and no drag-to-reparent yet (nesting works via "add into the
  selected container").

### The why
Most "AI makes your GUI" tools spit out placeholder layouts you then clean up.
I wanted the opposite: precise, I-stay-in-control, and output clean enough to
ship. Property names match Studio exactly so there's zero translation.

If you try it, I'd genuinely value feedback — especially: which GUI templates
would actually save you time, and what's missing before you'd use it for real
work. Happy to answer questions about how the Luau is generated.
```

---

## 2. Reddit — r/robloxgamedev (flair: Showcase)

> Reddit punishes anything that reads like an ad. Lead with the relatable pain,
> keep it short, put the link in the body, and reply to every comment. One good
> thread here is worth more than five feature additions right now.

**Title:**
`I got tired of placing GUI Frames by hand, so I built a free visual Roblox GUI maker (browser, no login, exports clean Luau)`

**Body:**

```
Studio's GUI builder and I have a love-hate relationship — mostly hate when I'm
nudging a Frame's offset for the 20th time. So I made a thing:

https://robloxguimaker.app

[gif or screenshot: drag a button, change its color, see the Luau update live]

It's a free, in-browser visual editor. You drag ScreenGui / Frame / TextButton /
etc. onto a canvas, tweak the real properties (BackgroundColor3, transparency,
font, corner radius…), nest containers, use UIListLayout / UIGridLayout, and
then copy out clean Luau (Instance.new + UDim2.fromScale, parented correctly)
to paste into a LocalScript. No login, autosaves to your browser, undo/redo,
duplicate, keyboard shortcuts. There are 6 starter templates (menu, shop,
settings, inventory, loading screen, leaderboard) if you want a head start.

Honest about what's NOT there yet: no image upload (ImageLabel is a placeholder),
it can't render Roblox's real fonts so text is a close approximation, grid cells
export at a fixed 100x100, and no multi-select or drag-to-reparent yet.

It's free and I'm not gating anything — I mostly wanted something precise
rather than the "AI generates a messy GUI" route. If you give it a spin, tell me
what GUI you'd actually want a template for, or what's stopping you from using
it on a real project. Happy to show how the export works under the hood.
```

---

## Posting tips
- **Visuals first.** A 5–10 second GIF of "drag → recolor → code updates" is the
  single biggest driver of clicks. Tools: macOS screen record → gifski, or Loom.
- **Engage in comments within the first 1–2 hours.** Reply to every comment;
  early engagement is what the algorithms surface.
- **Don't link-drop and run.** If someone asks a tangential GUI question, answer
  it helpfully even if it doesn't mention the tool.
- **DevForum**: also drop the link in the `#resources` channel if there is one,
  and consider a short reply on the existing "what's the best way to make a GUI?"
  / "GUI builder is garbage" threads (helpfully, not spammy).
- **Track**: after posting, watch GA4 Realtime + referrals for a few days to see
  which source sends actual traffic.
