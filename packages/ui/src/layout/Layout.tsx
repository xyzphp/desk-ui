import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon, type IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { IconButton } from '../primitives/Button';

export interface PanelProps extends Omit<ComponentProps<'section'>, 'title'> {
  title?: ReactNode;
  /** 去掉内边距，用于内嵌表格 / 列表。 */
  flush?: boolean;
  muted?: boolean;
}

/** 带边框的内容面板。对应 .workspace-panel；多个面板纵向排布由外层 gap 控制。 */
export function Panel({ title, flush, muted, className, children, ...rest }: PanelProps) {
  return (
    <section className={cx('ds-panel', flush && 'ds-panel--flush', muted && 'ds-panel--muted', className)} {...rest}>
      {title && <h3 className="ds-panel-title">{title}</h3>}
      {children}
    </section>
  );
}

export interface ToolbarProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
}

/** 页面顶部操作栏：左侧标题，右侧操作。 */
export function Toolbar({ title, className, children, ...rest }: ToolbarProps) {
  return (
    <div className={cx('ds-toolbar', className)} {...rest}>
      {title && <h2 className="ds-toolbar-title">{title}</h2>}
      {children}
    </div>
  );
}

/** 操作按钮组，自动换行。 */
export function ToolbarActions({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-toolbar-actions', className)} {...rest} />;
}

export interface SplitLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 侧栏内容，通常是 <Sidebar>。 */
  sidebar: ReactNode;
  children: ReactNode;
}

/** 侧栏 + 主区两栏布局，按容器宽度折叠（800px / 600px 断点沿用原生页面）。 */
export function SplitLayout({ sidebar, children, className, ...rest }: SplitLayoutProps) {
  return (
    <div className={cx('ds-split', className)} {...rest}>
      {sidebar}
      <div className="ds-split-main">{children}</div>
    </div>
  );
}

export interface SidebarProps extends Omit<ComponentProps<'aside'>, 'title'> {
  title?: ReactNode;
  count?: number;
  /** 标题行右侧的操作，如新增按钮。 */
  actions?: ReactNode;
  /** 标题下方、列表上方的区域，通常放搜索框。 */
  search?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ title, count, actions, search, footer, className, children, ...rest }: SidebarProps) {
  return (
    <aside className={cx('ds-sidebar', className)} {...rest}>
      {(title != null || count !== undefined || actions != null) && (
        <div className="ds-sidebar-head">
          {title != null && <strong className="ds-sidebar-title">{title}</strong>}
          {count !== undefined && <span className="ds-count">{count}</span>}
          {actions && <div className="ds-sidebar-actions">{actions}</div>}
        </div>
      )}
      {search}
      <div className="ds-sidebar-body">{children}</div>
      {footer && <div className="ds-sidebar-footer">{footer}</div>}
    </aside>
  );
}

export interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** 无障碍名称，缺省使用 placeholder。 */
  label?: string;
  showIcon?: boolean;
  /** pill 为开始菜单 / 桌面导航的沉浸式搜索条形态：40px 全圆角、半透明面板底。 */
  variant?: 'default' | 'pill';
}

/** 侧栏搜索框：图标 + 无边框输入，聚焦时整体变深边框。 */
export function SearchField({ label, showIcon = true, variant = 'default', className, ...rest }: SearchFieldProps) {
  const labels = useLabels('searchField');
  return (
    <div className={cx('ds-search', variant === 'pill' && 'ds-search--pill', className)}>
      {showIcon && <Icon name="search" />}
      <input className="ds-control-input" type="search" aria-label={label ?? rest.placeholder ?? labels.search} {...rest} />
    </div>
  );
}

export type ListDensity = 'default' | 'roomy' | 'dense';

export interface ListProps extends ComponentProps<'ul'> {
  density?: ListDensity;
}

/** 列表容器。子项用 ListItem，分组用 ListGroup。 */
export function List({ density = 'default', className, ...rest }: ListProps) {
  return <ul className={cx('ds-list', density !== 'default' && `ds-list--${density}`, className)} {...rest} />;
}

export interface ListGroupProps extends Omit<ComponentProps<'li'>, 'title'> {
  title: ReactNode;
}

export function ListGroup({ title, className, children, ...rest }: ListGroupProps) {
  return (
    <li className={cx('ds-list-group', className)} {...rest}>
      <p className="ds-list-group-title">{title}</p>
      <ul className="ds-list ds-list--nested">{children}</ul>
    </li>
  );
}

export interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  /** Avatar or other leading content; replaces the default icon. */
  leading?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** 是否在选中时显示勾选标记，默认显示。 */
  showSelectionMark?: boolean;
  /** 右侧附加内容，如状态标签。 */
  trailing?: ReactNode;
  onSelect?: () => void;
}

/** 列表项。选中态：浅色强调背景 + 强调色标题 + 勾选标记，与项目管理页一致。 */
export function ListItem({ title, subtitle, icon, leading, selected, disabled, showSelectionMark = true, trailing, onSelect }: ListItemProps) {
  const showCheck = selected && showSelectionMark;
  return (
    <li>
      <button type="button" className="ds-list-item" aria-pressed={selected ?? false} disabled={disabled} onClick={onSelect}>
        {leading ?? (icon && <span className="ds-list-icon"><Icon name={icon} /></span>)}
        <span className="ds-list-text">
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
        {(trailing || showCheck) && (
          <span className="ds-list-trailing">
            {trailing}
            {showCheck && <Icon name="check" />}
          </span>
        )}
      </button>
    </li>
  );
}

/** 主区可滚动的文档容器（内边距 24 / 28px）。 */
export function DocumentPane({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-document', className)} {...rest} />;
}

/** 文档大标题。 */
export function Title({ className, ...rest }: ComponentProps<'h1'>) {
  return <h1 className={cx('ds-title', className)} {...rest} />;
}

/** 标题下的说明文字。 */
export function Lead({ className, ...rest }: ComponentProps<'p'>) {
  return <p className={cx('ds-lead', className)} {...rest} />;
}

export interface PropertySheetProps extends ComponentProps<'div'> {
  /** compact：只读信息的紧凑行，名称列按最长名称对齐，用于侧栏信息面板。 */
  density?: 'default' | 'compact';
}

export function PropertySheet({ density = 'default', className, ...rest }: PropertySheetProps) {
  return <div className={cx('ds-property-sheet', density === 'compact' && 'ds-property-sheet--compact', className)} {...rest} />;
}

export interface PropertyProps extends Omit<ComponentProps<'div'>, 'children'> {
  label: ReactNode;
  children: ReactNode;
}

/** 属性行：左侧名称，右侧控件。窄容器下上下排布。 */
export function Property({ label, children, className, ...rest }: PropertyProps) {
  return (
    <div className={cx('ds-property', className)} {...rest}>
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

/** 侧栏标题行常用的"新增"图标按钮，免去重复书写。 */
export function SidebarAddButton({ label, onClick }: { label?: string; onClick?: () => void }) {
  const labels = useLabels('sidebar');
  return <IconButton icon="plus" label={label ?? labels.add} variant="quiet" onClick={onClick} />;
}

export interface DisclosureProps extends Omit<ComponentProps<'div'>, 'title' | 'children'> {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** 就地展开次级配置，折叠只隐藏内容，不卸载草稿。对应 .ai-more / .workshop-cell-details。 */
export function Disclosure({
  title, children, open, defaultOpen = false, onOpenChange, disabled, className, ...rest
}: DisclosureProps) {
  const id = useId();
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded && content.current?.contains(content.current.ownerDocument.activeElement)) trigger.current?.focus();
  }, [expanded]);

  return (
    <div className={cx('ds-disclosure', className)} {...rest}>
      <button
        ref={trigger}
        type="button"
        id={`${id}-trigger`}
        className="ds-disclosure-trigger"
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        disabled={disabled}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} />
        <span>{title}</span>
      </button>
      <div
        ref={content}
        id={`${id}-content`}
        className="ds-disclosure-content"
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
}
