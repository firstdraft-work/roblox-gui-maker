import Link from "next/link";
import { notFound } from "next/navigation";
import { ScenePreview } from "../../editor/ScenePreview";
import { TEMPLATES, getTemplate } from "../../editor/templates";
import { getTemplateZh } from "../../editor/templates.zh";

// Shared zh render for a template detail page. Scene comes from the English
// module (shared visual); all prose is Chinese. The "How to build this"
// related-guides section is omitted until zh guides exist (no dead links).
export function TemplateDetailView({ slug }: { slug: string }) {
  const zh = getTemplateZh(slug);
  const en = getTemplate(slug);
  if (!zh || !en) notFound();

  const related = TEMPLATES.filter((x) => x.slug !== slug).slice(0, 3);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://robloxguimaker.app/zh" },
      { "@type": "ListItem", position: 2, name: "模板", item: "https://robloxguimaker.app/zh/templates" },
      { "@type": "ListItem", position: 3, name: zh.title, item: `https://robloxguimaker.app/zh/templates/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/zh/templates"
          className="text-sm text-ink-mute hover:text-ink mb-4 inline-block"
        >
          ← 全部模板
        </Link>
        <p className="text-focus text-xs font-semibold uppercase tracking-wider mb-2">
          {zh.category}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {zh.title}
        </h1>
        <p className="text-ink-dim mb-6">{zh.tagline}</p>

        <div className="rounded-2xl ring-1 ring-line overflow-hidden shadow-2xl shadow-black/40 mb-6">
          <ScenePreview scene={en.scene} />
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href={`/editor?template=${slug}`}
            className="px-5 py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
          >
            在编辑器中打开 →
          </Link>
          <Link
            href="/editor"
            className="px-5 py-2.5 rounded-lg font-medium border border-line hover:bg-raised transition"
          >
            从空白开始
          </Link>
        </div>

        <div className="space-y-4 text-ink-dim leading-relaxed max-w-2xl">
          <p>{zh.description}</p>
          <p>
            这个模板完全由 Roblox 原生实例构成,可完整编辑。在编辑器里打开它,修改颜色、文字、尺寸和布局,然后导出干净的 Luau——粘进{" "}
            <code className="text-focus">ScreenGui</code> 里的{" "}
            <code className="text-focus">LocalScript</code> 即可直接运行。
          </p>
        </div>

        <h2 className="text-xl font-semibold mt-12 mb-4">更多模板</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {related.map((r) => {
            const rz = getTemplateZh(r.slug);
            return (
              <Link
                key={r.slug}
                href={`/zh/templates/${r.slug}`}
                className="rounded-xl overflow-hidden ring-1 ring-line hover:ring-focus transition"
              >
                <ScenePreview scene={r.scene} />
                <div className="p-3 bg-panel">
                  <p className="text-sm font-medium text-ink">
                    {(rz?.title ?? r.title).replace("Roblox ", "").replace(" GUI", "")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
