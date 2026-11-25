import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';
import type { ToastController } from './useToastQueue';

afterEach(() => vi.useRealTimers());
function Actions({ ready }: { ready: (api: ToastController) => void }) {
  const api = useToast();
  return <button onClick={() => ready(api)}>准备</button>;
}
const setup = () => {
  let api!: ToastController;
  const rendered = render(<ToastProvider maxVisible={1}><Actions ready={(value) => { api = value; }} /></ToastProvider>);
  fireEvent.click(screen.getByText('准备'));
  return { ...rendered, api };
};

describe('Toast 队列', () => {
  it('同一事件连续入队，后续计时从显示时开始，回调只触发一次', () => {
    vi.useFakeTimers();
    const { api } = setup();
    const close = vi.fn();
    const open = vi.fn();
    act(() => {
      api.notify({ title: '第一条', duration: 1000, onClose: close });
      api.notify({ title: '第二条', duration: 1000, onOpen: open });
    });
    expect(screen.queryByText('第二条')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(close).toHaveBeenCalledExactlyOnceWith('timeout');
    expect(open).toHaveBeenCalledOnce();
    expect(screen.getByText('第二条')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByText('第二条')).toBeInTheDocument();
  });
  it('悬停暂停剩余时长，持续消息手动关闭并清理', () => {
    vi.useFakeTimers();
    const { api, unmount } = setup();
    act(() => api.notify({ title: '暂停测试', duration: 1000 }));
    act(() => vi.advanceTimersByTime(400));
    const toast = screen.getByText('暂停测试').closest('article')!;
    fireEvent.pointerEnter(toast);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('暂停测试')).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.queryByText('暂停测试')).not.toBeInTheDocument();
    const close = vi.fn();
    act(() => api.notify({ title: '错误', duration: 0, tone: 'error', onClose: close }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole('alert')).toHaveTextContent('错误');
    fireEvent.click(screen.getByLabelText('关闭消息'));
    expect(close).toHaveBeenCalledExactlyOnceWith('dismiss');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('立即取消与清空不会留下消息，卸载后旧 API 不触发回调', () => {
    const { api, unmount } = setup();
    const close = vi.fn();
    act(() => {
      const id = api.notify({ title: '取消', onClose: close });
      api.dismiss(id);
      api.notify({ title: '清空', onClose: close });
      api.clear();
    });
    expect(screen.queryByText('取消')).not.toBeInTheDocument();
    expect(close.mock.calls).toEqual([['dismiss'], ['clear']]);
    unmount();
    api.notify({ title: '卸载后', onClose: close });
    api.clear();
    expect(close).toHaveBeenCalledTimes(2);
  });
});
