import { useState } from 'react';
import { Button, Stack, Text, Tree, type TreeNode } from '@desk/ui';

const nodes: readonly TreeNode[] = [
  { id: 'workspace', label: '工作目录', icon: 'folder', selectable: false, children: [
    { id: 'design', label: '设计资料', icon: 'palette', children: [
      { id: 'tokens', label: '设计令牌', icon: 'file-text' }, { id: 'icons', label: '图标规范', icon: 'file-text' },
    ] },
    { id: 'docs', label: '组件文档', icon: 'book-open' },
    { id: 'archived', label: '已归档', icon: 'folder', disabled: true, children: [
      { id: 'old', label: '旧版说明', icon: 'file-text' },
    ] },
  ] },
  { id: 'shared', label: '共享资料', icon: 'folder' },
];

export function TreeDemo() {
  const [value, setValue] = useState<string | null>('docs');
  const [expanded, setExpanded] = useState<readonly string[]>(['workspace', 'design']);
  const [activated, setActivated] = useState('尚未打开');
  return <Stack gap="md">
    <Tree label="资料目录" nodes={nodes} value={value} onValueChange={setValue}
      expanded={expanded} onExpandedChange={setExpanded} onActivate={(node) => setActivated(node.label)} />
    <Text tone="muted" role="status">选中：{value ?? '无'}；打开：{activated}</Text>
    <Button onClick={() => { setValue('docs'); setExpanded(['workspace', 'design']); }}>恢复目录状态</Button>
    <Tree label="空目录" nodes={[]} />
  </Stack>;
}
