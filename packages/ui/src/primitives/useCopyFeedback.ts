import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLatest } from '../foundation/useLatest';

export type CopyHandler = (text: string) => void | boolean | Promise<void | boolean>;
export type CopyState = 'idle' | 'pending' | 'copied' | 'error';

export function useCopyFeedback(text: string, onCopy: CopyHandler, onCopied?: () => void, onCopyError?: (error: unknown) => void) {
  const [state, setState] = useState<CopyState>('idle');
  const epoch = useRef(0);
  const pending = useRef(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useLatest({ text, onCopy, onCopied, onCopyError });
  const invalidate = useCallback(() => { epoch.current++; }, []);
  useLayoutEffect(() => {
    epoch.current++;
    pending.current = false;
    clearTimeout(timer.current);
    setState('idle');
  }, [text]);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; invalidate(); clearTimeout(timer.current); };
  }, [invalidate]);
  const copy = async () => {
    if (pending.current || !alive.current) return;
    pending.current = true;
    const version = ++epoch.current;
    const snapshot = latest.current.text;
    clearTimeout(timer.current);
    setState('pending');
    const current = () => alive.current && version === epoch.current && snapshot === latest.current.text;
    let error: unknown;
    let failed = false;
    try {
      if (await latest.current.onCopy(snapshot) === false) { failed = true; error = new Error('Copy operation failed'); }
    } catch (cause) { failed = true; error = cause; }
    if (!current()) return;
    pending.current = false;
    setState(failed ? 'error' : 'copied');
    timer.current = setTimeout(() => { if (current()) setState('idle'); }, 2000);
    if (failed) latest.current.onCopyError?.(error);
    else latest.current.onCopied?.();
  };
  return { state, copy };
}
