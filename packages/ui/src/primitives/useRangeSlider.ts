import { useRef } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { moveSlider, sliderBounds, sliderPair } from './rangeSliderModel';
import type { RangeSliderProps } from './RangeSlider';

export function useRangeSlider(props: RangeSliderProps) {
  const root = useRef<HTMLFieldSetElement>(null);
  const bounds = sliderBounds(props.min, props.max, props.step, props.minGap);
  const [raw, change] = useControllable(props.value, props.defaultValue ?? [bounds.min, bounds.max], props.onValueChange);
  const pair = sliderPair(raw, bounds);
  useFormReset(root, () => {
    const restored = sliderPair(props.value ?? props.defaultValue, bounds);
    if (props.value === undefined) change(restored);
    root.current?.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((input, index) => {
      input.value = String(restored[index]);
    });
  }, props.form);
  const update = (index: 0 | 1, input: HTMLInputElement) => {
    if (input.matches(':disabled')) return;
    const next = moveSlider(pair, index, input.valueAsNumber, bounds);
    input.value = String(next[index]);
    if (next[0] !== pair[0] || next[1] !== pair[1]) change(next);
    // 受控宿主拒绝时，React 会在原生 change 结束后恢复本次渲染值。
  };
  const span = bounds.max - bounds.min;
  const percent = (value: number) => span > 0 ? (value - bounds.min) / span * 100 : 0;
  return { root, bounds, pair, update, lower: percent(pair[0]), upper: percent(pair[1]) };
}
