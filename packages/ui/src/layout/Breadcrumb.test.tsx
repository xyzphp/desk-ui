import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  const items = ['首页', '资料', '项目', '设计', '文档', '当前页'].map((label, index) => ({ id: String(index), label }));
  it('溢出层级可访问，最后一项标记当前页，选择后关闭并返回焦点', async () => {
    const select = vi.fn();
    render(<Breadcrumb items={items} maxItems={4} onSelect={select} />);
    expect(screen.getByText('当前页')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('资料')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '显示省略层级' }));
    await userEvent.click(screen.getByRole('button', { name: '资料' }));
    expect(select).toHaveBeenCalledExactlyOnceWith(items[1]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '显示省略层级' })).toHaveFocus();
  });
  it('保留真实链接，禁用项不导航，危险协议由 Link 拒绝', async () => {
    render(<Breadcrumb items={[
      { id: 'home', label: '首页', href: 'https://example.com/' },
      { id: 'blocked', label: '禁用', disabled: true, href: 'https://example.com/blocked' },
      { id: 'unsafe', label: '不安全', href: 'javascript:example()' },
      { id: 'current', label: '当前页' },
    ]} />);
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', 'https://example.com/');
    expect(screen.getByText('禁用')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('link', { name: '不安全' })).not.toHaveAttribute('href');
    await userEvent.click(screen.getByRole('link', { name: '不安全' }));
  });
  it('可保留原页面的完整横向路径，并允许点击当前层级', async () => {
    const select = vi.fn();
    const { container } = render(<Breadcrumb items={items} maxItems={Number.MAX_SAFE_INTEGER} activateCurrent onSelect={select} />);
    expect(container.querySelectorAll('.ds-breadcrumb-list > li')).toHaveLength(items.length);
    const current = screen.getByRole('button', { name: '当前页' });
    expect(current).toHaveAttribute('aria-current', 'page');
    await userEvent.click(current);
    expect(select).toHaveBeenCalledExactlyOnceWith(items.at(-1));
  });
});
