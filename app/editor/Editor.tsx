"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Toolbar } from "./Toolbar";
import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { CodePanel } from "./CodePanel";
import { SAMPLE_SCENE, type DeviceKind, type RobloxClass, type SceneNode } from "./catalog";
import {
  applyPreviewAction,
  createNode,
  createPreviewVisibility,
  duplicateSubtree,
  FONTS,
  generateLuau,
  reparentNode,
  reorderSibling,
  removeSubtree,
  shade,
  type PreviewVisibility,
} from "./scene";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const cloneScene = (s: SceneNode[]): SceneNode[] =>
  s.map((n) => ({
    ...n,
    pos: { ...n.pos },
    size: { ...n.size },
    ...(n.gradient ? { gradient: { ...n.gradient } } : {}),
    ...(n.action ? { action: { ...n.action } } : {}),
  }));

// ---- persistence (localStorage) -------------------------------------------
const STORAGE_KEY = "rgm:scene:v1";
type Saved = { scene: SceneNode[]; selectedId: string | null };
// Only renderable GUI objects can be saved nodes — decorators (UICorner,
// UIGradient, UIListLayout, UIGridLayout, UIPadding) are properties, never
// standalone nodes, so a persisted decorator cls is corrupt and gets dropped.
const VALID_CLS: ReadonlySet<RobloxClass> = new Set<RobloxClass>([
  "ScreenGui", "Frame", "TextLabel", "TextButton", "TextBox",
  "ImageLabel", "ScrollingFrame",
]);
const isFiniteNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isHex = (v: unknown): boolean =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

// Validate + sanitize a node loaded from localStorage so malformed saved state
// can't crash the renderer or emit invalid Luau (e.g. Instance.new("Bogus")).
function sanitizeNode(raw: unknown): SceneNode | null {
  if (!raw || typeof raw !== "object") return null;
  const n = raw as Record<string, unknown>;
  if (typeof n.id !== "string" || !n.id) return null;
  if (typeof n.cls !== "string" || !VALID_CLS.has(n.cls as RobloxClass)) return null;
  if (typeof n.name !== "string") return null;
  const pos = n.pos as Record<string, unknown> | undefined;
  const size = n.size as Record<string, unknown> | undefined;
  if (!pos || !isFiniteNum(pos.x) || !isFiniteNum(pos.y)) return null;
  if (!size || !isFiniteNum(size.x) || !isFiniteNum(size.y)) return null;
  if (!isHex(n.color) || !isFiniteNum(n.transparency) || !isFiniteNum(n.cornerRadius) || !isFiniteNum(n.zindex))
    return null;

  const parentId =
    typeof n.parentId === "string" || n.parentId === null ? n.parentId : null;
  const node: SceneNode = {
    id: n.id,
    cls: n.cls as RobloxClass,
    name: n.name,
    parentId,
    pos: { x: clamp01(pos.x as number), y: clamp01(pos.y as number) },
    size: { x: clamp01(size.x as number), y: clamp01(size.y as number) },
    color: n.color as string,
    transparency: clamp01(n.transparency as number),
    cornerRadius: Math.max(0, n.cornerRadius as number),
    zindex: Math.round(n.zindex as number),
  };
  if (typeof n.text === "string") node.text = n.text;
  if (typeof n.font === "string" && (FONTS as readonly string[]).includes(n.font)) node.font = n.font;
  if (isFiniteNum(n.textSize)) node.textSize = Math.max(1, n.textSize);
  if (isHex(n.textColor)) node.textColor = n.textColor as string;
  const g = n.gradient as Record<string, unknown> | undefined;
  if (g && isHex(g.from) && isHex(g.to)) node.gradient = { from: g.from as string, to: g.to as string };
  if (n.layout === "list" || n.layout === "grid") node.layout = n.layout;
  if (isFiniteNum(n.padding)) node.padding = Math.max(0, n.padding);
  if (isFiniteNum(n.layoutOrder)) node.layoutOrder = Math.max(0, Math.round(n.layoutOrder));
  if (typeof n.initialVisible === "boolean") node.initialVisible = n.initialVisible;
  const action = n.action as Record<string, unknown> | undefined;
  if (
    n.cls === "TextButton" &&
    action &&
    (action.type === "show" ||
      action.type === "hide" ||
      action.type === "toggle" ||
      action.type === "hideGui")
  ) {
    node.action = {
      type: action.type,
      ...(typeof action.targetId === "string" ? { targetId: action.targetId } : {}),
    };
  }
  return node;
}

// Drop orphan parentIds and break cycles so the scene graph is always a forest.
function repairParents(scene: SceneNode[]): void {
  const ids = new Set(scene.map((n) => n.id));
  for (const n of scene) {
    if (n.parentId && !ids.has(n.parentId)) n.parentId = null;
  }
  for (const n of scene) {
    const chain = new Set<string>([n.id]);
    let cur = n.parentId;
    let guard = scene.length + 1;
    while (cur && guard-- > 0) {
      if (chain.has(cur)) {
        n.parentId = null;
        break;
      }
      chain.add(cur);
      cur = scene.find((x) => x.id === cur)?.parentId ?? null;
    }
  }
}

function loadSaved(): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (!Array.isArray(parsed?.scene)) return null;
    const scene = parsed.scene
      .map(sanitizeNode)
      .filter((n): n is SceneNode => n !== null);
    if (scene.length === 0) return null;
    repairParents(scene);
    const ids = new Set(scene.map((n) => n.id));
    const selectedId =
      typeof parsed.selectedId === "string" && ids.has(parsed.selectedId)
        ? parsed.selectedId
        : null;
    return { scene, selectedId };
  } catch {
    return null;
  }
}

export function Editor({ initialScene }: { initialScene?: SceneNode[] }) {
  const start = initialScene ?? SAMPLE_SCENE;
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [scene, setScene] = useState<SceneNode[]>(start);
  const [selectedId, setSelectedId] = useState<string | null>("play");
  const [copied, setCopied] = useState(false);
  const [previewVisibility, setPreviewVisibility] = useState<PreviewVisibility | null>(null);

  // Undo/redo: snapshot stack + pointer. Discrete ops commit immediately;
  // continuous edits (drag/typing/nudge) commit on a debounced timer so a
  // whole gesture becomes a single undo step.
  const history = useRef<{ stack: SceneNode[][]; index: number }>({
    stack: [cloneScene(start)],
    index: 0,
  });
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, force] = useReducer((x) => x + 1, 0);

  const selected = scene.find((n) => n.id === selectedId) ?? null;
  const code = generateLuau(scene);
  const canUndo = history.current.index > 0;
  const canRedo = history.current.index < history.current.stack.length - 1;

  const commit = useCallback((next: SceneNode[]) => {
    const h = history.current;
    const stack = h.stack.slice(0, h.index + 1);
    stack.push(cloneScene(next));
    while (stack.length > 100) stack.shift();
    h.stack = stack;
    h.index = stack.length - 1;
    force();
  }, []);

  const scheduleCommit = useCallback(
    (next: SceneNode[]) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        commitTimer.current = null;
        commit(next);
      }, 350);
    },
    [commit]
  );

  // immediate=true commits now (discrete); otherwise debounced (continuous).
  const mutate = useCallback(
    (updater: (prev: SceneNode[]) => SceneNode[], immediate = false) => {
      // any new edit invalidates the redo branch — drop it now (not after the
      // 350ms debounce) so a redo before the timer fires can't restore stale state.
      const h = history.current;
      if (h.index < h.stack.length - 1) h.stack = h.stack.slice(0, h.index + 1);
      const next = updater(scene);
      setScene(next);
      if (immediate) {
        if (commitTimer.current) {
          // a debounced edit (e.g. a drag) is still pending — commit it first
          // so undo can reach the pre-mutation state, then clear the timer.
          clearTimeout(commitTimer.current);
          commitTimer.current = null;
          commit(scene);
        }
        commit(next);
      } else {
        scheduleCommit(next);
      }
    },
    [scene, commit, scheduleCommit]
  );

  function undo() {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
      commit(scene);
    }
    const h = history.current;
    if (h.index > 0) {
      h.index--;
      setScene(cloneScene(h.stack[h.index]));
      force();
    }
  }

  function redo() {
    const h = history.current;
    if (h.index < h.stack.length - 1) {
      h.index++;
      setScene(cloneScene(h.stack[h.index]));
      force();
    }
  }

  function addNode(cls: RobloxClass) {
    if (cls === "ScreenGui" && scene.some((n) => n.cls === "ScreenGui")) return;
    const parentId =
      selected && (selected.cls === "Frame" || selected.cls === "ScrollingFrame")
        ? selected.id
        : null;
    const node = createNode(cls, scene, parentId);
    mutate((s) => [...s, node], true);
    setSelectedId(node.id);
  }

  function applyDecorator(cls: RobloxClass) {
    if (!selectedId) return;
    mutate((s) => {
      const map = (fn: (n: SceneNode) => SceneNode) => s.map((n) => (n.id === selectedId ? fn(n) : n));
      if (cls === "UICorner") return map((n) => ({ ...n, cornerRadius: n.cornerRadius > 0 ? 0 : 12 }));
      if (cls === "UIGradient")
        return map((n) =>
          n.gradient ? { ...n, gradient: undefined } : { ...n, gradient: { from: shade(n.color, 22), to: shade(n.color, -22) } }
        );
      if (cls === "UIListLayout") return map((n) => ({ ...n, layout: n.layout === "list" ? undefined : "list" }));
      if (cls === "UIGridLayout") return map((n) => ({ ...n, layout: n.layout === "grid" ? undefined : "grid" }));
      if (cls === "UIPadding") return map((n) => ({ ...n, padding: n.padding ? undefined : 12 }));
      return s;
    }, true);
  }

  function updateNode(id: string, patch: Partial<SceneNode>) {
    mutate((s) => s.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function deleteNode(id: string) {
    const next = removeSubtree(scene, id);
    mutate(() => next, true);
    setSelectedId((cur) => (cur && next.some((node) => node.id === cur) ? cur : null));
  }

  function duplicateSelected() {
    if (!selectedId) return;
    const result = duplicateSubtree(scene, selectedId);
    if (!result) return;
    mutate((s) => [...s, ...result.nodes], true);
    setSelectedId(result.newId);
  }

  function moveInside(id: string, parentId: string) {
    const next = reparentNode(scene, id, parentId);
    if (next === scene) return;
    mutate(() => next, true);
    setSelectedId(id);
  }

  function moveRelative(
    id: string,
    targetId: string,
    position: "before" | "after"
  ) {
    const moving = scene.find((node) => node.id === id);
    const target = scene.find((node) => node.id === targetId);
    if (!moving || !target || target.cls === "ScreenGui") return;

    let next = scene;
    if ((moving.parentId ?? null) !== (target.parentId ?? null)) {
      if (!target.parentId) return;
      next = reparentNode(next, id, target.parentId);
      if (next === scene) return;
    }
    const reordered = reorderSibling(next, id, targetId, position);
    if (reordered === next && next === scene) return;
    mutate(() => reordered, true);
    setSelectedId(id);
  }

  // Restore the saved workspace on mount — only when no template was requested
  // via ?template=. Runs after mount (client-only) so SSR HTML isn't mismatched.
  useEffect(() => {
    if (initialScene) return;
    const saved = loadSaved();
    if (!saved) return;
    setScene(saved.scene);
    setSelectedId(saved.selectedId);
    history.current = { stack: [cloneScene(saved.scene)], index: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced) so refresh doesn't lose work.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ scene, selectedId }));
      } catch {
        // storage full / blocked — ignore, the tool still works in-session
      }
    }, 400);
    return () => clearTimeout(id);
  }, [scene, selectedId]);

  function newWorkspace() {
    if (typeof window !== "undefined" && !window.confirm("Start a new GUI? Your current one will be cleared.")) return;
    setScene(SAMPLE_SCENE);
    setSelectedId("play");
    history.current = { stack: [cloneScene(SAMPLE_SCENE)], index: 0 };
    force();
  }

  // keyboard shortcuts (⌘/Ctrl + Z/Y/D, Delete, Esc, arrows)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (typing) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedId) deleteNode(selectedId);
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (selectedId && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const node = scene.find((n) => n.id === selectedId);
        if (!node) return;
        const step = e.shiftKey ? 0.05 : 0.01;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        updateNode(selectedId, {
          pos: { x: clamp01(node.pos.x + dx), y: clamp01(node.pos.y + dy) },
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadLuau() {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "roblox-gui.lua";
    link.click();
    URL.revokeObjectURL(url);
  }

  function togglePreview() {
    setPreviewVisibility((current) =>
      current ? null : createPreviewVisibility(scene)
    );
    setSelectedId(null);
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center md:hidden">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-xl font-bold text-on-primary">
          R
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Open the editor on a larger screen</h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-ink-dim">
            The editor needs room for the component palette, canvas, and properties. Use a tablet or desktop to build and export your GUI.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/templates"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Browse templates
          </Link>
          <Link
            href="/"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-dim"
          >
            Back home
          </Link>
        </div>
      </main>
      <div className="hidden h-screen w-screen flex-col overflow-hidden md:flex">
      <Toolbar
        device={device}
        onDevice={setDevice}
        onExport={handleExport}
        copied={copied}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onNew={newWorkspace}
        previewing={previewVisibility !== null}
        onPreview={togglePreview}
      />
      <div className="flex-1 min-h-0 flex">
        <Palette
          onAdd={addNode}
          onApply={applyDecorator}
          scene={scene}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRename={(id, name) => updateNode(id, { name })}
          onMoveInside={moveInside}
          onMoveRelative={moveRelative}
        />
        <Canvas
          scene={scene}
          selectedId={selectedId}
          device={device}
          onSelect={setSelectedId}
          onChange={updateNode}
          previewVisibility={previewVisibility}
          onPreviewAction={(id) =>
            setPreviewVisibility((current) =>
              current ? applyPreviewAction(scene, current, id) : current
            )
          }
        />
        <PropertiesPanel
          node={selected}
          scene={scene}
          onChange={updateNode}
          onDelete={deleteNode}
          onDuplicate={duplicateSelected}
        />
      </div>
      <CodePanel code={code} copied={copied} onCopy={handleExport} onDownload={downloadLuau} />
      </div>
    </>
  );
}
