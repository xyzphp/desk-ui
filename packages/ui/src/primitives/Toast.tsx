import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../foundation/Icon';
import { useLatest } from '../foundation/useLatest';
import { useLabels } from '../foundation/ConfigProvider';
import { useToastQueue, type ToastController, type ToastEntry, type ToastCloseReason } from './useToastQueue';

export interface ToastLabels { close: string; region: string }
const ToastContext = createContext<ToastController | null>(null);
const icons = { info: 'info', success: 'circle-check', warning: 'triangle-alert', error: 'x' } as const;

export interface ToastProps {
  item: ToastEntry;
  onDismiss: (id: string, reason: ToastCloseReason) => void;
  labels?: Partial<ToastLabels>;
}

/** 单条消息：可见后计时，悬停、内部焦点、标签页隐藏时暂停。 */
export function Toast({ item, onDismiss, labels: overrides }: ToastProps) {
  const labels = useLabels('toast', overrides);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const duration = item.duration ?? 5000;
  const remaining = useRef(Number.isFinite(duration) ? Math.max(0, duration) : 5000);
  const opened = useRef(false);
  const latest = useLatest({ item, onDismiss });
  useEffect(() => {
    if (!opened.current) { opened.current = true; latest.current.item.onOpen?.(); }
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [latest]);
  useEffect(() => {
    if (duration <= 0 || hovered || focused || hidden) return;
    const start = Date.now();
    const timer = setTimeout(() => latest.current.onDismiss(latest.current.item.id, 'timeout'), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - start));
    };
  }, [duration, hovered, focused, hidden, latest]);
  const tone = item.tone ?? 'info';
  return <article
    className={`ds-toast ds-toast--${tone}`}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
  >
    <Icon name={icons[tone]} />
    <div className="ds-toast-content" role={tone === 'error' ? 'alert' : 'status'} aria-atomic="true">
      <strong>{item.title}</strong>
      {item.message && <p>{item.message}</p>}
    </div>
    {item.onActivate && <button type="button" className="ds-toast-activate" aria-label={item.title} onClick={() => {
      onDismiss(item.id, 'activate');
      item.onActivate?.();
    }} />}
    <button
      type="button" className="ds-toast-close" aria-label={labels.close}
      onClick={() => onDismiss(item.id, 'dismiss')}
    ><Icon name="x" /></button>
  </article>;
}

export interface ToastProviderProps {
  children: ReactNode;
  maxVisible?: number;
  labels?: Partial<ToastLabels>;
}

/** 在桌面或工作区根部挂载；不保存私有内容，锁屏时宿主调用 clear 或卸载。 */
export function ToastProvider({ children, maxVisible = 3, labels: overrides }: ToastProviderProps) {
  const labels = useLabels('toast', overrides);
  const { entries, notify, dismiss, clear } = useToastQueue();
  const controller = useMemo(() => ({ notify, dismiss, clear }), [notify, dismiss, clear]);
  const limit = Number.isFinite(maxVisible) ? Math.max(1, Math.min(10, Math.floor(maxVisible))) : 3;
  return <ToastContext.Provider value={controller}>
    {children}
    <div className="ds-toast-viewport" role="region" aria-label={labels.region}>
      {entries.slice(0, limit).map((item) => <Toast key={item.id} item={item} labels={labels} onDismiss={dismiss} />)}
    </div>
  </ToastContext.Provider>;
}

export function useToast(): ToastController {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast requires ToastProvider');
  return value;
}
