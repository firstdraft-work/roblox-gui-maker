import { Editor } from "./Editor";
import { getTemplate } from "./templates";

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
