// Pure scene logic: create a node, and generate clean Luau from the tree.
// No React, no side effects.

import type { RobloxClass, SceneNode } from "./catalog";

export const FONTS = [
  "GothamBlack",
  "GothamBold",
  "GothamSemibold",
  "GothamMedium",
  "Gotham",
  "ArialBold",
  "Arial",
  "Code",
  "Highway",
] as const;

type Defaults = {
  pos: { x: number; y: number };
  size: { x: number; y: number };
  color: string;
  transparency: number;
  cornerRadius: number;
  text?: string;
  font?: string;
  textSize?: number;
  textColor?: string;
};

const DEFAULTS: Partial<Record<RobloxClass, Defaults>> = {
  ScreenGui: { pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0c0e17", transparency: 1, cornerRadius: 0 },
  Frame: { pos: { x: 0.36, y: 0.4 }, size: { x: 0.28, y: 0.24 }, color: "#282933", transparency: 0, cornerRadius: 10 },
  TextLabel: { pos: { x: 0.32, y: 0.32 }, size: { x: 0.36, y: 0.07 }, color: "#000000", transparency: 1, cornerRadius: 0, text: "Label", font: "GothamMedium", textSize: 18, textColor: "#e1e1ef" },
  TextButton: { pos: { x: 0.32, y: 0.5 }, size: { x: 0.36, y: 0.09 }, color: "#00a2ff", transparency: 0, cornerRadius: 10, text: "Button", font: "GothamBold", textSize: 18, textColor: "#001d34" },
  TextBox: { pos: { x: 0.32, y: 0.62 }, size: { x: 0.36, y: 0.08 }, color: "#242836", transparency: 0, cornerRadius: 6, text: "Type here...", font: "GothamMedium", textSize: 16, textColor: "#bec7d4" },
  ImageLabel: { pos: { x: 0.36, y: 0.36 }, size: { x: 0.28, y: 0.28 }, color: "#32343e", transparency: 0, cornerRadius: 8 },
  ScrollingFrame: { pos: { x: 0.3, y: 0.28 }, size: { x: 0.4, y: 0.44 }, color: "#1d1f29", transparency: 0, cornerRadius: 8 },
};

const NAMES: Partial<Record<RobloxClass, string>> = {
  ScreenGui: "ScreenGui",
  Frame: "Frame",
  TextLabel: "Label",
  TextButton: "Button",
  TextBox: "Input",
  ImageLabel: "Image",
  ScrollingFrame: "List",
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function createNode(
  cls: RobloxClass,
  scene: SceneNode[],
  parentId: string | null = null
): SceneNode {
  const fallback: Defaults = { pos: { x: 0.4, y: 0.4 }, size: { x: 0.4, y: 0.2 }, color: "#282933", transparency: 0, cornerRadius: 8 };
  const d = DEFAULTS[cls] ?? fallback;
  const z = scene.reduce((m, n) => Math.max(m, n.zindex), 0) + 1;
  const off = (scene.filter((n) => n.cls === cls).length % 5) * 0.02;
  return {
    id: crypto.randomUUID(),
    cls,
    name: NAMES[cls] ?? cls,
    parentId,
    pos: { x: clamp01(d.pos.x + off), y: clamp01(d.pos.y + off) },
    size: { ...d.size },
    color: d.color,
    transparency: d.transparency,
    cornerRadius: d.cornerRadius,
    zindex: z,
    ...(d.text !== undefined ? { text: d.text } : {}),
    ...(d.font !== undefined ? { font: d.font } : {}),
    ...(d.textSize !== undefined ? { textSize: d.textSize } : {}),
    ...(d.textColor !== undefined ? { textColor: d.textColor } : {}),
  };
}

// Deep-clone a node and its descendants with fresh ids, remapping parentId
// within the subtree so cloned children point to cloned parents. Offset and
// raise z so the duplicate sits beside and on top of the original.
export function duplicateSubtree(
  scene: SceneNode[],
  id: string
): { nodes: SceneNode[]; newId: string } | null {
  const target = scene.find((n) => n.id === id);
  if (!target) return null;

  const subtree: SceneNode[] = [target];
  const collect = (parentId: string) => {
    for (const n of scene) {
      if ((n.parentId ?? null) === parentId) {
        subtree.push(n);
        collect(n.id);
      }
    }
  };
  collect(target.id);

  const idMap = new Map<string, string>();
  for (const n of subtree) idMap.set(n.id, crypto.randomUUID());

  const maxZ = scene.reduce((m, n) => Math.max(m, n.zindex), 0);
  const nodes = subtree.map((n) => ({
    ...n,
    pos: { x: clamp01(n.pos.x + 0.03), y: clamp01(n.pos.y + 0.03) },
    size: { ...n.size },
    ...(n.gradient ? { gradient: { ...n.gradient } } : {}),
    id: idMap.get(n.id)!,
    parentId: n.parentId ? idMap.get(n.parentId) ?? n.parentId : n.parentId,
    zindex: maxZ + 1,
  }));

  return { nodes, newId: idMap.get(target.id)! };
}

// ---- Luau generation -------------------------------------------------------

const fmt = (n: number) => Number(n.toFixed(3)).toString();
const luaStr = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function color3(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return "Color3.fromRGB(255, 255, 255)";
  const n = parseInt(m[1], 16);
  return `Color3.fromRGB(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

const fontEnum = (font?: string) =>
  `Enum.Font.${font && font.length ? font : "GothamMedium"}`;

// Lighten (pct > 0) or darken (pct < 0) a hex color by a percentage of 255.
export function shade(hex: string, pct: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const adj = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (pct / 100) * 255)));
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(adj((n >> 16) & 255))}${toHex(adj((n >> 8) & 255))}${toHex(
    adj(n & 255)
  )}`;
}

export function generateLuau(scene: SceneNode[]): string {
  const out: string[] = ["-- Generated by Roblox GUI Maker"];
  out.push('local player = game:GetService("Players").LocalPlayer');

  const childrenOf = (id: string | null) =>
    scene.filter((n) => (n.parentId ?? null) === id);
  const rootGui = scene.find(
    (n) => n.cls === "ScreenGui" && (n.parentId ?? null) === null
  );

  const varNames = new Map<string, string>();
  let counter = 0;
  const nameOf = (id: string) => {
    let v = varNames.get(id);
    if (!v) {
      v = `el${counter++}`;
      varNames.set(id, v);
    }
    return v;
  };

  // Always emit a ScreenGui wrapper parented to PlayerGui.
  out.push('local gui = Instance.new("ScreenGui")');
  if (rootGui) {
    out.push(`gui.Name = ${luaStr(rootGui.name)}`);
    out.push("gui.ResetOnSpawn = false");
    out.push("gui.IgnoreGuiInset = true");
    varNames.set(rootGui.id, "gui");
  }
  out.push('gui.Parent = player:WaitForChild("PlayerGui")');

  const emit = (node: SceneNode, parentVar: string) => {
    const v = nameOf(node.id);
    out.push("");
    out.push(`local ${v} = Instance.new(${luaStr(node.cls)})`);
    out.push(`${v}.Name = ${luaStr(node.name)}`);
    out.push(`${v}.Size = UDim2.fromScale(${fmt(node.size.x)}, ${fmt(node.size.y)})`);
    out.push(`${v}.Position = UDim2.fromScale(${fmt(node.pos.x)}, ${fmt(node.pos.y)})`);
    if (node.transparency >= 1) {
      out.push(`${v}.BackgroundTransparency = 1`);
    } else {
      out.push(`${v}.BackgroundColor3 = ${color3(node.color)}`);
      out.push(`${v}.BackgroundTransparency = ${fmt(node.transparency)}`);
    }
    out.push(`${v}.ZIndex = ${node.zindex}`);

    if (node.cornerRadius > 0) {
      out.push("");
      out.push(`local ${v}_corner = Instance.new("UICorner")`);
      out.push(`${v}_corner.CornerRadius = UDim.new(0, ${node.cornerRadius})`);
      out.push(`${v}_corner.Parent = ${v}`);
    }
    if (node.gradient) {
      out.push("");
      out.push(`local ${v}_grad = Instance.new("UIGradient")`);
      out.push(
        `${v}_grad.Color = ColorSequence.new(${color3(node.gradient.from)}, ${color3(node.gradient.to)})`
      );
      out.push(`${v}_grad.Rotation = 45`);
      out.push(`${v}_grad.Parent = ${v}`);
    }
    if (node.layout === "list") {
      out.push("");
      out.push(`local ${v}_list = Instance.new("UIListLayout")`);
      out.push(`${v}_list.SortOrder = Enum.SortOrder.LayoutOrder`);
      out.push(`${v}_list.Parent = ${v}`);
    }
    if (node.layout === "grid") {
      out.push("");
      out.push(`local ${v}_grid = Instance.new("UIGridLayout")`);
      out.push(`${v}_grid.CellSize = UDim2.fromOffset(100, 100)`);
      out.push(`${v}_grid.Parent = ${v}`);
    }
    if (node.padding) {
      out.push("");
      out.push(`local ${v}_pad = Instance.new("UIPadding")`);
      out.push(`${v}_pad.PaddingTop = UDim.new(0, ${node.padding})`);
      out.push(`${v}_pad.PaddingBottom = UDim.new(0, ${node.padding})`);
      out.push(`${v}_pad.PaddingLeft = UDim.new(0, ${node.padding})`);
      out.push(`${v}_pad.PaddingRight = UDim.new(0, ${node.padding})`);
      out.push(`${v}_pad.Parent = ${v}`);
    }
    if (node.text != null) {
      out.push(`${v}.Text = ${luaStr(node.text)}`);
      out.push(`${v}.Font = ${fontEnum(node.font)}`);
      out.push(`${v}.TextSize = ${node.textSize ?? 14}`);
      out.push(`${v}.TextColor3 = ${color3(node.textColor ?? "#e1e1ef")}`);
    }

    out.push(`${v}.Parent = ${parentVar}`);

    for (const child of childrenOf(node.id)) emit(child, v);
  };

  // Top-level nodes parent to the ScreenGui wrapper ("gui").
  for (const n of childrenOf(null)) {
    if (n === rootGui) {
      for (const child of childrenOf(n.id)) emit(child, "gui");
    } else {
      emit(n, "gui");
    }
  }

  return out.join("\n");
}
