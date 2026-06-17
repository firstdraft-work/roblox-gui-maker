import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { ScenePreview } from "../editor/ScenePreview";
import { TEMPLATES, CATEGORIES } from "../editor/templates";

export const metadata: Metadata = {
  title: "Free Roblox GUI Templates — Menus, Shops, HUDs | Roblox GUI Maker",
  description:
    "Free, ready-to-use Roblox GUI templates: main menus, shops, settings, inventory, loading screens and leaderboards. Open any template in the editor and export clean Luau.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <>
      <SiteNav />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Free Roblox GUI Templates
        </h1>
        <p className="text-ink-dim max-w-2xl mb-10">
          Ready-made Roblox interfaces you can open in the editor, customize, and
          export as clean Luau. Every template is built from real Roblox
          instances and layouts.
        </p>

        {CATEGORIES.map((cat) => {
          const items = TEMPLATES.filter((t) => t.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-xl font-semibold mb-4">{cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((t) => (
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
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}
