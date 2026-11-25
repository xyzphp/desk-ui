import { useId, useImperativeHandle, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { useRadioKeyboard } from '../foundation/useRadioKeyboard';
import { Button } from './Button';

export interface RatingLabels { score: (value: number, max: number) => string; clear: string; unrated: string }
export interface RatingProps extends Omit<ComponentProps<'fieldset'>, 'children' | 'onChange'> {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  required?: boolean;
  clearable?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  labels?: Partial<RatingLabels>;
}
export function Rating({ label, value, defaultValue = 0, onValueChange, max = 5, readOnly, required, clearable = true,
  hint, error, labels: overrides, name, form, ref, className, onKeyDown, onInvalid, ...rest }: RatingProps) {
  const id = useId(), root = useRef<HTMLFieldSetElement>(null);
  const labels = useLabels('rating', overrides);
  const count = Number.isFinite(max) ? Math.max(1, Math.min(10, Math.floor(max))) : 5;
  const normalize = (score: number) => Number.isFinite(score) ? Math.max(0, Math.min(count, Math.floor(score))) : 0;
  const [raw, change] = useControllable(value, normalize(defaultValue), onValueChange);
  const selected = normalize(raw);
  const [localError, setLocalError] = useState('');
  const failure = error ?? localError, note = failure || hint;
  const describedBy = [rest['aria-describedby'], note ? `${id}-note` : undefined].filter(Boolean).join(' ') || undefined;
  const groupName = name ?? id;
  const keyDown = useRadioKeyboard(groupName, onKeyDown, readOnly);
  useImperativeHandle(ref, () => root.current!, []);
  useFormReset(root, () => {
    const restored = normalize(value ?? defaultValue);
    if (value === undefined) change(restored);
    root.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => { input.checked = Number(input.value) === restored; });
    setLocalError('');
  }, form);
  return <fieldset {...rest} ref={root} form={form} className={cx('ds-rating', className)} role="radiogroup"
    aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={!!failure || undefined}
    aria-required={required || undefined} aria-readonly={readOnly || undefined} onKeyDown={keyDown} onInvalid={(event) => {
      onInvalid?.(event); if (event.defaultPrevented) return;
      event.preventDefault(); setLocalError((event.target as HTMLInputElement).validationMessage); (event.target as HTMLInputElement).focus();
    }}>
    <legend id={`${id}-label`} className="ds-field-label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
    <div className="ds-rating-options">
      {Array.from({ length: count }, (_, index) => index + 1).map((score) => <label key={score} className="ds-rating-option"
        data-filled={score <= selected || undefined}>
        <input type="radio" className="ds-control-input ds-visually-hidden" name={groupName} form={form} value={score}
          checked={selected === score} required={required} tabIndex={score === (selected || 1) ? 0 : -1}
          aria-describedby={describedBy} aria-invalid={!!failure || undefined}
          onClick={(event) => { if (readOnly) event.preventDefault(); }}
          onChange={(event) => { if (!readOnly && event.currentTarget.checked) { change(score); setLocalError(''); } }} />
        <Icon name="star" /><span className="ds-visually-hidden">{labels.score(score, count)}</span>
      </label>)}
      {clearable && !readOnly && selected > 0 && <Button size="sm" variant="quiet" icon="x"
        onClick={() => { change(0); setLocalError(''); root.current?.querySelector<HTMLInputElement>('input')?.focus(); }}>{labels.clear}</Button>}
      <span className="ds-visually-hidden" role="status">{selected ? labels.score(selected, count) : labels.unrated}</span>
    </div>
    {note && <p id={`${id}-note`} className={failure ? 'ds-field-error' : 'ds-field-hint'} role={failure ? 'alert' : undefined}>{note}</p>}
  </fieldset>;
}
