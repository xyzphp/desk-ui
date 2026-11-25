import { useCallback, useState } from 'react';
import { useLatest } from './useLatest';

/**
 * 受控 / 非受控统一处理：传入 value 时由调用方控制，否则使用内部状态。
 * 回调只在值变化时触发。
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const latest = useLatest(current);
  const set = useCallback(
    (next: T) => {
      if (Object.is(next, latest.current)) return;
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange, latest],
  );
  return [current, set];
}
