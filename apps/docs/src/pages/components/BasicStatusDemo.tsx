import { useState } from 'react';
import { Avatar, Field, Input, Progress, Range, Skeleton, Switch, Text } from '@xyzos/desk-ui';

export function ProgressDemo() {
  const [value, setValue] = useState(36);
  return <div style={{ display: 'grid', gap: 16 }}>
    <Field label="任务完成度"><Range value={value} onValueChange={setValue} /></Field>
    <Progress label="任务完成进度" value={value} tone={value === 100 ? 'success' : 'accent'} />
    <Progress label="个人文件用量" value={256} max={1024} size="sm" format={(current, max) => `${current} / ${max} MB`} />
    <Progress label="等待上传结果" />
  </div>;
}

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('保留的草稿');
  return <div style={{ display: 'grid', gap: 16 }}>
    <Switch checked={loading} onCheckedChange={setLoading}>显示加载占位</Switch>
    <Skeleton loading={loading} avatar label="正在加载账号信息">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name="林青" size={40} /><Text strong>林青</Text>
      </div>
      <Field label="草稿"><Input value={draft} disabled={loading} onChange={(event) => setDraft(event.currentTarget.value)} /></Field>
    </Skeleton>
  </div>;
}
