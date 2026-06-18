import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import {
  applyPreviewAction,
  createPreviewVisibility,
  createNode,
  duplicateSubtree,
  generateLuau,
  orderedChildren,
  reparentNode,
  reorderSibling,
  removeSubtree,
} from "./scene";

const node = (overrides: Partial<SceneNode>): SceneNode => ({
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

function actionScene(action: NonNullable<SceneNode["action"]>): SceneNode[] {
  return [
    node({ id: "root", cls: "ScreenGui", name: "Gui" }),
    node({
      id: "panel",
      cls: "Frame",
      name: "Panel",
      parentId: "root",
      initialVisible: false,
    }),
    node({
      id: "button",
      cls: "TextButton",
      name: "Button",
      parentId: "root",
      text: "GO",
      action,
    }),
  ];
}

describe("button actions", () => {
  it.each([
    ["show", "el0.Visible = true"],
    ["hide", "el0.Visible = false"],
    ["toggle", "el0.Visible = not el0.Visible"],
  ] as const)("generates %s panel behavior", (type, statement) => {
    const code = generateLuau(actionScene({ type, targetId: "panel" }));

    expect(code).toContain("el0.Visible = false");
    expect(code).toContain("el1.Activated:Connect(function()");
    expect(code).toContain(statement);
  });

  it("generates hide-GUI behavior", () => {
    const code = generateLuau(actionScene({ type: "hideGui" }));

    expect(code).toContain("gui.Enabled = false");
  });

  it("does not generate an invalid target action", () => {
    const code = generateLuau(actionScene({ type: "show", targetId: "missing" }));

    expect(code).not.toContain("Activated:Connect");
  });
});

describe("scene action state", () => {
  it("clears actions that target a deleted subtree", () => {
    const scene = actionScene({ type: "show", targetId: "panel" });

    const remaining = removeSubtree(scene, "panel");

    expect(remaining.find((item) => item.id === "button")?.action).toBeUndefined();
  });

  it("applies preview actions without mutating the scene", () => {
    const scene = actionScene({ type: "toggle", targetId: "panel" });
    const initial = createPreviewVisibility(scene);

    const next = applyPreviewAction(scene, initial, "button");

    expect(initial.panel).toBe(false);
    expect(next.panel).toBe(true);
    expect(scene.find((item) => item.id === "panel")?.initialVisible).toBe(false);
  });

  it("hides the root GUI in preview", () => {
    const scene = actionScene({ type: "hideGui" });

    const next = applyPreviewAction(scene, createPreviewVisibility(scene), "button");

    expect(next.root).toBe(false);
  });
});

describe("hierarchy mutations", () => {
  const hierarchyScene = (): SceneNode[] => [
    node({ id: "root", cls: "ScreenGui", name: "Gui", layoutOrder: 0 }),
    node({ id: "left", cls: "Frame", name: "Left", parentId: "root", layoutOrder: 0 }),
    node({ id: "right", cls: "Frame", name: "Right", parentId: "root", layoutOrder: 1 }),
    node({
      id: "first",
      cls: "TextButton",
      name: "First",
      parentId: "left",
      layoutOrder: 0,
      action: { type: "show", targetId: "right" },
    }),
    node({ id: "second", cls: "TextLabel", name: "Second", parentId: "left", layoutOrder: 1 }),
    node({ id: "nested", cls: "Frame", name: "Nested", parentId: "first", layoutOrder: 0 }),
    node({ id: "right-child", cls: "TextLabel", name: "RightChild", parentId: "right" }),
  ];

  it("reparents a node into a container and preserves its action", () => {
    const moved = reparentNode(hierarchyScene(), "first", "right");
    const first = moved.find((item) => item.id === "first");

    expect(first?.parentId).toBe("right");
    expect(first?.layoutOrder).toBe(1);
    expect(first?.action).toEqual({ type: "show", targetId: "right" });
  });

  it.each([
    ["non-container", "first", "second"],
    ["itself", "left", "left"],
    ["its descendant", "left", "nested"],
    ["the root", "root", "right"],
  ])("rejects moving a node onto %s", (_label, id, parentId) => {
    const scene = hierarchyScene();

    expect(reparentNode(scene, id, parentId)).toBe(scene);
  });

  it("reorders siblings and normalizes layout order", () => {
    const scene = hierarchyScene();

    const reordered = reorderSibling(scene, "second", "first", "before");

    expect(orderedChildren(reordered, "left").map((item) => item.id)).toEqual([
      "second",
      "first",
    ]);
    expect(orderedChildren(reordered, "left").map((item) => item.layoutOrder)).toEqual([0, 1]);
  });

  it("rejects reordering nodes from different parents", () => {
    const scene = hierarchyScene();

    expect(reorderSibling(scene, "first", "right", "after")).toBe(scene);
  });

  it("orders equal or missing layout values by stable scene order", () => {
    const scene = hierarchyScene().map((item) =>
      item.id === "first" || item.id === "second"
        ? { ...item, layoutOrder: undefined }
        : item
    );

    expect(orderedChildren(scene, "left").map((item) => item.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("exports explicit LayoutOrder", () => {
    const code = generateLuau(hierarchyScene());

    expect(code).toContain("el0.LayoutOrder = 0");
    expect(code).toContain("el3.LayoutOrder = 1");
  });

  it("normalizes duplicate LayoutOrder values during export", () => {
    const scene = hierarchyScene().map((item) =>
      item.id === "second" ? { ...item, layoutOrder: 0 } : item
    );

    const code = generateLuau(scene);

    expect(code).toContain("el1.LayoutOrder = 0");
    expect(code).toContain("el3.LayoutOrder = 1");
  });

  it("appends a duplicated subtree after its siblings", () => {
    const scene = hierarchyScene();

    const result = duplicateSubtree(scene, "first");
    const combined = result ? [...scene, ...result.nodes] : scene;

    expect(orderedChildren(combined, "left").at(-1)?.id).toBe(result?.newId);
  });

  it("appends a new node after siblings without explicit order", () => {
    const scene = hierarchyScene().map((item) =>
      item.parentId === "left" ? { ...item, layoutOrder: undefined } : item
    );

    const created = createNode("TextLabel", scene, "left");

    expect(orderedChildren([...scene, created], "left").at(-1)?.id).toBe(created.id);
  });
});
