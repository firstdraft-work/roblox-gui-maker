// Chinese (zh) prose for game UI kits. Slugs match kits.ts; getKitZh() overlays
// zh prose on the en Kit, keeping `theme` and each screen's `template` from en
// (only the display `role` is translated).

import { getKit, type Kit } from "./kits";

type KitZhProse = {
  name: string;
  tagline: string;
  description: string;
  // Same length/order as the English kit's screens — only the role label.
  screens: { role: string }[];
};

const KITS_ZH_PROSE: Record<string, KitZhProse> = {
  "simulator-kit": {
    name: "模拟器专业 UI Kit",
    tagline: "一套点击/模拟器游戏的五屏配套界面 —— 暖色日落主题",
    description:
      "一套完整的模拟器界面:主菜单、金币商店、Game Pass 商店、每日奖励日历和设置面板 —— 全部共用一个暖色主题,看起来像同一个游戏。",
    screens: [
      { role: "主菜单" },
      { role: "金币商店" },
      { role: "Game Pass 商店" },
      { role: "每日奖励" },
      { role: "设置" },
    ],
  },
  "quest-rpg-kit": {
    name: "任务 RPG UI Kit",
    tagline: "一套 RPG 的五屏配套界面 —— 冷色极地主题",
    description:
      "一套角色扮演界面:主菜单、背包网格、商店、排行榜和任务追踪 —— 统一在一个冷色主题下,可直接塞进冒险游戏。",
    screens: [
      { role: "主菜单" },
      { role: "背包" },
      { role: "商店" },
      { role: "排行榜" },
      { role: "任务追踪" },
    ],
  },
};

export function getKitZh(slug: string): Kit | undefined {
  const en = getKit(slug);
  const zh = KITS_ZH_PROSE[slug];
  if (!en || !zh) return undefined;
  return {
    ...en,
    name: zh.name,
    tagline: zh.tagline,
    description: zh.description,
    screens: en.screens.map((s, i) => ({ ...s, role: zh.screens[i]?.role ?? s.role })),
  };
}

// Display names for theme slugs (slugs are machine keys; this is presentation only).
export const THEME_ZH: Record<string, string> = {
  sunset: "日落",
  arctic: "极地",
  nexus: "Nexus",
};
