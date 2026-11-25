import { Fragment, createRef, useState, type KeyboardEvent } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field } from './Field';
import { Select } from './Select';

describe('Select', () => {
  it('在 Field 中命名，选择后透传真实 select 事件、表单值及选中状态', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const ref = createRef<HTMLSelectElement>();
    function Form() {
      const [value, setValue] = useState('ready');
      return <form aria-label="设置"><Field label="演示状态"><Select ref={ref} name="state" value={value} onChange={(event) => {
        changed(event.currentTarget); setValue(event.currentTarget.value);
      }}><option value="idle">未生成</option><option value="ready">可应用</option></Select></Field></form>;
    }
    render(<Form />);
    const trigger = screen.getByRole('combobox', { name: '演示状态' });
    expect(trigger).toHaveTextContent('可应用');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getByRole('option', { name: '可应用' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('option', { name: '未生成' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(ref.current);
    expect(ref.current).toHaveValue('idle');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('state')).toBe('idle');
    expect(trigger).toHaveTextContent('未生成');
    expect(trigger).toHaveFocus();
  });

  it('受控宿主未接受变化时还原显示；非受控重置恢复默认值且不伪造 change', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<Select aria-label="状态" value="a" onChange={change}><option value="a">选项甲</option><option value="b">选项乙</option></Select>);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '选项乙' }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('combobox')).toHaveTextContent('选项甲');
    rerender(<form aria-label="筛选"><Select aria-label="状态" defaultValue="a" onChange={change}><option value="a">选项甲</option><option value="b">选项乙</option></Select></form>);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '选项乙' }));
    change.mockClear();
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByRole('combobox')).toHaveTextContent('选项甲');
    expect(change).not.toHaveBeenCalled();
  });

  it('解析真实 option / optgroup，保留片段、自定义选项组件、组禁用与隐藏项', async () => {
    const user = userEvent.setup();
    function Options() { return <Fragment><option value="a">甲</option><option value="hidden" hidden>隐藏项</option></Fragment>; }
    render(<Select aria-label="分组"><Options /><optgroup label="暂不可用" disabled><option value="b">乙</option></optgroup><optgroup label="可选"><option value="c">丙</option></optgroup></Select>);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('option', { name: '隐藏项' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: '暂不可用' })).getByRole('option', { name: '乙' })).toBeDisabled();
    await user.click(within(screen.getByRole('group', { name: '可选' })).getByRole('option', { name: '丙' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('丙');
  });

  it('必填仍阻止原生表单，错误关联可见触发器，选择有效项后清除本地错误', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    render(<Field label="语言"><Select required ref={ref} defaultValue=""><option value="" disabled>请选择语言</option><option value="zh">中文</option></Select></Field>);
    let valid = true;
    act(() => { valid = ref.current!.checkValidity(); });
    expect(valid).toBe(false);
    const trigger = screen.getByRole('combobox', { name: '语言' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription(ref.current!.validationMessage);
    expect(screen.getByRole('alert')).not.toBeEmptyDOMElement();
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: '中文' }));
    expect(ref.current!.checkValidity()).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('多选使用相同样式的列表，保留原生 selectedOptions 和多值 FormData', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    render(<form aria-label="多选"><Field label="字段"><Select ref={ref} name="fields" multiple defaultValue={['a']}>
      <option value="a">甲</option><option value="b">乙</option><option value="c" disabled>丙</option>
    </Select></Field></form>);
    expect(screen.getByRole('listbox', { name: '字段' })).toHaveAttribute('aria-multiselectable', 'true');
    await user.click(screen.getByRole('option', { name: '乙' }));
    expect(Array.from(ref.current!.selectedOptions, (item) => item.value)).toEqual(['a', 'b']);
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).getAll('fields')).toEqual(['a', 'b']);
    await user.click(screen.getByRole('option', { name: '甲' }));
    expect(screen.getByRole('option', { name: '甲' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('option', { name: '丙' })).toBeDisabled();
  });

  it('方向键跳过禁用项，Esc 归还焦点，隐式 label 不混入选项和值的文本', async () => {
    const user = userEvent.setup();
    render(<label>每页条数<Select defaultValue="20"><option value="20">20</option><option value="30" disabled>30</option><option value="50">50</option></Select></label>);
    const trigger = screen.getByRole('combobox', { name: '每页条数' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: '20' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: '50' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('20');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('表单外关联和被取消的 reset 保留；原生 ref 可取值并将焦点交给可见控件', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    render(<><form id="select-form" aria-label="关联表单" onReset={(event) => event.preventDefault()} /><Select ref={ref} form="select-form" name="choice" aria-label="选择" defaultValue="a"><option value="a">甲</option><option value="b">乙</option></Select></>);
    act(() => ref.current!.focus());
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: '乙' }));
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(trigger).toHaveTextContent('乙');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('choice')).toBe('b');
  });

  it('原生 change 和选项更新能同步显示；宿主可以阻止展开快捷键', () => {
    const ref = createRef<HTMLSelectElement>();
    const keyboard = vi.fn((event: KeyboardEvent<HTMLSelectElement>) => event.preventDefault());
    const { rerender } = render(<Select ref={ref} aria-label="模式" onKeyDown={keyboard}><option value="a">甲</option><option value="b">乙</option></Select>);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(keyboard).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.change(ref.current!, { target: { value: 'b' } });
    expect(screen.getByRole('combobox')).toHaveTextContent('乙');
    rerender(<Select ref={ref} aria-label="模式" value="b" onChange={() => {}}><option value="a">甲</option><option value="b">更新后的乙</option></Select>);
    expect(screen.getByRole('combobox')).toHaveTextContent('更新后的乙');
  });

  it('关闭时可通过文字定位打开菜单，确认前不改值', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="模式" defaultValue="a"><option value="a">Alpha</option><option value="b">Beta</option></Select>);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('b');
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveFocus();
    expect(trigger).toHaveTextContent('Alpha');
    await user.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Beta');
  });
});
