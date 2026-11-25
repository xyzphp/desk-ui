import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RangeSlider } from './RangeSlider';
import { moveSlider, sliderBounds, sliderPair } from './rangeSliderModel';

describe('RangeSlider', () => {
  it('双值表单、最小间隔、可访问边界与 reset 一致', async () => {
    const changed = vi.fn(), ref = createRef<HTMLFieldSetElement>();
    const { container } = render(<form><RangeSlider ref={ref} label="范围" name={['from', 'to']} minGap={20}
      defaultValue={[10, 70]} onValueChange={changed} /></form>);
    const lower = screen.getByRole('slider', { name: '范围 起始值' });
    const upper = screen.getByRole('slider', { name: '范围 结束值' });
    expect(ref.current).toBe(screen.getByRole('group', { name: '范围' }));
    expect(lower).toHaveAttribute('aria-valuemax', '50');
    fireEvent.change(lower, { target: { value: '65' } });
    expect(changed).toHaveBeenLastCalledWith([50, 70]);
    expect(upper).toHaveAttribute('aria-valuemin', '70');
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('from')).toBe('50');
    expect(new FormData(form).get('to')).toBe('70');
    await act(async () => form.reset());
    expect(lower).toHaveValue('10');
    expect(upper).toHaveValue('70');
  });
  it('受控拒绝恢复实际输入，外部表单关联与禁用保留原生语义', () => {
    const changed = vi.fn();
    const { rerender } = render(<><form id="range-form" aria-label="外部表单" />
      <RangeSlider label="范围" name={['from', 'to']} form="range-form" value={[20, 80]} onValueChange={changed} /></>);
    const lower = screen.getByRole('slider', { name: '范围 起始值' });
    fireEvent.change(lower, { target: { value: '40' } });
    expect(changed).toHaveBeenLastCalledWith([40, 80]);
    expect(lower).toHaveValue('20');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('from')).toBe('20');
    rerender(<form aria-label="禁用表单"><RangeSlider label="范围" name={['from', 'to']} disabled /></form>);
    expect(screen.getAllByRole('slider').every((input) => (input as HTMLInputElement).matches(':disabled'))).toBe(true);
    expect(Array.from(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual([]);
  });
});

describe('双滑块数值规则', () => {
  it('小数、步长边界、反序值和不可达间隔保持有序且有限', () => {
    const bounds = sliderBounds(0, 1, 0.1, 0.2);
    expect(moveSlider([0.2, 0.8], 0, 0.75, bounds)).toEqual([0.6, 0.8]);
    expect(sliderPair([0.9, 0.1], bounds)).toEqual([0, 0.2]);
    expect(sliderBounds(0, 10, 3, 4)).toEqual({ min: 0, max: 9, step: 3, gap: 6 });
    expect(sliderPair(undefined, sliderBounds(10, 5, -1, Infinity))).toEqual([10, 10]);
  });
});
