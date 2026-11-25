import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CheckboxGroup } from './CheckboxGroup';
import { Checkbox } from './Feedback';

const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }, { value: 'locked', label: '停用', disabled: true }];
describe('CheckboxGroup', () => {
  it('同名多值表单排除停用项，切换后 reset 恢复默认值', async () => {
    const changed = vi.fn();
    const { container } = render(<form><CheckboxGroup label="渠道" name="channels" options={options}
      defaultValue={['a', 'locked']} onValueChange={changed} /></form>);
    expect(screen.getByRole('group', { name: '渠道' })).toBeInTheDocument();
    const form = container.querySelector('form')!;
    expect(new FormData(form).getAll('channels')).toEqual(['a']);
    await userEvent.click(screen.getByRole('checkbox', { name: '乙' }));
    expect(changed).toHaveBeenLastCalledWith(['a', 'locked', 'b']);
    expect(new FormData(form).getAll('channels')).toEqual(['a', 'b']);
    await act(async () => form.reset());
    expect(screen.getByRole('checkbox', { name: '甲' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '乙' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '停用' })).toBeChecked();
  });
  it('required 校验整组而非每项；禁用选择不能代替可用选择，全部禁用不阻塞表单', async () => {
    const { container, rerender } = render(<form><CheckboxGroup label="渠道" options={options} required defaultValue={['locked']} /></form>);
    const form = container.querySelector('form')!;
    act(() => { expect(form.checkValidity()).toBe(false); });
    expect(screen.getByRole('alert')).toHaveTextContent('请至少选择一项');
    expect(screen.getByRole('checkbox', { name: '甲' })).toHaveFocus();
    await userEvent.click(screen.getByRole('checkbox', { name: '乙' }));
    expect(form.checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(<form><CheckboxGroup label="渠道" options={options} required disabled /></form>);
    expect(form.checkValidity()).toBe(true);
  });
  it('受控拒绝恢复选中，外部表单和被取消的 reset 保留；只读不切换仍提交', async () => {
    const changed = vi.fn();
    const { rerender } = render(<><form id="group-form" aria-label="关联表单" onReset={(event) => event.preventDefault()} />
      <CheckboxGroup label="渠道" options={options} name="channels" form="group-form" value={['a']} onValueChange={changed} /></>);
    await userEvent.click(screen.getByRole('checkbox', { name: '乙' }));
    expect(changed).toHaveBeenLastCalledWith(['a', 'b']);
    expect(screen.getByRole('checkbox', { name: '乙' })).not.toBeChecked();
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).getAll('channels')).toEqual(['a']);
    changed.mockClear();
    rerender(<form aria-label="只读表单"><CheckboxGroup label="渠道" options={options} name="channels"
      value={['a']} readOnly onValueChange={changed} /></form>);
    await userEvent.click(screen.getByRole('checkbox', { name: '甲' }));
    expect(changed).not.toHaveBeenCalled();
    // 只读时 click 被 preventDefault。Chromium 会把勾选恢复为取消前的值（已在真实浏览器中核对），
    // jsdom 取消点击时会多翻转一次，所以这里不断言 FormData，只断言 aria-readonly 与无回调。
    expect(screen.getByRole('checkbox', { name: '甲' })).toHaveAttribute('aria-readonly', 'true');
  });
  it('Checkbox 的半选与 ref 指向真实输入，半选不自动提交为选中', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender, container } = render(<form><Checkbox ref={ref} name="summary" value="all" indeterminate>汇总</Checkbox></form>);
    expect(ref.current).toBe(screen.getByRole('checkbox', { name: '汇总' }));
    expect(ref.current?.indeterminate).toBe(true);
    expect(new FormData(container.querySelector('form')!).get('summary')).toBeNull();
    rerender(<Checkbox ref={ref} indeterminate={false}>汇总</Checkbox>);
    expect(ref.current?.indeterminate).toBe(false);
  });
});
