"use client";

import { useCallback, useRef } from "react";
import type { SceneNode } from "./catalog";

export type Corner = "nw" | "ne" | "sw" | "se";

const MIN = 0.02; // minimum size in scale
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

// Pointer-based move + resize. The coordinate space is the dragged node's
// DOM parent (the canvas frame for top-level nodes, the parent node's
// content wrapper for nested ones) — found via closest("[data-node-id]"),
// so it works for both move (target = node) and resize (target = handle).
export function useInteraction(onChange: (id: string, patch: Partial<SceneNode>) => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const drag = useRef<null | {
    id: string;
    mode: "move" | "resize";
    corner?: Corner;
    startX: number;
    startY: number;
    node: SceneNode;
    container: HTMLElement;
  }>(null);

  const handleMove = useCallback((e: PointerEvent) => {
    const a = drag.current;
    if (!a) return;
    const r = a.container.getBoundingClientRect();
    const p = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
    const n = a.node;

    if (a.mode === "move") {
      onChangeRef.current(a.id, {
        pos: {
          x: round2(clamp01(n.pos.x + (p.x - a.startX))),
          y: round2(clamp01(n.pos.y + (p.y - a.startY))),
        },
      });
      return;
    }

    const right = n.pos.x + n.size.x;
    const bottom = n.pos.y + n.size.y;
    let x = n.pos.x;
    let y = n.pos.y;
    let w = n.size.x;
    let h = n.size.y;
    switch (a.corner) {
      case "se": w = p.x - n.pos.x; h = p.y - n.pos.y; break;
      case "nw": x = p.x; y = p.y; w = right - p.x; h = bottom - p.y; break;
      case "ne": y = p.y; w = p.x - n.pos.x; h = bottom - p.y; break;
      case "sw": x = p.x; w = right - p.x; h = p.y - n.pos.y; break;
    }
    if (w < MIN) {
      if (a.corner === "nw" || a.corner === "sw") x = right - MIN;
      w = MIN;
    }
    if (h < MIN) {
      if (a.corner === "nw" || a.corner === "ne") y = bottom - MIN;
      h = MIN;
    }
    onChangeRef.current(a.id, {
      pos: { x: round2(clamp01(x)), y: round2(clamp01(y)) },
      size: { x: round2(clamp01(w)), y: round2(clamp01(h)) },
    });
  }, []);

  const handleUp = useCallback(() => {
    drag.current = null;
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
  }, [handleMove]);

  const begin = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      mode: "move" | "resize",
      corner: Corner | undefined,
      node: SceneNode
    ) => {
      e.stopPropagation();
      if (drag.current) {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      }
      const nodeEl = (e.currentTarget as HTMLElement).closest("[data-node-id]") as HTMLElement | null;
      const container = nodeEl?.parentElement ?? null;
      if (!container) return;
      const r = container.getBoundingClientRect();
      drag.current = {
        id,
        mode,
        corner,
        startX: (e.clientX - r.left) / r.width,
        startY: (e.clientY - r.top) / r.height,
        node,
        container,
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [handleMove, handleUp]
  );

  return {
    startMove: (e: React.PointerEvent, node: SceneNode) =>
      begin(e, node.id, "move", undefined, node),
    startResize: (e: React.PointerEvent, node: SceneNode, corner: Corner) =>
      begin(e, node.id, "resize", corner, node),
  };
}
