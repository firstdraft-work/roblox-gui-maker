import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";
import { ScenePreview } from "./editor/ScenePreview";
import { TEMPLATES } from "./editor/templates";

export const metadata: Metadata = {
  title: "Free Online Roblox GUI Maker | Visual UI Builder",
  description:
    "Free online Roblox GUI maker. Create responsive designs, preview interactions, and export Luau, JSON, and ZIP for Roblox Studio. No login required.",
  openGraph: {
    title: "Free Online Roblox GUI Maker | Visual UI Builder",
    description:
      "Create responsive Roblox GUIs, preview interactions, and export Luau, JSON, and complete ZIP projects for Roblox Studio.",
    url: "https://robloxguimaker.app",
    siteName: "Roblox GUI Maker",
    type: "website",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "https://robloxguimaker.app",
      zh: "https://robloxguimaker.app/zh",
    },
  },
};

const STEPS = [
  {
    n: "1",
    title: "Drag & drop",
    body: "Drop ScreenGui, Frame, TextButton, labels and more onto the canvas. Nest containers, snap them into place, resize from any corner.",
  },
  {
    n: "2",
    title: "Tweak properties",
    body: "Edit real Roblox properties — BackgroundColor3, transparency, text, font, corner radius. Everything uses the names you already know from Studio.",
  },
  {
    n: "3",
    title: "Download a complete project",
    body: "Export clean client and server Luau, keep an editable JSON project, or download everything together as a ZIP for Roblox Studio.",
  },
];

const PRODUCT_PROOFS = [
  {
    title: "Responsive Layout",
    body: "Combine scale and offset with anchors, aspect ratios, and size constraints for desktop, tablet, and mobile screens.",
  },
  {
    title: "Interaction Preview",
    body: "Preview show, hide, toggle, RemoteEvent, and Teleport button actions before exporting your GUI.",
  },
  {
    title: "Server-Safe Actions",
    body: "Generate separate server handlers with clear validation boundaries for RemoteEvent and allow-listed Teleport actions.",
  },
  {
    title: "ZIP + JSON Export",
    body: "Download a complete project package or save a versioned scene document that imports back into the editor.",
  },
];

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Roblox GUI Maker",
  url: "https://robloxguimaker.app",
  description:
    "Free online visual builder for responsive Roblox GUIs with interaction previews, generated Luau, editable JSON, and complete ZIP project export.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Visual drag-and-drop GUI editor",
    "Responsive geometry with scale, offset, anchors, aspect ratios, and size constraints",
    "Interaction previews for show, hide, toggle, RemoteEvent, and Teleport actions",
    "Server handlers for RemoteEvent and Teleport actions",
    "Versioned JSON project import and export",
    "Browser-local ZIP project export",
    "Roblox GUI templates and how-to guides",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema).replace(/</g, "\\u003c"),
        }}
      />
      <SiteNav />
      <main>
        {/* hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <p className="text-focus text-sm font-semibold uppercase tracking-wider mb-4">
            Free · No login · Browser-local exports
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Roblox GUI Maker
          </h1>
          <p className="text-lg md:text-xl text-ink-dim max-w-2xl mx-auto mb-8">
            Design responsive Roblox interfaces visually, preview button
            behavior, then download clean Luau, editable JSON, or a complete
            ZIP project for Roblox Studio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/editor"
              className="px-6 py-3 rounded-lg font-semibold bg-primary text-on-primary hover:brightness-110 transition"
            >
              Launch the Editor →
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 rounded-lg font-medium border border-line hover:bg-raised transition"
            >
              Browse Templates
            </Link>
          </div>
        </section>

        {/* hero preview */}
        <section className="max-w-4xl mx-auto px-6 pb-4">
          <div className="rounded-2xl ring-1 ring-line overflow-hidden shadow-2xl shadow-black/40">
            <ScenePreview scene={TEMPLATES[0].scene} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {PRODUCT_PROOFS.map((proof) => (
              <article
                key={proof.title}
                className="rounded-xl border border-line bg-panel p-4"
              >
                <h3 className="mb-1.5 text-sm font-semibold text-ink">
                  {proof.title}
                </h3>
                <p className="text-xs leading-relaxed text-ink-dim">
                  {proof.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
            From a blank screen to a working GUI in three steps
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

        {/* templates strip */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Start from a template</h2>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/for" className="text-ink-dim hover:text-ink">
                By use case
              </Link>
              <Link href="/templates" className="text-focus hover:underline">
                All templates →
              </Link>
            </div>
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

        {/* SEO body */}
        <section className="max-w-3xl mx-auto px-6 py-16 space-y-5 text-ink-dim leading-relaxed">
          <h2 className="text-2xl font-semibold text-ink">
            What is a Roblox GUI?
          </h2>
          <p>
            A GUI (Graphical User Interface) in Roblox is the 2D layer drawn on
            top of your game — main menus, health bars, shops, inventories,
            settings panels, loading screens and HUDs. Under the hood these are
            built from instances like <code className="text-focus">ScreenGui</code>,{" "}
            <code className="text-focus">Frame</code>,{" "}
            <code className="text-focus">TextButton</code> and{" "}
            <code className="text-focus">TextLabel</code>, positioned with UDim2
            scale so they adapt to every screen size.
          </p>

          <h2 className="text-2xl font-semibold text-ink pt-4">
            Why making GUIs in Roblox Studio is slow
          </h2>
          <p>
            Roblox Studio ships with a built-in UI editor, but it&rsquo;s the
            part of Studio developers complain about most. Placing every Frame by
            hand, nudging UDim2 offsets until things line up, and rebuilding the
            same menu patterns game after game eats hours — especially for solo
            developers and younger creators learning to script. That friction is
            exactly what a dedicated Roblox GUI maker removes.
          </p>

          <h2 className="text-2xl font-semibold text-ink pt-4">
            How this Roblox GUI maker is different
          </h2>
          <p>
            Most &ldquo;AI GUI&rdquo; tools spit out placeholder layouts you then
            have to clean up. This tool is the opposite: a precise, visual canvas
            where you stay in control. Property names match Roblox exactly
            (BackgroundColor3, BackgroundTransparency, ZIndex), you
            can nest containers and auto-arrange children with UIListLayout and
            UIGridLayout, and the exported Luau is clean enough to ship as-is —
            real <code className="text-focus">Instance.new</code> calls,{" "}
            <code className="text-focus">UDim2.new</code> positioning, and
            correct parenting.
          </p>

          <h2 className="text-2xl font-semibold text-ink pt-4">Who it&rsquo;s for</h2>
          <p>
            Beginners who want a good-looking menu without fighting Studio&rsquo;s
            inspector; experienced developers who want to scaffold a shop or HUD
            in minutes instead of an hour; and anyone who&rsquo;d rather design a
            GUI visually and hand off clean Luau. It&rsquo;s free, runs in your
            browser, and never asks you to sign up.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
