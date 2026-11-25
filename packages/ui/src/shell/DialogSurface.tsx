import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useModalDialog } from '../foundation/useModalDialog';
import { useBusyFocus } from '../foundation/useBusyFocus';
import type { ModalLabels, ModalProps } from './Modal';

interface DialogSurfaceProps extends Omit<ModalProps, 'labels'> {
  labels: ModalLabels;
  placement?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  variant?: 'modal' | 'drawer';
}
export function DialogSurface({
  open,
  title,
  description,
  children,
  footer,
  onCancel,
  busy = false,
  closeOnBackdrop = false,
  closable = true,
  draggable = false,
  size = 'md',
  initialFocus,
  onOpenFocus,
  renderNative,
  role = 'dialog',
  labels,
  className,
  ref,
  placement = 'center',
  variant = 'modal',
}: DialogSurfaceProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropPress = useRef(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragGesture = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);
  const id = useId();
  useImperativeHandle(ref, () => dialog.current!);
  const focusInitial = () => {
    if (onOpenFocus) {
      onOpenFocus();
      return;
    }
    const selector = 'input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)';
    const first =
      dialog.current?.querySelector<HTMLElement>('[data-modal-focus]:not(:disabled)') ??
      dialog.current?.querySelector('.ds-modal-content')?.querySelector<HTMLElement>(selector) ??
      dialog.current?.querySelector<HTMLElement>(selector);
    (initialFocus?.current ?? first ?? dialog.current)?.focus({ preventScroll: true });
  };
  useModalDialog(dialog, open, () => {
    backdropPress.current = false;
    focusInitial();
  });
  useBusyFocus(dialog, open, busy, focusInitial);
  useEffect(() => {
    if (!open) {
      dragGesture.current = null;
      setDragOffset({ x: 0, y: 0 });
    }
  }, [open]);
  const canDrag = draggable && variant === 'modal';
  const onDragPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canDrag || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.ds-window-titlebar') || target.closest('.ds-window-controls, .ds-window-titlebar-actions')) return;
    dragGesture.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = dragGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    let dx = event.clientX - gesture.lastX;
    let dy = event.clientY - gesture.lastY;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    if (dy < 0) {
      const top = event.currentTarget.getBoundingClientRect().top;
      if (top + dy < 0) dy = -top;
    }
    if (dx === 0 && dy === 0) return;
    setDragOffset((previous) => ({ x: previous.x + dx, y: previous.y + dy }));
  };
  const onDragPointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = dragGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    dragGesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      role={role}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-busy={busy || undefined}
      className={
        renderNative
          ? cx('ds-scrollable', className)
          : cx(
              'ds-dialog-layer ds-scrollable',
              variant === 'drawer' && 'ds-dialog-layer--drawer',
              `ds-dialog-layer--${placement}`,
            )
      }
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onCancel?.();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') event.stopPropagation();
      }}
      onPointerDown={(event) => {
        backdropPress.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && backdropPress.current && closeOnBackdrop && !busy) onCancel?.();
        backdropPress.current = false;
      }}
    >
      {renderNative ? (
        renderNative({ titleId: `${id}-title`, descriptionId: `${id}-description`, busy })
      ) : (
        <section
          className={cx('ds-modal', variant === 'drawer' && 'ds-drawer', `ds-modal--${size}`, canDrag && 'is-draggable', className)}
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerEnd}
          onPointerCancel={onDragPointerEnd}
          style={canDrag ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` } : undefined}
        >
          <header className="ds-modal-head">
            <h3 id={`${id}-title`}>{title}</h3>
            {closable && (
              <button
                type="button"
                className="ds-modal-close"
                aria-label={labels.close}
                disabled={busy}
                onClick={onCancel}
              >
                <Icon name="x" />
              </button>
            )}
          </header>
          {description && (
            <div id={`${id}-description`} className="ds-modal-description">
              {description}
            </div>
          )}
          <fieldset className="ds-modal-content" disabled={busy}>
            {children}
          </fieldset>
          {footer && (
            <fieldset className="ds-modal-footer" disabled={busy}>
              {footer}
            </fieldset>
          )}
        </section>
      )}
    </dialog>
  );
}
