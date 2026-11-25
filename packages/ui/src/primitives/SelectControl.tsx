import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { PickerPopover } from '../foundation/PickerPopover';
import { defaultActiveIndex, type Choice } from './selectModel';
import { useSelectForm, type SelectBaseProps } from './useSelectForm';
import { SelectNative } from './SelectNative';
import { SelectOptions } from './SelectOptions';
import { relaySelectKey, useSelectFocus } from './selectEvents';

const printable = (event: KeyboardEvent<HTMLElement>) => event.key.length === 1 && event.key !== ' '
  && !event.ctrlKey && !event.altKey && !event.metaKey && !event.nativeEvent.isComposing;

/** 基础单选和 size / multiple 内联列表的显示层，共用选择器表单控制器。 */
export function SelectControl(props: SelectBaseProps) {
  const { multiple, size, className, style } = props;
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>();
  const typeahead = useRef({ text: '', time: 0 });
  const form = useSelectForm(props, () => setOpen(false));
  const { snapshot, blocked, labelBy, label, description, invalid } = form;
  const inline = Boolean(multiple || size && size > 1);
  const expanded = open && !blocked && !inline;
  const enabled = snapshot.choices.filter((item) => !item.disabled);
  const activeIndex = enabled.some((item) => item.index === active) ? active : defaultActiveIndex(snapshot.choices);
  const listId = `${form.id}-options`;
  useEffect(() => { if (blocked || inline) setOpen(false); }, [blocked, inline]);
  const focusVisible = () => {
    const target = trigger.current ?? root.current?.querySelector<HTMLElement>('[role="option"]:not(:disabled)')
      ?? root.current?.querySelector<HTMLElement>('[role="listbox"]');
    target?.focus();
  };
  const focus = useSelectFocus(form.native, root, props, focusVisible);
  const typedChoice = (key: string) => {
    const now = Date.now();
    const lower = key.toLocaleLowerCase();
    const recent = now - typeahead.current.time < 800;
    const repeated = recent && typeahead.current.text === lower;
    typeahead.current = { text: (recent && !repeated ? typeahead.current.text : '') + lower, time: now };
    const matches = enabled.filter((item) => item.label.toLocaleLowerCase().startsWith(typeahead.current.text));
    return repeated ? matches.find((item) => item.index > (active ?? -1)) ?? matches[0] : matches[0];
  };
  const move = (event: KeyboardEvent<HTMLElement>) => {
    if (!enabled.length) return;
    const current = enabled.findIndex((item) => item.index === activeIndex);
    let next: Choice | undefined;
    if (event.key === 'ArrowDown') next = enabled[(current + 1) % enabled.length];
    else if (event.key === 'ArrowUp') next = current < 0 ? enabled.at(-1) : enabled[(current - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else if (printable(event)) next = typedChoice(event.key);
    if (!next) return;
    event.preventDefault(); setActive(next.index);
    const option = root.current?.querySelector<HTMLButtonElement>(`[data-option-index="${next.index}"]`);
    option?.focus({ preventScroll: true }); option?.scrollIntoView?.({ block: 'nearest' });
  };
  const relay = (event: KeyboardEvent<HTMLElement>, type: 'keydown' | 'keyup') => relaySelectKey(event, form.native.current!, type);
  return <div ref={root} data-ds-select="" className={cx('ds-select', className)} style={style}
    onFocus={focus.onFocus} onBlur={focus.onBlur}>
    <SelectNative state={form} props={props} focusVisible={focusVisible} onFocus={focus.nativeFocus} onBlur={focus.nativeBlur} />
    {!inline && <button
      ref={trigger} type="button" id={form.field.id ? `${form.field.id}-trigger` : undefined} role="combobox"
      aria-label={labelBy ? undefined : label} aria-labelledby={labelBy} aria-controls={expanded ? listId : undefined}
      aria-haspopup="listbox" aria-expanded={expanded} aria-describedby={description} aria-invalid={invalid}
      aria-required={props.required || undefined} disabled={blocked} title={props.title} tabIndex={props.tabIndex}
      className={cx('ds-picker-surface ds-choice-select', expanded && 'is-open', blocked && 'is-disabled')}
      onClick={() => { setActive(enabled.find((item) => item.selected)?.index); setOpen(!open); }}
      onKeyDown={(event) => {
        relay(event, 'keydown'); if (event.defaultPrevented) return;
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const fallback = event.key === 'ArrowUp' ? enabled.at(-1) : enabled[0];
          const next = event.key === 'End' ? enabled.at(-1) : event.key === 'Home' ? enabled[0]
            : enabled.find((item) => item.selected) ?? fallback;
          setActive(next?.index); setOpen(true);
        } else if (printable(event)) {
          const next = typedChoice(event.key);
          if (next) { event.preventDefault(); setActive(next.index); setOpen(true); }
        }
      }} onKeyUp={(event) => relay(event, 'keyup')}
    ><span className="ds-choice-select-label">{snapshot.labels.join('、') || form.placeholder}</span><Icon name="chevron-down" /></button>}
    {inline ? <SelectOptions
      id={listId} choices={snapshot.choices} active={activeIndex} label={label} labelledBy={labelBy} multiple={multiple}
      disabled={blocked} inline rows={size} emptyText={form.emptyText} onActive={setActive} onChoose={form.choose}
      aria-required={props.required || undefined} aria-describedby={description} aria-invalid={invalid}
      onKeyDown={(event) => { relay(event, 'keydown'); if (!event.defaultPrevented) move(event); }}
      onKeyUp={(event) => relay(event, 'keyup')}
    /> : <PickerPopover open={expanded} anchor={trigger} label={label} role="presentation" matchAnchorWidth onClose={() => setOpen(false)}
      className="ds-choice-menu">
      <SelectOptions
        id={listId} choices={snapshot.choices} active={activeIndex} label={label} labelledBy={labelBy} disabled={blocked}
        emptyText={form.emptyText} onActive={setActive} onChoose={(item) => { form.choose(item); setOpen(false); }}
        onKeyDown={(event) => { relay(event, 'keydown'); if (!event.defaultPrevented) move(event); }}
        onKeyUp={(event) => relay(event, 'keyup')}
      />
    </PickerPopover>}
    {form.error && <p className="ds-field-error" id={`${form.id}-error`} role="alert">{form.error}</p>}
  </div>;
}
