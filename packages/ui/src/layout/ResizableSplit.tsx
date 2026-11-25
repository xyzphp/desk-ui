import { useId, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { ResizeHandle, resizeRange, type ResizeHandleLabels } from './ResizeHandle';
import { useSplitBounds } from './useSplitBounds';

export interface ResizableSplitProps extends Omit<ComponentProps<'div'>, 'children'> {
  primary: ReactNode;
  children: ReactNode;
  size?: number;
  defaultSize?: number;
  onSizeChange?: (value: number) => void;
  minSize?: number;
  maxSize?: number;
  minSecondarySize?: number;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  labels?: Partial<ResizeHandleLabels>;
}

/** 只回调尺寸；保存与恢复归宿主。窄横向容器上下排列，保留用户宽度偏好。 */
export function ResizableSplit({
  primary, children, size, defaultSize = 240, onSizeChange, minSize = 160, maxSize, minSecondarySize = 160,
  direction = 'horizontal', disabled, labels, ref, style, className, ...rest
}: ResizableSplitProps) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const id = useId();
  const [preferred, change] = useControllable(size, defaultSize, onSizeChange);
  const bounds = useSplitBounds(root, handle, direction, minSize, maxSize, minSecondarySize);
  const effective = resizeRange(preferred, bounds.min, bounds.max).value;
  const stacked = direction === 'horizontal' && bounds.compact;
  useImperativeHandle(ref, () => root.current!, []);
  return <div
    {...rest} ref={root} className={cx('ds-resizable-split', `is-${direction}`, stacked && 'is-stacked', className)}
    style={{ ['--ds-pane-size' as string]: `${effective}px`, ...style }}
  >
    <div id={`${id}-primary`} className="ds-resizable-primary ds-scrollable">{primary}</div>
    <ResizeHandle
      ref={handle} hidden={stacked} value={effective} min={bounds.min} max={bounds.max}
      orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'} labels={labels}
      onValueChange={change} disabled={disabled || stacked || bounds.min === bounds.max}
      aria-controls={`${id}-primary ${id}-secondary`}
    />
    <div id={`${id}-secondary`} className="ds-resizable-secondary ds-scrollable">{children}</div>
  </div>;
}
