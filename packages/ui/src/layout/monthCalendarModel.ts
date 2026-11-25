import { civilDate, civilDateText, parseCivilDate } from '../foundation/civilDate';

export const parseMonth = (value: string) => /^\d{4}-\d{2}$/.test(value) ? parseCivilDate(`${value}-01`) : undefined;

export function shiftMonth(month: string, amount: number) {
  const parsed = parseMonth(month);
  if (!parsed) return undefined;
  const next = civilDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + amount, 1);
  return next.getUTCFullYear() >= 1 && next.getUTCFullYear() <= 9999 ? civilDateText(next).slice(0, 7) : undefined;
}
export function monthDays(month: string, weekStartsOn: 0 | 1) {
  const start = parseMonth(month)!;
  const offset = (start.getUTCDay() - weekStartsOn + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const day = civilDate(start.getUTCFullYear(), start.getUTCMonth(), index - offset + 1);
    return day.getUTCFullYear() >= 1 && day.getUTCFullYear() <= 9999 ? civilDateText(day) : '';
  });
}
export function calendarKeyDate(value: string, key: string, shift: boolean, weekStartsOn: 0 | 1) {
  const date = parseCivilDate(value);
  if (!date) return undefined;
  const year = date.getUTCFullYear(), month = date.getUTCMonth(), day = date.getUTCDate();
  let next: Date;
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[key];
  if (delta) next = civilDate(year, month, day + delta);
  else if (key === 'Home' || key === 'End') {
    const weekday = (date.getUTCDay() - weekStartsOn + 7) % 7;
    next = civilDate(year, month, day + (key === 'Home' ? -weekday : 6 - weekday));
  } else if (key === 'PageUp' || key === 'PageDown') {
    const amount = (key === 'PageUp' ? -1 : 1) * (shift ? 12 : 1);
    const last = civilDate(year, month + amount + 1, 0).getUTCDate();
    next = civilDate(year, month + amount, Math.min(day, last));
  } else return undefined;
  return next.getUTCFullYear() >= 1 && next.getUTCFullYear() <= 9999 ? civilDateText(next) : undefined;
}
