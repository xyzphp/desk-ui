import { useRef, type ComponentProps, type RefObject } from 'react';
import { cx } from '../foundation/cx';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { useMenuKeyboard } from '../foundation/useMenuKeyboard';
import { Icon, type IconName } from '../foundation/Icon';
import { AppIcon, type AppIconGraphicProps } from './AppIcon';

export interface PopoverProps extends Omit<ComponentProps<'div'>, 'role'> {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  /** 水平停靠：左（系统菜单）或右（控制中心、日历）。 */
  align?: 'left' | 'right';
  initialFocus?: 'first' | 'last';
  variant?: 'menu' | 'system' | 'control' | 'calendar';
  /** 外部点击、焦点离开、Esc 或选择动作时回调。 */
  onClose?: () => void;
}

/** 菜单栏弹层：系统菜单、控制中心、日历共用的毛玻璃面板。 */
export function Popover({
  open, anchor, align = 'left', initialFocus, variant = 'menu', onClose, className, children, onKeyDown, onClick, onMouseMove, ...rest
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const keyboard = useMenuKeyboard(ref, onClose, anchor);
  const menu = variant === 'menu' || variant === 'system';
  return (
    <AnchorPopover
      {...rest} open={open} anchor={anchor} onClose={onClose}
      placement={align === 'right' ? 'bottom-end' : 'bottom-start'} ref={ref} initialFocus={initialFocus} gap={variant === 'system' ? 4 : undefined}
      role={menu ? 'menu' : 'dialog'}
      className={cx('ds-popover', variant !== 'menu' && `ds-popover--${variant}`, className)}
      onKeyDown={(event) => { onKeyDown?.(event); if (menu) keyboard.onKeyDown(event); }}
      onMouseMove={(event) => { onMouseMove?.(event); if (menu) keyboard.onMouseMove(event); }}
      onClick={(event) => {
        onClick?.(event);
        if (menu) keyboard.onClick(event);
      }}
    >
      {children}
    </AnchorPopover>
  );
}

export function PopoverTitle({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-popover-title', className)} {...rest} />;
}

export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'role'> {
  icon?: IconName;
  textValue?: string;
}

/** 菜单项：悬停与键盘焦点使用浅色强调背景。 */
export function MenuItem({ icon, textValue, className, children, type = 'button', ...rest }: MenuItemProps) {
  return (
    <button type={type} role="menuitem" tabIndex={-1} data-text-value={textValue} className={cx('ds-menu-item', className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="ds-menu-separator" role="separator" />;
}

/** 通知堆叠容器，固定在右上角。 */
export function NotificationStack({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-notifications', className)} aria-live="polite" {...rest} />;
}

export interface NotificationProps {
  title: string;
  message?: string;
  /** 通知来源应用的图标属性。 */
  app?: AppIconGraphicProps;
  onActivate?: () => void;
  disabled?: boolean;
  variant?: 'toast' | 'inline';
}

/** 系统通知卡片：应用图标 + 标题 + 正文，点击可定位到来源。 */
export function Notification({ title, message, app, onActivate, disabled, variant = 'toast' }: NotificationProps) {
  return (
    <button type="button" className={cx('ds-notification', variant === 'inline' && 'ds-notification--inline')} disabled={disabled} onClick={onActivate}>
      <AppIcon {...app} />
      <div className="ds-notification-copy">
        <h4>{title}</h4>
        {message && <p>{message}</p>}
      </div>
    </button>
  );
}
