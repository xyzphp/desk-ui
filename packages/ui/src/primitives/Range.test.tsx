import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field, Range } from './Field';

describe('Range', () => {
  it('关联字段标签与说明，回调原生数值并保留 ref 和输入约束', () => {
    const onValueChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    render(<Field label="画质" hint="调整生成画质"><Range ref={ref} min={10} max={90} step={5} defaultValue={50} onValueChange={onValueChange} /></Field>);
    const slider = screen.getByRole('slider', { name: '画质' });
    expect(slider).toHaveAccessibleDescription('调整生成画质');
    expect(ref.current).toBe(slider);
    expect(ref.current?.min).toBe('10');
    expect(ref.current?.max).toBe('90');
    expect(ref.current?.step).toBe('5');
    fireEvent.change(slider, { target: { value: '65' } });
    expect(onValueChange).toHaveBeenCalledWith(65);
    expect(ref.current?.valueAsNumber).toBe(65);
  });

  it('受控数值等待调用方更新', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Range aria-label="缩放" value={40} onValueChange={onValueChange} />);
    const slider = screen.getByRole('slider', { name: '缩放' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '60' } });
    expect(onValueChange).toHaveBeenCalledWith(60);
    expect(slider.valueAsNumber).toBe(40);
    rerender(<Range aria-label="缩放" value={60} onValueChange={onValueChange} />);
    expect(slider.valueAsNumber).toBe(60);
  });

  it('非受控表单重置恢复初始值，不触发额外修改回调', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<form><Range aria-label="画质" defaultValue={25} onValueChange={onValueChange} /><button type="reset">重置</button></form>);
    const slider = screen.getByRole('slider', { name: '画质' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '75' } });
    await user.click(screen.getByRole('button', { name: '重置' }));
    await waitFor(() => expect(slider.valueAsNumber).toBe(25));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('取消表单重置时保留当前值，禁用滑条退出键盘顺序', async () => {
    const user = userEvent.setup();
    render(<form onReset={(event) => event.preventDefault()}>
      <Range aria-label="画质" defaultValue={25} /><Range aria-label="不可调整" disabled />
      <button type="reset">重置</button>
    </form>);
    const slider = screen.getByRole('slider', { name: '画质' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '75' } });
    await user.tab();
    expect(slider).toHaveFocus();
    await user.tab();
    const reset = screen.getByRole('button', { name: '重置' });
    expect(reset).toHaveFocus();
    await user.click(reset);
    expect(slider.valueAsNumber).toBe(75);
    expect(screen.getByRole('slider', { name: '不可调整' })).toBeDisabled();
  });
});
