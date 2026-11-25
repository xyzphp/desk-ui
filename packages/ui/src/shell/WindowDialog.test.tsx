import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WindowDialog, fitDialogGeometry } from './WindowDialog';

describe('窗口式模态层', () => {
  it('缩小视口时保留可达的标题栏和矩形，限制最小尺寸', () => {
    expect(fitDialogGeometry({ x: 2000, y: 2000, width: 1200, height: 900 }, 400, 600)).toEqual({
      x: 12,
      y: 36,
      width: 376,
      height: 552,
    });
    const geometry = fitDialogGeometry({ x: -100, y: -100, width: 100, height: 80 }, 1280, 800);
    expect(geometry).toEqual({ x: 12, y: 36, width: 360, height: 260 });
  });
  it('只暴露一个具名 dialog，键盘调整普通尺寸', () => {
    const change = vi.fn();
    render(
      <WindowDialog
        open
        title="预览"
        geometry={{ x: 20, y: 40, width: 400, height: 300 }}
        onGeometryChange={change}
        onCancel={() => {}}
      >
        <button>内容</button>
      </WindowDialog>,
    );
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    const resize = within(screen.getByRole('dialog', { name: '预览' })).getByRole('button', { name: /调整窗口大小/ });
    fireEvent.keyDown(resize, { key: 'ArrowRight' });
    expect(change).toHaveBeenLastCalledWith({ x: 20, y: 40, width: 410, height: 300 });
    fireEvent.keyDown(resize, { key: 'ArrowDown', shiftKey: true });
    expect(change).toHaveBeenLastCalledWith({ x: 20, y: 40, width: 400, height: 350 });
  });
  it('标题栏筛选控件并承载宿主操作，不把操作点击当作窗口手势', async () => {
    const action = vi.fn();
    const toggle = vi.fn();
    render(
      <WindowDialog
        open
        title="预览"
        geometry={{ x: 20, y: 40, width: 400, height: 300 }}
        titlebarControls={['close', 'maximize']}
        titlebarActions={<button onClick={action}>在新标签页打开</button>}
        onToggleMaximize={toggle}
        onCancel={() => {}}
      >
        <p>内容</p>
      </WindowDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: '预览' });
    expect(within(dialog).queryByRole('button', { name: '最小化窗口' })).not.toBeInTheDocument();
    const open = within(dialog).getByRole('button', { name: '在新标签页打开' });
    await userEvent.click(open);
    fireEvent.doubleClick(open);
    expect(action).toHaveBeenCalledTimes(1);
    expect(toggle).not.toHaveBeenCalled();
  });
  it('关闭后把焦点交还打开按钮', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>打开预览</button>
          <WindowDialog
            open={open}
            title="预览"
            geometry={{ x: 20, y: 40, width: 500, height: 300 }}
            onCancel={() => setOpen(false)}
          >
            <input aria-label="草稿" />
          </WindowDialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: '打开预览' }));
    await user.click(screen.getByRole('button', { name: '关闭窗口' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开预览' })).toHaveFocus();
  });
});
