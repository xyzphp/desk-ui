import { useLayoutEffect, useRef, type RefObject } from 'react';
import { floatingPosition, type FloatingPlacement, type FloatingPoint } from './floatingPosition';
import { useDismiss, type DismissReason } from './useDismiss';
import { useLatest } from './useLatest';

export interface AnchoredLayerOptions {
  open: boolean;
  anchor?: RefObject<HTMLElement | null>;
  point?: FloatingPoint;
  placement?: FloatingPlacement;
  gap?: number;
  matchAnchorWidth?: boolean;
  initialFocus?: false | 'first' | 'last' | RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
  dismissOnFocusOutside?: boolean;
  /** 由父浮层统一处理退出时关闭独立监听。 */
  dismiss?: boolean;
  /** 宿主已用 style 固定位置（拖动 / 缩放后），不再按锚点自动定位。 */
  manual?: boolean;
  onClose?: (reason: DismissReason) => void;
}

const focusable =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

export function useAnchoredLayer<T extends HTMLElement>(panel: RefObject<T | null>, options: AnchoredLayerOptions) {
  const {
    open,
    anchor,
    point,
    placement = 'bottom-start',
    gap = 6,
    matchAnchorWidth = false,
    restoreFocus = true,
    dismissOnFocusOutside = true,
    dismiss = true,
  } = options;
  const latest = useLatest(options);
  const pointX = point?.x,
    pointY = point?.y;
  const restore = useRef(true);
  // 先解除退出监听，再隐藏原生浮层，避免焦点回收被当成外部操作。
  useDismiss({
    open: open && dismiss,
    panel,
    focusOutside: dismissOnFocusOutside,
    scrollOutside: true,
    ignore: (target) => anchor?.current?.contains(target) ?? false,
    onDismiss: (reason) => {
      restore.current = reason === 'escape';
      latest.current.onClose?.(reason);
    },
  });
  useLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const target = anchor?.current;
    const doc = node.ownerDocument;
    const view = doc.defaultView!;
    const previous = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    restore.current = true;
    if (typeof node.showPopover === 'function') node.showPopover();
    const place = () => {
      if (latest.current.manual) {
        node.style.visibility = 'visible';
        return;
      }
      const rect = target?.getBoundingClientRect();
      const x = pointX !== undefined && Number.isFinite(pointX) ? pointX : 8;
      const y = pointY !== undefined && Number.isFinite(pointY) ? pointY : 8;
      const origin = rect ?? { left: x, right: x, top: y, bottom: y, width: 0 };
      if (matchAnchorWidth && rect) {
        node.style.width = `${Math.min(Math.max(160, rect.width), Math.max(0, view.innerWidth - 16))}px`;
      }
      const position = floatingPosition(
        origin,
        node.getBoundingClientRect(),
        {
          width: view.innerWidth,
          height: view.innerHeight,
        },
        placement,
        pointX !== undefined && pointY !== undefined ? 0 : gap,
      );
      node.style.left = `${position.left}px`;
      node.style.top = `${position.top}px`;
      node.style.visibility = 'visible';
    };
    place();
    const focus = latest.current.initialFocus ?? 'first';
    if (focus !== false) {
      // 标题栏拖动手柄等标 data-initial-focus-skip 的元素只供后续 Tab / 指针使用，打开时不抢焦点，否则标题栏会亮起焦点描边。
      const items = Array.from(node.querySelectorAll<HTMLElement>(focusable)).filter(
        (item) => !item.closest('[data-initial-focus-skip]'),
      );
      const preferred =
        typeof focus === 'object'
          ? focus.current
          : focus === 'last'
            ? items.at(-1)
            : (node.querySelector<HTMLElement>('[data-picker-focus="true"]:not(:disabled)') ?? items[0]);
      (preferred ?? node).focus({ preventScroll: true });
    }
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(place);
    observer?.observe(node);
    if (target) observer?.observe(target);
    view.addEventListener('resize', place);
    return () => {
      observer?.disconnect();
      view.removeEventListener('resize', place);
      const focused = doc.activeElement;
      if (typeof node.hidePopover === 'function' && node.matches(':popover-open')) node.hidePopover();
      node.style.visibility = 'hidden';
      if (
        restoreFocus &&
        restore.current &&
        previous?.isConnected &&
        (focused === doc.body || !focused || node.contains(focused))
      ) {
        // 锚点是不可聚焦的容器（如选择器外框）时，焦点还给打开前聚焦的元素，否则会掉到 body。
        (target?.isConnected && target.matches(focusable) ? target : previous).focus({ preventScroll: true });
      }
    };
  }, [open, anchor, pointX, pointY, placement, gap, matchAnchorWidth, panel, latest, restoreFocus]);
}
