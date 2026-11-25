import { useEffect, useRef, useState } from 'react';
import { Button, Field, Inline, Input, Kbd, LoadingOverlay, Panel, Result, Select, Stack, Text, type ResultStatus } from '@xyzos/desk-ui';

export function KbdDemo() {
  return <Stack gap="md">
    <Inline><Text>保存</Text><Kbd>Ctrl</Kbd><Text>+</Text><Kbd>S</Kbd></Inline>
    <Inline><Text>撤销</Text><Kbd aria-label="Command">⌘</Kbd><Text>+</Text><Kbd>Z</Kbd></Inline>
    <Text tone="muted">键帽仅作展示；快捷键由应用按平台注册。</Text>
  </Stack>;
}
export function ResultDemo() {
  const [status, setStatus] = useState<ResultStatus>('error');
  return <Stack gap="lg">
    <Field label="结果状态"><Select value={status} onChange={(event) => setStatus(event.currentTarget.value as ResultStatus)}>
      <option value="success">成功</option><option value="error">失败</option><option value="warning">警告</option>
      <option value="info">提示</option><option value="not-found">页面不存在</option><option value="forbidden">无权限</option>
    </Select></Field>
    <Result status={status} description="正文与操作由宿主根据当前结果提供。"
      actions={<Button onClick={() => setStatus('success')}>演示重试成功</Button>} />
  </Stack>;
}
export function LoadingOverlayDemo() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <Stack gap="lg">
    <LoadingOverlay loading={loading} label="正在准备示例内容">
      <Panel><Stack gap="lg">
        <Field label="保留的草稿"><Input defaultValue="加载结束后仍保留这段内容" /></Field>
        <Button onClick={() => {
          setLoading(true); timer.current = setTimeout(() => setLoading(false), 1200);
        }}>开始模拟加载</Button>
      </Stack></Panel>
    </LoadingOverlay>
    <Button disabled={!loading} onClick={() => { clearTimeout(timer.current); setLoading(false); }}>结束加载</Button>
  </Stack>;
}
