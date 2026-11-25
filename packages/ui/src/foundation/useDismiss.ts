import { useLayoutEffect, type RefObject } from 'react';
import { useLatest } from './useLatest';

export type DismissReason = 'escape' | 'outside' | 'focus-out' | 'scroll';
export interface DismissOptions {
  open: boolean;
  /** 面板根节点：点击其内部不算外部。 */
  panel: RefObject<HTMLElement | null>;
  onDismiss?: (reason: DismissReason) => void;
  /** 额外不算外部的点击目标，如触发按钮。 */
  ignore?: (target: Element) => boolean;
  focusOutside?: boolean;
  scrollOutside?: boolean;
}

const layers = new WeakMap<Document, HTMLElement[]>();

/** 同一文档只关闭最上层；嵌套层在父层之后。回调变化不重绑监听。 */
export function useDismiss({ open, panel, onDismiss, ignore, focusOutside = false, scrollOutside = false }: DismissOptions) {
  const latest = useLatest({ onDismiss, ignore });
  useLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const doc = node.ownerDocument;
    const stack = layers.get(doc) ?? [];
    layers.set(doc, stack);
    const child = stack.findIndex((item) => node.contains(item));
    stack.splice(child < 0 ? stack.length : child, 0, node);
    const isTop = () => {
      const modal = Array.from(doc.querySelectorAll('dialog[open]')).at(-1);
      return stack.at(-1) === node && (!modal || modal.contains(node));
    };
    const inside = (target: EventTarget | null) => target instanceof Element
      && (node.contains(target) || latest.current.ignore?.(target));
    const onPointerDown = (event: PointerEvent) => {
      if (isTop() && !inside(event.target)) latest.current.onDismiss?.('outside');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // 有意拦截：最上层弹层独占 Esc，避免同时关闭下层弹层或宿主窗口（2026-11-05 确认保持）。
      // 面板内控件需要自己的 Esc 行为时，应在 onDismiss 里按 reason 处理，不依赖事件继续冒泡。
      if (event.key !== 'Escape' || event.defaultPrevented || !isTop()) return;
      event.preventDefault();
      event.stopPropagation();
      latest.current.onDismiss?.('escape');
    };
    const focus = (event: FocusEvent) => {
      if (focusOutside && isTop() && !inside(event.target)) latest.current.onDismiss?.('focus-out');
    };
    const scroll = (event: Event) => {
      if (scrollOutside && isTop() && !(event.target instanceof Node && node.contains(event.target))) {
        latest.current.onDismiss?.('scroll');
      }
    };
    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('keydown', onKeyDown, true);
    doc.addEventListener('focusin', focus);
    doc.addEventListener('scroll', scroll, true);
    return () => {
      const index = stack.indexOf(node);
      if (index >= 0) stack.splice(index, 1);
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('focusin', focus);
      doc.removeEventListener('scroll', scroll, true);
    };
  }, [open, panel, latest, focusOutside, scrollOutside]);
}
