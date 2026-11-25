import { useId, useImperativeHandle, useRef, useState, type ComponentProps, type FormEvent } from 'react';
import { useFormReset } from '../foundation/useFormReset';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldContext, useFieldProps } from './FieldContext';
import { useSelectSnapshot, type Choice } from './selectModel';

export interface SelectBaseProps extends ComponentProps<'select'> {
  placeholder?: string;
  emptyText?: string;
  labels?: Partial<{ placeholder: string; empty: string }>;
}

/** 所有选择器共用原生表单、快照、约束与真实 change 事件。 */
export function useSelectForm(props: SelectBaseProps, onReset: () => void) {
  const native = useRef<HTMLSelectElement>(null);
  const id = useId();
  const context = useFieldContext();
  const field = useFieldProps(props);
  const labels = useLabels('select', props.labels);
  const [snapshot, sync] = useSelectSnapshot(native);
  const [error, setError] = useState('');
  const placeholder = props.placeholder ?? labels.placeholder;
  useImperativeHandle(props.ref, () => native.current!, []);
  useFormReset(native, () => {
    const node = native.current;
    if (!node) return;
    if (props.value !== undefined) {
      const selected = new Set((Array.isArray(props.value) ? props.value : [props.value]).map(String));
      for (const option of node.options) option.selected = selected.has(option.value);
    }
    setError(''); sync(); onReset();
  }, props.form);
  const commit = (mutate: (node: HTMLSelectElement) => void) => {
    const node = native.current;
    if (!node || node.matches(':disabled')) return;
    const before = Array.from(node.options, (option, index) => option.selected ? index : -1).join(',');
    mutate(node);
    const after = Array.from(node.options, (option, index) => option.selected ? index : -1).join(',');
    if (before === after) return;
    const view = node.ownerDocument.defaultView!;
    node.dispatchEvent(new view.Event('input', { bubbles: true }));
    node.dispatchEvent(new view.Event('change', { bubbles: true }));
  };
  const choose = (item: Choice, selected?: boolean) => {
    if (item.disabled) return;
    commit((node) => {
      const option = node.options[item.index];
      if (!option) return;
      if (node.multiple) option.selected = selected ?? !option.selected;
      else node.selectedIndex = item.index;
    });
  };
  const clear = () => commit((node) => {
    if (!node.multiple) { node.selectedIndex = Array.from(node.options).findIndex((option) => option.value === ''); return; }
    for (const option of node.options) {
      const group = option.parentElement;
      if (!option.disabled && !(group?.tagName === 'OPTGROUP' && (group as HTMLOptGroupElement).disabled)) option.selected = false;
    }
  });
  const invalid = (event: FormEvent<HTMLSelectElement>) => {
    props.onInvalid?.(event);
    if (event.defaultPrevented) return false;
    event.preventDefault(); setError(event.currentTarget.validationMessage); return true;
  };
  const labelBy = props['aria-labelledby'] ?? (!props['aria-label'] ? context?.labelId : undefined);
  return {
    native, id, snapshot, sync, field, choose, clear, invalidate: invalid, error,
    placeholder, emptyText: props.emptyText ?? labels.empty,
    labelBy, label: props['aria-label'] ?? (snapshot.name || props.title || placeholder),
    blocked: !!props.disabled || snapshot.disabled,
    description: [field['aria-describedby'], error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined,
    invalid: field['aria-invalid'] || !!error || undefined,
    onChange: ((event) => {
      props.onChange?.(event);
      if (event.currentTarget.validity.valid) setError('');
      sync(); queueMicrotask(sync);
    }) as NonNullable<SelectBaseProps['onChange']>,
  };
}

export type SelectFormState = ReturnType<typeof useSelectForm>;
