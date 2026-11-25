import { useId, useImperativeHandle, useRef, type ReactNode } from 'react';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { useBusyFocus } from '../foundation/useBusyFocus';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon } from '../foundation/Icon';
import { Button, type ButtonProps } from './Button';

export interface PopconfirmLabels { confirm: string; cancel: string; working: string }
export interface PopconfirmProps extends Omit<ButtonProps, 'children' | 'title'> {
  label: string;
  title: string;
  description?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  busy?: boolean;
  error?: string;
  danger?: boolean;
  labels?: Partial<PopconfirmLabels>;
}

/** 局部操作确认；宿主在成功后关闭，并提供异步 busy / error。 */
export function Popconfirm({
  label, title, description, open, onOpenChange, onConfirm, onCancel, busy = false, error, danger,
  labels: overrides, disabled, ref, onClick, ...rest
}: PopconfirmProps) {
  const labels = useLabels('popconfirm', overrides);
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();
  useImperativeHandle(ref, () => anchor.current!, []);
  const shown = open && !disabled;
  useBusyFocus(panel, shown, busy, () => cancel.current?.focus({ preventScroll: true }));
  const dismiss = () => { if (!busy) { onOpenChange(false); onCancel?.(); } };
  return <>
    <Button {...rest} ref={anchor} disabled={disabled || busy} aria-haspopup="dialog" aria-expanded={shown}
      aria-controls={shown ? id : undefined} onClick={(event) => {
        onClick?.(event); if (!event.defaultPrevented && !busy) { if (shown) dismiss(); else onOpenChange(true); }
      }}
    >{label}</Button>
    <AnchorPopover open={shown} anchor={anchor} ref={panel} id={id} role="dialog" className="ds-popconfirm"
      initialFocus={busy ? panel : cancel} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}
      aria-busy={busy || undefined} onClose={dismiss}
    >
      <div className="ds-popconfirm-heading"><Icon name={danger ? 'triangle-alert' : 'help-circle'} />
        <h3 id={`${id}-title`}>{title}</h3>
      </div>
      {description && <div className="ds-popconfirm-description" id={`${id}-description`}>{description}</div>}
      {error && <div className="ds-popconfirm-error" role="alert">{error}</div>}
      <div className="ds-popconfirm-actions">
        <Button ref={cancel} size="sm" disabled={busy} onClick={dismiss}>{labels.cancel}</Button>
        <Button size="sm" variant={danger ? 'danger' : 'primary'} disabled={busy} onClick={onConfirm}>
          {busy ? labels.working : labels.confirm}
        </Button>
      </div>
    </AnchorPopover>
  </>;
}
