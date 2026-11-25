import type { IconName } from '../foundation/Icon';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  selectable?: boolean;
  children?: readonly TreeNode[];
}
export interface TreeEntry {
  node: TreeNode; parent?: string; level: number; position: number; size: number; disabled: boolean;
}

/** 同时生成索引与可见顺序；父节点禁用会覆盖整个子树。 */
export function treeModel(nodes: readonly TreeNode[], expanded: readonly string[], disabled = false) {
  const index = new Map<string, TreeEntry>();
  const visible: TreeEntry[] = [];
  const opened = new Set(expanded);
  const walk = (items: readonly TreeNode[], parent: string | undefined, level: number, blocked: boolean, shown: boolean) => {
    items.forEach((node, position) => {
      const entry = { node, parent, level, position: position + 1, size: items.length, disabled: blocked || !!node.disabled };
      index.set(node.id, entry);
      if (shown) visible.push(entry);
      if (node.children?.length) walk(node.children, node.id, level + 1, entry.disabled, shown && opened.has(node.id));
    });
  };
  walk(nodes, undefined, 1, disabled, true);
  return { index, visible, enabled: visible.filter((item) => !item.disabled), opened };
}
