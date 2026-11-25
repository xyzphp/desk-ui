import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { useLabels } from '../foundation/ConfigProvider';
import { Link } from '../primitives/Display';

export interface BreadcrumbItem { id: string; label: ReactNode; href?: string; disabled?: boolean }
export interface BreadcrumbLabels { navigation: string; more: string }
export interface BreadcrumbProps extends Omit<ComponentProps<'nav'>, 'children' | 'onSelect'> {
  items: readonly BreadcrumbItem[];
  maxItems?: number;
  onSelect?: (item: BreadcrumbItem) => void;
  /** Make the current crumb actionable, for source pages where every path segment is a button. */
  activateCurrent?: boolean;
  labels?: Partial<BreadcrumbLabels>;
}

/** href 保留真实链接；没有 href 的历史层级由宿主 onSelect 处理。最后一段是当前页。 */
export function Breadcrumb({ items, maxItems = 4, onSelect, activateCurrent = false, labels: overrides, className, ...rest }: BreadcrumbProps) {
  const labels = useLabels('breadcrumb', overrides);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  const limit = Number.isFinite(maxItems) ? Math.max(3, Math.floor(maxItems)) : 4;
  const overflow = items.length > limit;
  const hidden = overflow ? items.slice(1, items.length - limit + 2) : [];
  const visible = overflow ? [items[0]!, ...items.slice(-(limit - 2))] : items;
  const path = items.map((item) => item.id).join('\u0000');
  useEffect(() => { setOpen(false); }, [path, limit]);
  const renderItem = (item: BreadcrumbItem, current = false) => {
    if (current && !activateCurrent) return <span className="ds-breadcrumb-current" aria-current="page">{item.label}</span>;
    if (item.disabled) return <span aria-disabled="true">{item.label}</span>;
    if (item.href) return <Link href={item.href} aria-current={current ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link>;
    if (onSelect) return <button type="button" className="ds-breadcrumb-button" onClick={() => {
      setOpen(false); onSelect(item);
    }} aria-current={current ? 'page' : undefined}>{item.label}</button>;
    return <span>{item.label}</span>;
  };
  if (items.length === 0) return null;
  return <nav {...rest} className={cx('ds-breadcrumb', className)} aria-label={rest['aria-label'] ?? labels.navigation}>
    <ol className="ds-breadcrumb-list">
      {visible.map((item, index) => <li key={item.id}>
        {index > 0 && <Icon name="chevron-right" />}
        {renderItem(item, item.id === items.at(-1)?.id)}
        {overflow && index === 0 && <>
          <Icon name="chevron-right" />
          <button
            ref={trigger} type="button" className="ds-breadcrumb-button" aria-label={labels.more}
            aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}
          >…</button>
        </>}
      </li>)}
    </ol>
    <AnchorPopover open={open && overflow} anchor={trigger} role="dialog" aria-label={labels.more} id={id}
      className="ds-breadcrumb-overflow" onClose={() => setOpen(false)}>
      <ol>{hidden.map((item) => <li key={item.id}>{renderItem(item)}</li>)}</ol>
    </AnchorPopover>
  </nav>;
}
