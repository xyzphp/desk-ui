import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, MultiSelect } from './Select';
import { Field } from './Field';

describe('Combobox', () => {
  it('按别名筛选，草稿不改表单值，回车只确认候选且保留输入焦点', async () => {
    const ref = createRef<HTMLSelectElement>();
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const { container } = render(<form onSubmit={submit}><Field label="目录">
      <Combobox name="folder" ref={ref} defaultValue="a" onChange={change}>
        <option value="a">资料</option><option value="b" data-search-text="docs wendang">文档</option>
        <optgroup label="停用" disabled><option value="c" data-search-text="docs">旧文档</option></optgroup>
      </Combobox>
    </Field></form>);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox', { name: '目录' });
    await user.type(input, 'DOCS');
    expect(screen.queryByRole('option', { name: '资料' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: '旧文档' })).toBeDisabled();
    expect(new FormData(container.querySelector('form')!).get('folder')).toBe('a');
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenCalledTimes(1);
    expect(ref.current).toHaveValue('b');
    expect(input).toHaveValue('文档');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(submit).not.toHaveBeenCalled();
  });
  it('受控回退，输入法回车不选择，Esc 还原已选文本，无结果不会写入自由文本', async () => {
    const change = vi.fn();
    render(<Combobox aria-label="状态" value="a" onValueChange={change}>
      <option value="a">Alpha</option><option value="b">Beta</option>
    </Combobox>);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Beta');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenLastCalledWith('b');
    expect(input).toHaveValue('Alpha');
    await userEvent.click(input);
    await userEvent.type(input, '无匹配');
    expect(screen.getByText('暂无可选项')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}{Escape}');
    expect(change).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('Alpha');
  });
  it('原生必填错误关联可见输入，ref.focus 代理焦点，禁用和只读阻止展开', async () => {
    const ref = createRef<HTMLSelectElement>();
    const { rerender } = render(<Combobox ref={ref} aria-label="主题" required defaultValue="">
      <option value="" hidden /><option value="one">主题一</option>
    </Combobox>);
    act(() => { expect(ref.current!.checkValidity()).toBe(false); });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => ref.current!.focus());
    expect(screen.getByRole('combobox')).toHaveFocus();
    rerender(<Combobox aria-label="主题" readOnly value="one"><option value="one">主题一</option></Combobox>);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    rerender(<Combobox aria-label="主题" disabled><option>主题一</option></Combobox>);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('MultiSelect', () => {
  it('多选不关闭面板，同名多值提交；清空保留停用已选项，reset 恢复非受控值', async () => {
    const ref = createRef<HTMLSelectElement>();
    const change = vi.fn();
    const { container } = render(<form><MultiSelect aria-label="主题" ref={ref} name="topics"
      defaultValue={['a', 'locked']} onValueChange={change} maxVisibleTags={1}
    >
      <option value="a">设计</option><option value="b">开发</option>
      <optgroup label="停用" disabled><option value="locked">历史</option></optgroup>
    </MultiSelect></form>);
    await userEvent.click(screen.getByRole('button', { name: '主题' }));
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    await userEvent.type(input, '开发{Enter}');
    expect(screen.getByRole('dialog', { name: '主题' })).toBeInTheDocument();
    expect(change).toHaveBeenLastCalledWith(['a', 'b', 'locked']);
    const form = container.querySelector('form')!;
    // 浏览器不提交停用分组里的选项，jsdom 的 FormData 会提交，所以按 :disabled 过滤后再比较。
    const submitted = Array.from(ref.current!.selectedOptions).filter((item) => !item.matches(':disabled'));
    expect(submitted.map((item) => item.value)).toEqual(['a', 'b']);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: '清空选择：主题' }));
    expect(Array.from(ref.current!.selectedOptions, (item) => item.value)).toEqual(['locked']);
    await act(async () => form.reset());
    expect(Array.from(ref.current!.selectedOptions, (item) => item.value)).toEqual(['a', 'locked']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('空搜索退格移除最后可编辑项，受控值保留，loading 和外层 fieldset 禁止修改', async () => {
    const changed = vi.fn();
    const options = <><option value="a">甲</option><option value="b">乙</option></>;
    const { rerender } = render(<MultiSelect aria-label="多值" value={['a', 'b']} onValueChange={changed}>{options}</MultiSelect>);
    await userEvent.click(screen.getByRole('button', { name: '多值' }));
    await userEvent.keyboard('{Backspace}');
    expect(changed).toHaveBeenLastCalledWith(['a']);
    expect(screen.getByRole('option', { name: '乙' })).toHaveAttribute('aria-selected', 'true');
    changed.mockClear();
    rerender(<MultiSelect aria-label="多值" value={['a', 'b']} onValueChange={changed} loading>{options}</MultiSelect>);
    await userEvent.keyboard('{Backspace}{Enter}');
    expect(changed).not.toHaveBeenCalled();
    rerender(<fieldset disabled><MultiSelect aria-label="多值" value={['a']}>{options}</MultiSelect></fieldset>);
    expect(screen.getByRole('button', { name: '多值' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
