import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import { appendSceneHistory, type SceneHistory } from "./history";

const scene = (id: string): SceneNode[] => [
  {
    id,
    cls: "ScreenGui",
    name: id,
    parentId: null,
    pos: { x: 0, y: 0 },
    size: { x: 1, y: 1 },
    color: "#000000",
    transparency: 0,
    cornerRadius: 0,
    zindex: 1,
  },
];

describe("appendSceneHistory", () => {
  it("atomically records a pending edit before an immediate imported scene", () => {
    const initial = scene("initial");
    const pending = scene("pending");
    const imported = scene("imported");
    const history: SceneHistory = { stack: [initial], index: 0 };

    const next = appendSceneHistory(history, pending, imported);

    expect(next).toEqual({
      stack: [initial, pending, imported],
      index: 2,
    });
    expect(next.stack[next.index - 1]).toEqual(pending);
    expect(history).toEqual({ stack: [initial], index: 0 });
  });
});
