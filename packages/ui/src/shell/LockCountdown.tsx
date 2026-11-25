import type { ComponentProps } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon } from '../foundation/Icon';
import { cx } from '../foundation/cx';
import { Button } from '../primitives/Button';

export interface LockCountdownLabels {
  upcoming: string;
  remaining: (seconds: number) => string;
  cancel: string;
}

export interface LockCountdownProps extends Omit<ComponentProps<'aside'>, 'children'> {
  seconds: number;
  onCancel: () => void;
  labels?: Partial<LockCountdownLabels>;
}

/** 只显示宿主传入的时间，不负责判定闲置或锁定会话。 */
export function LockCountdown({ seconds, onCancel, labels: overrides, className, ...rest }: LockCountdownProps) {
  const labels = useLabels('lockCountdown', overrides);
  return (
    <aside {...rest} className={cx('ds-lock-countdown', className)}>
      <span className="ds-visually-hidden" role="status">
        {labels.upcoming}
      </span>
      <Icon name="clock-3" />
      <span>{labels.remaining(seconds)}</span>
      <Button size="sm" onClick={onCancel}>
        {labels.cancel}
      </Button>
    </aside>
  );
}
