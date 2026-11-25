import { useState } from 'react';
import { MonthCalendar, Stack, Text, type MonthCalendarEvent } from '@xyzos/desk-ui';

const events: readonly MonthCalendarEvent[] = [
  { id: 'design', date: '2026-11-05', title: '设计评审', tone: 'accent' },
  { id: 'review', date: '2026-11-05', title: '组件接口评审', tone: 'success' },
  { id: 'docs', date: '2026-11-05', title: '文档同步', tone: 'warning' },
  { id: 'release', date: '2026-11-12', title: '示例交付', tone: 'accent' },
  { id: 'follow', date: '2026-12-01', title: '后续计划', tone: 'muted' },
];
export function MonthCalendarDemo() {
  const [month, setMonth] = useState('2026-11'), [date, setDate] = useState('2026-11-05');
  const [result, setResult] = useState('点击事件查看宿主回调');
  return <Stack gap="lg">
    <MonthCalendar label="示例工作日历" month={month} onMonthChange={setMonth} value={date} onValueChange={setDate}
      today="2026-11-05" events={events} maxEvents={2} onEventClick={(event) => setResult(`已选择事件：${event.title}`)}
      isDateDisabled={(value) => new Date(`${value}T00:00:00Z`).getUTCDay() === 0} />
    <Text tone="muted" role="status">已选日期：{date}；{result}</Text>
  </Stack>;
}
