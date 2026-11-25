import { useEffect, useRef, useState } from 'react';
import { Popconfirm, Stack, Switch, Text } from '@xyzos/desk-ui';

export function PopconfirmDemo() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('尚未执行');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const confirm = () => {
    if (busy) return;
    setBusy(true); setError('');
    timer.current = setTimeout(() => {
      setBusy(false);
      if (fail) setError('暂时无法完成，请重试。');
      else { setResult('已移除示例条目'); setOpen(false); }
    }, 700);
  };
  return <Stack gap="lg" align="start">
    <Switch checked={fail} onChange={(event) => setFail(event.currentTarget.checked)} disabled={busy}>模拟失败</Switch>
    <Popconfirm label="移除条目" title="移除这条记录？" description="只影响当前演示条目。"
      variant="danger" danger open={open} onOpenChange={(next) => { setOpen(next); if (next) setError(''); }}
      onConfirm={confirm} busy={busy} error={error} labels={{ confirm: '移除' }} />
    <Text tone="muted" role="status">{result}</Text>
  </Stack>;
}
