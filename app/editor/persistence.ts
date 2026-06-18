import type { RobloxClass, SceneNode } from "./catalog";
import { sanitizeResponsiveGeometry } from "./geometry";
import { FONTS } from "./scene";

// Decorators are properties on saved nodes, never standalone scene objects.
const VALID_CLS: ReadonlySet<RobloxClass> = new Set<RobloxClass>([
  "ScreenGui",
  "Frame",
  "TextLabel",
  "TextButton",
  "TextBox",
  "ImageLabel",
  "ScrollingFrame",
]);

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const isFiniteNum = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isHex = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

function sanitizeNode(raw: unknown): SceneNode | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  if (typeof source.id !== "string" || !source.id) return null;
  if (
    typeof source.cls !== "string" ||
    !VALID_CLS.has(source.cls as RobloxClass)
  ) {
    return null;
  }
  if (typeof source.name !== "string") return null;

  const pos = source.pos as Record<string, unknown> | undefined;
  const size = source.size as Record<string, unknown> | undefined;
  if (!pos || !isFiniteNum(pos.x) || !isFiniteNum(pos.y)) return null;
  if (!size || !isFiniteNum(size.x) || !isFiniteNum(size.y)) return null;
  if (
    !isHex(source.color) ||
    !isFiniteNum(source.transparency) ||
    !isFiniteNum(source.cornerRadius) ||
    !isFiniteNum(source.zindex)
  ) {
    return null;
  }

  const node: SceneNode = {
    id: source.id,
    cls: source.cls as RobloxClass,
    name: source.name,
    parentId:
      typeof source.parentId === "string" || source.parentId === null
        ? source.parentId
        : null,
    pos: { x: clamp01(pos.x), y: clamp01(pos.y) },
    size: { x: clamp01(size.x), y: clamp01(size.y) },
    color: source.color,
    transparency: clamp01(source.transparency),
    cornerRadius: Math.max(0, source.cornerRadius),
    zindex: Math.round(source.zindex),
    ...sanitizeResponsiveGeometry(source),
  };

  if (typeof source.text === "string") node.text = source.text;
  if (
    typeof source.font === "string" &&
    (FONTS as readonly string[]).includes(source.font)
  ) {
    node.font = source.font;
  }
  if (isFiniteNum(source.textSize)) node.textSize = Math.max(1, source.textSize);
  if (isHex(source.textColor)) node.textColor = source.textColor;

  const gradient = source.gradient as Record<string, unknown> | undefined;
  if (gradient && isHex(gradient.from) && isHex(gradient.to)) {
    node.gradient = { from: gradient.from, to: gradient.to };
  }
  if (source.layout === "list" || source.layout === "grid") {
    node.layout = source.layout;
  }
  if (isFiniteNum(source.padding)) node.padding = Math.max(0, source.padding);
  if (isFiniteNum(source.layoutOrder)) {
    node.layoutOrder = Math.max(0, Math.round(source.layoutOrder));
  }
  if (typeof source.initialVisible === "boolean") {
    node.initialVisible = source.initialVisible;
  }

  const action = source.action as Record<string, unknown> | undefined;
  if (
    source.cls === "TextButton" &&
    action &&
    (action.type === "show" ||
      action.type === "hide" ||
      action.type === "toggle" ||
      action.type === "hideGui")
  ) {
    node.action = {
      type: action.type,
      ...(typeof action.targetId === "string"
        ? { targetId: action.targetId }
        : {}),
    };
  }

  return node;
}

function repairParents(scene: SceneNode[]): void {
  const ids = new Set(scene.map((node) => node.id));
  for (const node of scene) {
    if (node.parentId && !ids.has(node.parentId)) node.parentId = null;
  }

  for (const node of scene) {
    const chain = new Set<string>([node.id]);
    let currentId = node.parentId;
    let guard = scene.length + 1;
    while (currentId && guard-- > 0) {
      if (chain.has(currentId)) {
        node.parentId = null;
        break;
      }
      chain.add(currentId);
      currentId =
        scene.find((candidate) => candidate.id === currentId)?.parentId ?? null;
    }
  }
}

export function sanitizeScene(raw: unknown): SceneNode[] | null {
  if (!Array.isArray(raw)) return null;
  const scene = raw
    .map(sanitizeNode)
    .filter((node): node is SceneNode => node !== null);
  if (scene.length === 0) return null;
  repairParents(scene);
  return scene;
}
