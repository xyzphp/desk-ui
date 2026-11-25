import { useLayoutEffect, useRef, useState } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { normalizeColor } from './colorModel';
import type { ColorPickerProps } from './ColorPicker';

export function useColorPicker(props: ColorPickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const [value, change] = useControllable(props.value, props.defaultValue ?? '', props.onValueChange);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const observed = useRef(value);
  const expected = useRef<string | undefined>(undefined);
  const color = normalizeColor(value);
  const blocked = !!props.disabled || !!props.readOnly;
  useLayoutEffect(() => {
    if (expected.current !== undefined) {
      if (value !== expected.current) setDraft(value);
    } else if (value !== observed.current) setDraft(value);
    observed.current = value; expected.current = undefined;
  }, [value, draft]);
  useFormReset(input, () => {
    const restored = props.value ?? props.defaultValue ?? '';
    if (props.value === undefined) change(restored);
    setDraft(restored); setError('');
  }, props.form);
  const update = (text: string, canonical = false) => {
    if (blocked || input.current?.matches(':disabled')) return;
    const normalized = normalizeColor(text);
    setDraft(canonical && normalized !== undefined ? normalized : text);
    if (normalized !== undefined) { expected.current = normalized; change(normalized); setError(''); }
  };
  const finish = () => {
    const normalized = normalizeColor(draft);
    if (normalized === undefined) { setError(input.current?.validationMessage ?? ''); return; }
    update(normalized, true);
  };
  return { input, value, draft, setDraft, color, error, setError, blocked, update, finish };
}
