export type RangeSliderValue = readonly [number, number];
export interface SliderBounds { min: number; max: number; step: number; gap: number }
const round = (value: number) => Number(value.toFixed(10));

export function sliderBounds(min = 0, max = 100, step = 1, minGap = 0): SliderBounds {
  const start = Number.isFinite(min) ? Math.max(-1e12, Math.min(1e12, min)) : 0;
  const end = Number.isFinite(max) ? Math.max(start, Math.min(1e12, max)) : Math.max(start, 100);
  const interval = Number.isFinite(step) && step >= 1e-8 ? step : 1;
  const stop = round(start + Math.floor((end - start) / interval + 1e-9) * interval);
  const requested = Number.isFinite(minGap) ? Math.max(0, minGap) : 0;
  const gap = Math.min(stop - start, round(Math.ceil(requested / interval - 1e-9) * interval));
  return { min: start, max: stop, step: interval, gap: Math.max(0, gap) };
}
export function sliderNumber(value: number, bounds: SliderBounds) {
  const finite = Number.isFinite(value) ? value : bounds.min;
  return round(Math.max(bounds.min, Math.min(bounds.max, bounds.min + Math.round((finite - bounds.min) / bounds.step) * bounds.step)));
}
export function sliderPair(value: RangeSliderValue | undefined, bounds: SliderBounds): RangeSliderValue {
  const upper = Math.max(bounds.min + bounds.gap, sliderNumber(value?.[1] ?? bounds.max, bounds));
  const lower = Math.min(upper - bounds.gap, sliderNumber(value?.[0] ?? bounds.min, bounds));
  return [round(lower), round(upper)];
}
export function moveSlider(pair: RangeSliderValue, index: 0 | 1, value: number, bounds: SliderBounds): RangeSliderValue {
  const next = sliderNumber(value, bounds);
  return index === 0 ? [round(Math.min(pair[1] - bounds.gap, next)), pair[1]]
    : [pair[0], round(Math.max(pair[0] + bounds.gap, next))];
}
