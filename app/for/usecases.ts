// Use-case landing pages targeting "Roblox GUI Maker for X" long-tail queries.
// Each maps to a template where we have one, or to the blank editor otherwise.

export type UseCase = {
  slug: string;
  title: string; // H1, e.g. "Roblox GUI Maker for Shop Menus"
  noun: string; // "shop menu"
  blurb: string; // specific 2-3 sentence intro
  needs: string[]; // 3 things this GUI type usually needs
  template?: string; // related template slug
};

export const USE_CASES: UseCase[] = [
  {
    slug: "main-menus",
    title: "Roblox GUI Maker for Main Menus",
    noun: "main menu",
    blurb:
      "The main menu is the first thing players see when they join. It needs a title, a clear primary action (Play), and secondary buttons stacked neatly — and it has to look the part.",
    needs: [
      "A centered panel with a title and a stack of action buttons",
      "Buttons that open or close other panels (settings, credits)",
      "Scale-based sizing so it centers on phones and desktops alike",
    ],
    template: "main-menu",
  },
  {
    slug: "shop-menus",
    title: "Roblox GUI Maker for Shop Menus",
    noun: "shop menu",
    blurb:
      "A shop needs a scrollable area where items tile into a grid, each with an icon and price, plus a way for the purchase to actually reach the server.",
    needs: [
      "A ScrollingFrame whose items auto-tile with UIGridLayout",
      "Reusable item cells (icon + price + buy button)",
      "A RemoteEvent so the server verifies and grants the purchase",
    ],
    template: "shop",
  },
  {
    slug: "inventory-screens",
    title: "Roblox GUI Maker for Inventory Screens",
    noun: "inventory screen",
    blurb:
      "An inventory shows everything a player owns, usually as a grid of slots they can tap to equip or use. Add or remove items and the grid should reflow without manual layout.",
    needs: [
      "A fixed UIGridLayout of uniform slots",
      "Scrolling when the player owns more than fits on screen",
      "Slot cells you can populate from a script at runtime",
    ],
    template: "inventory",
  },
  {
    slug: "simulator-huds",
    title: "Roblox GUI Maker for Simulator HUDs",
    noun: "simulator HUD",
    blurb:
      "Simulator HUDs pack currency, stats, and action buttons into the corners of the screen and update them every frame. They stay on screen the whole game, so they have to be tight and readable.",
    needs: [
      "Corner-anchored currency and stat readouts",
      "Persistent action buttons (rebirth, pets, shop)",
      "Small footprint that never blocks gameplay",
    ],
  },
  {
    slug: "settings-panels",
    title: "Roblox GUI Maker for Settings Panels",
    noun: "settings panel",
    blurb:
      "A settings panel lets players tune music, sound, and particles — usually a list of rows with a label and a toggle. It opens from the menu and closes back to it.",
    needs: [
      "Rows stacked with UIListLayout (label + toggle each)",
      "Open/close behavior wired to a button",
      "UIPadding so the contents don't touch the edges",
    ],
    template: "settings",
  },
  {
    slug: "loading-screens",
    title: "Roblox GUI Maker for Loading Screens",
    noun: "loading screen",
    blurb:
      "A loading screen covers the whole viewport while assets stream in — a title, a progress bar that fills, and a rotating tip. Once the game is ready, it disappears.",
    needs: [
      "A full-screen background (IgnoreGuiInset) with a gradient",
      "A progress bar you can tween from empty to full",
      "Clean teardown (destroy) when loading completes",
    ],
    template: "loading-screen",
  },
  {
    slug: "leaderboards",
    title: "Roblox GUI Maker for Leaderboards",
    noun: "leaderboard",
    blurb:
      "A leaderboard ranks players by a stat and drives competition. Each row shows rank, name, and score, with the top entry highlighted, and it grows as more players join.",
    needs: [
      "Rows that stack with UIListLayout and scale with player count",
      "Rank, name, and score columns per row",
      "The top row highlighted to reward the leader",
    ],
    template: "leaderboard",
  },
  {
    slug: "admin-panels",
    title: "Roblox GUI Maker for Admin Panels",
    noun: "admin panel",
    blurb:
      "Admin panels give moderators a hidden interface to kick, ban, or teleport players. They're opened with a command or key, list players, and run privileged actions through server checks.",
    needs: [
      "A hidden panel toggled by an admin key or command",
      "A scrollable player list with action buttons per row",
      "Server-side permission checks on every action",
    ],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
