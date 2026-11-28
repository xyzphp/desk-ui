import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { HelpTip } from '../primitives/Feedback';

/** 应用窗口内的"左侧导航 + 右侧内容"外框，对应系统设置的 .ui.settings-app。 */
export function AppLayout({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-app', 'ds-scrollable', className)} {...rest} />;
}

/** 右侧内容列，提供容器查询上下文。 */
export function AppMain({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-app-main', className)} {...rest} />;
}

export interface SettingsRowProps extends Omit<ComponentProps<'div'>, 'role' | 'aria-labelledby'> {
  label: string;
  /** 标签旁的问号悬停提示，用于收起长段说明以保持设置行紧凑。 */
  tip?: string;
  layout?: 'inline' | 'stacked';
  /** 堆叠布局中与标签同一行的操作。 */
  actions?: ReactNode;
}

/** 系统设置的独立选项面板，来源于 apps.css 的 .row。 */
export function SettingsRow({
  label,
  tip,
  layout = 'inline',
  actions,
  children,
  className,
  ...rest
}: SettingsRowProps) {
  const id = useId();
  const stacked = layout === 'stacked';
  const title = <span id={id}>{label}</span>;
  return (
    <div {...rest} className={cx('ds-settings-row', className)} data-layout={layout} role="group" aria-labelledby={id}>
      <div className="ds-settings-row-head">
        {tip ? (
          <div className="ds-settings-row-label">
            {title}
            <HelpTip text={tip} />
          </div>
        ) : (
          title
        )}
        <div className="ds-settings-row-actions">{stacked ? actions : children}</div>
      </div>
      {stacked && children}
    </div>
  );
}

export interface NavSidebarProps extends Omit<ComponentProps<'nav'>, 'title'> {
  /** 外层语义；侧栏内部还有分组 nav 时使用 aside。 */
  as?: 'nav' | 'aside';
  title?: ReactNode;
  /** 固定在侧栏底部的区域（如设置入口），主体内容改为内部滚动。 */
  footer?: ReactNode;
}

/** 应用左侧导航栏：标题、分组标签与导航项。 */
export function NavSidebar({ as: Element = 'nav', title, className, children, footer, ...rest }: NavSidebarProps) {
  return (
    <Element className={cx('ds-nav', footer != null && 'has-footer', className)} {...rest}>
      {title && <h5 className="ds-nav-title">{title}</h5>}
      {footer != null ? (
        <>
          <div className="ds-nav-body">{children}</div>
          <div className="ds-nav-footer">{footer}</div>
        </>
      ) : (
        children
      )}
    </Element>
  );
}

export function NavGroupLabel({ className, ...rest }: ComponentProps<'h5'>) {
  return <h5 className={cx('ds-nav-label', className)} {...rest} />;
}

export interface NavItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon?: IconName;
  /** 当前页，渲染为 aria-current="page"。 */
  current?: boolean;
  children: ReactNode;
}

/** 导航项：左侧小图标块 + 文字，当前项为浅色强调背景。 */
export function NavItem({ icon, current, className, children, type = 'button', ...rest }: NavItemProps) {
  return (
    <button type={type} aria-current={current ? 'page' : undefined} className={cx('ds-nav-item', className)} {...rest}>
      {icon && (
        <span className="ds-nav-glyph">
          <Icon name={icon} />
        </span>
      )}
      {children}
    </button>
  );
}
