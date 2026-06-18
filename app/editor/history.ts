import type { SceneNode } from "./catalog";

export type SceneHistory = { stack: SceneNode[][]; index: number };

export const cloneScene = (scene: SceneNode[]): SceneNode[] =>
  scene.map((node) => ({
    ...node,
    pos: { ...node.pos },
    size: { ...node.size },
    ...(node.posOffset ? { posOffset: { ...node.posOffset } } : {}),
    ...(node.sizeOffset ? { sizeOffset: { ...node.sizeOffset } } : {}),
    ...(node.anchor ? { anchor: { ...node.anchor } } : {}),
    ...(node.minSize ? { minSize: { ...node.minSize } } : {}),
    ...(node.maxSize ? { maxSize: { ...node.maxSize } } : {}),
    ...(node.gradient ? { gradient: { ...node.gradient } } : {}),
    ...(node.action ? { action: { ...node.action } } : {}),
  }));

export function appendSceneHistory(
  history: SceneHistory,
  scene: SceneNode[],
  ...scenes: SceneNode[][]
): SceneHistory {
  const stack = history.stack.slice(0, history.index + 1);
  stack.push(...[scene, ...scenes].map(cloneScene));
  while (stack.length > 100) stack.shift();
  return { stack, index: stack.length - 1 };
}
