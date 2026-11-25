import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppIcon } from './AppIcon';
import { Dock, DockItem, DockSeparator } from './Dock';
import { Desktop } from './Desktop';
import { MenuBar, MenuBarApp, MenuBarClock, MenuBarIconButton, MenuBarLogo } from './MenuBar';

describe('MenuBar', () => {
  it('头像失败依次回退站点图、默认图和插槽；新头像可重新加载', () => {
    const props = { 'aria-label': '系统菜单', image: '/site.png', fallbackImage: '/default.png' };
    const { rerender } = render(
      <MenuBarLogo {...props} avatar="/avatar.png">
        图标
      </MenuBarLogo>,
    );
    const image = () => screen.getByRole('button', { name: '系统菜单' }).querySelector('img')!;
    expect(image()).toHaveAttribute('src', '/avatar.png');
    expect(image()).toHaveClass('is-avatar');
    fireEvent.error(image());
    expect(image()).toHaveAttribute('src', '/site.png');
    expect(image()).not.toHaveClass('is-avatar');
    fireEvent.error(image());
    expect(image()).toHaveAttribute('src', '/default.png');
    fireEvent.error(image());
    expect(screen.getByRole('button', { name: '系统菜单' })).toHaveTextContent('图标');
    rerender(
      <MenuBarLogo {...props} avatar="/new-avatar.png">
        图标
      </MenuBarLogo>,
    );
    expect(image()).toHaveAttribute('src', '/new-avatar.png');
    rerender(
      <MenuBarLogo {...props} avatar="javascript:alert(1)">
        图标
      </MenuBarLogo>,
    );
    expect(image()).toHaveAttribute('src', '/site.png');
  });
  it('左中右三区放置各自内容，并保留 header 地标', () => {
    render(
      <MenuBar
        aria-label="菜单栏"
        left={
          <>
            <MenuBarLogo aria-label="系统菜单" />
            <MenuBarApp>设置</MenuBarApp>
          </>
        }
        center={<span>模式</span>}
        right={<MenuBarClock date="11 月 5 日" time="09:30" />}
      />,
    );
    const bar = screen.getByRole('banner', { name: '菜单栏' });
    expect(within(bar).getByRole('button', { name: '系统菜单' })).toBeInTheDocument();
    expect(within(bar).getByText('设置')).toBeInTheDocument();
    expect(within(bar).getByText('模式')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: '日期与时间' })).toHaveTextContent('09:30');
  });

  it('标志按钮标记激活态，图标按钮用 label 命名并回调点击', async () => {
    const onClick = vi.fn();
    render(
      <>
        <MenuBarLogo active aria-label="系统菜单" />
        <MenuBarIconButton icon="sun" label="切换主题" onClick={onClick} />
      </>,
    );
    expect(screen.getByRole('button', { name: '系统菜单' })).toHaveClass('is-active');
    const theme = screen.getByRole('button', { name: '切换主题' });
    expect(theme).toHaveAttribute('title', '切换主题');
    expect(theme).toHaveAttribute('type', 'button');
    await userEvent.click(theme);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Dock', () => {
  it('提供带名称的页脚地标，隐藏时标记 is-hidden', () => {
    const { rerender } = render(
      <Dock>
        <DockItem label="设置">
          <AppIcon icon="settings" />
        </DockItem>
      </Dock>,
    );
    expect(screen.getByRole('contentinfo', { name: 'Dock 栏' })).not.toHaveClass('is-hidden');
    rerender(
      <Dock hidden>
        <DockItem label="设置">
          <AppIcon icon="settings" />
        </DockItem>
      </Dock>,
    );
    expect(screen.getByRole('contentinfo', { name: 'Dock 栏' })).toHaveClass('is-hidden');
  });

  it('Dock 项支持点击与 Enter / 空格激活，分隔线有 separator 角色', async () => {
    const onActivate = vi.fn();
    render(
      <Dock>
        <DockItem label="文件" onActivate={onActivate}>
          <AppIcon icon="folder" />
        </DockItem>
        <DockSeparator />
      </Dock>,
    );
    const item = screen.getByRole('button', { name: '文件' });
    await userEvent.click(item);
    item.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onActivate).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('macOS 风格指针放大邻近图标，离开后恢复；Windows 任务栏不放大', () => {
    const rects = [0, 60, 120, 400];
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const index = Number(this.dataset.index ?? -1);
      const left = rects[index] ?? 0;
      return {
        left,
        right: left + 54,
        width: 54,
        top: 0,
        bottom: 54,
        height: 54,
        x: left,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const dock = (style: 'macos' | 'windows') => (
      <Desktop dockStyle={style}>
        <Dock>
          {rects.map((_, index) => (
            <DockItem key={index} label={`应用${index}`} data-index={index}>
              <AppIcon icon="folder" />
            </DockItem>
          ))}
        </Dock>
      </Desktop>
    );
    const { rerender, container } = render(dock('macos'));
    const group = container.querySelector('.ds-dock')!;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>('.ds-dock-item'));
    fireEvent.mouseEnter(group, { clientX: 27 });
    expect(parseFloat(items()[0]!.style.width)).toBeCloseTo(84, 0);
    expect(parseFloat(items()[1]!.style.width)).toBeGreaterThan(54);
    expect(parseFloat(items()[0]!.style.width)).toBeGreaterThan(parseFloat(items()[1]!.style.width));
    expect(items()[3]!.style.width).toBe('54px');
    expect(parseFloat((items()[0]!.firstElementChild as HTMLElement).style.fontSize)).toBeCloseTo(84 * 0.48, 1);
    expect((items()[0]!.firstElementChild as HTMLElement).style.getPropertyValue('--ds-app-icon-size')).toBe('84px');
    fireEvent.mouseLeave(group);
    expect(items().every((item) => item.style.width === '' && item.style.height === '')).toBe(true);
    expect((items()[0]!.firstElementChild as HTMLElement).style.getPropertyValue('--ds-app-icon-size')).toBe('');
    rerender(dock('windows'));
    fireEvent.mouseMove(container.querySelector('.ds-dock')!, { clientX: 27 });
    expect(items().every((item) => item.style.width === '')).toBe(true);
    mock.mockRestore();
  });

  it('keeps base item centers while hovered items expand', () => {
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const item = this as HTMLElement;
      const index = Number(item.dataset.index);
      const left = index === 0 ? 0 : 60;
      return {
        left,
        right: left + 54,
        width: 54,
        top: 0,
        bottom: 54,
        height: 54,
        x: left,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const { container } = render(
      <Desktop dockStyle="macos">
        <Dock>
          <DockItem label="文件" data-index="0">
            <AppIcon icon="folder" />
          </DockItem>
          <DockItem label="设置" data-index="1">
            <AppIcon icon="settings" />
          </DockItem>
        </Dock>
      </Desktop>,
    );
    const group = container.querySelector('.ds-dock')!;
    const items = container.querySelectorAll<HTMLElement>('.ds-dock-item');
    fireEvent.mouseEnter(group, { clientX: 27 });
    expect(mock).toHaveBeenCalledTimes(2);
    fireEvent.mouseMove(group, { clientX: 87 });
    expect(mock).toHaveBeenCalledTimes(2);
    expect(items[1]!.style.width).toBe('84px');
    mock.mockRestore();
  });

  it('itemSize 缩小基准时放大峰值与感应范围等比缩放', () => {
    const rects = [0, 60, 120, 400];
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const index = Number(this.dataset.index ?? -1);
      const left = rects[index] ?? 0;
      return {
        left,
        right: left + 54,
        width: 54,
        top: 0,
        bottom: 54,
        height: 54,
        x: left,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const { container } = render(
      <Desktop dockStyle="macos">
        <Dock itemSize={44}>
          {rects.map((_, index) => (
            <DockItem key={index} label={`应用${index}`} data-index={index}>
              <AppIcon icon="folder" />
            </DockItem>
          ))}
        </Dock>
      </Desktop>,
    );
    const group = container.querySelector('.ds-dock')!;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>('.ds-dock-item'));
    fireEvent.mouseEnter(group, { clientX: 27 });
    expect(parseFloat(items()[0]!.style.width)).toBeCloseTo(68, 0);
    expect(items()[3]!.style.width).toBe('44px');
    mock.mockRestore();
  });

  it('减少动态效果时仍按指针位置调整 Dock 尺寸', () => {
    const matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 54,
      width: 54,
      top: 0,
      bottom: 54,
      height: 54,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    try {
      const { container, unmount } = render(
        <Desktop dockStyle="macos">
          <Dock>
            <DockItem label="文件">
              <AppIcon icon="folder" />
            </DockItem>
          </Dock>
        </Desktop>,
      );
      fireEvent.mouseEnter(container.querySelector('.ds-dock')!, { clientX: 27 });
      expect(container.querySelector<HTMLElement>('.ds-dock-item')!.style.width).toBe('84px');
      unmount();
    } finally {
      mock.mockRestore();
      if (matchMediaDescriptor) Object.defineProperty(window, 'matchMedia', matchMediaDescriptor);
      else Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('隐藏 Dock 时清除放大尺寸', () => {
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 54,
      width: 54,
      top: 0,
      bottom: 54,
      height: 54,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const tree = (hidden: boolean) => (
      <Desktop dockStyle="macos">
        <Dock hidden={hidden}>
          <DockItem label="文件">
            <AppIcon icon="folder" />
          </DockItem>
        </Dock>
      </Desktop>
    );
    const { rerender, container } = render(tree(false));
    fireEvent.mouseMove(container.querySelector('.ds-dock')!, { clientX: 27 });
    expect(container.querySelector<HTMLElement>('.ds-dock-item')!.style.width).not.toBe('');
    rerender(tree(true));
    expect(container.querySelector<HTMLElement>('.ds-dock-item')!.style.width).toBe('');
    mock.mockRestore();
  });

  it('应用由未运行变为运行时跳动并在 1.2 秒后停止；首次已运行不跳', () => {
    vi.useFakeTimers();
    const item = (running: boolean) => (
      <Dock>
        <DockItem label="文件" running={running}>
          <AppIcon icon="folder" />
        </DockItem>
      </Dock>
    );
    const { rerender } = render(item(true));
    expect(screen.getByRole('button', { name: '文件' })).not.toHaveClass('is-bouncing');
    rerender(item(false));
    rerender(item(true));
    expect(screen.getByRole('button', { name: '文件' })).toHaveClass('is-bouncing');
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByRole('button', { name: '文件' })).not.toHaveClass('is-bouncing');
    vi.useRealTimers();
  });

  it('恢复已有窗口时（bounceOnLaunch 为 false）由未运行变为运行不跳动', () => {
    const item = (running: boolean) => (
      <Dock>
        <DockItem label="文件" running={running} bounceOnLaunch={false}>
          <AppIcon icon="folder" />
        </DockItem>
      </Dock>
    );
    const { rerender } = render(item(false));
    rerender(item(true));
    expect(screen.getByRole('button', { name: '文件' })).not.toHaveClass('is-bouncing');
  });

  it('autoHide 在 macOS 样式下默认收起，移至底边自动显示，离开后延迟收起，Windows 样式不生效', () => {
    vi.useFakeTimers();
    const mock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('ds-desktop')) {
        return {
          left: 0,
          right: 800,
          width: 800,
          top: 0,
          bottom: 600,
          height: 600,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
      return {
        left: 200,
        right: 600,
        width: 400,
        top: 520,
        bottom: 594,
        height: 74,
        x: 200,
        y: 520,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const tree = (dockStyle: 'macos' | 'windows', holdOpen = false) => (
      <Desktop dockStyle={dockStyle}>
        <Dock autoHide holdOpen={holdOpen}>
          <DockItem label="文件">
            <AppIcon icon="folder" />
          </DockItem>
        </Dock>
      </Desktop>
    );
    try {
      const { container, rerender } = render(tree('macos'));
      const desktop = container.querySelector('.ds-desktop')!;
      const footer = () => screen.getByRole('contentinfo', { name: 'Dock 栏' });
      expect(footer()).toHaveClass('is-hidden');
      expect(footer()).toHaveAttribute('inert');
      expect(container.querySelector('.ds-dock-edge-trigger')).not.toBeNull();

      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 595, buttons: 0 });
      expect(footer()).not.toHaveClass('is-hidden');
      expect(footer()).not.toHaveAttribute('inert');

      const dockButton = screen.getByRole('button', { name: '文件' });
      fireEvent.pointerDown(dockButton);
      fireEvent.focus(dockButton);
      fireEvent.pointerUp(dockButton);
      fireEvent.click(dockButton);
      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 200, buttons: 0 });
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(footer()).toHaveClass('is-hidden');

      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 595, buttons: 0 });
      expect(footer()).not.toHaveClass('is-hidden');
      fireEvent.keyDown(dockButton, { key: 'Tab' });
      fireEvent.focus(dockButton);
      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 200, buttons: 0 });
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(footer()).not.toHaveClass('is-hidden');
      fireEvent.blur(dockButton, { relatedTarget: null });
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(footer()).toHaveClass('is-hidden');

      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 595, buttons: 0 });
      expect(footer()).not.toHaveClass('is-hidden');

      rerender(tree('macos', true));
      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 200, buttons: 0 });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(footer()).not.toHaveClass('is-hidden');

      rerender(tree('macos', false));
      fireEvent.mouseMove(desktop, { clientX: 300, clientY: 200, buttons: 0 });
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(footer()).toHaveClass('is-hidden');

      rerender(tree('windows'));
      expect(footer()).not.toHaveClass('is-hidden');
    } finally {
      mock.mockRestore();
      vi.useRealTimers();
    }
  });
});
