import { useId, useImperativeHandle, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { useFieldProps } from './FieldContext';
import { Button } from './Button';
import { normalizeColor } from './colorModel';
import { useColorPicker } from './useColorPicker';

export interface ColorPreset { value: string; label: string }
export interface ColorPickerLabels { choose: string; presets: string; clear: string; placeholder: string }
export interface ColorPickerProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'size' | 'children' | 'pattern'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  presets?: readonly ColorPreset[];
  clearable?: boolean;
  labels?: Partial<ColorPickerLabels>;
}

export function ColorPicker(props: ColorPickerProps) {
  const { value, defaultValue, onValueChange, presets = [], clearable = true, labels: overrides,
    className, style, ref, onChange, onBlur, onKeyDown, onInvalid, placeholder, ...rest } = props;
  const labels = useLabels('colorPicker', overrides);
  const field = useFieldProps(props);
  const id = useId();
  const { input, ...state } = useColorPicker(props);
  useImperativeHandle(ref, () => input.current!, [input]);
  const colors = presets.flatMap((preset) => {
    const color = normalizeColor(preset.value);
    return color ? [{ ...preset, value: color }] : [];
  });
  const description = [field['aria-describedby'], state.error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;
  return <div className={cx('ds-color-picker', className)} style={style}>
    <div className={cx('ds-picker-surface ds-color-control', props.disabled && 'is-disabled', props.readOnly && 'is-readonly')}>
      <input className="ds-color-native" type="color" value={state.color || '#000000'} aria-label={labels.choose}
        disabled={state.blocked} onChange={(event) => state.update(event.currentTarget.value, true)} />
      <input {...rest} {...field} ref={input} type="text" value={state.draft} placeholder={placeholder ?? labels.placeholder}
        pattern="#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?" className="ds-control-input ds-color-input" spellCheck={false}
        aria-describedby={description} aria-invalid={field['aria-invalid'] || !!state.error || undefined}
        onChange={(event) => { state.update(event.currentTarget.value); onChange?.(event); }}
        onBlur={(event) => { state.finish(); onBlur?.(event); }} onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'Enter') state.finish();
          else if (event.key === 'Escape' && state.draft !== state.value) {
            event.preventDefault(); event.stopPropagation(); state.setDraft(state.value); state.setError('');
          }
        }} onInvalid={(event) => {
          onInvalid?.(event); if (event.defaultPrevented) return;
          event.preventDefault(); state.setError(event.currentTarget.validationMessage); event.currentTarget.focus();
        }} />
      {clearable && !state.blocked && state.draft && <button type="button" className="ds-picker-tool" aria-label={labels.clear}
        onClick={() => { state.update('', true); input.current?.focus(); }}><Icon name="x" /></button>}
    </div>
    {!!colors.length && <div className="ds-color-presets" role="group" aria-label={labels.presets}>
      {colors.map((preset, index) => <Button key={`${preset.value}-${index}`} size="sm" pressed={state.color === preset.value}
        disabled={state.blocked} onClick={() => state.update(preset.value, true)} title={preset.value}>
        <span className="ds-color-dot" style={{ backgroundColor: preset.value }} />{preset.label}
        {state.color === preset.value && <Icon name="check" />}
      </Button>)}
    </div>}
    {state.error && <p className="ds-field-error" id={`${id}-error`} role="alert">{state.error}</p>}
  </div>;
}
