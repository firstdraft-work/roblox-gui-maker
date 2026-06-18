import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import {
  MAX_REMOTE_ARGUMENT,
  MAX_REMOTE_EVENT_NAME,
  remoteEventButtons,
  remoteEventNameError,
  sanitizeRemoteEventAction,
} from "./remote-events";

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

describe("remoteEventNameError", () => {
  it.each(["ShopAction", "Admin_Action_2", "A"])(
    "accepts the valid event name %s",
    (eventName) => {
      expect(remoteEventNameError(eventName)).toBeNull();
    }
  );

  it.each(["", "   "])("requires a non-empty event name", (eventName) => {
    expect(remoteEventNameError(eventName)).toBe(
      "Event name is required."
    );
  });

  it.each(["Shop/Action", "Shop-Action"])(
    "rejects unsupported characters in %s",
    (eventName) => {
      expect(remoteEventNameError(eventName)).toBe(
        "Event name may contain only letters, numbers, and underscores."
      );
    }
  );

  it("rejects event names longer than 50 characters", () => {
    expect(remoteEventNameError("A".repeat(MAX_REMOTE_EVENT_NAME + 1))).toBe(
      "Event name must be 50 characters or fewer."
    );
  });
});

describe("sanitizeRemoteEventAction", () => {
  it("trims a valid event name and permits an empty argument", () => {
    expect(
      sanitizeRemoteEventAction({
        type: "remoteEvent",
        eventName: "  ShopAction  ",
        argument: "",
      })
    ).toEqual({
      type: "remoteEvent",
      eventName: "ShopAction",
      argument: "",
    });
  });

  it("rejects an argument longer than 200 characters", () => {
    expect(
      sanitizeRemoteEventAction({
        type: "remoteEvent",
        eventName: "ShopAction",
        argument: "x".repeat(MAX_REMOTE_ARGUMENT + 1),
      })
    ).toBeNull();
  });

  it.each([
    null,
    [],
    { type: "show", eventName: "ShopAction", argument: "buy_sword" },
    { type: "remoteEvent", eventName: 1, argument: "buy_sword" },
    { type: "remoteEvent", eventName: "ShopAction", argument: 1 },
    { type: "remoteEvent", eventName: "Shop-Action", argument: "buy_sword" },
  ])("rejects malformed actions", (raw) => {
    expect(sanitizeRemoteEventAction(raw)).toBeNull();
  });
});

describe("remoteEventButtons", () => {
  it("returns only TextButtons with RemoteEvent actions", () => {
    const remoteButton = button({
      id: "remote",
      action: {
        type: "remoteEvent",
        eventName: "ShopAction",
        argument: "buy_sword",
      },
    });
    const visibilityButton = button({
      id: "visibility",
      action: { type: "hideGui" },
    });
    const mislabeledFrame = button({
      id: "frame",
      cls: "Frame",
      action: {
        type: "remoteEvent",
        eventName: "Admin_Action_2",
        argument: "ban",
      },
    });

    const result = remoteEventButtons([
      remoteButton,
      visibilityButton,
      mislabeledFrame,
    ]);

    expect(result).toEqual([remoteButton]);
    expect(result[0].action.eventName).toBe("ShopAction");
  });
});
