import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';

export type ButtonVariant = 'default' | 'primary' | 'quiet' | 'danger';

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  /** 文字前的图标。 */
  icon?: IconName;
  /** 切换按钮的按下状态，渲染为 aria-pressed。 */
  pressed?: boolean;
  /** 撑满容器宽度。 */
  block?: boolean;
  children?: ReactNode;
}

/** 通用按钮。对应原生 .workspace-button 与 .btn，默认 type="button"。 */
export function Button({
  variant = 'default', size = 'md', icon, pressed, block, className, type = 'button', children, ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cx(
        'ds-button',
        variant !== 'default' && `ds-button--${variant}`,
        size === 'sm' && 'ds-button--sm',
        block && 'ds-button--block',
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'size' | 'block'> {
  icon: IconName;
  /** 无障碍名称，同时作为悬停提示。 */
  label: string;
}

/** 仅图标按钮，必须提供 label。 */
export function IconButton({ icon, label, variant = 'default', className, ...rest }: IconButtonProps) {
  return (
    <Button
      variant={variant}
      aria-label={label}
      title={label}
      className={cx('ds-button--icon', className)}
      {...rest}
    >
      <Icon name={icon} />
    </Button>
  );
}
