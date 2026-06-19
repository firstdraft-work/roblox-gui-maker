"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TeleportAction } from "./catalog";
import { placeIdError } from "./teleports";

type Props = {
  action: TeleportAction;
  onCommit: (action: TeleportAction) => void;
};

export function TeleportActionFields({ action, onCommit }: Props) {
  const [placeId, setPlaceId] = useState(action.placeId);
  const pendingLocalCommit = useRef<TeleportAction | null>(null);
  const placeIdInputId = useId();

  useEffect(() => {
    const pending = pendingLocalCommit.current;
    pendingLocalCommit.current = null;
    if (pending?.placeId === action.placeId) return;
    setPlaceId(action.placeId);
  }, [action.placeId]);

  const error = placeIdError(placeId);

  function commitIfValid(nextPlaceId: string) {
    if (placeIdError(nextPlaceId)) return;
    const nextAction: TeleportAction = {
      type: "teleport",
      placeId: nextPlaceId,
    };
    pendingLocalCommit.current = nextAction;
    onCommit(nextAction);
  }

  return (
    <div className="flex flex-col gap-3 px-1 py-1">
      <div>
        <label
          htmlFor={placeIdInputId}
          className="mb-1 block text-[11px] text-ink-mute"
        >
          Destination Place ID
        </label>
        <input
          id={placeIdInputId}
          inputMode="numeric"
          value={placeId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error
              ? `${placeIdInputId}-error ${placeIdInputId}-path`
              : `${placeIdInputId}-path`
          }
          onChange={(event) => {
            const nextPlaceId = event.target.value;
            setPlaceId(nextPlaceId);
            commitIfValid(nextPlaceId);
          }}
          onBlur={() => commitIfValid(placeId)}
          className="w-full rounded bg-input px-2 py-1 text-xs text-ink outline-none focus:ring-1 focus:ring-focus"
        />
        {error && (
          <p
            id={`${placeIdInputId}-error`}
            className="mt-1 text-[10px] text-danger"
          >
            {error}
          </p>
        )}
        <p
          id={`${placeIdInputId}-path`}
          className="mt-1 break-all font-mono text-[10px] text-ink-mute"
        >
          ReplicatedStorage / RGM / TeleportRequest
        </p>
      </div>
      <p className="text-[10px] leading-4 text-warning">
        The generated server script allows only Place IDs configured in this GUI.
      </p>
    </div>
  );
}
