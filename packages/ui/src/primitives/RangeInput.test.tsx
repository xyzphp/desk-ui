import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RangeInput } from './RangeInput';

describe('RangeInput', () => {
  it('keeps the slider and number on one value and submits only one named field', () => {
    const changed = vi.fn();
    const ref = createRef<HTMLFieldSetElement>();
    const { container } = render(
      <form>
        <RangeInput
          ref={ref}
          label="间隔"
          name="interval"
          min={0}
          max={50}
          defaultValue={15}
          suffix="秒"
          onValueChange={changed}
        />
      </form>,
    );
    const slider = screen.getByRole('slider', { name: '间隔 滑块' });
    const number = screen.getByRole('spinbutton', { name: '间隔 数值' });

    expect(ref.current).toBe(screen.getByRole('group', { name: '间隔' }));
    expect(number).toHaveValue(15);
    fireEvent.change(slider, { target: { value: '22' } });
    expect(number).toHaveValue(22);
    expect(changed).toHaveBeenLastCalledWith(22);
    expect(Array.from(new FormData(container.querySelector('form')!))).toEqual([['interval', '22']]);
  });

  it('normalizes numeric edits to the slider bounds and step, then restores the default on reset', async () => {
    const changed = vi.fn();
    const { container } = render(
      <form>
        <RangeInput label="数量" name="count" min={0} max={100} step={10} defaultValue={20} onValueChange={changed} />
      </form>,
    );
    const slider = screen.getByRole('slider', { name: '数量 滑块' });
    const number = screen.getByRole('spinbutton', { name: '数量 数值' });

    fireEvent.change(number, { target: { value: '57' } });
    expect(number).toHaveValue(60);
    expect(slider).toHaveValue('60');
    expect(changed).toHaveBeenLastCalledWith(60);
    await act(async () => container.querySelector('form')!.reset());
    expect(number).toHaveValue(20);
    expect(slider).toHaveValue('20');
  });

  it('keeps controlled values authoritative and applies disabled, read-only and required semantics', () => {
    const changed = vi.fn();
    const { rerender } = render(
      <form>
        <RangeInput label="值" name="value" value={25} min={0} max={50} required onValueChange={changed} />
      </form>,
    );
    const slider = screen.getByRole('slider', { name: '值 滑块' });
    const number = screen.getByRole('spinbutton', { name: '值 数值' });

    fireEvent.change(number, { target: { value: '35' } });
    expect(changed).toHaveBeenLastCalledWith(35);
    expect(number).toHaveValue(25);
    expect(slider).toHaveValue('25');
    expect(number).toBeRequired();

    rerender(
      <form>
        <RangeInput label="值" name="value" value={25} min={0} max={50} readOnly />
      </form>,
    );
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toHaveAttribute('readonly');
    rerender(
      <form>
        <RangeInput label="值" name="value" value={25} min={0} max={50} disabled />
      </form>,
    );
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(Array.from(new FormData(number.closest('form')!))).toEqual([]);
  });
});
