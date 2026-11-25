import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

afterEach(() => vi.useRealTimers());
describe('Tooltip', () => {
  it('聚焦展示并合并描述，Esc 关闭且不抢焦点', () => {
    render(<Tooltip text="说明" describedBy="existing">{(trigger) => <button {...trigger}>动作</button>}</Tooltip>);
    const button = screen.getByText('动作');
    act(() => button.focus());
    expect(screen.getByRole('tooltip')).toHaveTextContent('说明');
    expect(button.getAttribute('aria-describedby')).toContain('existing ');
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });
  it('悬停延迟可取消，激活关闭，卸载清理定时器', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Tooltip text="说明">{(trigger) => <button {...trigger}>动作</button>}</Tooltip>);
    fireEvent.pointerEnter(screen.getByText('动作'), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(screen.getByText('动作'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.pointerEnter(screen.getByText('动作'), { pointerType: 'mouse' });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
