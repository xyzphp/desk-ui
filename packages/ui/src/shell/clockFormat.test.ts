import { describe, expect, it } from 'vitest';
import { clockZoneInfo, defaultMenuClock, formatMenuClock } from './clockFormat';

describe('时钟格式', () => {
  it('按配置的时区计算日期、星期、12 小时制和秒数', () => {
    const result = formatMenuClock(
      { ...defaultMenuClock, zone: 'Asia/Tokyo', hourFormat: '12h', dateFormat: 'iso', showSeconds: true },
      new Date('2026-01-01T16:30:05Z'),
    );
    expect(result.date).toBe('2026-01-02 周五');
    expect(result.time).toBe('上午 01:30:05');
    expect(result.calendarDate.getDate()).toBe(2);
  });

  it('根据指定时刻计算夏令时偏移', () => {
    expect(clockZoneInfo('America/Los_Angeles', new Date('2026-01-01T00:00:00Z')).offset).toBe('UTC-8');
    expect(clockZoneInfo('America/Los_Angeles', new Date('2026-07-01T00:00:00Z')).offset).toBe('UTC-7');
  });

  it('ymd 日期格式按界面语言输出年份', () => {
    // 只核对日期段；星期默认开启（与原站一致），这里关掉以免混入。
    const result = formatMenuClock(
      { ...defaultMenuClock, zone: 'Asia/Shanghai', dateFormat: 'ymd', showWeekday: false },
      new Date('2026-10-13T04:30:00Z'),
    );
    expect(result.date).toBe('2026年10月13日');
    expect(result.time).toBe('12:30');
  });

  it('数字日期格式按分隔符输出带 / 不带年份的月日', () => {
    // 是否显示年份由 showYear 决定，dateFormat 只选分隔符风格。
    const base = { ...defaultMenuClock, zone: 'Asia/Shanghai', showWeekday: false };
    const at = new Date('2026-10-13T04:30:00Z');
    expect(formatMenuClock({ ...base, dateFormat: 'numeric-year' }, at).date).toBe('2026/10/13');
    expect(formatMenuClock({ ...base, dateFormat: 'numeric', showYear: false }, at).date).toBe('10/13');
    expect(formatMenuClock({ ...base, dateFormat: 'dash-month-day' }, at).date).toBe('2026-10-13');
    expect(formatMenuClock({ ...base, dateFormat: 'dash-month-day', showYear: false }, at).date).toBe('10-13');
  });
});
