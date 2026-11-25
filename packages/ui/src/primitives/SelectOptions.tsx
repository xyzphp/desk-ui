import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { groupChoices, type Choice } from './selectModel';

interface SelectOptionsProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  choices: readonly Choice[];
  active?: number;
  label?: string;
  labelledBy?: string;
  multiple?: boolean;
  disabled?: boolean;
  inline?: boolean;
  rows?: number;
  emptyText: string;
  keepInputFocus?: boolean;
  onActive: (index: number) => void;
  onChoose: (item: Choice) => void;
}

export function SelectOptions({
  choices, active, label, labelledBy, multiple, disabled, inline, rows, emptyText, keepInputFocus,
  onActive, onChoose, className, ...rest
}: SelectOptionsProps) {
  return <div
    {...rest} role="listbox" aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy}
    aria-multiselectable={multiple || undefined} aria-disabled={disabled || undefined}
    className={cx('ds-select-options', inline && 'is-inline', className)}
    tabIndex={inline && !disabled ? (choices.some((item) => !item.disabled) ? -1 : 0) : undefined}
    style={inline ? { ['--ds-select-rows' as string]: Math.max(1, rows || 4) } : undefined}
  >
    {choices.length === 0 && <div className="ds-select-empty">{emptyText}</div>}
    {groupChoices(choices).map((section) => <div
      key={section.id} role={section.group !== undefined ? 'group' : 'presentation'} aria-label={section.group}
    >
      {section.group !== undefined && <div className="ds-select-group">{section.group}</div>}
      {section.items.map((item) => <button
        type="button" role="option" key={item.index} id={rest.id ? `${rest.id}-${item.index}` : undefined}
        className={cx('ds-choice-option', keepInputFocus && active === item.index && 'is-active')}
        data-option-index={item.index} aria-selected={item.selected} disabled={disabled || item.disabled}
        tabIndex={inline && active === item.index ? 0 : -1} data-picker-focus={item.index === active}
        onPointerDown={(event) => { if (keepInputFocus) event.preventDefault(); }}
        onMouseMove={() => { if (keepInputFocus && !item.disabled) onActive(item.index); }}
        onFocus={() => onActive(item.index)} onClick={() => onChoose(item)}
      ><span>{item.label}</span><Icon name="check" /></button>)}
    </div>)}
  </div>;
}
