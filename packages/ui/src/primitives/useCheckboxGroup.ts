import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import type { CheckboxGroupProps } from './CheckboxGroup';

export function useCheckboxGroup(props: CheckboxGroupProps, requiredMessage: string) {
  const root = useRef<HTMLFieldSetElement>(null);
  const id = useId();
  const [selected, setSelected] = useControllable(props.value, props.defaultValue ?? [], props.onValueChange);
  const [localError, setLocalError] = useState('');
  const controls = () => Array.from(root.current?.querySelectorAll<HTMLInputElement>('[data-checkbox-option]') ?? []);
  const syncValidity = () => {
    const inputs = controls();
    inputs.forEach((input) => input.setCustomValidity(''));
    const enabled = inputs.filter((input) => !input.matches(':disabled'));
    if (props.required && !enabled.some((input) => input.checked)) enabled[0]?.setCustomValidity(requiredMessage);
  };
  useLayoutEffect(syncValidity);
  useFormReset(root, () => {
    const restored = props.value ?? props.defaultValue ?? [];
    if (props.value === undefined) setSelected(restored);
    controls().forEach((input) => { input.checked = restored.includes(input.value); });
    setLocalError(''); syncValidity();
  }, props.form);
  const change = (value: string, checked: boolean) => {
    if (props.disabled || props.readOnly) return;
    const next = checked ? [...new Set([...selected, value])] : selected.filter((item) => item !== value);
    setSelected(next); setLocalError('');
    queueMicrotask(syncValidity);
  };
  return { root, id, selected, localError, setLocalError, change };
}
