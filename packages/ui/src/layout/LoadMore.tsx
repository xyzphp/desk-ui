import { useEffect, useRef, type ComponentProps, type RefObject } from 'react';
import { cx } from '../foundation/cx';
import { useLatest } from '../foundation/useLatest';
import { Button } from '../primitives/Button';

export interface LoadMoreLabels {
  /** 已加载与总数的状态文字，例如“已加载 40 条 · 共 120 条”。 */
  status: (loaded: number, total: number) => string;
  /** 全部加载完毕。 */
  end: string;
  loadMore: string;
  /** 上次加载失败后，按钮文案改为重试。 */
  retry: string;
  /** 已达单批上限时的显式“下一批”按钮。 */
  nextBatch: string;
}

export interface LoadMoreProps extends Omit<ComponentProps<'footer'>, 'children'> {
  loaded: number;
  total: number;
  /** 已全部加载：显示完毕文字，不再自动或手动加载。 */
  end?: boolean;
  /** 已达单批上限：不再自动加载，改为显式“下一批”，由调用方清空旧批次。 */
  limited?: boolean;
  /** 上次加载的错误文字；存在时停止自动加载，按钮显示重试。 */
  error?: string;
  /** 禁用按钮，例如其他操作进行中。 */
  disabled?: boolean;
  /** 滚动到底部自动触发加载，默认开启；调用方在加载中或表单打开时传 false。 */
  auto?: boolean;
  /** 观察所在的滚动容器，省略时以视口为根。 */
  root?: RefObject<Element | null>;
  onLoadMore: () => void;
  onNextBatch?: () => void;
  labels: LoadMoreLabels;
}

/**
 * 滚动分页的底栏：已加载 / 总数、错误、“加载更多”与“下一批”。
 * 滚动到底时通过 IntersectionObserver 自动触发 onLoadMore；组件不请求、不合并、不去重数据。
 */
export function LoadMore({
  loaded,
  total,
  end = false,
  limited = false,
  error,
  disabled = false,
  auto = true,
  root,
  onLoadMore,
  onNextBatch,
  labels,
  className,
  ...rest
}: LoadMoreProps) {
  const sentinel = useRef<HTMLSpanElement>(null);
  const latest = useLatest(onLoadMore);
  const watching = auto && !end && !limited && !error;
  useEffect(() => {
    const node = sentinel.current;
    if (!watching || !node || typeof IntersectionObserver !== 'function') return;
    // 重新观察会立即回调一次，所以上一批加载完成后若底部仍可见，会继续加载。
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) latest.current?.();
      },
      { root: root?.current ?? null, rootMargin: '160px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [latest, root, watching]);

  return (
    <footer {...rest} className={cx('ds-load-more', className)}>
      <span role="status" aria-live="polite">
        {labels.status(loaded, total)}
      </span>
      {error ? <span role="alert">{error}</span> : null}
      {end ? (
        <span>{labels.end}</span>
      ) : limited ? (
        <Button icon="arrow-right" disabled={disabled || !onNextBatch} onClick={() => onNextBatch?.()}>
          {labels.nextBatch}
        </Button>
      ) : (
        <span ref={sentinel}>
          <Button icon="chevron-down" disabled={disabled} onClick={onLoadMore}>
            {error ? labels.retry : labels.loadMore}
          </Button>
        </span>
      )}
    </footer>
  );
}
