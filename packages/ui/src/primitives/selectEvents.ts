import { useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import type { SelectBaseProps } from './useSelectForm';

export function relaySelectKey(event: KeyboardEvent<HTMLElement>, node: HTMLSelectElement, type: 'keydown' | 'keyup') {
  const view = node.ownerDocument.defaultView!;
  const forwarded = new view.KeyboardEvent(type, {
    key: event.key, code: event.code, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey,
    shiftKey: event.shiftKey, repeat: event.repeat, isComposing: event.nativeEvent.isComposing, bubbles: true, cancelable: true,
  });
  node.dispatchEvent(forwarded);
  event.stopPropagation();
  if (forwarded.defaultPrevented) event.preventDefault();
}

export function useSelectFocus(
  native: RefObject<HTMLSelectElement | null>, root: RefObject<HTMLDivElement | null>, props: SelectBaseProps, focusVisible: () => void,
) {
  const focused = useRef(false);
  const forward = (type: 'focusin' | 'focusout', relatedTarget: EventTarget | null) => {
    const node = native.current;
    if (!node) return;
    const view = node.ownerDocument.defaultView!;
    node.dispatchEvent(new view.FocusEvent(type, { bubbles: true, relatedTarget }));
  };
  return {
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      if (event.nativeEvent.target === native.current || focused.current) return;
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      focused.current = true; forward('focusin', event.relatedTarget);
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (event.nativeEvent.target === native.current) return;
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      focused.current = false; forward('focusout', event.relatedTarget);
    },
    nativeFocus: (event: FocusEvent<HTMLSelectElement>) => {
      focused.current = true; props.onFocus?.(event);
      if (event.currentTarget.ownerDocument.activeElement === event.currentTarget) focusVisible();
    },
    nativeBlur: (event: FocusEvent<HTMLSelectElement>) => {
      if (event.relatedTarget instanceof Node && root.current?.contains(event.relatedTarget)) return;
      focused.current = false; props.onBlur?.(event);
    },
  };
}
