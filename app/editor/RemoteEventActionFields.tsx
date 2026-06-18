"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { RemoteEventAction } from "./catalog";
import {
  MAX_REMOTE_ARGUMENT,
  remoteEventNameError,
} from "./remote-events";

type Props = {
  action: RemoteEventAction;
  onCommit: (action: RemoteEventAction) => void;
};

export function RemoteEventActionFields({ action, onCommit }: Props) {
  const [eventName, setEventName] = useState(action.eventName);
  const [argument, setArgument] = useState(action.argument);
  const eventNameInput = useRef<HTMLInputElement>(null);
  const argumentInput = useRef<HTMLInputElement>(null);
  const eventNameId = useId();
  const argumentId = useId();

  useEffect(() => {
    if (document.activeElement !== eventNameInput.current) {
      setEventName(action.eventName);
    }
    if (document.activeElement !== argumentInput.current) {
      setArgument(action.argument);
    }
  }, [action.eventName, action.argument]);

  const nameError = remoteEventNameError(eventName);
  const argumentError =
    argument.length > MAX_REMOTE_ARGUMENT
      ? "Argument must be 200 characters or fewer."
      : null;

  function commitIfValid(nextEventName: string, nextArgument: string) {
    if (remoteEventNameError(nextEventName) || nextArgument.length > MAX_REMOTE_ARGUMENT) {
      return;
    }
    onCommit({
      type: "remoteEvent",
      eventName: nextEventName.trim(),
      argument: nextArgument,
    });
  }

  return (
    <div className="flex flex-col gap-3 px-1 py-1">
      <div>
        <label htmlFor={eventNameId} className="mb-1 block text-[11px] text-ink-mute">
          RemoteEvent name
        </label>
        <input
          ref={eventNameInput}
          id={eventNameId}
          value={eventName}
          maxLength={51}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={
            nameError
              ? `${eventNameId}-error ${eventNameId}-path`
              : `${eventNameId}-path`
          }
          onChange={(event) => {
            const nextEventName = event.target.value;
            setEventName(nextEventName);
            commitIfValid(nextEventName, argument);
          }}
          onBlur={() => {
            if (!remoteEventNameError(eventName)) {
              const normalized = eventName.trim();
              setEventName(normalized);
              commitIfValid(normalized, argument);
            }
          }}
          className="w-full rounded bg-input px-2 py-1 text-xs text-ink outline-none focus:ring-1 focus:ring-focus"
        />
        {nameError && (
          <p id={`${eventNameId}-error`} className="mt-1 text-[10px] text-danger">
            {nameError}
          </p>
        )}
        <p id={`${eventNameId}-path`} className="mt-1 break-all font-mono text-[10px] text-ink-mute">
          ReplicatedStorage / Remotes / {eventName.trim() || "..."}
        </p>
      </div>

      <div>
        <label htmlFor={argumentId} className="mb-1 block text-[11px] text-ink-mute">
          Argument
        </label>
        <input
          ref={argumentInput}
          id={argumentId}
          value={argument}
          maxLength={201}
          aria-invalid={argumentError ? true : undefined}
          aria-describedby={argumentError ? `${argumentId}-error` : undefined}
          onChange={(event) => {
            const nextArgument = event.target.value;
            setArgument(nextArgument);
            commitIfValid(eventName, nextArgument);
          }}
          onBlur={() => commitIfValid(eventName, argument)}
          className="w-full rounded bg-input px-2 py-1 text-xs text-ink outline-none focus:ring-1 focus:ring-focus"
        />
        {argumentError && (
          <p id={`${argumentId}-error`} className="mt-1 text-[10px] text-danger">
            {argumentError}
          </p>
        )}
      </div>

      <p className="text-[10px] leading-4 text-warning">
        Validate the player and argument on the server before changing game state.
      </p>
    </div>
  );
}
