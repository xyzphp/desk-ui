import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputNumber } from './InputNumber';
import { Field } from './Field';

describe('InputNumber', () => {
  it('真实 number 输入、ref、字段关联与边界步进', async () => {
    const ref = createRef<HTMLInputElement>();
    const change = vi.fn();
    render(<Field label="数量" hint="最多两个"><InputNumber ref={ref} defaultValue={1} min={0} max={2} onValueChange={change} /></Field>);
    expect(ref.current?.type).toBe('number');
    expect(screen.getByRole('spinbutton')).toHaveAccessibleDescription('最多两个');
    await userEvent.click(screen.getByLabelText('增加数值'));
    expect(change).toHaveBeenLastCalledWith(2);
    expect(screen.getByLabelText('增加数值')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toHaveValue(2);
  });
  it('空值为 null，失焦按精度舍入，受控拒绝后保留宿主值', async () => {
    const change = vi.fn();
    const { rerender } = render(<InputNumber aria-label="数值" defaultValue={0.125} precision={2} step="any" onValueChange={change} />);
    fireEvent.blur(screen.getByRole('spinbutton'));
    expect(screen.getByRole('spinbutton')).toHaveValue(0.13);
    await userEvent.clear(screen.getByRole('spinbutton'));
    expect(change).toHaveBeenLastCalledWith(null);
    rerender(<InputNumber aria-label="数值" value={3} onValueChange={change} />);
    await userEvent.click(screen.getByLabelText('增加数值'));
    expect(change).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole('spinbutton')).toHaveValue(3);
  });
  it('保留原生 required / range 校验、reset 与只读禁止步进', async () => {
    const { container, rerender } = render(<form><InputNumber aria-label="端口" name="port" defaultValue={80} min={1} max={100} required /></form>);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '101' } });
    expect(input.validity.rangeOverflow).toBe(true);
    expect(new FormData(container.querySelector('form')!).get('port')).toBe('101');
    container.querySelector('form')!.reset();
    await Promise.resolve();
    expect(input).toHaveValue(80);
    rerender(<InputNumber aria-label="端口" value={5} readOnly />);
    expect(screen.getByLabelText('增加数值')).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    expect(screen.getByRole('spinbutton')).toHaveValue(5);
  });
});
