"use client";

import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { CodePanel } from "./CodePanel";
import { SAMPLE_SCENE, type DeviceKind, type RobloxClass, type SceneNode } from "./catalog";
import { createNode, generateLuau, shade } from "./scene";

export function Editor({ initialScene }: { initialScene?: SceneNode[] }) {
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [scene, setScene] = useState<SceneNode[]>(() => initialScene ?? SAMPLE_SCENE);
  const [selectedId, setSelectedId] = useState<string | null>("play");
  const [copied, setCopied] = useState(false);

  const selected = scene.find((n) => n.id === selectedId) ?? null;
  const code = generateLuau(scene);

  function addNode(cls: RobloxClass) {
    if (cls === "ScreenGui" && scene.some((n) => n.cls === "ScreenGui")) return;
    const parentId =
      selected && (selected.cls === "Frame" || selected.cls === "ScrollingFrame")
        ? selected.id
        : null;
    const node = createNode(cls, scene, parentId);
    setScene((s) => [...s, node]);
    setSelectedId(node.id);
  }

  function applyDecorator(cls: RobloxClass) {
    if (!selectedId) return;
    if (cls === "UICorner") {
      setScene((s) =>
        s.map((n) =>
          n.id === selectedId ? { ...n, cornerRadius: n.cornerRadius > 0 ? 0 : 12 } : n
        )
      );
    } else if (cls === "UIGradient") {
      setScene((s) =>
        s.map((n) => {
          if (n.id !== selectedId) return n;
          if (n.gradient) return { ...n, gradient: undefined };
          return { ...n, gradient: { from: shade(n.color, 22), to: shade(n.color, -22) } };
        })
      );
    } else if (cls === "UIListLayout") {
      setScene((s) =>
        s.map((n) => (n.id === selectedId ? { ...n, layout: n.layout === "list" ? undefined : "list" } : n))
      );
    } else if (cls === "UIGridLayout") {
      setScene((s) =>
        s.map((n) => (n.id === selectedId ? { ...n, layout: n.layout === "grid" ? undefined : "grid" } : n))
      );
    } else if (cls === "UIPadding") {
      setScene((s) =>
        s.map((n) => (n.id === selectedId ? { ...n, padding: n.padding ? undefined : 12 } : n))
      );
    }
  }

  function updateNode(id: string, patch: Partial<SceneNode>) {
    setScene((s) => s.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function deleteNode(id: string) {
    // cascade: remove descendants too, so no orphaned children remain
    const doomed = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of scene) {
        if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) {
          doomed.add(n.id);
          changed = true;
        }
      }
    }
    setScene((s) => s.filter((n) => !doomed.has(n.id)));
    setSelectedId((cur) => (doomed.has(cur ?? "") ? null : cur));
  }

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Toolbar
        device={device}
        onDevice={setDevice}
        onExport={handleExport}
        copied={copied}
      />
      <div className="flex-1 min-h-0 flex">
        <Palette onAdd={addNode} onApply={applyDecorator} />
        <Canvas
          scene={scene}
          selectedId={selectedId}
          device={device}
          onSelect={setSelectedId}
          onChange={updateNode}
        />
        <PropertiesPanel node={selected} onChange={updateNode} onDelete={deleteNode} />
      </div>
      <CodePanel code={code} copied={copied} onCopy={handleExport} />
    </div>
  );
}
