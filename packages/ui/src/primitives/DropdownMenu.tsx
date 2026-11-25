import { useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { useControllable } from '../foundation/useControllable';
import { Icon } from '../foundation/Icon';
import { Popover } from '../shell/Overlay';
import { Button, type ButtonProps } from './Button';

export interface DropdownMenuProps extends Omit<ButtonProps, 'children'> {
  label: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'left' | 'right';
}

/** 命名按钮与现有 MenuItem 菜单组合，键盘处理交给 Popover。 */
export function DropdownMenu({
  label, children, open: controlled, defaultOpen = false, onOpenChange, align, disabled, ref, onClick, onKeyDown, ...rest
}: DropdownMenuProps) {
  const anchor = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => anchor.current!, []);
  const id = useId();
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const [initialFocus, setInitialFocus] = useState<'first' | 'last'>('first');
  useEffect(() => { if (disabled && open) setOpen(false); }, [disabled, open, setOpen]);
  return <>
    <Button {...rest} ref={anchor} disabled={disabled} aria-haspopup="menu" aria-expanded={open && !disabled}
      aria-controls={open && !disabled ? id : undefined} onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) { setInitialFocus('first'); setOpen(!open); }
      }} onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && !disabled && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault(); setInitialFocus(event.key === 'ArrowUp' ? 'last' : 'first'); setOpen(true);
        }
      }}
    >{label}<Icon name="chevron-down" /></Button>
    <Popover id={id} anchor={anchor} open={open && !disabled} align={align} initialFocus={initialFocus}
      onClose={() => setOpen(false)} aria-label={label}
    >{children}</Popover>
  </>;
}
