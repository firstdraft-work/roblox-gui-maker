// Pre-made GUI templates. Each is a SceneNode[] the editor can load directly
// via /editor?template=<slug>, and ScenePreview can render read-only.
// They double as long-tail SEO pages (/templates/<slug>) and showcase the
// nesting + layout features (UIListLayout / UIGridLayout / gradients).

import type { RobloxClass, SceneNode } from "./catalog";

export type TemplateCategory = "Menus" | "HUD" | "Shop" | "Settings";

export type Template = {
  slug: string;
  title: string;
  category: TemplateCategory;
  tagline: string;
  description: string;
  scene: SceneNode[];
};

let counter = 0;
function mk(cls: RobloxClass, overrides: Partial<SceneNode> = {}): SceneNode {
  return {
    id: `tpl-${counter++}`,
    cls,
    name: overrides.name ?? cls,
    parentId: overrides.parentId ?? null,
    pos: overrides.pos ?? { x: 0.4, y: 0.4 },
    size: overrides.size ?? { x: 0.2, y: 0.1 },
    color: overrides.color ?? "#1d1f29",
    transparency: overrides.transparency ?? 0,
    cornerRadius: overrides.cornerRadius ?? 8,
    zindex: overrides.zindex ?? 1,
    ...(overrides.text !== undefined ? { text: overrides.text } : {}),
    ...(overrides.font ? { font: overrides.font } : {}),
    ...(overrides.textSize ? { textSize: overrides.textSize } : {}),
    ...(overrides.textColor ? { textColor: overrides.textColor } : {}),
    ...(overrides.gradient ? { gradient: overrides.gradient } : {}),
    ...(overrides.layout ? { layout: overrides.layout } : {}),
    ...(overrides.padding ? { padding: overrides.padding } : {}),
  };
}

const FLOW = { x: 0, y: 0 };

const mainMenu = (() => {
  const root = mk("ScreenGui", { name: "MainMenu", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 1, cornerRadius: 0 });
  const panel = mk("Frame", { name: "Panel", parentId: root.id, pos: { x: 0.3, y: 0.16 }, size: { x: 0.4, y: 0.68 }, color: "#15171f", cornerRadius: 18, layout: "list", padding: 20 });
  const title = mk("TextLabel", { name: "Title", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.18 }, color: "#000000", transparency: 1, text: "GAME TITLE", font: "GothamBlack", textSize: 30, textColor: "#99cbff" });
  const play = mk("TextButton", { name: "Play", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.14 }, color: "#00a2ff", cornerRadius: 10, text: "PLAY", font: "GothamBold", textSize: 20, textColor: "#001d34" });
  const settings = mk("TextButton", { name: "Settings", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.14 }, color: "#282933", cornerRadius: 10, text: "SETTINGS", font: "GothamMedium", textSize: 16, textColor: "#e1e1ef" });
  const quit = mk("TextButton", { name: "Quit", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.14 }, color: "#282933", cornerRadius: 10, text: "QUIT", font: "GothamMedium", textSize: 16, textColor: "#e1e1ef" });
  return [root, panel, title, play, settings, quit];
})();

const shop = (() => {
  const root = mk("ScreenGui", { name: "Shop", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 1, cornerRadius: 0 });
  const panel = mk("Frame", { name: "ShopPanel", parentId: root.id, pos: { x: 0.18, y: 0.12 }, size: { x: 0.64, y: 0.76 }, color: "#15171f", cornerRadius: 16, layout: "list", padding: 16 });
  const header = mk("Frame", { name: "Header", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.12 }, color: "#000000", transparency: 1, layout: "list" });
  const title = mk("TextLabel", { name: "Title", parentId: header.id, pos: FLOW, size: { x: 1, y: 1 }, color: "#000000", transparency: 1, text: "🛒  SHOP", font: "GothamBold", textSize: 26, textColor: "#e1e1ef" });
  const grid = mk("ScrollingFrame", { name: "ItemGrid", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.7 }, color: "#0e0f16", cornerRadius: 10, layout: "grid", padding: 8 });
  const colors = ["#00a2ff", "#4cddb1", "#c50005", "#99cbff", "#ffb4a9", "#b083ff"];
  const items = colors.map((c, i) =>
    mk("Frame", { name: `Item${i}`, parentId: grid.id, pos: FLOW, size: { x: 0.3, y: 0.3 }, color: c, cornerRadius: 8, transparency: 0.15 })
  );
  return [root, panel, header, title, grid, ...items];
})();

const settingsTpl = (() => {
  const root = mk("ScreenGui", { name: "Settings", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 1, cornerRadius: 0 });
  const panel = mk("Frame", { name: "SettingsPanel", parentId: root.id, pos: { x: 0.28, y: 0.16 }, size: { x: 0.44, y: 0.68 }, color: "#15171f", cornerRadius: 16, layout: "list", padding: 18 });
  const title = mk("TextLabel", { name: "Title", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.14 }, color: "#000000", transparency: 1, text: "SETTINGS", font: "GothamBold", textSize: 24, textColor: "#e1e1ef" });
  const rows = ["Music", "Sound Effects", "Particles"].map((label, i) => {
    const row = mk("Frame", { name: `Row${i}`, parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.16 }, color: "#1d1f29", cornerRadius: 8 });
    const lbl = mk("TextLabel", { name: "Label", parentId: row.id, pos: { x: 0.04, y: 0.3 }, size: { x: 0.6, y: 0.4 }, color: "#000000", transparency: 1, text: label, font: "GothamMedium", textSize: 16, textColor: "#e1e1ef" });
    const toggle = mk("Frame", { name: "Toggle", parentId: row.id, pos: { x: 0.82, y: 0.3 }, size: { x: 0.12, y: 0.4 }, color: i === 2 ? "#3a3d48" : "#4cddb1", cornerRadius: 999 });
    return [row, lbl, toggle];
  });
  return [root, panel, title, ...rows.flat()];
})();

const inventory = (() => {
  const root = mk("ScreenGui", { name: "Inventory", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 1, cornerRadius: 0 });
  const panel = mk("Frame", { name: "InvPanel", parentId: root.id, pos: { x: 0.22, y: 0.14 }, size: { x: 0.56, y: 0.72 }, color: "#15171f", cornerRadius: 16, layout: "list", padding: 16 });
  const title = mk("TextLabel", { name: "Title", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.12 }, color: "#000000", transparency: 1, text: "INVENTORY", font: "GothamBold", textSize: 22, textColor: "#99cbff" });
  const grid = mk("Frame", { name: "Slots", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.82 }, color: "#000000", transparency: 1, layout: "grid", padding: 6 });
  const slots = Array.from({ length: 8 }, (_, i) =>
    mk("Frame", { name: `Slot${i}`, parentId: grid.id, pos: FLOW, size: { x: 0.3, y: 0.22 }, color: i % 3 === 0 ? "#243042" : "#1d1f29", cornerRadius: 8 })
  );
  return [root, panel, title, grid, ...slots];
})();

const loadingScreen = (() => {
  const root = mk("ScreenGui", { name: "Loading", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 0, cornerRadius: 0, gradient: { from: "#141a2e", to: "#0b0d14" } });
  const title = mk("TextLabel", { name: "Title", parentId: root.id, pos: { x: 0.2, y: 0.36 }, size: { x: 0.6, y: 0.12 }, color: "#000000", transparency: 1, text: "LOADING", font: "GothamBlack", textSize: 44, textColor: "#99cbff" });
  const barBg = mk("Frame", { name: "BarBg", parentId: root.id, pos: { x: 0.3, y: 0.56 }, size: { x: 0.4, y: 0.03 }, color: "#1d1f29", cornerRadius: 999 });
  const barFill = mk("Frame", { name: "BarFill", parentId: barBg.id, pos: { x: 0, y: 0 }, size: { x: 0.65, y: 1 }, color: "#00a2ff", cornerRadius: 999 });
  const tip = mk("TextLabel", { name: "Tip", parentId: root.id, pos: { x: 0.2, y: 0.66 }, size: { x: 0.6, y: 0.06 }, color: "#000000", transparency: 1, text: "Tip: press F to pay respects", font: "GothamMedium", textSize: 15, textColor: "#89919d" });
  return [root, title, barBg, barFill, tip];
})();

const leaderboard = (() => {
  const root = mk("ScreenGui", { name: "Leaderboard", pos: { x: 0, y: 0 }, size: { x: 1, y: 1 }, color: "#0b0d14", transparency: 1, cornerRadius: 0 });
  const panel = mk("Frame", { name: "Board", parentId: root.id, pos: { x: 0.32, y: 0.14 }, size: { x: 0.36, y: 0.72 }, color: "#15171f", cornerRadius: 14, layout: "list", padding: 10 });
  const title = mk("TextLabel", { name: "Title", parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.12 }, color: "#000000", transparency: 1, text: "LEADERBOARD", font: "GothamBold", textSize: 18, textColor: "#e1e1ef" });
  const rows = [
    ["1", "Alex", "9,820"],
    ["2", "Mia", "8,104"],
    ["3", "Kai", "7,551"],
    ["4", "Zoe", "6,330"],
  ].map(([rank, name, score], i) => {
    const row = mk("Frame", { name: `Row${i}`, parentId: panel.id, pos: FLOW, size: { x: 1, y: 0.14 }, color: i === 0 ? "#103048" : "#1d1f29", cornerRadius: 8 });
    const rankEl = mk("TextLabel", { name: "Rank", parentId: row.id, pos: { x: 0.04, y: 0.25 }, size: { x: 0.12, y: 0.5 }, color: "#000000", transparency: 1, text: rank, font: "GothamBold", textSize: 18, textColor: i === 0 ? "#99cbff" : "#bec7d4" });
    const nameEl = mk("TextLabel", { name: "Name", parentId: row.id, pos: { x: 0.2, y: 0.3 }, size: { x: 0.5, y: 0.4 }, color: "#000000", transparency: 1, text: name, font: "GothamMedium", textSize: 16, textColor: "#e1e1ef" });
    const scoreEl = mk("TextLabel", { name: "Score", parentId: row.id, pos: { x: 0.66, y: 0.3 }, size: { x: 0.3, y: 0.4 }, color: "#000000", transparency: 1, text: score, font: "GothamMedium", textSize: 15, textColor: "#4cddb1" });
    return [row, rankEl, nameEl, scoreEl];
  });
  return [root, panel, title, ...rows.flat()];
})();

export const TEMPLATES: Template[] = [
  {
    slug: "main-menu",
    title: "Roblox Main Menu GUI",
    category: "Menus",
    tagline: "Title screen with Play / Settings / Quit",
    description:
      "A clean centered main menu: game title, primary Play button in Electric Blue, and secondary action buttons — stacked with a UIListLayout so it stays tidy on any screen size.",
    scene: mainMenu,
  },
  {
    slug: "shop",
    title: "Roblox Shop GUI",
    category: "Shop",
    tagline: "Item grid with a scrollable UIGridLayout",
    description:
      "A game shop panel with a header and a ScrollingFrame whose children auto-arrange into a grid via UIGridLayout — drop in as many items as you want and they tile automatically.",
    scene: shop,
  },
  {
    slug: "settings",
    title: "Roblox Settings GUI",
    category: "Settings",
    tagline: "Toggle rows stacked with UIListLayout",
    description:
      "A settings panel: each option is a row with a label and a toggle pill, stacked vertically with UIListLayout and inner padding from UIPadding.",
    scene: settingsTpl,
  },
  {
    slug: "inventory",
    title: "Roblox Inventory GUI",
    category: "Menus",
    tagline: "Slot grid for items / cosmetics",
    description:
      "An inventory with a fixed UIGridLayout of slots — perfect for items, cosmetics, or a hotbar. Add or remove slots and the grid reflows.",
    scene: inventory,
  },
  {
    slug: "loading-screen",
    title: "Roblox Loading Screen GUI",
    category: "Menus",
    tagline: "Title, progress bar and rotating tip",
    description:
      "A full-screen loading screen with a gradient background, big title, a progress bar (background + animated fill), and a tip line. A great first impression while the game loads.",
    scene: loadingScreen,
  },
  {
    slug: "leaderboard",
    title: "Roblox Leaderboard GUI",
    category: "HUD",
    tagline: "Ranked rows with score highlights",
    description:
      "A live-style leaderboard with rank, name, and score columns, the top row highlighted. Rows stack with UIListLayout so it scales with player count.",
    scene: leaderboard,
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export const CATEGORIES: TemplateCategory[] = ["Menus", "HUD", "Shop", "Settings"];
