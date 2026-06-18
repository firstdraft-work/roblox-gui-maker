import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import {
  applyPreviewAction,
  createPreviewVisibility,
  generateLuau,
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
