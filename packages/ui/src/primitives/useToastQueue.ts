import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type ToastCloseReason = 'timeout' | 'dismiss' | 'activate' | 'clear' | 'overflow';
export type ToastTone = 'info' | 'success' | 'warning' | 'error';
export interface ToastOptions {
  title: string;
  message?: string;
  tone?: ToastTone;
  /** 毫秒；0 表示持续显示，直到宿主或用户关闭。 */
  duration?: number;
  onActivate?: () => void;
  onOpen?: () => void;
  onClose?: (reason: ToastCloseReason) => void;
}
export interface ToastEntry extends ToastOptions { id: string }
export interface ToastController {
  notify: (options: ToastOptions) => string;
  dismiss: (id: string, reason?: ToastCloseReason) => void;
  clear: () => void;
}

/** 所有修改在事件或 effect 中执行；队列引用允许同一事件连续入队与立即取消。 */
export function useToastQueue() {
  const prefix = useId();
  const sequence = useRef(0);
  const queue = useRef<ToastEntry[]>([]);
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; queue.current = []; };
  }, []);
  const dismiss = useCallback((id: string, reason: ToastCloseReason = 'dismiss') => {
    if (!mounted.current) return;
    const item = queue.current.find((entry) => entry.id === id);
    if (!item) return;
    queue.current = queue.current.filter((entry) => entry.id !== id);
    setEntries(queue.current);
    item.onClose?.(reason);
  }, []);
  const notify = useCallback((options: ToastOptions) => {
    const id = `${prefix}-${++sequence.current}`;
    if (!mounted.current) return id;
    const next = [...queue.current, { ...options, id }];
    const removed = next.length > 50 ? next.shift() : undefined;
    queue.current = next;
    setEntries(next);
    removed?.onClose?.('overflow');
    return id;
  }, [prefix]);
  const clear = useCallback(() => {
    if (!mounted.current) return;
    const previous = queue.current;
    queue.current = [];
    setEntries([]);
    previous.forEach((entry) => entry.onClose?.('clear'));
  }, []);
  return { entries, notify, dismiss, clear };
}
