import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import {
  collectTeleportPlaceIds,
  placeIdError,
  sanitizeTeleportAction,
  teleportButtons,
} from "./teleports";

const button = (overrides: Partial<SceneNode> = {}): SceneNode => ({
  id: "button",
  cls: "TextButton",
  name: "Button",
  pos: { x: 0, y: 0 },
  size: { x: 1, y: 1 },
  color: "#000000",
  transparency: 0,
  cornerRadius: 0,
  zindex: 1,
  ...overrides,
});

describe("placeIdError", () => {
  it.each(["1", "12345678901234", "9007199254740991"])(
    "accepts the valid Place ID %s",
    (placeId) => expect(placeIdError(placeId)).toBeNull()
  );

  it.each([
    ["", "Place ID is required."],
    [" 123", "Place ID must contain digits only."],
    ["123 ", "Place ID must contain digits only."],
    ["12a", "Place ID must contain digits only."],
    ["0", "Place ID must be greater than zero."],
    ["01", "Place ID cannot start with zero."],
    ["9007199254740992", "Place ID is too large."],
  ])("rejects %j", (placeId, message) => {
    expect(placeIdError(placeId)).toBe(message);
  });
});

describe("sanitizeTeleportAction", () => {
  it("preserves a valid Place ID as a string", () => {
    expect(
      sanitizeTeleportAction({ type: "teleport", placeId: "12345678901234" })
    ).toEqual({ type: "teleport", placeId: "12345678901234" });
  });

  it.each([
    null,
    [],
    { type: "show", placeId: "123" },
    { type: "teleport", placeId: 123 },
    { type: "teleport", placeId: "0" },
    { type: "teleport", placeId: "01" },
    { type: "teleport", placeId: "9007199254740992" },
  ])("rejects malformed action %#", (raw) => {
    expect(sanitizeTeleportAction(raw)).toBeNull();
  });
});

describe("Teleport scene collection", () => {
  it("returns only TextButtons with valid Teleport actions", () => {
    const validButton = button({
      id: "valid",
      action: { type: "teleport", placeId: "123" } as SceneNode["action"],
    });
    const malformedButton = button({
      id: "invalid",
      action: { type: "teleport", placeId: "01" } as SceneNode["action"],
    });
    const frame = button({
      id: "frame",
      cls: "Frame",
      action: { type: "teleport", placeId: "456" } as SceneNode["action"],
    });

    expect(teleportButtons([validButton, malformedButton, frame])).toEqual([
      validButton,
    ]);
  });

  it("deduplicates Place IDs in first-seen order", () => {
    const scene = [
      button({ id: "first", action: { type: "teleport", placeId: "123" } as SceneNode["action"] }),
      button({ id: "duplicate", action: { type: "teleport", placeId: "123" } as SceneNode["action"] }),
      button({ id: "second", action: { type: "teleport", placeId: "456" } as SceneNode["action"] }),
    ];

    expect(collectTeleportPlaceIds(scene)).toEqual(["123", "456"]);
  });
});
