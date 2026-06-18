import { describe, expect, it } from "vitest";
import {
  alignNode,
  canvasGeometryStyle,
  setAnchorPreservingPosition,
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
});

describe("alignNode", () => {
  it("centers with zero offsets", () => {
    expect(alignNode({ x: 0.5, y: 0.5 })).toEqual({
      anchor: { x: 0.5, y: 0.5 },
      pos: { x: 0.5, y: 0.5 },
      posOffset: { x: 0, y: 0 },
    });
  });
});

it("rejects max size below min size", () => {
  expect(validSizeConstraints({ x: 400, y: 200 }, { x: 300, y: 300 })).toBe(false);
});
