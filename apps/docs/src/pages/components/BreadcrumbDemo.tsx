import { useState } from 'react';
import { Breadcrumb, Button, Stack } from '@xyzos/desk-ui';

const path = ['首页', '文件', '项目资料', '界面', '组件库', '文档'].map((label, index) => ({ id: String(index), label }));
export function BreadcrumbDemo() {
  const [items, setItems] = useState(path);
  return <Stack>
    <Breadcrumb items={items} maxItems={4} onSelect={(item) => setItems(items.slice(0, items.findIndex((entry) => entry.id === item.id) + 1))} />
    <Button onClick={() => setItems(path)}>恢复完整路径</Button>
    <Breadcrumb aria-label="文档位置" items={[
      { id: 'overview', label: '概览', href: '#/overview' },
      { id: 'private', label: '受限目录', disabled: true },
      { id: 'current', label: '当前位置' },
    ]} />
  </Stack>;
}
