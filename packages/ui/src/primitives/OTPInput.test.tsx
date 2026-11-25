import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OTPInput } from './OTPInput';
import { Field } from './Field';

const paste = (input: HTMLElement, value: string) => fireEvent.paste(input, { clipboardData: { getData: () => value } });
describe('OTPInput', () => {
  it('只有一个原生字段，整串粘贴、局部替换、退格与 reset 一致', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<form><Field label="验证码"><OTPInput name="code" ref={ref} required /></Field></form>);
    const input = screen.getByRole('textbox', { name: '验证码' });
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    await userEvent.click(input); paste(input, '１２３ ４５６');
    expect(input).toHaveValue('123456');
    ref.current!.setSelectionRange(1, 3); paste(input, '90');
    expect(input).toHaveValue('190456');
    await userEvent.keyboard('{Backspace}');
    expect(input).toHaveValue('19456');
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('code')).toBe('19456');
    act(() => { expect(form.checkValidity()).toBe(false); });
    expect(screen.getByRole('alert')).not.toBeEmptyDOMElement();
    await act(async () => form.reset());
    expect(input).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('组合输入结束后才确认数字，受控宿主连续拒绝粘贴时保持实际表单值', () => {
    const changed = vi.fn();
    const { rerender } = render(<OTPInput aria-label="code" onValueChange={changed} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '１２' } });
    expect(changed).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    expect(changed).toHaveBeenLastCalledWith('12');
    rerender(<form aria-label="表单"><OTPInput aria-label="code" name="code" value="123456" onValueChange={changed} /></form>);
    const controlled = screen.getByRole('textbox');
    paste(controlled, '654321'); paste(controlled, '456789');
    expect(controlled).toHaveValue('123456');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('code')).toBe('123456');
    rerender(<OTPInput aria-label="code" value="123456" readOnly onValueChange={changed} />);
    paste(screen.getByRole('textbox'), '654321');
    expect(screen.getByRole('textbox')).toHaveValue('123456');
  });
});
