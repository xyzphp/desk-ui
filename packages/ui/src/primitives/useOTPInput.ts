import { useRef, useState } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import type { OTPInputProps } from './OTPInput';

export const otpLength = (length = 6) => Number.isFinite(length) ? Math.max(1, Math.min(12, Math.floor(length))) : 6;
export const otpDigits = (text: string, length: number) => text.normalize('NFKC').replace(/[^0-9]/g, '').slice(0, length);

export function useOTPInput(props: OTPInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const [composition, setComposition] = useState<string>();
  const [cursor, setCursor] = useState({ position: 0 });
  // 粘贴不经过原生 change；即使光标未变，也需提交一次渲染以恢复宿主拒绝的受控值。
  const setPosition = (position: number) => setCursor({ position });
  const [error, setError] = useState('');
  const length = otpLength(props.length);
  const [raw, change] = useControllable(props.value, otpDigits(props.defaultValue ?? '', length), props.onValueChange);
  const value = otpDigits(raw, length);
  const update = (text: string) => {
    if (props.readOnly || input.current?.matches(':disabled')) return;
    const next = otpDigits(text, length);
    if (input.current) input.current.value = next;
    if (next !== value) change(next);
    setError('');
  };
  useFormReset(input, () => {
    const restored = otpDigits(props.value ?? props.defaultValue ?? '', length);
    if (props.value === undefined) change(restored);
    if (input.current) input.current.value = restored;
    composing.current = false; setComposition(undefined); setError(''); setPosition(0);
  }, props.form);
  return { input, composing, composition, setComposition, position: cursor.position, setPosition, error, setError, length, value, update };
}
