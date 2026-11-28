import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { Button } from '../primitives/Button';
import { Select } from '../primitives/Field';
import { ToolbarActions } from './Layout';

export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  /** 单元格内容；缺省时读取行对象上同名字段。 */
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'start' | 'end';
  /** 固定列宽，如 "120px"；其余列均分剩余宽度。 */
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectedKey?: string;
  onRowSelect?: (row: T) => void;
  sort?: SortState;
  /** 点击可排序表头时回调；排序本身由调用方完成。 */
  onSortChange?: (next: SortState) => void;
  /** 无障碍名称。 */
  caption: string;
  empty?: ReactNode;
  /** 单元格内容允许换行（说明类表格）；默认单行省略，适合数据列表。 */
  wrap?: boolean;
  /** 表格最小宽度（如 "620px"）；容器窄于该宽度时在滚动容器内横向滚动，避免固定布局挤扁自适应列。 */
  minWidth?: string;
  className?: string;
  /** 横纵滚动的容器；宿主据此采集 / 恢复滚动位置。 */
  ref?: Ref<HTMLDivElement>;
}

function nextSort(current: SortState | undefined, key: string): SortState {
  if (current?.key === key && current.direction === 'ascending') return { key, direction: 'descending' };
  return { key, direction: 'ascending' };
}

/** 数据表：固定布局、粘性表头、可排序、可选中行。对应 .workspace-table。 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onRowSelect,
  sort,
  onSortChange,
  caption,
  empty,
  wrap,
  minWidth,
  className,
  ref,
}: TableProps<T>) {
  return (
    <div ref={ref} className={cx('ds-table-scroll', className)}>
      <table className={cx('ds-table', wrap && 'ds-table--wrap')} style={minWidth ? { minWidth } : undefined}>
        <caption className="ds-visually-hidden">{caption}</caption>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx(c.align === 'end' && 'is-end')}
                aria-sort={c.sortable ? (sort?.key === c.key ? sort.direction : 'none') : undefined}
              >
                {c.sortable ? (
                  <button type="button" className="ds-table-sort" onClick={() => onSortChange?.(nextSort(sort, c.key))}>
                    <span>{c.header}</span>
                    <Icon
                      name={
                        sort?.key === c.key
                          ? sort.direction === 'ascending'
                            ? 'arrow-up'
                            : 'arrow-down'
                          : 'chevrons-up-down'
                      }
                    />
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = key === selectedKey;
            return (
              <tr
                key={key}
                className={cx(selected && 'is-selected')}
                aria-selected={onRowSelect ? selected : undefined}
                tabIndex={onRowSelect ? 0 : undefined}
                onClick={onRowSelect ? () => onRowSelect(row) : undefined}
                onKeyDown={
                  onRowSelect
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowSelect(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx(c.align === 'end' && 'is-end')}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && empty}
    </div>
  );
}

export interface PaginationLabels {
  previous: string;
  next: string;
  pageSize: string;
  /** 当前页与总页数；空数据仍为 1 / 1。 */
  page: (page: number, pageCount: number) => string;
  total: (total: number) => string;
}

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children' | 'aria-label'> {
  'aria-label': string;
  total: number;
  pageSize: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** 不传或为空时隐藏条数选择器；当前 pageSize 始终作为可选项保留。 */
  pageSizeOptions?: readonly number[];
  /** 只回调新的条数，不自动翻页；调用方可同时把 page 重置为 1。 */
  onPageSizeChange?: (pageSize: number) => void;
  labels: PaginationLabels;
  disabled?: boolean;
}

function positiveInteger(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

/** 日志与生成应用的分页栏。组件只管理页码显示与回调，不排序、切片或请求数据。 */
export function Pagination({
  total,
  pageSize,
  page,
  defaultPage = 1,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  labels,
  disabled,
  className,
  ...rest
}: PaginationProps) {
  const [current, setCurrent] = useControllable(page, defaultPage, onPageChange);
  const totalItems = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const size = positiveInteger(pageSize);
  const pageCount = Math.max(1, Math.ceil(totalItems / size));
  const activePage = Math.min(pageCount, positiveInteger(current));
  const sizes = pageSizeOptions?.length
    ? [...new Set([size, ...pageSizeOptions.filter((value) => Number.isSafeInteger(value) && value > 0)])].sort(
        (a, b) => a - b,
      )
    : [];

  return (
    <nav className={cx('ds-pagination', className)} {...rest}>
      <span className="ds-pagination-total">{labels.total(totalItems)}</span>
      <ToolbarActions className="ds-pagination-actions">
        {sizes.length > 0 && (
          <label className="ds-pagination-size">
            <span>{labels.pageSize}</span>
            <Select
              value={size}
              disabled={disabled || !onPageSizeChange}
              onChange={(event) => onPageSizeChange?.(Number(event.currentTarget.value))}
            >
              {sizes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        )}
        <Button disabled={disabled || activePage <= 1} onClick={() => setCurrent(activePage - 1)}>
          {labels.previous}
        </Button>
        <span className="ds-pagination-position" role="status" aria-live="polite" aria-atomic="true">
          {labels.page(activePage, pageCount)}
        </span>
        <Button disabled={disabled || activePage >= pageCount} onClick={() => setCurrent(activePage + 1)}>
          {labels.next}
        </Button>
      </ToolbarActions>
    </nav>
  );
}

export interface TabItem {
  value: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  'aria-label': string;
  className?: string;
}

/** 页签：方向键 / Home / End 切换，激活项带强调色下划线。支持受控与非受控。 */
export function Tabs({ items, value, defaultValue, onChange, className, ...rest }: TabsProps) {
  const base = useId();
  const [current, setCurrent] = useControllable(
    value,
    defaultValue ?? items.find((i) => !i.disabled)?.value ?? '',
    onChange,
  );
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((i) => !i.disabled);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = enabled.findIndex((i) => i.value === current);
    let target: TabItem | undefined;
    if (e.key === 'ArrowRight') target = enabled[(index + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') target = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') target = enabled[0];
    else if (e.key === 'End') target = enabled[enabled.length - 1];
    if (!target) return;
    e.preventDefault();
    setCurrent(target.value);
    refs.current.get(target.value)?.focus();
  };

  const active = items.find((i) => i.value === current);
  return (
    <div className={className}>
      <div className="ds-tabs" role="tablist" aria-label={rest['aria-label']} onKeyDown={onKeyDown}>
        {items.map((item) => {
          const selected = item.value === current;
          return (
            <button
              key={item.value}
              ref={(el) => {
                if (el) refs.current.set(item.value, el);
                else refs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className="ds-tab"
              onClick={() => setCurrent(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {active?.content !== undefined && (
        <div
          className="ds-tab-panel"
          role="tabpanel"
          id={`${base}-panel-${active.value}`}
          aria-labelledby={`${base}-tab-${active.value}`}
        >
          {active.content}
        </div>
      )}
    </div>
  );
}

export interface StepItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface StepperProps {
  steps: StepItem[];
  /** 当前步骤 id；此前的步骤视为已完成。 */
  current: string;
  onSelect?: (id: string) => void;
  'aria-label': string;
  className?: string;
}

/** 分步导航（如应用工坊六步流程）。当前步骤 aria-current="step"，之前的显示完成连线。 */
export function Stepper({ steps, current, onSelect, className, ...rest }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === current);
  return (
    <nav
      className={cx('ds-stepper', className)}
      aria-label={rest['aria-label']}
      style={{ ['--ds-steps' as string]: steps.length }}
    >
      <ol>
        {steps.map((step, index) => (
          <li key={step.id} className={cx(index < currentIndex && 'is-complete')}>
            <button
              type="button"
              className="ds-step"
              aria-current={step.id === current ? 'step' : undefined}
              disabled={step.disabled}
              onClick={() => onSelect?.(step.id)}
            >
              <span className="ds-step-indicator">
                {index < currentIndex ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span>
                {step.label}
                {step.description && <small>{step.description}</small>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
