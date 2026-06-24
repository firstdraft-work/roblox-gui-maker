import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "../../guides/guides-data";
import { getGuideZh } from "../../guides/guides-data.zh";
import { ZhShell } from "../_components/ZhShell";

export const metadata: Metadata = {
  title: "Roblox GUI 教程 — 如何制作菜单、商店与加载界面",
  description:
    "搭建 Roblox GUI 的图文教程:主菜单、商店、加载界面,以及如何使用 UIListLayout 和 UIGridLayout —— 附可直接复制的 Luau。",
  openGraph: {
    title: "Roblox GUI 教程 — 如何制作菜单、商店与加载界面",
    description:
      "搭建 Roblox GUI 的图文教程:主菜单、商店、加载界面,以及如何使用 UIListLayout 和 UIGridLayout —— 附可直接复制的 Luau。",
    url: "https://robloxguimaker.app/zh/guides",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox GUI 教程 — 如何制作菜单、商店与加载界面",
    description: "搭建 Roblox GUI 的图文教程:主菜单、商店、加载界面等。",
  },
  alternates: {
    canonical: "/zh/guides",
    languages: {
      en: "https://robloxguimaker.app/guides",
      zh: "https://robloxguimaker.app/zh/guides",
    },
  },
};

export default function GuidesPage() {
  return (
    <ZhShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Roblox GUI 教程
        </h1>
        <p className="text-ink-dim mb-10">
          一步步搭建常见 Roblox 界面的图文教程 —— 附可直接粘进 Studio 的 Luau。
        </p>
        <div className="flex flex-col gap-4">
          {GUIDES.map((g) => {
            const z = getGuideZh(g.slug);
            if (!z) return null;
            return (
              <Link
                key={z.slug}
                href={`/zh/guides/${z.slug}`}
                className="block rounded-xl bg-panel border border-line hover:border-focus p-5 transition"
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-focus bg-input px-1.5 py-0.5 rounded mb-2">
                  {z.category}
                </span>
                <h2 className="text-lg font-semibold text-ink">{z.title}</h2>
                <p className="text-sm text-ink-dim mt-1">{z.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </ZhShell>
  );
}
