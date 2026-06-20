import { describe, expect, it } from "vitest";
import {
  alignNode,
  canvasGeometryStyle,
  sanitizeResponsiveGeometry,
  setAnchorPreservingPosition,
  validAspectRatio,
  validSizeConstraints,
} from "./geometry";

describe("canvasGeometryStyle", () => {
  it("combines scale, offset, and anchor", () => {
    expect(
      canvasGeometryStyle({
        pos: { x: 0.5, y: 0.25 },
        posOffset: { x: 12, y: -4 },
        size: { x: 0.4, y: 0.2 },
        sizeOffset: { x: 20, y: 10 },
        anchor: { x: 0.5, y: 1 },
      })
    ).toMatchObject({
      left: "calc(50% + 12px)",
      top: "calc(25% - 4px)",
      width: "calc(40% + 20px)",
      height: "calc(20% + 10px)",
      transform: "translate(-50%, -100%)",
    });
  });

  it("keeps scale-only geometry as percentages without a transform", () => {
    expect(
      canvasGeometryStyle({
        pos: { x: 0.2, y: 0.3 },
        size: { x: 0.4, y: 0.5 },
      })
    ).toEqual({
      left: "20%",
      top: "30%",
      width: "40%",
      height: "50%",
    });
  });

  it("uses width-dominant aspect ratio and pixel size constraints", () => {
    expect(
      canvasGeometryStyle({
        pos: { x: 0, y: 0 },
        size: { x: 0.5, y: 0.25 },
        sizeOffset: { x: 12, y: 8 },
        aspectRatio: 16 / 9,
        minSize: { x: 320, y: 180 },
        maxSize: { x: 960, y: 540 },
      })
    ).toMatchObject({
      width: "calc(50% + 12px)",
      height: "auto",
      aspectRatio: 16 / 9,
      minWidth: "320px",
      minHeight: "180px",
      maxWidth: "960px",
      maxHeight: "540px",
    });
  });

  it("composes anchor translation and rotation", () => {
    expect(
      canvasGeometryStyle({
        pos: { x: 0.5, y: 1 },
        size: { x: 0.4, y: 0.2 },
        anchor: { x: 0.5, y: 1 },
        rotation: 15,
      })
    ).toMatchObject({
      transform: "translate(-50%, -100%) rotate(15deg)",
    });
  });

  it("renders rotation without an anchor", () => {
    expect(
      canvasGeometryStyle({
        pos: { x: 0, y: 0 },
        size: { x: 1, y: 1 },
        rotation: -20,
      }).transform
    ).toBe("rotate(-20deg)");
  });
});

describe("setAnchorPreservingPosition", () => {
  it("compensates scale and offset", () => {
    expect(
      setAnchorPreservingPosition(
        {
          pos: { x: 0.2, y: 0.3 },
          posOffset: { x: 4, y: 8 },
          size: { x: 0.4, y: 0.2 },
          sizeOffset: { x: 20, y: 10 },
          anchor: { x: 0, y: 0 },
        },
        { x: 0.5, y: 1 }
      )
    ).toEqual({
      anchor: { x: 0.5, y: 1 },
      pos: { x: 0.4, y: 0.5 },
      posOffset: { x: 14, y: 18 },
    });
  });

  it("uses zero offsets when optional offsets are absent", () => {
    expect(
      setAnchorPreservingPosition(
        {
          pos: { x: 0.1, y: 0.2 },
          size: { x: 0.4, y: 0.6 },
        },
        { x: 0.5, y: 0.5 }
      )
    ).toEqual({
      anchor: { x: 0.5, y: 0.5 },
      pos: { x: 0.3, y: 0.5 },
      posOffset: { x: 0, y: 0 },
    });
  });
});

describe("alignNode", () => {
  it("centers with zero offsets", () => {
    expect(alignNode({ x: 0.5, y: 0.5 })).toEqual({
      anchor: { x: 0.5, y: 0.5 },
      pos: { x: 0.5, y: 0.5 },
      posOffset: { x: 0, y: 0 },
    });
  });

  it.each([0, 0.5, 1].flatMap((y) => [0, 0.5, 1].map((x) => [x, y]))) (
    "aligns to (%s, %s)",
    (x, y) => {
      expect(alignNode({ x, y })).toEqual({
        anchor: { x, y },
        pos: { x, y },
        posOffset: { x: 0, y: 0 },
      });
    }
  );
});

describe("constraint validation", () => {
  it("accepts positive aspect ratios", () => {
    expect(validAspectRatio(16 / 9)).toBe(true);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects aspect ratio %s",
    (ratio) => {
      expect(validAspectRatio(ratio)).toBe(false);
    }
  );

  it("rejects max size below min size", () => {
    expect(validSizeConstraints({ x: 400, y: 200 }, { x: 300, y: 300 })).toBe(false);
  });

  it("rejects negative bounds", () => {
    expect(validSizeConstraints({ x: -1, y: 0 }, { x: 300, y: 300 })).toBe(false);
  });

  it("accepts equal non-negative bounds", () => {
    expect(validSizeConstraints({ x: 300, y: 300 }, { x: 300, y: 300 })).toBe(true);
  });
});

describe("sanitizeResponsiveGeometry", () => {
  it("keeps valid optional geometry and normalizes values", () => {
    expect(
      sanitizeResponsiveGeometry({
        posOffset: { x: 12.4, y: -3.6 },
        sizeOffset: { x: 20, y: 10 },
        anchor: { x: -0.2, y: 1.4 },
        aspectRatio: 16 / 9,
        minSize: { x: 320, y: 180 },
        maxSize: { x: 960, y: 540 },
      })
    ).toEqual({
      posOffset: { x: 12, y: -4 },
      sizeOffset: { x: 20, y: 10 },
      anchor: { x: 0, y: 1 },
      aspectRatio: 16 / 9,
      minSize: { x: 320, y: 180 },
      maxSize: { x: 960, y: 540 },
    });
  });

  it("omits invalid fields and drops invalid bounds together", () => {
    expect(
      sanitizeResponsiveGeometry({
        posOffset: { x: Number.NaN, y: 0 },
        sizeOffset: "nope",
        anchor: { x: 0.5, y: Number.POSITIVE_INFINITY },
        aspectRatio: 0,
        minSize: { x: 400, y: 200 },
        maxSize: { x: 300, y: 300 },
      })
    ).toEqual({});
  });
});
