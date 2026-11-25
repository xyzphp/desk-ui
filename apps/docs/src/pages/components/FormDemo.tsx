import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Field, FormActions, FormSection, Input, Select, Stack } from '@xyzos/desk-ui';

export function FormDemo() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('尚未保存');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <form onSubmit={(event) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setStatus('正在模拟保存');
    timer.current = setTimeout(() => { setBusy(false); setStatus('示例已保存'); }, 700);
  }} onReset={() => setStatus('已恢复初始字段')}>
    <Stack gap="xl">
      <FormSection label="基本设置" description="分组使用原生 fieldset，字段布局复用公共栅格。" disabled={busy}>
        <Field label="显示名称" required><Input name="name" defaultValue="示例空间" required /></Field>
        <Field label="默认视图"><Select name="view" defaultValue="list">
          <option value="list">列表</option><option value="grid">网格</option>
        </Select></Field>
        <Checkbox name="enabled" defaultChecked>启用提醒</Checkbox>
      </FormSection>
      <FormActions busy={busy} status={status}>
        <Button type="reset">重置</Button><Button type="submit" variant="primary">保存设置</Button>
      </FormActions>
    </Stack>
  </form>;
}
