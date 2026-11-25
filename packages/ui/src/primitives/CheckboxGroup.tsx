import { useImperativeHandle, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Checkbox } from './Feedback';
import { useCheckboxGroup } from './useCheckboxGroup';

export interface CheckboxOption {
  value: string; label: ReactNode; disabled?: boolean; indeterminate?: boolean;
}
export interface CheckboxGroupProps extends Omit<ComponentProps<'fieldset'>, 'children' | 'onChange' | 'defaultValue'> {
  label: ReactNode;
  options: readonly CheckboxOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  required?: boolean;
  readOnly?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  direction?: 'horizontal' | 'vertical';
  labels?: Partial<{ required: string; empty: string }>;
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const { label, options, value, defaultValue, onValueChange, required, readOnly, hint, error, direction = 'horizontal',
    labels: overrides, disabled, form, name, className, ref, onInvalid, ...rest } = props;
  const labels = useLabels('checkboxGroup', overrides);
  const { root, ...state } = useCheckboxGroup(props, labels.required);
  useImperativeHandle(ref, () => root.current!, [root]);
  const failure = error ?? state.localError;
  const note = failure || hint;
  const description = [rest['aria-describedby'], required ? `${state.id}-required` : undefined, note ? `${state.id}-note` : undefined]
    .filter(Boolean).join(' ') || undefined;
  return <fieldset {...rest} ref={root} form={form} disabled={disabled} className={cx('ds-checkbox-group', className)}
    aria-describedby={description} aria-invalid={!!failure || undefined} onInvalid={(event) => {
      onInvalid?.(event); if (event.defaultPrevented) return;
      event.preventDefault(); state.setLocalError((event.target as HTMLInputElement).validationMessage);
      (event.target as HTMLInputElement).focus();
    }}>
    <legend className="ds-field-label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {required && <span className="ds-visually-hidden" id={`${state.id}-required`}>{labels.required}</span>}
    <div className="ds-checkbox-options" data-direction={direction}>
      {options.map((option) => <Checkbox key={option.value} data-checkbox-option="" value={option.value}
        name={name} form={form} checked={state.selected.includes(option.value)} disabled={disabled || option.disabled}
        indeterminate={option.indeterminate} aria-readonly={readOnly || undefined}
        aria-invalid={!!failure || undefined} aria-describedby={description}
        onClick={(event) => { if (readOnly) event.preventDefault(); }}
        onChange={(event) => state.change(option.value, event.currentTarget.checked)}
      >{option.label}</Checkbox>)}
      {!options.length && <span className="ds-field-hint">{labels.empty}</span>}
    </div>
    {note && <p id={`${state.id}-note`} className={failure ? 'ds-field-error' : 'ds-field-hint'} role={failure ? 'alert' : undefined}>{note}</p>}
  </fieldset>;
}
