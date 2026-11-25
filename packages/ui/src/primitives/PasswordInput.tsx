import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import type { PasswordInputLabels } from '../foundation/locale';
import { useFormReset } from '../foundation/useFormReset';
import { useFieldProps } from './FieldContext';

export interface PasswordInputProps extends Omit<ComponentProps<'input'>, 'type'> {
  labels?: Partial<PasswordInputLabels>;
  revealable?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/** 密码或密钥的输入视图；不读取已保存值，也不请求剪贴板或保存明文。 */
export function PasswordInput({
  labels: overrides, revealable = true, onVisibilityChange, ref, className, style, disabled, ...rest
}: PasswordInputProps) {
  const labels = useLabels('passwordInput', overrides);
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<[number | null, number | null] | null>(null);
  const [visible, setVisible] = useState(false);
  const shown = visible && revealable && !disabled;
  const field = useFieldProps(rest);
  useImperativeHandle(ref, () => input.current!, []);
  const hide = useCallback(() => { setVisible(false); if (visible) onVisibilityChange?.(false); }, [visible, onVisibilityChange]);
  useFormReset(input, hide, rest.form);
  useEffect(() => { if (disabled || !revealable) hide(); }, [disabled, revealable, hide]);
  useLayoutEffect(() => {
    const node = input.current;
    const caret = selection.current;
    selection.current = null;
    if (node && caret && node.ownerDocument.activeElement === node) node.setSelectionRange(caret[0], caret[1]);
  }, [shown]);
  return <div className={cx('ds-picker-surface ds-password-input', disabled && 'is-disabled', className)} style={style}>
    <input
      {...rest} {...field} ref={input} type={shown ? 'text' : 'password'} disabled={disabled}
      className="ds-control-input ds-password-entry" autoCapitalize="none" spellCheck={false}
    />
    {revealable && <button
      type="button" className="ds-picker-tool" aria-label={shown ? labels.hide : labels.show}
      aria-pressed={shown} disabled={disabled} onPointerDown={(event) => event.preventDefault()}
      onClick={() => {
        const node = input.current;
        if (node) selection.current = [node.selectionStart, node.selectionEnd];
        setVisible(!shown);
        onVisibilityChange?.(!shown);
      }}
    ><Icon name={shown ? 'eye-off' : 'eye'} /></button>}
  </div>;
}
