import type { MetadataRoute } from "next";
import { TEMPLATES } from "./editor/templates";
import { GUIDES } from "./guides/guides-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://robloxguimaker.app";
  const lastModified = new Date();
  const fixed = ["", "/editor", "/templates", "/guides"].map((p) => ({
    url: `${base}${p}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const templates = TEMPLATES.map((t) => ({
    url: `${base}/templates/${t.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const guides = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...fixed, ...templates, ...guides];
}
