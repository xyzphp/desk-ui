import { useId, useImperativeHandle, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldProps } from './FieldContext';
import { Chip } from './Chip';
import { useTagInput } from './useTagInput';
import type { TagInputLabels, TagRejection, TagValidation } from './tagInputModel';

export interface TagInputProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'>, TagValidation {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  onReject?: (items: readonly TagRejection[]) => void;
  labels?: Partial<TagInputLabels>;
}

/** 多值文本输入；隐藏控件按同名多值提交，待确认草稿不计入表单值。 */
export function TagInput(props: TagInputProps) {
  const {
    value, defaultValue, onValueChange, inputValue, defaultInputValue, onInputValueChange, maxTags, maxTagLength,
    validateTag, onReject, labels: overrides, className, style, name, ref, disabled, readOnly, required,
    onKeyDown, onPaste, onCompositionStart, onCompositionEnd, onInvalid, ...rest
  } = props;
  const labels = useLabels('tagInput', overrides);
  const { input, composing, ...state } = useTagInput(props, labels);
  const field = useFieldProps(rest);
  const id = useId();
  const blocked = disabled || readOnly;
  const description = [field['aria-describedby'], state.error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;
  useImperativeHandle(ref, () => input.current!, [input]);
  return <div className={cx('ds-tag-input', className)} style={style}>
    <div className={cx('ds-picker-surface ds-tag-input-surface', disabled && 'is-disabled', readOnly && 'is-readonly')}>
      {state.values.map((tag, index) => <Chip
        key={`${index}:${tag}`} disabled={disabled} onRemove={blocked ? undefined : () => state.remove(index)}
      >{tag}</Chip>)}
      <input
        {...rest} {...field} ref={input} className="ds-control-input ds-tag-input-entry" type="text"
        value={state.draft} disabled={disabled} readOnly={readOnly} required={required && state.values.length === 0}
        aria-required={required || undefined}
        aria-invalid={field['aria-invalid'] || !!state.error || undefined} aria-describedby={description}
        placeholder={rest.placeholder ?? (state.values.length ? undefined : labels.placeholder)}
        onChange={(event) => {
          if (blocked) return;
          state.setDraft(event.currentTarget.value); state.setError(''); state.setStatus('');
        }}
        onInvalid={(event) => { if (required && state.values.length === 0) state.setError(labels.required); onInvalid?.(event); }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || blocked || composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
            event.preventDefault(); event.stopPropagation(); state.commit();
          } else if (event.key === 'Backspace' && !state.draft && state.values.length) {
            event.preventDefault(); state.remove(state.values.length - 1);
          }
        }}
        onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented || blocked || composing.current) return;
          const text = event.clipboardData.getData('text');
          if (!/[,，\r\n]/.test(text)) return;
          event.preventDefault();
          const node = event.currentTarget;
          state.commit(state.draft.slice(0, node.selectionStart ?? state.draft.length)
            + text + state.draft.slice(node.selectionEnd ?? state.draft.length));
        }}
        onCompositionStart={(event) => { composing.current = true; onCompositionStart?.(event); }}
        onCompositionEnd={(event) => { composing.current = false; onCompositionEnd?.(event); }}
      />
    </div>
    {name && state.values.map((tag, index) => <input key={index} type="hidden" name={name} value={tag} form={rest.form} disabled={disabled} />)}
    {state.error && <p id={`${id}-error`} className="ds-field-error" role="alert">{state.error}</p>}
    <span className="ds-visually-hidden" role="status" aria-live="polite">{state.status}</span>
  </div>;
}
