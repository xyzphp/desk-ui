import { useEffect, useImperativeHandle, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useLatest } from '../foundation/useLatest';

export interface ResizeHandleLabels { label: string; value: (value: number) => string }
export interface ResizeHandleProps extends Omit<ComponentProps<'div'>, 'onChange' | 'children'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  onValueChange: (value: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: (value: number, cancelled: boolean) => void;
  labels?: Partial<ResizeHandleLabels>;
}

export function resizeRange(value: number, minimum = 0, maximum = 1000) {
  const min = Number.isFinite(minimum) ? Math.max(0, minimum) : 0;
  const max = Number.isFinite(maximum) ? Math.max(min, maximum) : Math.max(min, 1000);
  return { min, max, value: Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)) };
}

/** 值的单位是 CSS 像素。竖分隔条调整宽度，横分隔条调整高度。 */
export function ResizeHandle({
  value, min, max, step = 10, orientation = 'vertical', disabled = false, labels: overrides,
  onValueChange, onResizeStart, onResizeEnd, ref, className, onKeyDown,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, ...rest
}: ResizeHandleProps) {
  const labels = useLabels('resizeHandle', overrides);
  const range = resizeRange(value, min, max);
  const node = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; point: number; start: number; last: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const latest = useLatest({ range, disabled, orientation, onValueChange, onResizeStart, onResizeEnd });
  useImperativeHandle(ref, () => node.current!, []);
  const release = () => {
    const active = gesture.current;
    gesture.current = null;
    if (active && node.current?.hasPointerCapture?.(active.id)) node.current.releasePointerCapture(active.id);
  };
  useEffect(() => () => release(), []);
  useEffect(() => { release(); setDragging(false); }, [disabled, orientation]);
  const finish = (cancelled: boolean) => {
    const active = gesture.current;
    if (!active) return;
    release(); setDragging(false);
    const next = cancelled ? active.start : active.last;
    if (cancelled && active.last !== active.start) latest.current.onValueChange(next);
    latest.current.onResizeEnd?.(next, cancelled);
  };
  return <div
    {...rest} ref={node} role="separator" tabIndex={disabled ? -1 : 0}
    aria-label={rest['aria-label'] ?? labels.label} aria-orientation={orientation}
    aria-valuemin={range.min} aria-valuemax={range.max} aria-valuenow={range.value} aria-valuetext={labels.value(range.value)}
    aria-disabled={disabled || undefined} className={cx('ds-resize-handle', dragging && 'is-dragging', className)}
    onPointerDown={(event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || event.button !== 0 || event.isPrimary === false || gesture.current) return;
      event.preventDefault(); event.currentTarget.focus({ preventScroll: true });
      gesture.current = { id: event.pointerId, point: orientation === 'vertical' ? event.clientX : event.clientY,
        start: range.value, last: range.value };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setDragging(true); onResizeStart?.();
    }}
    onPointerMove={(event) => {
      onPointerMove?.(event);
      const active = gesture.current;
      if (event.defaultPrevented || !active || active.id !== event.pointerId || latest.current.disabled) return;
      const point = latest.current.orientation === 'vertical' ? event.clientX : event.clientY;
      const next = resizeRange(active.start + point - active.point, latest.current.range.min, latest.current.range.max).value;
      if (next !== active.last) { active.last = next; latest.current.onValueChange(next); }
    }}
    onPointerUp={(event) => { onPointerUp?.(event); if (gesture.current?.id === event.pointerId) finish(false); }}
    onPointerCancel={(event) => { onPointerCancel?.(event); if (gesture.current?.id === event.pointerId) finish(true); }}
    onLostPointerCapture={(event) => { onLostPointerCapture?.(event); if (gesture.current?.id === event.pointerId) finish(true); }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape' && gesture.current) { event.preventDefault(); event.stopPropagation(); finish(true); return; }
      const backward = orientation === 'vertical' ? 'ArrowLeft' : 'ArrowUp';
      const forward = orientation === 'vertical' ? 'ArrowRight' : 'ArrowDown';
      const amount = (Number.isFinite(step) && step > 0 ? step : 10) * (event.shiftKey ? 10 : 1);
      const next = event.key === backward ? range.value - amount : event.key === forward ? range.value + amount
        : event.key === 'Home' ? range.min : event.key === 'End' ? range.max : undefined;
      if (next === undefined) return;
      event.preventDefault();
      const limited = resizeRange(next, range.min, range.max).value;
      if (limited !== range.value) onValueChange(limited);
    }}
  />;
}
