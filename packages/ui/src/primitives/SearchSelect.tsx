import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { useLabels } from '../foundation/ConfigProvider';
import { Chip } from './Chip';
import { SelectNative } from './SelectNative';
import { SelectOptions } from './SelectOptions';
import { useSearchSelect } from './useSearchSelect';
import type { SelectBaseProps } from './useSelectForm';
import type { SelectSearchOptions } from './Select';
import { relaySelectKey } from './selectEvents';

export function SearchSelect({
  query, defaultQuery, onQueryChange, maxVisibleTags = 3, loading, readOnly,
  clearable = true, searchLabels, ...props
}: SelectBaseProps & Omit<SelectSearchOptions, 'searchable' | 'dropdown'>) {
  const labels = useLabels('searchSelect', searchLabels);
  const { root, input: inputRef, trigger, anchor, composing, form, ...state } = useSearchSelect(props,
    { query, defaultQuery, onQueryChange, loading, readOnly });
  const selected = form.snapshot.selection;
  const limit = Number.isFinite(maxVisibleTags) ? Math.max(0, Math.floor(maxVisibleTags)) : 3;
  const summaryId = `${form.id}-selection`;
  const selectionText = form.snapshot.labels.join('、');
  const description = [form.description, props.multiple && selectionText ? summaryId : undefined].filter(Boolean).join(' ') || undefined;
  const blocked = form.blocked || readOnly;
  const input = <input
    ref={inputRef} type="text" role="combobox" className="ds-control-input ds-search-select-input"
    id={`${form.id}-search`} aria-label={props.multiple ? `${form.label}：${labels.search}` : form.labelBy ? undefined : form.label}
    aria-labelledby={props.multiple ? undefined : form.labelBy} aria-autocomplete="list" aria-haspopup="listbox"
    aria-expanded={state.open} aria-controls={state.open ? state.listId : undefined}
    aria-activedescendant={state.open && state.activeIndex !== undefined ? `${state.listId}-${state.activeIndex}` : undefined}
    aria-describedby={props.multiple ? undefined : description} aria-invalid={form.invalid}
    aria-required={props.required || undefined} autoComplete="off" disabled={form.blocked} readOnly={readOnly}
    tabIndex={props.multiple ? undefined : props.tabIndex}
    value={props.multiple || state.open ? state.query : selectionText}
    placeholder={props.multiple ? labels.search : selectionText || form.placeholder}
    onFocus={() => { if (state.canOpen) state.setOpen(true); }}
    onClick={() => { if (state.canOpen) state.setOpen(true); }}
    onChange={(event) => {
      if (!state.canOpen) return;
      state.setQuery(event.currentTarget.value); state.setActive(undefined); state.setOpen(true);
    }}
    onKeyDown={state.key} onKeyUp={(event) => relaySelectKey(event, form.native.current!, 'keyup')}
    onCompositionStart={() => { composing.current = true; }}
    onCompositionEnd={() => { composing.current = false; }}
  />;
  return <div
    ref={root} data-ds-select="" className={cx('ds-select', props.className)} style={props.style}
    onFocus={state.focus.onFocus} onBlur={state.focus.onBlur}
  >
    <SelectNative state={form} props={props} focusVisible={state.focusVisible}
      onFocus={state.focus.nativeFocus} onBlur={state.focus.nativeBlur} />
    <div ref={anchor} className={cx(
      'ds-picker-surface ds-search-select', state.open && 'is-open', form.blocked && 'is-disabled', readOnly && 'is-readonly',
    )} aria-busy={loading || undefined} onClick={(event) => {
      if (props.multiple && state.canOpen && !(event.target as HTMLElement).closest('button')) state.setOpen(true);
    }}>
      {props.multiple ? <>
        <div className="ds-multi-values">
          {selected.slice(0, limit).map((item) => <Chip
            key={item.index} disabled={blocked || loading || item.disabled}
            onRemove={blocked || loading || item.disabled ? undefined : () => { form.choose(item, false); state.focusVisible(); }}
          >{item.label}</Chip>)}
          {selected.length > limit && <span className="ds-multi-count" title={selectionText}>+{selected.length - limit}</span>}
          {selected.length === 0 && <span className="ds-multi-placeholder">{form.placeholder}</span>}
        </div>
        <button
          ref={trigger} type="button" className="ds-picker-tool" aria-label={form.label}
          aria-haspopup="dialog" aria-expanded={state.open} aria-controls={state.open ? `${form.id}-panel` : undefined}
          aria-describedby={description} aria-invalid={form.invalid} disabled={form.blocked}
          tabIndex={props.tabIndex}
          onClick={() => { if (!readOnly) state.setOpen(!state.open); }}
          onKeyDown={(event) => {
            relaySelectKey(event, form.native.current!, 'keydown');
            if (!event.defaultPrevented && !blocked && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
              event.preventDefault(); state.setOpen(true);
            }
          }}
        ><Icon name="chevron-down" /></button>
      </> : input}
      {clearable && selected.some((item) => !item.disabled) && !blocked && <button
        type="button" className="ds-picker-tool" aria-label={`${labels.clear}：${form.label}`} disabled={loading}
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => { form.clear(); state.setQuery(''); state.focusVisible(); }}
      ><Icon name="x" /></button>}
      {!props.multiple && <button type="button" className="ds-picker-tool" tabIndex={-1}
        aria-label={`${labels.open}：${form.label}`} disabled={form.blocked || readOnly}
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => { if (state.open) state.close(); else { inputRef.current?.focus(); state.setOpen(true); } }}
      ><Icon name="chevron-down" /></button>}
    </div>
    <AnchorPopover
      open={state.open} anchor={anchor} role={props.multiple ? 'dialog' : 'presentation'}
      aria-label={props.multiple ? form.label : undefined} id={`${form.id}-panel`}
      initialFocus={props.multiple ? inputRef : false} matchAnchorWidth className="ds-choice-menu ds-search-select-panel"
      onClose={(reason) => { state.close(); if (reason === 'escape' && !props.multiple) queueMicrotask(() => inputRef.current?.select()); }}
    >
      {props.multiple && <div className="ds-search-select-filter">{input}</div>}
      {loading && <div className="ds-select-empty" role="status">{labels.loading}</div>}
      <SelectOptions
        id={state.listId} choices={state.choices} active={state.activeIndex} label={form.label} multiple={props.multiple}
        disabled={form.blocked || !!readOnly || loading} emptyText={loading ? labels.loading : form.emptyText}
        onActive={state.setActive} onChoose={state.choose} keepInputFocus
      />
      {props.multiple && <div className="ds-search-select-status" role="status">{labels.count(selected.length)}</div>}
    </AnchorPopover>
    {props.multiple && selectionText && <span className="ds-visually-hidden" id={summaryId}>{selectionText}</span>}
    {form.error && <p className="ds-field-error" id={`${form.id}-error`} role="alert">{form.error}</p>}
  </div>;
}
