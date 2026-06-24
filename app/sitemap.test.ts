import { describe, expect, it } from "vitest";
import { TEMPLATES } from "./editor/templates";
import { USE_CASES } from "./for/usecases";
import { GUIDES } from "./guides/guides-data";
import { KITS } from "./editor/kits";
import sitemap from "./sitemap";

const base = "https://robloxguimaker.app";

describe("sitemap", () => {
  it("lists every canonical public page exactly once", () => {
    const fixed = [
      "",
      "/editor",
      "/templates",
      "/kits",
      "/showcase",
      "/guides",
      "/for",
      "/about",
    ];
    const expectedUrls = [
      ...fixed.map((path) => `${base}${path}`),
      ...TEMPLATES.map((template) => `${base}/templates/${template.slug}`),
      ...GUIDES.map((guide) => `${base}/guides/${guide.slug}`),
      ...USE_CASES.map((useCase) => `${base}/for/${useCase.slug}`),
      ...KITS.map((kit) => `${base}/kits/${kit.slug}`),
    ];
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual(expectedUrls);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes a verifiable last-modified date for every page", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      // lastModified is derived from git history (ground truth for when content
      // changed) — never faked, never omitted.
      expect(entry.lastModified).toBeInstanceOf(Date);
      const ms = (entry.lastModified as Date).getTime();
      expect(isNaN(ms)).toBe(false);
      // lastmod must never sit in the future.
      expect(ms).toBeLessThanOrEqual(Date.now());
    }
  });

  it("declares a zh alternate only for pages that have a translated route", () => {
    const withZh = sitemap().filter((entry) => entry.alternates?.languages?.zh);
    // Only the homepage has a real /zh route today. Declaring zh for untranslated
    // routes produced hreflang pointing at 404s — this guards against regressions
    // as /zh/* routes are added incrementally.
    expect(withZh.map((entry) => entry.url)).toEqual([base]);
    expect(withZh[0]?.alternates?.languages?.zh).toBe(`${base}/zh`);
    expect(withZh[0]?.alternates?.languages?.en).toBe(base);
  });
});
