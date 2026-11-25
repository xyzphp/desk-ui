import { useEffect, useState } from 'react';
import { Button, ConfirmDialog } from '@xyzos/desk-ui';

export function ConfirmDialogDemo({ danger = false, simulateFailure = false }: { danger?: boolean; simulateFailure?: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => {
      setBusy(false);
      if (simulateFailure && attempt === 1) setError('示例请求失败，请重试。');
      else { setResult('已确认示例操作，未修改真实数据。'); setOpen(false); }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [busy, attempt, simulateFailure]);
  return <>
    <Button variant={danger ? 'danger' : 'default'} onClick={() => { setOpen(true); setAttempt(0); setError(''); setResult(''); }}>
      {danger ? '演示危险操作确认' : '演示普通确认'}
    </Button>
    <ConfirmDialog open={open} title={danger ? '删除示例项目？' : '重新读取示例内容？'}
      message={danger ? '项目内的记录也将移除，此操作无法撤销。' : '当前未保存的修改将被放弃。'}
      danger={danger} confirmLabel={danger ? '删除项目' : '重新读取'} cancelLabel="取消" busyLabel="正在处理…"
      busy={busy} error={error} status={busy ? '正在演示处理，请稍候。' : undefined}
      onCancel={() => setOpen(false)} onConfirm={() => { setError(''); setAttempt((value) => value + 1); setBusy(true); }} />
    {result && <p role="status">{result}</p>}
  </>;
}
