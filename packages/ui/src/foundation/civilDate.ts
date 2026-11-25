/** 民用日期按 UTC 计算日历格，不把日期字符串解释为用户时区的时间点。 */
export const padDatePart = (value: number) => String(value).padStart(2, '0');

export function civilDate(year: number, month: number, day: number) {
  const value = new Date(0);
  value.setUTCFullYear(year, month, day); value.setUTCHours(0, 0, 0, 0);
  return value;
}
export function civilDateText(value: Date) {
  return `${String(value.getUTCFullYear()).padStart(4, '0')}-${padDatePart(value.getUTCMonth() + 1)}-${padDatePart(value.getUTCDate())}`;
}
export function parseCivilDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01' || value > '9999-12-31') return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && civilDateText(parsed) === value ? parsed : undefined;
}
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
}
