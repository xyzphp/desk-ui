import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useLatest } from './useLatest';

export interface PointerPoint {
  x: number;
  y: number;
}
interface GestureCallbacks<T> {
  move: (data: T, point: PointerPoint) => void;
  finish: (data: T, point: PointerPoint) => void;
  cancel: () => void;
}

/** 一次主指针手势；监听仅在手势期间存在，失焦 / 取消 / 卸载时清理。 */
export function usePointerGesture<T>(callbacks: GestureCallbacks<T>, threshold = 0) {
  const latest = useLatest(callbacks);
  const session = useRef<{ cleanup: () => void } | null>(null);
  const cancel = useCallback(() => {
    if (!session.current) return false;
    session.current.cleanup();
    session.current = null;
    latest.current.cancel();
    return true;
  }, [latest]);
  useEffect(
    () => () => {
      session.current?.cleanup();
      session.current = null;
    },
    [],
  );
  const start = useCallback(
    (event: ReactPointerEvent<HTMLElement>, data: T) => {
      if (event.button !== 0 || event.isPrimary === false || session.current) return false;
      const target = event.currentTarget;
      const doc = target.ownerDocument;
      const view = doc.defaultView;
      const pointerId = event.pointerId;
      const origin = { x: event.clientX, y: event.clientY };
      let moved = threshold === 0;
      const matches = (next: PointerEvent) => next.pointerId === pointerId;
      const capture = () => {
        try { target.setPointerCapture?.(pointerId); } catch { /* 文档监听仍覆盖离开手柄的移动。 */ }
      };
      const move = (next: PointerEvent) => {
        if (!matches(next)) return;
        if (!moved && Math.hypot(next.clientX - origin.x, next.clientY - origin.y) < threshold) return;
        if (!moved) { moved = true; capture(); }
        next.preventDefault();
        latest.current.move(data, { x: next.clientX, y: next.clientY });
      };
      const finish = (next: PointerEvent) => {
        if (!matches(next)) return;
        session.current?.cleanup();
        session.current = null;
        if (moved) latest.current.finish(data, { x: next.clientX, y: next.clientY });
      };
      const abort = (next: PointerEvent) => {
        if (matches(next)) cancel();
      };
      const cleanup = () => {
        doc.removeEventListener('pointermove', move);
        doc.removeEventListener('pointerup', finish);
        doc.removeEventListener('pointercancel', abort);
        target.removeEventListener('lostpointercapture', abort);
        view?.removeEventListener('blur', cancel);
        try {
          if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
        } catch {
          /* 已被浏览器释放。 */
        }
      };
      session.current = { cleanup };
      doc.addEventListener('pointermove', move, { passive: false });
      doc.addEventListener('pointerup', finish);
      doc.addEventListener('pointercancel', abort);
      target.addEventListener('lostpointercapture', abort);
      view?.addEventListener('blur', cancel);
      if (moved) {
        capture();
        event.preventDefault();
      }
      return true;
    },
    [cancel, latest, threshold],
  );
  return { start, cancel };
}
