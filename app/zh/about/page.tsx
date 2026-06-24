import type { Metadata } from "next";
import Link from "next/link";
import { ZhShell } from "../_components/ZhShell";

export const metadata: Metadata = {
  title: "关于 — Roblox GUI Maker",
  description:
    "Roblox GUI Maker 是一个免费、浏览器内的 Roblox 游戏 GUI 可视化构建器。它为什么存在、怎么工作、底层是什么。",
  openGraph: {
    title: "关于 — Roblox GUI Maker",
    description:
      "Roblox GUI Maker 是一个免费、浏览器内的 Roblox 游戏 GUI 可视化构建器。它为什么存在、怎么工作、底层是什么。",
    url: "https://robloxguimaker.app/zh/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "关于 — Roblox GUI Maker",
    description: "Roblox GUI Maker 是一个免费、浏览器内的 Roblox 游戏 GUI 可视化构建器。",
  },
  alternates: {
    canonical: "/zh/about",
    languages: {
      en: "https://robloxguimaker.app/about",
      zh: "https://robloxguimaker.app/zh/about",
    },
  },
};

const FEATURES = [
  "把 ScreenGui、Frame、TextButton、TextLabel、TextBox、ImageLabel 和 ScrollingFrame 拖到桌面、平板或手机画布上,可从任意角落缩放。",
  "嵌套容器、拖拽改父级、重排同级,并用 UIListLayout 和 UIGridLayout 自动排列子元素。",
  "加圆角和渐变(UICorner、UIGradient),用 UIPadding 留白,用锚点和最小/最大尺寸做响应式约束。",
  "把按钮接上显示、隐藏或切换面板,导出前预览结果。",
  "按真实 Roblox 名字编辑每个属性 —— BackgroundColor3、BackgroundTransparency、Font、TextSize、ZIndex。",
  "撤销/重做、复制、键盘快捷键,以及自动存到浏览器 —— 无需账号、免登录。",
  "从模板(主菜单、商店、设置、背包、加载界面、排行榜)或图文教程开始。",
];

export default function AboutPage() {
  return (
    <ZhShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
          关于 Roblox GUI Maker
        </h1>
        <p className="text-lg text-ink-dim leading-relaxed mb-12">
          Roblox GUI Maker 是一个免费、浏览器内的 Roblox
          游戏界面可视化构建器。你用拖拽设计、接好交互按钮,导出干净的 Luau,粘进 Studio
          就能跑 —— 无需登录。
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-ink mb-3">它为什么存在</h2>
          <p className="text-ink-dim leading-relaxed">
            手动搭一个 Roblox GUI
            意味着反复调 UDim2
            偏移、每个工程都重建一样的菜单结构,还要和开发者吐槽最多的那部分
            Studio 较劲。Roblox GUI Maker
            用一个让你保持掌控的可视化编辑器替代了这种苦活:你保持精确,工具处理杂活,产出是你自己也会那样写的代码。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-ink mb-3">它有什么不同</h2>
          <p className="text-ink-dim leading-relaxed">
            大多数“AI 帮你做 GUI”的工具吐出来的是占位布局,你还得自己收拾。我们正好相反:一个精确的画布,导出的
            Luau 干净到能直接发版。它用真实的{" "}
            <code className="text-focus">Instance.new</code> 调用和{" "}
            <code className="text-focus">UDim2.new</code>{" "}
            定位重建你的 GUI —— 如果你给按钮接了打开面板,导出里也包含那个{" "}
            <code className="text-focus">.Activated:Connect</code>{" "}
            处理器。粘进 LocalScript 就能跑。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-ink mb-3">你能做什么</h2>
          <ul className="space-y-2 text-ink-dim">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2.5">
                <span className="text-focus mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-focus" />
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-ink mb-3">它怎么工作</h2>
          <p className="text-ink-dim leading-relaxed">
            编辑器完全跑在你的浏览器里。没有账号,你的设计也不会发到服务器 ——
            它们存在你浏览器的本地存储里。唯一的第三方服务是尊重隐私的聚合统计,只测流量、绝不测你的设计。它用
            Next.js 构建,以静态页面部署。
          </p>
        </section>

        <div className="rounded-xl bg-panel border border-line p-6 flex flex-wrap items-center justify-between gap-4 mb-12">
          <p className="text-ink-dim">想搭一个 GUI?免费,而且什么也不用装。</p>
          <Link
            href="/editor"
            className="px-5 py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
          >
            打开编辑器 →
          </Link>
        </div>

        <section className="text-sm text-ink-mute leading-relaxed border-t border-line pt-6">
          <p>
            Roblox GUI Maker
            是独立的非官方工具,与 Roblox Corporation
            无关、也未获其认可。“Roblox” 是 Roblox Corporation
            的商标。所有对 Roblox 类和 API(ScreenGui、UIListLayout、UDim2
            等)的引用均属 Roblox 平台所有。
          </p>
        </section>
      </div>
    </ZhShell>
  );
}
