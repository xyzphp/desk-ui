import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Scrollable, Workspace } from '../foundation/Workspace';
import { List, ListItem, SearchField, Sidebar, SidebarAddButton, SplitLayout, DocumentPane } from './Layout';
import { SettingsRow } from './Nav';

describe('SearchField', () => {
  it('可省略装饰图标，并保留名称与原生输入', () => {
    const { container } = render(<SearchField label="搜索收藏" showIcon={false} />);
    expect(screen.getByRole('searchbox', { name: '搜索收藏' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('pill 形态追加沉浸式搜索条类名，默认形态不变', () => {
    const { container, rerender } = render(<SearchField label="搜索收藏" variant="pill" />);
    expect(container.querySelector('.ds-search')).toHaveClass('ds-search--pill');
    rerender(<SearchField label="搜索收藏" />);
    expect(container.querySelector('.ds-search')).not.toHaveClass('ds-search--pill');
  });

  it('是 search 输入，名称优先取 label，其次 placeholder，最后用默认文案', () => {
    const { rerender } = render(<SearchField label="搜索项目" placeholder="按名称查找" />);
    expect(screen.getByRole('searchbox', { name: '搜索项目' })).toBeInTheDocument();
    rerender(<SearchField placeholder="按名称查找" />);
    expect(screen.getByRole('searchbox', { name: '按名称查找' })).toBeInTheDocument();
    rerender(<SearchField />);
    expect(screen.getByRole('searchbox', { name: '搜索' })).toBeInTheDocument();
  });

  it('输入触发原生 onChange，其余输入属性透传', async () => {
    const onChange = vi.fn();
    render(<SearchField label="搜索" onChange={onChange} maxLength={8} />);
    const input = screen.getByRole('searchbox', { name: '搜索' });
    await userEvent.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(input).toHaveValue('abc');
    expect(input).toHaveAttribute('maxlength', '8');
  });
});

describe('SidebarAddButton', () => {
  it('默认名称为“新增”，可自定义，点击回调且不提交外层表单', async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <SidebarAddButton onClick={onClick} />
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: '新增' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <form onSubmit={onSubmit}>
        <SidebarAddButton label="新建项目" onClick={onClick} />
      </form>,
    );
    expect(screen.getByRole('button', { name: '新建项目' })).toBeInTheDocument();
  });
});

describe('Sidebar / SplitLayout', () => {
  it('只有搜索时不保留空标题行，列表头像插槽不改变选择行为', async () => {
    const select = vi.fn();
    const { container } = render(
      <Sidebar aria-label="联系人" search={<SearchField label="搜索联系人" />}>
        <List>
          <ListItem title="同事" leading={<span aria-hidden="true">头像</span>} onSelect={select} />
        </List>
      </Sidebar>,
    );
    expect(container.querySelector('.ds-sidebar-head')).toBeNull();
    expect(screen.getByRole('searchbox', { name: '搜索联系人' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '同事' }));
    expect(select).toHaveBeenCalledOnce();
  });
  it('侧栏渲染标题、计数、操作、搜索、列表与底部', () => {
    render(
      <Sidebar
        aria-label="项目列表"
        title="项目"
        count={3}
        actions={<button>新增</button>}
        search={<SearchField label="搜索项目" />}
        footer={<span>共 3 项</span>}
      >
        <p>列表内容</p>
      </Sidebar>,
    );
    const aside = screen.getByRole('complementary', { name: '项目列表' });
    expect(aside).toHaveTextContent('项目');
    expect(aside).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '搜索项目' })).toBeInTheDocument();
    expect(screen.getByText('列表内容')).toBeInTheDocument();
    expect(screen.getByText('共 3 项')).toBeInTheDocument();
  });

  it('没有计数、操作与底部时不渲染对应容器', () => {
    const { container } = render(<Sidebar title="项目">内容</Sidebar>);
    expect(container.querySelector('.ds-count')).toBeNull();
    expect(container.querySelector('.ds-sidebar-actions')).toBeNull();
    expect(container.querySelector('.ds-sidebar-footer')).toBeNull();
  });

  it('两栏布局把侧栏放在主区之前，并合并 className', () => {
    const { container } = render(
      <SplitLayout className="custom" sidebar={<aside>侧栏</aside>}>
        <p>主区</p>
      </SplitLayout>,
    );
    const split = container.firstElementChild as HTMLElement;
    expect(split).toHaveClass('ds-split', 'custom');
    expect(split.children[0]).toHaveTextContent('侧栏');
    expect(split.children[1]).toHaveClass('ds-split-main');
    expect(split.children[1]).toHaveTextContent('主区');
  });
});

describe('Workspace / Scrollable', () => {
  it('Workspace 提供根容器与公共滚动条类，Scrollable 只启用滚动条样式', () => {
    const { container } = render(
      <Workspace data-testid="root">
        <Scrollable className="area">内容</Scrollable>
      </Workspace>,
    );
    expect(screen.getByTestId('root')).toHaveClass('ds-workspace', 'ds-scrollable');
    expect(container.querySelector('.area')).toHaveClass('ds-scrollable');
    expect(container.querySelector('.area')).not.toHaveClass('ds-workspace');
  });

  it('支持 surface="ambient" 为包含工具栏的工作区整体启用浅雾微光背景', () => {
    const { container, rerender } = render(<Workspace>内容</Workspace>);
    expect(container.firstElementChild).toHaveClass('ds-workspace');
    expect(container.firstElementChild).not.toHaveClass('ds-workspace--ambient');
    rerender(<Workspace surface="ambient">内容</Workspace>);
    expect(container.firstElementChild).toHaveClass('ds-workspace', 'ds-workspace--ambient');
  });
});

describe('DocumentPane', () => {
  it('默认不附加 ambient 背景类，设置 surface="ambient" 后启用浅雾微光工作台背景', () => {
    const { container, rerender } = render(<DocumentPane>内容</DocumentPane>);
    expect(container.firstElementChild).toHaveClass('ds-document');
    expect(container.firstElementChild).not.toHaveClass('ds-document--ambient');
    rerender(<DocumentPane surface="ambient">内容</DocumentPane>);
    expect(container.firstElementChild).toHaveClass('ds-document', 'ds-document--ambient');
  });
});

describe('SettingsRow', () => {
  it('渲染组标题与可选问号悬停提示且不改变组名称', () => {
    const { rerender } = render(
      <SettingsRow label="启用 AI 写作助手" tip="开启编辑区悬浮选区优化与表单智能补全">
        <input type="checkbox" role="switch" aria-label="启用 AI 写作助手" />
      </SettingsRow>,
    );
    expect(screen.getByRole('group', { name: '启用 AI 写作助手' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '开启编辑区悬浮选区优化与表单智能补全' })).toBeInTheDocument();
    rerender(
      <SettingsRow label="启用 AI 写作助手">
        <input type="checkbox" role="switch" aria-label="启用 AI 写作助手" />
      </SettingsRow>,
    );
    expect(screen.queryByRole('img', { name: '开启编辑区悬浮选区优化与表单智能补全' })).toBeNull();
  });
});
