"use client";

import { useEffect, useState } from "react";
import { normalizeRobloxAssetId } from "./image-assets";

type Props = {
  nodeId: string;
  value?: string;
  onCommit: (image: string | undefined) => void;
};

export function ImageAssetField({ nodeId, value, onCommit }: Props) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value ?? "");
    setError(null);
  }, [nodeId, value]);

  return (
    <div>
      <input
        aria-label="Roblox asset ID"
        value={draft}
        placeholder="1818 or rbxassetid://1818"
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (next.trim() === "") {
            setError(null);
            onCommit(undefined);
            return;
          }

          const canonical = normalizeRobloxAssetId(next);
          if (!canonical) {
            setError("Enter a numeric Roblox asset ID.");
            return;
          }

          setError(null);
          onCommit(canonical);
        }}
        className={`w-full rounded bg-input px-2 py-1 text-xs font-mono text-ink outline-none focus:ring-1 ${
          error ? "ring-1 ring-danger focus:ring-danger" : "focus:ring-focus"
        }`}
      />
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}
