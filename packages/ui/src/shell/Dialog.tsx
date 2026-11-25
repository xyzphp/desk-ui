import { useId, useRef, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { useLatest } from '../foundation/useLatest';
import { Modal } from './Modal';

export interface DialogAction {
  id?: string;
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}

export interface DialogInput {
  value: string;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  required?: boolean;
  onChange: (value: string) => void;
  /** 输入法组合期间不会触发。 */
  onEnter?: () => void;
}

export interface SystemDialogProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  input?: DialogInput;
  actions: readonly DialogAction[];
  onCancel?: () => void;
  busy?: boolean;
  status?: ReactNode;
  error?: ReactNode;
  /** 默认不允许点击背景取消。 */
  closeOnBackdrop?: boolean;
  /** 首次打开时聚焦输入框或指定动作；未指定时优先输入框，再选第一个可用动作。 */
  initialFocus?: 'input' | number;
  selectInputOnOpen?: boolean;
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

/** 原生模态层，复用原系统 .dialog 外观。仅回调动作，不自动关闭、执行请求或排队。 */
export function SystemDialog({
  open, title, message, input, actions, onCancel, busy = false, status, error, closeOnBackdrop = false,
  initialFocus, selectInputOnOpen = true, role = 'dialog', className,
}: SystemDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const composing = useRef(false);

  const id = useId();
  const focusOptions = useLatest({ initialFocus, selectInputOnOpen });

  const focusInitial = () => {
    const node = dialog.current;
    if (!node) return;
    const { initialFocus: target, selectInputOnOpen: select } = focusOptions.current;
    const preferred = typeof target === 'number'
      ? node.querySelector<HTMLButtonElement>(`[data-dialog-action="${target}"]:not(:disabled)`) : null;
    const first = node.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled)');
    const focus = preferred ?? (target === 'input' || target === undefined ? field.current : null) ?? first ?? node;
    focus.focus({ preventScroll: true });
    if (focus === field.current && select) field.current?.select();
  };

  if (!open) return null;
  return (
    <Modal
      ref={dialog} open={open} title={title} description={message} onCancel={onCancel} busy={busy}
      closeOnBackdrop={closeOnBackdrop} closable={false} size="sm" role={role}
      className={cx('ds-dialog', className)}
      onOpenFocus={() => { composing.current = false; focusInitial(); }}
    >
        {input && <div className="ds-dialog-field">
          <label htmlFor={id + '-input'} className={input.label ? 'ds-dialog-label' : 'ds-visually-hidden'}>{input.label || title}</label>
          <div className="ds-dialog-input-surface">
            <input
              className="ds-control-input"
              ref={field} id={id + '-input'} type="text" value={input.value} placeholder={input.placeholder}
              maxLength={input.maxLength} required={input.required} readOnly={busy} aria-invalid={error ? true : undefined}
              aria-describedby={error ? id + '-error' : undefined}
              onChange={(event) => { if (!busy) input.onChange(event.currentTarget.value); }}
              onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.stopPropagation();
                if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
                event.preventDefault();
                if (!busy && !event.repeat && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) input.onEnter?.();
              }}
            />
          </div>
        </div>}
        {error && <div id={id + '-error'} className="ds-dialog-error" role="alert">{error}</div>}
        {status && <div className="ds-dialog-status" role="status" aria-live="polite">{status}</div>}
        <div className="ds-dialog-actions">
          {actions.map((action, index) => <button
            key={action.id ?? index} type="button" data-dialog-action={index}
            className={action.variant && action.variant !== 'default' ? `is-${action.variant}` : undefined}
            disabled={busy || action.disabled}
            onClick={() => { if (!busy && !action.disabled) action.onClick?.(); }}
          >{action.label}</button>)}
        </div>
    </Modal>
  );
}

interface DialogContentProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  error?: ReactNode;
  status?: ReactNode;
  busy?: boolean;
  className?: string;
}

export interface ConfirmDialogProps extends DialogContentProps {
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmDisabled?: boolean;
  busyLabel?: string;
  closeOnBackdrop?: boolean;
}

/** 普通 / 危险确认共用一套行为；默认聚焦取消，忙碌时阻止再次确认与取消。 */
export function ConfirmDialog({
  confirmLabel, cancelLabel, onConfirm, onCancel, danger = false, confirmDisabled, busyLabel, ...rest
}: ConfirmDialogProps) {
  return <SystemDialog {...rest} role="alertdialog" initialFocus={0} onCancel={onCancel} actions={[
    { id: 'cancel', label: cancelLabel, onClick: onCancel },
    { id: 'confirm', label: rest.busy && busyLabel ? busyLabel : confirmLabel, variant: danger ? 'danger' : 'primary',
      disabled: confirmDisabled, onClick: onConfirm },
  ]} />;
}

export interface PromptDialogProps extends DialogContentProps {
  inputLabel: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  busyLabel?: string;
  selectInputOnOpen?: boolean;
}

/** 简短输入确认：草稿不随关闭自动清空，成功后的清理与失败错误由宿主负责。 */
export function PromptDialog({
  inputLabel, value, defaultValue = '', onValueChange, placeholder, maxLength, required = false,
  confirmLabel, cancelLabel, onConfirm, onCancel, confirmDisabled, busyLabel, selectInputOnOpen = true, ...rest
}: PromptDialogProps) {
  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);
  const limit = maxLength !== undefined && Number.isFinite(maxLength) && maxLength >= 0 ? Math.floor(maxLength) : undefined;
  const blocked = confirmDisabled || (required && draft.trim().length === 0) || (limit !== undefined && draft.length > limit);
  const confirm = () => { if (!blocked && !rest.busy) onConfirm(draft); };
  return <SystemDialog {...rest} onCancel={onCancel} initialFocus="input" selectInputOnOpen={selectInputOnOpen}
    input={{ label: inputLabel, value: draft, onChange: setDraft, onEnter: confirm, placeholder, maxLength: limit, required }} actions={[
      { id: 'cancel', label: cancelLabel, onClick: onCancel },
      { id: 'confirm', label: rest.busy && busyLabel ? busyLabel : confirmLabel, variant: 'primary', disabled: blocked, onClick: confirm },
    ]} />;
}

export interface AlertDialogProps extends Omit<DialogContentProps, 'busy' | 'error'> {
  confirmLabel: string;
  onConfirm: () => void;
}

/** 需要明确知晓的单按钮提示；普通消息使用 Notice / Notification。 */
export function AlertDialog({ confirmLabel, onConfirm, ...rest }: AlertDialogProps) {
  return <SystemDialog {...rest} role="alertdialog" onCancel={onConfirm} initialFocus={0}
    actions={[{ id: 'acknowledge', label: confirmLabel, variant: 'primary', onClick: onConfirm }]} />;
}
