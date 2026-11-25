import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppIcon } from './AppIcon';
import { Desktop } from './Desktop';
import { StartMenu, type StartMenuProps } from './StartMenu';

const items = [
  { id: 'todo', label: '待办事项', icon: <AppIcon icon="folder" />, keywords: 'task' },
  { id: 'memo', label: '备忘录', icon: <AppIcon icon="book-open" /> },
];

function Harness(props: Partial<StartMenuProps> & { initialOpen?: boolean }) {
  const [open, setOpen] = useState(props.initialOpen ?? true);
  return (
    <StartMenu
      items={items}
      pinnedIds={['memo']}
      userName="管理员"
      onSelect={vi.fn()}
      {...props}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

describe('开始菜单', () => {
  it('开始按钮切换菜单并写入 aria-expanded', async () => {
    render(<Harness initialOpen={false} />);
    const button = screen.getByRole('button', { name: '开始菜单' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.getByRole('dialog', { name: '开始菜单' })).toHaveAttribute('data-align', 'center');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('已固定网格只含固定应用，全部列表按名称排序并含所有应用', () => {
    render(<Harness />);
    const pinned = screen.getByRole('list', { name: '已固定' });
    const all = screen.getByRole('list', { name: '全部' });
    expect(pinned.querySelectorAll('li')).toHaveLength(1);
    expect(pinned).toHaveAttribute('data-view', 'grid');
    expect(all.querySelectorAll('li')).toHaveLength(2);
    expect(all).toHaveAttribute('data-view', 'list');
  });

  it('不传 pinnedIds 时不分区，只有一个按名称排序的应用列表', () => {
    render(<Harness pinnedIds={undefined} />);
    expect(screen.queryByRole('list', { name: '已固定' })).not.toBeInTheDocument();
    expect(screen.queryByText('已固定')).not.toBeInTheDocument();
    const all = screen.getByRole('list', { name: '全部' });
    expect(all.querySelectorAll('li')).toHaveLength(2);
    expect(
      within(all)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['备忘录', '待办事项']);
  });

  it('选择应用后触发回调并关闭菜单', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await userEvent.click(within(screen.getByRole('list', { name: '已固定' })).getByRole('button', { name: '备忘录' }));
    expect(onSelect).toHaveBeenCalledWith('memo');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('搜索匹配名称与关键词，回车打开第一项，无结果时提示', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const search = screen.getByRole('searchbox', { name: '搜索应用' });
    await userEvent.type(search, 'task');
    expect(screen.getByRole('list', { name: '搜索结果' }).querySelectorAll('li')).toHaveLength(1);
    await userEvent.type(search, '{Enter}');
    expect(onSelect).toHaveBeenCalledWith('todo');
  });

  it('无匹配时显示提示', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole('searchbox', { name: '搜索应用' }), '不存在');
    expect(screen.getByRole('status')).toHaveTextContent('没有匹配的应用');
  });

  it('底部入口触发动作并关闭，Esc 关闭并把焦点还给开始按钮', async () => {
    const onLogout = vi.fn();
    render(<Harness actions={[{ id: 'logout', label: '退出登录', icon: 'log-out', onSelect: onLogout }]} />);
    await userEvent.click(screen.getByRole('button', { name: '退出登录' }));
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '开始菜单' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始菜单' })).toHaveFocus();
  });

  it('置于液态玻璃 Desktop 内时保留开始菜单与搜索结构', () => {
    render(
      <Desktop cardStyle="liquid" dockStyle="windows">
        <Harness initialOpen />
      </Desktop>,
    );
    const dialog = screen.getByRole('dialog', { name: '开始菜单' });
    expect(dialog.closest('.ds-desktop')).toHaveAttribute('data-card-style', 'liquid');
    expect(screen.getByRole('searchbox', { name: '搜索应用' })).toBeInTheDocument();
  });
});
