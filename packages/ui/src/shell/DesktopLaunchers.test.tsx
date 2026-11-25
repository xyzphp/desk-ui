import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';
import { Launchpad } from './Launchpad';
import { WindowSwitcher } from './WindowSwitcher';

describe('CommandPalette', () => {
  const items = [{ id: 'a', label: '新建便签', keywords: ['note'] }, { id: 'b', label: '禁用命令', disabled: true },
    { id: 'c', label: '外观设置', keywords: ['theme'] }];
  it('虚拟焦点跳过禁用项，输入法不执行，搜索和 Enter 只回调一次', async () => {
    const execute = vi.fn(), cancel = vi.fn();
    render(<CommandPalette label="命令" items={items} onExecute={execute} onCancel={cancel} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input); await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: '外观设置' })).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(execute).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}'); expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]![0].id).toBe('c');
    await userEvent.type(input, 'ｎｏｔｅ');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option').id);
    await userEvent.keyboard('{Escape}'); expect(cancel).toHaveBeenCalledTimes(1);
  });
  it('受控查询拒绝时恢复，加载冻结执行，空结果保留搜索入口', async () => {
    const execute = vi.fn(), query = vi.fn();
    const { rerender } = render(<CommandPalette label="命令" items={items} query="note" onQueryChange={query} onExecute={execute} />);
    await userEvent.type(screen.getByRole('combobox'), 'x');
    expect(query).toHaveBeenCalled(); expect(screen.getByRole('combobox')).toHaveValue('note');
    rerender(<CommandPalette label="命令" items={items} loading onExecute={execute} />);
    await userEvent.click(screen.getByRole('combobox')); await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(execute).not.toHaveBeenCalled();
    expect(screen.getAllByRole('option').every((option) => option.hasAttribute('disabled'))).toBe(true);
    rerender(<CommandPalette label="命令" items={[]} onExecute={execute} />);
    expect(screen.getByText('没有匹配的命令')).toBeInTheDocument();
  });
});

describe('Launchpad', () => {
  it('按钮网格按列移动、跳过禁用项，别名过滤后仍保留一个 Tab 入口', async () => {
    const launch = vi.fn();
    render(<Launchpad label="启动器" columns={2} onLaunch={launch} items={[
      { id: 'a', name: '备忘录', keywords: ['note'] }, { id: 'b', name: '停用', disabled: true },
      { id: 'c', name: '文件' }, { id: 'd', name: '设置' },
    ]} />);
    await userEvent.click(screen.getByRole('button', { name: '备忘录' })); launch.mockClear();
    await userEvent.keyboard('{ArrowDown}'); expect(screen.getByRole('button', { name: '文件' })).toHaveFocus();
    await userEvent.keyboard('{Enter}'); expect(launch).toHaveBeenCalledTimes(1);
    expect(launch.mock.calls[0]![0].id).toBe('c');
    await userEvent.type(screen.getByRole('searchbox'), 'note');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '备忘录' })).toHaveAttribute('tabindex', '0');
  });
});

describe('WindowSwitcher', () => {
  it('受控当前窗口不因定位而改变，预览 inert，确认 / 取消只回调', async () => {
    const activate = vi.fn(), cancel = vi.fn();
    const { container } = render(<WindowSwitcher label="切换" currentId="a" onActivate={activate} onCancel={cancel} items={[
      { id: 'a', title: '草稿', preview: <button>预览中的按钮</button> },
      { id: 'b', title: '停用窗口', disabled: true }, { id: 'c', title: '文件', minimized: true },
    ]} />);
    expect(screen.queryByRole('button', { name: '预览中的按钮' })).not.toBeInTheDocument();
    expect(container.querySelector('.ds-window-switcher-preview')).toHaveAttribute('inert');
    const current = screen.getByRole('button', { name: /草稿/ });
    current.focus(); await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /文件/ })).toHaveFocus();
    expect(current).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}'); expect(activate).toHaveBeenCalledTimes(1);
    expect(activate.mock.calls[0]![0].id).toBe('c');
    await userEvent.keyboard('{Escape}'); expect(cancel).toHaveBeenCalledTimes(1);
  });
});
