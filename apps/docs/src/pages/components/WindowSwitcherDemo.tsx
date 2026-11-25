import { useState } from 'react';
import { appGradients, Panel, Stack, Text, WindowSwitcher, type WindowSwitcherItem } from '@xyzos/desk-ui';

const initial: readonly WindowSwitcherItem[] = [
  { id: 'notes', title: '备忘录 · 未命名草稿', app: { icon: 'sticky-note', color: appGradients.orange },
    preview: <Panel><Text>草稿预览</Text><Text tone="muted">示例内容由宿主提供</Text></Panel> },
  { id: 'files', title: '文件', minimized: true, app: { icon: 'folder', color: appGradients.blue } },
  { id: 'settings', title: '设置', app: { icon: 'settings', color: appGradients.slate } },
];
export function WindowSwitcherDemo() {
  const [items, setItems] = useState(initial), [current, setCurrent] = useState('notes'), [result, setResult] = useState('方向键定位，回车切换');
  return <Stack gap="lg">
    <WindowSwitcher label="示例窗口切换" items={items} currentId={current} onActivate={(item) => {
      setCurrent(item.id); setItems((previous) => previous.map((entry) => entry.id === item.id ? { ...entry, minimized: false } : entry));
      setResult(`已请求激活：${item.title}`);
    }} onCancel={() => setResult('已触发取消回调')} />
    <Text tone="muted" role="status">{result}</Text>
  </Stack>;
}
