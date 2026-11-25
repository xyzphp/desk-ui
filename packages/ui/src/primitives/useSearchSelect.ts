import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useControllable } from '../foundation/useControllable';
import { matchesSearch } from '../foundation/search';
import type { SelectSearchOptions } from './Select';
import { useSelectForm, type SelectBaseProps } from './useSelectForm';
import { defaultActiveIndex, type Choice } from './selectModel';
import { relaySelectKey, useSelectFocus } from './selectEvents';

export function useSearchSelect(props: SelectBaseProps, options: SelectSearchOptions) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useControllable(options.query, options.defaultQuery ?? '', options.onQueryChange);
  const [active, setActive] = useState<number>();
  const form = useSelectForm(props, () => {
    setOpen(false);
    if (options.query === undefined) setQuery(options.defaultQuery ?? '');
  });
  const canOpen = !form.blocked && !options.readOnly;
  const expanded = open && canOpen;
  const choices = form.snapshot.choices.filter((item) => matchesSearch(
    `${item.label} ${item.value} ${item.group ?? ''} ${item.searchText ?? ''}`, query,
  ));
  const enabled = choices.filter((item) => !item.disabled);
  const activeIndex = options.loading ? undefined
    : enabled.some((item) => item.index === active) ? active : defaultActiveIndex(enabled);
  const listId = `${form.id}-options`;
  const focusVisible = () => (props.multiple ? trigger.current : input.current)?.focus({ preventScroll: true });
  const focus = useSelectFocus(form.native, root, props, focusVisible);
  const close = () => { setOpen(false); setQuery(''); };
  const choose = (item: Choice) => {
    if (!canOpen || options.loading || item.disabled) return;
    form.choose(item);
    if (!props.multiple) {
      close();
      queueMicrotask(() => input.current?.select());
    }
  };
  useEffect(() => { if (!canOpen) setOpen(false); }, [canOpen]);
  useLayoutEffect(() => {
    if (expanded && activeIndex !== undefined) {
      root.current?.ownerDocument.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [expanded, activeIndex, listId]);
  const key = (event: KeyboardEvent<HTMLElement>) => {
    relaySelectKey(event, form.native.current!, 'keydown');
    if (event.defaultPrevented || !canOpen || composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); return; }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = enabled.findIndex((item) => item.index === activeIndex);
    let next: Choice | undefined;
    if (event.key === 'ArrowDown') next = expanded ? enabled[(index + 1) % enabled.length] : enabled[0];
    else if (event.key === 'ArrowUp') next = expanded && index >= 0
      ? enabled[(index - 1 + enabled.length) % enabled.length] : enabled.at(-1);
    else if (expanded && event.key === 'Home') next = enabled[0];
    else if (expanded && event.key === 'End') next = enabled.at(-1);
    else if (expanded && event.key === 'Enter') {
      event.preventDefault();
      const item = choices.find((choice) => choice.index === activeIndex);
      if (item) choose(item);
      return;
    } else if (props.multiple && event.key === 'Backspace' && !query && !options.loading) {
      const item = form.snapshot.selection.filter((choice) => !choice.disabled).at(-1);
      if (item) { event.preventDefault(); form.choose(item, false); }
      return;
    }
    if (next) { event.preventDefault(); setActive(next.index); setOpen(true); }
  };
  return {
    root, input, trigger, anchor, composing, form, focus, open: expanded, setOpen, query, setQuery, choices,
    activeIndex, setActive, listId, canOpen, focusVisible, close, choose, key,
  };
}
