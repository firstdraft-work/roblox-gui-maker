import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("Roblox thumbnail route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid asset IDs before calling Roblox", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const response = await GET(
      new Request("https://robloxguimaker.app/api/roblox-thumbnail?assetId=01")
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Invalid Roblox asset ID: 01",
    });
  });

  it("returns the trusted Roblox CDN thumbnail URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              state: "Completed",
              imageUrl: "https://tr.rbxcdn.com/example.png",
            },
          ],
        }),
        { status: 200 }
      )
    );

    const response = await GET(
      new Request("https://robloxguimaker.app/api/roblox-thumbnail?assetId=1818")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      imageUrl: "https://tr.rbxcdn.com/example.png",
    });
  });
});
