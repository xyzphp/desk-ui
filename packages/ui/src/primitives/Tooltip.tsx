import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type RefCallback } from 'react';
import { AnchorPopover } from '../foundation/AnchorPopover';
import type { FloatingPlacement } from '../foundation/floatingPosition';

export interface TooltipTriggerProps {
  ref: RefCallback<HTMLElement>;
  'aria-describedby'?: string;
  onPointerEnter: ComponentProps<'span'>['onPointerEnter'];
  onPointerLeave: ComponentProps<'span'>['onPointerLeave'];
  onPointerDown: ComponentProps<'span'>['onPointerDown'];
  onClick: ComponentProps<'span'>['onClick'];
  onFocus: ComponentProps<'span'>['onFocus'];
  onBlur: ComponentProps<'span'>['onBlur'];
  onKeyDown: ComponentProps<'span'>['onKeyDown'];
}

export interface TooltipProps {
  text: string;
  /** 透传给一个可聚焦元素；已有 describedBy 通过本组件属性合并。 */
  children: (trigger: TooltipTriggerProps) => ReactNode;
  placement?: FloatingPlacement;
  delay?: number;
  disabled?: boolean;
  describedBy?: string;
}

/** 作为组件插槽传递 ref 回调，父组件渲染期不调用可能接触 DOM 引用的函数。 */
function TooltipTrigger({ render, trigger }: { render: TooltipProps['children']; trigger: TooltipTriggerProps }) {
  return render(trigger);
}

/** 纯文本说明；不抢焦点，不承载链接或按钮。 */
export function Tooltip({ text, children, placement = 'top', delay = 300, disabled = false, describedBy }: TooltipProps) {
  const anchor = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const id = useId();
  const setAnchor = useCallback((node: HTMLElement | null) => { anchor.current = node; }, []);
  const clear = useCallback(() => { clearTimeout(timer.current); timer.current = undefined; }, []);
  const close = useCallback(() => { clear(); setOpen(false); }, [clear]);
  const show = (wait: number) => {
    clear();
    if (!disabled && text) timer.current = setTimeout(() => setOpen(true), wait);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (disabled || !text) close(); }, [disabled, text, close]);
  const visible = open && !disabled && !!text;
  return <>
    <TooltipTrigger render={children} trigger={{
      ref: setAnchor, 'aria-describedby': [describedBy, visible ? id : undefined].filter(Boolean).join(' ') || undefined,
      onPointerEnter: (event) => { if (event.pointerType !== 'touch') show(Number.isFinite(delay) ? Math.max(0, delay) : 300); },
      onPointerLeave: () => {
        clear();
        if (anchor.current !== anchor.current?.ownerDocument.activeElement) timer.current = setTimeout(close, 120);
      },
      onPointerDown: close,
      onClick: close,
      onFocus: () => { clear(); if (!disabled && text) setOpen(true); },
      onBlur: close,
      onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') close(); },
    }} />
    <AnchorPopover
      open={visible} anchor={anchor} id={id} role="tooltip" className="ds-tooltip"
      placement={placement} initialFocus={false} restoreFocus={false} dismissOnFocusOutside={false}
      onClose={close} onPointerEnter={clear} onPointerLeave={() => {
        if (anchor.current !== anchor.current?.ownerDocument.activeElement) close();
      }}
    >{text}</AnchorPopover>
  </>;
}
