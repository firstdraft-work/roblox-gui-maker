// Game UI Kits (Phase 1): a Kit bundles several existing single-screen templates
// under one shared theme, so they read as a cohesive game UI rather than loose
// fragments. Adding a kit is data-only — pick screens (existing template slugs)
// and a theme. kitScene recolors a screen with the kit's theme via applyTheme.

import type { SceneNode } from "./catalog";
import { getTemplate } from "./templates";
import { applyTheme, getTheme } from "./themes";

export type KitScreen = { role: string; template: string };

export type Kit = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  theme: string; // Theme.name
  screens: KitScreen[];
};

export const KITS: Kit[] = [
  {
    slug: "simulator-kit",
    name: "Simulator Pro UI Kit",
    tagline: "Five cohesive screens for a clicker/simulator — warm sunset theme",
    description:
      "A complete simulator interface set: a main menu, a coin shop, a game pass storefront, a daily rewards calendar, and a settings panel — all sharing one warm theme so they look like one game.",
    theme: "sunset",
    screens: [
      { role: "Main menu", template: "main-menu" },
      { role: "Coin shop", template: "shop" },
      { role: "Game pass store", template: "game-pass-shop" },
      { role: "Daily rewards", template: "daily-rewards" },
      { role: "Settings", template: "settings" },
    ],
  },
  {
    slug: "quest-rpg-kit",
    name: "Quest RPG UI Kit",
    tagline: "Five cohesive screens for an RPG — cool arctic theme",
    description:
      "A role-playing interface set: a main menu, an inventory grid, a shop, a leaderboard, and a quest tracker — unified under one cool theme and ready to drop into an adventure game.",
    theme: "arctic",
    screens: [
      { role: "Main menu", template: "main-menu" },
      { role: "Inventory", template: "inventory" },
      { role: "Shop", template: "shop" },
      { role: "Leaderboard", template: "leaderboard" },
      { role: "Quest tracker", template: "quest-tracker" },
    ],
  },
];

export function getKit(slug: string): Kit | undefined {
  return KITS.find((k) => k.slug === slug);
}

// A kit screen's scene, recolored with the kit's theme. Returns undefined if the
// template or theme can't be resolved.
export function kitScene(kit: Kit, templateSlug: string): SceneNode[] | undefined {
  const tpl = getTemplate(templateSlug);
  const theme = getTheme(kit.theme);
  if (!tpl || !theme) return undefined;
  return applyTheme(tpl.scene, theme);
}
