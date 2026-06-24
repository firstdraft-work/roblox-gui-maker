import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplate } from "../../editor/templates";
import { getTemplateZh } from "../../editor/templates.zh";
import { getGuideZh } from "../../guides/guides-data.zh";

// Shared zh render for a guide detail page. Consumes a full Guide (zh prose
// overlaid on the English structure, so Luau code blocks are preserved).
export function GuideDetailView({ slug }: { slug: string }) {
  const g = getGuideZh(slug);
  if (!g) notFound();
  const tpl = g.relatedTemplate ? getTemplate(g.relatedTemplate) : undefined;
  const tplZh = g.relatedTemplate ? getTemplateZh(g.relatedTemplate) : undefined;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://robloxguimaker.app/zh" },
      { "@type": "ListItem", position: 2, name: "教程", item: "https://robloxguimaker.app/zh/guides" },
      { "@type": "ListItem", position: 3, name: g.title, item: `https://robloxguimaker.app/zh/guides/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/zh/guides" className="text-sm text-ink-mute hover:text-ink mb-4 inline-block">
          ← 全部教程
        </Link>
        <p className="text-focus text-xs font-semibold uppercase tracking-wider mb-2">{g.category}</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{g.title}</h1>
        <p className="text-lg text-ink-dim mb-8 leading-relaxed">{g.intro}</p>

        {tpl && (
          <Link
            href={`/editor?template=${tpl.slug}`}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
          >
            打开{(tplZh?.title ?? tpl.title).replace("Roblox ", "").replace(" GUI", "")} 模板 →
          </Link>
        )}

        <div className="flex flex-col gap-8">
          {g.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-ink mb-3">{s.heading}</h2>
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="text-ink-dim leading-relaxed mb-3">
                  {p}
                </p>
              ))}
              {s.code && (
                <pre className="rounded-lg bg-input border border-line p-4 overflow-x-auto scroll-thin mb-3">
                  <code className="font-mono text-[12.5px] leading-relaxed text-ink-dim">{s.code}</code>
                </pre>
              )}
              {s.tip && (
                <div className="rounded-lg bg-panel border border-line border-l-4 border-l-focus p-3 text-sm text-ink-dim">
                  <span className="font-semibold text-focus">提示:</span> {s.tip}
                </div>
              )}
            </section>
          ))}
        </div>

        {g.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-ink mb-4">常见问题</h2>
            <div className="flex flex-col gap-4">
              {g.faq.map((f, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-ink">{f.q}</h3>
                  <p className="text-ink-dim text-sm mt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {g.relatedGuides && g.relatedGuides.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-ink">相关教程</h2>
            <div className="flex flex-col gap-3">
              {g.relatedGuides.map((link) => (
                <Link
                  key={link.slug}
                  href={`/zh/guides/${link.slug}`}
                  className="rounded-xl border border-line bg-panel px-5 py-4 font-semibold text-ink transition hover:border-focus"
                >
                  {link.title} →
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
