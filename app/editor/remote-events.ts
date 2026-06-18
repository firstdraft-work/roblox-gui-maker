import type { RemoteEventAction, SceneNode } from "./catalog";

export const MAX_REMOTE_EVENT_NAME = 50;
export const MAX_REMOTE_ARGUMENT = 200;

export function remoteEventNameError(eventName: string): string | null {
  const trimmedName = eventName.trim();
  if (!trimmedName) return "Event name is required.";
  if (trimmedName.length > MAX_REMOTE_EVENT_NAME) {
    return "Event name must be 50 characters or fewer.";
  }
  if (!/^[A-Za-z0-9_]+$/.test(trimmedName)) {
    return "Event name may contain only letters, numbers, and underscores.";
  }
  return null;
}

export function sanitizeRemoteEventAction(
  raw: unknown
): RemoteEventAction | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const action = raw as Record<string, unknown>;
  if (
    action.type !== "remoteEvent" ||
    typeof action.eventName !== "string" ||
    typeof action.argument !== "string"
  ) {
    return null;
  }

  const eventName = action.eventName.trim();
  if (
    remoteEventNameError(eventName) ||
    action.argument.length > MAX_REMOTE_ARGUMENT
  ) {
    return null;
  }

  return { type: "remoteEvent", eventName, argument: action.argument };
}

type RemoteEventButton = SceneNode & {
  cls: "TextButton";
  action: RemoteEventAction;
};

export function remoteEventButtons(scene: SceneNode[]): RemoteEventButton[] {
  return scene.filter(
    (node): node is RemoteEventButton =>
      node.cls === "TextButton" && node.action?.type === "remoteEvent"
  );
}
