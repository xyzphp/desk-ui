import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { useModalDialog } from '../foundation/useModalDialog';
import { Button, IconButton } from '../primitives/Button';

export interface ImagePreviewItem {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

export interface ImagePreviewLabels {
  close: string;
  previous: string;
  next: string;
  loading: string;
  error: string;
  retry: string;
  empty: string;
  count: (index: number, total: number) => string;
  zoomOut: string;
  zoomIn: string;
  resetZoom: string;
}

export interface ImagePreviewProps {
  open: boolean;
  label: string;
  items: readonly ImagePreviewItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
  labels: ImagePreviewLabels;
  /** Optional host-owned controls, such as a permission-checked download action. */
  toolbarActions?: ReactNode;
  /** Enables the original QuickLook zoom, wheel and pan controls. */
  zoomable?: boolean;
  className?: string;
}

function safeImageSource(value: string) {
  const source = value.trim();
  if (!source || /[\u0000-\u001f\u007f]/.test(source)) return false;
  if (/^data:/i.test(source)) return /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon);base64,/i.test(source);
  try {
    const url = new URL(source, 'https://preview.invalid/');
    return ['https:', 'http:', 'blob:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function PreviewImage({ item, labels }: { item: ImagePreviewItem; labels: ImagePreviewLabels }) {
  const safe = safeImageSource(item.src);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(safe ? 'loading' : 'error');
  const [attempt, setAttempt] = useState(0);
  return (
    <>
      {safe && (
        <img
          key={attempt}
          className="ds-image-preview-media"
          src={item.src.trim()}
          alt={item.alt}
          referrerPolicy="no-referrer"
          hidden={state !== 'loaded'}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
      {state !== 'loaded' && (
        <div className="ds-image-preview-status">
          <p role="status" aria-live="polite">
            {state === 'error' ? labels.error : labels.loading}
          </p>
          {state === 'error' && safe && (
            <Button
              className="ds-image-preview-button"
              onClick={() => {
                setState('loading');
                setAttempt((value) => value + 1);
              }}
            >
              {labels.retry}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

/** 原生模态 dialog，沿用文件管理与桌面便签的预览外观，不包含图片处理或数据请求。 */
export function ImagePreview({
  open,
  label,
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  onClose,
  labels,
  toolbarActions,
  zoomable = false,
  className,
}: ImagePreviewProps) {
  const [current, setCurrent] = useControllable(index, defaultIndex, onIndexChange);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const backdropPress = useRef(false);
  const panStart = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number } | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const shown = Math.max(0, Math.min(items.length - 1, Number.isFinite(current) ? Math.floor(current) : 0));
  const item = items[shown];

  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [shown]);

  useModalDialog(dialog, open, () => close.current?.focus());

  const move = (step: number) => {
    const next = Math.max(0, Math.min(items.length - 1, shown + step));
    if (item && next !== shown) setCurrent(next);
  };
  const setScale = (value: number) => {
    const next = Math.max(0.25, Math.min(5, Math.round(value * 100) / 100));
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!zoomable) return;
    event.preventDefault();
    setScale(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  };
  const onPanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!zoomable || zoom <= 1 || event.button !== 0 ||
      target !== event.currentTarget && !target.closest('.ds-image-preview-canvas')) return;
    panStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    backdropPress.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = panStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setPan({ x: start.panX + event.clientX - start.x, y: start.panY + event.clientY - start.y });
  };
  const onPanEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panStart.current?.pointerId !== event.pointerId) return;
    panStart.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const isBackdrop = (target: EventTarget | null) =>
    target === dialog.current || (target instanceof HTMLElement && target.dataset.imagePreviewBackdrop !== undefined);

  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      className={cx('ds-image-preview', 'ds-scrollable', className)}
      aria-label={label}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onPointerDown={(event) => {
        backdropPress.current = isBackdrop(event.target);
      }}
      onClick={(event) => {
        if (backdropPress.current && isBackdrop(event.target)) onClose();
        backdropPress.current = false;
      }}
      onKeyDown={(event) => {
        // Escape 由原生 cancel 事件处理，避免同时关闭宿主窗口。
        if (event.key === 'Escape') {
          event.stopPropagation();
          return;
        }
        if (
          event.isDefaultPrevented() ||
          event.nativeEvent.isComposing ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        } else if (zoomable && ['+', '=', '-', '_', '0'].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          setScale(event.key === '0' ? 1 : zoom + (event.key === '+' || event.key === '=' ? 0.25 : -0.25));
        }
      }}
    >
      <header className="ds-image-preview-toolbar">
        <div className="ds-image-preview-info"><strong className="ds-image-preview-title">{item?.title || label}</strong>
          {item?.description && <span className="ds-image-preview-meta">{item.description}</span>}</div>
        {items.length > 1 && (
          <div className="ds-image-preview-navigation">
            <IconButton
              className="ds-image-preview-button"
              icon="chevron-left"
              label={labels.previous}
              disabled={shown === 0}
              onClick={() => move(-1)}
            />
            <span className="ds-image-preview-count" role="status">
              {labels.count(shown + 1, items.length)}
            </span>
            <IconButton
              className="ds-image-preview-button"
              icon="chevron-right"
              label={labels.next}
              disabled={shown === items.length - 1}
              onClick={() => move(1)}
            />
          </div>
        )}
        {toolbarActions && <div className="ds-image-preview-actions">{toolbarActions}</div>}
        {zoomable && <div className="ds-image-preview-zoom">
          <IconButton
            className="ds-image-preview-button"
            icon="zoom-out"
            label={labels.zoomOut}
            disabled={zoom <= 0.25}
            onClick={() => setScale(zoom - 0.25)}
          />
          <span className="ds-image-preview-count" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <IconButton className="ds-image-preview-button" icon="zoom-in" label={labels.zoomIn} disabled={zoom >= 5} onClick={() => setScale(zoom + 0.25)} />
          <IconButton className="ds-image-preview-button" icon="maximize-2" label={labels.resetZoom} onClick={() => setScale(1)} />
        </div>}
        <IconButton ref={close} className="ds-image-preview-button" icon="x" label={labels.close} onClick={onClose} />
      </header>
      <div className="ds-image-preview-stage" data-image-preview-backdrop="" data-zoomable={zoomable || undefined}
        onWheel={onWheel} onPointerDown={onPanStart} onPointerMove={onPanMove} onPointerUp={onPanEnd} onPointerCancel={onPanEnd}>
        {item ? (
          <div className="ds-image-preview-canvas" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            <PreviewImage key={String(shown) + ':' + item.src} item={item} labels={labels} />
          </div>
        ) : (
          <p role="status">{labels.empty}</p>
        )}
      </div>
    </dialog>
  );
}
