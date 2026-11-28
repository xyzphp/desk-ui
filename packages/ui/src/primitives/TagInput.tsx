import { useId, useImperativeHandle, useMemo, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldContext, useFieldProps } from './FieldContext';
import { Chip } from './Chip';
import { useTagInput } from './useTagInput';
import type { TagInputLabels, TagRejection, TagValidation } from './tagInputModel';

export type TagInputOption = string | { value: string; label?: string };

export interface TagInputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'>, TagValidation {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  /** 可选预设标签：显示为可点击切换的标签按钮，同时保留自由输入。 */
  options?: readonly TagInputOption[];
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  onReject?: (items: readonly TagRejection[]) => void;
  labels?: Partial<TagInputLabels>;
}

/** 多值文本输入；隐藏控件按同名多值提交，待确认草稿不计入表单值。 */
export function TagInput(props: TagInputProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    options,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    maxTags,
    maxTagLength,
    validateTag,
    onReject,
    labels: overrides,
    className,
    style,
    name,
    ref,
    disabled,
    readOnly,
    required,
    onKeyDown,
    onPaste,
    onCompositionStart,
    onCompositionEnd,
    onInvalid,
    ...rest
  } = props;
  const labels = useLabels('tagInput', overrides);
  const { input, composing, ...state } = useTagInput(props, labels);
  const field = useFieldProps(rest);
  const fieldCtx = useFieldContext();
  const id = useId();
  const blocked = disabled || readOnly;
  const description =
    [field['aria-describedby'], state.error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;
  const optionList = useMemo(() => {
    if (!options?.length) return [];
    const seen = new Set<string>();
    const list: { value: string; label: string }[] = [];
    for (const item of options) {
      const val = typeof item === 'string' ? item : item.value;
      const lbl = typeof item === 'string' ? item : (item.label ?? item.value);
      if (!val || seen.has(val)) continue;
      seen.add(val);
      list.push({ value: val, label: lbl });
    }
    return list;
  }, [options]);
  useImperativeHandle(ref, () => input.current!, [input]);
  return (
    <div className={cx('ds-tag-input', className)} style={style}>
      <div
        className={cx('ds-picker-surface ds-tag-input-surface', disabled && 'is-disabled', readOnly && 'is-readonly')}
      >
        {state.values.map((tag, index) => (
          <Chip key={`${index}:${tag}`} disabled={disabled} onRemove={blocked ? undefined : () => state.remove(index)}>
            {tag}
          </Chip>
        ))}
        <input
          {...rest}
          {...field}
          ref={input}
          className="ds-control-input ds-tag-input-entry"
          type="text"
          value={state.draft}
          disabled={disabled}
          readOnly={readOnly}
          required={required && state.values.length === 0}
          aria-required={required || undefined}
          aria-invalid={field['aria-invalid'] || !!state.error || undefined}
          aria-describedby={description}
          placeholder={rest.placeholder ?? (state.values.length ? undefined : labels.placeholder)}
          onChange={(event) => {
            if (blocked) return;
            state.setDraft(event.currentTarget.value);
            state.setError('');
            state.setStatus('');
          }}
          onInvalid={(event) => {
            if (required && state.values.length === 0) state.setError(labels.required);
            onInvalid?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              event.defaultPrevented ||
              blocked ||
              composing.current ||
              event.nativeEvent.isComposing ||
              event.keyCode === 229
            )
              return;
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
              event.preventDefault();
              event.stopPropagation();
              state.commit();
            } else if (event.key === 'Backspace' && !state.draft && state.values.length) {
              event.preventDefault();
              state.remove(state.values.length - 1);
            }
          }}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented || blocked || composing.current) return;
            const text = event.clipboardData.getData('text');
            if (!/[,，\r\n]/.test(text)) return;
            event.preventDefault();
            const node = event.currentTarget;
            state.commit(
              state.draft.slice(0, node.selectionStart ?? state.draft.length) +
                text +
                state.draft.slice(node.selectionEnd ?? state.draft.length),
            );
          }}
          onCompositionStart={(event) => {
            composing.current = true;
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            onCompositionEnd?.(event);
          }}
        />
      </div>
      {optionList.length > 0 && (
        <div
          className="ds-tag-input-options"
          role="group"
          aria-labelledby={rest['aria-label'] ? undefined : fieldCtx?.labelId}
          aria-label={rest['aria-label'] || (fieldCtx?.labelId ? undefined : labels.placeholder)}
        >
          {optionList.map((option) => {
            const active = state.values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={cx('ds-tag-option', active && 'is-selected')}
                aria-pressed={active}
                disabled={blocked}
                onClick={() => state.toggleOption(option.value)}
              >
                <Icon name={active ? 'check' : 'plus'} size={12} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {name &&
        state.values.map((tag, index) => (
          <input key={index} type="hidden" name={name} value={tag} form={rest.form} disabled={disabled} />
        ))}
      {state.error && (
        <p id={`${id}-error`} className="ds-field-error" role="alert">
          {state.error}
        </p>
      )}
      <span className="ds-visually-hidden" role="status" aria-live="polite">
        {state.status}
      </span>
    </div>
  );
}
