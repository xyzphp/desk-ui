import { useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import type { IconName } from '../foundation/Icon';
import { IconButton } from '../primitives/Button';
import { DesktopCard, type DesktopCardAction } from './DesktopCard';
import { useGridLayout, type GridLayoutOptions, type GridLayoutLabels } from './useGridLayout';

export interface WidgetLayoutItem {
  id: string;
  title: string;
  icon?: IconName;
  content: ReactNode;
  actions?: readonly DesktopCardAction[];
  disabled?: boolean;
}
export interface WidgetLayoutProps extends Omit<ComponentProps<'section'>, 'children'>, GridLayoutOptions {
  label: string;
  items: readonly WidgetLayoutItem[];
  labels?: Partial<GridLayoutLabels>;
}
/** 小组件网格、拖动与层级；重排不重建内容，不负责内容或布局的持久化。 */
export function WidgetLayout({
  label,
  items,
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
}: WidgetLayoutProps) {
  const labels = useLabels('gridLayout', overrides);
  const root = useRef<HTMLDivElement>(null);
  const byId = new Map(items.map((item) => [item.id, item]));
  const grid = useGridLayout(
    items,
    { layout, defaultLayout, onLayoutChange, columns, rows, rowHeight, disabled },
    root,
    true,
    labels,
  );
  return (
    <section {...rest} aria-label={label} className={cx('ds-widget-layout', className)}>
      <p className="ds-sr-only">{labels.instructions}</p>
      <div ref={root} className="ds-grid-canvas" style={{ height: grid.height }}>
        {grid.entries.map((entry) => {
          const item = byId.get(entry.id)!;
          const unavailable = disabled || item.disabled;
          return (
            <div key={item.id} className="ds-grid-slot ds-grid-widget-slot" style={grid.styleOf(entry)}>
              <DesktopCard
                title={item.title}
                icon={item.icon}
                collapsible={false}
                dragHandle={
                  <IconButton
                    icon="grip-vertical"
                    className="ds-grid-handle"
                    label={labels.move(item.title)}
                    disabled={unavailable}
                    onPointerDown={(event) => grid.pointerDown(event, item.id, item.title)}
                    onKeyDown={(event) => grid.keyDown(event, item.id, item.title)}
                  />
                }
                actions={[
                  {
                    id: 'layout-front',
                    label: labels.front,
                    icon: 'layers',
                    disabled: unavailable,
                    onClick: () => grid.bringToFront(item.id),
                  },
                  ...(item.actions ?? []),
                ]}
              >
                {item.content}
              </DesktopCard>
            </div>
          );
        })}
        {grid.preview && <div className="ds-grid-ghost" aria-hidden="true" style={grid.styleOf(grid.preview)} />}
      </div>
      <span className="ds-sr-only" role="status">
        {grid.message}
      </span>
    </section>
  );
}
