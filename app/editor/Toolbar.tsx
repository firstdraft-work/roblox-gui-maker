"use client";

import {
  Monitor,
  Tablet,
  Smartphone,
  LayoutTemplate,
  Download,
  Check,
} from "lucide-react";
import type { DeviceKind } from "./catalog";

const DEVICES: { id: DeviceKind; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

type Props = {
  device: DeviceKind;
  onDevice: (d: DeviceKind) => void;
  onExport: () => void;
  copied: boolean;
};

export function Toolbar({ device, onDevice, onExport, copied }: Props) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-panel border-b border-line select-none">
      {/* wordmark — exact-match brand text for SEO */}
      <div className="flex items-center gap-2">
        <span className="grid place-items-center w-7 h-7 rounded-md bg-primary text-on-primary font-bold text-sm">
          R
        </span>
        <span className="font-semibold tracking-tight">
          Roblox<span className="text-ink-dim"> GUI Maker</span>
        </span>
      </div>

      {/* device toggle */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-input">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          const active = device === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onDevice(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                active
                  ? "bg-raised text-ink"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-ink-dim hover:text-ink hover:bg-raised transition-colors">
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold bg-primary text-on-primary hover:brightness-110 transition"
        >
          {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {copied ? "Copied" : "Export Luau"}
        </button>
      </div>
    </header>
  );
}
