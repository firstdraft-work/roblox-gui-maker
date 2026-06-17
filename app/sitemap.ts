import type { MetadataRoute } from "next";
import { TEMPLATES } from "./editor/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://robloxguimaker.app";
  const lastModified = new Date();
  const fixed = ["", "/editor", "/templates"].map((p) => ({
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
  return [...fixed, ...templates];
}
