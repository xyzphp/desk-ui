import { useEffect, type RefObject } from 'react';
import { useLatest } from './useLatest';

/**
 * 管理原生 <dialog> 的模态生命周期：打开时 showModal 并设置初始焦点，
 * 关闭或卸载时 close，并在焦点仍停留在对话框内（或已丢失）时还原到打开前的元素。
 */
export function useModalDialog(dialog: RefObject<HTMLDialogElement | null>, open: boolean, focusInitial: () => void) {
  const latest = useLatest(focusInitial);
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    const doc = node.ownerDocument;
    const previous = doc.activeElement;
    if (!node.open) node.showModal();
    latest.current();
    return () => {
      const focused = doc.activeElement;
      const restore = focused === doc.body || focused === node || node.contains(focused);
      if (node.open) node.close();
      if (restore && previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [dialog, open, latest]);
}
