import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppLayout, AppMain, NavGroupLabel, NavItem, NavSidebar } from './Nav';

describe('应用导航', () => {
  it('侧栏是带名称的 nav 地标，标题与分组标签作为标题元素', () => {
    render(
      <AppLayout>
        <NavSidebar title="系统设置" aria-label="设置页面">
          <NavGroupLabel>个人</NavGroupLabel>
          <NavItem icon="palette">外观</NavItem>
        </NavSidebar>
        <AppMain>内容</AppMain>
      </AppLayout>,
    );
    const nav = screen.getByRole('navigation', { name: '设置页面' });
    expect(within(nav).getByRole('heading', { name: '系统设置' })).toBeInTheDocument();
    expect(within(nav).getByRole('heading', { name: '个人' })).toBeInTheDocument();
    expect(screen.getByText('内容')).toHaveClass('ds-app-main');
  });

  it('当前项标记 aria-current=page，其余不标记', () => {
    render(
      <NavSidebar aria-label="页面">
        <NavItem current>外观</NavItem>
        <NavItem>账号</NavItem>
      </NavSidebar>,
    );
    expect(screen.getByRole('button', { name: '外观' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '账号' })).not.toHaveAttribute('aria-current');
  });

  it('导航项默认是 button 类型，点击回调，不会提交外层表单', async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <NavItem onClick={onClick}>账号</NavItem>
      </form>,
    );
    const item = screen.getByRole('button', { name: '账号' });
    expect(item).toHaveAttribute('type', 'button');
    await userEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('没有标题时不渲染标题元素', () => {
    render(
      <NavSidebar aria-label="页面">
        <NavItem>外观</NavItem>
      </NavSidebar>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('内含分组导航时可用 aside 作为统一侧栏容器', () => {
    render(
      <NavSidebar as="aside" title="文件库" aria-label="文件侧栏">
        <nav aria-label="文件分类">
          <NavItem icon="folder" current>
            我的文件
          </NavItem>
        </nav>
      </NavSidebar>,
    );
    const sidebar = screen.getByRole('complementary', { name: '文件侧栏' });
    expect(within(sidebar).getByRole('heading', { name: '文件库' })).toBeInTheDocument();
    expect(within(sidebar).getByRole('navigation', { name: '文件分类' })).toBeInTheDocument();
  });

  it('提供 footer 时主体收入内部滚动区，footer 固定在底部', () => {
    render(
      <NavSidebar aria-label="页面" footer={<NavItem>设置</NavItem>}>
        <NavItem>外观</NavItem>
      </NavSidebar>,
    );
    const nav = screen.getByRole('navigation', { name: '页面' });
    expect(nav).toHaveClass('has-footer');
    const body = nav.querySelector('.ds-nav-body');
    const footer = nav.querySelector('.ds-nav-footer');
    expect(body).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(body).toContainElement(screen.getByRole('button', { name: '外观' }));
    expect(footer).toContainElement(screen.getByRole('button', { name: '设置' }));
  });

  it('没有 footer 时不渲染内部滚动区', () => {
    render(
      <NavSidebar aria-label="页面">
        <NavItem>外观</NavItem>
      </NavSidebar>,
    );
    const nav = screen.getByRole('navigation', { name: '页面' });
    expect(nav).not.toHaveClass('has-footer');
    expect(nav.querySelector('.ds-nav-body')).toBeNull();
    expect(nav.querySelector('.ds-nav-footer')).toBeNull();
  });
});
