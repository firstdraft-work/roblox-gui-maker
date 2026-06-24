import type { Metadata } from "next";
import Link from "next/link";
import { USE_CASES } from "../../for/usecases";
import { getUseCaseZh } from "../../for/usecases.zh";
import { ZhShell } from "../_components/ZhShell";

export const metadata: Metadata = {
  title: "Roblox GUI Maker:每种界面 —— 菜单、商店、HUD 等",
  description:
    "Roblox GUI Maker 覆盖主菜单、商店菜单、背包、模拟器 HUD、设置、加载界面、排行榜和管理面板。打开一个用例,导出干净的 Luau。",
  openGraph: {
    title: "Roblox GUI Maker:每种界面 —— 菜单、商店、HUD 等",
    description:
      "Roblox GUI Maker 覆盖主菜单、商店菜单、背包、模拟器 HUD、设置、加载界面、排行榜和管理面板。",
    url: "https://robloxguimaker.app/zh/for",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox GUI Maker:每种界面 —— 菜单、商店、HUD 等",
    description:
      "Roblox GUI Maker 覆盖主菜单、商店菜单、背包、模拟器 HUD、设置、加载界面、排行榜和管理面板。",
  },
  alternates: {
    canonical: "/zh/for",
    languages: {
      en: "https://robloxguimaker.app/for",
      zh: "https://robloxguimaker.app/zh/for",
    },
  },
};

export default function UseCasesPage() {
  return (
    <ZhShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Roblox GUI Maker:每种界面
        </h1>
        <p className="text-ink-dim max-w-2xl mb-10">
          选你在搭的界面。每页讲清那个 GUI 需要什么,并直通一个模板或编辑器,让你几分钟就导出干净的 Luau。
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map((u) => {
            const z = getUseCaseZh(u.slug);
            if (!z) return null;
            return (
              <Link
                key={z.slug}
                href={`/zh/for/${z.slug}`}
                className="block rounded-xl bg-panel border border-line hover:border-focus p-5 transition"
              >
                <h2 className="text-base font-semibold text-ink leading-snug">
                  {z.title.replace("Roblox GUI Maker:", "")}
                </h2>
                <p className="text-sm text-ink-dim mt-2 line-clamp-3">{z.blurb}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </ZhShell>
  );
}
