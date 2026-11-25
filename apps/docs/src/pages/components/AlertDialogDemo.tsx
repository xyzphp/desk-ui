import { useState } from 'react';
import { AlertDialog, Button } from '@xyzos/desk-ui';

export function AlertDialogDemo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>演示提示弹窗</Button>
    <AlertDialog open={open} title="导入未完成" message="所选文件格式不支持，请使用标准 ZIP 文件。"
      confirmLabel="知道了" onConfirm={() => setOpen(false)} />
  </>;
}
