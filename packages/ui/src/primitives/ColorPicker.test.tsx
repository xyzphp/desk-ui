import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';
import { normalizeColor } from './colorModel';
import { Field } from './Field';

const presets = [{ value: '#198455', label: '绿色' }, { value: '#d0444a', label: '红色' }, { value: 'url(example)', label: '无效颜色' }];
describe('ColorPicker', () => {
  it('三位扩展、六位草稿与失焦规范，不在输到三位时打断后续输入', async () => {
    const change = vi.fn();
    const { container } = render(<form><Field label="颜色"><ColorPicker name="color" onValueChange={change} /></Field></form>);
    const input = screen.getByRole('textbox', { name: '颜色' });
    await userEvent.type(input, '#aBc123');
    expect(input).toHaveValue('#aBc123');
    expect(change).toHaveBeenLastCalledWith('#abc123');
    await userEvent.tab();
    expect(input).toHaveValue('#abc123');
    expect(new FormData(container.querySelector('form')!).get('color')).toBe('#abc123');
    await userEvent.clear(input); await userEvent.type(input, '#f0A'); await userEvent.tab();
    expect(input).toHaveValue('#ff00aa');
  });
  it('原生取色和预设同一值，非法预设不渲染，clear / reset 与 required 保持一致', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<form><ColorPicker aria-label="颜色" ref={ref} name="color" defaultValue="#0a84ff"
      presets={presets} required /></form>);
    await userEvent.click(screen.getByRole('button', { name: '绿色' }));
    expect(ref.current).toHaveValue('#198455');
    expect(screen.getByRole('button', { name: '绿色' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('无效颜色')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('选择颜色'), { target: { value: '#d0444a' } });
    expect(ref.current).toHaveValue('#d0444a');
    await userEvent.click(screen.getByRole('button', { name: '清空颜色' }));
    act(() => { expect(ref.current!.checkValidity()).toBe(false); });
    expect(screen.getByRole('alert')).not.toBeEmptyDOMElement();
    await act(async () => container.querySelector('form')!.reset());
    expect(ref.current).toHaveValue('#0a84ff');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('非法草稿阻止提交，Esc 还原上个确认值；受控拒绝与只读不改变表单', async () => {
    const ref = createRef<HTMLInputElement>();
    const change = vi.fn();
    const { rerender } = render(<ColorPicker aria-label="颜色" ref={ref} defaultValue="#198455" />);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input); await userEvent.type(input, 'not-a-color');
    act(() => { expect(ref.current!.checkValidity()).toBe(false); });
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('');
    rerender(<ColorPicker aria-label="颜色" ref={ref} value="#198455" onValueChange={change} presets={presets} />);
    await userEvent.click(screen.getByRole('button', { name: '红色' }));
    expect(change).toHaveBeenLastCalledWith('#d0444a');
    expect(input).toHaveValue('#198455');
    change.mockClear();
    rerender(<form aria-label="只读表单"><ColorPicker aria-label="颜色" name="color" value="#198455" readOnly presets={presets}
      onValueChange={change} /></form>);
    expect(screen.getByLabelText('选择颜色')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '红色' }));
    expect(change).not.toHaveBeenCalled();
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('color')).toBe('#198455');
  });
});
describe('颜色规范', () => {
  it('只接受 HEX 与空值，不接受 CSS 表达式、透明颜色或脚本', () => {
    expect(normalizeColor(' #AbC ')).toBe('#aabbcc');
    expect(normalizeColor('')).toBe('');
    for (const color of ['#abcd', '#aabbccff', 'rgb(0,0,0)', 'var(--accent)', 'javascript:example()', 'url(example)']) {
      expect(normalizeColor(color)).toBeUndefined();
    }
  });
});
