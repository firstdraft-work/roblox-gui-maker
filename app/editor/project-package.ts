import { strToU8, zipSync } from "fflate";
import type { SceneNode } from "./catalog";
import {
  sceneDocumentFilename,
  serializeSceneDocument,
} from "./persistence";

type ProjectPackage = {
  filename: string;
  bytes: Uint8Array;
};

function installationGuide(hasServerCode: boolean): string {
  const serverInstructions = hasServerCode
    ? "\n3. Create a Script in ServerScriptService and paste in roblox-gui.server.lua.\n"
    : "";

  return `# Roblox GUI Maker Export

## Install in Roblox Studio

1. Open your experience in Roblox Studio.
2. Create a LocalScript in StarterGui and paste in roblox-gui.client.lua.
${serverInstructions}
The generated client script creates the ScreenGui at runtime. Keep project.json if you want to import this project back into Roblox GUI Maker.
`;
}

export function createProjectPackage(
  scene: SceneNode[],
  clientCode: string,
  serverCode: string | null
): ProjectPackage {
  const files: Record<string, Uint8Array> = {
    "README.md": strToU8(installationGuide(serverCode !== null)),
    "project.json": strToU8(serializeSceneDocument(scene)),
    "roblox-gui.client.lua": strToU8(clientCode),
  };

  if (serverCode !== null) {
    files["roblox-gui.server.lua"] = strToU8(serverCode);
  }

  return {
    filename: sceneDocumentFilename(scene).replace(/\.json$/, ".zip"),
    bytes: zipSync(files),
  };
}
