import { useEffect, useRef, type RefObject } from 'react';
import { useLatest } from './useLatest';

/** 异步期间按钮禁用时保留层内焦点，结束后恢复可操作入口。 */
export function useBusyFocus(root: RefObject<HTMLElement | null>, open: boolean, busy: boolean, focusInitial: () => void) {
  const latest = useLatest(focusInitial);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = root.current;
    if (!open || !node) return;
    const doc = node.ownerDocument;
    const remember = (target: EventTarget | null) => {
      if (target instanceof HTMLElement && target !== doc.body) previous.current = node.contains(target) ? target : null;
    };
    remember(doc.activeElement);
    const focused = (event: FocusEvent) => remember(event.target);
    doc.addEventListener('focusin', focused);
    return () => { doc.removeEventListener('focusin', focused); previous.current = null; };
  }, [root, open]);
  useEffect(() => {
    const node = root.current;
    if (!open || !node) return;
    const focused = node.ownerDocument.activeElement;
    const blocked = (element: HTMLElement) => element.matches(':disabled') || !!element.closest('[inert]');
    const disabledFocus = focused instanceof HTMLElement && blocked(focused) && node.contains(focused);
    const blurredDisabled = focused === node.ownerDocument.body && previous.current && blocked(previous.current);
    if (busy && (disabledFocus || blurredDisabled)) node.focus();
    else if (!busy && focused === node) latest.current();
  }, [busy, open, root, latest]);
}
