# GEO / AI-Search Analysis — robloxguimaker.app

**Audited:** 2026-06-24 · **Method:** `/seo-geo` (primary source: [Google AI Optimization Guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

> **Framing.** Per Google's own guidance, "optimizing for generative AI search is *still SEO*." There is no separate "AI index" — a page must be indexed and snippet-eligible in classic Search to appear in AI Overviews or AI Mode. This audit treats GEO as **SEO fundamentals applied to AI-search surfaces**, and defers to Google where community GEO advice contradicts the primary source.

---

## 1. GEO Readiness Score: 67 / 100

A technically clean, genuinely expert site whose ceiling is currently set by two things outside the codebase: a near-zero brand-mention footprint on the platforms AI engines actually cite, and missing entity/authority schema. The on-page work — SSR, structure, schema, internal linking — is already strong.

| Pillar | Weight | Score | Notes |
|---|---|---|---|
| Citability | 25% | 75 | Strong definitional blocks + FAQ; thin on unique data/quantified claims |
| Structural Readability | 20% | 88 | Clean H1→H2→H3, question headings, lists, comparison tables, breadcrumbs |
| Multi-Modal Content | 15% | 55 | Rendered SVG previews + OG images; **no video**, no charts |
| Authority & Brand Signals | 20% | 38 | Real expertise but no byline/dates/entity schema; ~0 off-platform mentions |
| Technical Accessibility | 20% | 72 | SSR confirmed for crawlers; docked for hreflang bug + missing `lastmod` |

---

## 2. Platform Breakdown

| Surface | Score | Why |
|---|---|---|
| **Google AI Overviews** | 74 | Best fit. AIO cites top-10 ranking pages (92% of the time) and this site has the fundamentals AIO rewards: SSR'd content, `FAQPage` schema, question-style H2s, tight internal linking (guides↔templates↔use-cases). Ceiling is set by whether pages actually *rank* top-10 (authority/backlinks over time). |
| **Bing Copilot** | 68 | Clean indexability + schema + SSR. Bing rewards technical hygiene. No [IndexNow](https://www.indexnow.org/) ping on publish (a free win for Bing/Edge/Copilot recrawl speed). |
| **ChatGPT** | 52 | ChatGPT cites Wikipedia (~48%) and Reddit (~11%) — this brand has **neither**. It also leans on training-data entities; no Wikipedia/Wikidata presence means weak recall. |
| **Perplexity** | 50 | Perplexity leans on Reddit (~47%) + Wikipedia for community validation, then live web. The live-web layer is fine (SSR + schema), but the validation layer is absent. |

> Ahrefs (Dec 2025, 75k brands): **brand mentions correlate ~3× more strongly with AI citations than backlinks** (Domain Rating correlation only ~0.27). YouTube mentions are the single strongest signal (~0.74). This site's biggest lever is *off-page*, not on-page.

---

## 3. AI Crawler Access Status

`robots.txt` (`app/robots.ts`) is **default-allow**:

```
User-Agent: *
Allow: /
Sitemap: https://robloxguimaker.app/sitemap.xml
```

| Crawler | Status | Impact |
|---|---|---|
| GPTBot, OAI-SearchBot, ChatGPT-User (OpenAI) | ✅ Allowed (implicit) | ChatGPT/Search can crawl |
| ClaudeBot, anthropic-ai (Anthropic) | ✅ Allowed (implicit) | Claude can crawl |
| PerplexityBot | ✅ Allowed (implicit) | Perplexity can crawl |
| Googlebot (incl. AIO grounding) | ✅ Allowed | AIO eligible |
| CCBot, Bytespider, cohere-ai (training) | ✅ Allowed (implicit) | Also used for *training* — decide if you want this |

**No AI crawler is blocked — access is open.** Functionally this is correct for AI-search visibility. Two refinements:

- **Make intent explicit** (optional, hygiene): add named `User-agent` groups for GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot with `Allow: /`. This costs nothing and signals an explicit "yes" to AI search.
- **Decide on training crawlers**: default-allow also lets CCBot/Bytespider/cohere-ai ingest content for *model training*. If you'd rather be cited-but-not-trained-on, allow the *search* bots (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) and `Disallow` CCBot/anthropic-ai/Bytespider. (Note: Google's guidance does not require any of this.)

---

## 4. llms.txt Status: Missing (low priority)

`/llms.txt` returns **404** (serves the Next.js HTML 404 page).

**Per primary sources, this is not a citation lever** and should not be weighted as one:
- John Mueller (Google): "No AI system currently uses llms.txt" — compared it to deprecated meta keywords.
- Gary Illyes (Google, Jul 2025): Google has no plans to support it.
- SE Ranking (Nov 2025, 300k domains): among the 50 most AI-cited domains, **only one** had an `/llms.txt`.
- OtterlyAI server-log audit: **0.1%** of AI-bot traffic requests `/llms.txt`.

**Recommendation:** ship one for *zero-cost optionality* only — do not present it as moving the needle. This is a developer-tooling site (it exports Luau/scripts), so it has marginally more value here than for a generic business site, since coding agents sometimes consume it for docs.

<details>
<summary>Minimal valid <code>/llms.txt</code> template (drop in <code>public/llms.txt</code>)</summary>

```markdown
# Roblox GUI Maker

> Free, browser-based visual builder for Roblox game interfaces.
> Drag-and-drop ScreenGui/Frame/TextButton, preview interactions, export clean Luau, JSON, or ZIP. No login.

## Editor & tool
- [Launch the editor](https://robloxguimaker.app/editor): Visual canvas, live desktop/mobile preview, Luau+ZIP export
- [Templates](https://robloxguimaker.app/templates): Main menu, shop, inventory, settings, leaderboard, daily rewards, quest tracker, more
- [Game UI Kits](https://robloxguimaker.app/kits): Whole-game themed interface sets

## How-to guides
- [How to make a Roblox GUI](https://robloxguimaker.app/guides/how-to-make-a-gui-in-roblox)
- [How to design polished Roblox UI](https://robloxguimaker.app/guides/how-to-design-polished-roblox-ui)
- [Roblox GUI script generator](https://robloxguimaker.app/guides/roblox-gui-script-generator)
- [All guides](https://robloxguimaker.app/guides)

## Export notes
- Client Luau → LocalScript under StarterGui
- Server Luau → Script under ServerScriptService
- ZIP includes both plus placement instructions
```
</details>

---

## 5. Brand Mention Analysis — the single biggest gap

AI engines weight *mentions on the platforms they cite* far more than backlinks. This brand's footprint on those platforms is effectively **zero**.

| Surface | Presence | Notes |
|---|---|---|
| YouTube | ❌ None | **Strongest correlation signal (~0.74) and it's entirely absent.** Generic "roblox gui maker" queries surface *other* content (Pastebin scripts, exploit GUIs) — none owned by this brand. |
| Reddit | ❌ None (risk) | No mentions of the domain. Worse: multiple Reddit threads warn that "Roblox GUI maker" tools are scams that steal `.ROBLOSECURITY` cookies. This unaddressed sentiment is a latent trust liability. |
| Roblox DevForum | ❌ None | The authoritative dev community. "GUI maker" appears only in *hiring* posts. Zero product presence. |
| Wikipedia / Wikidata | ❌ None | Not expected at this stage, but it's why ChatGPT recall is weak. |
| LinkedIn | ❌ None | Absent. |
| Tool directories | ⚠️ Low-authority only | Launch, Indie.Deals, Neeeed, Shipstry, NewTool, BuildWay (`SiteFooter.tsx`) — reciprocal-badge backlinks. Fine for discovery, near-zero citation weight. |

**This is the highest-leverage area and it's off-page.** Note the Google contradiction-handling rule: the AI guide explicitly rejects *inauthentic* mention-farming ("chase inauthentic mentions across blogs/forums/videos"). So the fix is **earned, first-hand presence**, not planted mentions:
- Publish 2–3 genuine tutorial videos (the guides already exist as scripts — repurpose). YouTube is both a citation source *and* the top correlation channel.
- Answer real UI questions on the Roblox DevForum with a link back where it genuinely helps.
- The `.ROBLOSECURITY` scam perception should be proactively countered (an "Is this safe / why no login?" trust page strengthens the existing FAQ item).

---

## 6. Passage-Level Citability

**Optimal citation length is 134–167 words.** This site already has several strong candidate blocks.

✅ **Best in class — homepage definitional block** (`app/page.tsx:398–410`, under H2 "What is a Roblox GUI?"):
> A self-contained ~150-word passage defining a Roblox GUI, naming concrete instances (`ScreenGui`, `Frame`, `TextButton`, `TextLabel`) and the `UDim2` scale concept. Hits the sweet-spot length, follows the "X is…" pattern, and is extractable without surrounding context. **This is your highest-value citable passage.**

✅ **Guide intros** — e.g. the inventory guide opens "An inventory shows everything a player owns as a grid of slots…", naming `ScrollingFrame` + `UIGridLayout`. These intro paragraphs (`g.intro`) are tight, definitional, and self-contained — ideal for AI extraction.

✅ **FAQ pairs** — present on home + every guide, with matching `FAQPage` JSON-LD. Directly aligned with Q&A extraction in AI Overviews.

⚠️ **Gaps:**
- **No unique data points.** Every claim is qualitative. AIO and ChatGPT preferentially cite passages with specific, attributable figures. Even light original data — "average export saves ~N properties", counts of templates/kits, a benchmark vs hand-building — would add a citable layer nothing else has.
- **Definition is buried.** The "What is a Roblox GUI?" block sits in the bottom SEO section, after all marketing sections. AI Overviews select by *passage relevance*, not position, so this still works — but the skill's quick-win #1 (definition in the first 60 words) is unmet; the hero is product copy. Low priority, but a 1-sentence definition woven into the hero would help surface-query matches.

---

## 7. Server-Side Rendering Check: ✅ Solid

AI crawlers **do not execute JavaScript** — content must be in the initial HTML. This site passes cleanly:

- Homepage returns **200, ~257 KB of HTML**; extracted **1,544 words** of body text from the *raw* response (no JS).
- A guide page fetched with a `ClaudeBot/1.0` user agent returns **200, 39 KB, 452 words** of fully-rendered content including the intro, sections, and FAQ — all present without executing a single script.
- All pages are Next.js 16 App Router **server components** (`export const metadata` / `async generateMetadata`), so headings, prose, and JSON-LD are emitted server-side.

No client-only content gated behind hydration was found on the indexable marketing/guide/template pages. (The `/editor` app itself is necessarily interactive, which is expected and fine — it's a tool, not a content page.)

---

## 8. Top 5 Highest-Impact Changes

Ranked by expected AI-visibility lift, not effort.

1. **Build real brand presence on YouTube + DevForum (off-page, highest leverage).** Per Ahrefs, mentions — especially YouTube — correlate ~3× more with AI citations than backlinks. The how-to guides already exist as content; recording 2–3 of them captures the strongest single signal and a channel competitors don't own. *This is the one change that moves ChatGPT/Perplexity scores.*
2. **Add `lastModified` to every sitemap entry** (`app/sitemap.ts`). Right now the sitemap emits only `changeFrequency` + `priority` — **both of which Google ignores** — and no `<lastmod>`. lastmod is the one sitemap field Google *does* use for recrawl scheduling and freshness signals. Docked points here are nearly free to recover.
3. **Fix the hreflang integrity bug** (see Appendix). The sitemap declares `zh` alternates for ~40 URLs that 404. This leaks crawl budget into soft-404s and muddies the hreflang signal Google uses for locale targeting.
4. **Add entity + authority schema** (Organization with `sameAs`, WebSite, Person/byline + `datePublished`/`dateModified` on guides). The content's expertise is real but the *trust signals* Google's Who/How/Why test looks for aren't surfaced. Details in §9.
5. **Add one piece of original, quantified data.** A single attributable statistic (export-size benchmarks, property counts, a "vs hand-building" time comparison) creates a citable passage no competitor has. AI engines preferentially surface specific, sourced figures over qualitative claims.

---

## 9. Schema Recommendations

**What's already there (good):** `SoftwareApplication` + `FAQPage` (home, `app/page.tsx:118–151`), `FAQPage` + `BreadcrumbList` (guides, `app/guides/[slug]/page.tsx:49–67`), `BreadcrumbList` (templates + use-cases). All emitted as inline `<script type="application/ld+json">`.

**What's missing (in priority order):**

- **`Organization` with `sameAs`** — the highest-value addition. Establishes the brand as an entity and links it to its profiles across the web (the cross-platform entity glue AI engines use for recall). Add once, globally (in `app/layout.tsx`). Include `sameAs` pointing to every real profile (YouTube, DevForum, GitHub, etc. as you build them). Per Google, do **not** over-invest in schema "for AI" — but Organization/`sameAs` is general SEO hygiene that also helps.
- **`WebSite`** (with optional `potentialAction` SearchAction if/when you add site search). Pairs with Organization to define the site entity. Also belongs in `app/layout.tsx`.
- **`Article` / `TechArticle` on guides** with `author`, `datePublished`, `dateModified`, `headline`. This is the E-E-A-T "Who + When" signal guides currently lack. Requires adding a byline + dates to the guide data model and surface.
- **`Person` schema** for the author once bylines exist (Google expects author background pages for YMYL; this isn't YMYL, but a lightweight Person node still helps the Who signal).
- **`HowTo` schema** — tempting given the how-to guides, but Google deprecated rich-result eligibility for `HowTo` some time ago. The *visible* step structure helps more than the schema here. Skip unless you also want it for non-Google agents.

> Implementation note: the established pattern in this codebase is inline `<script type="application/ld+json" dangerouslySetInnerHTML>` (see `app/page.tsx:156–167`). Follow that. Verify against Next.js 16 conventions before wiring schema through the Metadata API — this repo's `AGENTS.md` flags that this Next.js version has breaking changes vs. prior releases.

---

## 10. Content Reformatting Suggestions

- **Lead with a one-line definition.** Add a single definitional sentence ("Roblox GUI Maker is a free, browser-based visual builder for Roblox game interfaces…") near the top of the hero, so surface-level "what is X" queries match in the first 60 words. Keep the existing deep definitional block where it is.
- **Quantify at least one claim per major section.** Replace qualitative statements ("saves hours", "in minutes") with a sourced or measured figure where possible. Even "exports N instances across M files" is more citable than "clean Luau."
- **Date the guides.** Add a visible "Updated <date>" to each guide (`g.updatedAt` in the data model → render near the H1). Pair with `dateModified` in Article schema (§9). Google flags "faking freshness" as a warning sign, so dates must be *real* — but real dates are a positive signal and currently absent.
- **Add a trust/safety page** addressing the `.ROBLOSECURITY`-scam perception head-on (the "no login, browser-local" story is genuinely strong and under-told). Strengthens the existing FAQ item and gives AI engines a citable "is it safe" passage.
- **Convert one comparison into a data table with schema-friendly markup.** The "hire vs build" block (`app/page.tsx:231–268`) is already tabular in spirit; a real `<table>` (vs stacked definition lists) is more extractable for comparative queries ("roblox gui maker vs hiring a designer").

---

## Appendix: Technical findings

**A. hreflang / `zh` 404 bug (real, fix recommended)**

`app/sitemap.ts:9–23` declares a `zh` alternate for *every* entry, but only the homepage is translated (`app/zh/page.tsx` exists; no `app/zh/editor`, `/zh/templates`, etc.). Verified live:

```
/zh                      -> 200
/zh/editor               -> 404
/zh/templates            -> 404
/zh/guides               -> 404
/zh/templates/main-menu  -> 404
```

Google sees ~40 declared `zh` alternates that return the HTML 404 page — wasted crawl budget and a muddled locale signal.

*Fix (simplest, matches the "only the homepage is actually translated" reality):* in `app/sitemap.ts`, emit `alternates.languages: { en, zh }` **only** for the homepage entry; drop `zh` from all other entries until those routes exist. (Building out full `/zh/*` routes is a separate product decision — don't let the sitemap promise pages that don't resolve.)

**B. `meta keywords`** — `app/page.tsx:15–24` ships a `keywords` meta array. Google has ignored this for years; it's harmless but dead weight. Leave or remove; no ranking effect either way.

**C. Sitemap uses only ignored fields** — `changeFrequency` and `priority` are both [confirmed ignored by Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#xml). Replace with real `lastModified` values (§8, item 2).

---

*Primary sources: [Google AI Optimization Guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) · [Google — creating helpful content (E-E-A-T, Who/How/Why)](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) · Ahrefs Dec-2025 brand-mention correlation study · SE Ranking 300k-domain llms.txt study · OtterlyAI server-log audit. Where community GEO advice conflicts with Google, this report defers to Google and notes the conflict.*
