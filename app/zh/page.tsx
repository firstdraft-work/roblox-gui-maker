import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { ScenePreview } from "../editor/ScenePreview";
import { TEMPLATES } from "../editor/templates";

export const metadata: Metadata = {
  title: "Roblox GUI Maker — 可视化构建 Roblox 界面,导出干净 Luau",
  description:
    "免费、浏览器内的 Roblox GUI 可视化构建器。拖拽设计游戏菜单、商店、HUD、加载界面,导出干净 Luau,粘进 Studio 即可运行。免登录。内置模板与教程。",
  alternates: {
    canonical: "/zh",
    languages: {
      en: "https://robloxguimaker.app",
      zh: "https://robloxguimaker.app/zh",
    },
  },
};

const STEPS = [
  { n: "1", title: "拖拽搭建", body: "把 ScreenGui、Frame、TextButton、TextLabel 等拖到画布上,嵌套容器、四角缩放、任意位置摆放。" },
  { n: "2", title: "调属性", body: "直接编辑 Roblox 原生属性 —— BackgroundColor3、透明度、字体、字号、圆角。全是你在 Studio 里熟悉的名字。" },
  { n: "3", title: "导出干净 Luau", body: "复制生产可用的 Luau,用 Instance.new 和 UDim2 重建你的 GUI,连按钮点击事件都生成好。粘进 LocalScript 就能跑。" },
];

export default function ZhHome() {
  return (
    <>
      <SiteNav />
      <main lang="zh-CN">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <p className="text-focus text-sm font-semibold uppercase tracking-wider mb-4">
            免费 · 免登录 · 导出干净 Luau
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Roblox GUI Maker
          </h1>
          <p className="text-lg md:text-xl text-ink-dim max-w-2xl mx-auto mb-8">
            浏览器内的可视化 Roblox 界面构建器。拖拽设计、调真实属性,然后导出干净的 Luau
            —— 粘进 Studio 就能跑。比 Studio 自带的 UI 编辑器快,比 AI 生成的更可控。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/editor"
              className="px-6 py-3 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
            >
              打开编辑器 →
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 rounded-lg font-medium border border-line hover:bg-raised transition"
            >
              浏览模板
            </Link>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-4">
          <div className="rounded-2xl ring-1 ring-line overflow-hidden shadow-2xl shadow-black/40">
            <ScenePreview scene={TEMPLATES[0].scene} />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
            三步从空白到可用 GUI
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl bg-panel border border-line p-5">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-input text-focus font-bold mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-ink-dim leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">从模板开始</h2>
            <Link href="/templates" className="text-sm text-focus hover:underline">
              全部模板 →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group rounded-xl overflow-hidden ring-1 ring-line hover:ring-focus transition"
              >
                <ScenePreview scene={t.scene} />
                <div className="p-3 bg-panel">
                  <p className="text-sm font-medium text-ink">
                    {t.title.replace("Roblox ", "").replace(" GUI", "")}
                  </p>
                  <p className="text-xs text-ink-mute">{t.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16 space-y-5 text-ink-dim leading-relaxed">
          <h2 className="text-2xl font-semibold text-ink">Roblox GUI 是什么?</h2>
          <p>
            Roblox 里的 GUI(图形界面)是叠在游戏画面上的 2D 层 —— 主菜单、血条、商店、背包、设置、加载界面、HUD
            都算。底层由 ScreenGui、Frame、TextButton、TextLabel 等实例构成,用 UDim2 的比例定位,所以能适配各种屏幕。
          </p>
          <h2 className="text-2xl font-semibold text-ink pt-4">为什么在 Studio 里做 GUI 很慢</h2>
          <p>
            Studio 自带的 UI 编辑器是开发者吐槽最多的部分。手动放每一个 Frame、反复调 UDim2
            偏移、每个游戏都重建一样的菜单结构, Solo 开发者尤其痛苦。这个工具就是要把这部分磨洋工的活儿去掉。
          </p>
          <h2 className="text-2xl font-semibold text-ink pt-4">这个工具和别的有什么不同</h2>
          <p>
            很多"AI 做 GUI"的工具吐出来的是占位布局,你还得自己收拾。我们正好相反:一个精确的可视化画布,你完全掌控。属性名和
            Roblox 完全一致(BackgroundColor3、BackgroundTransparency、ZIndex),可以嵌套容器、用 UIListLayout/UIGridLayout
            自动排列、加圆角和渐变,导出的 Luau 干净到能直接发版 —— 真实的 Instance.new、UDim2.new
            定位,还带按钮的点击事件。
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
