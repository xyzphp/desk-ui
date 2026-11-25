import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef, useState } from 'react';
import {
  MenuItem, Notification, NotificationStack, Popover, PopoverTitle,
} from './Overlay';
import { ContextMenu, ContextMenuDivider, ContextMenuItem, ContextMenuSubmenu } from './ContextMenu';
import { WallpaperPicker } from './Pickers';

const anchor = createRef<HTMLButtonElement>();

function NestedMenu({ onPick, onClose }: { onPick?: () => void; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)}>打开右键菜单</button>
    <button>菜单外部</button>
    {open && <ContextMenu x={12} y={34} aria-label="桌面菜单" onClose={() => { setOpen(false); onClose?.(); }}>
      <ContextMenuSubmenu label="查看">
        <ContextMenuItem disabled>不可用</ContextMenuItem>
        <ContextMenuSubmenu label="图标大小">
          <ContextMenuItem checked checkRole="radio" onClick={onPick}>中图标</ContextMenuItem>
          <ContextMenuItem checked={false} checkRole="radio">大图标</ContextMenuItem>
        </ContextMenuSubmenu>
      </ContextMenuSubmenu>
      <ContextMenuSubmenu label="背景"><ContextMenuItem>壁纸</ContextMenuItem></ContextMenuSubmenu>
      <ContextMenuItem>刷新</ContextMenuItem>
    </ContextMenu>}
  </>;
}

describe('Popover', () => {
  it('系统变体沿用菜单键盘、禁用跳过与动作关闭', async () => {
    const close = vi.fn();
    const pick = vi.fn();
    render(<Popover anchor={anchor} open variant="system" aria-label="系统操作" onClose={close}>
      <MenuItem>关于</MenuItem><MenuItem disabled>不可用</MenuItem><MenuItem onClick={pick}>退出登录</MenuItem>
    </Popover>);
    expect(screen.getByRole('menu', { name: '系统操作' })).toHaveClass('ds-popover--system');
    expect(screen.getByRole('menuitem', { name: '关于' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(pick).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('传入内联回调并重新渲染时不重复绑定文档监听', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const { rerender } = render(<Popover anchor={anchor} open onClose={() => {}}>内容</Popover>);
    const count = add.mock.calls.length;
    rerender(<Popover anchor={anchor} open onClose={() => {}}>内容</Popover>);
    expect(add.mock.calls.length).toBe(count);
    add.mockRestore();
  });

  it('菜单变体使用 menu 角色，控制中心与日历使用 dialog', () => {
    const { rerender } = render(<Popover anchor={anchor} open aria-label="系统菜单"><PopoverTitle>标题</PopoverTitle><MenuItem>关于</MenuItem></Popover>);
    expect(screen.getByRole('menu', { name: '系统菜单' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '关于' })).toBeInTheDocument();
    rerender(<Popover anchor={anchor} open variant="control" aria-label="控制中心">内容</Popover>);
    expect(screen.getByRole('dialog', { name: '控制中心' })).toHaveClass('ds-popover--control');
  });
});

describe('ContextMenu', () => {
  it('壁纸缩略图为装饰，未选项保留右侧勾选槽', () => {
    render(<ContextMenu x={12} y={34} aria-label="桌面背景">
      <ContextMenuItem wallpaper="sequoia" checked checkRole="radio">红杉</ContextMenuItem>
      <ContextMenuItem wallpaper="sonoma" checked={false} checkRole="radio">索诺玛</ContextMenuItem>
    </ContextMenu>);
    const redwood = screen.getByRole('menuitemradio', { name: '红杉', checked: true });
    expect(redwood.querySelector('.ds-context-wallpaper')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('menuitemradio', { name: '索诺玛', checked: false }).querySelector('.ds-context-check')).toBeEmptyDOMElement();
  });
  it('按位置摆放，显示勾选与快捷键', () => {
    render(
      <ContextMenu x={12} y={34} aria-label="桌面菜单">
        <ContextMenuItem checked shortcut="⌘N">新建</ContextMenuItem>
        <ContextMenuDivider />
        <ContextMenuItem icon="settings" disabled>设置</ContextMenuItem>
      </ContextMenu>,
    );
    const menu = screen.getByRole('menu', { name: '桌面菜单' });
    expect(menu).toHaveStyle({ left: '12px', top: '34px' });
    expect(screen.getByRole('menuitemcheckbox', { name: /新建/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '设置' })).toBeDisabled();
  });

  it('动作执行后关闭，Esc 与点击外部也请求关闭', async () => {
    const onClose = vi.fn();
    const onPick = vi.fn();
    render(
      <>
        <button>外部</button>
        <ContextMenu x={0} y={0} onClose={onClose}><ContextMenuItem onClick={onPick}>刷新</ContextMenuItem></ContextMenu>
      </>,
    );
    await userEvent.click(screen.getByRole('menuitem', { name: '刷新' }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText('外部'));
    expect(onClose).toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('方向键逐级进入和返回，Esc 关闭整棵菜单并回到触发器', async () => {
    const close = vi.fn();
    render(<NestedMenu onClose={close} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: '打开右键菜单' });
    await user.click(trigger);
    const view = screen.getByRole('menuitem', { name: '查看' });
    expect(view).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    const size = screen.getByRole('menuitem', { name: '图标大小' });
    expect(size).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: '大图标', checked: false })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(size).toHaveFocus();
    expect(screen.queryByRole('menu', { name: '图标大小' })).not.toBeInTheDocument();
    expect(view).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('右键展开多级分支，菜单内右键不会打开浏览器菜单或重新触发桌面菜单', async () => {
    const outside = vi.fn(), close = vi.fn(), pick = vi.fn();
    render(<div onContextMenu={outside}><NestedMenu onClose={close} onPick={pick} /></div>);
    await userEvent.click(screen.getByRole('button', { name: '打开右键菜单' }));
    expect(fireEvent.contextMenu(screen.getByRole('menuitem', { name: '查看' }), { button: 2 })).toBe(false);
    const size = screen.getByRole('menuitem', { name: '图标大小' });
    expect(size).toHaveFocus();
    expect(fireEvent.contextMenu(size, { button: 2 })).toBe(false);
    const medium = screen.getByRole('menuitemradio', { name: '中图标' });
    expect(medium).toHaveFocus();
    expect(fireEvent.contextMenu(medium, { button: 2 })).toBe(false);
    expect(screen.getByRole('menu', { name: '图标大小' })).toBeInTheDocument();
    expect(outside).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(pick).not.toHaveBeenCalled();
  });

  it('悬停切换分支与焦点移动发生在同一批更新时保留新分支', async () => {
    render(<NestedMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '打开右键菜单' }));
    await user.keyboard('{ArrowRight}');
    const background = screen.getByRole('menuitem', { name: '背景' });
    act(() => {
      fireEvent.pointerOver(background, { pointerType: 'mouse' });
      fireEvent.mouseMove(background);
    });
    expect(background).toHaveFocus();
    expect(screen.getByRole('menu', { name: '背景' })).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: '查看' })).not.toBeInTheDocument();
  });

  it('移向子菜单时途经父菜单普通项，已展开的子菜单保持打开', async () => {
    const pick = vi.fn();
    render(<NestedMenu onPick={pick} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '打开右键菜单' }));
    await user.hover(screen.getByRole('menuitem', { name: '查看' }));
    await user.hover(screen.getByRole('menuitem', { name: '刷新' }));
    await user.hover(screen.getByRole('menuitem', { name: '图标大小' }));
    await user.click(screen.getByRole('menuitemradio', { name: '中图标' }));
    expect(pick).toHaveBeenCalledTimes(1);
  });

  it('悬停切换同级分支，执行子项或从子菜单按 Tab 只关闭一次', async () => {
    const close = vi.fn(), pick = vi.fn();
    render(<NestedMenu onClose={close} onPick={pick} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: '打开右键菜单' });
    await user.click(trigger);
    await user.hover(screen.getByRole('menuitem', { name: '查看' }));
    expect(screen.getByRole('menu', { name: '查看' })).toBeInTheDocument();
    await user.hover(screen.getByRole('menuitem', { name: '背景' }));
    expect(screen.queryByRole('menu', { name: '查看' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '壁纸' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: '查看' }));
    await user.click(screen.getByRole('menuitem', { name: '图标大小' }));
    await user.click(screen.getByRole('menuitemradio', { name: '中图标', checked: true }));
    expect(pick).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    await user.click(trigger);
    await user.keyboard('{ArrowRight}{ArrowRight}');
    await user.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '菜单外部' })).toHaveFocus();
    expect(close).toHaveBeenCalledTimes(2);
  });
});

describe('WallpaperPicker', () => {
  it('自定义图块独占选中状态，保存期间一起禁用', () => {
    const onChange = vi.fn(), open = vi.fn();
    const { rerender } = render(<WallpaperPicker value="sequoia" onChange={onChange} custom={{ onClick: open }} />);
    fireEvent.click(screen.getByRole('button', { name: '添加自定义壁纸', pressed: false }));
    expect(open).toHaveBeenCalledTimes(1);
    rerender(<WallpaperPicker value="sequoia" disabled onChange={onChange} custom={{ url: '/wallpaper.jpg', onClick: open }} />);
    const picker = within(screen.getByRole('group', { name: '桌面壁纸' }));
    expect(picker.getByRole('button', { name: '使用自定义壁纸', pressed: true })).toBeDisabled();
    expect(picker.getByRole('button', { name: '红杉', pressed: false })).toBeDisabled();
    expect(picker.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });
});

describe('NotificationStack / Notification', () => {
  it('堆叠容器是礼貌的实时区域，点击通知回调来源定位', async () => {
    const onActivate = vi.fn();
    const { container } = render(
      <NotificationStack>
        <Notification title="新消息" message="有 2 条未读" app={{ glyph: '✉' }} onActivate={onActivate} />
      </NotificationStack>,
    );
    expect(container.firstElementChild).toHaveAttribute('aria-live', 'polite');
    await userEvent.click(screen.getByRole('button', { name: /新消息/ }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('没有正文时不渲染空段落', () => {
    render(<Notification title="已保存" />);
    const button = screen.getByRole('button', { name: '已保存' });
    expect(button.querySelector('p')).toBeNull();
  });
});
