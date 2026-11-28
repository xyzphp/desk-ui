import { useImperativeHandle, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { Tooltip } from './Tooltip';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  children: ReactNode;
  indeterminate?: boolean;
}

/** 复选框 + 文字标签，整行可点击。对应原生 .workspace-toggle。 */
export function Checkbox({ className, children, indeterminate = false, ref, ...rest }: CheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  useLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  });
  return (
    <label className={cx('ds-checkbox', className)}>
      <input className="ds-control-input" type="checkbox" {...rest} ref={input} />
      <span>{children}</span>
    </label>
  );
}

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'role' | 'children' | 'aria-checked'> {
  children?: ReactNode;
  /** 文字放在开关前面；缺省在开关后面。 */
  labelFirst?: boolean;
  /** 状态变化回调；原生 onChange 仍可使用。 */
  onCheckedChange?: (checked: boolean) => void;
}

/** 设置开关。保留原生表单、受控 / 非受控与 reset 行为，对应 .settings-switch。 */
export function Switch({ className, children, labelFirst = false, onCheckedChange, onChange, ...rest }: SwitchProps) {
  const label = children == null ? null : <span>{children}</span>;
  return (
    <label className={cx('ds-switch', className)}>
      {labelFirst && label}
      <input
        className="ds-control-input"
        {...rest}
        type="checkbox"
        role="switch"
        onChange={(event) => {
          onCheckedChange?.(event.currentTarget.checked);
          onChange?.(event);
        }}
      />
      {!labelFirst && label}
    </label>
  );
}

export type TagTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

/** 装饰色：只用于分类、归属等不带状态含义的标签，取自强调色令牌。 */
export type TagColor = 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'cyan' | 'gray';

export interface TagProps extends Omit<ComponentProps<'span'>, 'color'> {
  /** 语义色：表达状态时使用。 */
  tone?: TagTone;
  /** 装饰色：表达分类时使用；提供后覆盖 tone 的配色。 */
  color?: TagColor;
  /** 圆角：默认小圆角，pill 为全圆角。 */
  shape?: 'default' | 'pill';
  /** 在文字前显示带柔光光晕的状态圆点（常与 shape="pill" 搭配）。 */
  dot?: boolean;
  icon?: IconName;
}

/** 状态标签。颜色走语义令牌，页面不写色值。对应 .workspace-status / .account-status-tag。 */
export function Tag({ tone = 'neutral', color, shape, dot = false, icon, className, children, ...rest }: TagProps) {
  return (
    <span
      className={cx(
        'ds-tag',
        !color && tone !== 'neutral' && `ds-tag--${tone}`,
        color && `ds-tag--color ds-tag--${color}`,
        shape === 'pill' && 'ds-tag--pill',
        dot && 'ds-tag--dot',
        className,
      )}
      {...rest}
    >
      {dot && <span className="ds-tag-dot" aria-hidden="true" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export interface CapsuleTagProps extends Omit<ComponentProps<'span'>, 'color' | 'children'> {
  /** 左段：键或状态名，实色底。 */
  label: ReactNode;
  /** 右段：值或数量，浅色底。 */
  value: ReactNode;
  tone?: Exclude<TagTone, 'muted'>;
  color?: TagColor;
  icon?: IconName;
}

/** 胶囊标签：左段实色、右段浅色，用于“键 + 值”“状态 + 数量”。读屏按“左段 右段”连读。 */
export function CapsuleTag({ label, value, tone = 'neutral', color, icon, className, ...rest }: CapsuleTagProps) {
  return (
    <span
      className={cx(
        'ds-tag-capsule',
        !color && tone !== 'neutral' && `ds-tag--${tone}`,
        color && `ds-tag--${color}`,
        className,
      )}
      {...rest}
    >
      <span className="ds-tag-capsule-label">
        {icon && <Icon name={icon} size={12} />}
        {label}
      </span>
      <span className="ds-tag-capsule-value">{value}</span>
    </span>
  );
}

export interface HelpTipProps {
  /** 提示内容，同时作为无障碍名称。 */
  text: string;
  className?: string;
}

/** 问号悬停提示。可聚焦，键盘聚焦时同样展示。必要提示统一用它，不堆叠说明小字。 */
export function HelpTip({ text, className }: HelpTipProps) {
  return (
    <Tooltip text={text}>
      {(trigger) => (
        <span {...trigger} className={cx('ds-help-tip', className)} tabIndex={0} role="img" aria-label={text}>
          <Icon name="help-circle" />
        </span>
      )}
    </Tooltip>
  );
}

export type NoticeTone = 'success' | 'error' | 'info' | 'warning';

export interface NoticeProps extends Omit<ComponentProps<'div'>, 'role'> {
  tone?: NoticeTone;
}

/** 内联提示条。错误使用 role="alert"，其余为 role="status"。对应 .account-message。 */
export function Notice({ tone = 'success', className, ...rest }: NoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('ds-notice', tone !== 'success' && `ds-notice--${tone}`, className)}
      {...rest}
    />
  );
}

export interface EmptyStateProps extends ComponentProps<'p'> {
  compact?: boolean;
}

/** 空列表 / 空详情占位。合并 account-empty-detail、account-list-empty、workspace-empty。 */
export function EmptyState({ compact, className, ...rest }: EmptyStateProps) {
  return <p className={cx('ds-empty', compact && 'ds-empty--compact', className)} {...rest} />;
}
