import { useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import type { InputNumberLabels } from '../foundation/locale';
import { commitInput } from '../foundation/commitInput';
import { nextNumber, numberPrecision, numberText, numberValue } from '../foundation/number';
import { useFormReset } from '../foundation/useFormReset';
import { useFieldProps } from './FieldContext';

export interface InputNumberProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'min' | 'max'> {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  /** 失焦和步进时舍入到 0–12 位，不在每次键入时重写草稿。 */
  precision?: number;
  controls?: boolean;
  onValueChange?: (value: number | null) => void;
  labels?: Partial<InputNumberLabels>;
}

export function InputNumber({
  value, defaultValue, min, max, step = 1, precision, controls = true, onValueChange, labels: overrides,
  ref, className, style, disabled, readOnly, onChange, onBlur, onKeyDown, onCompositionStart, onCompositionEnd, ...rest
}: InputNumberProps) {
  const labels = useLabels('inputNumber', overrides);
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const [limits, setLimits] = useState({ increase: false, decrease: false });
  const field = useFieldProps(rest);
  const actualStep = step === 'any' || Number(step) > 0 && Number.isFinite(Number(step)) ? step : 1;
  useImperativeHandle(ref, () => input.current!, []);
  const sync = () => {
    const node = input.current;
    if (!node) return;
    const next = {
      increase: nextNumber(node, 1, precision) === node.value,
      decrease: nextNumber(node, -1, precision) === node.value,
    };
    setLimits((previous) => previous.increase === next.increase && previous.decrease === next.decrease ? previous : next);
  };
  useLayoutEffect(sync, [value, min, max, actualStep, precision, disabled, readOnly]);
  useFormReset(input, () => {
    if (value !== undefined && input.current) input.current.value = numberText(value);
    sync();
  }, rest.form);
  const increment = (direction: 1 | -1) => {
    const node = input.current;
    if (!node || node.matches(':disabled') || readOnly || composing.current) return;
    commitInput(node, nextNumber(node, direction, precision));
    queueMicrotask(sync);
  };
  return <div
    className={cx('ds-picker-surface ds-number-input', disabled && 'is-disabled', readOnly && 'is-readonly', className)}
    style={style}
  >
    <input
      {...rest} {...field} ref={input} className="ds-control-input ds-number-entry" type="number"
      value={value === undefined ? undefined : numberText(value)}
      defaultValue={value === undefined ? numberText(defaultValue) : undefined}
      min={Number.isFinite(min) ? min : undefined} max={Number.isFinite(max) ? max : undefined} step={actualStep}
      disabled={disabled} readOnly={readOnly}
      onChange={(event) => {
        if (!event.currentTarget.validity.badInput) onValueChange?.(numberValue(event.currentTarget.value));
        onChange?.(event);
        queueMicrotask(sync);
      }}
      onBlur={(event) => {
        const node = event.currentTarget;
        if (!composing.current && !readOnly && !node.matches(':disabled') && !node.validity.badInput) {
          const current = numberValue(node.value);
          if (current !== null) commitInput(node, numberText(numberPrecision(current, precision)));
        }
        onBlur?.(event);
        queueMicrotask(sync);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || composing.current
          || event.altKey || event.ctrlKey || event.metaKey || readOnly) return;
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          increment(event.key === 'ArrowUp' ? 1 : -1);
        }
      }}
      onCompositionStart={(event) => { composing.current = true; onCompositionStart?.(event); }}
      onCompositionEnd={(event) => { composing.current = false; onCompositionEnd?.(event); }}
    />
    {controls && <span className="ds-number-actions">
      <button
        type="button" aria-label={labels.decrease} className="ds-picker-tool" disabled={disabled || readOnly || limits.decrease}
        onPointerDown={(event) => event.preventDefault()} onClick={() => increment(-1)}
      ><Icon name="minus" /></button>
      <button
        type="button" aria-label={labels.increase} className="ds-picker-tool" disabled={disabled || readOnly || limits.increase}
        onPointerDown={(event) => event.preventDefault()} onClick={() => increment(1)}
      ><Icon name="plus" /></button>
    </span>}
  </div>;
}
