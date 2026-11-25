import { useEffect, useState } from 'react';
import { Button, Drawer, Field, Input, Inline, Notice, Select, Stack, Switch, TagInput, Textarea } from '@xyzos/desk-ui';

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const [name, setName] = useState('组件文档');
  const [tags, setTags] = useState<readonly string[]>(['设计']);
  const [draftTag, setDraftTag] = useState('');
  const [description, setDescription] = useState('继续完善示例和说明。');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => {
      setBusy(false);
      if (fail) setError('保存失败，内容已保留，请重试。');
      else { setSaved(name); setOpen(false); }
    }, 700);
    return () => clearTimeout(timer);
  }, [busy, fail, name]);
  return <Stack>
    <Inline>
      <Select aria-label="抽屉位置" value={placement} onChange={(event) => setPlacement(event.currentTarget.value as typeof placement)}>
        <option value="right">右侧</option><option value="left">左侧</option><option value="top">顶部</option><option value="bottom">底部</option>
      </Select>
      <Button onClick={() => { setError(''); setOpen(true); }}>打开任务详情</Button>
      <Switch checked={fail} onCheckedChange={setFail}>模拟保存失败</Switch>
    </Inline>
    {saved && <Notice>已更新：{saved}</Notice>}
    <Drawer
      open={open} title="任务详情" description="编辑名称、标签和说明。" placement={placement} busy={busy}
      onCancel={() => setOpen(false)} footer={<>
        <Button onClick={() => setOpen(false)}>取消</Button>
        <Button variant="primary" onClick={() => {
          if (!name.trim()) { setError('请填写名称。'); return; }
          setError(''); setBusy(true);
        }}>{busy ? '保存中' : '保存'}</Button>
      </>}
    >
      <Stack>
        <Field label="名称"><Input value={name} onChange={(event) => setName(event.currentTarget.value)} /></Field>
        <Field label="标签"><TagInput value={tags} onValueChange={setTags} inputValue={draftTag} onInputValueChange={setDraftTag} /></Field>
        <Field label="说明"><Textarea value={description} onChange={(event) => setDescription(event.currentTarget.value)} /></Field>
        {error && <Notice tone="error">{error}</Notice>}
      </Stack>
    </Drawer>
  </Stack>;
}
