export interface FormatBytesOptions {
  base?: 1000 | 1024;
  units?: readonly string[];
  precision?: number;
  locale?: Intl.LocalesArgument;
  empty?: string;
}
const defaultUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

/** 对齐原系统的 1024 基数及单位，语言和单位可显式覆盖；不把无效大小当成零。 */
export function formatBytes(bytes: number | null | undefined, options: FormatBytesOptions = {}) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return options.empty ?? '—';
  const base = options.base === 1000 ? 1000 : 1024;
  const units = options.units?.length ? options.units : defaultUnits;
  const precision = Number.isFinite(options.precision) ? Math.max(0, Math.min(6, Math.floor(options.precision!))) : 1;
  let index = bytes > 0 ? Math.min(units.length - 1, Math.max(0, Math.floor(Math.log(bytes) / Math.log(base)))) : 0;
  let value = bytes / base ** index;
  if (Number(value.toFixed(index === 0 ? 0 : precision)) >= base && index < units.length - 1) {
    index++; value = bytes / base ** index;
  }
  return `${new Intl.NumberFormat(options.locale, { maximumFractionDigits: index === 0 ? 0 : precision }).format(value)} ${units[index]}`;
}
