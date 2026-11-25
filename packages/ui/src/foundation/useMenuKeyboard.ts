import { useRef, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';

const selector = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
const menuRole = '[role="menu"]';

export function menuItemIn(panel: HTMLElement | null, target: EventTarget | null) {
  const item = target instanceof Element ? target.closest<HTMLButtonElement>(selector) : null;
  return item && item.closest(menuRole) === panel ? item : null;
}

export function menuItemsIn(panel: HTMLElement | null) {
  return Array.from(panel?.querySelectorAll<HTMLButtonElement>(selector) ?? []).filter((item) =>
    item.closest(menuRole) === panel && !item.matches(':disabled, [aria-disabled="true"]') && !item.closest('[hidden], [inert]'));
}

/** 动作菜单每层只导航自身条目，分隔与禁用项不参与焦点循环。 */
export function useMenuKeyboard(
  panel: RefObject<HTMLDivElement | null>, onClose?: () => void, anchor?: RefObject<HTMLElement | null>,
) {
  const search = useRef({ text: '', at: 0 });
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      const node = panel.current;
      if (!node) return;
      const outside = Array.from(node.ownerDocument.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]',
      )).filter((item) => item.tabIndex >= 0 && !item.matches(':disabled') && !item.closest('[hidden], [inert]')
        && !node.contains(item));
      const index = outside.indexOf(anchor?.current as HTMLElement);
      const following = outside.filter((item) => node.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING);
      const preceding = outside.filter((item) => node.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING);
      const next = index >= 0 ? outside[index + (event.shiftKey ? -1 : 1)]
        : event.shiftKey ? preceding.at(-1) : following[0];
      const destination = next ?? anchor?.current;
      onClose?.();
      queueMicrotask(() => destination?.focus({ preventScroll: true }));
      return;
    }
    if ((event.target as Element).closest(menuRole) !== panel.current) return;
    const list = menuItemsIn(panel.current);
    const current = list.indexOf(event.target as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (event.key === 'ArrowDown') next = list[(current + 1) % list.length];
    else if (event.key === 'ArrowUp') next = current < 0 ? list.at(-1) : list[(current - 1 + list.length) % list.length];
    else if (event.key === 'Home') next = list[0];
    else if (event.key === 'End') next = list.at(-1);
    else if (event.key.length === 1 && event.key !== ' ') {
      const now = Date.now();
      const character = event.key.toLocaleLowerCase();
      const previous = now - search.current.at < 700 ? search.current.text : '';
      const text = previous === character ? character : previous + character;
      search.current = { text, at: now };
      const ordered = [...list.slice(current + 1), ...list.slice(0, current + 1)];
      next = ordered.find((item) => (item.dataset.textValue ?? item.textContent ?? '').trim().toLocaleLowerCase().startsWith(text));
    } else return;
    event.preventDefault();
    event.stopPropagation();
    next?.focus({ preventScroll: true });
  };
  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const item = menuItemIn(panel.current, event.target);
    if (item && !item.matches(':disabled, [aria-disabled="true"]')) item.focus({ preventScroll: true });
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const item = menuItemIn(panel.current, event.target);
    if (!event.defaultPrevented && item && !item.matches(':disabled')
      && item.getAttribute('aria-disabled') !== 'true') onClose?.();
  };
  return { onKeyDown, onMouseMove, onClick };
}
