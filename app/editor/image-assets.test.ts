import { describe, expect, it } from "vitest";
import {
  normalizeRobloxAssetId,
  parseThumbnailResponse,
  thumbnailProxyUrl,
  thumbnailRequestUrl,
} from "./image-assets";

describe("Roblox image assets", () => {
  it.each([
    ["123", "rbxassetid://123"],
    ["  rbxassetid://456  ", "rbxassetid://456"],
  ])("canonicalizes %s", (input, expected) => {
    expect(normalizeRobloxAssetId(input)).toBe(expected);
  });

  it.each([
    "",
    "-1",
    "1.5",
    "https://example.com/a.png",
    "rbxassetid://1 2",
  ])("rejects %s", (input) => {
    expect(normalizeRobloxAssetId(input)).toBeNull();
  });

  it("builds the official thumbnail request", () => {
    expect(thumbnailRequestUrl("rbxassetid://1818")).toContain(
      "assetIds=1818"
    );
  });

  it("builds a same-origin thumbnail proxy request for the browser", () => {
    expect(thumbnailProxyUrl("rbxassetid://1818")).toBe(
      "/api/roblox-thumbnail?assetId=1818"
    );
  });

  it("accepts only completed Roblox CDN thumbnail responses", () => {
    expect(
      parseThumbnailResponse({
        data: [
          {
            state: "Completed",
            imageUrl: "https://tr.rbxcdn.com/example",
          },
        ],
      })
    ).toBe("https://tr.rbxcdn.com/example");
    expect(parseThumbnailResponse({ data: [{ state: "Pending" }] })).toBeNull();
    expect(
      parseThumbnailResponse({
        data: [
          {
            state: "Completed",
            imageUrl: "https://example.com/untrusted.png",
          },
        ],
      })
    ).toBeNull();
    expect(parseThumbnailResponse({ data: "bad" })).toBeNull();
  });
});
