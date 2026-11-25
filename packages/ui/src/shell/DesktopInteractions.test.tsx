import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DesktopIconGrid } from './DesktopIconGrid';
import { SelectionArea } from './SelectionArea';
import { WidgetLayout } from './WidgetLayout';
import { DockWorkspace } from './DockWorkspace';
import { desktopIconGroup, moveDesktopIconGroup } from './desktopIconGroup';
import { movePlacement, normalizeLayout } from './gridPlacement';
import {
  desktopGridGeometry,
  desktopIconMetrics,
  desktopIconRect,
  moveDesktopIcon,
  normalizeDesktopIcons,
  reorderDesktopIcons,
} from './desktopIconPlacement';

describe('桌面图标自动排列', () => {
  it('按原站规则将选中组插入目标位置，并按列紧凑排列', () => {
    const entries = ['a', 'b', 'c', 'd'].map((id, row) => ({ id, column: 0, row }));
    expect(reorderDesktopIcons(entries, new Set(['a', 'c']), 0, 2, 3)).toEqual([
      { id: 'b', column: 0, row: 0 },
      { id: 'd', column: 0, row: 1 },
      { id: 'a', column: 0, row: 2 },
      { id: 'c', column: 1, row: 0 },
    ]);
    expect(reorderDesktopIcons(entries, new Set(['d']), -1, -1, 3)[0]?.id).toBe('d');
  });
});

const rect = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  x: left,
  y: top,
  toJSON: () => ({}),
});
function pointer(target: Element | Document, type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: 7, button: 0, isPrimary: true, clientX: x, clientY: y });
  fireEvent(target, event);
}
describe('desktop placement model', () => {
  it('整组避让占用位置并保持间距，自由摆放使用同一个 8px 偏移', () => {
    const layout = [
      { id: 'a', column: 0, row: 0 },
      { id: 'b', column: 1, row: 0 },
      { id: 'fixed', column: 3, row: 1 },
    ];
    const ids = new Set(['a', 'b']);
    const grid = desktopGridGeometry({ placementMode: 'grid', iconSize: 56, canvasWidth: 400 }, 4, 3);
    const placed = moveDesktopIconGroup(layout, desktopIconGroup(layout, ids, grid), { x: 196, y: 118 }, grid);
    expect(placed).toEqual([{ id: 'a', column: 1, row: 0 }, { id: 'b', column: 2, row: 0 }, layout[2]]);

    const free = desktopGridGeometry({ placementMode: 'free', iconSize: 56, canvasWidth: 520 }, 5, 3);
    const source = normalizeDesktopIcons(['a', 'b', 'fixed'], layout, free);
    const moved = moveDesktopIconGroup(source, desktopIconGroup(source, ids, free), { x: 53, y: 45 }, free)!;
    expect(moved.map((entry) => desktopIconRect(entry, free)).slice(0, 2)).toMatchObject([
      { x: 56, y: 48 },
      { x: 152, y: 48 },
    ]);
    expect(moved[2]).toBe(source[2]);
  });
  it('以原桌面的 14px 间隔计算格距，窗口变宽只增加可用列', () => {
    const narrow = desktopGridGeometry({ placementMode: 'grid', iconSize: 56, canvasWidth: 398 });
    const wide = desktopGridGeometry({ placementMode: 'grid', iconSize: 56, canvasWidth: 800 });
    expect(narrow.columns).toBe(4);
    expect(wide.columns).toBe(8);
    expect(desktopIconMetrics(56)).toEqual({ width: 84, height: 104, gap: 14, stepX: 98, stepY: 118 });
    expect(desktopIconRect({ id: 'a', column: 1, row: 1 }, narrow)).toEqual(
      desktopIconRect({ id: 'a', column: 1, row: 1 }, wide),
    );
  });
  it('自由摆放用 8px 微步，落点碰到另一图标时找最近的合法位置', () => {
    const geometry = desktopGridGeometry({ placementMode: 'free', iconSize: 56, canvasWidth: 300 }, undefined, 2);
    const entries = normalizeDesktopIcons(
      ['a', 'b'],
      [
        { id: 'a', column: 0, row: 0 },
        { id: 'b', column: 1, row: 0 },
      ],
      geometry,
    );
    const moved = moveDesktopIcon(entries, 'a', 1, 0, geometry);
    expect(desktopIconRect(moved![0]!, geometry)).toMatchObject({ x: 8, y: 0 });
    expect(moved?.[1]).toEqual(entries[1]);
  });
  it('限制坐标与跨度，冲突找空位，容量不足不覆盖现有项', () => {
    const result = normalizeLayout(
      ['a', 'b', 'c'],
      [
        { id: 'a', column: -4, row: Infinity, width: 8 },
        { id: 'b', column: 0, row: 0 },
      ],
      { columns: 2, rows: 1 },
      false,
    );
    expect(result).toEqual([{ id: 'a', column: 0, row: 0, width: 2, height: 1, zIndex: 0 }]);
    expect(movePlacement(result, 'a', 30, 30, { columns: 2, rows: 1 }, false)?.[0]?.column).toBe(0);
  });
  it('图标拒绝占用格，小组件可重叠，输入快照不被修改', () => {
    const input = [
      { id: 'a', column: 0, row: 0 },
      { id: 'b', column: 1, row: 0 },
    ];
    expect(movePlacement(input, 'a', 1, 0, { columns: 3, rows: 2 }, false)).toBeNull();
    expect(movePlacement(input, 'a', 1, 0, { columns: 3, rows: 2 }, true)?.[0]?.column).toBe(1);
    expect(input[0]?.column).toBe(0);
  });
});
describe('SelectionArea', () => {
  it('框选草稿不提交，结束保留禁用和区域外选择，Esc 和窗口失焦取消', () => {
    const change = vi.fn();
    const { container } = render(
      <SelectionArea label="区域" value={['outside', 'locked']} disabledIds={['locked']} onValueChange={change}>
        {(preview) => (
          <>
            <span data-selection-id="a">{preview.includes('a') ? '预览已选' : '未选'}</span>
            <span data-selection-id="locked">固定</span>
          </>
        )}
      </SelectionArea>,
    );
    const root = screen.getByRole('group', { name: '区域' });
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 400, 300));
    Object.defineProperties(root, {
      scrollWidth: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 300 },
    });
    vi.spyOn(container.querySelector('[data-selection-id="a"]')!, 'getBoundingClientRect').mockReturnValue(
      rect(40, 40, 50, 50),
    );
    pointer(root, 'pointerdown', 10, 10);
    pointer(document, 'pointermove', 110, 110);
    expect(screen.getByText('预览已选')).toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(root, { key: 'Escape' });
    pointer(document, 'pointerup', 110, 110);
    expect(change).not.toHaveBeenCalled();
    pointer(root, 'pointerdown', 10, 10);
    fireEvent(window, new Event('blur'));
    pointer(document, 'pointerup', 110, 110);
    expect(change).not.toHaveBeenCalled();
    pointer(root, 'pointerdown', 10, 10);
    pointer(document, 'pointerup', 110, 110);
    expect(change).toHaveBeenCalledExactlyOnceWith(['outside', 'locked', 'a']);
  });
  it('键盘全选限定自身范围，输入文字和嵌套区域不被外层抢走', () => {
    const outer = vi.fn(),
      inner = vi.fn();
    render(
      <SelectionArea label="外层" onValueChange={outer}>
        <button data-selection-id="a">条目</button>
        <input aria-label="正文" />
        <SelectionArea label="内层" onValueChange={inner}>
          <span data-selection-id="b">内部</span>
        </SelectionArea>
      </SelectionArea>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a', ctrlKey: true });
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('group', { name: '外层' }), { key: 'a', ctrlKey: true });
    expect(outer).toHaveBeenLastCalledWith(['a']);
    fireEvent.keyDown(screen.getByRole('group', { name: '内层' }), { key: 'a', ctrlKey: true });
    expect(inner).toHaveBeenCalledExactlyOnceWith(['b']);
    expect(outer).toHaveBeenCalledTimes(1);
  });
});
describe('DesktopIconGrid / WidgetLayout', () => {
  it('将鼠标与键盘菜单请求交给宿主，不冒泡到桌面背景', () => {
    const open = vi.fn();
    const backdrop = vi.fn();
    const item = { id: 'notes', label: '备忘录' };
    render(
      <div onContextMenu={backdrop}>
        <DesktopIconGrid label="桌面" items={[item]} onItemContextMenu={open} />
      </div>,
    );
    const icon = screen.getByRole('button', { name: '备忘录' });
    fireEvent.contextMenu(icon, { clientX: 40, clientY: 80 });
    expect(open).toHaveBeenCalledWith(item, { x: 40, y: 80 });
    expect(backdrop).not.toHaveBeenCalled();
    fireEvent.keyDown(icon, { key: 'F10', shiftKey: true });
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('自动排列时键盘调整顺序并返回紧凑位置', () => {
    const change = vi.fn();
    render(<DesktopIconGrid label="自动排列" rows={3} autoArrange items={[
      { id: 'a', label: '目录' }, { id: 'b', label: '文档' }, { id: 'c', label: '设置' },
    ]} onLayoutChange={change} />);
    fireEvent.keyDown(screen.getByRole('button', { name: '目录' }), { key: 'ArrowDown', altKey: true });
    expect(change).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({ id: 'b', column: 0, row: 0 }),
      expect.objectContaining({ id: 'a', column: 0, row: 1 }),
      expect.objectContaining({ id: 'c', column: 0, row: 2 }),
    ]);
  });
  it('拖动任一已选图标，整组选中项跟随，取消不写入且松手一次提交', () => {
    const change = vi.fn();
    const { container } = render(
      <DesktopIconGrid
        label="成组拖动"
        columns={4}
        rows={3}
        items={[
          { id: 'a', label: '目录' },
          { id: 'b', label: '文档' },
          { id: 'fixed', label: '固定', disabled: true },
        ]}
        defaultLayout={[
          { id: 'a', column: 0, row: 0 },
          { id: 'b', column: 1, row: 0 },
          { id: 'fixed', column: 2, row: 1 },
        ]}
        defaultSelectedIds={['a', 'b', 'fixed']}
        onLayoutChange={change}
      />,
    );
    const canvas = container.querySelector<HTMLElement>('.ds-grid-canvas')!;
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 400 });
    const a = screen.getByRole('button', { name: '目录' });
    const b = screen.getByRole('button', { name: '文档' });
    const fixed = screen.getByRole('button', { name: '固定' });
    pointer(b, 'pointerdown', 98, 0);
    pointer(document, 'pointermove', 118, 20);
    expect(a.closest('[data-selection-id]')).toHaveStyle({ transform: 'translate(20px, 20px)' });
    expect(b.closest('[data-selection-id]')).toHaveStyle({ transform: 'translate(20px, 20px)' });
    expect(fixed).not.toHaveAttribute('data-dragging');
    expect(change).not.toHaveBeenCalled();
    pointer(document, 'pointercancel', 118, 20);
    expect(b).not.toHaveAttribute('data-dragging');
    expect(change).not.toHaveBeenCalled();
    pointer(b, 'pointerdown', 98, 0);
    pointer(document, 'pointerup', 98, 118);
    expect(change).toHaveBeenCalledExactlyOnceWith([
      expect.objectContaining({ id: 'a', column: 0, row: 1 }),
      expect.objectContaining({ id: 'b', column: 1, row: 1 }),
      expect.objectContaining({ id: 'fixed', column: 2, row: 1 }),
    ]);
  });
  it('图标按住后连续跟随，松开才提交，取消或中途禁用恢复原位', () => {
    const change = vi.fn();
    const view = (locked = false) => (
      <DesktopIconGrid
        label="拖动"
        columns={2}
        rows={3}
        rowHeight={100}
        items={[{ id: 'a', label: '目录', disabled: locked }]}
        layout={[{ id: 'a', column: 0, row: 0 }]}
        onLayoutChange={change}
      />
    );
    const { container, rerender } = render(view());
    const canvas = container.querySelector<HTMLElement>('.ds-grid-canvas')!;
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 400 });
    const icon = screen.getByRole('button', { name: '目录' });
    const slot = icon.closest('[data-selection-id]');
    expect(screen.getAllByRole('button')).toEqual([icon]);
    pointer(icon, 'pointerdown', 0, 0);
    pointer(document, 'pointermove', 20, 10);
    expect(slot).toHaveStyle({ transform: 'translate(20px, 10px)' });
    expect(icon).toHaveAttribute('data-dragging', 'true');
    expect(change).not.toHaveBeenCalled();
    pointer(document, 'pointercancel', 200, 100);
    pointer(document, 'pointerup', 200, 100);
    expect(icon).not.toHaveAttribute('data-dragging');
    expect(change).not.toHaveBeenCalled();
    pointer(icon, 'pointerdown', 0, 0);
    rerender(view(true));
    pointer(document, 'pointerup', 200, 100);
    expect(change).not.toHaveBeenCalled();
    rerender(view());
    pointer(icon, 'pointerdown', 0, 0);
    pointer(document, 'pointerup', 200, 100);
    expect(change.mock.calls[0]?.[0][0]).toMatchObject({ id: 'a', column: 1, row: 1 });
  });
  it('直接拖图标不能覆盖占用格，也不会把松手产生的点击当作选择或打开', () => {
    const move = vi.fn(),
      open = vi.fn(),
      select = vi.fn();
    const { container } = render(
      <DesktopIconGrid
        label="图标"
        columns={2}
        rows={1}
        items={[
          { id: 'a', label: '目录' },
          { id: 'b', label: '占用' },
        ]}
        onLayoutChange={move}
        onSelectionChange={select}
        onOpen={open}
      />,
    );
    const canvas = container.querySelector<HTMLElement>('.ds-grid-canvas')!;
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 400 });
    const icon = screen.getByRole('button', { name: '目录' });
    pointer(icon, 'pointerdown', 10, 10);
    pointer(document, 'pointermove', 210, 10);
    // 拖动预览被限制在最后一列内（图标占位 84px + 14px 格距 = 98px），不会跟随指针越出网格。
    expect(icon.closest('[data-selection-id]')).toHaveStyle({ transform: 'translate(98px, 0px)' });
    pointer(document, 'pointerup', 210, 10);
    fireEvent.click(icon, { detail: 1 });
    fireEvent.doubleClick(icon, { detail: 2 });
    expect(move).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(icon.closest('[data-selection-id]')).toHaveStyle({ left: '0px' });
    pointer(icon, 'pointerdown', 10, 10);
    pointer(document, 'pointerup', 11, 10);
    fireEvent.click(icon, { detail: 1 });
    expect(select).toHaveBeenCalledExactlyOnceWith(['a']);
    expect(move).not.toHaveBeenCalled();
  });
  it('切换对齐模式时按当前布局换算，只有真实拖放提交位置', () => {
    const change = vi.fn();
    const view = (placementMode: 'grid' | 'free') => (
      <DesktopIconGrid
        label="图标"
        columns={2}
        rows={2}
        items={[{ id: 'a', label: '目录' }]}
        placementMode={placementMode}
        onLayoutChange={change}
      />
    );
    const { container, rerender } = render(view('free'));
    const canvas = container.querySelector<HTMLElement>('.ds-grid-canvas')!;
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 200 });
    const icon = screen.getByRole('button', { name: '目录' });
    const slot = icon.closest('[data-selection-id]');
    pointer(icon, 'pointerdown', 0, 0);
    pointer(document, 'pointerup', 57, 38);
    expect(slot).toHaveStyle({ left: '56px', top: '40px' });
    expect(change).toHaveBeenCalledTimes(1);
    rerender(view('grid'));
    expect(slot).toHaveStyle({ left: '98px', top: '0px' });
    rerender(view('free'));
    expect(slot).toHaveStyle({ left: '56px', top: '40px' });
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('拒绝受控布局时保持位置，占用和禁用项不能移动；选择与打开分开', async () => {
    const move = vi.fn(),
      open = vi.fn(),
      select = vi.fn();
    render(
      <DesktopIconGrid
        label="图标"
        columns={3}
        rows={2}
        layout={[
          { id: 'a', column: 0, row: 0 },
          { id: 'b', column: 1, row: 0 },
        ]}
        items={[
          { id: 'a', label: '文件' },
          { id: 'b', label: '禁用', disabled: true },
        ]}
        onLayoutChange={move}
        onOpen={open}
        onSelectionChange={select}
      />,
    );
    const icon = screen.getByRole('button', { name: '文件' });
    fireEvent.keyDown(icon, { key: 'ArrowRight', altKey: true });
    expect(move).not.toHaveBeenCalled();
    fireEvent.keyDown(icon, { key: 'ArrowDown', altKey: true });
    expect(move.mock.calls[0]?.[0][0].row).toBe(1);
    expect(icon.closest('[data-selection-id]')).toHaveStyle({ top: '0px' });
    const lockedIcon = screen.getByRole('button', { name: '禁用' });
    expect(lockedIcon).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(lockedIcon, { key: 'ArrowDown', altKey: true });
    expect(move).toHaveBeenCalledTimes(1);
    await userEvent.click(icon);
    expect(select).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    fireEvent.keyDown(icon, { key: 'Enter' });
    expect(open).toHaveBeenCalledTimes(1);
  });
  it('卡片移动和置顶保持内容节点及草稿，禁用布局不禁用业务内容', async () => {
    const change = vi.fn();
    render(
      <WidgetLayout
        label="卡片"
        columns={3}
        rows={2}
        onLayoutChange={change}
        defaultLayout={[{ id: 'a', column: 0, row: 0, width: 2 }]}
        items={[{ id: 'a', title: '便签', content: <input aria-label="草稿" defaultValue="原文" /> }]}
      />,
    );
    const input = screen.getByRole('textbox', { name: '草稿' });
    await userEvent.type(input, '追加');
    fireEvent.keyDown(screen.getByRole('button', { name: '移动：便签' }), { key: 'ArrowDown', altKey: true });
    await userEvent.click(screen.getByRole('button', { name: '移到最前' }));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('原文追加');
    expect(change).toHaveBeenCalled();
  });
});
describe('DockWorkspace', () => {
  it('预览调用窗口激活，空应用调用启动，就地排序保留固定项和未知 id', async () => {
    const activate = vi.fn(),
      launch = vi.fn(),
      order = vi.fn();
    render(
      <DockWorkspace
        label="应用栏"
        order={['outside', 'a', 'b', 'c', 'd']}
        onOrderChange={order}
        onLaunch={launch}
        onActivateWindow={activate}
        items={[
          { id: 'a', label: '文件', windows: [{ id: 'w', title: '目录窗口', minimized: true }] },
          { id: 'b', label: '固定', disabled: true },
          { id: 'c', label: '设置' },
          { id: 'd', label: '笔记' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '文件' }));
    const dialog = screen.getByRole('dialog', { name: '文件的窗口' });
    await userEvent.click(within(dialog).getByRole('button', { name: /目录窗口/ }));
    expect(activate).toHaveBeenCalledTimes(1);
    expect(launch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '设置' }));
    expect(launch).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: '调整应用顺序' }));
    expect(screen.getByRole('region', { name: '调整应用顺序' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '前移：设置' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '后移：设置' }));
    expect(order).toHaveBeenCalledExactlyOnceWith(['outside', 'a', 'b', 'd', 'c']);
  });
});
