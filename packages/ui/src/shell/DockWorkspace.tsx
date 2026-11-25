import { useId, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Button, IconButton } from '../primitives/Button';
import { useLabels } from '../foundation/ConfigProvider';
import { useControllable } from '../foundation/useControllable';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { SortableList } from '../layout/SortableList';
import { AppIcon, type AppIconAppearance } from './AppIcon';
import { Dock, DockItem, DockSeparator } from './Dock';
import { WindowSwitcher, type WindowSwitcherItem } from './WindowSwitcher';

export interface DockWorkspaceItem {
  id: string;
  label: string;
  app?: AppIconAppearance;
  windows?: readonly WindowSwitcherItem[];
  running?: boolean;
  disabled?: boolean;
}
export interface DockWorkspaceLabels {
  reorder: string;
  done: string;
  preview: (label: string) => string;
}
export interface DockWorkspaceProps extends Omit<ComponentProps<'section'>, 'children'> {
  label: string;
  items: readonly DockWorkspaceItem[];
  order?: readonly string[];
  defaultOrder?: readonly string[];
  onOrderChange?: (ids: string[]) => void;
  onLaunch?: (item: DockWorkspaceItem) => void;
  onActivateWindow: (window: WindowSwitcherItem, app: DockWorkspaceItem) => void;
  currentWindowId?: string;
  disabled?: boolean;
  hidden?: boolean;
  labels?: Partial<DockWorkspaceLabels>;
}
function WorkspaceItem({
  item,
  open,
  onOpenChange,
  onLaunch,
  onActivateWindow,
  currentWindowId,
  disabled,
  label,
}: { item: DockWorkspaceItem; open: boolean; onOpenChange: (open: boolean) => void; label: string } & Pick<
  DockWorkspaceProps,
  'onLaunch' | 'onActivateWindow' | 'currentWindowId' | 'disabled'
>) {
  const anchor = useRef<HTMLDivElement>(null);
  const windows = item.windows ?? [];
  return (
    <>
      <DockItem
        ref={anchor}
        label={item.label}
        running={item.running ?? windows.length > 0}
        disabled={disabled || item.disabled}
        aria-haspopup={windows.length ? 'dialog' : undefined}
        aria-expanded={windows.length ? open : undefined}
        onActivate={() => {
          if (windows.length) onOpenChange(!open);
          else onLaunch?.(item);
        }}
      >
        <AppIcon {...item.app} />
      </DockItem>
      <AnchorPopover
        open={open && !disabled && !item.disabled && windows.length > 0}
        anchor={anchor}
        onClose={() => onOpenChange(false)}
        placement="top"
        role="dialog"
        aria-label={label}
        className="ds-dock-window-preview"
        initialFocus="first"
      >
        <WindowSwitcher
          label={label}
          items={windows}
          currentId={currentWindowId}
          onCancel={() => onOpenChange(false)}
          onActivate={(window) => {
            onActivateWindow(window, item);
            onOpenChange(false);
          }}
        />
      </AnchorPopover>
    </>
  );
}
/** Dock 外观、窗口目录与排序区的组合；启动、恢复窗口与保存顺序由宿主执行。 */
export function DockWorkspace({
  label,
  items,
  order,
  defaultOrder = [],
  onOrderChange,
  onLaunch,
  onActivateWindow,
  currentWindowId,
  disabled,
  hidden,
  labels: overrides,
  className,
  ...rest
}: DockWorkspaceProps) {
  const labels = useLabels('dockWorkspace', overrides);
  const [source, setSource] = useControllable<readonly string[]>(order, defaultOrder, (next) =>
    onOrderChange?.([...next]),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [sorting, setSorting] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const sortId = useId();
  const closeSorting = () => {
    setSorting(false);
    toggle.current?.focus({ preventScroll: true });
  };
  const byId = new Map(items.map((item) => [item.id, item]));
  const ids = [...new Set([...source, ...byId.keys()])].filter((id) => byId.has(id));
  const ordered = ids.map((id) => byId.get(id)!);
  return (
    <section {...rest} aria-label={label} className={cx('ds-dock-workspace', className)} hidden={hidden}>
      {sorting && !hidden && (
        <div
          id={sortId}
          className="ds-dock-sort-panel"
          role="region"
          aria-label={labels.reorder}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !event.defaultPrevented && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.stopPropagation();
              closeSorting();
            }
          }}
        >
          <div className="ds-dock-sort-heading">
            <strong>{labels.reorder}</strong>
            <Button size="sm" onClick={closeSorting}>
              {labels.done}
            </Button>
          </div>
          <SortableList
            label={labels.reorder}
            orientation="horizontal"
            disabled={disabled}
            items={ordered.map((item) => ({
              id: item.id,
              label: item.label,
              disabled: item.disabled,
              icon: item.app?.icon,
            }))}
            onOrderChange={(next) => setSource([...source.filter((id) => !ids.includes(id)), ...next])}
          />
        </div>
      )}
      <Dock aria-label={label}>
        {ordered.map((item) => (
          <WorkspaceItem
            key={item.id}
            item={item}
            open={!hidden && !sorting && openId === item.id}
            onOpenChange={(open) => setOpenId(open ? item.id : null)}
            label={labels.preview(item.label)}
            disabled={disabled}
            currentWindowId={currentWindowId}
            onLaunch={onLaunch}
            onActivateWindow={onActivateWindow}
          />
        ))}
        <DockSeparator />
        <IconButton
          ref={toggle}
          icon="grip-vertical"
          disabled={disabled}
          aria-expanded={sorting}
          aria-controls={sorting ? sortId : undefined}
          label={labels.reorder}
          onClick={() => {
            setOpenId(null);
            setSorting(!sorting);
          }}
        />
      </Dock>
    </section>
  );
}
