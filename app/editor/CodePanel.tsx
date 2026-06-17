"use client";

import { Check, Copy } from "lucide-react";

export function CodePanel({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <footer className="h-52 shrink-0 flex flex-col bg-panel border-t border-line">
      <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-dim">
            Export · Luau
          </span>
          <span className="text-[11px] text-ink-mute">
            ScreenGui — paste into a LocalScript
          </span>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="flex-1 overflow-auto scroll-thin p-4 text-[12.5px] leading-relaxed font-mono text-ink-dim">
        <code>{code}</code>
      </pre>
    </footer>
  );
}
