import { useImperativeHandle, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { Button } from '../primitives/Button';
import { List } from './Layout';
import { reorderIds } from './sortableModel';
import { useSortableList } from './useSortableList';

export interface SortableListItem {
  id: string;
  label: string;
  description?: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}
export interface SortableListLabels {
  empty: string;
  cancelled: string;
  instructions: string;
  rowInstructions: string;
  handle: (label: string) => string;
  previous: (label: string) => string;
  next: (label: string) => string;
  lifted: (label: string) => string;
  moved: (label: string, position: number, total: number) => string;
  position: (label: string, position: number, total: number) => string;
  rowMovementInstructions: string;
  /** 整行可拖动时条目的 aria-roledescription。 */
  roleDescription: string;
}
export interface SortableListProps extends Omit<ComponentProps<'ul'>, 'children' | 'onChange'> {
  label: string;
  items: readonly SortableListItem[];
  onOrderChange: (ids: readonly string[]) => void;
  orientation?: 'vertical' | 'horizontal';
  /** `row` enables dragging from the item itself and keyboard sorting on the row. */
  dragMode?: 'handle' | 'row';
  /** How row dragging starts. `movement` starts after a press moves past the drag threshold. */
  rowDragActivation?: 'long-press' | 'movement';
  /** Shows the previous / next buttons; defaults to true. */
  showMoveButtons?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  renderItem?: (item: SortableListItem) => ReactNode;
  /** An end-of-list action outside the sortable item order. */
  trailing?: ReactNode;
  labels?: Partial<SortableListLabels>;
}
export function SortableList(props: SortableListProps) {
  const {
    label,
    items,
    onOrderChange,
    orientation = 'vertical',
    dragMode = 'handle',
    rowDragActivation = 'long-press',
    showMoveButtons = true,
    disabled,
    readOnly,
    renderItem,
    trailing,
    labels: overrides,
    ref,
    className,
    onKeyDown,
    onDragOver,
    onDrop,
    onDragEnd,
    onBlur,
    ...rest
  } = props;
  const labels = useLabels('sortableList', overrides);
  const { root, ...state } = useSortableList(props, labels);
  useImperativeHandle(ref, () => root.current!, [root]);
  const horizontal = orientation === 'horizontal';
  const instructions =
    dragMode === 'row'
      ? rowDragActivation === 'movement'
        ? labels.rowMovementInstructions
        : labels.rowInstructions
      : labels.instructions;
  return (
    <>
      <span className="ds-visually-hidden" id={`${state.id}-help`}>
        {instructions}
      </span>
      <List
        {...rest}
        ref={root}
        data-sort-list={state.id}
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={cx('ds-sortable', horizontal && 'ds-sortable--horizontal', className)}
        onKeyDown={state.key}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) state.leave();
        }}
        onDragOver={(event) => {
          onDragOver?.(event);
          if (!event.defaultPrevented) state.dragOver(event);
        }}
        onDrop={(event) => {
          onDrop?.(event);
          if (!event.defaultPrevented) state.nativeDrop(event);
        }}
        onDragEnd={(event) => {
          onDragEnd?.(event);
          state.finish();
        }}
      >
        {items.length === 0 && !trailing && <li className="ds-sortable-empty">{labels.empty}</li>}
        {items.map((item, index) => {
          const blocked = state.blocked || !!item.disabled;
          const from = state.active ? state.order.indexOf(state.active.id) : -1;
          const target = state.active && state.active.to !== from && state.active.to === index;
          const canMove = (offset: number) =>
            !blocked && reorderIds(state.order, item.id, index + offset, state.locked) !== state.order;
          const rowDraggable = dragMode === 'row' && !readOnly;
          const nativeRowDraggable = rowDraggable && rowDragActivation === 'movement';
          const pointerRowDraggable = rowDraggable && !nativeRowDraggable;
          return (
            <li
              key={item.id}
              data-sort-id={item.id}
              draggable={nativeRowDraggable && !blocked && !item.disabled}
              aria-disabled={item.disabled || undefined}
              data-sort-handle={rowDraggable ? item.id : undefined}
              aria-label={rowDraggable ? item.label : undefined}
              aria-describedby={rowDraggable ? `${state.id}-help` : undefined}
              aria-keyshortcuts={
                rowDraggable
                  ? `Space ${horizontal ? 'ArrowLeft ArrowRight' : 'ArrowUp ArrowDown'} Enter Escape`
                  : undefined
              }
              aria-roledescription={rowDraggable ? labels.roleDescription : undefined}
              tabIndex={rowDraggable ? (blocked || item.disabled ? -1 : 0) : undefined}
              className={cx(
                'ds-sortable-row',
                state.active?.id === item.id && 'is-dragging',
                state.active?.id === item.id && state.active.kind !== 'keyboard' && 'is-drag-source',
                target && (index > from ? 'is-after' : 'is-before'),
              )}
              onDragStart={nativeRowDraggable ? (event) => state.dragStart(event, item.id) : undefined}
              onPointerDown={pointerRowDraggable ? (event) => state.rowPointerDown(event, item.id) : undefined}
              onPointerMove={pointerRowDraggable ? state.rowPointerMove : undefined}
              onPointerUp={pointerRowDraggable ? (event) => state.rowPointerUp(event) : undefined}
              onPointerCancel={pointerRowDraggable ? (event) => state.rowPointerUp(event, true) : undefined}
              onLostPointerCapture={pointerRowDraggable ? (event) => state.rowPointerUp(event, true) : undefined}
              onClickCapture={pointerRowDraggable ? (event) => state.rowClickCapture(event, item.id) : undefined}
            >
              {!readOnly && dragMode === 'handle' && (
                <Button
                  variant="quiet"
                  size="sm"
                  data-sort-handle={item.id}
                  aria-label={labels.handle(item.label)}
                  aria-describedby={`${state.id}-help`}
                  aria-pressed={state.active?.id === item.id && state.active.kind === 'keyboard'}
                  aria-keyshortcuts={horizontal ? 'Alt+ArrowLeft Alt+ArrowRight' : 'Alt+ArrowUp Alt+ArrowDown'}
                  disabled={blocked}
                  className="ds-sortable-handle"
                  draggable={!blocked}
                  onClick={() => state.click(item.id)}
                  onDragStart={(event) => state.dragStart(event, item.id)}
                  onPointerDown={(event) => state.pointerDown(event, item.id)}
                  onPointerMove={state.pointerMove}
                  onPointerUp={(event) => state.pointerUp(event)}
                  onPointerCancel={(event) => state.pointerUp(event, true)}
                  onLostPointerCapture={(event) => state.pointerUp(event, true)}
                >
                  <Icon name="grip-vertical" />
                </Button>
              )}
              {item.icon && <Icon name={item.icon} />}
              <div className="ds-sortable-content">
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <strong>{item.label}</strong>
                    {item.description && <span>{item.description}</span>}
                  </>
                )}
              </div>
              {!readOnly && showMoveButtons && (
                <div className="ds-sortable-actions">
                  <Button
                    variant="quiet"
                    size="sm"
                    aria-label={labels.previous(item.label)}
                    disabled={!canMove(-1)}
                    onClick={() => {
                      state.finish();
                      state.commit(item.id, index - 1);
                    }}
                  >
                    <Icon name={horizontal ? 'chevron-left' : 'arrow-up'} />
                  </Button>
                  <Button
                    variant="quiet"
                    size="sm"
                    aria-label={labels.next(item.label)}
                    disabled={!canMove(1)}
                    onClick={() => {
                      state.finish();
                      state.commit(item.id, index + 1);
                    }}
                  >
                    <Icon name={horizontal ? 'chevron-right' : 'arrow-down'} />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
        {trailing && <li className="ds-sortable-trailing">{trailing}</li>}
      </List>
      <span className="ds-visually-hidden" role="status">
        {state.message}
      </span>
    </>
  );
}
