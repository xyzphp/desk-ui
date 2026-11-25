import { useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon, type IconName } from '../foundation/Icon';
import { safeImage } from '../foundation/safeImage';

export interface MenuBarProps extends ComponentProps<'header'> {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

/** 顶部菜单栏（Windows 风格下为底部任务栏的左右控件）。左：标志与当前应用名；中：模式切换；右：控件与时钟。 */
export function MenuBar({ left, center, right, className, ...rest }: MenuBarProps) {
  return (
    <header className={cx('ds-menubar', className)} {...rest}>
      <div className="ds-menubar-left">{left}</div>
      <div className="ds-menubar-center">{center}</div>
      <div className="ds-menubar-right">{right}</div>
    </header>
  );
}

export interface MenuBarLogoProps extends ComponentProps<'button'> {
  active?: boolean;
  avatar?: string;
  image?: string;
  fallbackImage?: string;
}

/** 左上角标志按钮，通常放头像或品牌图，点击展开系统菜单。 */
export function MenuBarLogo({ active, avatar, image, fallbackImage, children, className, type = 'button', ...rest }: MenuBarLogoProps) {
  const sources = [safeImage(avatar), safeImage(image), safeImage(fallbackImage)];
  return <button type={type} className={cx('ds-menubar-logo', active && 'is-active', className)} {...rest}>
    <MenuBarImage key={JSON.stringify(sources)} sources={sources} fallback={children} />
  </button>;
}

function MenuBarImage({ sources, fallback }: { sources: (string | undefined)[]; fallback: ReactNode }) {
  const [failed, setFailed] = useState<string[]>([]);
  const index = sources.findIndex((source) => source && !failed.includes(source));
  const source = sources[index];
  return source ? <img src={source} alt="" draggable={false} decoding="async" referrerPolicy="no-referrer"
    className={cx('ds-menubar-image', index === 0 && 'is-avatar')}
    onError={() => setFailed((previous) => [...previous, source])} /> : fallback;
}

/** 当前应用名（粗体）。 */
export function MenuBarApp({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-menubar-app', className)} {...rest} />;
}

export interface MenuBarIconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName;
  label: string;
}

/** 右侧图标按钮（主题、控制中心、Dock 开关…）。 */
export function MenuBarIconButton({ icon, label, className, type = 'button', ...rest }: MenuBarIconButtonProps) {
  return (
    <button type={type} className={cx('ds-menubar-item', 'ds-menubar-icon', className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

export interface MenuBarClockProps extends Omit<ComponentProps<'button'>, 'children'> {
  date?: string;
  time: string;
}

/** 日期与时间按钮，点击展开日历。 */
export function MenuBarClock({ date, time, className, type = 'button', ...rest }: MenuBarClockProps) {
  const labels = useLabels('menuBar');
  return (
    <button type={type} className={cx('ds-menubar-item', 'ds-menubar-clock', className)} aria-label={labels.clock} {...rest}>
      <span>{date}</span>
      <span>{time}</span>
    </button>
  );
}
