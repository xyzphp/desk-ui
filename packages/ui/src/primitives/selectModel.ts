import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/** 原生 option 的只读快照，供 Select 的显示层渲染。 */
export interface Choice {
  index: number;
  value: string;
  label: string;
  disabled: boolean;
  selected: boolean;
  group?: string;
  groupId?: number;
  searchText?: string;
}

export interface SelectSnapshot {
  choices: Choice[];
  selection: Choice[];
  labels: string[];
  name: string;
  disabled: boolean;
}

export interface ChoiceSection {
  id: number;
  group?: string;
  items: Choice[];
}

const emptySnapshot: SelectSnapshot = { choices: [], selection: [], labels: [], name: '', disabled: false };

/** 关联 label 的可访问名称：忽略 Select 自身渲染的内容与 aria-hidden 节点。 */
function labelText(label: HTMLLabelElement) {
  const text = (node: Node): string => {
    if (node instanceof Element && (node.hasAttribute('data-ds-select') || node.getAttribute('aria-hidden') === 'true')) return '';
    return node.nodeType === Node.TEXT_NODE ? node.textContent ?? '' : Array.from(node.childNodes, text).join('');
  };
  return text(label).replace(/\s+/g, ' ').trim();
}

function readChoices(node: HTMLSelectElement): Choice[] {
  const groups = new Map<HTMLOptGroupElement, number>();
  return Array.from(node.options).flatMap((option, index): Choice[] => {
    const parent = option.parentElement;
    const group = parent?.tagName === 'OPTGROUP' ? (parent as HTMLOptGroupElement) : undefined;
    if (option.hidden || group?.hidden) return [];
    if (group && !groups.has(group)) groups.set(group, groups.size);
    return [{
      index,
      value: option.value,
      label: option.label,
      disabled: option.disabled || Boolean(group?.disabled),
      selected: option.selected,
      searchText: option.dataset.searchText,
      group: group?.label,
      groupId: group ? groups.get(group) : undefined,
    }];
  });
}

function readSnapshot(node: HTMLSelectElement): SelectSnapshot {
  return {
    choices: readChoices(node),
    selection: Array.from(node.options).flatMap((option, index) => option.selected ? [{
      index, value: option.value, label: option.label, selected: true,
      disabled: option.disabled || option.parentElement?.tagName === 'OPTGROUP' && (option.parentElement as HTMLOptGroupElement).disabled,
    }] : []),
    labels: Array.from(node.selectedOptions, (option) => option.label),
    name: Array.from(node.labels ?? [], labelText).join(' '),
    disabled: node.matches(':disabled'),
  };
}

function sameChoice(a: Choice, b: Choice) {
  return a.index === b.index && a.value === b.value && a.label === b.label && a.disabled === b.disabled
    && a.selected === b.selected && a.group === b.group && a.groupId === b.groupId && a.searchText === b.searchText;
}

function sameSnapshot(a: SelectSnapshot, b: SelectSnapshot) {
  return a.name === b.name && a.disabled === b.disabled
    && a.selection.length === b.selection.length && a.selection.every((choice, i) => sameChoice(choice, b.selection[i]!))
    && a.labels.length === b.labels.length && a.labels.every((label, i) => label === b.labels[i])
    && a.choices.length === b.choices.length && a.choices.every((choice, i) => sameChoice(choice, b.choices[i]!));
}

/** 相邻且同组的选项归为一段，供分组标题渲染。 */
export function groupChoices(choices: readonly Choice[]): ChoiceSection[] {
  const sections: ChoiceSection[] = [];
  for (const item of choices) {
    const previous = sections.at(-1);
    if (previous && previous.items[0]?.groupId === item.groupId) previous.items.push(item);
    else sections.push({ id: item.index, group: item.group, items: [item] });
  }
  return sections;
}

/** 默认激活项：已选中的可用项，否则第一个可用项。 */
export function defaultActiveIndex(choices: readonly Choice[]) {
  return (choices.find((item) => item.selected && !item.disabled) ?? choices.find((item) => !item.disabled))?.index;
}

/**
 * 读取原生 select 的选项快照。每次渲染后同步一次（React 子节点变化），
 * 并监听 DOM 变更与外层 fieldset 的 disabled；内容未变化时保持引用不变。
 */
export function useSelectSnapshot(native: RefObject<HTMLSelectElement | null>) {
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const sync = useCallback(() => {
    const node = native.current;
    if (!node) return;
    const next = readSnapshot(node);
    setSnapshot((last) => (sameSnapshot(last, next) ? last : next));
  }, [native]);

  useLayoutEffect(sync);
  useEffect(() => {
    const node = native.current;
    if (!node) return;
    const observer = new MutationObserver(sync);
    observer.observe(node, { childList: true, subtree: true, attributes: true, characterData: true });
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'FIELDSET') observer.observe(parent, { attributes: true, attributeFilter: ['disabled'] });
    }
    return () => observer.disconnect();
  }, [native, sync]);

  return [snapshot, sync] as const;
}
