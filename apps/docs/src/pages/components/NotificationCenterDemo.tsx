import { useState } from 'react';
import { Button, NotificationCenter, Stack, Switch, Text, type NotificationCenterItem } from '@xyzos/desk-ui';

const initial: readonly NotificationCenterItem[] = [
  { id: 'saved', title: '草稿已保存', message: '最新修改已保存为示例草稿。', tone: 'success', unread: true, time: '15:40' },
  { id: 'review', title: '有一项待处理', message: '查看本次组件接口评审。', tone: 'info', unread: true, time: '15:30' },
  { id: 'failed', title: '示例操作失败', message: '可返回来源查看详情。', tone: 'error', unread: false, time: '14:20' },
];
export function NotificationCenterDemo() {
  const [items, setItems] = useState(initial), [busy, setBusy] = useState(false), [result, setResult] = useState('通知只保存在本示例内存');
  const markRead = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
  return <Stack gap="lg">
    <Switch checked={busy} onCheckedChange={setBusy}>冻结通知操作</Switch>
    <NotificationCenter label="示例通知中心" items={items} busy={busy}
      onActivate={(item) => { setResult(`已定位来源：${item.title}`); markRead(item.id); }} onMarkRead={markRead}
      onDismiss={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      onMarkAllRead={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))} onClear={() => setItems([])} />
    <Button onClick={() => setItems(initial)}>恢复示例通知</Button>
    <Text tone="muted" role="status">{result}</Text>
  </Stack>;
}
