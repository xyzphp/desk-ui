import { useId, useImperativeHandle, useRef, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { matchesSearch } from '../foundation/search';
import { useControllable } from '../foundation/useControllable';
import { useChoiceNavigation } from '../foundation/useChoiceNavigation';
import { SearchField } from '../layout/Layout';
import { EmptyState, Notice } from '../primitives/Feedback';
import { Kbd } from '../primitives/Kbd';
import { Spinner } from './Pickers';

export interface CommandItem {
  id: string; label: string; description?: string; icon?: IconName; group?: string; shortcut?: string;
  keywords?: readonly string[]; disabled?: boolean;
}
export interface CommandPaletteLabels { search: string; empty: string; loading: string; results: string }
export interface CommandPaletteProps extends Omit<ComponentProps<'section'>, 'children' | 'onSelect'> {
  label: string;
  items: readonly CommandItem[];
  onExecute: (item: CommandItem) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  labels?: Partial<CommandPaletteLabels>;
}
/** 可嵌入的命令内容；不创建弹窗、不绑定全局快捷键、不内置业务命令。 */
export function CommandPalette({ label, items, onExecute, query, defaultQuery = '', onQueryChange, onCancel,
  loading, disabled, error, labels: overrides, className, ref, onKeyDown, ...rest }: CommandPaletteProps) {
  const root = useRef<HTMLElement>(null), input = useRef<HTMLInputElement>(null), id = useId();
  const labels = useLabels('commandPalette', overrides);
  const [search, changeSearch] = useControllable(query, defaultQuery, onQueryChange);
  const filtered = items.filter((item) => matchesSearch([item.label, item.description, item.group, ...(item.keywords ?? [])].join(' '), search))
    .map((item) => ({ ...item, disabled: disabled || loading || item.disabled }));
  const navigation = useChoiceNavigation(filtered, root, { virtual: true, onChoose: onExecute });
  useImperativeHandle(ref, () => root.current!, []);
  return <section {...rest} ref={root} className={cx('ds-command-palette', className)} aria-label={label} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && !event.nativeEvent.isComposing && event.key === 'Escape' && onCancel) {
      event.preventDefault(); event.stopPropagation(); onCancel();
    }
  }}>
    <SearchField ref={input} label={labels.search} placeholder={labels.search} role="combobox" value={search}
      aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-results`} disabled={disabled}
      aria-activedescendant={navigation.index >= 0 ? `${id}-option-${navigation.index}` : undefined}
      onChange={(event) => { changeSearch(event.currentTarget.value); navigation.setActive(''); }}
      onKeyDown={(event) => {
        // 外层仍可通过捕获阶段接管；仅输入框负责虚拟焦点，原生选项不会重复执行。
        navigation.keyDown(event);
      }} />
    {error && <Notice tone="error">{error}</Notice>}
    {loading && <div className="ds-command-loading"><Spinner label={labels.loading} /><span>{labels.loading}</span></div>}
    <div id={`${id}-results`} role="listbox" aria-label={labels.results} aria-busy={loading || undefined}
      className="ds-command-results ds-scrollable">
      {filtered.map((item, index) => <button type="button" role="option" id={`${id}-option-${index}`} key={item.id}
        className="ds-command-option" tabIndex={-1} aria-selected={item.id === navigation.active?.id}
        aria-disabled={item.disabled || undefined} disabled={item.disabled} data-choice-id={item.id}
        onPointerDown={(event) => event.preventDefault()} onMouseMove={() => { if (!item.disabled) navigation.setActive(item.id); }}
        onClick={() => { if (!item.disabled) { input.current?.focus(); onExecute(item); } }}>
        {item.icon && <Icon name={item.icon} />}
        <span className="ds-command-copy"><strong>{item.label}</strong>{item.description && <span>{item.description}</span>}</span>
        {item.group && <span className="ds-command-group">{item.group}</span>}
        {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
      </button>)}
    </div>
    {!loading && !filtered.length && <EmptyState compact>{labels.empty}</EmptyState>}
  </section>;
}
