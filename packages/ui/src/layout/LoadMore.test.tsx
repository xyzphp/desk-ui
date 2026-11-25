import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadMore, type LoadMoreLabels } from './LoadMore';

const labels: LoadMoreLabels = {
  status: (loaded, total) => `已加载 ${loaded} 条 · 共 ${total} 条`,
  end: '已加载完毕',
  loadMore: '加载更多',
  retry: '重试加载',
  nextBatch: '下一批',
};

type Observed = { callback: IntersectionObserverCallback; options?: IntersectionObserverInit; disconnect: () => void };
let observers: Observed[] = [];

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private entry: Observed;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.entry = { callback, options, disconnect: vi.fn() };
        observers.push(this.entry);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        this.entry.disconnect();
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

const intersect = (isIntersecting: boolean) =>
  act(() => observers.at(-1)!.callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));

describe('LoadMore', () => {
  it('显示已加载 / 总数；点击加载更多回调，带错误时按钮变为重试并提示', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const { rerender } = render(<LoadMore loaded={40} total={120} labels={labels} onLoadMore={onLoadMore} />);
    expect(screen.getByRole('status')).toHaveTextContent('已加载 40 条 · 共 120 条');
    await user.click(screen.getByRole('button', { name: '加载更多' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<LoadMore loaded={40} total={120} labels={labels} onLoadMore={onLoadMore} error="网络错误" />);
    expect(screen.getByRole('alert')).toHaveTextContent('网络错误');
    await user.click(screen.getByRole('button', { name: '重试加载' }));
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('底部进入可见区时自动加载；不可见、加载完毕、出错、达到上限或关闭自动时不观察', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<LoadMore loaded={20} total={100} labels={labels} onLoadMore={onLoadMore} />);
    expect(observers).toHaveLength(1);
    expect(observers[0]!.options).toMatchObject({ rootMargin: '160px' });
    intersect(false);
    expect(onLoadMore).not.toHaveBeenCalled();
    intersect(true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    for (const extra of [{ end: true }, { error: '失败' }, { limited: true }, { auto: false }]) {
      const before = observers.length;
      rerender(<LoadMore loaded={20} total={100} labels={labels} onLoadMore={onLoadMore} {...extra} />);
      expect(observers.length).toBe(before);
      rerender(<LoadMore loaded={20} total={100} labels={labels} onLoadMore={onLoadMore} />);
    }
  });

  it('暂停后恢复自动加载会重新观察，底部仍可见时可继续下一批；回调始终读取最新函数', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<LoadMore loaded={20} total={100} labels={labels} onLoadMore={first} />);
    rerender(<LoadMore loaded={20} total={100} labels={labels} onLoadMore={first} auto={false} />);
    expect(observers[0]!.disconnect).toHaveBeenCalled();
    rerender(<LoadMore loaded={40} total={100} labels={labels} onLoadMore={second} />);
    expect(observers).toHaveLength(2);
    intersect(true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('完毕时只显示状态与完毕文字；达到上限改为显式下一批，没有回调时禁用', async () => {
    const user = userEvent.setup();
    const onNextBatch = vi.fn();
    const { rerender } = render(<LoadMore loaded={100} total={100} labels={labels} onLoadMore={vi.fn()} end />);
    expect(screen.getByText('已加载完毕')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <LoadMore loaded={1000} total={3000} labels={labels} onLoadMore={vi.fn()} limited onNextBatch={onNextBatch} />,
    );
    await user.click(screen.getByRole('button', { name: '下一批' }));
    expect(onNextBatch).toHaveBeenCalledTimes(1);
    rerender(<LoadMore loaded={1000} total={3000} labels={labels} onLoadMore={vi.fn()} limited />);
    expect(screen.getByRole('button', { name: '下一批' })).toBeDisabled();
  });

  it('disabled 禁用按钮', () => {
    render(<LoadMore loaded={1} total={5} labels={labels} onLoadMore={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: '加载更多' })).toBeDisabled();
  });
});
