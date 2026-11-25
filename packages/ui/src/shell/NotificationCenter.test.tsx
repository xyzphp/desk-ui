import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotificationCenter, type NotificationCenterItem } from './NotificationCenter';

const initial: readonly NotificationCenterItem[] = [
  { id: 'a', title: '草稿已保存', unread: true }, { id: 'b', title: '待处理', unread: true }, { id: 'c', title: '历史', unread: false },
];
describe('NotificationCenter', () => {
  it('已读 / 移除仅回调，宿主拒绝时保留历史，筛选与忙碌使用原生按钮', async () => {
    const mark = vi.fn(), dismiss = vi.fn(), activate = vi.fn();
    const { rerender } = render(<NotificationCenter label="通知" items={initial} onActivate={activate} onMarkRead={mark} onDismiss={dismiss} />);
    await userEvent.click(screen.getByRole('button', { name: '未读' }));
    expect(screen.queryByRole('button', { name: '历史' })).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: '标为已读' })[0]!); expect(mark).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getByRole('button', { name: '移除通知：草稿已保存' })); expect(dismiss).toHaveBeenCalledWith('a');
    expect(screen.getByRole('button', { name: '草稿已保存' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '草稿已保存' })); expect(activate).toHaveBeenCalledTimes(1);
    rerender(<NotificationCenter label="通知" items={initial} onActivate={activate} busy />);
    const region = screen.getByRole('region', { name: '通知' });
    expect(within(region).getAllByRole('button').every((button) => button.matches(':disabled'))).toBe(true);
    expect(screen.getByRole('button', { name: '草稿已保存' })).toHaveClass('ds-notification--inline');
  });
  it('实际移除后聚焦相邻入口，清空后保留可操作焦点和空态', async () => {
    function Example() {
      const [items, setItems] = useState(initial);
      return <NotificationCenter label="通知" items={items} onActivate={() => {}}
        onDismiss={(id) => setItems((current) => current.filter((item) => item.id !== id))} onClear={() => setItems([])} />;
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: '移除通知：草稿已保存' }));
    expect(screen.getByRole('button', { name: '移除通知：待处理' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '清空通知' }));
    expect(screen.getByText('暂无通知')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '全部' })).toHaveFocus();
  });
});
