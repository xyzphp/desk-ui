import { useState } from 'react';
import { Badge, Button, Coachmark, Stack, Text } from '@xyzos/desk-ui';

export function CoachmarkDemo() {
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [result, setResult] = useState('尚未查看');
  return (
    <Stack gap="lg" align="start">
      <Button onClick={() => setOpen(true)}>显示新功能提示</Button>
      <Badge dot visible={!seen} label="新功能">
        <Button ref={setTarget} icon="layout-grid">
          全部应用
        </Button>
      </Badge>
      <Coachmark
        open={open}
        target={target}
        title="全部应用移到了这里"
        onClose={(reason) => {
          setOpen(false);
          setSeen(true);
          setResult(`已关闭：${reason}`);
        }}
      >
        所有应用图标集中在这一栏，单击打开，右键可以固定到程序坞。
      </Coachmark>
      <Text tone="muted" role="status">
        {result}
      </Text>
    </Stack>
  );
}
