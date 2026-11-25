export interface DesktopPoint {
  x: number;
  y: number;
}
export interface DesktopLimits {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** 原桌面的逐圈搜索；单个图标和成组移动共用顺序与边界。 */
export function nearestDesktopPoint(
  wanted: DesktopPoint,
  limits: DesktopLimits,
  step: DesktopPoint,
  fits: (x: number, y: number) => boolean,
): DesktopPoint | null {
  const minColumn = Math.ceil(limits.minX / step.x),
    maxColumn = Math.floor(limits.maxX / step.x);
  const minRow = Math.ceil(limits.minY / step.y),
    maxRow = Math.floor(limits.maxY / step.y);
  if (maxColumn < minColumn || maxRow < minRow) return null;
  const baseColumn = Math.max(minColumn, Math.min(maxColumn, Math.round(wanted.x / step.x)));
  const baseRow = Math.max(minRow, Math.min(maxRow, Math.round(wanted.y / step.y)));
  const radiusMax = Math.max(baseColumn - minColumn, maxColumn - baseColumn, baseRow - minRow, maxRow - baseRow);
  for (let radius = 0; radius <= radiusMax; radius++) {
    const left = baseColumn - radius,
      right = baseColumn + radius;
    for (let row = Math.max(minRow, baseRow - radius); row <= Math.min(maxRow, baseRow + radius); row++) {
      const edge = Math.abs(row - baseRow) === radius;
      const start = edge ? Math.max(minColumn, left) : left >= minColumn ? left : right;
      for (let column = start; column <= Math.min(maxColumn, right); column += edge ? 1 : Math.max(1, right - left)) {
        const x = column * step.x,
          y = row * step.y;
        if (fits(x, y)) return { x, y };
      }
    }
  }
  return null;
}

export function clampDesktopPoint(point: DesktopPoint, limits: DesktopLimits): DesktopPoint {
  return {
    x: Math.max(limits.minX, Math.min(limits.maxX, point.x)),
    y: Math.max(limits.minY, Math.min(limits.maxY, point.y)),
  };
}
