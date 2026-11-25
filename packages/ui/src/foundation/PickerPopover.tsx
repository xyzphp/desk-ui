import type { ReactNode, RefObject } from 'react';
import { AnchorPopover } from './AnchorPopover';
import { cx } from './cx';

/** 选择器内容适配；定位、顶层、关闭和焦点由公共锚点层处理。 */
export function PickerPopover({
  open, anchor, label, onClose, children, className, role = 'dialog', matchAnchorWidth = false, gap,
}: {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  label: string;
  onClose: (restoreFocus: boolean) => void;
  children: ReactNode;
  className?: string;
  role?: 'dialog' | 'presentation';
  matchAnchorWidth?: boolean;
  /** 锚点与弹出层的间距；双月日历等并排面板传 0。 */
  gap?: number;
}) {
  return <AnchorPopover
    open={open} anchor={anchor} role={role} aria-label={role === 'dialog' ? label : undefined} gap={gap}
    matchAnchorWidth={matchAnchorWidth} className={cx('ds-picker-popover', className)}
    onClose={(reason) => onClose(reason === 'escape')}
  >{children}</AnchorPopover>;
}
