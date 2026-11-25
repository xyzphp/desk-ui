import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { useControllable } from '../foundation/useControllable';
import { usePointerGesture, type PointerPoint } from '../foundation/usePointerGesture';
import { gridBounds, movePlacement, normalizeLayout, type GridPlacement } from './gridPlacement';
import {
  desktopGridGeometry,
  desktopIconRect,
  moveDesktopIcon,
  normalizeDesktopIcons,
  reorderDesktopIcons,
  type DesktopIconLayoutOptions,
} from './desktopIconPlacement';
import { desktopIconGroup, moveDesktopIconGroup, type DesktopIconGroup } from './desktopIconGroup';
import { clampDesktopPoint } from './desktopPlacementSearch';

export interface GridLayoutLabels {
  move: (title: string) => string;
  position: (title: string, column: number, row: number) => string;
  pixelPosition: (title: string, x: number, y: number) => string;
  groupPosition: (count: number) => string;
  blocked: string;
  cancelled: string;
  instructions: string;
  front: string;
  overflow: (count: number) => string;
}
export interface GridLayoutOptions {
  layout?: readonly GridPlacement[];
  defaultLayout?: readonly GridPlacement[];
  onLayoutChange?: (layout: GridPlacement[]) => void;
  columns?: number;
  rows?: number;
  rowHeight?: number;
  disabled?: boolean;
}
interface DragSession {
  id: string;
  title: string;
  signature: string;
  start: PointerPoint;
  canvas: PointerPoint;
  column: number;
  row: number;
  cellWidth: number;
  canvasWidth: number;
  scrollLeft: number;
  scrollTop: number;
  group?: DesktopIconGroup;
}
const dragThreshold = 4;
/** 图标与卡片共用布局模型。拖动只修改预览，取消不触发宿主回调。 */
export function useGridLayout(
  items: readonly { id: string; disabled?: boolean }[],
  options: GridLayoutOptions,
  root: RefObject<HTMLElement | null>,
  overlap: boolean,
  labels: GridLayoutLabels,
  desktop?: DesktopIconLayoutOptions,
) {
  const { layout, defaultLayout = [], onLayoutChange, disabled } = options;
  const { columns, rows, rowHeight: requestedRowHeight } = options;
  const placementMode = desktop?.placementMode;
  const autoArrange = desktop?.autoArrange === true;
  const iconSize = desktop?.iconSize;
  const canvasWidth = desktop?.canvasWidth;
  const minCanvasHeight = desktop?.minCanvasHeight;
  const locked = new Set(items.filter((item) => item.disabled).map((item) => item.id));
  const geometry = useMemo(
    () =>
      placementMode &&
      desktopGridGeometry(
        { placementMode, iconSize: iconSize!, canvasWidth, minCanvasHeight },
        columns,
        rows,
        requestedRowHeight,
      ),
    [placementMode, iconSize, canvasWidth, minCanvasHeight, columns, rows, requestedRowHeight],
  );
  const bounds = useMemo(() => geometry ?? gridBounds(columns, rows), [geometry, columns, rows]);
  const rowHeight =
    geometry?.stepY ?? (Number.isFinite(requestedRowHeight) ? Math.max(80, Math.min(400, requestedRowHeight!)) : 112);
  const [source, setSource] = useControllable<readonly GridPlacement[]>(layout, defaultLayout, (next) =>
    onLayoutChange?.([...next]),
  );
  const entries = useMemo(() => {
    const ids = items.map((item) => item.id);
    if (geometry && autoArrange) {
      const allowed = new Set(ids);
      const ordered = [...new Set(source.map((entry) => entry.id).filter((id) => allowed.has(id)))];
      ids.forEach((id) => { if (!ordered.includes(id)) ordered.push(id); });
      return normalizeDesktopIcons(ordered, [], geometry);
    }
    return geometry ? normalizeDesktopIcons(ids, source, geometry) : normalizeLayout(ids, source, bounds, overlap);
  }, [items, source, geometry, bounds, overlap, autoArrange]);
  const layoutKey = JSON.stringify(entries);
  const signature = JSON.stringify([entries, [...locked], geometry]);
  const [preview, setPreview] = useState<GridPlacement | null>(null);
  const [drag, setDrag] = useState<{ ids: ReadonlySet<string>; offset: PointerPoint } | null>(null);
  const draggedId = useRef<string | undefined>(undefined);
  const [message, setMessage] = useState('');
  const validSession = (session: DragSession) =>
    session.signature === signature &&
    !disabled &&
    !!root.current &&
    Math.abs(root.current.clientWidth - session.canvasWidth) < 0.5;
  const offsetOf = (session: DragSession, point: PointerPoint) => {
    const rect = root.current?.getBoundingClientRect();
    return {
      x:
        point.x -
        session.start.x +
        session.canvas.x -
        (rect?.left ?? session.canvas.x) +
        (root.current?.scrollLeft ?? 0) -
        session.scrollLeft,
      y:
        point.y -
        session.start.y +
        session.canvas.y -
        (rect?.top ?? session.canvas.y) +
        (root.current?.scrollTop ?? 0) -
        session.scrollTop,
    };
  };
  const moveTo = (id: string, column: number, row: number) =>
    geometry
      ? moveDesktopIcon(entries, id, column, row, geometry)
      : movePlacement(entries, id, Math.round(column), Math.round(row), bounds, overlap);
  const candidate = (session: DragSession, offset: PointerPoint) => {
    if (geometry && autoArrange && session.group) {
      const moving = entries.filter((entry) => session.group!.ids.has(entry.id));
      const x = Math.min(...moving.map((entry) => entry.column)) + offset.x / geometry.stepX;
      const y = Math.min(...moving.map((entry) => entry.row)) + offset.y / geometry.stepY;
      return reorderDesktopIcons(entries, session.group.ids, x, y, geometry.rows);
    }
    if (geometry && session.group && session.group.ids.size > 1)
      return moveDesktopIconGroup(entries, session.group, offset, geometry);
    return moveTo(session.id, session.column + offset.x / session.cellWidth, session.row + offset.y / rowHeight);
  };
  const moved = (session: DragSession, point: PointerPoint) =>
    draggedId.current === session.id ||
    Math.hypot(point.x - session.start.x, point.y - session.start.y) >= dragThreshold;
  const commit = (next: GridPlacement[] | null, title: string, id: string, count = 1) => {
    if (!next) {
      setMessage(labels.blocked);
      return;
    }
    const entry = next.find((item) => item.id === id)!;
    const changed = JSON.stringify(next) !== layoutKey;
    if (changed) setSource(next);
    if (count > 1) {
      setMessage(changed ? labels.groupPosition(count) : '');
      return;
    }
    if (geometry?.mode === 'free') {
      const { x, y } = desktopIconRect(entry, geometry);
      setMessage(labels.pixelPosition(title, x, y));
    } else setMessage(labels.position(title, entry.column + 1, entry.row + 1));
  };
  const gesture = usePointerGesture<DragSession>({
    move: (session, point) => {
      if (!validSession(session)) {
        gesture.cancel();
        return;
      }
      if (geometry && !moved(session, point)) return;
      const offset = offsetOf(session, point);
      if (session.group) {
        draggedId.current = session.id;
        setDrag({
          ids: session.group.ids,
          offset: clampDesktopPoint(offset, session.group.limits),
        });
      } else {
        const next = candidate(session, offset);
        setPreview(next?.find((entry) => entry.id === session.id) ?? null);
        setMessage(next ? '' : labels.blocked);
      }
    },
    finish: (session, point) => {
      setPreview(null);
      setDrag(null);
      if (geometry && !moved(session, point)) return;
      if (geometry) draggedId.current = session.id;
      if (validSession(session))
        commit(candidate(session, offsetOf(session, point)), session.title, session.id, session.group?.ids.size);
    },
    cancel: () => {
      setPreview(null);
      setDrag(null);
      setMessage(labels.cancelled);
    },
  });
  const { cancel } = gesture;
  useEffect(() => {
    cancel();
  }, [signature, disabled, bounds.columns, bounds.rows, rowHeight, cancel]);
  function pointerDown(event: PointerEvent<HTMLElement>, id: string, title: string, selected: readonly string[] = []) {
    const entry = entries.find((item) => item.id === id);
    const element = root.current;
    if (!entry || !element || event.defaultPrevented || disabled || locked.has(id)) return;
    const canvasWidth = element.clientWidth;
    if (canvasWidth <= 0) return;
    const cellWidth = geometry?.stepX ?? canvasWidth / bounds.columns;
    const rect = element.getBoundingClientRect();
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const requested = new Set(additive || selected.includes(id) ? [...selected, id] : [id]);
    const dragIds = new Set(
      entries.filter((item) => requested.has(item.id) && !locked.has(item.id)).map((item) => item.id),
    );
    if (
      gesture.start(event, {
        id,
        title,
        signature,
        start: { x: event.clientX, y: event.clientY },
        canvas: { x: rect.left, y: rect.top },
        column: entry.column,
        row: entry.row,
        cellWidth,
        canvasWidth,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
        group: geometry && desktopIconGroup(entries, dragIds, geometry),
      })
    ) {
      event.stopPropagation();
      event.currentTarget.focus({ preventScroll: true });
      draggedId.current = undefined;
      if (geometry) setMessage('');
      else setPreview(entry);
    }
  }
  function keyDown(event: KeyboardEvent<HTMLElement>, id: string, title: string) {
    if (event.key === 'Escape') {
      if (gesture.cancel()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    if (!event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing || disabled) return;
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = directions[event.key];
    const entry = entries.find((item) => item.id === id);
    if (!delta || !entry || locked.has(id)) return;
    event.preventDefault();
    event.stopPropagation();
    gesture.cancel();
    commit(geometry && autoArrange
      ? reorderDesktopIcons(entries, new Set([id]), entry.column + delta[0], entry.row + delta[1], geometry.rows)
      : moveTo(id, entry.column + delta[0], entry.row + delta[1]), title, id);
  }
  function bringToFront(id: string) {
    if (disabled || locked.has(id) || !entries.some((entry) => entry.id === id)) return;
    gesture.cancel();
    const ordered = [...entries].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).filter((entry) => entry.id !== id);
    ordered.push(entries.find((entry) => entry.id === id)!);
    const ranks = new Map(ordered.map((entry, index) => [entry.id, index]));
    const next = entries.map((entry) => ({ ...entry, zIndex: ranks.get(entry.id)! }));
    if (JSON.stringify(next) !== layoutKey) setSource(next);
  }
  const styleOf = (entry: GridPlacement): CSSProperties => {
    if (geometry) {
      const { x, y, width, height } = desktopIconRect(entry, geometry);
      return { left: x, top: y, width, height, zIndex: entry.zIndex };
    }
    return {
      left: `${(entry.column / bounds.columns) * 100}%`,
      top: entry.row * rowHeight,
      width: `${((entry.width ?? 1) / bounds.columns) * 100}%`,
      height: (entry.height ?? 1) * rowHeight,
      zIndex: entry.zIndex,
    };
  };
  return {
    entries,
    preview,
    drag,
    wasDragged: (id: string) => draggedId.current === id,
    message,
    pointerDown,
    keyDown,
    bringToFront,
    styleOf,
    height: geometry?.canvasHeight ?? bounds.rows * rowHeight,
    overflow: items.length - entries.length,
  };
}
