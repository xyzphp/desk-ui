import { useState } from 'react';
import { Button, IconButton, WindowDialog } from '@xyzos/desk-ui';

export function WindowDialogDemo() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [message, setMessage] = useState('');
  const [geometry, setGeometry] = useState({ x: 120, y: 90, width: 620, height: 360 });
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开窗口式弹窗</Button>
      {message && <span role="status">{message}</span>}
      <WindowDialog
        open={open}
        title="隔离网页预览"
        geometry={geometry}
        onGeometryChange={setGeometry}
        maximized={maximized}
        onToggleMaximize={() => setMaximized((value) => !value)}
        titlebarControls={['close', 'maximize']}
        titlebarActions={
          <IconButton
            icon="external-link"
            label="示例新标签页操作"
            onClick={() => setMessage('已触发新标签页操作示例')}
          />
        }
        scrollable={false}
        onCancel={() => setOpen(false)}
      >
        <iframe
          title="本地隔离网页预览"
          sandbox=""
          referrerPolicy="no-referrer"
          srcDoc={
            '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><main style="font:16px sans-serif;padding:32px"><h1>本地隔离预览</h1><p>网页内容由宿主放入沙箱窗口。</p></main></html>'
          }
          style={{ flex: 1, width: '100%', minHeight: 0, border: 0 }}
        />
      </WindowDialog>
    </>
  );
}
