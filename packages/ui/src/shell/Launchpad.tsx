import { useImperativeHandle, useRef, type ComponentProps, type CSSProperties } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useControllable } from '../foundation/useControllable';
import { useChoiceNavigation } from '../foundation/useChoiceNavigation';
import { matchesSearch } from '../foundation/search';
import { SearchField } from '../layout/Layout';
import { EmptyState } from '../primitives/Feedback';
import { AppIcon, type AppIconAppearance } from './AppIcon';

export interface LaunchpadItem {
  id: string; name: string; description?: string; app?: AppIconAppearance; keywords?: readonly string[]; disabled?: boolean;
}
export interface LaunchpadLabels { search: string; empty: string; applications: string }
export interface LaunchpadProps extends Omit<ComponentProps<'section'>, 'children'> {
  label: string;
  items: readonly LaunchpadItem[];
  onLaunch: (item: LaunchpadItem) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  columns?: number;
  disabled?: boolean;
  labels?: Partial<LaunchpadLabels>;
}
export function Launchpad({ label, items, onLaunch, query, defaultQuery = '', onQueryChange, columns = 4, disabled,
  labels: overrides, ref, className, style, onKeyDown, ...rest }: LaunchpadProps) {
  const root = useRef<HTMLElement>(null);
  const labels = useLabels('launchpad', overrides);
  const count = Number.isFinite(columns) ? Math.max(1, Math.min(8, Math.floor(columns))) : 4;
  const [search, changeSearch] = useControllable(query, defaultQuery, onQueryChange);
  const filtered = items.filter((item) => matchesSearch([item.name, item.description, ...(item.keywords ?? [])].join(' '), search))
    .map((item) => ({ ...item, disabled: disabled || item.disabled }));
  const navigation = useChoiceNavigation(filtered, root, { columns: count, onChoose: onLaunch });
  useImperativeHandle(ref, () => root.current!, []);
  return <section {...rest} ref={root} aria-label={label} className={cx('ds-launchpad', className)}
    style={{ ...style, '--ds-launchpad-columns': count } as CSSProperties} onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.target instanceof Element && event.target.closest('[data-choice-id]')) navigation.keyDown(event);
    }}>
    <SearchField label={labels.search} placeholder={labels.search} value={search} disabled={disabled}
      onChange={(event) => { changeSearch(event.currentTarget.value); navigation.setActive(''); }} />
    <ul className="ds-launchpad-grid" aria-label={labels.applications}>
      {filtered.map((item) => <li key={item.id}><button type="button" className="ds-launchpad-item" disabled={item.disabled}
        tabIndex={item.id === navigation.active?.id ? 0 : -1} data-choice-id={item.id} title={item.description}
        onFocus={() => navigation.setActive(item.id)} onClick={() => onLaunch(item)}>
        <AppIcon {...item.app} size={item.app?.size ?? 48} />
        <span>{item.name}</span>
      </button></li>)}
    </ul>
    {!filtered.length && <EmptyState compact>{labels.empty}</EmptyState>}
  </section>;
}
