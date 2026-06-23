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

  it("omits unverifiable modification dates", () => {
    expect(sitemap().every((entry) => entry.lastModified === undefined)).toBe(
      true
    );
  });
});
