"use client";

import {
  Monitor,
  Square,
  Type,
  MousePointerClick,
  TextCursorInput,
  Image as ImageIcon,
  PanelTop,
  Spline,
  Blend,
  List,
  LayoutGrid,
  Frame,
  GripVertical,
  type LucideIcon,
} from "lucide-react";
import { PALETTE, type RobloxClass } from "./catalog";

const ICON: Record<RobloxClass, LucideIcon> = {
  ScreenGui: Monitor,
  Frame: Square,
  TextLabel: Type,
  TextButton: MousePointerClick,
  TextBox: TextCursorInput,
  ImageLabel: ImageIcon,
  ScrollingFrame: PanelTop,
  UICorner: Spline,
  UIGradient: Blend,
  UIListLayout: List,
  UIGridLayout: LayoutGrid,
  UIPadding: Frame,
};

type Props = {
  onAdd: (cls: RobloxClass) => void;
  onApply: (cls: RobloxClass) => void;
};

export function Palette({ onAdd, onApply }: Props) {
  return (
    <aside className="w-72 shrink-0 bg-panel border-r border-line flex flex-col">
      <PanelHeader>Components</PanelHeader>
      <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-4">
        {PALETTE.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-2 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              {group.label}
            </p>
            {group.items.map((it) => {
              const Icon = ICON[it.cls];
              if (it.mode === "soon") {
                return (
                  <div
                    key={it.cls}
                    title="Needs nested containers — coming with drag & drop"
                    className="flex items-center gap-2 px-2 py-2 rounded-md opacity-45 cursor-not-allowed"
                  >
                    <span className="grid place-items-center w-7 h-7 rounded bg-input text-ink-mute">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-ink font-medium leading-tight">
                        {it.cls}
                      </span>
                      <span className="block text-[11px] text-ink-mute truncate">
                        {it.hint}
                      </span>
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-mute bg-input px-1.5 py-0.5 rounded">
                      soon
                    </span>
                  </div>
                );
              }
              const handleClick = () =>
                it.mode === "apply" ? onApply(it.cls) : onAdd(it.cls);
              return (
                <button
                  key={it.cls}
                  onClick={handleClick}
                  className="group w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-raised transition-colors cursor-pointer text-left"
                >
                  <span className="grid place-items-center w-7 h-7 rounded bg-input text-ink-dim group-hover:text-focus transition-colors">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-ink font-medium leading-tight">
                      {it.cls}
                    </span>
                    <span className="block text-[11px] text-ink-mute truncate">
                      {it.hint}
                    </span>
                  </span>
                  <GripVertical className="w-3.5 h-3.5 text-ink-mute opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-9 shrink-0 flex items-center px-3 border-b border-line">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-dim">
        {children}
      </span>
    </div>
  );
}
