import { useState } from 'react';
import { appGradients, DockWorkspace, Panel, Text, type DockWorkspaceItem } from '@desk/ui';

const items: DockWorkspaceItem[] = [
  {
    id: 'notes',
    label: '备忘录',
    app: { icon: 'sticky-note', color: appGradients.orange },
    windows: [
      {
        id: 'draft',
        title: '设计草稿',
        preview: (
          <Panel>
            <Text>示例草稿预览</Text>
          </Panel>
        ),
      },
      { id: 'archive', title: '归档笔记', minimized: true },
    ],
  },
  {
    id: 'files',
    label: '文件',
    app: { icon: 'folder', color: appGradients.blue },
    windows: [{ id: 'directory', title: '素材目录' }],
  },
  { id: 'settings', label: '设置', app: { icon: 'settings', color: appGradients.slate } },
];
export function DockWorkspaceDemo() {
  const [order, setOrder] = useState(['notes', 'files', 'settings']);
  const [current, setCurrent] = useState('draft');
  const [status, setStatus] = useState('点击应用查看窗口，点击右侧手柄调整应用顺序。');
  return (
    <>
      <div style={{ padding: 24 }}>
        <Panel>
          <Text role="status">{status}</Text>
        </Panel>
      </div>
      <DockWorkspace
        label="示例应用栏"
        items={items}
        order={order}
        onOrderChange={setOrder}
        currentWindowId={current}
        onLaunch={(item) => setStatus(`已请求启动：${item.label}`)}
        onActivateWindow={(window) => {
          setCurrent(window.id);
          setStatus(`已请求激活：${window.title}`);
        }}
      />
    </>
  );
}
