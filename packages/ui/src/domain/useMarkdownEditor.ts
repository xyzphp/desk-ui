import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { commitInput } from '../foundation/commitInput';
import { useMarkdownHistory, markdownSnapshot } from './useMarkdownHistory';
import { markdownFormat, type MarkdownFormat, type MarkdownSelection } from './markdownEditing';
import type { MarkdownEditorLabels, MarkdownEditorProps } from './markdownTypes';

export function useMarkdownEditor(props: MarkdownEditorProps, labels: MarkdownEditorLabels) {
  const input = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const replaying = useRef(false);
  const [composition, setComposition] = useState(false);
  const [value, setValue] = useControllable(props.value, props.defaultValue ?? '', props.onValueChange);
  const [mode, setMode] = useControllable(props.mode, props.defaultMode ?? 'edit', props.onModeChange);
  const [error, setError] = useState('');
  const [forceSource, setForceSource] = useState(false);
  const id = useId();
  const { history: historyRef, expected, ...history } = useMarkdownHistory(input, value, props.historyKey);
  const blocked = !!props.disabled || !!props.readOnly || !!props.busy;
  const shownMode = !props.renderPreview || forceSource ? 'edit' : mode;
  useLayoutEffect(() => { if (forceSource) input.current?.focus(); }, [forceSource]);
  useFormReset(input, () => {
    const next = props.value ?? props.defaultValue ?? '';
    if (props.value === undefined) setValue(next);
    if (props.mode === undefined) setMode(props.defaultMode ?? 'edit');
    history.reset(next); setError(''); setForceSource(false);
  }, props.form);
  const selection = (): MarkdownSelection | null => input.current ? { ...markdownSnapshot(input.current), key: props.historyKey } : null;
  const apply = (text: string, point: MarkdownSelection) => {
    const node = input.current;
    if (!node || blocked || composing.current || point.source !== node.value || point.key !== props.historyKey || node.matches(':disabled')) return false;
    if (!Number.isInteger(point.start) || !Number.isInteger(point.end)
      || point.start < 0 || point.end < point.start || point.end > node.value.length) return false;
    const next = point.source.slice(0, point.start) + text + point.source.slice(point.end);
    if (props.maxLength !== undefined && props.maxLength >= 0 && next.length > props.maxLength) {
      setError(labels.tooLong(props.maxLength)); return false;
    }
    history.flush(); commitInput(node, next);
    const caret = point.start + text.length;
    queueMicrotask(() => {
      if (!node.isConnected || node.value !== next) return;
      node.setSelectionRange(caret, caret); history.flush();
      if (shownMode === 'preview') setForceSource(true); else node.focus();
    });
    return true;
  };
  const insert = (text: string, point = selection()) => point ? apply(text, point) : false;
  const format = (type: MarkdownFormat) => {
    const point = selection();
    return point ? apply(markdownFormat(type, point.source.slice(point.start, point.end), labels.samples), point) : false;
  };
  const moveHistory = (direction: -1 | 1) => {
    const node = input.current;
    if (blocked || composing.current || !node || node.matches(':disabled')) return;
    history.flush();
    const previous = historyRef.current.index;
    const index = previous + direction;
    const snapshot = historyRef.current.stack[index];
    if (!snapshot) return;
    historyRef.current.index = index; replaying.current = true; expected.current = snapshot.source;
    commitInput(node, snapshot.source); replaying.current = false;
    if (node.value !== snapshot.source) historyRef.current.index = previous;
    else node.setSelectionRange(snapshot.start, snapshot.end);
    history.update(); node.focus();
  };
  const key = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || blocked || composing.current || event.nativeEvent.isComposing || event.keyCode === 229
      || !event.ctrlKey && !event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'z' || key === 'y') { event.preventDefault(); moveHistory(key === 'y' || event.shiftKey ? 1 : -1); }
    else if (!event.shiftKey && ['b', 'i', 'k'].includes(key)) {
      event.preventDefault(); format(({ b: 'bold', i: 'italic', k: 'link' } as const)[key as 'b' | 'i' | 'k']);
    }
  };
  return {
    input, composing, replaying, composition, setComposition, value, setValue, error, setError, id, blocked, shownMode,
    setForceSource, history, selection, insert, format, moveHistory, key,
    setMode: (next: typeof mode) => { history.flush(); setForceSource(false); setMode(next); },
  };
}
