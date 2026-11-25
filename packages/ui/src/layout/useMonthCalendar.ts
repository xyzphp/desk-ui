import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useControllable } from '../foundation/useControllable';
import { civilDateText, localToday, parseCivilDate } from '../foundation/civilDate';
import { calendarKeyDate, monthDays, parseMonth, shiftMonth } from './monthCalendarModel';
import type { MonthCalendarEvent, MonthCalendarProps } from './MonthCalendar';

export function useMonthCalendar(props: MonthCalendarProps) {
  const root = useRef<HTMLElement>(null), pendingFocus = useRef(false);
  const [seed] = useState(() => localToday());
  const today = props.today && parseCivilDate(props.today) ? props.today : seed;
  const [rawMonth, changeMonth] = useControllable(props.month,
    parseMonth(props.defaultMonth ?? '') ? props.defaultMonth! : today.slice(0, 7), props.onMonthChange);
  const month = parseMonth(rawMonth) ? rawMonth : today.slice(0, 7);
  const [rawValue, changeValue] = useControllable(props.value, props.defaultValue ?? '', props.onValueChange);
  const value = parseCivilDate(rawValue) ? rawValue : '';
  const [focused, setFocused] = useState(value || today);
  const [focusRequest, requestFocus] = useState(0);
  const weekStartsOn = props.weekStartsOn === 0 ? 0 : 1;
  const isDisabled = (date: string) => !!props.disabled || !!props.isDateDisabled?.(date);
  const days = monthDays(month, weekStartsOn).map((date) => ({ date, disabled: !date || isDisabled(date) }));
  const tabDate = days.find((day) => day.date === focused && !day.disabled)?.date
    ?? days.find((day) => day.date === value && !day.disabled)?.date
    ?? days.find((day) => day.date === today && !day.disabled)?.date
    ?? days.find((day) => day.date.startsWith(month) && !day.disabled)?.date
    ?? days.find((day) => !day.disabled)?.date;
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, MonthCalendarEvent[]>();
    for (const event of props.events ?? []) {
      if (!parseCivilDate(event.date)) continue;
      const entries = grouped.get(event.date) ?? [];
      entries.push(event); grouped.set(event.date, entries);
    }
    return grouped;
  }, [props.events]);
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const target = root.current?.querySelector<HTMLButtonElement>(`[data-calendar-date="${focused}"]:not(:disabled)`);
    if (target) target.focus();
    else {
      const active = root.current?.ownerDocument.activeElement;
      if (active instanceof HTMLButtonElement && root.current?.contains(active) && active.dataset.calendarDate && !active.disabled) {
        setFocused(active.dataset.calendarDate);
      } else root.current?.querySelector<HTMLButtonElement>('[data-calendar-date][tabindex="0"]')?.focus();
    }
  }, [focused, month, focusRequest]);
  const move = (amount: number) => {
    const next = shiftMonth(month, amount);
    if (!props.disabled && next) changeMonth(next);
  };
  const select = (date: string) => {
    if (isDisabled(date)) return;
    changeValue(date); setFocused(date);
    if (!date.startsWith(month)) {
      pendingFocus.current = true; requestFocus((request) => request + 1); changeMonth(date.slice(0, 7));
    }
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    let next: string | undefined = calendarKeyDate(date, event.key, event.shiftKey, weekStartsOn);
    if (!next) return;
    event.preventDefault();
    const direction = ['ArrowLeft', 'ArrowUp', 'Home', 'PageUp'].includes(event.key) ? -1 : 1;
    for (let attempt = 0; attempt < 366 && next; attempt++) {
      if (!isDisabled(next)) {
        pendingFocus.current = true; requestFocus((request) => request + 1); setFocused(next);
        if (!next.startsWith(month)) changeMonth(next.slice(0, 7));
        return;
      }
      const probe: Date = parseCivilDate(next)!;
      probe.setUTCDate(probe.getUTCDate() + direction);
      next = probe.getUTCFullYear() >= 1 && probe.getUTCFullYear() <= 9999 ? civilDateText(probe) : undefined;
    }
  };
  return { root, month, today, value, days, tabDate, eventsByDate, weekStartsOn, setFocused, select, move, changeMonth, keyDown };
}
