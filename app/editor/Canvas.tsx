"use client";

import type { DeviceKind, SceneNode } from "./catalog";
import { useInteraction, type Corner } from "./useInteraction";

const FRAME_CLASS: Record<DeviceKind, string> = {
  desktop: "w-full max-w-[860px] aspect-video",
  tablet: "w-full max-w-[600px] aspect-[4/3]",
  mobile: "h-full max-h-[540px] aspect-[9/19.5]",
};

const DEVICE_LABEL: Record<DeviceKind, string> = {
  desktop: "Desktop · 1920×1080",
  tablet: "Tablet · 1024×768",
  mobile: "Mobile · 375×812",
};

const HANDLES: { corner: Corner; pos: string; cursor: string }[] = [
  { corner: "nw", pos: "-top-1 -left-1", cursor: "cursor-nwse-resize" },
  { corner: "ne", pos: "-top-1 -right-1", cursor: "cursor-nesw-resize" },
  { corner: "sw", pos: "-bottom-1 -left-1", cursor: "cursor-nesw-resize" },
  { corner: "se", pos: "-bottom-1 -right-1", cursor: "cursor-nwse-resize" },
];

type Props = {
  scene: SceneNode[];
  selectedId: string | null;
  device: DeviceKind;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<SceneNode>) => void;
};

const ROOT = "__root__";

export function Canvas({ scene, selectedId, device, onSelect, onChange }: Props) {
  const { startMove, startResize } = useInteraction(onChange);

  // group nodes by parent for recursive rendering
  const childrenByParent = new Map<string, SceneNode[]>();
  for (const n of scene) {
    const key = n.parentId ?? ROOT;
    const arr = childrenByParent.get(key);
    if (arr) arr.push(n);
    else childrenByParent.set(key, [n]);
  }
  const getChild = (parentId: string | null) =>
    childrenByParent.get(parentId ?? ROOT) ?? [];

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-surface">
      <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-line">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-dim">
          Canvas
        </span>
        <span className="text-[11px] text-ink-mute font-mono">
          {DEVICE_LABEL[device]}
        </span>
      </div>

      <div
        className="flex-1 canvas-grid grid place-items-center p-8 overflow-hidden"
        onPointerDown={() => onSelect(null)}
      >
        <div
          className={`relative rounded-xl overflow-hidden bg-base ring-1 ring-line-soft shadow-2xl shadow-black/50 ${FRAME_CLASS[device]}`}
        >
          {getChild(null).map((node) => (
            <NodeView
              key={node.id}
              node={node}
              containerLayout="none"
              getChild={getChild}
              selectedId={selectedId}
              onSelect={onSelect}
              startMove={startMove}
              startResize={startResize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeView({
  node,
  containerLayout,
  getChild,
  selectedId,
  onSelect,
  startMove,
  startResize,
}: {
  node: SceneNode;
  containerLayout: "none" | "list" | "grid";
  getChild: (parentId: string | null) => SceneNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  startMove: (e: React.PointerEvent, node: SceneNode) => void;
  startResize: (e: React.PointerEvent, node: SceneNode, corner: Corner) => void;
}) {
  // a flowed child (its parent has a layout) is arranged by the layout,
  // so we don't absolute-position or allow dragging it.
  const isFlow = containerLayout !== "none";
  const kids = getChild(node.id);
  const visible =
    node.transparency < 1 || node.text != null || !!node.gradient || kids.length > 0;
  if (!visible) return null;

  const selected = node.id === selectedId;
  const background = node.gradient
    ? `linear-gradient(135deg, ${node.gradient.from}, ${node.gradient.to})`
    : node.transparency >= 1
      ? "transparent"
      : hexToRgba(node.color, 1 - node.transparency);

  return (
    <div
      data-node-id={node.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(node.id);
        if (!isFlow) startMove(e, node);
      }}
      className={
        isFlow
          ? "relative select-none touch-none"
          : "absolute select-none touch-none cursor-move"
      }
      style={{
        ...(isFlow ? {} : { left: `${node.pos.x * 100}%`, top: `${node.pos.y * 100}%` }),
        width: `${node.size.x * 100}%`,
        height: `${node.size.y * 100}%`,
        background,
        borderRadius: node.cornerRadius,
        zIndex: node.zindex,
      }}
    >
      {node.text != null && (
        <span
          className="absolute inset-0 grid place-items-center px-2 text-center leading-none pointer-events-none"
          style={{
            color: node.textColor,
            fontSize: node.textSize,
            fontWeight: node.font?.includes("Black")
              ? 800
              : node.font?.includes("Bold")
                ? 700
                : 500,
          }}
        >
          {node.text}
        </span>
      )}

      {selected && !isFlow && (
        <>
          <span className="absolute -inset-px rounded-[inherit] ring-2 ring-focus pointer-events-none" />
          {HANDLES.map((h) => (
            <span
              key={h.corner}
              onPointerDown={(e) => startResize(e, node, h.corner)}
              className={`absolute ${h.pos} w-2.5 h-2.5 rounded-sm bg-focus border-2 border-base ${h.cursor}`}
            />
          ))}
        </>
      )}

      {kids.length > 0 && (
        <ChildrenWrapper node={node}>
          {kids.map((c) => (
            <NodeView
              key={c.id}
              node={c}
              containerLayout={node.layout ?? "none"}
              getChild={getChild}
              selectedId={selectedId}
              onSelect={onSelect}
              startMove={startMove}
              startResize={startResize}
            />
          ))}
        </ChildrenWrapper>
      )}
    </div>
  );
}

function ChildrenWrapper({
  node,
  children,
}: {
  node: SceneNode;
  children: React.ReactNode;
}) {
  const pad = node.padding ? `${node.padding}px` : undefined;
  if (node.layout === "list") {
    return (
      <div
        className="absolute inset-0 flex flex-col gap-1 overflow-hidden"
        style={{ padding: pad }}
      >
        {children}
      </div>
    );
  }
  if (node.layout === "grid") {
    return (
      <div
        className="absolute inset-0 grid grid-cols-3 gap-1 overflow-hidden"
        style={{ padding: pad }}
      >
        {children}
      </div>
    );
  }
  return <div className="absolute inset-0" style={{ padding: pad }}>{children}</div>;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return `rgba(40, 41, 51, ${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
