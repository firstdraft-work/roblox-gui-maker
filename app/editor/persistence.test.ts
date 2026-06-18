import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import {
  parseSceneDocument,
  sanitizeScene,
  sceneDocumentFilename,
  serializeSceneDocument,
} from "./persistence";

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

describe("scene project documents", () => {
  it("round-trips a versioned scene document", () => {
    const scene: SceneNode[] = [
      node({
        id: "screen",
        cls: "ScreenGui",
        name: "Main Menu",
      }),
      node({
        id: "play-button",
        cls: "TextButton",
        name: "Play",
        parentId: "screen",
        posOffset: { x: 12, y: -4 },
        sizeOffset: { x: 20, y: 10 },
        anchor: { x: 0.5, y: 1 },
        aspectRatio: 16 / 9,
        minSize: { x: 320, y: 180 },
        maxSize: { x: 960, y: 540 },
        action: { type: "hideGui" },
      }),
    ];

    const serialized = serializeSceneDocument(scene);

    expect(JSON.parse(serialized)).toMatchObject({
      format: "roblox-gui-maker",
      version: 1,
      scene,
    });
    expect(parseSceneDocument(serialized)).toEqual(scene);
  });

  it.each([
    ["invalid JSON", "{", "This file is not valid JSON."],
    [
      "wrong format",
      JSON.stringify({ format: "other", version: 1, scene: [node()] }),
      "This is not a Roblox GUI Maker project.",
    ],
    [
      "unsupported version",
      JSON.stringify({
        format: "roblox-gui-maker",
        version: 2,
        scene: [node()],
      }),
      "Project version 2 is not supported.",
    ],
    [
      "empty scene",
      JSON.stringify({ format: "roblox-gui-maker", version: 1, scene: [] }),
      "The project contains no valid GUI elements.",
    ],
  ])("rejects %s", (_label, text, message) => {
    expect(() => parseSceneDocument(text)).toThrowError(message);
  });
});

describe("sceneDocumentFilename", () => {
  it("slugifies the root ScreenGui name", () => {
    expect(
      sceneDocumentFilename([
        node({ cls: "ScreenGui", name: "Main Menu!" }),
      ])
    ).toBe("main-menu.json");
  });

  it("separates camel-cased template names", () => {
    expect(
      sceneDocumentFilename([node({ cls: "ScreenGui", name: "MainMenu" })])
    ).toBe("main-menu.json");
  });

  it("uses the fallback without a root ScreenGui", () => {
    expect(sceneDocumentFilename([node({ cls: "Frame" })])).toBe(
      "roblox-gui-project.json"
    );
  });

  it("uses the fallback when the root name has no ASCII letters or digits", () => {
    expect(
      sceneDocumentFilename([node({ cls: "ScreenGui", name: "主菜单" })])
    ).toBe("roblox-gui-project.json");
  });
});
