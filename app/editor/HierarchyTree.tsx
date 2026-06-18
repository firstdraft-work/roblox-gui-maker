"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  EyeOff,
  Frame,
  GripVertical,
  Image as ImageIcon,
  Monitor,
  MousePointerClick,
  PanelTop,
  TextCursorInput,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { RobloxClass, SceneNode } from "./catalog";
import { orderedChildren, reparentNode } from "./scene";

const ICON: Partial<Record<RobloxClass, LucideIcon>> = {
  ScreenGui: Monitor,
  Frame,
  TextLabel: Type,
  TextButton: MousePointerClick,
  TextBox: TextCursorInput,
  ImageLabel: ImageIcon,
  ScrollingFrame: PanelTop,
};

type Props = {
  scene: SceneNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMoveInside: (id: string, parentId: string) => void;
  onMoveRelative: (id: string, targetId: string, position: "before" | "after") => void;
};

export function HierarchyTree({
  scene,
  selectedId,
  onSelect,
  onRename,
  onMoveInside,
  onMoveRelative,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const roots = orderedChildren(scene, null);

  return (
    <div
      role="tree"
      aria-label="GUI hierarchy"
      className="flex-1 overflow-y-auto scroll-thin px-2 py-2"
      data-hierarchy-tree
    >
      {roots.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          scene={scene}
          selectedId={selectedId}
          collapsed={collapsed}
          draggingId={draggingId}
          editingId={editingId}
          onToggle={toggle}
          onSelect={onSelect}
          onRename={onRename}
          onEditing={setEditingId}
          onDragging={setDraggingId}
          onMoveInside={onMoveInside}
          onMoveRelative={onMoveRelative}
        />
      ))}
    </div>
  );
}

type TreeNodeProps = Props & {
  node: SceneNode;
  depth: number;
  collapsed: Set<string>;
  draggingId: string | null;
  editingId: string | null;
  onToggle: (id: string) => void;
  onEditing: (id: string | null) => void;
  onDragging: (id: string | null) => void;
};

function TreeNode({
  node,
  depth,
  scene,
  selectedId,
  collapsed,
  draggingId,
  editingId,
  onToggle,
  onSelect,
  onRename,
  onEditing,
  onDragging,
  onMoveInside,
  onMoveRelative,
}: TreeNodeProps) {
  const children = orderedChildren(scene, node.id);
  const isCollapsed = collapsed.has(node.id);
  const selected = selectedId === node.id;
  const Icon = ICON[node.cls] ?? Frame;
  const draggable = node.cls !== "ScreenGui";
  const acceptsChildren = node.cls === "ScreenGui" || node.cls === "Frame" || node.cls === "ScrollingFrame";
  const canDropInside =
    !!draggingId && reparentNode(scene, draggingId, node.id) !== scene;

  const allowRelativeDrop = (event: React.DragEvent) => {
    if (!draggingId || !draggable || draggingId === node.id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <div data-tree-node={node.id}>
      {draggable && (
        <DropLine
          label={`Move before ${node.name}`}
          onDragOver={allowRelativeDrop}
          onDrop={(event) => {
            event.preventDefault();
            if (draggingId) onMoveRelative(draggingId, node.id, "before");
          }}
        />
      )}
      <div
        draggable={draggable}
        onDragStart={(event) => {
          if (!draggable) return;
          event.dataTransfer.setData("text/plain", node.id);
          event.dataTransfer.effectAllowed = "move";
          onDragging(node.id);
        }}
        onDragEnd={() => onDragging(null)}
        onDragOver={(event) => {
          if (!acceptsChildren || !canDropInside) return;
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={(event) => {
          if (!acceptsChildren || !canDropInside || !draggingId) return;
          event.preventDefault();
          event.stopPropagation();
          onMoveInside(draggingId, node.id);
        }}
        onClick={() => onSelect(node.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(node.id);
          }
        }}
        onDoubleClick={() => onEditing(node.id)}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={children.length ? !isCollapsed : undefined}
        tabIndex={0}
        title={acceptsChildren ? "Drop a node here to move it inside" : node.cls}
        className={`group flex h-8 items-center gap-1 rounded px-1 text-xs transition-colors ${
          selected ? "bg-focus/15 text-ink" : "text-ink-dim hover:bg-raised hover:text-ink"
        } ${canDropInside ? "ring-1 ring-inset ring-focus/70" : ""}`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (children.length) onToggle(node.id);
          }}
          className="grid h-5 w-5 shrink-0 place-items-center text-ink-mute"
          aria-label={isCollapsed ? `Expand ${node.name}` : `Collapse ${node.name}`}
        >
          {children.length ? (
            isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
          ) : null}
        </button>
        <Icon className="h-3.5 w-3.5 shrink-0 text-focus" />
        {editingId === node.id ? (
          <input
            autoFocus
            value={node.name}
            onChange={(event) => onRename(node.id, event.target.value)}
            onBlur={() => onEditing(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") onEditing(null);
            }}
            onClick={(event) => event.stopPropagation()}
            className="min-w-0 flex-1 rounded bg-input px-1 py-0.5 text-xs text-ink outline-none ring-1 ring-focus"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
        )}
        {node.initialVisible === false && <EyeOff className="h-3 w-3 shrink-0 text-warning" aria-label="Starts hidden" />}
        {node.action && <Zap className="h-3 w-3 shrink-0 text-success" aria-label="Has action" />}
        {draggable && <GripVertical className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" />}
      </div>
      {!isCollapsed && children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          scene={scene}
          selectedId={selectedId}
          collapsed={collapsed}
          draggingId={draggingId}
          editingId={editingId}
          onToggle={onToggle}
          onSelect={onSelect}
          onRename={onRename}
          onEditing={onEditing}
          onDragging={onDragging}
          onMoveInside={onMoveInside}
          onMoveRelative={onMoveRelative}
        />
      ))}
      {draggable && (
        <DropLine
          label={`Move after ${node.name}`}
          onDragOver={allowRelativeDrop}
          onDrop={(event) => {
            event.preventDefault();
            if (draggingId) onMoveRelative(draggingId, node.id, "after");
          }}
        />
      )}
    </div>
  );
}

function DropLine({
  label,
  onDragOver,
  onDrop,
}: {
  label: string;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}) {
  return (
    <div
      role="separator"
      aria-label={label}
      data-drop-line
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="h-1 rounded-full transition-colors hover:bg-focus/70"
    />
  );
}
