import { describe, expect, it } from "vitest";
import { GUIDES, getGuide } from "./guides-data";

const topicSlugs = [
  "roblox-gui-script-generator",
  "how-to-make-a-gui-in-roblox",
];

describe("core SEO guide topics", () => {
  it("defines every guide slug once", () => {
    expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(GUIDES.length);
  });

  it.each(topicSlugs)("provides substantial authored content for %s", (slug) => {
    const guide = getGuide(slug);
    expect(guide).toBeDefined();
    expect(guide?.sections.length).toBeGreaterThanOrEqual(6);
    expect(guide?.faq.length).toBeGreaterThanOrEqual(3);
    expect(guide?.intro.length).toBeGreaterThan(140);
  });

  it("keeps template intent out of duplicate guide routes", () => {
    expect(getGuide("roblox-gui-templates")).toBeUndefined();
  });

  it("links only to existing related guides", () => {
    for (const guide of GUIDES) {
      for (const link of guide.relatedGuides ?? []) {
        expect(
          getGuide(link.slug),
          `${guide.slug} -> ${link.slug}`
        ).toBeDefined();
      }
    }
  });
});
