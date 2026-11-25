import { Button, TimeRangePicker } from '@desk/ui';

export function TimeRangePickerDemo() {
  return <form style={{ display: 'grid', gap: 12 }} onSubmit={(event) => event.preventDefault()}>
    <TimeRangePicker label="当天工作时段" defaultValue={['09:00', '18:00']} min="08:00" max="22:00" step={900}
      startName="startTime" endName="endTime"
      labels={{ start: '开始时间', end: '结束时间', separator: '至', invalidOrder: '结束时间不能早于开始时间' }} />
    <Button type="reset">重置时段</Button>
  </form>;
}
