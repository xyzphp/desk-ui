import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useControllable } from '../foundation/useControllable';
import { treeModel, type TreeEntry } from './treeModel';
import type { TreeProps } from './Tree';

export function useTree(props: TreeProps) {
  const root = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const search = useRef({ text: '', at: 0 });
  const focusWithin = useRef(false);
  const [value, setValue] = useControllable(props.value, props.defaultValue ?? null, props.onValueChange);
  const [expanded, setExpanded] = useControllable(props.expanded, props.defaultExpanded ?? [], props.onExpandedChange);
  const [focused, setFocused] = useState<string>();
  const model = treeModel(props.nodes, expanded, props.disabled);
  let candidate = focused;
  while (candidate && !model.enabled.some((item) => item.node.id === candidate)) candidate = model.index.get(candidate)?.parent;
  const active = candidate ?? model.enabled.find((item) => item.node.id === value)?.node.id ?? model.enabled[0]?.node.id;
  const idOf = (id: string) => `${prefix}-${encodeURIComponent(id)}`;
  const focus = (id: string | undefined) => {
    if (!id) return;
    setFocused(id);
    root.current?.ownerDocument.getElementById(idOf(id))?.focus({ preventScroll: true });
  };
  const toggle = (entry: TreeEntry) => {
    if (entry.disabled || !entry.node.children?.length) return;
    setExpanded(model.opened.has(entry.node.id) ? expanded.filter((id) => id !== entry.node.id) : [...expanded, entry.node.id]);
  };
  const select = (entry: TreeEntry) => {
    if (!entry.disabled && entry.node.selectable !== false) setValue(entry.node.id);
  };
  useLayoutEffect(() => {
    const element = root.current;
    const current = element?.ownerDocument.activeElement;
    const lostFocus = current === element?.ownerDocument.body && focusWithin.current;
    const staleFocus = element?.contains(current ?? null) && current instanceof HTMLElement
      && current.getAttribute('role') === 'treeitem' && current.tabIndex < 0;
    if (lostFocus || staleFocus) focus(active);
  });
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'treeitem') return;
    const entry = model.index.get(target.dataset.treeId ?? '');
    if (!entry || entry.disabled) return;
    const offset = model.enabled.indexOf(entry);
    let next: string | undefined;
    if (event.key === 'ArrowDown') next = model.enabled[Math.min(offset + 1, model.enabled.length - 1)]?.node.id;
    else if (event.key === 'ArrowUp') next = model.enabled[Math.max(0, offset - 1)]?.node.id;
    else if (event.key === 'Home') next = model.enabled[0]?.node.id;
    else if (event.key === 'End') next = model.enabled.at(-1)?.node.id;
    else if (event.key === 'ArrowRight') {
      if (!model.opened.has(entry.node.id)) toggle(entry);
      else next = entry.node.children?.find((node) => !node.disabled)?.id;
    } else if (event.key === 'ArrowLeft') {
      if (model.opened.has(entry.node.id) && entry.node.children?.length) toggle(entry);
      else next = entry.parent;
    } else if (event.key === 'Enter' || event.key === ' ') {
      select(entry);
      if (event.key === 'Enter') props.onActivate?.(entry.node);
    } else if (event.key.length === 1) {
      const now = Date.now();
      const character = event.key.toLocaleLowerCase();
      const previous = now - search.current.at < 700 ? search.current.text : '';
      const text = previous === character ? character : previous + character;
      search.current = { text, at: now };
      const ordered = [...model.enabled.slice(offset + 1), ...model.enabled.slice(0, offset + 1)];
      next = ordered.find((item) => item.node.label.toLocaleLowerCase().startsWith(text))?.node.id;
    } else return;
    event.preventDefault(); event.stopPropagation(); focus(next);
  };
  return { root, focusWithin, value, model, active, idOf, focus, toggle, select, key, setFocused };
}
