import { createContext, useContext, useId, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { useRadioKeyboard } from '../foundation/useRadioKeyboard';

interface RadioContextValue {
  name: string;
  value: string;
  change: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  describedBy?: string;
  invalid?: boolean;
  form?: string;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type' | 'children' | 'value'> {
  value: string;
  children: ReactNode;
}

/** 独立原生单选；在 RadioGroup 中自动继承同名、表单、值与错误关联。 */
export function Radio({ value, children, className, onChange, checked, defaultChecked, ...rest }: RadioProps) {
  const group = useContext(RadioContext);
  const id = useId();
  return <label className={cx('ds-radio', className)}>
    <input
      {...rest} className="ds-control-input" id={rest.id ?? id} type="radio" value={value}
      name={group?.name ?? rest.name} form={group?.form ?? rest.form}
      checked={group ? group.value === value : checked} defaultChecked={group ? undefined : defaultChecked}
      disabled={group?.disabled || rest.disabled} required={group?.required || rest.required}
      aria-describedby={[rest['aria-describedby'], group?.describedBy].filter(Boolean).join(' ') || undefined}
      aria-invalid={rest['aria-invalid'] ?? (group?.invalid || undefined)}
      onChange={(event) => {
        if (event.currentTarget.checked) group?.change(value);
        onChange?.(event);
      }}
    />
    <span>{children}</span>
  </label>;
}

export interface RadioGroupProps extends Omit<ComponentProps<'fieldset'>, 'onChange'> {
  label: ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  direction?: 'horizontal' | 'vertical';
}

/** 表单单选组，与视图切换用的 SegmentedControl 区分。 */
export function RadioGroup({
  label, name, value, defaultValue = '', onValueChange, required, disabled, form, hint, error,
  direction = 'horizontal', children, className, onKeyDown, ref, ...rest
}: RadioGroupProps) {
  const id = useId();
  const fieldset = useRef<HTMLFieldSetElement>(null);
  useImperativeHandle(ref, () => fieldset.current!, []);
  const [selected, change] = useControllable(value, defaultValue, onValueChange);
  const keyDown = useRadioKeyboard(name ?? id, onKeyDown);
  const note = error ?? hint;
  const describedBy = [rest['aria-describedby'], note ? `${id}-note` : undefined].filter(Boolean).join(' ') || undefined;
  useFormReset(fieldset, () => {
    const restored = value === undefined ? defaultValue : value;
    if (value === undefined) change(restored);
    fieldset.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
      input.checked = input.value === restored;
    });
  }, form);
  return <RadioContext.Provider value={{
    name: name ?? id, value: selected, change, required, disabled, form, describedBy, invalid: !!error,
  }}>
    <fieldset
      {...rest} ref={fieldset} form={form} disabled={disabled} role="radiogroup"
      aria-required={required || undefined}
      aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={!!error || undefined}
      className={cx('ds-radio-group', className)}
      onKeyDown={keyDown}
    >
      <legend id={`${id}-label`} className="ds-field-label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className="ds-radio-options" data-direction={direction}>{children}</div>
      {note && <p id={`${id}-note`} className={error ? 'ds-field-error' : 'ds-field-hint'} role={error ? 'alert' : undefined}>{note}</p>}
    </fieldset>
  </RadioContext.Provider>;
}
