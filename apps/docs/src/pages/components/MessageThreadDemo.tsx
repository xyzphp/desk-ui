import { useState } from 'react';
import { Avatar, Button, MessageThread, SegmentedControl, Stack, Text, type MessageThreadItem } from '@xyzos/desk-ui';

export function MessageThreadDemo() {
  const [variant, setVariant] = useState<'bubble' | 'comment'>('bubble');
  const [opened, setOpened] = useState(false);
  const items: readonly MessageThreadItem[] = [
    {
      id: 'received',
      author: variant === 'comment' ? '设计同事' : undefined,
      avatar: <Avatar name="设计同事" size={variant === 'comment' ? 30 : 40} shape="rounded" decorative />,
      text: '这里是一条普通消息。\n正文保留换行，可以直接选中复制。',
      dateTime: '2026-11-06T02:30:00Z',
      time: '11 月 6 日 10:30',
    },
    {
      id: 'own',
      own: true,
      author: variant === 'comment' ? '我' : undefined,
      avatar: <Avatar name="我" size={variant === 'comment' ? 30 : 40} shape="rounded" decorative />,
      text: '已收到，附件作为独立内容放在正文下方。',
      dateTime: '2026-11-06T02:31:00Z',
      time: '11 月 6 日 10:31',
      attachments: (
        <Button icon="file-text" onClick={() => setOpened(true)}>
          设计说明.pdf · 128 KB
        </Button>
      ),
    },
  ];
  return (
    <Stack>
      <SegmentedControl
        aria-label="消息布局"
        value={variant}
        onChange={setVariant}
        options={[
          { value: 'bubble', label: '聊天气泡' },
          { value: 'comment', label: '评论线程' },
        ]}
      />
      <MessageThread label="示例消息" variant={variant} items={items} />
      {opened && (
        <Text role="status" tone="muted">
          已选择示例附件；此示例不会请求或下载文件。
        </Text>
      )}
    </Stack>
  );
}
