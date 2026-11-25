import { useEffect, useId, useRef, type ComponentProps } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { useLatest } from '../foundation/useLatest';
import { HelpTip } from '../primitives/Feedback';

export interface SelectionTreeNode {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  children?: readonly SelectionTreeNode[];
}

export interface PermissionTreeNode extends SelectionTreeNode {
  children?: readonly PermissionTreeNode[];
  required?: boolean;
  /** 只有分组标题，不代表一个可授予的权限。 */
  groupOnly?: boolean;
  /** require-parent：勾选子项补选可编辑父项；取消父项会清除可编辑后代，但勾选父项不自动授予子权限。 */
  childPolicy?: 'independent' | 'require-parent';
}

export interface PermissionTreeLabels {
  expand: (label: string) => string;
  collapse: (label: string) => string;
  children: (label: string) => string;
  selectAll: (label: string) => string;
  count: (selected: number, total: number) => string;
  required: string;
  inherited: string;
}

export interface PermissionTreeChildActions {
  selectChildren: string;
  clearChildren: string;
  count?: (selected: number, total: number) => string;
}

export interface PermissionTreeProps extends Omit<
  ComponentProps<'div'>,
  'children' | 'onChange' | 'defaultValue' | 'aria-label'
> {
  'aria-label': string;
  nodes: readonly PermissionTreeNode[];
  /** 只包含直接授权；角色继承通过 inheritedValues 单独提供。 */
  value: readonly string[];
  onValueChange?: (value: string[]) => void;
  inheritedValues?: readonly string[];
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (expanded: readonly string[]) => void;
  readOnly?: boolean;
  /** 保留原站 account-perm-* DOM 类名和权限树 data-* 标记。 */
  nativeStructure?: boolean;
  /** 可选的子级批量操作（勾选子级 / 取消子级）与组内计数显示；仅操作当前可编辑的子项。 */
  childActions?: PermissionTreeChildActions;
  labels: PermissionTreeLabels;
}

export interface SelectionTreeProps extends Omit<PermissionTreeProps, 'nodes' | 'inheritedValues'> {
  nodes: readonly SelectionTreeNode[];
  /** 对直接子项全为叶子的分组，沿原站 API 范围树横向排列叶子。 */
  inlineLeaves?: boolean;
  /** 保留原站 account-perm-* 节点结构，用于迁移页面逐项复用原 DOM / CSS。 */
  nativeStructure?: boolean;
  /** 为叶子复用原站筛选属性；仅接受 data-* 属性名。 */
  leafAttribute?: `data-${string}`;
}

interface Entry {
  node: PermissionTreeNode;
  path: string;
  ancestors: PermissionTreeNode[];
}

function flatten(nodes: readonly PermissionTreeNode[], ancestors: PermissionTreeNode[] = [], prefix = ''): Entry[] {
  return nodes.flatMap((node, index) => {
    const path = `${prefix}${index}`;
    return [{ node, path, ancestors }, ...flatten(node.children ?? [], [...ancestors, node], `${path}.`)];
  });
}

function TreeCheckbox({
  mixed,
  onChange,
  className,
  nativeStructure,
  ...rest
}: ComponentProps<'input'> & { mixed?: boolean; nativeStructure?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const currentMixed = useLatest(mixed);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(mixed);
  });
  return (
    <input
      {...rest}
      className={cx(!nativeStructure && 'ds-control-input', className)}
      type="checkbox"
      ref={ref}
      aria-checked={mixed ? 'mixed' : Boolean(rest.checked)}
      onChange={(event) => {
        onChange?.(event);
        queueMicrotask(() => {
          if (ref.current) ref.current.indeterminate = Boolean(currentMixed.current);
        });
      }}
    />
  );
}

/** 共用行、交替排布、帮助与展开；两种选择语义保持分离。 */
function TreeView({
  mode,
  nodes,
  value,
  onValueChange,
  inheritedValues = [],
  expanded,
  defaultExpanded,
  onExpandedChange,
  readOnly,
  labels,
  className,
  inlineLeaves,
  nativeStructure,
  childActions,
  leafAttribute,
  ...rest
}: PermissionTreeProps & {
  mode: 'permissions' | 'leaves';
  inlineLeaves?: boolean;
  nativeStructure?: boolean;
  leafAttribute?: `data-${string}`;
}) {
  const native = useLabels('permissionTree');
  const base = useId();
  const nativeLeafAttribute = leafAttribute && /^data-[a-z-]+$/.test(leafAttribute) ? leafAttribute : undefined;
  const entries = flatten(nodes);
  const direct = new Set(value);
  const inherited = new Set(mode === 'permissions' ? inheritedValues : []);
  const effective = new Set([
    ...value,
    ...inherited,
    ...entries.filter((entry) => mode === 'permissions' && entry.node.required).map((entry) => entry.node.id),
  ]);
  const descendants = (entry: Entry) => entries.filter((candidate) => candidate.path.startsWith(`${entry.path}.`));
  const leaves = (entry: Entry) => descendants(entry).filter((candidate) => candidate.node.children === undefined);
  const [openIds, setOpenIds] = useControllable<readonly string[]>(
    expanded,
    defaultExpanded ??
      entries
        .filter(
          (entry) =>
            entry.node.children?.length &&
            (mode === 'leaves' ||
              entry.node.required ||
              descendants(entry).some((child) => effective.has(child.node.id))),
        )
        .map((entry) => entry.node.id),
    onExpandedChange,
  );
  const open = new Set(openIds);
  const editable = (entry: Entry) =>
    !readOnly &&
    Boolean(onValueChange) &&
    !entry.node.disabled &&
    !(mode === 'permissions' && (entry.node.required || inherited.has(entry.node.id))) &&
    !(mode === 'leaves' && entry.ancestors.some((ancestor) => ancestor.disabled));

  const change = (entry: Entry) => {
    if (!editable(entry)) return;
    const next = new Set(direct);
    const isGroup = entry.node.children !== undefined;
    if (mode === 'leaves' && isGroup) {
      const available = leaves(entry).filter(editable);
      const checked = !available.every((leaf) => effective.has(leaf.node.id));
      available.forEach((leaf) => {
        if (checked) next.add(leaf.node.id);
        else next.delete(leaf.node.id);
      });
    } else {
      const checked = !effective.has(entry.node.id);
      if (checked) next.add(entry.node.id);
      else next.delete(entry.node.id);
      if (mode === 'permissions' && checked) {
        entry.ancestors
          .filter((ancestor) => ancestor.childPolicy === 'require-parent' && !ancestor.groupOnly)
          .forEach((ancestor) => {
            const parent = entries.find((candidate) => candidate.node === ancestor);
            if (parent && editable(parent)) next.add(ancestor.id);
          });
      }
      if (mode === 'permissions' && !checked) {
        descendants(entry)
          .filter(editable)
          .forEach((child) => next.delete(child.node.id));
      }
    }
    const result =
      mode === 'leaves'
        ? [...next].filter((id) =>
            entries.some((candidate) => candidate.node.id === id && candidate.node.children === undefined),
          )
        : [...next];
    if (result.length !== value.length || result.some((id) => !direct.has(id))) onValueChange?.(result);
  };

  const toggleGroupChildren = (groupEntry: Entry, editableChildren: Entry[], selectAll: boolean) => {
    if (readOnly || !onValueChange || !editableChildren.length) return;
    const next = new Set(direct);
    const includeSelf = !groupEntry.node.groupOnly && editable(groupEntry);
    if (selectAll) {
      if (includeSelf) next.add(groupEntry.node.id);
      groupEntry.ancestors
        .filter((ancestor) => ancestor.childPolicy === 'require-parent' && !ancestor.groupOnly)
        .forEach((ancestor) => {
          const parent = entries.find((candidate) => candidate.node === ancestor);
          if (parent && editable(parent)) next.add(ancestor.id);
        });
      editableChildren.forEach((child) => {
        next.add(child.node.id);
        child.ancestors
          .filter((ancestor) => ancestor.childPolicy === 'require-parent' && !ancestor.groupOnly)
          .forEach((ancestor) => {
            const parent = entries.find((candidate) => candidate.node === ancestor);
            if (parent && editable(parent)) next.add(ancestor.id);
          });
      });
    } else {
      if (includeSelf) next.delete(groupEntry.node.id);
      editableChildren.forEach((child) => next.delete(child.node.id));
    }
    const result = [...next];
    if (result.length !== value.length || result.some((id) => !direct.has(id))) onValueChange(result);
  };

  const render = (siblings: readonly PermissionTreeNode[], prefix = '', depth = 0, inlineParent = false) =>
    siblings.map((node, index) => {
      const path = `${prefix}${index}`;
      const entry = entries.find((candidate) => candidate.path === path)!;
      const childLeaves = leaves(entry);
      const count = childLeaves.filter((leaf) => effective.has(leaf.node.id)).length;
      const groupSelection = mode === 'leaves' && node.children !== undefined;
      const visibleChildEntries = (node.children ?? [])
        .map((child, childIndex) => ({
          child,
          entry: entries.find((candidate) => candidate.path === `${path}.${childIndex}`),
        }))
        .filter(
          ({ child, entry: childEntry }) =>
            !nativeStructure || !child.children || Boolean(childEntry && leaves(childEntry).length),
        );
      const hasChildren = visibleChildEntries.length > 0;
      const parentEntry = entry.ancestors[entry.ancestors.length - 1];
      const hasGroupSiblings = Boolean(parentEntry?.children?.some((sibling) => sibling.children?.length));
      const nestedGroup = hasChildren && entry.ancestors.length > 0;
      const mixed = groupSelection && count > 0 && count < childLeaves.length;
      const checked = groupSelection ? childLeaves.length > 0 && count === childLeaves.length : effective.has(node.id);
      const fixed = !editable(entry) || (groupSelection && !childLeaves.some(editable));
      const groupOnly = mode === 'permissions' && node.groupOnly;
      const required = mode === 'permissions' && node.required;
      const inheritedValue = inherited.has(node.id);
      const leaf = !hasChildren && !groupSelection && entry.ancestors.length > 0;
      const id = `${base}-${path.replaceAll('.', '-')}`;
      const describedBy =
        [
          node.description && `${id}-description`,
          !nativeStructure && inheritedValue && `${id}-inherited`,
          !nativeStructure && required && `${id}-required`,
        ]
          .filter(Boolean)
          .join(' ') || undefined;
      if ((nativeStructure && !hasChildren && entry.ancestors.length > 0) || (inlineParent && !hasChildren)) {
        return (
          <label
            className={cx(
              nativeStructure ? 'account-perm-child' : 'ds-permission-child',
              nativeStructure && node.description && 'account-perm-child--with-help',
              nativeStructure && hasGroupSiblings && !inlineParent && 'account-perm-child--group-sibling',
            )}
            key={node.id}
          >
            {nativeStructure && hasGroupSiblings && !inlineParent && (
              <span className="account-perm-spacer" aria-hidden="true" />
            )}
            <TreeCheckbox
              {...(nativeStructure &&
                mode === 'permissions' && {
                  name: 'apps',
                  value: node.id,
                  'data-perm-child-of': entry.ancestors[entry.ancestors.length - 1]?.id,
                })}
              {...(nativeStructure && nativeLeafAttribute && { [nativeLeafAttribute]: node.id })}
              {...(nativeStructure &&
                mode === 'leaves' &&
                entry.ancestors.length > 0 && {
                  'data-selection-child-of': entry.ancestors[entry.ancestors.length - 1]?.id,
                })}
              checked={checked}
              value={node.id}
              disabled={fixed}
              aria-label={nativeStructure ? undefined : node.label}
              aria-describedby={describedBy}
              onChange={() => change(entry)}
              nativeStructure={nativeStructure}
            />
            {node.icon &&
              (nativeStructure ? (
                <span className="account-perm-child-icon">
                  <Icon name={node.icon} size={14} />
                </span>
              ) : (
                <Icon name={node.icon} size={14} />
              ))}
            <span className={nativeStructure ? 'account-perm-child-name' : 'ds-permission-child-name'}>
              {node.label}
            </span>
            {nativeStructure && required && <span className="account-perm-required">{labels.required}</span>}
            {!nativeStructure && required && (
              <span id={`${id}-required`} className="ds-permission-status">
                {labels.required}
              </span>
            )}
            {!nativeStructure && inheritedValue && (
              <span id={`${id}-inherited`} className="ds-permission-status">
                {labels.inherited}
              </span>
            )}
            {node.description && (
              <>
                {/* 子项说明位于 <label> 内：用 hidden 只供 aria-describedby 引用，不并入复选框名称。 */}
                <span id={`${id}-description`} hidden>
                  {node.description}
                </span>
                {nativeStructure ? (
                  // 与原站 permission-tree.js 一致：原生 title 提示，不用浮层 Tooltip。它在 <label> 内，
                  // 不加 aria-label，以免混进复选框的可访问名称；说明已经由 aria-describedby 提供。
                  <span className="account-help-tip" tabIndex={0} title={node.description}>
                    <Icon name="help-circle" size={14} />
                  </span>
                ) : (
                  <HelpTip text={node.description} />
                )}
              </>
            )}
          </label>
        );
      }
      // 权限树按一级竖排、二级横向并排、三级竖排交替呈现；范围树保持原有 inlineLeaves 语义。
      const horizontalChildren =
        mode === 'permissions'
          ? hasChildren && depth % 2 === 0
          : Boolean(
              mode === 'leaves' &&
              inlineLeaves &&
              visibleChildEntries.length > 0 &&
              visibleChildEntries.every(({ child }) => !child.children),
            );
      const childCount = nativeStructure && groupSelection ? labels.count(count, childLeaves.length) : undefined;
      const groupDescendants =
        mode === 'permissions' && childActions && hasChildren
          ? descendants(entry).filter((item) => !item.node.groupOnly)
          : [];
      const editableGroupChildren = groupDescendants.filter(editable);
      const selectedEditableChildren = editableGroupChildren.filter((item) => effective.has(item.node.id)).length;
      const allGroupChildrenSelected =
        editableGroupChildren.length > 0 && selectedEditableChildren === editableGroupChildren.length;
      const allGroupWithSelfSelected =
        allGroupChildrenSelected && (Boolean(groupOnly) || !editable(entry) || effective.has(node.id));
      const hasChildTitleToggle =
        mode === 'permissions' && Boolean(childActions) && !readOnly && editableGroupChildren.length > 0;
      const hasGroupCheckbox = hasChildTitleToggle && Boolean(groupOnly);
      const RowLabel = groupOnly || hasChildTitleToggle ? 'div' : 'label';
      const titleActionText =
        hasChildTitleToggle && childActions
          ? allGroupWithSelfSelected
            ? childActions.clearChildren
            : childActions.selectChildren
          : '';
      const iconElement =
        node.icon &&
        (nativeStructure && !(mode === 'permissions' && groupOnly) ? (
          <span className={nestedGroup ? 'account-perm-child-icon' : 'account-perm-icon'}>
            <Icon name={node.icon} size={nestedGroup ? 14 : 16} />
          </span>
        ) : (
          <Icon name={node.icon} size={leaf || nestedGroup ? 14 : 16} />
        ));
      const labelTextElement =
        groupOnly && nativeStructure && mode === 'permissions' ? (
          <span className="account-perm-name">{node.label}</span>
        ) : (
          <span
            className={
              nativeStructure ? (nestedGroup ? 'account-perm-child-name' : 'account-perm-name') : 'ds-permission-name'
            }
          >
            {node.label}
          </span>
        );
      if (nativeStructure && groupSelection && !childLeaves.length) return null;
      const nativeToggleLabel = native.toggle(open.has(node.id), node.label);
      return (
        <div
          className={
            nativeStructure
              ? cx('account-perm-node', nestedGroup && 'account-perm-node--nested')
              : leaf
                ? 'ds-permission-leaf'
                : cx('ds-permission-node', nestedGroup && 'ds-permission-node--nested')
          }
          key={node.id}
          {...(nativeStructure && mode === 'permissions' && { 'data-perm-group': node.id })}
          {...(nativeStructure && groupSelection && { 'data-selection-group': node.id })}
        >
          <div className={nativeStructure ? 'account-perm-row' : 'ds-permission-row'}>
            {hasChildren ? (
              <button
                type="button"
                className={nativeStructure ? 'account-perm-toggle' : 'ds-permission-toggle'}
                {...(nativeStructure &&
                  mode === 'permissions' && {
                    'data-perm-toggle': node.id,
                    'data-perm-label': node.label,
                    title: nativeToggleLabel,
                  })}
                {...(nativeStructure && groupSelection && { 'data-selection-toggle': node.id })}
                aria-expanded={open.has(node.id)}
                aria-controls={nativeStructure ? undefined : `${id}-children`}
                aria-label={
                  nativeStructure && mode === 'permissions'
                    ? nativeToggleLabel
                    : open.has(node.id)
                      ? labels.collapse(node.label)
                      : labels.expand(node.label)
                }
                onClick={() =>
                  setOpenIds(open.has(node.id) ? openIds.filter((item) => item !== node.id) : [...openIds, node.id])
                }
              >
                <Icon name="chevron-right" />
              </button>
            ) : (
              (!leaf || hasGroupSiblings) && (
                <span className={nativeStructure ? 'account-perm-spacer' : 'ds-permission-spacer'} aria-hidden="true" />
              )
            )}
            <RowLabel
              data-required={nativeStructure ? undefined : required || undefined}
              data-disabled={!groupOnly && fixed ? '' : undefined}
              className={
                nativeStructure
                  ? mode === 'permissions' && groupOnly
                    ? cx('account-perm-group-header', hasChildTitleToggle && 'is-split')
                    : nestedGroup
                      ? cx(
                          'account-perm-child',
                          'account-perm-child--group',
                          hasChildTitleToggle && 'is-split',
                          node.description && 'account-perm-child--with-help',
                        )
                      : cx(`account-perm-parent${required ? ' is-required' : ''}`, hasChildTitleToggle && 'is-split')
                  : cx(
                      'ds-permission-label',
                      (leaf || nestedGroup) && 'ds-permission-label--leaf',
                      groupOnly && 'ds-permission-label--group',
                      hasChildTitleToggle && 'is-split',
                    )
              }
            >
              {hasGroupCheckbox ? (
                <TreeCheckbox
                  checked={allGroupChildrenSelected}
                  mixed={selectedEditableChildren > 0 && !allGroupChildrenSelected}
                  nativeStructure={nativeStructure}
                  aria-label={labels.selectAll(node.label)}
                  aria-describedby={describedBy}
                  onChange={() => toggleGroupChildren(entry, editableGroupChildren, !allGroupChildrenSelected)}
                />
              ) : (
                !groupOnly && (
                  <TreeCheckbox
                    {...(nativeStructure &&
                      mode === 'permissions' && {
                        name: 'apps',
                        value: node.id,
                        'data-perm-parent': node.id,
                      })}
                    checked={checked}
                    mixed={mixed}
                    disabled={fixed}
                    nativeStructure={nativeStructure}
                    data-selection-parent={nativeStructure && groupSelection ? node.id : undefined}
                    aria-label={groupSelection ? labels.selectAll(node.label) : node.label}
                    aria-describedby={describedBy}
                    onChange={() => change(entry)}
                  />
                )
              )}
              {hasChildTitleToggle ? (
                <button
                  type="button"
                  className={nativeStructure ? 'account-perm-title-toggle' : 'ds-permission-title-toggle'}
                  title={`${titleActionText} ${node.label}`}
                  aria-label={`${titleActionText} ${node.label}`}
                  aria-pressed={allGroupWithSelfSelected}
                  onClick={() => toggleGroupChildren(entry, editableGroupChildren, !allGroupWithSelfSelected)}
                >
                  {iconElement}
                  {labelTextElement}
                </button>
              ) : (
                <>
                  {iconElement}
                  {labelTextElement}
                </>
              )}
              {nativeStructure && required && <span className="account-perm-required">{labels.required}</span>}
              {nativeStructure && groupSelection && (
                <span className="account-perm-required" data-selection-count>
                  {childCount}
                </span>
              )}
            </RowLabel>
            {!nativeStructure && required && (
              <span id={`${id}-required`} className="ds-permission-status">
                {labels.required}
              </span>
            )}
            {!nativeStructure && inheritedValue && (
              <span id={`${id}-inherited`} className="ds-permission-status">
                {labels.inherited}
              </span>
            )}
            {!nativeStructure && groupSelection && (
              <span className="ds-permission-status">{labels.count(count, childLeaves.length)}</span>
            )}
            {node.description && (
              <>
                <span id={`${id}-description`} className="ds-visually-hidden">
                  {node.description}
                </span>
                {nativeStructure ? (
                  <span
                    className="account-help-tip"
                    tabIndex={0}
                    title={node.description}
                    aria-label={node.description}
                  >
                    <Icon name="help-circle" size={14} />
                  </span>
                ) : (
                  <HelpTip text={node.description} />
                )}
              </>
            )}
          </div>
          {hasChildren && (
            <div
              className={cx(
                nativeStructure ? 'account-perm-children' : 'ds-permission-children',
                mode === 'leaves' && horizontalChildren && 'is-inline',
                mode === 'permissions' && horizontalChildren && 'is-horizontal',
              )}
              role="group"
              id={`${id}-children`}
              aria-label={
                nativeStructure && mode === 'permissions'
                  ? native.children(node.label)
                  : nativeStructure
                    ? native.apiChildren(node.label)
                    : labels.children(node.label)
              }
              {...(nativeStructure && mode === 'permissions' && { 'data-perm-children': '' })}
              {...(nativeStructure && groupSelection && { 'data-selection-children': '' })}
              hidden={!open.has(node.id)}
            >
              {render(node.children ?? [], `${path}.`, depth + 1, horizontalChildren)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div
      className={cx(nativeStructure ? 'account-perm-tree' : 'ds-permission-tree', className)}
      {...(!nativeStructure && { role: 'group' })}
      {...rest}
    >
      {render(nodes)}
    </div>
  );
}

/** 应用授权树：父项与子项分别授权，角色继承只读且不写回直接授权。 */
export function PermissionTree(props: PermissionTreeProps) {
  return <TreeView {...props} mode="permissions" />;
}

/** API 范围树：分组只批量选择可编辑叶子，回调中不包含分组标识。 */
export function SelectionTree(props: SelectionTreeProps) {
  return <TreeView {...props} mode="leaves" />;
}
