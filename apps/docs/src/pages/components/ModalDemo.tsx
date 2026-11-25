import { useEffect, useRef, useState } from 'react';
import { Button, Field, Input, Modal, Notice } from '@xyzos/desk-ui';

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('周末计划');
  const [saved, setSaved] = useState('');
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setBusy(false), 2000);
    return () => clearTimeout(timer);
  }, [busy]);
  return <>
    <Button onClick={() => setOpen(true)}>编辑详细设置</Button>
    {saved && <Notice>已保存：{saved}</Notice>}
    <Modal
      open={open} title="详细设置" description="可组合任意表单、列表和底部操作。"
      initialFocus={field} onCancel={() => setOpen(false)} busy={busy}
      footer={<>
        <Button onClick={() => setOpen(false)}>取消</Button>
        <Button variant="primary" onClick={() => { setSaved(name); setOpen(false); }}>保存</Button>
      </>}
    >
      <Field label="名称"><Input ref={field} value={name} onChange={(event) => setName(event.currentTarget.value)} /></Field>
      <Notice tone="info">示例只更新本页状态，关闭后再次打开保留草稿。</Notice>
      <Button onClick={() => setBusy(true)}>演示忙碌状态（两秒）</Button>
    </Modal>
  </>;
}
