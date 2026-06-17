"use client";

import { Move, Palette as PaletteIcon, Type, Layers, Box, Trash2, Rows3 } from "lucide-react";
import type { SceneNode } from "./catalog";
import { FONTS } from "./scene";

type Props = {
  node: SceneNode | null;
  onChange: (id: string, patch: Partial<SceneNode>) => void;
  onDelete: (id: string) => void;
};

const round2 = (v: number) => Math.round(v * 100) / 100;

export function PropertiesPanel({ node, onChange, onDelete }: Props) {
  return (
    <aside className="w-72 shrink-0 bg-panel border-l border-line flex flex-col">
      <div className="h-9 shrink-0 flex items-center px-3 border-b border-line">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-dim">
          Properties
        </span>
      </div>

      {node ? (
        <div className="flex-1 overflow-y-auto scroll-thin p-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <span className="grid place-items-center w-6 h-6 rounded bg-input text-focus">
              <Box className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <input
                value={node.name}
                onChange={(e) => onChange(node.id, { name: e.target.value })}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none focus:ring-1 focus:ring-focus rounded px-1 -mx-1"
              />
              <p className="text-[11px] text-ink-mute font-mono px-1">{node.cls}</p>
            </div>
            <button
              onClick={() => onDelete(node.id)}
              title="Delete element"
              className="grid place-items-center w-7 h-7 rounded text-ink-mute hover:text-danger hover:bg-raised transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Group icon={Move} label="Layout">
            <Row label="Position">
              <PairInput
                x={node.pos.x}
                y={node.pos.y}
                onX={(v) => onChange(node.id, { pos: { ...node.pos, x: round2(v) } })}
                onY={(v) => onChange(node.id, { pos: { ...node.pos, y: round2(v) } })}
              />
            </Row>
            <Row label="Size">
              <PairInput
                x={node.size.x}
                y={node.size.y}
                onX={(v) => onChange(node.id, { size: { ...node.size, x: round2(v) } })}
                onY={(v) => onChange(node.id, { size: { ...node.size, y: round2(v) } })}
              />
            </Row>
          </Group>

          <Group icon={PaletteIcon} label="Appearance">
            <Row label="BackgroundColor3">
              <ColorInput
                value={node.color}
                onValue={(v) => onChange(node.id, { color: v })}
              />
            </Row>
            <Row label="Transparency" stacked>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={node.transparency}
                onChange={(e) =>
                  onChange(node.id, { transparency: parseFloat(e.target.value) })
                }
                className="w-full accent-focus"
              />
            </Row>
            <Row label="CornerRadius">
              <NumberInput
                value={node.cornerRadius}
                step={1}
                min={0}
                onValue={(v) => onChange(node.id, { cornerRadius: Math.round(v) })}
              />
            </Row>
          </Group>

          <Group icon={Rows3} label="Container">
            <Row label="Layout" stacked>
              <select
                value={node.layout ?? "none"}
                onChange={(e) =>
                  onChange(node.id, {
                    layout:
                      e.target.value === "none"
                        ? undefined
                        : (e.target.value as "list" | "grid"),
                  })
                }
                className="w-full px-2 py-1 rounded bg-input text-ink text-xs outline-none focus:ring-1 focus:ring-focus"
              >
                <option value="none">none — manual position</option>
                <option value="list">List — vertical stack</option>
                <option value="grid">Grid — auto cells</option>
              </select>
            </Row>
            <Row label="Padding">
              <NumberInput
                value={node.padding ?? 0}
                step={1}
                min={0}
                onValue={(v) => onChange(node.id, { padding: Math.round(v) })}
              />
            </Row>
          </Group>

          {node.text != null && (
            <Group icon={Type} label="Text">
              <Row label="Text" stacked>
                <input
                  value={node.text}
                  onChange={(e) => onChange(node.id, { text: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-input text-ink text-xs outline-none focus:ring-1 focus:ring-focus"
                />
              </Row>
              <Row label="Font" stacked>
                <select
                  value={node.font ?? "GothamMedium"}
                  onChange={(e) => onChange(node.id, { font: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-input text-ink text-xs outline-none focus:ring-1 focus:ring-focus"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="TextSize">
                <NumberInput
                  value={node.textSize ?? 14}
                  step={1}
                  min={6}
                  onValue={(v) => onChange(node.id, { textSize: Math.round(v) })}
                />
              </Row>
              <Row label="TextColor3">
                <ColorInput
                  value={node.textColor ?? "#e1e1ef"}
                  onValue={(v) => onChange(node.id, { textColor: v })}
                />
              </Row>
            </Group>
          )}

          <Group icon={Layers} label="Order">
            <Row label="ZIndex">
              <NumberInput
                value={node.zindex}
                step={1}
                min={0}
                onValue={(v) => onChange(node.id, { zindex: Math.round(v) })}
              />
            </Row>
          </Group>
        </div>
      ) : (
        <div className="flex-1 grid place-items-center p-6 text-center">
          <p className="text-sm text-ink-mute">
            Select an element on the canvas to edit its properties.
          </p>
        </div>
      )}
    </aside>
  );
}

function Group({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Move;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-ink-mute" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  stacked,
}: {
  label: string;
  children: React.ReactNode;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className="px-1 py-1">
        <label className="block text-[11px] text-ink-mute mb-1">{label}</label>
        {children}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1">
      <span className="text-[11px] text-ink-mute">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onValue,
  step = 1,
  min,
  max,
}: {
  value: number;
  onValue: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!Number.isNaN(v)) onValue(v);
      }}
      className="w-[68px] px-2 py-1 rounded bg-input text-ink text-xs font-mono outline-none focus:ring-1 focus:ring-focus"
    />
  );
}

function PairInput({
  x,
  y,
  onX,
  onY,
}: {
  x: number;
  y: number;
  onX: (v: number) => void;
  onY: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-ink-mute font-mono">X</span>
      <NumberInput value={x} step={0.01} min={0} max={1} onValue={onX} />
      <span className="text-[10px] text-ink-mute font-mono">Y</span>
      <NumberInput value={y} step={0.01} min={0} max={1} onValue={onY} />
    </div>
  );
}

function ColorInput({ value, onValue }: { value: string; onValue: (v: string) => void }) {
  const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={safe}
        onChange={(e) => onValue(e.target.value)}
        className="w-7 h-7 rounded bg-input border border-line cursor-pointer p-0.5"
      />
      <input
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className="w-[80px] px-2 py-1 rounded bg-input text-ink text-xs font-mono outline-none focus:ring-1 focus:ring-focus"
      />
    </div>
  );
}
