import { useState } from 'react';
import { Button, DateRangePicker, Icon, type DateTimeRangeValue } from '@xyzos/desk-ui';

export function DateRangePickerNativeDemo() {
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
      <DateRangePicker
        label="项目计划日期"
        value={value}
        onValueChange={setValue}
        startName="startAt"
        endName="dueAt"
        renderNative={({ groupProps, start, end }) => (
          <div {...groupProps} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '9px 18px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Icon name="calendar-days" aria-hidden="true" />
              <span>开始</span>
              {start}
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span>截止</span>
              {end}
            </label>
          </div>
        )}
        labels={{
          start: '计划开始日期',
          end: '计划结束日期',
          separator: '至',
          invalidOrder: '结束不能早于开始',
        }}
      />
      <Button type="submit" variant="primary">
        使用范围
      </Button>
      {submitted && <output>{submitted}</output>}
    </form>
  );
}
