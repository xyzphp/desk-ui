export const numberText = (value: number | null | undefined) => typeof value === 'number' && Number.isFinite(value)
  ? String(value) : '';

/** 空值与非有限输入都不映射成 0。原生 badInput 状态由控件单独保留。 */
export const numberValue = (value: string): number | null => value.trim() !== '' && Number.isFinite(Number(value))
  ? Number(value) : null;

export function numberPrecision(value: number, precision?: number) {
  if (precision === undefined || !Number.isFinite(precision)) return value;
  return Number(value.toFixed(Math.max(0, Math.min(12, Math.floor(precision)))));
}

export function nextNumber(input: HTMLInputElement, direction: 1 | -1, precision?: number) {
  const probe = input.cloneNode(false) as HTMLInputElement;
  probe.value = input.value;
  if (probe.step === 'any') probe.step = '1';
  try { probe.stepUp(direction); } catch { return input.value; }
  const value = numberValue(probe.value);
  if (value === null) return input.value;
  probe.value = numberText(numberPrecision(value, precision));
  return probe.validity.rangeUnderflow || probe.validity.rangeOverflow ? input.value : probe.value;
}
