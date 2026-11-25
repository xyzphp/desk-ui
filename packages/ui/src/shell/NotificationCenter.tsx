import { useImperativeHandle, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useBusyFocus } from '../foundation/useBusyFocus';
import { Button } from '../primitives/Button';
import { EmptyState, Tag } from '../primitives/Feedback';
import { Inline } from '../layout/Spacing';
import type { ToastEntry } from '../primitives/useToastQueue';
import type { AppIconAppearance } from './AppIcon';
import { Notification } from './Overlay';
import { useNotificationCenter } from './useNotificationCenter';

export interface NotificationCenterItem extends Pick<ToastEntry, 'id' | 'title' | 'message' | 'tone'> {
  unread?: boolean;
  time?: string;
  dateTime?: string;
  app?: AppIconAppearance;
  disabled?: boolean;
}
export interface NotificationCenterLabels {
  all: string; unread: string; list: string; empty: string; noUnread: string; markRead: string; dismiss: string;
  markAllRead: string; clear: string; count: (total: number, unread: number) => string;
}
export interface NotificationCenterProps extends Omit<ComponentProps<'section'>, 'children'> {
  label: string;
  items: readonly NotificationCenterItem[];
  onActivate: (item: NotificationCenterItem) => void;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClear?: () => void;
  busy?: boolean;
  labels?: Partial<NotificationCenterLabels>;
}
const toneIcons = { info: 'info', success: 'circle-check', warning: 'triangle-alert', error: 'triangle-alert' } as const;
const toneColors = { info: 'var(--accent)', success: 'var(--ds-success)', warning: 'var(--ds-warning)', error: 'var(--ds-danger)' };

/** 历史由宿主管理；复用 Toast 数据字段，但不把 Toast 的临时队列当作持久历史。 */
export function NotificationCenter({ label, items, onActivate, onMarkRead, onDismiss, onMarkAllRead, onClear, busy,
  labels: overrides, ref, className, ...rest }: NotificationCenterProps) {
  const labels = useLabels('notificationCenter', overrides);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const filtered = unreadOnly ? items.filter((item) => item.unread) : items;
  const unread = items.filter((item) => item.unread).length;
  const { root, ...state } = useNotificationCenter(filtered);
  useImperativeHandle(ref, () => root.current!, [root]);
  useBusyFocus(root, true, !!busy, () => root.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus());
  return <section {...rest} ref={root} tabIndex={rest.tabIndex ?? -1} className={cx('ds-notification-center', className)} aria-label={label}>
    <fieldset className="ds-notification-center-fields" disabled={busy} aria-busy={busy || undefined}>
      <Inline justify="between">
        <Inline gap="xs">
          <Button size="sm" pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>{labels.all}</Button>
          <Button size="sm" pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>{labels.unread}</Button>
        </Inline>
        <Inline gap="xs">
          {onMarkAllRead && <Button size="sm" variant="quiet" disabled={!unread}
            onClick={() => state.bulk('read', onMarkAllRead)}>{labels.markAllRead}</Button>}
          {onClear && <Button size="sm" variant="quiet" disabled={!items.length}
            onClick={() => state.bulk('empty', onClear)}>{labels.clear}</Button>}
        </Inline>
      </Inline>
      <p className="ds-notification-center-count" role="status">{labels.count(items.length, unread)}</p>
      <ul className="ds-notification-center-list ds-scrollable" aria-label={labels.list}>
        {filtered.map((item) => <li key={item.id} className="ds-notification-center-item">
          <Notification variant="inline" title={item.title} message={item.message} disabled={busy || item.disabled}
            app={item.app ?? { icon: toneIcons[item.tone ?? 'info'], color: toneColors[item.tone ?? 'info'] }}
            onActivate={() => {
              if (unreadOnly) state.remove(item.id, () => onActivate(item)); else onActivate(item);
            }} />
          <Inline justify="between" className="ds-notification-center-meta">
            <Inline gap="xs">{item.unread && <Tag tone="info">{labels.unread}</Tag>}
              {item.time && <time dateTime={item.dateTime}>{item.time}</time>}
            </Inline>
            <Inline gap="xs">
              {item.unread && onMarkRead && <Button size="sm" variant="quiet" disabled={item.disabled}
                data-notification-id={item.id} onClick={() => {
                  if (unreadOnly) state.remove(item.id, onMarkRead); else onMarkRead(item.id);
                }}>{labels.markRead}</Button>}
              {onDismiss && <Button size="sm" variant="quiet" icon="x" disabled={item.disabled} data-notification-id={item.id}
                aria-label={`${labels.dismiss}：${item.title}`} onClick={() => state.remove(item.id, onDismiss)} />}
            </Inline>
          </Inline>
        </li>)}
      </ul>
      {!filtered.length && <EmptyState compact>{unreadOnly ? labels.noUnread : labels.empty}</EmptyState>}
    </fieldset>
  </section>;
}
