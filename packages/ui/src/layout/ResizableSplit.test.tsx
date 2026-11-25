import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResizeHandle } from './ResizeHandle';
import { ResizableSplit } from './ResizableSplit';
import { splitBounds } from './useSplitBounds';

function pointer(node: HTMLElement, type: string, point: number) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 1, isPrimary: true, button: 0, clientX: point, clientY: point });
  fireEvent(node, event);
}
describe('ResizeHandle / ResizableSplit', () => {
  it('尺寸边界兼顾次区和分隔条，窄容器给出堆叠状态', () => {
    expect(splitBounds(700, 8, 160, 500, 200)).toEqual({ min: 160, max: 492, compact: false });
    expect(splitBounds(280, 8, 160, 500, 160)).toEqual({ min: 112, max: 112, compact: true });
  });
  it('方向键、Shift 加速、Home / End 遵守边界，禁用时不操作', async () => {
    const change = vi.fn();
    const { rerender } = render(<ResizeHandle value={200} min={100} max={300} onValueChange={change} />);
    screen.getByRole('separator').focus();
    await userEvent.keyboard('{ArrowRight}{Home}{End}');
    expect(change.mock.calls).toEqual([[210], [100], [300]]);
    rerender(<ResizeHandle value={200} min={100} max={300} onValueChange={change} orientation="horizontal" disabled />);
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowDown' });
    expect(change).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('separator')).toHaveAttribute('tabindex', '-1');
  });
  it('拖动夹取，取消回退，并回调取消状态', () => {
    const change = vi.fn();
    const end = vi.fn();
    render(<ResizeHandle value={120} min={100} max={180} onValueChange={change} onResizeEnd={end} />);
    const handle = screen.getByRole('separator');
    pointer(handle, 'pointerdown', 100);
    pointer(handle, 'pointermove', 250);
    expect(change).toHaveBeenLastCalledWith(180);
    pointer(handle, 'pointercancel', 250);
    expect(change).toHaveBeenLastCalledWith(120);
    expect(end).toHaveBeenCalledExactlyOnceWith(120, true);
  });
  it('窄容器堆叠不写回偏好，变宽恢复原值', () => {
    let width = 280;
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      width, height: 300, top: 0, left: 0, bottom: 300, right: width, x: 0, y: 0, toJSON: () => ({}),
    }));
    const change = vi.fn();
    function Example() {
      const [size, setSize] = useState(240);
      return <ResizableSplit primary={<div>侧栏</div>} size={size} onSizeChange={(next) => { change(next); setSize(next); }}>
        主区
      </ResizableSplit>;
    }
    const { container } = render(<Example />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    width = 700;
    fireEvent(window, new Event('resize'));
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '240');
    expect(container).toHaveTextContent('侧栏');
    rect.mockRestore();
  });
});
