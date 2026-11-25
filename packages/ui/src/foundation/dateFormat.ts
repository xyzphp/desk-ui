export type DateDisplayFormat = 'month-day' | 'ymd' | 'numeric' | 'numeric-year' | 'dash-month-day' | 'iso';

export function dateFormatForYear(format: DateDisplayFormat, showYear: boolean): DateDisplayFormat {
  if (format === 'month-day' || format === 'ymd') return showYear ? 'ymd' : 'month-day';
  if (format === 'numeric' || format === 'numeric-year') return showYear ? 'numeric-year' : 'numeric';
  return showYear ? 'iso' : 'dash-month-day';
}

/** Formats a civil ISO date without applying a timezone offset. */
export function formatCivilDate(
  value: string,
  format: DateDisplayFormat,
  locale: string = 'zh-CN',
  showYear?: boolean,
) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || Number(match[1]) < 1) return value;
  const [, year, month, day] = match;
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  date.setUTCHours(12, 0, 0, 0);
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return value;
  }
  switch (showYear === undefined ? format : dateFormatForYear(format, showYear)) {
    case 'iso':
      return `${year}-${month}-${day}`;
    case 'numeric-year':
      return `${year}/${month}/${day}`;
    case 'numeric':
      return `${month}/${day}`;
    case 'dash-month-day':
      return `${month}-${day}`;
    case 'ymd':
      return new Intl.DateTimeFormat(locale, {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    default:
      return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(date);
  }
}
