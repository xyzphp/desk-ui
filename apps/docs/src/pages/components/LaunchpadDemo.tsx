import { useState } from 'react';
import { appGradients, Launchpad, Stack, Text, type LaunchpadItem } from '@xyzos/desk-ui';

const applications: readonly LaunchpadItem[] = [
  { id: 'notes', name: '备忘录', description: '管理草稿与文档', keywords: ['memo', 'note'], app: { icon: 'sticky-note', color: appGradients.orange } },
  { id: 'files', name: '文件', description: '查看已授权文件', keywords: ['file'], app: { icon: 'folder', color: appGradients.blue } },
  { id: 'settings', name: '设置', keywords: ['setting'], app: { icon: 'settings', color: appGradients.slate } },
  { id: 'calendar', name: '日历', app: { icon: 'calendar-days', color: appGradients.green } },
  { id: 'preview', name: '暂不可用', disabled: true, app: { icon: 'app-window', color: appGradients.purple } },
];
export function LaunchpadDemo() {
  const [result, setResult] = useState('选择应用查看启动回调');
  return <Stack gap="lg">
    <Launchpad label="示例应用启动器" items={applications} onLaunch={(item) => setResult(`已请求打开：${item.name}`)} />
    <Text tone="muted" role="status">{result}</Text>
  </Stack>;
}
