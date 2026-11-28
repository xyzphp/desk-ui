import { useEffect, useId, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useFormReset } from '../foundation/useFormReset';
import { HelpTip } from './Feedback';
import { FieldContext, useFieldProps } from './FieldContext';
export { useFieldProps } from './FieldContext';
export { Select, type SelectProps } from './Select';

export interface FieldProps {
  label: ReactNode;
  /** 标签旁的问号悬停提示，收起长段说明以保持表单简洁。 */
  tip?: string;
  hint?: ReactNode;
  /** 有错误时显示并标记控件 aria-invalid，优先于 hint。 */
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** 标签 + 控件 + 提示 / 错误的容器；内部的 Input、Textarea、Select 自动关联 id 与描述。 */
export function Field({ label, tip, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  const value = { id, labelId: `${id}-label`, describedBy: note ? noteId : undefined, invalid: Boolean(error) };
  const labelElement = (
    <label id={value.labelId} className="ds-field-label" htmlFor={id}>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
  return (
    <FieldContext.Provider value={value}>
      <div className={cx('ds-field-group', className)}>
        {tip ? (
          <div className="ds-field-head">
            {labelElement}
            <HelpTip text={tip} />
          </div>
        ) : (
          labelElement
        )}
        {children}
        {note && (
          <p id={noteId} className={error ? 'ds-field-error' : 'ds-field-hint'} role={error ? 'alert' : undefined}>
            {note}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

export type InputProps = ComponentProps<'input'>;

/** 单行输入。不含标签，配合 Field 使用，或自行提供 aria-label。 */
export function Input({ className, ...rest }: InputProps) {
  return <input className={cx('ds-control-input ds-field', className)} {...rest} {...useFieldProps(rest)} />;
}

export type TextareaProps = ComponentProps<'textarea'>;

export function Textarea({ className, ...rest }: TextareaProps) {
  return <textarea className={cx('ds-control-input ds-field', className)} {...rest} {...useFieldProps(rest)} />;
}

export interface RangeProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'min' | 'max'> {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

function rangeFill(current: number, min: number, max: number) {
  const progress =
    Number.isFinite(current) && Number.isFinite(min) && Number.isFinite(max) && max > min
      ? Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100))
      : 0;
  return `${progress}%`;
}

function syncRangeFill(element: HTMLInputElement) {
  element.style.setProperty(
    '--ds-range-fill',
    rangeFill(element.valueAsNumber, Number(element.min), Number(element.max)),
  );
}

/** 原生滑条。数值与表单状态由 input 管理，填充同步实际数值，不重复实现键盘与步进。 */
export function Range({
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  onChange,
  className,
  style,
  ref,
  ...rest
}: RangeProps) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);

  useEffect(() => {
    if (input.current) syncRangeFill(input.current);
  }, [min, max, value, defaultValue, rest.step]);
  useFormReset(
    input,
    () => {
      if (input.current) syncRangeFill(input.current);
    },
    rest.form,
  );

  return (
    <span className={cx('ds-range', className)}>
      <input
        className="ds-control-input ds-range-input"
        {...rest}
        {...useFieldProps(rest)}
        ref={input}
        type="range"
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        style={{
          ...style,
          ['--ds-range-fill' as string]: rangeFill(value ?? defaultValue ?? (min + max) / 2, min, max),
        }}
        onChange={(event) => {
          const element = event.currentTarget;
          syncRangeFill(element);
          onValueChange?.(event.currentTarget.valueAsNumber);
          onChange?.(event);
          queueMicrotask(() => {
            if (input.current === element) syncRangeFill(element);
          });
        }}
      />
    </span>
  );
}
