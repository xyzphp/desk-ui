import { useState } from 'react';
import { Button, SortableList, Stack, Switch, Text, type SortableListItem } from '@desk/ui';

const initial: readonly SortableListItem[] = [
  { id: 'design', label: '设计资料', icon: 'palette', description: '拖动与键盘排序示例' },
  { id: 'components', label: '组件开发', icon: 'component' },
  { id: 'docs', label: '文档维护', icon: 'book-open' },
  { id: 'fixed', label: '固定分隔项', icon: 'shield-check', description: '不可移动，其他条目不能越过', disabled: true },
  { id: 'archive', label: '归档说明', icon: 'folder' },
];
export function SortableListDemo() {
  const [items, setItems] = useState(initial);
  const [readOnly, setReadOnly] = useState(false);
  const [dragByRow, setDragByRow] = useState(false);
  return (
    <Stack gap="lg">
      <Switch checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)}>
        只读状态
      </Switch>
      <Switch checked={dragByRow} onChange={(event) => setDragByRow(event.currentTarget.checked)}>
        整行长按拖动，不显示手柄和移动按钮
      </Switch>
      <SortableList
        label="资料排序"
        items={items}
        readOnly={readOnly}
        dragMode={dragByRow ? 'row' : 'handle'}
        showMoveButtons={!dragByRow}
        trailing={
          <Button
            icon="plus"
            disabled={readOnly}
            onClick={() =>
              setItems((current) => [
                ...current,
                {
                  id: `extra-${current.length}`,
                  label: `新增资料 ${current.length - initial.length + 1}`,
                  icon: 'file-text',
                },
              ])
            }
          >
            添加资料
          </Button>
        }
        onOrderChange={(ids) => {
          setItems(ids.map((id) => items.find((item) => item.id === id)!));
        }}
      />
      <Text tone="muted">顺序：{items.map((item) => item.label).join(' → ')}</Text>
      <Button onClick={() => setItems(initial)}>恢复顺序</Button>
    </Stack>
  );
}
