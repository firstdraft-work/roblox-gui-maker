import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "../../components/SiteNav";
import { SiteFooter } from "../../components/SiteFooter";
import { GUIDES, getGuide } from "../guides-data";
import { getTemplate } from "../../editor/templates";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide not found — Roblox GUI Maker" };
  return {
    title: `${g.title} | Roblox GUI Maker`,
    description: g.description,
    alternates: { canonical: `/guides/${slug}` },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const tpl = g.relatedTemplate ? getTemplate(g.relatedTemplate) : undefined;

  // FAQ JSON-LD — helps Google/AI surfaces pick up the Q&A.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/guides"
          className="text-sm text-ink-mute hover:text-ink mb-4 inline-block"
        >
          ← All guides
        </Link>
        <p className="text-focus text-xs font-semibold uppercase tracking-wider mb-2">
          {g.category}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {g.title}
        </h1>
        <p className="text-lg text-ink-dim mb-8 leading-relaxed">{g.intro}</p>

        {tpl && (
          <Link
            href={`/editor?template=${tpl.slug}`}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
          >
            Open the {tpl.title.replace("Roblox ", "").replace(" GUI", "")}{" "}
            template →
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
                  <code className="font-mono text-[12.5px] leading-relaxed text-ink-dim">
                    {s.code}
                  </code>
                </pre>
              )}
              {s.tip && (
                <div className="rounded-lg bg-panel border border-line border-l-4 border-l-focus p-3 text-sm text-ink-dim">
                  <span className="font-semibold text-focus">Tip: </span>
                  {s.tip}
                </div>
              )}
            </section>
          ))}
        </div>

        {g.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-ink mb-4">FAQ</h2>
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
      </main>
      <SiteFooter />
    </>
  );
}
