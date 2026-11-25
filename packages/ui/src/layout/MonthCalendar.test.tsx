import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MonthCalendar } from './MonthCalendar';
import { calendarKeyDate, monthDays, shiftMonth } from './monthCalendarModel';
import { parseCivilDate } from '../foundation/civilDate';

describe('MonthCalendar', () => {
  it('月份导航不改变日期，键盘跨月跳过禁用日后仍需确认选择', async () => {
    const changed = vi.fn();
    render(<MonthCalendar label="日历" today="2026-11-05" defaultMonth="2026-11" defaultValue="2026-11-30"
      onValueChange={changed} isDateDisabled={(date) => date === '2026-12-01'} />);
    const day = screen.getByRole('button', { name: '2026 年 11 月 30 日' });
    day.focus(); fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: '2026 年 12 月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 年 12 月 2 日' })).toHaveFocus();
    expect(changed).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(changed).toHaveBeenLastCalledWith('2026-12-02');
    changed.mockClear();
    await userEvent.click(screen.getByRole('button', { name: '上个月' }));
    expect(changed).not.toHaveBeenCalled();
  });
  it('溢出事件就地展开，静态与动作回调分开，受控月份拒绝不失去焦点', async () => {
    const eventClick = vi.fn(), month = vi.fn();
    const events = ['甲', '乙', '丙'].map((title) => ({ id: title, date: '2026-11-05', title }));
    render(<MonthCalendar label="日历" today="2026-11-05" month="2026-11" onMonthChange={month}
      events={events} onEventClick={eventClick} maxEvents={1} />);
    // jsdom 不会隐藏未展开 details 的内容，但 toBeVisible 按 details 规则判断。
    expect(screen.getByRole('button', { name: '乙' })).not.toBeVisible();
    await userEvent.click(screen.getByText('其余 2 项'));
    expect(screen.getByRole('button', { name: '乙' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '乙' }));
    expect(eventClick).toHaveBeenLastCalledWith(events[1]);
    const last = screen.getByRole('button', { name: '2026 年 11 月 30 日' });
    last.focus(); fireEvent.keyDown(last, { key: 'PageDown' });
    expect(month).toHaveBeenLastCalledWith('2026-12');
    expect(screen.getByRole('heading', { name: '2026 年 11 月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 年 11 月 30 日' })).toHaveFocus();
  });
});

describe('民用日历边界', () => {
  it('闰日、跨年、年界和每周起点不受时区或 Date 的 0～99 年偏移影响', () => {
    expect(parseCivilDate('2024-02-29')).toBeDefined();
    expect(parseCivilDate('2026-02-29')).toBeUndefined();
    expect(calendarKeyDate('2024-01-31', 'PageDown', false, 1)).toBe('2024-02-29');
    expect(calendarKeyDate('2026-11-05', 'Home', false, 1)).toBe('2026-11-02');
    expect(shiftMonth('0099-12', 1)).toBe('0100-01');
    expect(shiftMonth('0001-01', -1)).toBeUndefined();
    expect(shiftMonth('9999-12', 1)).toBeUndefined();
    expect(monthDays('0001-01', 0).filter(Boolean).every((date) => date >= '0001-01-01')).toBe(true);
  });
});
