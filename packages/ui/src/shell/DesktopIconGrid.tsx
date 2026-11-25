import { useId, useRef, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useControllable } from '../foundation/useControllable';
import { AppIcon, type AppIconAppearance } from './AppIcon';
import { SelectionArea } from './SelectionArea';
import { useGridLayout, type GridLayoutOptions, type GridLayoutLabels } from './useGridLayout';
import { desktopIconPixels, type DesktopIconPlacementMode } from './desktopIconPlacement';
import { useDesktopIconWidth } from './useDesktopIconWidth';

export interface DesktopIconGridItem {
  id: string;
  label: string;
  app?: AppIconAppearance;
  unreadCount?: number;
  attention?: boolean;
  unreadLabel?: (count: number) => string;
  disabled?: boolean;
}
export interface DesktopIconGridProps
  extends Omit<ComponentProps<'section'>, 'children' | 'onSelect'>, GridLayoutOptions {
  label: string;
  items: readonly DesktopIconGridItem[];
  /** 网格对齐或沿用原桌面的 8px 微步摆放。 */
  placementMode?: DesktopIconPlacementMode;
  /** 自动紧凑排列，拖动图标或选中组调整顺序。 */
  autoArrange?: boolean;
  /** 补足最后一行下方的可用空间，不额外增加整行。 */
  minCanvasHeight?: number;
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  onOpen?: (item: DesktopIconGridItem) => void;
  onItemContextMenu?: (item: DesktopIconGridItem, point: { x: number; y: number }) => void;
  labels?: Partial<GridLayoutLabels>;
}
/** 网格位置和多选只返回受控数据，宿主负责账号隔离、保存与打开授权。 */
export function DesktopIconGrid({
  label,
  items,
  placementMode = 'grid',
  autoArrange = false,
  minCanvasHeight,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  onOpen,
  onItemContextMenu,
  layout,
  defaultLayout,
  onLayoutChange,
  columns,
  rows,
  rowHeight,
  disabled,
  labels: overrides,
  className,
  ...rest
}: DesktopIconGridProps) {
  const labels = useLabels('gridLayout', overrides);
  const [selected, setSelected] = useControllable<readonly string[]>(selectedIds, defaultSelectedIds, (next) =>
    onSelectionChange?.([...next]),
  );
  const root = useRef<HTMLDivElement>(null);
  const canvasWidth = useDesktopIconWidth(root);
  const iconSize = items.reduce((size, item) => Math.max(size, desktopIconPixels(item.app?.size)), 0) || 56;
  const blockedDoubleClick = useRef<string | null>(null);
  const instructions = useId();
  const byId = new Map(items.map((item) => [item.id, item]));
  const grid = useGridLayout(
    items,
    { layout, defaultLayout, onLayoutChange, columns, rows, rowHeight, disabled },
    root,
    false,
    labels,
    { placementMode, autoArrange, iconSize, canvasWidth, minCanvasHeight },
  );
  const select = (item: DesktopIconGridItem, additive: boolean) => {
    if (disabled || item.disabled) return;
    const retained = selected.filter((id) => !items.some((candidate) => candidate.id === id && !candidate.disabled));
    setSelected(
      additive
        ? selected.includes(item.id)
          ? selected.filter((id) => id !== item.id)
          : [...selected, item.id]
        : [...new Set([...retained, item.id])],
    );
  };
  return (
    <section {...rest} aria-label={label} className={cx('ds-desktop-grid', className)}>
      <p id={instructions} className="ds-visually-hidden">
        {labels.instructions}
      </p>
      <SelectionArea
        label={label}
        value={selected}
        onValueChange={setSelected}
        disabled={disabled}
        disabledIds={items.filter((item) => item.disabled).map((item) => item.id)}
      >
        {(previewIds) => (
          <div ref={root} className="ds-grid-canvas" style={{ height: grid.height }}>
            {grid.entries.map((entry) => {
              const item = byId.get(entry.id)!;
              const unavailable = disabled || item.disabled;
              const offset = grid.drag?.ids.has(item.id) ? grid.drag.offset : null;
              const style = grid.styleOf(entry);
              return (
                <div
                  key={item.id}
                  className="ds-grid-slot ds-grid-icon-slot"
                  style={
                    offset ? { ...style, transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: 10002 } : style
                  }
                  data-selection-id={item.id}
                  data-selection-disabled={unavailable || undefined}
                  // 指针释放可能生成 click / dblclick；拖动不应选中或打开图标。
                  onClickCapture={(event) => {
                    if (event.detail === 1) blockedDoubleClick.current = null;
                    if (event.detail > 0 && grid.wasDragged(item.id)) {
                      blockedDoubleClick.current = item.id;
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  onDoubleClickCapture={(event) => {
                    if (blockedDoubleClick.current === item.id || grid.wasDragged(item.id)) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                >
                  <AppIcon
                    {...item.app}
                    variant="desktop"
                    label={item.label}
                    size={desktopIconPixels(item.app?.size)}
                    className="ds-grid-icon"
                    unreadCount={item.unreadCount}
                    attention={item.attention}
                    unreadLabel={item.unreadLabel}
                    data-dragging={offset ? true : undefined}
                    selected={previewIds.includes(item.id)}
                    aria-disabled={unavailable || undefined}
                    aria-describedby={unavailable ? undefined : instructions}
                    aria-keyshortcuts={
                      unavailable ? undefined : `Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown${onItemContextMenu ? ' Shift+F10' : ''}`
                    }
                    tabIndex={unavailable ? -1 : 0}
                    onPointerDown={(event) => grid.pointerDown(event, item.id, item.label, selected)}
                    onClick={(event) => {
                      event.preventDefault();
                      select(item, event.ctrlKey || event.metaKey || event.shiftKey);
                    }}
                    onOpen={() => {
                      if (!unavailable) onOpen?.(item);
                    }}
                    onContextMenu={(event) => {
                      if (unavailable || !onItemContextMenu || event.defaultPrevented) return;
                      event.preventDefault();
                      event.stopPropagation();
                      event.currentTarget.focus({ preventScroll: true });
                      onItemContextMenu(item, { x: event.clientX, y: event.clientY });
                    }}
                    onKeyDown={(event) => {
                      if (unavailable) return;
                      if (onItemContextMenu && !event.nativeEvent.isComposing && !event.defaultPrevented
                        && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!event.repeat) {
                          const rect = event.currentTarget.getBoundingClientRect();
                          onItemContextMenu(item, { x: rect.right, y: rect.top });
                        }
                        return;
                      }
                      grid.keyDown(event, item.id, item.label);
                      if (event.key === ' ' && !event.repeat) {
                        event.preventDefault();
                        select(item, event.ctrlKey || event.metaKey || event.shiftKey);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </SelectionArea>
      <span className="ds-visually-hidden" role="status">
        {grid.message}
      </span>
      {grid.overflow > 0 && (
        <p className="ds-grid-overflow" role="status">
          {labels.overflow(grid.overflow)}
        </p>
      )}
    </section>
  );
}
