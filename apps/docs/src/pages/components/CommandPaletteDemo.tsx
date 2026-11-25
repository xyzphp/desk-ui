import { useState } from 'react';
import { CommandPalette, Stack, Switch, Text, type CommandItem } from '@xyzos/desk-ui';

const commands: readonly CommandItem[] = [
  { id: 'new-note', label: '新建便签', description: '创建一条空白草稿', icon: 'sticky-note', group: '内容', shortcut: 'Ctrl N', keywords: ['note'] },
  { id: 'search', label: '搜索内容', description: '打开当前应用的搜索入口', icon: 'search', group: '内容', keywords: ['find'] },
  { id: 'appearance', label: '外观设置', description: '查看主题与强调色', icon: 'palette', group: '设置', keywords: ['theme'] },
  { id: 'restricted', label: '暂不可用的操作', icon: 'key-round', disabled: true },
];
export function CommandPaletteDemo() {
  const [loading, setLoading] = useState(false), [result, setResult] = useState('方向键选择，回车执行');
  return <Stack gap="lg">
    <Switch checked={loading} onCheckedChange={setLoading}>演示加载状态</Switch>
    <CommandPalette label="示例命令" items={commands} loading={loading}
      onExecute={(item) => setResult(`已执行宿主回调：${item.label}`)} onCancel={() => setResult('已触发取消回调')} />
    <Text tone="muted" role="status">{result}</Text>
  </Stack>;
}
