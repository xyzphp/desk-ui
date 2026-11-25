import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createMarkdownHistory, type MarkdownSnapshot } from './markdownEditing';

export function markdownSnapshot(input: HTMLTextAreaElement): MarkdownSnapshot {
  return { source: input.value, start: input.selectionStart, end: input.selectionEnd };
}
export function useMarkdownHistory(input: RefObject<HTMLTextAreaElement | null>, value: string, key?: string | number) {
  const history = useRef(createMarkdownHistory(value));
  const observed = useRef({ value, key });
  const expected = useRef<string | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [availability, setAvailability] = useState({ canUndo: false, canRedo: false });
  const update = useCallback(() => {
    const current = input.current?.value ?? observed.current.value;
    setAvailability({ canUndo: history.current.canUndo(current), canRedo: history.current.canRedo(current) });
  }, [input]);
  const cancel = useCallback(() => clearTimeout(timer.current), []);
  const reset = useCallback((source: string) => { cancel(); history.current.init(source); update(); }, [cancel, update]);
  useEffect(() => () => { clearTimeout(timer.current); }, []);
  useLayoutEffect(() => {
    const previous = observed.current;
    if (key !== previous.key || value !== previous.value && value !== expected.current) reset(value);
    observed.current = { value, key }; expected.current = undefined;
  }, [value, key, reset]);
  const flush = () => {
    cancel(); if (input.current) history.current.record(markdownSnapshot(input.current)); update();
  };
  const changed = (next: string) => {
    expected.current = next; cancel(); update();
    timer.current = setTimeout(flush, 350);
  };
  const remember = () => {
    if (input.current && history.current.stack[history.current.index]?.source === input.current.value) {
      history.current.record(markdownSnapshot(input.current));
    }
  };
  const expect = (source: string) => { expected.current = source; cancel(); update(); };
  return { history, expected, ...availability, reset, flush, changed, remember, update, cancel, expect };
}
