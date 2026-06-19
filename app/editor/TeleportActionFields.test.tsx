import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TeleportActionFields } from "./TeleportActionFields";

describe("TeleportActionFields", () => {
  it("renders the destination and isolated request path", () => {
    const markup = renderToStaticMarkup(
      <TeleportActionFields
        action={{ type: "teleport", placeId: "123" }}
        onCommit={() => undefined}
      />
    );

    expect(markup).toContain("Destination Place ID");
    expect(markup).toContain('inputMode="numeric"');
    expect(markup).toContain("ReplicatedStorage / RGM / TeleportRequest");
    expect(markup).toContain('value="123"');
  });

  it("renders an accessible validation error for an invalid draft", () => {
    const markup = renderToStaticMarkup(
      <TeleportActionFields
        action={{ type: "teleport", placeId: "01" }}
        onCommit={() => undefined}
      />
    );

    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain("Place ID cannot start with zero.");
  });
});
