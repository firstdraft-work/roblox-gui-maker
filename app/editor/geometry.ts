import type { CSSProperties } from "react";
import type { SceneNode } from "./catalog";

type Vector2 = { x: number; y: number };
type GeometryNode = Pick<SceneNode, "pos" | "size"> &
  Partial<
    Pick<
      SceneNode,
      | "posOffset"
      | "sizeOffset"
      | "anchor"
      | "aspectRatio"
      | "minSize"
      | "maxSize"
      | "rotation"
    >
  >;
type ResponsiveGeometry = Partial<
  Pick<
    SceneNode,
    "posOffset" | "sizeOffset" | "anchor" | "aspectRatio" | "minSize" | "maxSize"
  >
>;

const ZERO: Vector2 = { x: 0, y: 0 };
const finite = (value: number) => Number.isFinite(value);
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const roundScale = (value: number) => Math.round(value * 100) / 100;
const roundPixel = (value: number) => Math.round(value);
const cleanZero = (value: number) => (Object.is(value, -0) ? 0 : value);

const percent = (scale: number) => cleanZero(roundScale(scale) * 100);

function cssAxis(scale: number, offset: number): string {
  const scaled = `${percent(scale)}%`;
  const pixels = roundPixel(offset);
  if (pixels === 0) return scaled;
  return `calc(${scaled} ${pixels > 0 ? "+" : "-"} ${Math.abs(pixels)}px)`;
}

export function canvasGeometryStyle(node: GeometryNode): CSSProperties {
  const posOffset = node.posOffset ?? ZERO;
  const sizeOffset = node.sizeOffset ?? ZERO;
  const anchor = node.anchor ?? ZERO;
  const transforms: string[] = [];
  const style: CSSProperties = {
    left: cssAxis(node.pos.x, posOffset.x),
    top: cssAxis(node.pos.y, posOffset.y),
    width: cssAxis(node.size.x, sizeOffset.x),
    height: node.aspectRatio ? "auto" : cssAxis(node.size.y, sizeOffset.y),
  };

  if (anchor.x !== 0 || anchor.y !== 0) {
    transforms.push(
      `translate(-${percent(clamp01(anchor.x))}%, -${percent(
        clamp01(anchor.y)
      )}%)`
    );
  }
  if (node.rotation) transforms.push(`rotate(${cleanZero(node.rotation)}deg)`);
  if (transforms.length > 0) style.transform = transforms.join(" ");
  if (node.aspectRatio) style.aspectRatio = node.aspectRatio;
  if (node.minSize) {
    style.minWidth = `${roundPixel(node.minSize.x)}px`;
    style.minHeight = `${roundPixel(node.minSize.y)}px`;
  }
  if (node.maxSize) {
    style.maxWidth = `${roundPixel(node.maxSize.x)}px`;
    style.maxHeight = `${roundPixel(node.maxSize.y)}px`;
  }

  return style;
}

export function setAnchorPreservingPosition(
  node: GeometryNode,
  requestedAnchor: Vector2
): Pick<SceneNode, "anchor" | "pos" | "posOffset"> {
  const anchor = {
    x: clamp01(requestedAnchor.x),
    y: clamp01(requestedAnchor.y),
  };
  const previousAnchor = node.anchor ?? ZERO;
  const positionOffset = node.posOffset ?? ZERO;
  const sizeOffset = node.sizeOffset ?? ZERO;
  const delta = {
    x: anchor.x - previousAnchor.x,
    y: anchor.y - previousAnchor.y,
  };

  return {
    anchor,
    pos: {
      x: roundScale(node.pos.x + delta.x * node.size.x),
      y: roundScale(node.pos.y + delta.y * node.size.y),
    },
    posOffset: {
      x: roundPixel(positionOffset.x + delta.x * sizeOffset.x),
      y: roundPixel(positionOffset.y + delta.y * sizeOffset.y),
    },
  };
}

export function alignNode(anchor: Vector2): Pick<SceneNode, "anchor" | "pos" | "posOffset"> {
  const aligned = { x: clamp01(anchor.x), y: clamp01(anchor.y) };
  return {
    anchor: aligned,
    pos: { ...aligned },
    posOffset: { x: 0, y: 0 },
  };
}

export function validSizeConstraints(minSize: Vector2, maxSize: Vector2): boolean {
  return (
    finite(minSize.x) &&
    finite(minSize.y) &&
    finite(maxSize.x) &&
    finite(maxSize.y) &&
    minSize.x >= 0 &&
    minSize.y >= 0 &&
    maxSize.x >= minSize.x &&
    maxSize.y >= minSize.y
  );
}

export function validAspectRatio(ratio: number): boolean {
  return finite(ratio) && ratio > 0;
}

function finiteVector(raw: unknown): Vector2 | null {
  if (!raw || typeof raw !== "object") return null;
  const vector = raw as Record<string, unknown>;
  return typeof vector.x === "number" &&
    finite(vector.x) &&
    typeof vector.y === "number" &&
    finite(vector.y)
    ? { x: vector.x, y: vector.y }
    : null;
}

function sanitizedBound(raw: unknown): Vector2 | null {
  const vector = finiteVector(raw);
  return vector && vector.x >= 0 && vector.y >= 0
    ? { x: roundPixel(vector.x), y: roundPixel(vector.y) }
    : null;
}

export function sanitizeResponsiveGeometry(raw: unknown): ResponsiveGeometry {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const geometry: ResponsiveGeometry = {};
  const posOffset = finiteVector(source.posOffset);
  const sizeOffset = finiteVector(source.sizeOffset);
  const anchor = finiteVector(source.anchor);

  if (posOffset) {
    geometry.posOffset = {
      x: roundPixel(posOffset.x),
      y: roundPixel(posOffset.y),
    };
  }
  if (sizeOffset) {
    geometry.sizeOffset = {
      x: roundPixel(sizeOffset.x),
      y: roundPixel(sizeOffset.y),
    };
  }
  if (anchor) {
    geometry.anchor = {
      x: roundScale(clamp01(anchor.x)),
      y: roundScale(clamp01(anchor.y)),
    };
  }
  if (
    typeof source.aspectRatio === "number" &&
    validAspectRatio(source.aspectRatio)
  ) {
    geometry.aspectRatio = source.aspectRatio;
  }

  const minSize = sanitizedBound(source.minSize);
  const maxSize = sanitizedBound(source.maxSize);
  if (minSize && maxSize) {
    if (validSizeConstraints(minSize, maxSize)) {
      geometry.minSize = minSize;
      geometry.maxSize = maxSize;
    }
  } else {
    if (minSize) geometry.minSize = minSize;
    if (maxSize) geometry.maxSize = maxSize;
  }

  return geometry;
}
