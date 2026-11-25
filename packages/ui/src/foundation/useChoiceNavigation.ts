import { useLayoutEffect, useState, type KeyboardEvent, type RefObject } from 'react';

export interface NavigableChoice { id: string; disabled?: boolean }
interface ChoiceNavigationOptions<T> {
  initialId?: string;
  virtual?: boolean;
  columns?: number;
  onChoose: (item: T) => void;
}
/** 搜索命令保留输入焦点，启动器 / 窗口列表使用原生按钮焦点；共用跳过禁用项与首尾逻辑。 */
export function useChoiceNavigation<T extends NavigableChoice>(
  items: readonly T[], root: RefObject<HTMLElement | null>, options: ChoiceNavigationOptions<T>,
) {
  const [preferred, setPreferred] = useState(options.initialId ?? '');
  const matched = items.findIndex((item) => item.id === preferred && !item.disabled);
  const index = matched >= 0 ? matched : items.findIndex((item) => !item.disabled);
  const active = items[index];
  const activeId = active?.id;
  useLayoutEffect(() => {
    if (!activeId || !root.current?.contains(root.current.ownerDocument.activeElement)) return;
    Array.from(root.current.querySelectorAll<HTMLElement>('[data-choice-id]'))
      .find((node) => node.dataset.choiceId === activeId)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeId, root]);
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (options.virtual && event.key === 'Enter') {
      event.preventDefault(); if (active) options.onChoose(active); return;
    }
    const columns = options.columns ?? 1;
    const delta = event.key === 'ArrowDown' ? columns : event.key === 'ArrowUp' ? -columns
      : !options.virtual && event.key === 'ArrowRight' ? 1 : !options.virtual && event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    if (options.virtual && (event.key === 'Home' || event.key === 'End')) return;
    event.preventDefault();
    if (!items.length) return;
    if (Math.abs(delta) > 1 && (index + delta < 0 || index + delta >= items.length)) return;
    const direction = event.key === 'End' || delta < 0 ? -1 : 1;
    let target = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : (index + delta + items.length * (Math.abs(delta) + 1)) % items.length;
    for (let count = 0; count < items.length; count++) {
      const item = items[target];
      if (item && !item.disabled) {
        setPreferred(item.id);
        if (!options.virtual) Array.from(root.current?.querySelectorAll<HTMLElement>('[data-choice-id]') ?? [])
          .find((node) => node.dataset.choiceId === item.id)?.focus();
        return;
      }
      target = (target + direction + items.length) % items.length;
    }
  };
  return { active, index, setActive: setPreferred, keyDown };
}
