import type { MetadataRoute } from "next";
import { TEMPLATES } from "./editor/templates";
import { GUIDES } from "./guides/guides-data";
import { USE_CASES } from "./for/usecases";
import { KITS } from "./editor/kits";

const BASE = "https://robloxguimaker.app";

function entry(
  path: string,
  opts: { freq: "weekly" | "monthly"; pri: number; zhPath?: string }
): MetadataRoute.Sitemap[number] {
  const en = `${BASE}${path}`;
  const zh = `${BASE}${opts.zhPath ?? `/zh${path}`}`;
  return {
    url: en,
    changeFrequency: opts.freq,
    priority: opts.pri,
    alternates: {
      languages: { en, zh },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = [
    entry("", { freq: "weekly", pri: 1, zhPath: "/zh" }),
    entry("/editor", { freq: "weekly", pri: 0.8 }),
    entry("/templates", { freq: "weekly", pri: 0.8 }),
    entry("/kits", { freq: "weekly", pri: 0.8 }),
    entry("/showcase", { freq: "weekly", pri: 0.8 }),
    entry("/guides", { freq: "weekly", pri: 0.8 }),
    entry("/for", { freq: "weekly", pri: 0.8 }),
    entry("/about", { freq: "weekly", pri: 0.8 }),
  ];
  const templates = TEMPLATES.map((t) =>
    entry(`/templates/${t.slug}`, { freq: "monthly", pri: 0.6 })
  );
  const guides = GUIDES.map((g) =>
    entry(`/guides/${g.slug}`, { freq: "monthly", pri: 0.6 })
  );
  const usecases = USE_CASES.map((u) =>
    entry(`/for/${u.slug}`, { freq: "monthly", pri: 0.6 })
  );
  const kits = KITS.map((k) =>
    entry(`/kits/${k.slug}`, { freq: "monthly", pri: 0.7 })
  );
  return [...fixed, ...templates, ...guides, ...usecases, ...kits];
}
