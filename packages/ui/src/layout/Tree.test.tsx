import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tree } from './Tree';
import type { TreeNode } from './treeModel';

const nodes: readonly TreeNode[] = [
  { id: 'root', label: '目录', selectable: false, children: [
    { id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' },
    { id: 'off', label: '停用', disabled: true, children: [{ id: 'off-child', label: '停用子项' }] },
  ] },
  { id: 'last', label: '末项' },
];

describe('Tree', () => {
  it('方向键展开 / 进入 / 收起，焦点与选择分离，Enter 激活，前缀与首尾定位', async () => {
    const select = vi.fn();
    const activate = vi.fn();
    render(<Tree label="目录树" nodes={nodes} onValueChange={select} onActivate={activate} />);
    const root = screen.getByRole('treeitem', { name: '目录' });
    root.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveFocus();
    expect(select).not.toHaveBeenCalled();
    await userEvent.keyboard('b{Enter}');
    expect(screen.getByRole('treeitem', { name: 'Beta' })).toHaveFocus();
    expect(select).toHaveBeenLastCalledWith('b');
    expect(activate).toHaveBeenLastCalledWith(nodes[0]!.children![1]);
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: '末项' })).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowRight}{ArrowLeft}{ArrowLeft}');
    expect(root).toHaveFocus();
    expect(root).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'Alpha' })).not.toBeInTheDocument();
  });
  it('停用分支继承禁用，受控选择不自行提交，展开按钮只展开且保留父项焦点', async () => {
    const select = vi.fn();
    render(<Tree label="目录树" nodes={nodes} value="a" onValueChange={select} defaultExpanded={['root', 'off']} />);
    expect(screen.getByRole('treeitem', { name: '停用子项' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByText('Beta'));
    expect(select).toHaveBeenLastCalledWith('b');
    expect(screen.getByRole('treeitem', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    select.mockClear();
    await userEvent.click(screen.getByRole('button', { name: '收起：目录' }));
    expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole('treeitem', { name: '目录' })).toHaveFocus();
  });
  it('空态、全部禁用和数据移除不创建可用的伪节点', () => {
    const { rerender, container } = render(<Tree label="目录树" nodes={[]} />);
    expect(screen.getByText('暂无节点')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
    rerender(<Tree label="目录树" nodes={nodes} disabled defaultExpanded={['root']} />);
    expect(container.querySelector('[role="treeitem"][tabindex="0"]')).toBeNull();
    expect(screen.getByRole('tree')).toHaveAttribute('aria-disabled', 'true');
  });
});
