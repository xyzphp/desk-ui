import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './PasswordInput';
import { Field } from './Field';

describe('PasswordInput', () => {
  it('显隐保留草稿、名称、表单值与原生 ref，切换不提交表单', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<form><Field label="授权码"><PasswordInput ref={ref} name="credential" defaultValue="example-value" /></Field></form>);
    expect(ref.current).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByLabelText('显示内容'));
    expect(ref.current).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('隐藏内容')).toHaveAttribute('aria-pressed', 'true');
    expect(new FormData(container.querySelector('form')!).get('credential')).toBe('example-value');
    expect(screen.getByLabelText('授权码')).toHaveValue('example-value');
  });
  it('重置和禁用重新隐藏；不提供已有保存值时输入保持为空', async () => {
    const { container, rerender } = render(<form><PasswordInput aria-label="内容" /></form>);
    expect(screen.getByLabelText('内容')).toHaveValue('');
    await userEvent.click(screen.getByLabelText('显示内容'));
    await act(async () => container.querySelector('form')!.reset());
    expect(screen.getByLabelText('内容')).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByLabelText('显示内容'));
    rerender(<PasswordInput aria-label="内容" disabled />);
    expect(screen.getByLabelText('内容')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('显示内容')).toBeDisabled();
  });
});
