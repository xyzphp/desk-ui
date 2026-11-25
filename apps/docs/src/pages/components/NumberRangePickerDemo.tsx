import { useState } from 'react';
import { NumberRangePicker, Notice, type NumberRangeValue } from '@xyzos/desk-ui';

export function NumberRangePickerDemo() {
  const [value, setValue] = useState<NumberRangeValue>([0, 100]);
  return <div style={{ display: 'grid', gap: 12 }}>
    <NumberRangePicker label="数值范围" value={value} onValueChange={setValue} min={0} max={1000} step={0.5}
      labels={{ start: '最小值', end: '最大值', separator: '至', invalidOrder: '最大值不能小于最小值' }} />
    <Notice>下限：{value[0] ?? '不限'}；上限：{value[1] ?? '不限'}</Notice>
  </div>;
}
