import { useState } from 'react';
import { Button, Stack, Text, Timeline } from '@desk/ui';

export function TimelineDemo() {
  const [opened, setOpened] = useState(false);
  return <Stack gap="lg">
    <Timeline label="处理记录" items={[
      { id: 'created', title: '创建记录', time: '11 月 5 日 09:00', dateTime: '2026-11-05T09:00:00+08:00',
        icon: 'file-text', content: '已建立草稿，等待后续处理。' },
      { id: 'review', title: '内容检查', time: '09:20', dateTime: '2026-11-05T09:20:00+08:00', tone: 'warning',
        content: <Button size="sm" onClick={() => setOpened(!opened)}>查看检查详情</Button> },
      { id: 'done', title: '处理完成', time: '09:40', dateTime: '2026-11-05T09:40:00+08:00',
        tone: 'success', icon: 'circle-check', content: '结果已准备就绪。' },
    ]} />
    {opened && <Text tone="muted">检查详情由宿主提供，此处仅演示内容插槽。</Text>}
    <Timeline label="空记录" items={[]} />
  </Stack>;
}
