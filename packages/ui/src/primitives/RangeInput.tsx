import { useId, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { cx } from '../foundation/cx';
import { Range } from './Field';
import { InputNumber } from './InputNumber';
import type { RangeInputLabels } from '../foundation/locale';
import { sliderBounds, sliderNumber } from './rangeSliderModel';

export type { RangeInputLabels } from '../foundation/locale';

export interface RangeInputProps extends Omit<ComponentProps<'fieldset'>, 'children' | 'onChange'> {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  required?: boolean;
  readOnly?: boolean;
  suffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  labels?: Partial<RangeInputLabels>;
}

export function RangeInput(props: RangeInputProps) {
  const {
    label,
    value,
    defaultValue,
    onValueChange,
    name,
    min,
    max,
    step,
    precision,
    required,
    readOnly,
    suffix,
    hint,
    error,
    labels: overrides,
    ref,
    className,
    disabled,
    form,
    ...rest
  } = props;
  const labels = useLabels('rangeInput', overrides);
  const root = useRef<HTMLFieldSetElement>(null);
  const id = useId();
  const bounds = sliderBounds(min, max, step);
  const initialValue = sliderNumber(defaultValue ?? bounds.min, bounds);
  const [raw, setValue] = useControllable(value, initialValue, onValueChange);
  const current = sliderNumber(raw, bounds);
  const note = error ?? hint;
  const describedBy =
    [rest['aria-describedby'], note ? `${id}-note` : undefined].filter(Boolean).join(' ') || undefined;
  const update = (next: number) => setValue(sliderNumber(next, bounds));

  useImperativeHandle(ref, () => root.current!, [root]);
  useFormReset(
    root,
    () => {
      const restored = sliderNumber(value ?? defaultValue ?? bounds.min, bounds);
      if (value === undefined) setValue(restored);
      const range = root.current?.querySelector<HTMLInputElement>('input[type="range"]');
      if (range) range.value = String(restored);
    },
    form,
  );

  return (
    <fieldset
      {...rest}
      ref={root}
      form={form}
      disabled={disabled}
      className={cx('ds-range-combo', className)}
      aria-describedby={describedBy}
      aria-invalid={!!error || undefined}
    >
      <legend id={`${id}-label`} className="ds-field-label">
        {label}
      </legend>
      <div className="ds-range-combo-controls">
        <Range
          className="ds-range-combo-slider"
          aria-labelledby={`${id}-label ${id}-slider-label`}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={current}
          disabled={disabled || readOnly}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          onValueChange={update}
        />
        <span className="ds-range-combo-value">
          <InputNumber
            className="ds-range-combo-number"
            aria-labelledby={`${id}-label ${id}-number-label`}
            aria-describedby={describedBy}
            aria-invalid={!!error || undefined}
            name={name}
            form={form}
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            precision={precision}
            value={current}
            controls={false}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            onValueChange={(next) => update(next ?? bounds.min)}
          />
          {suffix != null && <span className="ds-range-combo-suffix">{suffix}</span>}
        </span>
      </div>
      <span id={`${id}-slider-label`} className="ds-visually-hidden">
        {labels.slider}
      </span>
      <span id={`${id}-number-label`} className="ds-visually-hidden">
        {labels.value}
      </span>
      {note && (
        <p id={`${id}-note`} className={error ? 'ds-field-error' : 'ds-field-hint'} role={error ? 'alert' : undefined}>
          {note}
        </p>
      )}
    </fieldset>
  );
}
