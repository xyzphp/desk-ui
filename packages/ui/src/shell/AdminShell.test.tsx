import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../foundation/ConfigProvider';
import { AdminHeader, AdminLayout, AdminMenuGroup, AdminMenuItem, AdminSidebar, PageTabs } from './AdminShell';
import { Window } from './Window';

describe('AdminSidebar', () => {
  it('当前项标记 aria-current，收起后保留名称并提供悬停提示', () => {
    const { rerender } = render(
      <AdminSidebar title="控制台">
        <AdminMenuGroup label="内容">
          <AdminMenuItem label="文章" current />
          <AdminMenuItem label="消息" open badge={3} />
        </AdminMenuGroup>
      </AdminSidebar>,
    );
    const nav = screen.getByRole('navigation', { name: '应用菜单' });
    expect(within(nav).getByRole('group', { name: '内容' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '文章' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /消息/ })).toHaveAttribute('data-open', 'true');
    expect(screen.getByRole('button', { name: '文章' })).not.toHaveAttribute('title');
    rerender(
      <AdminSidebar title="控制台" collapsed>
        <AdminMenuItem label="文章" current />
      </AdminSidebar>,
    );
    expect(nav).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByRole('button', { name: '文章' })).toHaveAttribute('title', '文章');
  });

  it('不渲染折叠控制，菜单文案可由 ConfigProvider 覆盖', () => {
    render(
      <ConfigProvider labels={{ adminSidebar: { navigation: 'Apps' } }}>
        <AdminLayout sidebar={<AdminSidebar>菜单</AdminSidebar>} header={<div>页签</div>}>
          内容
        </AdminLayout>
      </ConfigProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Apps' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '收起菜单' })).not.toBeInTheDocument();
    expect(screen.getByText('内容')).toHaveClass('ds-admin-content');
  });

  it('AdminHeader.start 将附加操作放在标题之前', () => {
    render(<AdminHeader start={<button type="button">返回</button>} title="控制台" />);
    const header = screen.getByRole('banner');
    expect(header.firstElementChild).toHaveTextContent('返回');
    expect(header.children[1]).toHaveClass('ds-admin-header-title');
  });
});

describe('PageTabs', () => {
  const items = [
    { id: 'home', label: '首页', closable: false },
    { id: 'users', label: '账号' },
    { id: 'logs', label: '日志' },
  ];

  it('选中项可聚焦，点击切换，关闭按钮与中键只作用于可关闭页签', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<PageTabs items={items} value="users" onChange={onChange} onClose={onClose} panelId="page" />);
    const tabs = within(screen.getByRole('tablist', { name: '已打开的页面' })).getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
    expect(tabs[1]).toHaveAttribute('aria-controls', 'page');
    fireEvent.click(tabs[2]!);
    expect(onChange).toHaveBeenCalledWith('logs');
    expect(screen.queryByRole('button', { name: '关闭 首页' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '关闭 账号' }));
    expect(onClose).toHaveBeenCalledWith('users');
    fireEvent(tabs[0]!, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('方向键循环切换，Home / End 跳到首尾，Delete 关闭当前页签', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<PageTabs items={items} value="logs" onChange={onChange} onClose={onClose} />);
    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('home');
    expect(tabs[0]).toHaveFocus();
    fireEvent.keyDown(tabs[0]!, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('logs');
    fireEvent.keyDown(tabs[2]!, { key: 'Delete' });
    expect(onClose).toHaveBeenCalledWith('logs');
    fireEvent.keyDown(tabs[0]!, { key: 'Delete' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('value 不匹配时全部未选中，第一个页签保留 Tab 停靠点', () => {
    render(<PageTabs items={items} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.every((tab) => tab.getAttribute('aria-selected') === 'false')).toBe(true);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(screen.queryByRole('button', { name: /关闭/ })).not.toBeInTheDocument();
  });
});

describe('PageTabs 右键菜单与排序', () => {
  const items = [
    { id: 'home', label: '首页', closable: false },
    { id: 'users', label: '账号' },
    { id: 'logs', label: '日志' },
  ];

  it('右键页签显示刷新 / 关闭 / 关闭其他 / 关闭所有，并按回调触发', () => {
    const handlers = { onClose: vi.fn(), onRefresh: vi.fn(), onCloseOthers: vi.fn(), onCloseAll: vi.fn() };
    render(<PageTabs items={items} value="users" {...handlers} />);
    const tab = (name: string) => screen.getByRole('tab', { name });
    fireEvent.contextMenu(tab('账号'));
    expect(screen.getByRole('menu', { name: '页签菜单' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: '刷新' }));
    expect(handlers.onRefresh).toHaveBeenCalledWith('users');
    fireEvent.contextMenu(tab('账号'));
    fireEvent.click(screen.getByRole('menuitem', { name: '关闭其他' }));
    expect(handlers.onCloseOthers).toHaveBeenCalledWith('users');
    fireEvent.contextMenu(tab('日志'));
    fireEvent.click(screen.getByRole('menuitem', { name: '关闭所有' }));
    expect(handlers.onCloseAll).toHaveBeenCalledOnce();
    fireEvent.contextMenu(tab('日志'));
    fireEvent.click(screen.getByRole('menuitem', { name: '关闭' }));
    expect(handlers.onClose).toHaveBeenCalledWith('logs');
  });

  it('固定页签的“关闭”禁用；其余页签都不可关闭时“关闭其他 / 关闭所有”禁用', () => {
    render(<PageTabs items={[items[0]!]} onClose={vi.fn()} onCloseOthers={vi.fn()} onCloseAll={vi.fn()} />);
    fireEvent.contextMenu(screen.getByRole('tab', { name: '首页' }));
    expect(screen.getByRole('menuitem', { name: '关闭' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: '关闭其他' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: '关闭所有' })).toBeDisabled();
  });

  it('没有任何菜单回调时不拦截右键', () => {
    render(<PageTabs items={items} />);
    expect(fireEvent.contextMenu(screen.getByRole('tab', { name: '账号' }))).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('拖拽页签到目标的右半边后给出新顺序', () => {
    const onReorder = vi.fn();
    render(<PageTabs items={items} onReorder={onReorder} />);
    const wrappers = screen.getAllByRole('tab').map((tab) => tab.parentElement!);
    const rect = { left: 0, right: 100, top: 0, bottom: 30, width: 100, height: 30, x: 0, y: 0, toJSON: () => ({}) };
    wrappers[0]!.getBoundingClientRect = () => rect;
    const data = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(wrappers[2]!, { dataTransfer: data });
    // jsdom 没有 DragEvent，fireEvent 退回普通 Event 并丢掉 clientX；这里显式补上指针位置。
    const over = createEvent.dragOver(wrappers[0]!, { dataTransfer: data });
    Object.defineProperty(over, 'clientX', { value: 80 });
    fireEvent(wrappers[0]!, over);
    expect(wrappers[0]).toHaveAttribute('data-drop', 'after');
    fireEvent.drop(wrappers[0]!, { dataTransfer: data });
    expect(onReorder).toHaveBeenCalledWith(['home', 'logs', 'users']);
  });

  it('Ctrl + Shift + 方向键移动当前页签，到边界时不触发', () => {
    const onReorder = vi.fn();
    render(<PageTabs items={items} value="users" onReorder={onReorder} />);
    const users = screen.getByRole('tab', { name: '账号' });
    fireEvent.keyDown(users, { key: 'ArrowRight', ctrlKey: true, shiftKey: true });
    expect(onReorder).toHaveBeenLastCalledWith(['home', 'logs', 'users']);
    fireEvent.keyDown(users, { key: 'ArrowLeft', ctrlKey: true, shiftKey: true });
    expect(onReorder).toHaveBeenLastCalledWith(['users', 'home', 'logs']);
    fireEvent.keyDown(screen.getByRole('tab', { name: '首页' }), { key: 'ArrowLeft', ctrlKey: true, shiftKey: true });
    expect(onReorder).toHaveBeenCalledTimes(2);
  });
});

describe('AdminHeader 与图标栏形态', () => {
  it('列表密度作为独立属性，菜单项沿用同一结构', () => {
    render(
      <AdminSidebar variant="list" density="compact" title={<span>品牌</span>}>
        <AdminMenuItem label="文件管理" current />
      </AdminSidebar>,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'list');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-density', 'compact');
    expect(screen.getByRole('button', { name: '文件管理' })).toHaveAttribute('aria-current', 'page');
  });

  it('纯文字标题包进可收起的文字节点，元素标题（logo + 名称）保持原结构', () => {
    const { rerender } = render(<AdminSidebar title="控制台" collapsed />);
    expect(screen.getByText('控制台')).toHaveClass('ds-admin-sidebar-title-text');
    rerender(
      <AdminSidebar
        title={
          <>
            <img alt="logo" />
            <span>站点名</span>
          </>
        }
        actions={
          <button type="button" aria-label="收起菜单">
            收起
          </button>
        }
        collapsed
      />,
    );
    const brand = screen.getByAltText('logo').parentElement!;
    expect(brand).toHaveClass('ds-admin-sidebar-brand');
    expect(brand.children).toHaveLength(2);
    expect(brand.parentElement).toHaveClass('ds-admin-sidebar-title');
    expect(screen.getByRole('button', { name: '收起菜单' })).toBeInTheDocument();
  });

  it('rail 固定为图标栏、不显示折叠按钮；顶栏渲染标题与操作区', () => {
    render(
      <AdminLayout
        sidebar={
          <AdminSidebar variant="rail" title={<span>品牌</span>} collapsed>
            <AdminMenuItem label="文章" />
          </AdminSidebar>
        }
        header={<AdminHeader title="文章" end={<button type="button">账号</button>} />}
      />,
    );
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveAttribute('data-variant', 'rail');
    expect(sidebar).not.toHaveAttribute('data-collapsed');
    expect(screen.queryByRole('button', { name: '收起菜单' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '文章' })).not.toHaveAttribute('title');
    expect(screen.getByText('品牌')).toBeInTheDocument();
    const header = screen.getByRole('banner');
    expect(within(header).getByText('文章')).toHaveClass('ds-admin-header-title');
    expect(within(header).getByRole('button', { name: '账号' })).toBeInTheDocument();
  });
});

describe('Window embedded', () => {
  const geometry = { x: 10, y: 10, width: 400, height: 300 };

  it('嵌入时是具名 region，没有标题栏、缩放手柄和几何样式；切换模式不重挂内容', () => {
    const mounted = vi.fn();
    function Content() {
      // 用挂载副作用计数：内联 ref 回调每次重渲染都会被重新调用，不能代表重新挂载。
      useEffect(() => mounted(), []);
      return <input aria-label="草稿" />;
    }
    const { rerender } = render(
      <Window title="设置" geometry={geometry} maximized minimized>
        <Content />
      </Window>,
    );
    fireEvent.change(screen.getByLabelText('草稿', { selector: 'input' }), { target: { value: '保留' } });
    rerender(
      <Window title="设置" geometry={geometry} maximized minimized embedded>
        <Content />
      </Window>,
    );
    const region = screen.getByRole('region', { name: '设置' });
    expect(region).toHaveClass('is-embedded');
    expect(region).not.toHaveClass('is-minimized', 'is-maximized');
    expect(region).not.toHaveAttribute('aria-hidden');
    expect(region.style.width).toBe('');
    expect(screen.queryByRole('button', { name: '关闭窗口' })).not.toBeInTheDocument();
    expect(region.querySelector('.ds-resizer')).toBeNull();
    expect(screen.getByLabelText('草稿', { selector: 'input' })).toHaveValue('保留');
    expect(mounted).toHaveBeenCalledTimes(1);
  });
});
