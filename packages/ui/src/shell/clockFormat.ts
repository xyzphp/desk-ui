import { formatCivilDate, type DateDisplayFormat } from '../foundation/dateFormat';

export interface MenuClockSettings {
  zone: string;
  hourFormat: '12h' | '24h';
  dateFormat: DateDisplayFormat;
  showYear: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showWeekday: boolean;
}

export const defaultMenuClock: MenuClockSettings = {
  zone: 'local',
  hourFormat: '24h',
  dateFormat: 'ymd',
  showYear: true,
  showSeconds: false,
  showDate: true,
  showWeekday: true,
};

const FALLBACK_LOCALE = 'zh-CN';

function part(format: Intl.DateTimeFormat, date: Date, type: Intl.DateTimeFormatPartTypes) {
  return format.formatToParts(date).find((item) => item.type === type)?.value;
}

/** 时区名称按界面语言生成；偏移与语言无关。 */
export function clockZoneInfo(zone: string, now = new Date(), locale: string = FALLBACK_LOCALE) {
  const name = part(
    new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'longGeneric' }),
    now,
    'timeZoneName',
  );
  const raw =
    part(new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'shortOffset' }), now, 'timeZoneName') ?? 'GMT';
  const offset = /^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?$/.exec(raw);
  return {
    label: name ?? zone,
    offset: offset ? `UTC${offset[1]}${Number(offset[2])}${offset[3] ? `:${offset[3]}` : ''}` : 'UTC+0',
  };
}

/** 月日、星期与上午 / 下午按界面语言生成，其余数字部分与语言无关。 */
function formatDatePart(settings: MenuClockSettings, parts: Record<string, string>, locale: string) {
  return formatCivilDate(`${parts.year}-${parts.month}-${parts.day}`, settings.dateFormat, locale, settings.showYear);
}

export function formatMenuClock(settings: MenuClockSettings, now = new Date(), locale: string = FALLBACK_LOCALE) {
  const timeZone = settings.zone === 'local' ? undefined : settings.zone;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((item) => [item.type, item.value]),
  );
  const pad = (value: number | string) => String(value).padStart(2, '0');
  const hour = Number(parts.hour);
  // 用 UTC 正午承载已换算好的年月日，避免再次受时区影响。
  const day = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 12));
  const dateParts: string[] = [];
  if (settings.showDate) dateParts.push(formatDatePart(settings, parts, locale));
  if (settings.showWeekday)
    dateParts.push(new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' }).format(day));
  const displayedHour = pad(settings.hourFormat === '12h' ? hour % 12 || 12 : hour);
  const seconds = settings.showSeconds ? `:${parts.second}` : '';
  let time = `${displayedHour}:${parts.minute}${seconds}`;
  if (settings.hourFormat === '12h') {
    const periodParts = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      hour: 'numeric',
      hour12: true,
    }).formatToParts(new Date(Date.UTC(2000, 0, 1, hour)));
    const index = periodParts.findIndex((item) => item.type === 'dayPeriod');
    const period = periodParts[index]?.value ?? '';
    const before = index >= 0 && index < periodParts.findIndex((item) => item.type === 'hour');
    time = period ? (before ? `${period} ${time}` : `${time} ${period}`) : time;
  }
  return {
    date: dateParts.join(' '),
    time,
    calendarDate: new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
  };
}
