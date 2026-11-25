import { boundedInteger, type GridPlacement } from './gridPlacement';
import { nearestDesktopPoint, type DesktopPoint } from './desktopPlacementSearch';

export type DesktopIconPlacementMode = 'grid' | 'free';
const gap = 14;
const freeStep = 8;
const clearance = 4;

export function desktopIconPixels(size = 56) {
  return Number.isFinite(size) && size > 0 ? Math.max(24, size) : 56;
}

/** 与原桌面 metrics / grid 保持相同的图标占位和格距。 */
export function desktopIconMetrics(size?: number) {
  const pixels = desktopIconPixels(size);
  const width = Math.max(84, pixels + 28),
    height = pixels + 48;
  return { width, height, gap, stepX: width + gap, stepY: height + gap };
}

export interface DesktopIconLayoutOptions {
  placementMode: DesktopIconPlacementMode;
  autoArrange?: boolean;
  iconSize: number;
  canvasWidth: number | undefined;
  minCanvasHeight?: number;
}

/** 原桌面自动排列按列填充；拖动组按落点插入，其余图标依次补位。 */
export function reorderDesktopIcons(
  entries: readonly GridPlacement[], ids: ReadonlySet<string>, x: number, y: number, rows: number,
): GridPlacement[] {
  const moving = entries.filter((entry) => ids.has(entry.id));
  const remaining = entries.filter((entry) => !ids.has(entry.id));
  const column = Math.max(0, Math.floor(x));
  const row = Math.max(0, Math.min(rows - 1, Math.floor(y)));
  remaining.splice(Math.min(remaining.length, column * rows + row), 0, ...moving);
  return remaining.map((entry, index) => ({ ...entry, column: Math.floor(index / rows), row: index % rows }));
}

export function desktopGridGeometry(
  options: DesktopIconLayoutOptions,
  columns?: number,
  rows?: number,
  rowHeight?: number,
) {
  const { width, height, stepX, stepY: defaultStepY } = desktopIconMetrics(options.iconSize);
  const stepY = Number.isFinite(rowHeight) ? Math.max(height + clearance, Math.min(400, rowHeight!)) : defaultStepY;
  const count = boundedInteger(columns, 128, 1, 128);
  const canvasWidth = options.canvasWidth ?? Math.min(6, count) * stepX - gap;
  const fit = Math.max(1, Math.floor((canvasWidth + gap) / stepX));
  const fittedColumns = Math.min(count, fit);
  const fittedRows = boundedInteger(rows, 8, 1, 1000);
  const packedHeight = (fittedRows - 1) * stepY + height;
  const canvasHeight = boundedInteger(options.minCanvasHeight, packedHeight, packedHeight, packedHeight + stepY - 1);
  return {
    mode: options.placementMode,
    columns: fittedColumns,
    rows: fittedRows,
    stepX,
    stepY,
    iconWidth: Math.min(width, canvasWidth),
    iconHeight: height,
    canvasWidth: count < fit ? count * stepX - gap : canvasWidth,
    canvasHeight,
  };
}

export type DesktopGridGeometry = ReturnType<typeof desktopGridGeometry>;

export function desktopIconRect(entry: GridPlacement, geometry: DesktopGridGeometry) {
  return {
    x: Math.round(entry.column * geometry.stepX),
    y: Math.round(entry.row * geometry.stepY),
    width: (Math.max(1, entry.width ?? 1) - 1) * geometry.stepX + geometry.iconWidth,
    height: (Math.max(1, entry.height ?? 1) - 1) * geometry.stepY + geometry.iconHeight,
  };
}

export type DesktopIconRect = ReturnType<typeof desktopIconRect>;
export function desktopPlacementStep(geometry: DesktopGridGeometry): DesktopPoint {
  return geometry.mode === 'free' ? { x: freeStep, y: freeStep } : { x: geometry.stepX, y: geometry.stepY };
}
export function desktopIconOverlaps(a: DesktopIconRect, b: DesktopIconRect) {
  return a.x < b.x + b.width + clearance && a.x + a.width + clearance > b.x
    && a.y < b.y + b.height + clearance && a.y + a.height + clearance > b.y;
}

function nearestPlacement(entry: GridPlacement, placed: readonly GridPlacement[], geometry: DesktopGridGeometry) {
  const { width, height, x, y } = desktopIconRect(entry, geometry);
  const occupied = placed.map((item) => desktopIconRect(item, geometry));
  const limits = { minX: 0, minY: 0, maxX: Math.max(0, geometry.canvasWidth - width), maxY: Math.max(0, geometry.canvasHeight - height) };
  const point = nearestDesktopPoint({ x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 }, limits,
    desktopPlacementStep(geometry), (px, py) => !occupied.some((item) => desktopIconOverlaps({ x: px, y: py, width, height }, item)));
  return point && { ...entry, column: point.x / geometry.stepX, row: point.y / geometry.stepY };
}

export function normalizeDesktopIcons(
  ids: readonly string[],
  source: readonly GridPlacement[],
  geometry: DesktopGridGeometry,
) {
  const byId = new Map(source.map((entry) => [entry.id, entry]));
  const placed: GridPlacement[] = [];
  [...new Set(ids)].forEach((id, index) => {
    const saved = byId.get(id);
    const entry = {
      id,
      column: saved?.column ?? Math.floor(index / geometry.rows),
      row: saved?.row ?? index % geometry.rows,
      width: boundedInteger(saved?.width, 1, 1, geometry.columns),
      height: boundedInteger(saved?.height, 1, 1, geometry.rows),
      zIndex: boundedInteger(saved?.zIndex, 0, 0, 10000),
    };
    const position = nearestPlacement(entry, placed, geometry);
    if (position) placed.push(position);
  });
  return placed;
}

export function moveDesktopIcon(
  layout: readonly GridPlacement[],
  id: string,
  column: number,
  row: number,
  geometry: DesktopGridGeometry,
) {
  const current = layout.find((item) => item.id === id);
  if (!current) return null;
  const next = nearestPlacement(
    { ...current, column, row },
    layout.filter((item) => item.id !== id),
    geometry,
  );
  return next && layout.map((item) => (item.id === id ? next : item));
}
