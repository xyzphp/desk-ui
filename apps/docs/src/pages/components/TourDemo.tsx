import { useRef, useState } from 'react';
import { Button, Inline, Stack, Text, Tour, type TourStep } from '@xyzos/desk-ui';

export function TourDemo() {
  const search = useRef<HTMLButtonElement>(null);
  const create = useRef<HTMLButtonElement>(null);
  const settings = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState('尚未开始');
  const steps: TourStep[] = [
    { id: 'welcome', title: '欢迎使用', description: '花一分钟认识几个常用入口，随时可以跳过。' },
    { id: 'search', target: () => search.current, title: '搜索', description: '按名称查找条目。' },
    { id: 'create', target: () => create.current, title: '新建', description: '创建一条新的示例记录。' },
    {
      id: 'settings',
      target: () => settings.current,
      title: '设置',
      description: '调整显示方式；引导可以在这里重新开始。',
      placement: 'top',
    },
  ];
  return (
    <Stack gap="lg" align="start">
      <Inline gap="sm">
        <Button ref={search} icon="search">
          搜索
        </Button>
        <Button ref={create} icon="plus" variant="primary">
          新建
        </Button>
        <Button ref={settings} icon="settings">
          设置
        </Button>
      </Inline>
      <Button
        onClick={() => {
          setCurrent(0);
          setOpen(true);
        }}
      >
        开始引导
      </Button>
      <Tour
        open={open}
        steps={steps}
        current={current}
        onCurrentChange={setCurrent}
        onClose={(reason, index) => {
          setOpen(false);
          setResult(`结束于第 ${index + 1} 步：${reason}`);
        }}
      />
      <Text tone="muted" role="status">
        {result}
      </Text>
    </Stack>
  );
}
