import type { Metadata } from "next";
import { KITS } from "../../../editor/kits";
import { getKitZh } from "../../../editor/kits.zh";
import { ZhShell } from "../../_components/ZhShell";
import { KitDetailView } from "../../_views/KitDetailView";

export function generateStaticParams() {
  return KITS.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = getKitZh(slug);
  if (!kit) return { title: "未找到 UI Kit" };
  return {
    title: `${kit.name} — 免费 Roblox 游戏 UI Kit | Roblox GUI Maker`,
    description: kit.description,
    alternates: {
      canonical: `/zh/kits/${slug}`,
      languages: {
        en: `https://robloxguimaker.app/kits/${slug}`,
        zh: `https://robloxguimaker.app/zh/kits/${slug}`,
      },
    },
    openGraph: {
      title: `${kit.name} — 免费 Roblox 游戏 UI Kit`,
      description: kit.description,
      url: `https://robloxguimaker.app/zh/kits/${slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ZhShell>
      <KitDetailView slug={slug} />
    </ZhShell>
  );
}
