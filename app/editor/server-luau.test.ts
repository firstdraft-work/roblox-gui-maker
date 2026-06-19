import { describe, expect, it } from "vitest";
import type { SceneNode } from "./catalog";
import { generateServerLuau } from "./server-luau";

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

describe("generateServerLuau Teleport support", () => {
  it("returns null without server-backed actions", () => {
    expect(generateServerLuau([button({ action: { type: "hideGui" } })])).toBeNull();
  });

  it("creates an isolated request event and allowlists unique Place IDs", () => {
    const code = generateServerLuau([
      button({ id: "first", action: { type: "teleport", placeId: "123" } }),
      button({ id: "duplicate", action: { type: "teleport", placeId: "123" } }),
      button({ id: "second", action: { type: "teleport", placeId: "456" } }),
    ]);

    expect(code).toContain('local ReplicatedStorage = game:GetService("ReplicatedStorage")');
    expect(code).toContain('local TeleportService = game:GetService("TeleportService")');
    expect(code).toContain('local rgm = ReplicatedStorage:FindFirstChild("RGM")');
    expect(code).toContain('error("ReplicatedStorage.RGM must be a Folder")');
    expect(code).toContain('local teleportRequest = rgm:FindFirstChild("TeleportRequest")');
    expect(code).toContain('error("ReplicatedStorage.RGM.TeleportRequest must be a RemoteEvent")');
    expect(code?.match(/\["123"\] = true/g)).toHaveLength(1);
    expect(code?.match(/\["456"\] = true/g)).toHaveLength(1);
    expect(code).toContain('if typeof(placeId) ~= "string" or not allowedPlaceIds[placeId] then');
    expect(code).toContain('TeleportService:TeleportAsync(numericPlaceId, { player })');
    expect(code).toContain('local success, message = pcall(function()');
    expect(code).toContain('warn("Teleport to " .. placeId .. " failed: " .. tostring(message))');
    expect(code).not.toContain('FindFirstChild("Remotes")');
  });

  it("keeps custom TeleportRequest events isolated under Remotes", () => {
    const code = generateServerLuau([
      button({ action: { type: "teleport", placeId: "123" } }),
      button({
        id: "custom",
        action: {
          type: "remoteEvent",
          eventName: "TeleportRequest",
          argument: "custom_action",
        },
      }),
    ]);

    expect(code).toContain('local remotes = ReplicatedStorage:FindFirstChild("Remotes")');
    expect(code).toContain('local remote0 = remotes:FindFirstChild("TeleportRequest")');
    expect(code).toContain('local rgm = ReplicatedStorage:FindFirstChild("RGM")');
    expect(code).toContain('local teleportRequest = rgm:FindFirstChild("TeleportRequest")');
    expect(code?.match(/\.OnServerEvent:Connect/g)).toHaveLength(2);
  });

  it("ignores malformed runtime Teleport actions", () => {
    const scene = [
      button({ action: { type: "teleport", placeId: "01" } as SceneNode["action"] }),
    ];

    expect(generateServerLuau(scene)).toBeNull();
  });
});
