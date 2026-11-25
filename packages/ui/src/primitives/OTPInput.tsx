import { useId, useImperativeHandle, type ComponentProps, type CSSProperties } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldProps } from './FieldContext';
import { otpDigits, useOTPInput } from './useOTPInput';

export interface OTPInputProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'maxLength' | 'pattern' | 'size' | 'children'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  length?: number;
  labels?: Partial<{ input: string }>;
}
/** 一个原生输入承接粘贴与自动填充，分段格只负责视觉，避免多输入的表单与辅助技术负担。 */
export function OTPInput(props: OTPInputProps) {
  const { value, defaultValue, onValueChange, length, labels: overrides, ref, className, style,
    onChange, onCompositionStart, onCompositionEnd, onPaste, onSelect, onPointerDown, onInvalid, ...rest } = props;
  const { input, composing, ...state } = useOTPInput(props);
  const labels = useLabels('otpInput', overrides);
  const field = useFieldProps(props);
  const id = useId();
  useImperativeHandle(ref, () => input.current!, [input]);
  const description = [field['aria-describedby'], state.error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;
  return <div className={cx('ds-otp', className)} style={style}>
    <div className="ds-otp-control" style={{ '--ds-otp-length': state.length } as CSSProperties}>
      <input {...rest} {...field} ref={input} className="ds-control-input ds-otp-input" type="text"
        inputMode="numeric" autoComplete={rest.autoComplete ?? 'one-time-code'} spellCheck={false}
        aria-label={rest['aria-label'] ?? (field.id || rest['aria-labelledby'] ? undefined : labels.input)}
        value={state.composition ?? state.value} pattern={`[0-9]{${state.length}}`}
        aria-describedby={description} aria-invalid={field['aria-invalid'] || !!state.error || undefined}
        onChange={(event) => {
          if (composing.current) state.setComposition(event.currentTarget.value);
          else state.update(event.currentTarget.value);
          state.setPosition(event.currentTarget.selectionStart ?? 0); onChange?.(event);
        }} onCompositionStart={(event) => {
          composing.current = true; state.setComposition(event.currentTarget.value); onCompositionStart?.(event);
        }} onCompositionEnd={(event) => {
          composing.current = false; state.setComposition(undefined); state.update(event.currentTarget.value);
          state.setPosition(event.currentTarget.selectionStart ?? 0); onCompositionEnd?.(event);
        }} onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented || composing.current || props.readOnly || event.currentTarget.matches(':disabled')) return;
          event.preventDefault();
          const pasted = otpDigits(event.clipboardData.getData('text'), state.length);
          if (!pasted) return;
          const input = event.currentTarget;
          const start = input.selectionStart ?? 0, end = input.selectionEnd ?? start;
          const next = pasted.length === state.length ? pasted : state.value.slice(0, start) + pasted + state.value.slice(end);
          state.update(next);
          const caret = Math.min(state.length, pasted.length === state.length ? state.length : start + pasted.length);
          input.setSelectionRange(caret, caret); state.setPosition(caret);
        }} onSelect={(event) => { state.setPosition(event.currentTarget.selectionStart ?? 0); onSelect?.(event); }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || event.button !== 0) return;
          event.preventDefault();
          const input = event.currentTarget, rect = input.getBoundingClientRect();
          const hit = rect.width > 0 ? Math.floor((event.clientX - rect.left) / rect.width * state.length) : state.value.length;
          const index = Math.max(0, Math.min(state.value.length, state.length - 1, hit));
          input.focus(); input.setSelectionRange(index, Math.min(index + 1, state.value.length)); state.setPosition(index);
        }} onInvalid={(event) => {
          onInvalid?.(event); if (event.defaultPrevented) return;
          event.preventDefault(); state.setError(event.currentTarget.validationMessage); event.currentTarget.focus();
        }} />
      {Array.from({ length: state.length }, (_, index) => <span key={index} aria-hidden="true" className="ds-otp-cell"
        data-active={index === Math.min(state.position, state.length - 1) || undefined}>{state.value[index] ?? ''}</span>)}
    </div>
    {state.error && <p id={`${id}-error`} className="ds-field-error" role="alert">{state.error}</p>}
  </div>;
}
