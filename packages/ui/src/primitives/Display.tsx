import { useLabels } from '../foundation/ConfigProvider';
import { createElement, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { safeImage } from '../foundation/safeImage';

export type DisplayTone = 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';

interface TextAppearance {
  tone?: DisplayTone;
  size?: 'sm' | 'md' | 'lg';
  strong?: boolean;
  code?: boolean;
  ellipsis?: boolean;
}
export type TextProps = TextAppearance & (({ as?: 'span' } & ComponentProps<'span'>) | ({ as: 'p' } & ComponentProps<'p'>));

/** 通用正文与次级文字，保留原有 Title / Lead，不建立第二套页面标题。 */
export function Text({ as: Element = 'span', tone = 'default', size = 'md', strong, code, ellipsis, className, ...rest }: TextProps) {
  return createElement(Element, { ...rest, className: cx(
    'ds-text', `ds-display-tone--${tone}`, `ds-text--${size}`, strong && 'is-strong', code && 'is-code', ellipsis && 'is-ellipsis', className,
  ) });
}

export interface LinkProps extends ComponentProps<'a'> { disabled?: boolean; quiet?: boolean }
function safeHref(value: string | undefined) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return undefined;
  try {
    const url = new URL(value.trim(), 'https://link.invalid/');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) && !url.username && !url.password ? value.trim() : undefined;
  } catch { return undefined; }
}

/** 真正的导航链接；执行动作继续使用 Button，不把文本样式伪装为操作按钮。 */
export function Link({ href, disabled = false, quiet = false, target, rel, className, onClick, tabIndex, ...rest }: LinkProps) {
  const source = safeHref(href);
  const blocked = disabled || !source;
  const relation = target === '_blank' ? [...new Set(`${rel ?? ''} noopener noreferrer`.split(/\s+/).filter(Boolean))].join(' ') : rel;
  return <a {...rest} className={cx('ds-link', quiet && 'is-quiet', className)} href={blocked ? undefined : source}
    target={target} rel={relation} role={blocked ? 'link' : rest.role} aria-disabled={blocked || undefined}
    tabIndex={blocked ? -1 : tabIndex} onClick={(event) => { if (blocked) event.preventDefault(); else onClick?.(event); }} />;
}

export interface DividerProps extends Omit<ComponentProps<'div'>, 'children'> {
  children?: ReactNode;
  vertical?: boolean;
  dashed?: boolean;
  align?: 'start' | 'center' | 'end';
  spacing?: 'sm' | 'md' | 'lg';
}
/** 内容分隔；不承担拖动分栏。纯装饰时可传 role="presentation"。 */
export function Divider({ children, vertical = false, dashed = false, align = 'center', spacing = 'md', className, ...rest }: DividerProps) {
  return <div
    {...rest} role={rest.role ?? 'separator'}
    aria-label={rest['aria-label'] ?? (typeof children === 'string' ? children : undefined)}
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    className={cx('ds-divider', vertical && 'is-vertical', dashed && 'is-dashed', `ds-divider--${align}`, `ds-divider--${spacing}`, className)}>
    {!vertical && children != null && <span className="ds-divider-label">{children}</span>}
  </div>;
}

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  name: string;
  src?: string;
  fallback?: ReactNode;
  icon?: IconName;
  size?: number | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
  tone?: DisplayTone;
  decorative?: boolean;
  onImageError?: () => void;
}
function AvatarImage({ src, onError }: { src: string; onError?: () => void }) {
  const [failed, setFailed] = useState(false);
  return failed ? null : <img className="ds-avatar-image" src={src} alt="" decoding="async" referrerPolicy="no-referrer"
    onError={() => { setFailed(true); onError?.(); }} />;
}
/** 账号 / 聊天头像；图片失败回退名称首字，宿主提供已授权 URL。 */
export function Avatar({
  name, src, fallback, icon, size = 'md', shape = 'circle', tone = 'accent', decorative = false, onImageError, className, style, ...rest
}: AvatarProps) {
  const sizes = { sm: 28, md: 40, lg: 56 };
  const requested = typeof size === 'number' ? size : sizes[size];
  const pixels = Number.isFinite(requested) ? Math.max(24, Math.min(160, requested)) : 40;
  const source = safeImage(src);
  return <span
    {...rest} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : rest['aria-label'] ?? name}
    aria-hidden={decorative || undefined}
    className={cx('ds-avatar', `ds-display-tone--${tone}`, shape === 'rounded' && 'is-rounded', className)}
    style={{ ...style, ['--ds-avatar-size' as string]: `${pixels}px`, ['--ds-avatar-font-size' as string]: `${Math.max(12, Math.round(pixels * .4))}px` }}>
    <span className="ds-avatar-fallback" aria-hidden="true">
      {fallback ?? (icon ? <Icon name={icon} /> : Array.from(name.trim())[0] || <Icon name="users" />)}
    </span>
    {source && <AvatarImage key={source} src={source} onError={onImageError} />}
  </span>;
}

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  children?: ReactNode;
  value?: number | string;
  max?: number;
  dot?: boolean;
  showZero?: boolean;
  visible?: boolean;
  tone?: DisplayTone;
  label: string;
}
/** 计数或状态徽标；与应用 / 按钮 / 头像组合，不改被包裹元素的事件。 */
export function Badge({ children, value, max = 99, dot = false, showZero = false, visible = true, tone = 'danger', label, className, ...rest }: BadgeProps) {
  const limit = Number.isFinite(max) && max >= 0 ? Math.floor(max) : 99;
  const number = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : undefined;
  const content = number !== undefined ? number > limit ? `${limit}+` : String(number) : typeof value === 'string' ? value : '';
  const show = visible && (dot || content !== '' && (showZero || content !== '0'));
  return <span {...rest} className={cx('ds-badge', children != null && 'has-anchor', className)}>
    {children}
    {show && <span className={cx('ds-badge-indicator', `ds-display-tone--${tone}`, dot && 'is-dot')} role="img" aria-label={label} title={label}>
      <span aria-hidden="true">{!dot && content}</span>
    </span>}
  </span>;
}

export interface ProgressProps extends Omit<ComponentProps<'div'>, 'children'> {
  label: string;
  value?: number;
  max?: number;
  tone?: DisplayTone;
  size?: 'sm' | 'md';
  showValue?: boolean;
  format?: (value: number, max: number) => ReactNode;
  valueText?: string;
}
/** 任务 / 用量 / 上传进度；value 缺失时表示未知进度，不启动计时或请求。 */
export function Progress({ label, value, max = 100, tone = 'accent', size = 'md', showValue = true, format, valueText, className, ...rest }: ProgressProps) {
  const ceiling = Number.isFinite(max) && max > 0 ? max : 100;
  const current = value !== undefined && Number.isFinite(value) ? Math.min(ceiling, Math.max(0, value)) : undefined;
  const percent = current === undefined ? 0 : current / ceiling * 100;
  return <div {...rest} className={cx('ds-progress', `ds-display-tone--${tone}`, size === 'sm' && 'is-small', className)}>
    <div
      className="ds-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={ceiling}
      aria-valuenow={current} aria-valuetext={valueText}
    >
      <span className={cx('ds-progress-fill', current === undefined && 'is-indeterminate')} style={{ width: current === undefined ? '35%' : `${percent}%` }} />
    </div>
    {showValue && current !== undefined && <span className="ds-progress-value" aria-hidden="true">
      {format ? format(current, ceiling) : `${Math.round(percent)}%`}
    </span>}
  </div>;
}

export interface SkeletonProps extends ComponentProps<'div'> {
  loading?: boolean;
  rows?: number;
  avatar?: boolean;
  animated?: boolean;
  label?: string;
}
/** 通用加载占位；调用方控制加载完成，不卸载已提供的子内容。 */
export function Skeleton({ loading = true, rows = 3, avatar = false, animated = true, label, children, className, ...rest }: SkeletonProps) {
  const labels = useLabels('skeleton');
  const count = Number.isFinite(rows) ? Math.min(20, Math.max(1, Math.floor(rows))) : 3;
  return <div {...rest} className={cx('ds-skeleton', loading && animated && 'is-animated', className)} aria-busy={loading || undefined}>
    {children != null && <div className="ds-skeleton-content" hidden={loading}>{children}</div>}
    {loading && <>
      <span className="ds-visually-hidden" role="status">{label ?? labels.loading}</span>
      <div className="ds-skeleton-placeholder" aria-hidden="true">
        {avatar && <span className="ds-skeleton-avatar" />}
        <div className="ds-skeleton-lines">{Array.from({ length: count }, (_, index) => <span key={index} />)}</div>
      </div>
    </>}
  </div>;
}
