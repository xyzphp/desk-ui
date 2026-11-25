import { StrictMode, useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnchorPopover } from './AnchorPopover';
import { floatingPosition } from './floatingPosition';
import { MenuItem, Popover } from '../shell/Overlay';
import { ContextMenu, ContextMenuItem } from '../shell/ContextMenu';

describe('floatingPosition', () => {
  it('底部不足时向上翻转，右边界夹取', () => {
    expect(
      floatingPosition(
        { left: 940, right: 980, top: 700, bottom: 730, width: 40 },
        { width: 220, height: 160 },
        { width: 1000, height: 760 },
        'bottom-start',
        6,
      ),
    ).toEqual({ left: 772, top: 534 });
  });
  it('超大面板与负坐标不产生负的位置', () => {
    expect(
      floatingPosition(
        { left: -20, right: 0, top: -20, bottom: 0, width: 20 },
        { width: 1200, height: 900 },
        { width: 320, height: 240 },
        'top-end',
        6,
      ),
    ).toEqual({ left: 8, top: 8 });
  });
  it('子菜单在锚点右侧展开，空间不足时向左翻转并限制纵向位置', () => {
    const size = { width: 220, height: 150 };
    const viewport = { width: 1000, height: 760 };
    expect(
      floatingPosition({ left: 100, right: 160, top: 50, bottom: 84, width: 60 }, size, viewport, 'right-start', 10),
    ).toEqual({ left: 170, top: 50 });
    expect(
      floatingPosition({ left: 900, right: 970, top: 700, bottom: 734, width: 70 }, size, viewport, 'right-start', 10),
    ).toEqual({ left: 670, top: 602 });
  });
});

function MenuDemo() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button ref={anchor} onClick={() => setOpen(!open)}>
        打开菜单
      </button>
      <button>外部</button>
      <Popover anchor={anchor} open={open} aria-label="操作" onClose={() => setOpen(false)}>
        <MenuItem textValue="alpha">首项</MenuItem>
        <MenuItem disabled>禁用</MenuItem>
        <MenuItem textValue="beta">末项</MenuItem>
      </Popover>
    </>
  );
}

describe('单层菜单', () => {
  it('初始焦点、跳过禁用、循环、Home / End、文字搜索和 Esc 返回', async () => {
    render(<MenuDemo />);
    const user = userEvent.setup();
    await user.click(screen.getByText('打开菜单'));
    expect(screen.getByText('首项')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('末项')).toHaveFocus();
    await user.keyboard('{ArrowDown}{End}');
    expect(screen.getByText('末项')).toHaveFocus();
    await user.keyboard('{Home}b');
    expect(screen.getByText('末项')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText('打开菜单')).toHaveFocus();
  });
  it('空格激活关闭；移出焦点关闭但不抢回焦点', async () => {
    render(<MenuDemo />);
    const user = userEvent.setup();
    await user.click(screen.getByText('打开菜单'));
    await user.keyboard(' ');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByText('打开菜单'));
    await user.click(screen.getByText('外部'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText('外部')).toHaveFocus();
  });
  it('阻止默认动作可保留勾选菜单，不回调关闭', () => {
    const close = vi.fn();
    render(
      <ContextMenu x={12} y={18} onClose={close}>
        <ContextMenuItem checked onClick={(event) => event.preventDefault()}>
          网格
        </ContextMenuItem>
      </ContextMenu>,
    );
    fireEvent.click(screen.getByRole('menuitemcheckbox'));
    expect(close).not.toHaveBeenCalled();
  });
  it('Tab 退出菜单并移动到触发器之后的控件', async () => {
    render(<MenuDemo />);
    await userEvent.click(screen.getByText('打开菜单'));
    await userEvent.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText('外部')).toHaveFocus();
  });
});

describe('AnchorPopover', () => {
  it('打开时不聚焦标记 data-initial-focus-skip 的标题栏手柄，焦点落在内容控件上', () => {
    render(
      <AnchorPopover open point={{ x: 20, y: 20 }} role="dialog" aria-label="工具窗口">
        <header tabIndex={0} data-initial-focus-skip aria-label="移动窗口" />
        <button type="button">生成</button>
      </AnchorPopover>,
    );
    expect(screen.getByRole('button', { name: '生成' })).toHaveFocus();
  });

  it('使用 section 根标签时不额外包装原生内容结构', () => {
    render(
      <AnchorPopover as="section" open point={{ x: 20, y: 20 }} role="dialog" aria-label="字段补全">
        <header data-testid="source-titlebar">智能补全</header>
        <div data-testid="source-body">字段内容</div>
      </AnchorPopover>,
    );
    const panel = screen.getByRole('dialog', { name: '字段补全' });
    expect(panel.tagName).toBe('SECTION');
    expect(panel.firstElementChild).toBe(screen.getByTestId('source-titlebar'));
    expect(panel.children).toHaveLength(2);
  });

  it('严格模式重新初始化时，隐藏浮层的原生焦点回收不会触发外部关闭', () => {
    const close = vi.fn();
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const view = render(
      <StrictMode>
        <AnchorPopover
          open
          point={{ x: 12, y: 34 }}
          aria-label="严格模式菜单"
          role="menu"
          onClose={close}
          ref={(node) => {
            if (!node) return;
            const nativeShow = HTMLElement.prototype.showPopover;
            node.showPopover = vi.fn(() => nativeShow.call(node));
            node.hidePopover = () => trigger.focus();
            const matches = node.matches.bind(node);
            Object.defineProperty(node, 'matches', {
              configurable: true,
              value: (selector: string) => selector === ':popover-open' || matches(selector),
            });
          }}
        >
          <MenuItem>动作</MenuItem>
        </AnchorPopover>
      </StrictMode>,
    );
    try {
      expect(close).not.toHaveBeenCalled();
      expect(screen.getByRole('menuitem', { name: '动作' })).toHaveFocus();
      view.unmount();
      expect(close).not.toHaveBeenCalled();
      expect(trigger).toHaveFocus();
    } finally {
      view.unmount();
      trigger.remove();
    }
  });

  it('嵌套层 Esc 只关闭最上层', async () => {
    function Nested() {
      const anchor = useRef<HTMLButtonElement>(null);
      const child = useRef<HTMLButtonElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <>
          <button ref={anchor}>触发</button>
          <AnchorPopover open anchor={anchor} role="dialog" aria-label="外层">
            <button ref={child} onClick={() => setOpen(true)}>
              内层入口
            </button>
            <AnchorPopover open={open} anchor={child} role="dialog" aria-label="内层" onClose={() => setOpen(false)}>
              <button>内层动作</button>
            </AnchorPopover>
          </AnchorPopover>
        </>
      );
    }
    render(<Nested />);
    await userEvent.click(screen.getByText('内层入口'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: '内层' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '外层' })).toBeInTheDocument();
    expect(screen.getByText('内层入口')).toHaveFocus();
  });
});
