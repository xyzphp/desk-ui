import { useEffect, useRef, useState, type RefObject } from 'react';
import { useModalDialog } from '../foundation/useModalDialog';
import { Window, type WindowGeometry, type WindowProps } from './Window';

export interface WindowDialogProps extends Pick<
  WindowProps,
  | 'title'
  | 'geometry'
  | 'onGeometryChange'
  | 'maximized'
  | 'onToggleMaximize'
  | 'titlebarActions'
  | 'titlebarControls'
  | 'minWidth'
  | 'minHeight'
  | 'scrollable'
  | 'children'
  | 'className'
> {
  open: boolean;
  onCancel: () => void;
  initialFocus?: RefObject<HTMLElement | null>;
}

/** Original embedded-bookmark window bounds, without storing layout or reading child content. */
export function fitDialogGeometry(
  geometry: WindowGeometry,
  width: number,
  height: number,
  minWidth = 360,
  minHeight = 260,
) {
  const edge = 12;
  const top = Math.min(36, Math.max(edge, height - edge));
  const maximumWidth = Math.max(1, width - edge * 2);
  const maximumHeight = Math.max(1, height - top - edge);
  const nextWidth = Math.min(maximumWidth, Math.max(Math.min(minWidth, maximumWidth), geometry.width));
  const nextHeight = Math.min(maximumHeight, Math.max(Math.min(minHeight, maximumHeight), geometry.height));
  return {
    x: Math.max(edge, Math.min(geometry.x, width - nextWidth - edge)),
    y: Math.max(top, Math.min(geometry.y, height - nextHeight - edge)),
    width: nextWidth,
    height: nextHeight,
  };
}

export function WindowDialog({
  open,
  onCancel,
  initialFocus,
  geometry,
  onGeometryChange,
  minWidth = 360,
  minHeight = 260,
  ...props
}: WindowDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [bounds, setBounds] = useState(() =>
    typeof window === 'undefined'
      ? { width: 1280, height: 800 }
      : { width: window.innerWidth, height: window.innerHeight },
  );
  useEffect(() => {
    if (!open) return;
    const resize = () => setBounds({ width: window.innerWidth, height: window.innerHeight });
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [open]);
  useModalDialog(dialog, open, () => {
    // 先找窗口内容里的控件；标题栏的红黄绿按钮只在内容没有可聚焦项时兜底，避免打开时标题栏出现焦点描边。
    const selector = 'button:not(:disabled), input:not(:disabled), iframe';
    const first =
      dialog.current?.querySelector<HTMLElement>(`.ds-window-body :is(${selector})`) ??
      dialog.current?.querySelector<HTMLElement>(selector);
    (initialFocus?.current ?? first ?? dialog.current)?.focus({ preventScroll: true });
  });
  if (!open) return null;
  const fit = (value: WindowGeometry) => fitDialogGeometry(value, bounds.width, bounds.height, minWidth, minHeight);
  const visible = fit(geometry);
  return (
    <dialog
      ref={dialog}
      className="ds-dialog-layer ds-dialog-layer--window"
      aria-label={props.title}
      aria-modal="true"
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') event.stopPropagation();
      }}
    >
      <Window
        {...props}
        role="presentation"
        geometry={visible}
        minWidth={Math.min(minWidth, visible.width)}
        minHeight={Math.min(minHeight, visible.height)}
        onGeometryChange={onGeometryChange ? (value) => onGeometryChange(fit(value)) : undefined}
        onClose={onCancel}
      />
    </dialog>
  );
}
