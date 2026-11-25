import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Avatar, type AvatarProps } from './Display';

export interface AvatarGroupItem extends Pick<AvatarProps, 'name' | 'src' | 'fallback' | 'icon' | 'tone' | 'onImageError'> { id: string }
export interface AvatarGroupLabels { empty: string; more: (count: number) => string }
export interface AvatarGroupProps extends Omit<ComponentProps<'div'>, 'children'> {
  label: string;
  items: readonly AvatarGroupItem[];
  max?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  labels?: Partial<AvatarGroupLabels>;
}

/** 超出人数通过原生 details 就地展开，头像图片策略复用 Avatar。 */
export function AvatarGroup({ label, items, max = 5, size = 'md', shape, labels: overrides, className, ...rest }: AvatarGroupProps) {
  const labels = useLabels('avatarGroup', overrides);
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 5;
  const visible = items.slice(0, limit), remaining = items.slice(limit);
  return <div {...rest} role="group" aria-label={label} className={cx('ds-avatar-group', className)}>
    {!items.length && <span className="ds-avatar-group-empty">{labels.empty}</span>}
    {!!visible.length && <ul className="ds-avatar-group-visible">{visible.map(({ id, ...avatar }) => <li key={id}>
      <Avatar {...avatar} size={size} shape={shape} />
    </li>)}</ul>}
    {!!remaining.length && <details className="ds-avatar-group-overflow">
      <summary aria-label={labels.more(remaining.length)}>+{remaining.length}</summary>
      <ul className="ds-avatar-group-members">{remaining.map(({ id, ...avatar }) => <li key={id}>
        <Avatar {...avatar} size="sm" shape={shape} decorative /><span>{avatar.name}</span>
      </li>)}</ul>
    </details>}
  </div>;
}
