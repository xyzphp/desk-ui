export type ClassValue = string | false | null | undefined;

/** 拼接类名，忽略空值。 */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
