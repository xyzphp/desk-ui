import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SortableList, type SortableListItem } from './SortableList';
import { insertionIndex, reorderIds } from './sortableModel';

const items: readonly SortableListItem[] = [
  { id: 'a', label: '甲' },
  { id: 'b', label: '乙' },
  { id: 'c', label: '丙', disabled: true },
  { id: 'd', label: '丁' },
];
describe('SortableList', () => {
  it('列表末尾操作参与键盘导航，排序回调只包含可排序条目', async () => {
    const changed = vi.fn();
    const add = vi.fn();
    render(
      <SortableList
        label="链接"
        items={items.slice(0, 2)}
        onOrderChange={changed}
        orientation="horizontal"
        dragMode="row"
        showMoveButtons={false}
        trailing={<button onClick={add}>添加链接</button>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '添加链接' }));
    expect(add).toHaveBeenCalledOnce();
    const row = screen.getByRole('listitem', { name: '甲' });
    row.focus();
    await userEvent.keyboard(' {ArrowRight}{Enter}');
    expect(changed).toHaveBeenLastCalledWith(['b', 'a']);
    expect(row).toHaveAttribute('aria-keyshortcuts', 'Space ArrowLeft ArrowRight Enter Escape');
  });

  it('空列表有末尾入口时直接显示入口', () => {
    render(<SortableList label="空分组" items={[]} onOrderChange={vi.fn()} trailing={<button>添加链接</button>} />);
    expect(screen.getByRole('button', { name: '添加链接' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
  it('其他列表不能接受当前实例的拖动数据', () => {
    const first = vi.fn(),
      second = vi.fn();
    const data = new Map<string, string>();
    const transfer = {
      types: ['application/x-component-sort'],
      effectAllowed: '',
      dropEffect: '',
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => data.get(type) ?? '',
    };
    render(
      <>
        <SortableList label="第一组" items={items} onOrderChange={first} />
        <SortableList label="第二组" items={items} onOrderChange={second} />
      </>,
    );
    fireEvent.dragStart(screen.getAllByRole('button', { name: '排序：甲' })[0]!, { dataTransfer: transfer });
    fireEvent.drop(screen.getByRole('list', { name: '第二组' }), { dataTransfer: transfer });
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });
  it('移动按钮与 Alt 方向键给出新顺序，禁用项不能移动或跨越', async () => {
    const changed = vi.fn();
    render(<SortableList label="排序" items={items} onOrderChange={changed} />);
    await userEvent.click(screen.getByRole('button', { name: '后移：甲' }));
    expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
    expect(screen.getByRole('button', { name: '后移：乙' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '排序：丙' })).toBeDisabled();
    screen.getByRole('button', { name: '排序：乙' }).focus();
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
  });
  it('手柄键盘排序先定位后提交，Esc 取消，离开列表不抢焦点', async () => {
    const changed = vi.fn();
    render(
      <>
        <SortableList label="排序" items={items} onOrderChange={changed} />
        <button>外部</button>
      </>,
    );
    const handle = screen.getByRole('button', { name: '排序：甲' });
    await userEvent.click(handle);
    await userEvent.keyboard('{ArrowDown}{Escape}');
    expect(changed).not.toHaveBeenCalled();
    expect(handle).toHaveFocus();
    await userEvent.keyboard(' {ArrowDown}{Enter}');
    expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
    await userEvent.click(handle);
    await userEvent.click(screen.getByRole('button', { name: '外部' }));
    expect(screen.getByRole('button', { name: '外部' })).toHaveFocus();
    expect(handle).toHaveAttribute('aria-pressed', 'false');
  });
  it('整行模式不显示手柄和移动按钮，键盘仍可完成排序', async () => {
    const changed = vi.fn();
    render(<SortableList label="排序" items={items} onOrderChange={changed} dragMode="row" showMoveButtons={false} />);
    const row = screen.getByRole('listitem', { name: '甲' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    row.focus();
    await userEvent.keyboard(' {ArrowDown}{Enter}');
    expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
  });
  it('整行模式长按并拖到目标条目后提交顺序', () => {
    const changed = vi.fn();
    const pointerEvent = (type: string, values: Record<string, number | string | boolean>) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
      return event;
    };
    vi.useFakeTimers();
    const view = render(
      <SortableList label="排序" items={items} onOrderChange={changed} dragMode="row" showMoveButtons={false} />,
    );
    try {
      const [first, second] = screen.getAllByRole('listitem');
      const pointer = { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, clientX: 4, clientY: 4 };
      fireEvent(first!, pointerEvent('pointerdown', pointer));
      act(() => vi.advanceTimersByTime(430));
      fireEvent(second!, pointerEvent('pointermove', { ...pointer, clientY: 24 }));
      // 拖动中有跟随指针的影子（挂在列表内、不带源行的状态类），原位只淡化。
      const ghost = view.container.querySelector<HTMLElement>('.ds-drag-ghost');
      expect(ghost).not.toBeNull();
      expect(ghost!.closest('[data-sort-list]')).not.toBeNull();
      expect(ghost).toHaveAttribute('aria-hidden', 'true');
      expect(ghost).not.toHaveClass('is-dragging', 'is-drag-source');
      expect(ghost!.style.transform).toContain('translate3d(');
      expect(first).toHaveClass('is-drag-source');
      fireEvent(second!, pointerEvent('pointerup', { ...pointer, clientY: 24 }));
      expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
      expect(view.container.querySelector('.ds-drag-ghost')).toBeNull();
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });
  it('整行移动模式用原生预览拖动，普通点击不修改顺序', () => {
    const changed = vi.fn();
    const data = new Map<string, string>();
    const transfer = {
      types: ['application/x-component-sort'],
      effectAllowed: '',
      dropEffect: '',
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => data.get(type) ?? '',
    };
    render(
      <SortableList
        label="排序"
        items={items.slice(0, 2)}
        onOrderChange={changed}
        dragMode="row"
        rowDragActivation="movement"
        showMoveButtons={false}
      />,
    );
    const [first, second] = screen.getAllByRole('listitem');
    expect(first).toHaveAttribute('draggable', 'true');
    fireEvent.click(first!);
    expect(changed).not.toHaveBeenCalled();
    fireEvent.dragStart(first!, { dataTransfer: transfer });
    const dragAt = (type: 'dragOver' | 'drop', target: Element) => {
      const event = createEvent[type](target, { dataTransfer: transfer });
      Object.defineProperty(event, 'clientY', { value: 24 });
      fireEvent(target, event);
    };
    dragAt('dragOver', second!);
    dragAt('drop', second!);
    expect(changed).toHaveBeenLastCalledWith(['b', 'a']);
  });
  it('原生拖放只接收当前会话；数据变化取消旧拖动，只读隐藏操作', () => {
    const changed = vi.fn();
    const data = new Map<string, string>();
    const transfer = {
      types: ['application/x-component-sort'],
      effectAllowed: '',
      dropEffect: '',
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => data.get(type) ?? '',
    };
    const { rerender } = render(<SortableList label="排序" items={items} onOrderChange={changed} />);
    fireEvent.dragStart(screen.getByRole('button', { name: '排序：甲' }), { dataTransfer: transfer });
    const row = screen.getByText('乙').closest('li')!;
    // jsdom 没有 DragEvent，init 里的 clientY 会丢失，所以直接在事件对象上写入。
    const dragAt = (type: 'dragOver' | 'drop', target: Element) => {
      const event = createEvent[type](target, { dataTransfer: transfer });
      Object.defineProperty(event, 'clientY', { value: 10 });
      fireEvent(target, event);
    };
    dragAt('dragOver', row);
    dragAt('drop', row);
    expect(changed).toHaveBeenLastCalledWith(['b', 'a', 'c', 'd']);
    changed.mockClear();
    fireEvent.dragStart(screen.getByRole('button', { name: '排序：甲' }), { dataTransfer: transfer });
    rerender(
      <SortableList label="排序" items={[items[1]!, items[0]!, items[2]!, items[3]!]} onOrderChange={changed} />,
    );
    fireEvent.drop(screen.getByRole('list'), { dataTransfer: transfer });
    expect(changed).not.toHaveBeenCalled();
    rerender(<SortableList label="排序" items={items} onOrderChange={changed} readOnly />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('排序规则', () => {
  it('源移除后按目标前后插入，保留输入，拒绝固定项和非法目标', () => {
    const order = ['a', 'b', 'c', 'd'];
    expect(insertionIndex(order, 'a', 'b', true)).toBe(1);
    expect(reorderIds(order, 'a', 1, new Set(['c']))).toEqual(['b', 'a', 'c', 'd']);
    expect(order).toEqual(['a', 'b', 'c', 'd']);
    expect(reorderIds(order, 'a', 3, new Set(['c']))).toBe(order);
    expect(reorderIds(order, 'c', 0, new Set(['c']))).toBe(order);
    expect(reorderIds(order, 'a', NaN, new Set())).toBe(order);
  });
});
