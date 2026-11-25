import { useImperativeHandle, useRef, type ComponentProps, type Ref } from 'react';
import { cx } from './cx';
import { useAnchoredLayer, type AnchoredLayerOptions } from './useAnchoredLayer';

export interface AnchorPopoverProps
  extends Omit<ComponentProps<'div'>, 'as' | 'onClose' | 'ref'>, AnchoredLayerOptions {
  /** 保留原生页面需要的根标签，不会额外包一层内容容器。 */
  as?: 'div' | 'section';
  ref?: Ref<HTMLDivElement>;
}

/** 公共非模态顶层；调用方给出名称、触发器的 ARIA 与内容语义。 */
export function AnchorPopover({
  as = 'div',
  open,
  anchor,
  point,
  placement,
  gap,
  matchAnchorWidth,
  initialFocus,
  restoreFocus,
  dismissOnFocusOutside,
  dismiss,
  manual,
  onClose,
  ref,
  className,
  children,
  style,
  ...rest
}: AnchorPopoverProps) {
  const panel = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => panel.current as HTMLDivElement);
  useAnchoredLayer(panel, {
    open,
    anchor,
    point,
    placement,
    gap,
    matchAnchorWidth,
    initialFocus,
    restoreFocus,
    dismissOnFocusOutside,
    dismiss,
    manual,
    onClose,
  });
  if (!open) return null;
  const layerProps = {
    ...rest,
    ref: (node: HTMLElement | null) => {
      panel.current = node;
    },
    popover: 'manual' as const,
    tabIndex: -1,
    className: cx('ds-anchor-layer ds-scrollable', className),
    style,
    children,
  };
  return as === 'section' ? <section {...layerProps} /> : <div {...layerProps} />;
}
