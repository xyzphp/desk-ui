import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * 持有最新的值，供 effect / 事件监听读取而不必把它放进依赖。
 * 在布局 effect 里更新，不在渲染期写 ref，这样被丢弃的渲染不会污染它。
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => { ref.current = value; });
  return ref;
}
