import { useImperativeHandle, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import type { TreeNode } from './treeModel';
import { useTree } from './useTree';

export interface TreeLabels { empty: string; expand: (label: string) => string; collapse: (label: string) => string }
export interface TreeProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  nodes: readonly TreeNode[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (ids: readonly string[]) => void;
  onActivate?: (node: TreeNode) => void;
  disabled?: boolean;
  labels?: Partial<TreeLabels>;
}

/** 单选目录树；权限复选仍由 PermissionTree / SelectionTree 处理。 */
export function Tree(props: TreeProps) {
  const {
    label, nodes, value, defaultValue, onValueChange, expanded, defaultExpanded, onExpandedChange, onActivate,
    disabled, labels: overrides, className, onKeyDown, ref, onFocus, onBlur, ...rest
  } = props;
  const labels = useLabels('tree', overrides);
  const { root, focusWithin, ...state } = useTree(props);
  useImperativeHandle(ref, () => root.current!, [root]);
  const branch = (items: readonly TreeNode[]) => items.map((node) => {
    const entry = state.model.index.get(node.id)!;
    const opened = state.model.opened.has(node.id);
    const hasChildren = !!node.children?.length;
    const selected = state.value === node.id && node.selectable !== false;
    return <div
      key={node.id} id={state.idOf(node.id)} role="treeitem" data-tree-id={node.id}
      tabIndex={!entry.disabled && state.active === node.id ? 0 : -1} aria-label={node.label}
      aria-selected={node.selectable === false ? undefined : selected} aria-expanded={hasChildren ? opened : undefined}
      aria-disabled={entry.disabled || undefined} aria-level={entry.level} aria-posinset={entry.position} aria-setsize={entry.size}
      className="ds-tree-item" onFocus={(event) => { if (event.target === event.currentTarget) state.setFocused(node.id); }}
    >
      <div className="ds-tree-row" onClick={() => {
        if (!entry.disabled) { state.focus(node.id); state.select(entry); }
      }} onDoubleClick={() => { if (!entry.disabled) onActivate?.(node); }}>
        {hasChildren ? <button
          type="button" tabIndex={-1} className="ds-tree-toggle" disabled={entry.disabled}
          aria-label={opened ? labels.collapse(node.label) : labels.expand(node.label)}
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => { event.stopPropagation(); state.toggle(entry); state.focus(node.id); }}
        ><Icon name={opened ? 'chevron-down' : 'chevron-right'} /></button> : <span className="ds-tree-spacer" />}
        {node.icon && <Icon name={node.icon} />}
        <span className="ds-tree-label">{node.label}</span>
        {selected && <Icon name="check" className="ds-tree-check" />}
      </div>
      {hasChildren && opened && <div role="group" className="ds-tree-group">{branch(node.children!)}</div>}
    </div>;
  });
  return <div {...rest} ref={root} role="tree" aria-label={label} aria-disabled={disabled || undefined}
    className={cx('ds-tree ds-scrollable', className)} onKeyDown={(event) => { onKeyDown?.(event); state.key(event); }}
    onFocus={(event) => { focusWithin.current = true; onFocus?.(event); }}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusWithin.current = false;
      onBlur?.(event);
    }}
  >{nodes.length ? branch(nodes) : <div className="ds-tree-empty">{labels.empty}</div>}</div>;
}
