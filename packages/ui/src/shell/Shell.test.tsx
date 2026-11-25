import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppIcon } from './AppIcon';
import { Desktop, useDesktop } from './Desktop';
import { Dock, DockItem } from './Dock';
import { MenuBar, MenuBarApp } from './MenuBar';
import { Notification, Popover } from './Overlay';
import { Calendar } from './Pickers';
import { Window, WindowControls, WindowTitlebar } from './Window';

describe('WindowControls', () => {
  it('macOS：关闭在前；Windows：关闭在后', () => {
    const { rerender } = render(<WindowControls platform="macos" />);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      '关闭窗口',
      '最小化窗口',
      '最大化窗口',
    ]);
    rerender(<WindowControls platform="windows" />);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      '最小化窗口',
      '最大化窗口',
      '关闭窗口',
    ]);
  });

  it('最大化状态下按钮名称为还原并标记 aria-pressed', () => {
    render(<WindowControls platform="macos" maximized />);
    expect(screen.getByRole('button', { name: '还原窗口' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('点击回调对应动作', async () => {
    const onClose = vi.fn();
    render(<WindowControls platform="macos" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: '关闭窗口' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('按平台顺序显示指定控件', () => {
    const { rerender } = render(<WindowControls platform="macos" controls={['close']} />);
    const closeButton = screen.getByRole('button', { name: '关闭窗口' });
    expect(closeButton).toHaveAttribute('data-window-action', 'close');
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['关闭窗口']);
    rerender(<WindowControls platform="windows" controls={['close', 'minimize']} />);
    expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
      '最小化窗口',
      '关闭窗口',
    ]);
    expect(screen.getByRole('button', { name: '最小化窗口' })).toHaveAttribute('data-window-action', 'minimize');
  });
});

describe('Window', () => {
  const geometry = { x: 10, y: 10, width: 400, height: 300 };

  it('以标题命名，使用所在 Desktop 的窗口平台，最小化时 aria-hidden', () => {
    render(
      <Desktop windowPlatform="windows">
        <Window title="设置" geometry={geometry} minimized>
          内容
        </Window>
      </Desktop>,
    );
    // aria-hidden 的元素在 dom-accessibility-api 中名称为空，改为直接检查 aria-label。
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-label', '设置');
    expect(dialog).toHaveAttribute('data-platform', 'windows');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
  });

  it('双击标题栏触发最大化切换', () => {
    const onToggleMaximize = vi.fn();
    render(
      <Window title="设置" geometry={geometry} onToggleMaximize={onToggleMaximize}>
        内容
      </Window>,
    );
    fireEvent.doubleClick(screen.getByRole('button', { name: '关闭窗口' }));
    expect(onToggleMaximize).not.toHaveBeenCalled();
    fireEvent.doubleClick(screen.getByText('设置'));
    expect(onToggleMaximize).toHaveBeenCalledTimes(1);
  });
});

describe('WindowTitlebar', () => {
  it('可保留原生 header 根标签并保持控件和标题为直接子节点', () => {
    render(
      <Desktop>
        <WindowTitlebar as="header" title="智能补全" controls={['close']} />
      </Desktop>,
    );
    const titlebar = screen.getByText('智能补全').parentElement;
    expect(titlebar?.tagName).toBe('HEADER');
    expect(titlebar?.children).toHaveLength(2);
    expect(titlebar?.firstElementChild).toHaveAttribute('aria-label', '窗口控制');
    expect(titlebar?.firstElementChild).toHaveClass('ds-window-controls', 'window-controls', 'traffic');
    expect(titlebar?.querySelector('[data-window-action="close"]')).toHaveClass('is-close', 't-close');
  });

  it('独立标题栏显式平台优先于外层桌面，并同步到控件', () => {
    render(
      <Desktop windowPlatform="windows">
        <WindowTitlebar title="macOS 示例" platform="macos" aria-label="macOS 标题栏" />
        <WindowTitlebar title="Windows 示例" platform="windows" aria-label="Windows 标题栏" />
      </Desktop>,
    );
    const mac = screen.getByLabelText('macOS 标题栏');
    const windows = screen.getByLabelText('Windows 标题栏');
    expect(mac).toHaveAttribute('data-platform', 'macos');
    expect(windows).toHaveAttribute('data-platform', 'windows');
    expect(within(mac).getByRole('group', { name: '窗口控制' })).toHaveAttribute('data-platform', 'macos');
    expect(within(windows).getByRole('group', { name: '窗口控制' })).toHaveAttribute('data-platform', 'windows');
  });

  it('内嵌桌面中的窗口标题栏读取最近桌面的平台', () => {
    render(
      <Desktop windowPlatform="windows">
        <Window title="外层窗口" geometry={{ x: 0, y: 0, width: 600, height: 400 }}>
          <Desktop windowPlatform="macos">
            <Window title="内层窗口" geometry={{ x: 0, y: 0, width: 360, height: 240 }}>
              内容
            </Window>
          </Desktop>
        </Window>
      </Desktop>,
    );
    expect(screen.getByText('外层窗口').parentElement).toHaveAttribute('data-platform', 'windows');
    expect(screen.getByText('内层窗口').parentElement).toHaveAttribute('data-platform', 'macos');
  });
});

describe('AppIcon / DockItem', () => {
  it('Enter 打开桌面图标，点击选中', async () => {
    const onOpen = vi.fn();
    const onSelect = vi.fn();
    render(<AppIcon variant="desktop" label="表单" icon="text-cursor-input" onOpen={onOpen} onSelect={onSelect} />);
    const icon = screen.getByRole('button', { name: '表单' });
    await userEvent.click(icon);
    expect(onSelect).toHaveBeenCalledTimes(1);
    icon.focus();
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('Dock 项运行中显示指示点样式', () => {
    render(
      <DockItem label="布局" running>
        <AppIcon icon="layout-grid" />
      </DockItem>,
    );
    expect(screen.getByRole('button', { name: '布局' })).toHaveClass('is-running');
  });
});

describe('Popover', () => {
  const anchor = createRef<HTMLButtonElement>();
  it('Esc 与外部点击关闭，点击触发按钮不算外部', async () => {
    const onClose = vi.fn();
    render(
      <>
        <button ref={anchor}>触发</button>
        <button>外部</button>
        <Popover anchor={anchor} open onClose={onClose}>
          菜单
        </Popover>
      </>,
    );
    await userEvent.click(screen.getByText('触发'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('外部'));
    expect(onClose).toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('关闭时不渲染', () => {
    render(
      <Popover anchor={anchor} open={false}>
        菜单
      </Popover>,
    );
    expect(screen.queryByText('菜单')).not.toBeInTheDocument();
  });
});

describe('Calendar', () => {
  it('显示当月并高亮今天，翻月后更新标题', async () => {
    render(<Calendar today={new Date(2026, 10, 4)} />);
    expect(screen.getByText('2026 年 11 月')).toBeInTheDocument();
    expect(document.querySelector('.is-today')).toHaveTextContent('4');
    await userEvent.click(screen.getByRole('button', { name: '下个月' }));
    expect(screen.getByText('2026 年 12 月')).toBeInTheDocument();
  });
});

function CardStyleProbe({ label }: { label: string }) {
  const { cardStyle } = useDesktop();
  return <span data-testid={label}>{cardStyle}</span>;
}

describe('Desktop cardStyle', () => {
  it('默认为毛玻璃，支持切换液态玻璃且嵌套桌面互不泄漏', () => {
    const { container } = render(
      <Desktop>
        <CardStyleProbe label="default-desktop" />
        <Desktop cardStyle="liquid">
          <CardStyleProbe label="liquid-desktop" />
          <Desktop cardStyle="frosted">
            <CardStyleProbe label="nested-frosted" />
          </Desktop>
        </Desktop>
      </Desktop>,
    );
    const desktops = container.querySelectorAll('.ds-desktop');
    expect(desktops[0]).toHaveAttribute('data-card-style', 'frosted');
    expect(desktops[1]).toHaveAttribute('data-card-style', 'liquid');
    expect(desktops[2]).toHaveAttribute('data-card-style', 'frosted');
    expect(screen.getByTestId('default-desktop')).toHaveTextContent('frosted');
    expect(screen.getByTestId('liquid-desktop')).toHaveTextContent('liquid');
    expect(screen.getByTestId('nested-frosted')).toHaveTextContent('frosted');
  });

  it('液态玻璃桌面为系统栏、Dock 与浮层保留作用域隔离及嵌套回退', () => {
    const anchor = createRef<HTMLButtonElement>();
    const { container } = render(
      <Desktop cardStyle="liquid" dockStyle="windows">
        <MenuBar
          left={
            <button ref={anchor} type="button">
              系统菜单
            </button>
          }
        />
        <Dock>
          <DockItem label="文件管理">
            <AppIcon icon="folder" />
          </DockItem>
        </Dock>
        <Popover anchor={anchor} open>
          <div>弹出菜单项</div>
        </Popover>
        <Notification title="系统消息" message="完成" variant="inline" />
        <Desktop cardStyle="frosted" dockStyle="macos">
          <MenuBar left={<MenuBarApp>示例桌面</MenuBarApp>} />
          <Dock>
            <DockItem label="示例应用">
              <AppIcon icon="folder" />
            </DockItem>
          </Dock>
        </Desktop>
      </Desktop>,
    );
    const desktops = container.querySelectorAll('.ds-desktop');
    expect(desktops[0]).toHaveAttribute('data-card-style', 'liquid');
    expect(desktops[0]).toHaveAttribute('data-dock-style', 'windows');
    expect(screen.getByText('弹出菜单项').closest('.ds-popover')?.closest('.ds-desktop')).toBe(desktops[0]);
    expect(screen.getByText('系统消息').closest('button')).toHaveClass('ds-notification--inline');
    expect(screen.getByText('系统消息').closest('.ds-desktop')).toBe(desktops[0]);
    expect(desktops[1]).toHaveAttribute('data-card-style', 'frosted');
    expect(desktops[1]).toHaveAttribute('data-dock-style', 'macos');
    expect(screen.getByText('示例桌面').closest('.ds-desktop')).toBe(desktops[1]);
    expect(screen.getByRole('button', { name: '示例应用' }).closest('.ds-desktop')).toBe(desktops[1]);
  });
});
