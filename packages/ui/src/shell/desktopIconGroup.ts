import {
  desktopIconOverlaps,
  desktopIconRect,
  desktopPlacementStep,
  type DesktopGridGeometry,
} from './desktopIconPlacement';
import { nearestDesktopPoint, type DesktopPoint } from './desktopPlacementSearch';
import type { GridPlacement } from './gridPlacement';

/** 拖动开始时快照：整个组的边界，以及不随它移动的图标。 */
export function desktopIconGroup(
  layout: readonly GridPlacement[],
  ids: ReadonlySet<string>,
  geometry: DesktopGridGeometry,
) {
  const moving = layout.filter((item) => ids.has(item.id)).map((item) => desktopIconRect(item, geometry));
  const stationary = layout.filter((item) => !ids.has(item.id)).map((item) => desktopIconRect(item, geometry));
  const limits = {
    minX: -Math.min(...moving.map((item) => item.x)),
    minY: -Math.min(...moving.map((item) => item.y)),
    maxX: geometry.canvasWidth - Math.max(...moving.map((item) => item.x + item.width)),
    maxY: geometry.canvasHeight - Math.max(...moving.map((item) => item.y + item.height)),
  };
  return { ids, moving, stationary, limits };
}

export type DesktopIconGroup = ReturnType<typeof desktopIconGroup>;

/** 与原站 freeGroupOffset 一样寻找整组偏移，避免逐个图标吸附导致组内变形。 */
export function moveDesktopIconGroup(
  layout: readonly GridPlacement[],
  group: DesktopIconGroup,
  wanted: DesktopPoint,
  geometry: DesktopGridGeometry,
) {
  const offset = nearestDesktopPoint(
    wanted,
    group.limits,
    desktopPlacementStep(geometry),
    (x, y) =>
      !group.moving.some((item) =>
        group.stationary.some((other) => desktopIconOverlaps({ ...item, x: item.x + x, y: item.y + y }, other)),
      ),
  );
  if (!offset) return null;
  return layout.map((item) => {
    if (!group.ids.has(item.id)) return item;
    const { x, y } = desktopIconRect(item, geometry);
    return { ...item, column: (x + offset.x) / geometry.stepX, row: (y + offset.y) / geometry.stepY };
  });
}
