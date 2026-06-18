# Showcase posts — robloxguimaker.app

Updated for the current product. The headline differentiator is no longer just
"drag-drop → clean Luau" — it's **"design interactive GUIs (buttons that open
and close panels) and export Luau with the click handlers already wired."** That
is what none of the AI-placeholder or Studio-only routes give you. Lead with it.

Communities downvote overt promo, so every draft is problem-led, honest about
the rough edges, and asks for feedback.

**Primary placement: r/robloxgamedev (Showcase flair).** DevForum has no clean
showcase category (its closest fits — Community Resources / Creations Feedback —
are high-friction and strict on promo), so it's secondary. A short YouTube
tutorial is the other high-ROI move (GUI-making intent lives on YouTube).

---

## 1. Reddit — r/robloxgamedev (flair: Showcase)

> Lead with the relatable pain, keep it short, link in the body, reply to every
> comment in the first 1–2 hours. One good thread here > five new features.

**Title:**
`I built a free visual Roblox GUI maker — wire buttons to open/close panels, export Luau with the click handlers included`

**Body:**

```
I got tired of two things: placing GUI Frames by hand in Studio, and the "AI
makes your GUI" tools that spit out a static placeholder I then have to wire up
myself. So I built a thing that does the boring part AND the wiring:

https://robloxguimaker.app

[gif or 10s screen recording: load the main-menu template, click PLAY to hide
the menu, click SETTINGS to open the settings panel, then show the exported
Luau with the .Activated:Connect handlers]

It's a free, in-browser visual editor. You drag ScreenGui / Frame / TextButton
/ etc. onto a canvas, nest and reparent by dragging, auto-arrange with
UIListLayout and UIGridLayout, add corners/gradients/padding, and constrain
sizing responsively. The part I'm most happy about: you can set a button to
show, hide, or toggle a panel, preview it right there, and the exported Luau
recreates the whole GUI AND emits the `.Activated:Connect(function() ...
Panel.Visible = true end)` for you. Paste it into a LocalScript and the buttons
actually work — no hand-wiring.

Other bits: real Roblox property names (BackgroundColor3, transparency, font,
ZIndex), undo/redo, duplicate, keyboard shortcuts, autosave to your browser, no
login. Ships with templates including an interactive main menu (Play hides the
menu, Settings opens a panel, Close closes it), a shop, inventory, settings,
loading screen, and leaderboard.

Honest about what's NOT there yet: no image upload (ImageLabel is a placeholder
box), the preview can't render Roblox's real fonts so text is a close
approximation, and UIGridLayout cells export at a fixed 100x100.

Free, nothing gated, no account. If you try it, I'd genuinely value feedback —
especially: does the "buttons export with working handlers" part actually save
you time, and what GUI would you want a template for next?
```

---

## 2. DevForum — Resources → Community Resources (secondary, high-friction)

> DevForum has no Showcase category and is strict on promotion. Post only if
> you have Member trust level, and frame it as a free community resource with a
> genuine how-to angle (not "look at my product"). The ~5-paragraph quality bar
> the community expects is roughly met below.

**Title:**
`Roblox GUI Maker — free visual editor that exports interactive Luau (buttons, show/hide panels)`

**Body:**

```
Sharing a free, browser-based tool I built to scratch my own itch: designing
Roblox GUIs visually and getting out clean Luau that's actually wired up, not a
static placeholder.

https://robloxguimaker.app

The core loop: drag ScreenGui, Frame, TextButton and friends onto a canvas;
resize from any corner; nest containers and reparent by dragging; auto-arrange
children with UIListLayout and UIGridLayout; round corners and add gradients;
constrain sizing responsively with anchor and min/max size. Every property uses
the real Roblox names.

What I think is genuinely useful: you can set a TextButton to show, hide, or
toggle another Frame, preview the behaviour in the editor, and the exported
Luau recreates the GUI with the matching `.Activated:Connect` handler — so a
main menu where Play hides the menu and Settings opens a settings panel exports
as code that actually does that when pasted into a LocalScript.

It also has undo/redo, duplicate, keyboard shortcuts, autosave to the browser,
no login, and a set of templates (interactive main menu, shop, inventory,
settings, loading screen, leaderboard) plus written guides.

What's still rough: no image upload yet (ImageLabel is a placeholder), the
preview approximates Roblox fonts rather than rendering them, and UIGridLayout
cells export at a fixed 100x100.

I'd value feedback on whether the interactive-export part is useful in practice,
and which GUIs you'd want templates for. Happy to walk through how the Luau is
generated if anyone's curious.
```

---

## Re-recording the GIF (what to capture)

The old GIF showed "add button → gradient → frame." The current product's
strongest demo is **interactivity**, so re-record that:

1. Load the main-menu template (`/editor?template=main-menu`).
2. Enter preview mode and click **PLAY** — the menu hides (hideGui action).
3. (Reload / re-open) click **SETTINGS** — the settings panel appears (show
   action); click **CLOSE** — it hides.
4. Show the exported Luau panel scrolled to a `.Activated:Connect(function() ...
   Visible = true end)` block.

That sequence — "I designed it, the buttons work, and here's the code that does
it" — is the whole pitch in 10 seconds.

Recording tips: macOS screen record (Cmd+Shift+5) → gifski to convert to a
looping GIF; keep it under ~10s and 900px wide. A real screen recording is
smoother than the frame-sequence GIF we auto-generated before.

---

## Posting tips (refreshed)
- **Reddit first** (r/robloxgamedev, Showcase flair). Reply to every comment
  within the first 1–2 hours — early engagement is what surfaces it.
- **YouTube**: record a ~60s tutorial ("Make a Roblox shop GUI in 60 seconds,
  free, no login") and link the tool in the description. GUI-making intent
  largely lives on YouTube, so owning a tutorial there beats commenting on
  others'.
- **Chinese (`/zh`)**: a short Chinese resource post on forum.robloxdev.cn and a
  Bilibili tutorial capture the Chinese Roblox dev audience we just localized
  for.
- **Don't**: spam "use my tool" comments under other people's YouTube GUI
  tutorials — it reads as spam and hurts reputation.
- **Watch GA4 Realtime + referrals** for a few days after posting to see which
  source actually sends traffic.
