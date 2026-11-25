import { useLayoutEffect, useRef } from 'react';
import type { NotificationCenterItem } from './NotificationCenter';

/** 删除当前通知后聚焦相邻入口；宿主拒绝、异步等待或用户移到外部时不抢焦点。 */
export function useNotificationCenter(items: readonly NotificationCenterItem[]) {
  const root = useRef<HTMLElement>(null);
  const pending = useRef<{ removed?: string; mode?: 'empty' | 'read'; next?: string; origin: Element | null } | null>(null);
  useLayoutEffect(() => {
    const request = pending.current, node = root.current;
    if (!request || !node) return;
    const ready = request.mode === 'empty' ? !items.length : request.mode === 'read' ? !items.some((item) => item.unread)
      : !items.some((item) => item.id === request.removed);
    if (!ready) return;
    pending.current = null;
    const active = node.ownerDocument.activeElement;
    if (!request.origin || active !== node.ownerDocument.body && active !== node && active !== request.origin) return;
    const buttons = Array.from(node.querySelectorAll<HTMLButtonElement>('[data-notification-id]:not(:disabled)'));
    (buttons.find((button) => button.dataset.notificationId === request.next) ?? buttons[0]
      ?? node.querySelector<HTMLButtonElement>('button:not(:disabled)') ?? node).focus();
  }, [items]);
  const remove = (id: string, action: (id: string) => void) => {
    const index = items.findIndex((item) => item.id === id);
    pending.current = { removed: id, next: items[index + 1]?.id ?? items[index - 1]?.id,
      origin: root.current?.contains(root.current.ownerDocument.activeElement) ? root.current.ownerDocument.activeElement : null };
    action(id);
  };
  const bulk = (mode: 'empty' | 'read', action: () => void) => {
    pending.current = { mode,
      origin: root.current?.contains(root.current.ownerDocument.activeElement) ? root.current.ownerDocument.activeElement : null };
    action();
  };
  return { root, remove, bulk };
}
