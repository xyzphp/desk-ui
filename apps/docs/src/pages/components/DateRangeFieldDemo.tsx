import { useState } from 'react';
import { Button, DateRangeField, type DateTimeRangeValue } from '@xyzos/desk-ui';

export function DateRangeFieldDemo({ withTime = false }: { withTime?: boolean }) {
  const [value, setValue] = useState<DateTimeRangeValue>(['', '']);
  const [submitted, setSubmitted] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(value.join(' 至 '));
      }}
      style={{ display: 'grid', gap: 12 }}
    >
      <DateRangeField
        label={withTime ? '创建时间范围' : '项目计划日期'}
        type={withTime ? 'datetime-local' : 'date'}
        dateFormat="ymd"
        labelPlacement={withTime ? 'inside' : 'outside'}
        value={value}
        onValueChange={setValue}
        startName="startAt"
        endName="dueAt"
      />
      <Button type="submit" variant="primary">
        使用范围
      </Button>
      {submitted && <output>{submitted}</output>}
    </form>
  );
}
