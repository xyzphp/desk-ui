import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClockCard, DesktopCard, DesktopCardToolbar, DesktopNote } from './DesktopCard';

describe('桌面卡片', () => {
  it('便签底栏按附件、色卡、AI 排列，折叠不卸载原正文', async () => {
    render(<DesktopNote title="图文便签" defaultValue="保留正文"
      leadingTools={<button type="button">添加图片</button>} tools={<button type="button">AI 优化</button>} />);
    const note = screen.getByRole('article', { name: '图文便签' });
    const input = within(note).getByRole('textbox');
    const footer = note.querySelector('footer')!;
    expect(within(footer).getAllByRole('button').map((button) => button.textContent || button.getAttribute('aria-label')))
      .toEqual(['添加图片', '浅黄', '浅蓝', '浅绿', '浅粉', '白色', 'AI 优化']);
    await userEvent.click(within(note).getByRole('button', { name: '折叠便签' }));
    await userEvent.click(within(note).getByRole('button', { name: '展开便签' }));
    expect(within(note).getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('保留正文');
  });
  it('折叠便签时摘要保留图片数量，展开保留原文', async () => {
    render(<DesktopNote title="便签" defaultValue="正文" imageCount={2} />);
    const input = screen.getByRole('textbox', { name: '便签正文' });
    await userEvent.click(screen.getByRole('button', { name: '折叠便签' }));
    expect(screen.getByText('正文 · 2 张图片')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '展开便签' }));
    expect(screen.getByRole('textbox', { name: '便签正文' })).toBe(input);
  });
  it('统一壳层命名、折叠和操作；折叠保留草稿节点，按钮不提交表单', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <DesktopCard
          title="待办"
          actions={[{ id: 'refresh', label: '刷新', icon: 'rotate-ccw', onClick: action }]}
          summary="任务摘要"
        >
          <input aria-label="草稿" defaultValue="计划" />
        </DesktopCard>
      </form>,
    );
    expect(screen.getByRole('article', { name: '待办' })).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '修改的计划' } });
    await user.click(screen.getByRole('button', { name: '折叠卡片' }));
    expect(screen.getByRole('button', { name: '展开卡片' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('任务摘要')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '展开卡片' }));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('修改的计划');
    await user.click(screen.getByRole('button', { name: '刷新' }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  it('按住标题区直接拖动，不增加拖动手柄或上下移动按钮，并忽略内部操作按钮', () => {
    const drag = vi.fn();
    render(
      <DesktopCard title="卡片" onHeaderDrag={drag}>
        <span>正文</span>
      </DesktopCard>,
    );
    const heading = screen.getByRole('heading', { name: '卡片' });
    const header = heading.closest('header');
    expect(header).toHaveAttribute('data-movable', 'true');
    expect(
      within(header!)
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['折叠卡片']);
    const pointer = (target: Element | Document, type: string, x: number, y: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { pointerId: 1, button: 0, isPrimary: true, clientX: x, clientY: y });
      fireEvent(target, event);
    };

    pointer(header!, 'pointerdown', 10, 10);
    pointer(document, 'pointermove', 20, 19);
    expect(drag).toHaveBeenLastCalledWith({ phase: 'move', start: { x: 10, y: 10 }, point: { x: 20, y: 19 } });
    pointer(document, 'pointerup', 22, 21);
    expect(drag).toHaveBeenLastCalledWith({ phase: 'drop', start: { x: 10, y: 10 }, point: { x: 22, y: 21 } });

    drag.mockClear();
    pointer(within(header!).getByRole('button', { name: '折叠卡片' }), 'pointerdown', 10, 10);
    pointer(document, 'pointermove', 20, 20);
    pointer(document, 'pointerup', 22, 22);
    expect(drag).not.toHaveBeenCalled();
  });

  it('受控折叠只回调宿主，可禁用单独动作', () => {
    const collapse = vi.fn();
    const action = vi.fn();
    render(
      <DesktopCard
        title="卡片"
        collapsed={false}
        onCollapsedChange={collapse}
        actions={[{ id: 'delete', icon: 'trash-2', label: '删除', disabled: true, onClick: action }]}
      >
        <span>正文</span>
      </DesktopCard>,
    );
    fireEvent.click(screen.getByRole('button', { name: '折叠卡片' }));
    expect(collapse).toHaveBeenCalledWith(true);
    expect(screen.getByText('正文')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(action).not.toHaveBeenCalled();
  });

  it('便签在纸张 / 卡片模式间保留正文节点与颜色，错误关联并保留原文', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const color = vi.fn();
    const { rerender } = render(
      <DesktopNote title="便签" defaultValue="原文" onValueChange={change} onColorChange={color} />,
    );
    const input = screen.getByRole('textbox', { name: '便签正文' });
    fireEvent.change(input, { target: { value: '  未保存草稿\n' } });
    expect(change).toHaveBeenLastCalledWith('  未保存草稿\n');
    await user.click(screen.getByRole('button', { name: '浅蓝' }));
    expect(color).toHaveBeenCalledWith('blue');
    rerender(<DesktopNote title="便签" placement="card" error="保存失败" />);
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('  未保存草稿\n');
    expect(input).toHaveAccessibleDescription('保存失败');
    expect(screen.getByRole('button', { name: '浅蓝' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('只读便签不修改正文或颜色；外部表单重置恢复非受控正文', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<DesktopNote title="便签" defaultValue="初始" readOnly onValueChange={change} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '不应写入' } });
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '浅绿' })).toBeDisabled();
    rerender(
      <>
        <form id="note-form" aria-label="便签表单" />
        <DesktopNote
          title="便签"
          defaultValue="初始"
          onValueChange={change}
          inputProps={{ form: 'note-form', name: 'body' }}
        />
      </>,
    );
    await user.type(screen.getByRole('textbox'), '草稿');
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(screen.getByRole('textbox')).toHaveValue('初始');
    expect(change).toHaveBeenLastCalledWith('初始');
  });

  it('时钟按明确时区展示同一时刻，保留原始 Date，不创建自身计时任务', () => {
    const now = new Date('2026-01-15T00:30:00Z');
    const original = now.getTime();
    const timer = vi.spyOn(globalThis, 'setInterval');
    const { rerender, container } = render(
      <ClockCard title="世界时钟" now={now} timeZone="Asia/Shanghai" showSeconds={false} />,
    );
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-01-15T00:30:00.000Z');
    rerender(<ClockCard title="世界时钟" now={now} timeZone="America/New_York" showSeconds={false} />);
    expect(screen.getByText('19:30')).toBeInTheDocument();
    expect(now.getTime()).toBe(original);
    expect(timer).not.toHaveBeenCalled();
    timer.mockRestore();
  });

  it('无效时区与无效时刻使用明确回退，不显示伪造时间', () => {
    const { rerender, container } = render(<ClockCard title="时钟" now={NaN} invalidLabel="时间不可用" />);
    expect(screen.getByText('时间不可用')).toBeInTheDocument();
    expect(container.querySelector('time')).not.toHaveAttribute('datetime');
    rerender(<ClockCard title="时钟" now={0} timeZone="invalid-zone" invalidLabel="时区不可用" />);
    expect(screen.getByText('时区不可用')).toBeInTheDocument();
  });

  it('桌面卡片与工具条透传 cardStyle，solid 与纸张便签保持独立底板', () => {
    const { container } = render(
      <>
        <DesktopCardToolbar title="卡片" cardStyle="liquid" />
        <DesktopCard title="玻璃卡" cardStyle="liquid">
          内容
        </DesktopCard>
        <DesktopCard title="实心卡" variant="solid" cardStyle="liquid">
          内容
        </DesktopCard>
        <DesktopNote title="纸张便签" placement="note" cardStyle="liquid" defaultValue="便签" />
        <DesktopNote title="卡片便签" placement="card" cardStyle="liquid" defaultValue="卡片" />
      </>,
    );
    expect(container.querySelector('.ds-desktop-card-toolbar')).toHaveAttribute('data-card-style', 'liquid');
    expect(screen.getByRole('article', { name: '玻璃卡' })).toHaveAttribute('data-card-style', 'liquid');
    const solid = screen.getByRole('article', { name: '实心卡' });
    expect(solid).toHaveClass('is-solid');
    expect(solid).not.toHaveAttribute('data-card-style');
    const paperNote = screen.getByRole('article', { name: '纸张便签' });
    expect(paperNote).toHaveAttribute('data-placement', 'note');
    expect(paperNote).toHaveAttribute('data-card-style', 'liquid');
    expect(screen.getByRole('article', { name: '卡片便签' })).toHaveAttribute('data-placement', 'card');
  });
});
