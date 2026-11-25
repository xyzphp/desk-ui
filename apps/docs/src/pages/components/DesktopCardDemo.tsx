import { useState } from 'react';
import { Checkbox, DesktopCard, Divider, Progress, Text } from '@xyzos/desk-ui';

export function DesktopCardDemo() {
  const [completed, setCompleted] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  return <div style={{ position: 'relative', zIndex: 1, padding: 20, width: 'min(100%, 360px)' }}>
    <DesktopCard title="我的待办" icon="check-square" meta="2 项" summary={completed ? '今日计划已完成' : '尚有一项待办'}
      actions={[{ id: 'refresh', label: '刷新待办', icon: 'rotate-ccw', onClick: () => setRefreshed(true) }]}
      footer={<Text size="sm" tone="muted">{refreshed ? '刚刚更新' : '最近更新 09:30'}</Text>}>
      <div style={{ display: 'grid', gap: 12 }}>
        <Checkbox checked readOnly>整理会议纪要</Checkbox>
        <Checkbox checked={completed} onChange={(event) => setCompleted(event.currentTarget.checked)}>确认下一步行动</Checkbox>
        <Divider spacing="sm" />
        <Progress label="今日任务完成度" value={completed ? 2 : 1} max={2} size="sm" />
      </div>
    </DesktopCard>
  </div>;
}
