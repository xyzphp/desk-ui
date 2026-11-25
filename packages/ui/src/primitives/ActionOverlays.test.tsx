import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';
import { Popconfirm } from './Popconfirm';
import { MenuItem } from '../shell/Overlay';

describe('DropdownMenu', () => {
  it('上键打开末项、禁用跳过，动作关闭并归还焦点，preventDefault 保持展开', async () => {
    render(<DropdownMenu label="操作"><MenuItem>首项</MenuItem><MenuItem disabled>禁用</MenuItem>
      <MenuItem onClick={(event) => event.preventDefault()}>保持</MenuItem><MenuItem>末项</MenuItem>
    </DropdownMenu>);
    const trigger = screen.getByRole('button', { name: '操作' });
    trigger.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: '末项' })).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Home}{Enter}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('受控关闭请求与禁用触发器边界', async () => {
    const close = vi.fn();
    const { rerender } = render(<DropdownMenu label="操作" open onOpenChange={close}><MenuItem>动作</MenuItem></DropdownMenu>);
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    rerender(<DropdownMenu label="操作" disabled><MenuItem>动作</MenuItem></DropdownMenu>);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Popconfirm', () => {
  it('取消默认聚焦，确认由宿主关闭；忙碌阻止重复确认 / Esc，失败保留错误与重试', async () => {
    const confirm = vi.fn();
    const cancel = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(false);
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState('');
      return <><Popconfirm label="移除" title="确认移除？" open={open} onOpenChange={setOpen} busy={busy} error={error}
        onCancel={cancel} onConfirm={() => { confirm(); setBusy(true); }} />
        <button onClick={() => { setBusy(false); setError('操作失败'); }}>返回失败</button>
      </>;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '处理中' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '返回失败' }));
    expect(screen.getByRole('alert')).toHaveTextContent('操作失败');
    expect(screen.getByRole('button', { name: '确定' })).toBeEnabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除' })).toHaveFocus();
  });
  it('外部关闭只请求取消，不执行确认', async () => {
    const confirm = vi.fn();
    const cancel = vi.fn();
    const changed = vi.fn();
    render(<><button>外部</button><Popconfirm label="操作" title="确认操作？" open onOpenChange={changed}
      onConfirm={confirm} onCancel={cancel} /></>);
    await userEvent.click(screen.getByRole('button', { name: '外部' }));
    expect(changed).toHaveBeenCalledWith(false);
    expect(cancel).toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '外部' })).toHaveFocus();
  });
});
