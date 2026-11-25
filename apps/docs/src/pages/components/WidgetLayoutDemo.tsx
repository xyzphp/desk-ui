import { useState } from 'react';
import { Input, Stack, Text, WidgetLayout, type GridPlacement } from '@xyzos/desk-ui';

export function WidgetLayoutDemo() {
  const [layout, setLayout] = useState<GridPlacement[]>([
    { id: 'note', column: 0, row: 0, width: 2, height: 2 },
    { id: 'tasks', column: 2, row: 0, width: 2, height: 2 },
  ]);
  const [draft, setDraft] = useState('移动卡片后，这份草稿仍然保留');
  return (
    <div style={{ padding: 16 }}>
      <WidgetLayout
        label="桌面小组件布局示例"
        columns={4}
        rows={3}
        rowHeight={104}
        layout={layout}
        onLayoutChange={setLayout}
        items={[
          {
            id: 'note',
            title: '随手记',
            icon: 'sticky-note',
            content: (
              <Stack gap="md">
                <Text tone="muted">拖动标题里的手柄，或 Alt 加方向键移动。</Text>
                <Input aria-label="示例草稿" value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
              </Stack>
            ),
          },
          {
            id: 'tasks',
            title: '今日计划',
            icon: 'check-square',
            content: (
              <Stack gap="md">
                <Text>整理界面素材</Text>
                <Text>补充组件文档</Text>
                <Text tone="muted">允许重叠，通过右上角按钮移到最前。</Text>
              </Stack>
            ),
          },
        ]}
      />
    </div>
  );
}
