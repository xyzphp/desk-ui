import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { Tag, type TagTone } from './Feedback';

export interface ChipLabels { remove: (text: string) => string }
export interface ChipProps extends Omit<ComponentProps<'span'>, 'children' | 'color'> {
  children: string;
  onRemove?: () => void;
  disabled?: boolean;
  tone?: TagTone;
  labels?: Partial<ChipLabels>;
}

/** 可移除文本令牌，静态外观复用 Tag。 */
export function Chip({ children, onRemove, disabled, labels: overrides, className, tone, ...rest }: ChipProps) {
  const labels = useLabels('chip', overrides);
  return <Tag {...rest} tone={tone} className={cx('ds-chip', className)} aria-disabled={disabled || undefined}>
    <span className="ds-chip-text">{children}</span>
    {onRemove && <button
      type="button" className="ds-chip-remove" aria-label={labels.remove(children)} disabled={disabled} onClick={onRemove}
    ><Icon name="x" /></button>}
  </Tag>;
}
