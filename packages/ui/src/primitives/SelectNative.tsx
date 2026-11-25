import type { FocusEventHandler } from 'react';
import type { SelectBaseProps, SelectFormState } from './useSelectForm';

interface SelectNativeProps {
  state: SelectFormState;
  props: SelectBaseProps;
  focusVisible: () => void;
  onFocus: FocusEventHandler<HTMLSelectElement>;
  onBlur: FocusEventHandler<HTMLSelectElement>;
}

export function SelectNative({ state, props, focusVisible, onFocus, onBlur }: SelectNativeProps) {
  const { native, field, onChange, invalidate } = state;
  const { placeholder, emptyText, labels, className, style, ref, children, ...rest } = props;
  return <select
    {...rest} {...field} ref={native} className="ds-control-input ds-select-native" aria-hidden="true" tabIndex={-1}
    onFocus={onFocus} onBlur={onBlur} onChange={onChange}
    onInvalid={(event) => { if (invalidate(event)) focusVisible(); }}
  >{children}</select>;
}
