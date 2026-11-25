import { useRef, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { safeImage } from '../foundation/safeImage';

export interface FileCollectionItem {
  id: string;
  name: string;
  title?: string;
  icon?: IconName;
  image?: string;
  secondary?: string;
  disabled?: boolean;
  draggable?: boolean;
}
export interface FileCollectionLabels {
  grid: string;
  list: string;
  file: string;
}
export interface FileCollectionProps extends Omit<ComponentProps<'div'>, 'children' | 'onSelect' | 'onDrop'> {
  items: readonly FileCollectionItem[];
  view?: 'grid' | 'list';
  selectedIds?: readonly string[];
  focusId?: string;
  columns?: number;
  labels?: Partial<FileCollectionLabels>;
  emptyState?: ReactNode;
  /** Keep the supplied root and item markup classes without adding component styling hooks. */
  nativeStructure?: boolean;
  itemIdAttribute?: 'data-file-id' | 'data-fm-item';
  dragType?: string;
  canStartDrag?: (item: FileCollectionItem) => boolean;
  onSelectedIdsChange?: (ids: string[]) => void;
  onActivate?: (item: FileCollectionItem) => void;
  onContextMenu?: (event: MouseEvent, item?: FileCollectionItem) => void;
  onDrop?: (ids: string[], targetId?: string) => void;
  renderDetails?: (item: FileCollectionItem) => ReactNode;
  /** Override item classes and inner markup while retaining selection, keyboard and drag behavior. */
  itemClassName?: (item: FileCollectionItem) => string | undefined;
  renderItemContent?: (item: FileCollectionItem, view: 'grid' | 'list') => ReactNode;
}

/** 文件与资源集合的选择显示。请求、操作权限与持久化由宿主负责。 */
export function FileCollection({
  items,
  view = 'grid',
  selectedIds = [],
  focusId,
  columns,
  labels: overrides,
  nativeStructure = false,
  onSelectedIdsChange,
  onActivate,
  onContextMenu,
  onDrop,
  renderDetails,
  itemClassName,
  renderItemContent,
  emptyState,
  itemIdAttribute = 'data-file-id',
  dragType = 'application/x-ds-files',
  canStartDrag,
  className,
  onKeyDown,
  role,
  style,
  'aria-label': ariaLabel,
  'aria-multiselectable': ariaMultiselectable,
  'aria-description': ariaDescription,
  ...rest
}: FileCollectionProps) {
  const root = useRef<HTMLDivElement>(null);
  const anchor = useRef('');
  const labels = useLabels('fileCollection', overrides);
  const copy = labels.file;
  const mode = view === 'grid' ? labels.grid : labels.list;
  const itemSelector = `[${itemIdAttribute}]`;
  const current = new Set(selectedIds);
  const activeFocusId = focusId && items.some((item) => item.id === focusId) ? focusId : items[0]?.id;
  const select = (item: FileCollectionItem, event: React.MouseEvent | React.KeyboardEvent) => {
    if (item.disabled) return;
    const all = items.map(({ id }) => id);
    const next =
      event.shiftKey && anchor.current && all.includes(anchor.current)
        ? new Set(
            all.slice(
              Math.min(all.indexOf(anchor.current), all.indexOf(item.id)),
              Math.max(all.indexOf(anchor.current), all.indexOf(item.id)) + 1,
            ),
          )
        : new Set(event.ctrlKey || event.metaKey ? current : []);
    if (event.ctrlKey || event.metaKey) next.has(item.id) ? next.delete(item.id) : next.add(item.id);
    else if (!(event.shiftKey && anchor.current)) next.add(item.id);
    if (!event.shiftKey) anchor.current = item.id;
    onSelectedIdsChange?.(all.filter((id) => next.has(id)));
  };
  return (
    <div
      {...rest}
      ref={root}
      role={nativeStructure ? role : (role ?? 'listbox')}
      aria-label={nativeStructure ? ariaLabel : (ariaLabel ?? copy)}
      aria-multiselectable={nativeStructure ? ariaMultiselectable : true}
      aria-description={nativeStructure ? ariaDescription : (ariaDescription ?? mode)}
      className={nativeStructure ? className : cx('ds-file-collection', `is-${view}`, className)}
      style={
        nativeStructure
          ? style
          : { ['--ds-file-columns' as string]: columns && columns > 0 ? Math.floor(columns) : 'auto', ...style }
      }
      onContextMenu={(event) => {
        const node = (event.target as HTMLElement).closest<HTMLElement>(itemSelector);
        onContextMenu?.(
          event,
          items.find((item) => item.id === node?.getAttribute(itemIdAttribute)),
        );
      }}
      onDragOver={(event) => {
        if (onDrop && event.dataTransfer.types.includes(dragType)) event.preventDefault();
      }}
      onDragEnter={(event) => {
        const node = (event.target as HTMLElement).closest<HTMLElement>(itemSelector);
        if (node && onDrop && event.dataTransfer.types.includes(dragType)) node.classList.add('is-drag-over');
      }}
      onDragLeave={(event) => {
        const node = (event.target as HTMLElement).closest<HTMLElement>(itemSelector);
        if (node && !node.contains(event.relatedTarget as Node | null)) node.classList.remove('is-drag-over');
      }}
      onDrop={(event) => {
        if (!onDrop || !event.dataTransfer.types.includes(dragType)) return;
        event.preventDefault();
        const node = (event.target as HTMLElement).closest<HTMLElement>(itemSelector);
        root.current?.querySelectorAll('.is-drag-over').forEach((item) => item.classList.remove('is-drag-over'));
        let ids: unknown = [];
        try {
          ids = JSON.parse(
            event.dataTransfer.getData(dragType) || event.dataTransfer.getData('application/x-ds-files') || '[]',
          );
        } catch {
          /* Ignore external data. */
        }
        onDrop(
          Array.isArray(ids) && ids.every((id) => typeof id === 'string' && id.length <= 128) ? ids : [],
          node?.getAttribute(itemIdAttribute) ?? undefined,
        );
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey)
          return;
        const nodes = [
          ...(root.current?.querySelectorAll<HTMLElement>(`${itemSelector}:not([aria-disabled="true"])`) ?? []),
        ];
        const at = nodes.indexOf(event.target as HTMLElement);
        let next = -1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(nodes.length - 1, at + 1);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, at - 1);
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = nodes.length - 1;
        if (event.key === ' ' && at >= 0) {
          event.preventDefault();
          const item = items.find(({ id }) => id === nodes[at]?.getAttribute(itemIdAttribute));
          if (item) select(item, event);
        } else if (next >= 0) {
          event.preventDefault();
          nodes[next]?.focus();
          if (!event.shiftKey) anchor.current = nodes[next]?.getAttribute(itemIdAttribute) ?? '';
        } else if (event.key === 'Enter' && at >= 0) {
          event.preventDefault();
          const item = items.find(({ id }) => id === nodes[at]?.getAttribute(itemIdAttribute));
          if (item) onActivate?.(item);
        }
      }}
      onDragEnd={() =>
        root.current
          ?.querySelectorAll('.is-dragging, .is-drag-over')
          .forEach((item) => item.classList.remove('is-dragging', 'is-drag-over'))
      }
    >
      {items.length === 0 && emptyState}
      {items.map((item, index) => (
        <button
          key={item.id}
          {...{ [itemIdAttribute]: item.id }}
          role="option"
          aria-label={item.name}
          aria-selected={current.has(item.id)}
          aria-disabled={item.disabled || undefined}
          disabled={item.disabled}
          tabIndex={
            item.disabled
              ? -1
              : focusId !== undefined || nativeStructure
                ? item.id === activeFocusId
                  ? 0
                  : -1
                : index === 0 || current.has(item.id)
                  ? 0
                  : -1
          }
          type="button"
          draggable={item.draggable !== false && !item.disabled}
          title={item.title}
          className={cx(
            !nativeStructure && 'ds-file-collection-item',
            itemClassName?.(item),
            current.has(item.id) && 'is-selected',
            !nativeStructure && item.disabled && 'is-disabled',
          )}
          onClick={(event) => select(item, event)}
          onDoubleClick={() => {
            if (!item.disabled) onActivate?.(item);
          }}
          onDragStart={(event) => {
            if (canStartDrag?.(item) === false) {
              event.preventDefault();
              return;
            }
            const wasSelected = current.has(item.id);
            if (!wasSelected) {
              onSelectedIdsChange?.([item.id]);
              anchor.current = item.id;
            }
            const dragged = (wasSelected ? items.filter((entry) => current.has(entry.id)) : [item]).filter(
              (entry) => entry.draggable !== false && !entry.disabled,
            );
            if (!dragged.length) {
              event.preventDefault();
              return;
            }
            const ids = dragged.map((entry) => entry.id);
            root.current?.querySelectorAll<HTMLElement>(itemSelector).forEach((node) => {
              if (ids.includes(node.getAttribute(itemIdAttribute) ?? '')) node.classList.add('is-dragging');
            });
            event.dataTransfer.setData(dragType, JSON.stringify(ids));
            event.dataTransfer.setData('text/plain', dragged.map((entry) => entry.name).join('\n'));
            event.dataTransfer.effectAllowed = 'move';
          }}
        >
          {renderItemContent ? (
            renderItemContent(item, view)
          ) : (
            <>
              <span className={cx('ds-file-collection-visual', item.icon === 'folder' && 'is-folder')}>
                {safeImage(item.image) ? (
                  <img src={item.image} alt="" loading="lazy" draggable={false} />
                ) : (
                  <Icon name={item.icon ?? 'file-text'} />
                )}
              </span>
              <span className="ds-file-collection-copy">
                <span className="ds-file-collection-name">{item.name}</span>
                {item.secondary && <span className="ds-file-collection-secondary">{item.secondary}</span>}
              </span>
              {view === 'list' && renderDetails?.(item)}
            </>
          )}
        </button>
      ))}
    </div>
  );
}
