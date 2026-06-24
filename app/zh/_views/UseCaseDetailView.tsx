import Link from "next/link";
import { notFound } from "next/navigation";
import { ScenePreview } from "../../editor/ScenePreview";
import { getTemplate } from "../../editor/templates";
import { getTemplateZh } from "../../editor/templates.zh";
import { getGuideZh } from "../../guides/guides-data.zh";
import { USE_CASES } from "../../for/usecases";
import { getUseCaseZh } from "../../for/usecases.zh";

// Shared zh render for a use-case landing page. Consumes a full UseCase (zh
// prose overlaid on the en structure; `properties`/`template`/`relatedGuide`
// kept from en).
export function UseCaseDetailView({ slug }: { slug: string }) {
  const u = getUseCaseZh(slug);
  if (!u) notFound();
  const tpl = u.template ? getTemplate(u.template) : undefined;
  const guide = u.relatedGuide ? getGuideZh(u.relatedGuide) : undefined;
  const others = USE_CASES.filter((x) => x.slug !== slug).slice(0, 3);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://robloxguimaker.app/zh" },
      { "@type": "ListItem", position: 2, name: "用例", item: "https://robloxguimaker.app/zh/for" },
      { "@type": "ListItem", position: 3, name: u.title, item: `https://robloxguimaker.app/zh/for/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/zh/for" className="text-sm text-ink-mute hover:text-ink mb-4 inline-block">
          ← 全部用例
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{u.title}</h1>
        <p className="text-lg text-ink-dim leading-relaxed mb-8">{u.blurb}</p>

        <h2 className="text-xl font-semibold text-ink mb-3">一个{u.noun}通常需要什么</h2>
        <ul className="space-y-2 mb-10">
          {u.needs.map((n) => (
            <li key={n} className="flex gap-2.5 text-ink-dim">
              <span className="text-focus mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-focus" />
              <span className="leading-relaxed">{n}</span>
            </li>
          ))}
        </ul>

        {tpl ? (
          <>
            <div className="rounded-2xl ring-1 ring-line overflow-hidden shadow-2xl shadow-black/40 mb-6">
              <ScenePreview scene={tpl.scene} />
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href={`/editor?template=${tpl.slug}`}
                className="px-5 py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
              >
                打开{(getTemplateZh(tpl.slug)?.title ?? tpl.title).replace("Roblox ", "").replace(" GUI", "")}模板 →
              </Link>
              <Link
                href="/editor"
                className="px-5 py-2.5 rounded-lg font-medium border border-line hover:bg-raised transition"
              >
                从空白开始
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/editor"
              className="px-5 py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
            >
              打开编辑器 →
            </Link>
          </div>
        )}

        <h2 className="text-xl font-semibold text-ink mb-3">如何在 Roblox GUI Maker 里搭建{u.noun}</h2>
        <ol className="space-y-3 mb-10 list-decimal list-inside text-ink-dim leading-relaxed">
          {u.howTo.map((step, i) => (
            <li key={i} className="pl-1">
              {step}
            </li>
          ))}
        </ol>

        <h2 className="text-xl font-semibold text-ink mb-3">{u.noun}的关键 Roblox 属性</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {u.properties.map((p) => (
            <code
              key={p}
              className="text-xs px-2.5 py-1 rounded-md bg-raised border border-line text-focus font-mono"
            >
              {p}
            </code>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-ink mb-3">把{u.noun}做得更好的技巧</h2>
        <ul className="space-y-2 mb-10">
          {u.tips.map((t) => (
            <li key={t} className="flex gap-2.5 text-ink-dim">
              <span className="text-focus mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-focus" />
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>

        {guide && (
          <div className="rounded-xl bg-panel border border-line p-5 mb-10">
            <p className="text-xs text-ink-mute uppercase tracking-wider mb-1">相关教程</p>
            <Link
              href={`/zh/guides/${guide.slug}`}
              className="text-base font-semibold text-focus hover:underline"
            >
              {guide.title} →
            </Link>
          </div>
        )}

        <p className="text-ink-dim leading-relaxed mb-12">
          在 Roblox GUI Maker 里可视化搭建 —— 拖拽、缩放、嵌套、用布局自动排列,把按钮接上显示或隐藏面板 —— 然后导出干净的 Luau,重建整个界面(含点击处理),可直接粘进 LocalScript。免费、免登录。
        </p>

        <h2 className="text-xl font-semibold text-ink mb-4">其它用例</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {others.map((o) => {
            const oz = getUseCaseZh(o.slug);
            return (
              <Link
                key={o.slug}
                href={`/zh/for/${o.slug}`}
                className="rounded-xl bg-panel border border-line hover:border-focus p-4 transition"
              >
                <p className="text-sm font-medium text-ink">
                  {(oz?.title ?? o.title).replace("Roblox GUI Maker:", "").replace("Roblox GUI Maker for ", "")}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
