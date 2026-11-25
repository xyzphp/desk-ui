import { useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import type { IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { Button } from '../primitives/Button';
import { Notice } from '../primitives/Feedback';

export interface MessageComposerLabels {
  send: string;
  sending: string;
  stop: string;
}

export interface MessageComposerProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 原始文本，不自动清空；调用方同步设置 busy，并处理异步结果与错误。 */
  onSend: (value: string) => void;
  onStop?: () => void;
  busy?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** 附件等可独立发送时由调用方显式启用。 */
  allowEmpty?: boolean;
  sendOnEnter?: boolean;
  /** Disable sending while retaining an editable draft, for example while offline or awaiting confirmation. */
  sendDisabled?: boolean;
  attachments?: ReactNode;
  tools?: ReactNode;
  status?: ReactNode;
  error?: ReactNode;
  labels: MessageComposerLabels;
  /** 发送按钮的图标，默认无图标（对齐原生样式）；传 null 或省略时不显示图标。 */
  sendIcon?: IconName | null;
  inputProps?: Omit<ComponentProps<'textarea'>, 'children' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'readOnly' | 'aria-label'>;
}

/** 消息草稿、附件 / 工具插槽与发送动作，复用 .workspace-composer 的原生布局。 */
export function MessageComposer({
  label, value, defaultValue = '', onValueChange, onSend, onStop, busy = false, disabled = false, readOnly = false,
  allowEmpty = false, sendOnEnter = true, sendDisabled = false, attachments, tools, status, error, labels, sendIcon, inputProps = {}, className, ...rest
}: MessageComposerProps) {
  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);
  const input = useRef<HTMLTextAreaElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const initialValue = useRef(defaultValue);
  const id = useId();
  const { ref, className: inputClassName, onKeyDown, onCompositionStart, onCompositionEnd, onInput, ...nativeProps } = inputProps;
  const blocked = disabled || readOnly || busy;
  const canSend = !blocked && !sendDisabled && (allowEmpty || draft.trim().length > 0);
  const describedBy = [nativeProps['aria-describedby'], error ? id + '-error' : '', status ? id + '-status' : ''].filter(Boolean).join(' ') || undefined;
  useImperativeHandle(ref, () => input.current!, []);

  const resize = () => {
    const node = input.current;
    if (!node) return;
    node.style.height = '0px';
    node.style.height = Math.max(32, node.scrollHeight) + 'px';
  };
  useLayoutEffect(resize, [draft]);
  useEffect(() => {
    const node = surface.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    let width = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width !== width) { width = entry.contentRect.width; resize(); }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useFormReset(input, () => { if (value === undefined) setDraft(initialValue.current); }, inputProps.form);

  const send = () => { if (canSend) onSend(draft); };

  return (
    <div className={cx('ds-message-composer', className)} role="group" aria-label={label} aria-busy={busy || undefined} {...rest}>
      <div ref={surface} className={cx('ds-message-composer-surface', (disabled || readOnly) && 'is-disabled')}>
        {attachments && <fieldset className="ds-message-composer-attachments" disabled={blocked}>{attachments}</fieldset>}
        <textarea
          {...nativeProps} ref={input} className={cx('ds-control-input ds-message-composer-input ds-scrollable', inputClassName)}
          aria-label={label} aria-describedby={describedBy} aria-invalid={error ? true : nativeProps['aria-invalid']}
          rows={nativeProps.rows ?? 1} value={draft} disabled={disabled} readOnly={readOnly || busy}
          onChange={(event) => { if (!blocked) setDraft(event.currentTarget.value); }}
          onInput={(event) => { onInput?.(event); resize(); queueMicrotask(resize); }}
          onCompositionStart={(event) => { composing.current = true; onCompositionStart?.(event); }}
          onCompositionEnd={(event) => { composing.current = false; onCompositionEnd?.(event); }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !sendOnEnter || event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
            if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault();
            event.stopPropagation();
            send();
          }}
        />
        {tools && <fieldset className="ds-message-composer-tools" disabled={blocked}>{tools}</fieldset>}
        <div className="ds-message-composer-actions">
          {busy && onStop
            ? <Button icon="square" disabled={disabled} onClick={onStop}>{labels.stop}</Button>
            : <Button variant="primary" icon={sendIcon ?? undefined} disabled={!canSend} onClick={send}>{busy ? labels.sending : labels.send}</Button>}
        </div>
      </div>
      {error && <Notice id={id + '-error'} tone="error">{error}</Notice>}
      {status && <div id={id + '-status'} className="ds-message-composer-status" role="status" aria-live="polite">{status}</div>}
    </div>
  );
}
