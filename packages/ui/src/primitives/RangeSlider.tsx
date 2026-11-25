import { useId, useImperativeHandle, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useRangeSlider } from './useRangeSlider';
import type { RangeSliderValue } from './rangeSliderModel';
export type { RangeSliderValue } from './rangeSliderModel';

export interface RangeSliderProps extends Omit<ComponentProps<'fieldset'>, 'children' | 'name' | 'onChange' | 'defaultValue'> {
  label: ReactNode;
  value?: RangeSliderValue;
  defaultValue?: RangeSliderValue;
  onValueChange?: (value: RangeSliderValue) => void;
  name?: readonly [string, string];
  min?: number;
  max?: number;
  step?: number;
  minGap?: number;
  hint?: ReactNode;
  error?: ReactNode;
  labels?: Partial<{ lower: string; upper: string }>;
}
/** 两个原生 range 共用轨道与滑块外观，保留键盘和双值表单。 */
export function RangeSlider(props: RangeSliderProps) {
  const { label, value, defaultValue, onValueChange, min, max, step, minGap, name, hint, error, labels: overrides,
    ref, className, disabled, form, ...rest } = props;
  const { root, ...state } = useRangeSlider(props);
  const labels = useLabels('rangeSlider', overrides);
  const id = useId();
  useImperativeHandle(ref, () => root.current!, [root]);
  const note = error ?? hint;
  const describedBy = [rest['aria-describedby'], note ? `${id}-note` : undefined].filter(Boolean).join(' ') || undefined;
  const locked = disabled || state.bounds.max === state.bounds.min;
  return <fieldset {...rest} ref={root} form={form} disabled={disabled} className={cx('ds-range-slider', className)}
    aria-describedby={describedBy} aria-invalid={!!error || undefined}>
    <legend id={`${id}-label`} className="ds-field-label">{label}</legend>
    <div className="ds-range-slider-track" style={{ '--ds-range-start': `${state.lower}%`,
      '--ds-range-end': `${state.upper}%` } as CSSProperties}>
      <span className="ds-range-slider-rail" aria-hidden="true"><span /></span>
      {([0, 1] as const).map((index) => <input
        key={index} className="ds-control-input ds-range-input ds-range-slider-input" type="range"
        min={state.bounds.min} max={state.bounds.max} step={state.bounds.step} value={state.pair[index]}
        name={name?.[index]} form={form} disabled={locked}
        aria-labelledby={`${id}-label ${id}-${index}`} aria-describedby={describedBy} aria-invalid={!!error || undefined}
        aria-valuemin={index === 0 ? state.bounds.min : state.pair[0] + state.bounds.gap}
        aria-valuemax={index === 0 ? state.pair[1] - state.bounds.gap : state.bounds.max}
        data-at-end={index === 0 && state.pair[0] === state.bounds.max || undefined}
        onChange={(event) => state.update(index, event.currentTarget)}
      />)}
    </div>
    <div className="ds-range-slider-values" aria-hidden="true"><span>{state.pair[0]}</span><span>{state.pair[1]}</span></div>
    <span id={`${id}-0`} className="ds-visually-hidden">{labels.lower}</span>
    <span id={`${id}-1`} className="ds-visually-hidden">{labels.upper}</span>
    {note && <p id={`${id}-note`} className={error ? 'ds-field-error' : 'ds-field-hint'} role={error ? 'alert' : undefined}>{note}</p>}
  </fieldset>;
}
