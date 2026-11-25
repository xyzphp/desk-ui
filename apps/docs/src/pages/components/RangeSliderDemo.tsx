import { useState } from 'react';
import { Button, FormActions, RangeSlider, Stack, Text, type RangeSliderValue } from '@desk/ui';

export function RangeSliderDemo() {
  const [result, setResult] = useState('尚未读取');
  const [decimal, setDecimal] = useState<RangeSliderValue>([0.2, 0.8]);
  return <Stack gap="xl">
    <form onSubmit={(event) => {
      event.preventDefault(); const data = new FormData(event.currentTarget); setResult(`${data.get('from')} ～ ${data.get('to')}`);
    }}>
      <Stack gap="lg">
        <RangeSlider label="时长范围（分钟）" name={['from', 'to']} defaultValue={[80, 280]} min={0} max={500} step={10} minGap={50}
          hint="双滑块可分别 Tab 聚焦，方向键按步长调整，始终保留至少 50 分钟间隔。" />
        <FormActions><Button type="reset">重置</Button><Button type="submit" variant="primary">读取范围</Button></FormActions>
        <Text role="status" tone="muted">表单范围：{result}</Text>
      </Stack>
    </form>
    <RangeSlider label="小数范围" value={decimal} onValueChange={setDecimal} min={0} max={1} step={0.1} minGap={0.2} />
    <RangeSlider label="禁用范围" defaultValue={[20, 60]} disabled />
  </Stack>;
}
