import { useState } from 'react';
import { Button, RangeInput, Stack, Text } from '@desk/ui';

export function RangeInputDemo() {
  const [value, setValue] = useState(15);
  const [submitted, setSubmitted] = useState('尚未提交');

  return (
    <Stack gap="lg">
      <RangeInput label="轮播间隔" value={value} onValueChange={setValue} min={2} max={60} suffix="秒" />
      <Text>当前值：{value} 秒</Text>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('opacity')));
        }}
      >
        <Stack gap="md">
          <RangeInput label="遮罩强度" name="opacity" defaultValue={20} min={0} max={80} suffix="%" required />
          <div>
            <Button type="reset">重置</Button>{' '}
            <Button type="submit" variant="primary">
              读取表单值
            </Button>
          </div>
          <Text role="status">表单值：{submitted}</Text>
        </Stack>
      </form>
      <RangeInput label="禁用" value={40} min={0} max={100} disabled />
    </Stack>
  );
}
