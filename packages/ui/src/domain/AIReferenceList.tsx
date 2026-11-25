import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { Checkbox } from '../primitives/Feedback';

export interface AIReferenceItem {
  id: string;
  label: string;
  content?: string;
  disabled?: boolean;
}
export interface AIReferenceListLabels {
  empty: string;
  preview: (item: AIReferenceItem) => string;
}
export interface AIReferenceListProps extends Omit<
  ComponentProps<'section'>,
  'children' | 'onChange' | 'defaultValue'
> {
  label: string;
  items: readonly AIReferenceItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  labels: AIReferenceListLabels;
  disabled?: boolean;
  readOnly?: boolean;
}

/** 只有宿主显式提供的参考项才展示；默认不勾选，不收集其他表单或历史。 */
export function AIReferenceList({
  label,
  items,
  value,
  defaultValue = [],
  onValueChange,
  labels,
  disabled,
  readOnly,
  className,
  ...rest
}: AIReferenceListProps) {
  const [selected, setSelected] = useControllable<readonly string[]>(value, defaultValue, (next) =>
    onValueChange?.([...next]),
  );
  return (
    <section {...rest} className={cx('ds-ai-reference-list', className)} aria-label={label}>
      {items.length === 0 && <p className="ds-ai-status">{labels.empty}</p>}
      {items.map((item) => (
        <div
          key={item.id}
          className={cx(
            'ds-ai-reference-row',
            selected.includes(item.id) && 'is-selected',
            (disabled || readOnly || item.disabled) && 'is-disabled',
          )}
        >
          <Checkbox
            checked={selected.includes(item.id)}
            disabled={disabled || readOnly || item.disabled}
            onChange={(event) => {
              if (disabled || readOnly || item.disabled) return;
              const next = new Set(selected);
              if (event.currentTarget.checked) next.add(item.id);
              else next.delete(item.id);
              setSelected(items.filter((entry) => next.has(entry.id)).map((entry) => entry.id));
            }}
          >
            {item.label}
          </Checkbox>
          {item.content !== undefined && (
            <details className="ds-ai-reference-detail">
              <summary>
                <span>{labels.preview(item)}</span>
                <Icon name="chevron-down" />
              </summary>
              <pre className="ds-ai-reference-content ds-scrollable" tabIndex={0}>
                {item.content}
              </pre>
            </details>
          )}
        </div>
      ))}
    </section>
  );
}
