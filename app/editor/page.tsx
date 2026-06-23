import type { Metadata } from "next";
import { Editor } from "./Editor";
import { getTemplate } from "./templates";
import { applyTheme, getTheme } from "./themes";

export const metadata: Metadata = {
  title: "Roblox GUI Editor — Drag, Drop & Export Luau | Roblox GUI Maker",
  description:
    "Free online Roblox GUI editor. Drag and drop ScreenGui, Frame, TextButton, preview interactions, and export clean Luau for Roblox Studio. No login required.",
  alternates: { canonical: "/editor" },
};

// /editor — the tool. Reads ?template=<slug> to load a starting scene and
// ?theme=<name> to recolor it with a theme (used by kit "open in editor" links).
export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; theme?: string }>;
}) {
  const { template, theme } = await searchParams;
  let initialScene = template ? getTemplate(template)?.scene : undefined;
  if (initialScene && theme) {
    const palette = getTheme(theme);
    if (palette) initialScene = applyTheme(initialScene, palette);
  }
  return <Editor initialScene={initialScene} />;
}
