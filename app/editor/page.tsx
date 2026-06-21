import type { Metadata } from "next";
import { Editor } from "./Editor";
import { getTemplate } from "./templates";

export const metadata: Metadata = {
  title: "Roblox GUI Editor — Drag, Drop & Export Luau | Roblox GUI Maker",
  description:
    "Free online Roblox GUI editor. Drag and drop ScreenGui, Frame, TextButton, preview interactions, and export clean Luau for Roblox Studio. No login required.",
  alternates: { canonical: "/editor" },
};

// /editor — the tool. Reads ?template=<slug> to load a starting scene.
export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const initialScene = template ? getTemplate(template)?.scene : undefined;
  return <Editor initialScene={initialScene} />;
}
