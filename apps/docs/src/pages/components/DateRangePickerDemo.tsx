import { useState } from 'react';
import { Button, DateRangePicker, Notice, type DateTimeRangeValue } from '@xyzos/desk-ui';

export function DateRangePickerDemo({ withTime = false }: { withTime?: boolean }) {
  const [value, setValue] = useState<DateTimeRangeValue>(['', '']);
  const [submitted, setSubmitted] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); setSubmitted(value.join(' 至 ')); }} style={{ display: 'grid', gap: 12 }}>
    <DateRangePicker label={withTime ? '日志时间范围' : '计划日期范围'} type={withTime ? 'datetime-local' : 'date'}
      value={value} onValueChange={setValue} required startName="from" endName="to"
      labels={{ start: '开始', end: '结束', separator: '至', invalidOrder: '结束不能早于开始' }} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button type="submit" variant="primary">使用范围</Button>
      <Button onClick={() => { setValue(['', '']); setSubmitted(''); }}>清空</Button>
    </div>
    {submitted && <Notice>{submitted}</Notice>}
  </form>;
}
