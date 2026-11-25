import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon } from '../foundation/Icon';
import type { AdminSidebarLabels, LabelOverrides, PageTabsLabels } from '../foundation/locale';
import { ContextMenu, ContextMenuDivider, ContextMenuItem } from './ContextMenu';

const CollapsedContext = createContext(false);

export interface AdminLayoutProps extends ComponentProps<'div'> {
  /** 左侧菜单，通常是 AdminSidebar。 */
  sidebar: ReactNode;
  /** 内容区顶部，通常是 AdminHeader 与 PageTabs。 */
  header?: ReactNode;
}

/** 管理后台外框：左侧菜单 + 右侧（页签栏 + 内容区）。铺满所在的定位容器。 */
export function AdminLayout({ sidebar, header, className, children, ...rest }: AdminLayoutProps) {
  return (
    <div {...rest} className={cx('ds-admin', className)}>
      {sidebar}
      <div className="ds-admin-main">
        {header}
        <div className="ds-admin-content">{children}</div>
      </div>
    </div>
  );
}

export interface AdminHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
  /** 左侧标题，通常是当前页面名称。 */
  title?: ReactNode;
  /** 标题前的内容，例如返回或折叠按钮。 */
  start?: ReactNode;
  /** 右侧操作区，例如模式切换、通知与账号菜单。 */
  end?: ReactNode;
}

/** 管理后台顶栏：左侧标题，中间可放自定义内容，右侧操作区。 */
export function AdminHeader({ title, start, end, className, children, ...rest }: AdminHeaderProps) {
  return (
    <header {...rest} className={cx('ds-admin-header', className)}>
      {start}
      {title != null && <div className="ds-admin-header-title">{title}</div>}
      <div className="ds-admin-header-center">{children}</div>
      {end != null && <div className="ds-admin-header-end">{end}</div>}
    </header>
  );
}

export interface AdminSidebarProps extends Omit<ComponentProps<'nav'>, 'title'> {
  /** 顶部品牌区；收起时保留第一个子元素（通常是 logo），其余子元素与纯文字标题隐藏。 */
  title?: ReactNode;
  /** 品牌栏内的附加操作；列表收起时悬停 Logo 或聚焦操作按钮才显示。 */
  actions?: ReactNode;
  /** list：图标与名称同行；rail：图标在上、名称在下且固定宽度的图标栏。 */
  variant?: 'list' | 'rail';
  /** list 的纵向密度；rail 忽略此值。 */
  density?: 'comfortable' | 'compact';
  collapsed?: boolean;
  /** 菜单下方显示的附加内容。 */
  footer?: ReactNode;
  labels?: LabelOverrides<Pick<AdminSidebarLabels, 'navigation'>>;
}

/** 管理后台左侧应用菜单；list 可收起并调整密度，rail 是固定宽度的图标栏，不支持折叠。 */
export function AdminSidebar({
  title,
  actions,
  variant = 'list',
  density = 'comfortable',
  collapsed = false,
  footer,
  labels: overrides,
  className,
  children,
  ...rest
}: AdminSidebarProps) {
  const labels = useLabels('adminSidebar', overrides);
  const isCollapsed = variant !== 'rail' && collapsed;
  return (
    <nav
      aria-label={labels.navigation}
      {...rest}
      className={cx('ds-admin-sidebar', className)}
      data-variant={variant}
      data-density={variant === 'list' ? density : undefined}
      data-collapsed={isCollapsed || undefined}
    >
      {(title != null || actions != null) && (
        <div className="ds-admin-sidebar-title">
          {title != null && (
            <div className="ds-admin-sidebar-brand">
              {typeof title === 'string' || typeof title === 'number' ? (
                <span className="ds-admin-sidebar-title-text">{title}</span>
              ) : (
                title
              )}
            </div>
          )}
          {actions != null && <div className="ds-admin-sidebar-actions">{actions}</div>}
        </div>
      )}
      <div className="ds-admin-menu ds-scrollable">
        <CollapsedContext value={isCollapsed}>{children}</CollapsedContext>
      </div>
      {footer && <div className="ds-admin-sidebar-footer">{footer}</div>}
    </nav>
  );
}

export interface AdminMenuGroupProps extends Omit<ComponentProps<'div'>, 'role'> {
  label: string;
}

/** 菜单分组；收起时分组名退化为分隔线，读屏仍可读到分组名。 */
export function AdminMenuGroup({ label, className, children, ...rest }: AdminMenuGroupProps) {
  return (
    <div {...rest} className={cx('ds-admin-menu-group', className)} role="group" aria-label={label}>
      <div className="ds-admin-menu-label" aria-hidden="true">
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

export interface AdminMenuItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** 图标节点，通常是 AppIcon 或 Icon。 */
  icon?: ReactNode;
  label: string;
  /** 当前页，渲染为 aria-current="page"。 */
  current?: boolean;
  /** 已打开但不是当前页，显示一个小圆点。 */
  open?: boolean;
  /** 右侧角标，例如未读数；收起时浮在图标右上角。 */
  badge?: ReactNode;
}

/** 菜单项：图标 + 名称 + 角标。收起时只显示图标，名称作为悬停提示保留。 */
export function AdminMenuItem({
  icon,
  label,
  current,
  open,
  badge,
  className,
  type = 'button',
  ...rest
}: AdminMenuItemProps) {
  const collapsed = useContext(CollapsedContext);
  return (
    <button
      type={type}
      title={collapsed ? label : undefined}
      {...rest}
      aria-current={current ? 'page' : undefined}
      data-open={open || undefined}
      className={cx('ds-admin-menu-item', className)}
    >
      {icon && (
        <span className="ds-admin-menu-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ds-admin-menu-text">{label}</span>
      {badge != null && badge !== false && <span className="ds-admin-menu-badge">{badge}</span>}
    </button>
  );
}

export interface PageTab {
  id: string;
  label: string;
  icon?: ReactNode;
  /** 默认可关闭（需同时提供 onClose）；固定页签设为 false。 */
  closable?: boolean;
}

export interface PageTabsProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  items: readonly PageTab[];
  /** 当前页签 id；没有匹配项时所有页签都未选中。 */
  value?: string;
  onChange?: (id: string) => void;
  onClose?: (id: string) => void;
  /** 页签栏右侧的附加操作。 */
  extra?: ReactNode;
  /** 页签控制的内容区 id，写入 aria-controls。 */
  panelId?: string;
  /** 提供后页签可拖拽排序（也可用 Ctrl + Shift + ← / → 移动当前页签）；参数是排序后的全部页签 id。 */
  onReorder?: (ids: string[]) => void;
  /** 提供后右键菜单显示“刷新”。 */
  onRefresh?: (id: string) => void;
  /** 提供后右键菜单显示“关闭其他”；调用方负责只关闭可关闭的其他页签。 */
  onCloseOthers?: (id: string) => void;
  /** 提供后右键菜单显示“关闭所有”；调用方负责只关闭可关闭的页签。 */
  onCloseAll?: () => void;
  labels?: LabelOverrides<PageTabsLabels>;
}

/** 可关闭的页面页签栏：每个打开的页面一个页签，超出时横向滚动。 */
export function PageTabs({
  items,
  value,
  onChange,
  onClose,
  extra,
  panelId,
  onReorder,
  onRefresh,
  onCloseOthers,
  onCloseAll,
  labels: overrides,
  className,
  ...rest
}: PageTabsProps) {
  const labels = useLabels('pageTabs', overrides);
  const list = useRef<HTMLDivElement>(null);
  const selected = items.some((item) => item.id === value) ? value : undefined;
  const tabStop = selected ?? items[0]?.id;
  const [menu, setMenu] = useState<{ id: string; x: number; y: number }>();
  const [dragId, setDragId] = useState<string>();
  const [drop, setDrop] = useState<{ id: string; after: boolean }>();
  const hasMenu = !!(onClose || onRefresh || onCloseOthers || onCloseAll);
  const closable = (item: PageTab) => !!onClose && item.closable !== false;

  const reorder = (id: string, targetId: string, after: boolean) => {
    if (!onReorder || id === targetId) return;
    const ids = items.map((item) => item.id).filter((itemId) => itemId !== id);
    const at = ids.indexOf(targetId);
    if (at < 0) return;
    ids.splice(after ? at + 1 : at, 0, id);
    onReorder(ids);
  };
  const clearDrag = () => {
    setDragId(undefined);
    setDrop(undefined);
  };
  const onDragOver = (event: DragEvent<HTMLElement>, id: string) => {
    if (!dragId || dragId === id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;
    setDrop((current) => (current?.id === id && current.after === after ? current : { id, after }));
  };
  const openMenu = (event: MouseEvent<HTMLElement>, id: string) => {
    if (!hasMenu) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const keyboard = event.clientX === 0 && event.clientY === 0;
    setMenu({ id, x: keyboard ? rect.left : event.clientX, y: keyboard ? rect.bottom : event.clientY });
  };

  useEffect(() => {
    const tab = list.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (typeof tab?.scrollIntoView === 'function') tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected, items.length]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (onReorder && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
      const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      const from = items.findIndex(
        (item) => item.id === (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]')?.dataset.tabId,
      );
      const target = items[from + step];
      if (step && from >= 0 && target) {
        event.preventDefault();
        reorder(items[from]!.id, target.id, step > 0);
      }
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tab = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    const index = items.findIndex((item) => item.id === tab?.dataset.tabId);
    if (index < 0) return;
    const current = items[index]!;
    if (event.key === 'Delete') {
      if (!onClose || current.closable === false) return;
      event.preventDefault();
      onClose(current.id);
      return;
    }
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % items.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + items.length) % items.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : -1;
    if (next < 0 || next === index) return;
    event.preventDefault();
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
    onChange?.(items[next]!.id);
  };

  return (
    <div {...rest} className={cx('ds-page-tabs', className)}>
      <div
        ref={list}
        className="ds-page-tabs-list ds-scrollable"
        role="tablist"
        aria-label={labels.label}
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const canClose = closable(item);
          const current = item.id === selected;
          return (
            <div
              key={item.id}
              className="ds-page-tab"
              role="presentation"
              data-selected={current || undefined}
              data-dragging={dragId === item.id || undefined}
              data-drop={drop?.id === item.id ? (drop.after ? 'after' : 'before') : undefined}
              draggable={!!onReorder}
              onContextMenu={(event) => openMenu(event, item.id)}
              onDragStart={(event) => {
                if (!onReorder) return;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id);
                setDragId(item.id);
              }}
              onDragOver={(event) => onDragOver(event, item.id)}
              onDrop={(event) => {
                if (!dragId || !drop || drop.id !== item.id) return;
                event.preventDefault();
                reorder(dragId, item.id, drop.after);
                clearDrag();
              }}
              onDragEnd={clearDrag}
            >
              <button
                type="button"
                role="tab"
                className="ds-page-tab-button"
                data-tab-id={item.id}
                aria-selected={current}
                aria-controls={current ? panelId : undefined}
                aria-keyshortcuts={canClose ? 'Delete' : undefined}
                tabIndex={item.id === tabStop ? 0 : -1}
                onClick={() => onChange?.(item.id)}
                onAuxClick={(event) => {
                  if (event.button !== 1 || !canClose) return;
                  event.preventDefault();
                  onClose?.(item.id);
                }}
              >
                {item.icon && (
                  <span className="ds-page-tab-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="ds-page-tab-text">{item.label}</span>
              </button>
              {canClose && (
                <button
                  type="button"
                  className="ds-page-tab-close"
                  tabIndex={-1}
                  aria-label={labels.close(item.label)}
                  title={labels.close(item.label)}
                  onClick={() => onClose?.(item.id)}
                >
                  <Icon name="x" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {extra && <div className="ds-page-tabs-extra">{extra}</div>}
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} aria-label={labels.menu} onClose={() => setMenu(undefined)}>
          {onRefresh && (
            <ContextMenuItem
              icon="rotate-ccw"
              onClick={() => {
                setMenu(undefined);
                onRefresh(menu.id);
              }}
            >
              {labels.refresh}
            </ContextMenuItem>
          )}
          {onRefresh && (onClose || onCloseOthers || onCloseAll) && <ContextMenuDivider />}
          {onClose && (
            <ContextMenuItem
              icon="x"
              disabled={!items.some((item) => item.id === menu.id && closable(item))}
              onClick={() => {
                setMenu(undefined);
                onClose(menu.id);
              }}
            >
              {labels.closeTab}
            </ContextMenuItem>
          )}
          {onCloseOthers && (
            <ContextMenuItem
              disabled={!items.some((item) => item.id !== menu.id && closable(item))}
              onClick={() => {
                setMenu(undefined);
                onCloseOthers(menu.id);
              }}
            >
              {labels.closeOthers}
            </ContextMenuItem>
          )}
          {onCloseAll && (
            <ContextMenuItem
              disabled={!items.some(closable)}
              onClick={() => {
                setMenu(undefined);
                onCloseAll();
              }}
            >
              {labels.closeAll}
            </ContextMenuItem>
          )}
        </ContextMenu>
      )}
    </div>
  );
}
