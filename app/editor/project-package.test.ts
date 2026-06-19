import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { SAMPLE_SCENE, type SceneNode } from "./catalog";
import { createProjectPackage } from "./project-package";

describe("createProjectPackage", () => {
  it("packages the scene, client code, and installation guide", () => {
    const result = createProjectPackage(SAMPLE_SCENE, "client code", null);
    const files = unzipSync(result.bytes);

    expect(result.filename).toBe("game-menu.zip");
    expect(strFromU8(files["project.json"])).toContain(
      '"format": "roblox-gui-maker"'
    );
    expect(strFromU8(files["roblox-gui.client.lua"])).toBe("client code");
    expect(strFromU8(files["README.md"])).toContain("StarterGui");
    expect(files["roblox-gui.server.lua"]).toBeUndefined();
  });

  it("includes server installation output only when generated", () => {
    const files = unzipSync(
      createProjectPackage(SAMPLE_SCENE, "client code", "server code").bytes
    );

    expect(strFromU8(files["roblox-gui.server.lua"])).toBe("server code");
    expect(strFromU8(files["README.md"])).toContain("ServerScriptService");
  });

  it("uses the project filename fallback when the root has no ASCII slug", () => {
    const scene: SceneNode[] = [
      { ...SAMPLE_SCENE[0], id: "root", name: "界面", parentId: null },
    ];

    expect(createProjectPackage(scene, "client code", null).filename).toBe(
      "roblox-gui-project.zip"
    );
  });
});
