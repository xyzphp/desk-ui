import { useState } from 'react';
import { Button, SystemDialog } from '@xyzos/desk-ui';

export function SystemDialogDemo() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return <>
    <Button onClick={() => setOpen(true)}>演示多项选择</Button>
    <SystemDialog open={open} title="尚未保存的修改" message="选择接下来要执行的操作。" initialFocus={0}
      onCancel={() => setOpen(false)} actions={[
        { label: '继续编辑', onClick: () => setOpen(false) },
        { label: '放弃修改', variant: 'danger', onClick: () => { setResult('已演示放弃修改'); setOpen(false); } },
        { label: '保存并继续', variant: 'primary', onClick: () => { setResult('已演示保存并继续'); setOpen(false); } },
      ]} />
    {result && <p role="status">{result}</p>}
  </>;
}
