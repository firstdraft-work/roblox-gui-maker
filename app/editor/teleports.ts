import type { SceneNode, TeleportAction } from "./catalog";

const MAX_SAFE_PLACE_ID = BigInt(Number.MAX_SAFE_INTEGER);

export function placeIdError(placeId: string): string | null {
  if (!placeId) return "Place ID is required.";
  if (!/^\d+$/.test(placeId)) return "Place ID must contain digits only.";
  if (placeId === "0") return "Place ID must be greater than zero.";
  if (placeId.startsWith("0")) return "Place ID cannot start with zero.";
  if (BigInt(placeId) > MAX_SAFE_PLACE_ID) return "Place ID is too large.";
  return null;
}

export function sanitizeTeleportAction(raw: unknown): TeleportAction | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const action = raw as Record<string, unknown>;
  if (action.type !== "teleport" || typeof action.placeId !== "string") {
    return null;
  }
  return placeIdError(action.placeId)
    ? null
    : { type: "teleport", placeId: action.placeId };
}

type TeleportButton = SceneNode & {
  cls: "TextButton";
  action: TeleportAction;
};

export function teleportButtons(scene: SceneNode[]): TeleportButton[] {
  return scene.filter((node): node is TeleportButton => {
    if (node.cls !== "TextButton") return false;
    return sanitizeTeleportAction(node.action) !== null;
  });
}

export function collectTeleportPlaceIds(scene: SceneNode[]): string[] {
  const placeIds: string[] = [];
  const seen = new Set<string>();
  for (const button of teleportButtons(scene)) {
    if (seen.has(button.action.placeId)) continue;
    seen.add(button.action.placeId);
    placeIds.push(button.action.placeId);
  }
  return placeIds;
}
