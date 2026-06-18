import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import { sanitizeScene } from "./persistence";

const node = (overrides: Partial<SceneNode> = {}): SceneNode => ({
  id: "node",
  cls: "Frame",
  name: "Node",
  parentId: null,
  pos: { x: 0, y: 0 },
  size: { x: 1, y: 1 },
  color: "#000000",
  transparency: 0,
  cornerRadius: 0,
  zindex: 1,
  ...overrides,
});

describe("sanitizeScene", () => {
  it("sanitizes responsive geometry without sharing optional vectors", () => {
    const raw = node({
      posOffset: { x: 12.4, y: -3.6 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 2, y: -1 },
      minSize: { x: 320, y: 180 },
      maxSize: { x: 960, y: 540 },
    });

    const scene = sanitizeScene([raw]);
    const sanitized = scene?.[0];

    expect(sanitized).toMatchObject({
      posOffset: { x: 12, y: -4 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 1, y: 0 },
      minSize: { x: 320, y: 180 },
      maxSize: { x: 960, y: 540 },
    });
    expect(sanitized?.posOffset).not.toBe(raw.posOffset);
    expect(sanitized?.sizeOffset).not.toBe(raw.sizeOffset);
    expect(sanitized?.anchor).not.toBe(raw.anchor);
    expect(sanitized?.minSize).not.toBe(raw.minSize);
    expect(sanitized?.maxSize).not.toBe(raw.maxSize);

    if (!sanitized?.posOffset) throw new Error("Expected sanitized position offset");
    sanitized.posOffset.x = 99;
    expect(raw.posOffset).toEqual({ x: 12.4, y: -3.6 });
  });

  it("drops invalid nodes, repairs orphans, and breaks parent cycles", () => {
    const scene = sanitizeScene([
      node({ id: "orphan", parentId: "missing" }),
      node({ id: "a", parentId: "b" }),
      node({ id: "b", parentId: "a" }),
      { id: "invalid", cls: "Bogus" },
    ]);

    expect(scene?.map(({ id, parentId }) => ({ id, parentId }))).toEqual([
      { id: "orphan", parentId: null },
      { id: "a", parentId: null },
      { id: "b", parentId: "a" },
    ]);
  });

  it("preserves every relationship in a long valid parent chain", () => {
    const raw = Array.from({ length: 200 }, (_, index) =>
      node({
        id: `node-${index}`,
        parentId: index === 0 ? null : `node-${index - 1}`,
      })
    );

    const scene = sanitizeScene(raw);

    expect(scene?.map(({ parentId }) => parentId)).toEqual(
      raw.map(({ parentId }) => parentId)
    );
  });

  it("returns null for non-arrays and arrays without valid nodes", () => {
    expect(sanitizeScene({ scene: [] })).toBeNull();
    expect(sanitizeScene([])).toBeNull();
    expect(sanitizeScene([null, { id: "invalid", cls: "Bogus" }])).toBeNull();
  });
});
