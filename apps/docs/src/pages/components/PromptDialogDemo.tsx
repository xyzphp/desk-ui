import { useState } from 'react';
import { Button, PromptDialog } from '@desk/ui';

export function PromptDialogDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('示例文件夹');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  return <>
    <Button onClick={() => { setOpen(true); setName('示例文件夹'); setError(''); }}>演示输入确认</Button>
    <PromptDialog open={open} title="重命名" message="输入新的文件夹名称。" inputLabel="文件夹名称"
      required maxLength={40} value={name} onValueChange={(value) => { setName(value); setError(''); }}
      confirmLabel="保存名称" cancelLabel="取消" error={error} onCancel={() => setOpen(false)}
      onConfirm={(value) => {
        if (value.trim().length < 2) { setError('名称至少需要两个字符。'); return; }
        setResult('已确认名称：' + value); setOpen(false);
      }} />
    {result && <p role="status">{result}</p>}
  </>;
}
