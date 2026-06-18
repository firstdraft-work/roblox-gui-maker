"use client";

import Link from "next/link";
import {
  Monitor,
  Tablet,
  Smartphone,
  LayoutTemplate,
  Download,
  Check,
  Undo2,
  Redo2,
  FilePlus2,
  FileJson,
  Play,
  Square,
  Upload,
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
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onNew: () => void;
  previewing: boolean;
  onPreview: () => void;
  onImportProject: (file: File) => void;
  onExportProject: () => void;
  importError: string | null;
};

export function Toolbar({
  device,
  onDevice,
  onExport,
  copied,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onNew,
  previewing,
  onPreview,
  onImportProject,
  onExportProject,
  importError,
}: Props) {
  return (
    <header className="relative h-12 shrink-0 flex items-center justify-between px-4 bg-panel border-b border-line select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-7 h-7 rounded-md bg-primary text-on-primary font-bold text-sm">
            R
          </span>
          <span className="font-semibold tracking-tight">
            Roblox<span className="text-ink-dim"> GUI Maker</span>
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z / Ctrl+Z)"
            className="grid place-items-center w-8 h-8 rounded-md text-ink-dim hover:text-ink hover:bg-raised disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-dim transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z / Ctrl+Y)"
            className="grid place-items-center w-8 h-8 rounded-md text-ink-dim hover:text-ink hover:bg-raised disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-dim transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-md bg-input">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          const active = device === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onDevice(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                active ? "bg-raised text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 xl:gap-2">
        <button
          onClick={onPreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            previewing ? "bg-success text-base" : "text-ink-dim hover:text-ink hover:bg-raised"
          }`}
        >
          {previewing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {previewing ? "Stop preview" : "Preview"}
        </button>
        <button
          onClick={onNew}
          title="Start a new GUI (clears the current one)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          <FilePlus2 className="w-4 h-4" />
          New
        </button>
        <Link
          href="/templates"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </Link>
        <label
          title="Import JSON"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary xl:w-auto xl:px-3"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden xl:inline">Import JSON</span>
          <input
            type="file"
            accept="application/json,.json"
            aria-label="Import JSON"
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) onImportProject(file);
            }}
          />
        </label>
        <button
          onClick={onExportProject}
          aria-label="Export JSON"
          title="Export JSON"
          className="flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-md text-sm text-ink-dim transition-colors hover:bg-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:w-auto xl:px-3"
        >
          <FileJson className="w-4 h-4" />
          <span className="hidden xl:inline">Export JSON</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold bg-primary text-on-primary hover:brightness-110 transition"
        >
          {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {copied ? "Copied" : "Export Luau"}
        </button>
      </div>
      {importError && (
        <div
          role="alert"
          className="absolute right-4 top-full z-20 mt-2 max-w-md rounded-md border border-line bg-panel px-3 py-2 text-sm text-danger shadow-lg"
        >
          {importError}
        </div>
      )}
    </header>
  );
}
