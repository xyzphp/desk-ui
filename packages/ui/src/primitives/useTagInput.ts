import { useLayoutEffect, useRef, useState } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import type { TagInputProps } from './TagInput';
import { addTags, splitTags, tagLimit, type TagInputLabels, type TagRejection } from './tagInputModel';

export function useTagInput(props: TagInputProps, labels: TagInputLabels) {
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const [values, setValues] = useControllable<readonly string[]>(props.value, props.defaultValue ?? [], props.onValueChange);
  const [draft, setDraft] = useControllable(props.inputValue, props.defaultInputValue ?? '', props.onInputValueChange);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const blocked = props.disabled || props.readOnly;
  useLayoutEffect(() => {
    input.current?.setCustomValidity(props.required && values.length === 0 ? labels.required : '');
  }, [props.required, values.length, labels.required]);
  useFormReset(input, () => {
    if (props.value === undefined) setValues(props.defaultValue ?? []);
    if (props.inputValue === undefined) setDraft(props.defaultInputValue ?? '');
    if (input.current) input.current.value = props.inputValue ?? props.defaultInputValue ?? '';
    setError(''); setStatus('');
  }, props.form);
  const rejectionText = (item: TagRejection) => item.reason === 'duplicate' ? labels.duplicate(item.value)
    : item.reason === 'limit' ? labels.limit(tagLimit(props.maxTags))
      : item.reason === 'length' ? labels.length(tagLimit(props.maxTagLength)) : labels.invalid(item.value);
  const commit = (text = draft) => {
    if (blocked || input.current?.matches(':disabled')) return;
    const result = addTags(values, splitTags(text), props);
    if (result.accepted.length) setValues(result.next);
    setDraft(result.rejected.map((item) => item.value).join(', '));
    setError(result.rejected[0] ? rejectionText(result.rejected[0]) : '');
    setStatus(result.accepted.length ? labels.added(result.accepted.length) : '');
    if (result.rejected.length) props.onReject?.(result.rejected);
  };
  const remove = (index: number) => {
    if (blocked || input.current?.matches(':disabled')) return;
    setValues(values.filter((_, position) => position !== index));
    setError(''); setStatus('');
    queueMicrotask(() => input.current?.focus({ preventScroll: true }));
  };
  return { input, composing, values, draft, setDraft, error, setError, status, setStatus, commit, remove };
}
