import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { EmptyState } from '../primitives/Feedback';
import type { DisplayTone } from '../primitives/Display';

export interface TimelineItem {
  id: string;
  title: ReactNode;
  content?: ReactNode;
  time?: ReactNode;
  dateTime?: string;
  icon?: IconName;
  tone?: DisplayTone;
}
export interface TimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
  label: string;
  items: readonly TimelineItem[];
  labels?: Partial<{ empty: string }>;
}
/** 事件顺序、时区和时间格式由宿主提供，不包含加载或业务请求。 */
export function Timeline({ label, items, labels: overrides, className, ...rest }: TimelineProps) {
  const labels = useLabels('timeline', overrides);
  return <ol {...rest} className={cx('ds-timeline', className)} aria-label={label}>
    {!items.length && <li><EmptyState compact>{labels.empty}</EmptyState></li>}
    {items.map((item) => <li key={item.id} className="ds-timeline-item">
      <span className={cx('ds-timeline-mark', `ds-display-tone--${item.tone ?? 'muted'}`)} aria-hidden="true">
        {item.icon ? <Icon name={item.icon} /> : <span className="ds-timeline-dot" />}
      </span>
      <div className="ds-timeline-content"><div className="ds-timeline-heading">
        <strong>{item.title}</strong>{item.time != null && <time dateTime={item.dateTime}>{item.time}</time>}
      </div>{item.content != null && <div className="ds-timeline-body">{item.content}</div>}</div>
    </li>)}
  </ol>;
}
