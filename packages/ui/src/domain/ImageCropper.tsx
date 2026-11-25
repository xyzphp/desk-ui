import { useId, useImperativeHandle, useRef, type ComponentProps, type CSSProperties, type Ref } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { useBusyFocus } from '../foundation/useBusyFocus';
import { Button } from '../primitives/Button';
import { Range } from '../primitives/Field';
import type { CropSize, CropValue } from './cropGeometry';
import type { ImageCropResult } from './cropImage';
import { useImageCropper } from './useImageCropper';

export interface ImageCropperLabels {
  empty: string;
  loading: string;
  loadError: string;
  exportError: string;
  invalidSize: string;
  retry: string;
  zoom: string;
  reset: string;
  center: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
  confirm: string;
  processing: string;
  cancel: string;
  instructions: string;
  dimensions: (width: number, height: number) => string;
  /** 原站结构下输出规格前的说明，含分隔符。 */
  spec: string;
}
export interface ImageCropperProps extends Omit<
  ComponentProps<'section'>,
  'onChange' | 'defaultValue' | 'children' | 'onError'
> {
  label: string;
  source: Blob | null;
  outputSize?: CropSize;
  value?: CropValue;
  defaultValue?: CropValue;
  onValueChange?: (value: CropValue) => void;
  onConfirm?: (result: ImageCropResult) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  mimeType?: 'image/png' | 'image/jpeg';
  quality?: number;
  disabled?: boolean;
  labels?: Partial<ImageCropperLabels>;
  /** Keep the native articles cover-crop classes and block structure. */
  nativeStructure?: boolean;
}

export function ImageCropper(props: ImageCropperProps) {
  const {
    label,
    source,
    outputSize,
    value,
    defaultValue,
    onValueChange,
    onConfirm,
    onCancel,
    onError,
    mimeType,
    quality,
    disabled,
    labels: overrides,
    className,
    style,
    nativeStructure = false,
    ref,
    ...rest
  } = props;
  const labels = useLabels('imageCropper', overrides);
  const { viewport, ...state } = useImageCropper(props);
  const root = useRef<HTMLElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => root.current!, [root]);
  useBusyFocus(root, true, state.busy, () => {
    if (confirm.current && !confirm.current.disabled) confirm.current.focus();
    else (viewport.current ?? root.current)?.focus();
  });
  const id = useId();
  const { output, geometry } = state;
  const failure = !state.valid
    ? labels.invalidSize
    : state.resource.error
      ? labels.loadError
      : state.failed
        ? labels.exportError
        : '';
  const positions = [
    { id: 'left', label: labels.left, value: { ...state.value, x: 1 } },
    { id: 'top', label: labels.top, value: { ...state.value, y: 1 } },
    { id: 'center', label: labels.center, value: { ...state.value, x: 0, y: 0 } },
    { id: 'bottom', label: labels.bottom, value: { ...state.value, y: -1 } },
    { id: 'right', label: labels.right, value: { ...state.value, x: -1 } },
  ];
  const Root = nativeStructure ? 'div' : 'section';
  const ratio = output.width / output.height;
  let viewportWidth = 480;
  let viewportHeight = Math.round(viewportWidth / ratio);
  if (viewportHeight > 240) {
    viewportHeight = 240;
    viewportWidth = Math.round(viewportHeight * ratio);
  }
  return (
    <Root
      {...rest}
      ref={root as unknown as Ref<HTMLDivElement>}
      tabIndex={nativeStructure ? rest.tabIndex : (rest.tabIndex ?? -1)}
      className={cx(nativeStructure ? 'ar-crop-workspace' : 'ds-cropper', className)}
      style={style}
      aria-label={label}
      aria-busy={state.busy || undefined}
    >
      <div className={nativeStructure ? 'ar-crop-viewport-wrap' : 'ds-cropper-stage'}>
        {geometry && state.resource.image ? (
          <div
            ref={viewport}
            role="group"
            tabIndex={props.disabled ? -1 : 0}
            aria-label={props.label}
            aria-describedby={nativeStructure ? undefined : `${id}-instructions`}
            aria-disabled={state.blocked || undefined}
            className={cx(
              nativeStructure ? 'ar-crop-viewport' : 'ds-cropper-viewport',
              state.dragging && 'is-dragging',
            )}
            style={
              nativeStructure
                ? { width: `${viewportWidth}px`, height: `${viewportHeight}px` }
                : {
                    aspectRatio: `${output.width} / ${output.height}`,
                    maxWidth: Math.min(480, (280 * output.width) / output.height),
                  }
            }
            onPointerDown={state.down}
            onPointerMove={state.move}
            onPointerUp={(event) => state.up(event)}
            onPointerCancel={(event) => state.up(event, true)}
            onLostPointerCapture={() => state.stop()}
            onKeyDown={state.key}
          >
            <img
              className={nativeStructure ? 'ar-crop-img' : 'ds-cropper-image'}
              src={state.resource.image.url}
              alt=""
              draggable={false}
              style={{
                width: `${(geometry.width / output.width) * 100}%`,
                height: `${(geometry.height / output.height) * 100}%`,
                left: `${(geometry.left / output.width) * 100}%`,
                top: `${(geometry.top / output.height) * 100}%`,
              }}
            />
            <div className={nativeStructure ? 'ar-crop-grid-overlay' : 'ds-cropper-grid'} aria-hidden="true" />
          </div>
        ) : (
          !failure && <span role="status">{!props.source ? labels.empty : labels.loading}</span>
        )}
      </div>
      {!nativeStructure && (
        <span id={`${id}-instructions`} className="ds-visually-hidden">
          {labels.instructions}
        </span>
      )}
      <div className={nativeStructure ? 'ar-crop-toolbar' : 'ds-cropper-toolbar'}>
        <label className={nativeStructure ? 'ar-crop-zoom-group' : 'ds-cropper-zoom'}>
          <span>{labels.zoom}</span>
          {nativeStructure ? (
            <input
              type="range"
              className="workspace-range"
              aria-label={labels.zoom}
              min={1}
              max={3}
              step={0.01}
              value={state.value.zoom}
              disabled={state.blocked}
              style={{ '--range-fill': `${((state.value.zoom - 1) / 2) * 100}%` } as CSSProperties}
              onChange={(event) => state.update({ ...state.value, zoom: Number(event.currentTarget.value) })}
            />
          ) : (
            <Range
              aria-label={labels.zoom}
              min={1}
              max={3}
              step={0.01}
              value={state.value.zoom}
              disabled={state.blocked}
              onValueChange={(zoom) => state.update({ ...state.value, zoom })}
            />
          )}
          {nativeStructure ? (
            <span data-ar-crop-zoom-val>{Math.round(state.value.zoom * 100)}%</span>
          ) : (
            <output>{Math.round(state.value.zoom * 100)}%</output>
          )}
        </label>
        <div className={nativeStructure ? 'ar-crop-pos-btns' : 'ds-cropper-actions'}>
          {(nativeStructure && ratio > 1.5
            ? positions.filter((position) => ['top', 'center', 'bottom'].includes(position.id))
            : positions
          ).map((position) =>
            nativeStructure ? (
              <button
                key={position.id}
                type="button"
                className="workspace-button"
                data-ar-pos={position.id}
                disabled={state.blocked}
                onClick={() => state.update(position.value)}
              >
                {position.label}
              </button>
            ) : (
              <Button key={position.id} size="sm" disabled={state.blocked} onClick={() => state.update(position.value)}>
                {position.label}
              </Button>
            ),
          )}
        </div>
      </div>
      {failure && (
        <div className={nativeStructure ? 'ar-crop-error' : 'ds-cropper-error'} role="alert">
          {failure}
          {state.resource.error &&
            (nativeStructure ? (
              <button
                type="button"
                className="workspace-button"
                disabled={props.disabled}
                onClick={state.resource.retry}
              >
                {labels.retry}
              </button>
            ) : (
              <Button size="sm" disabled={props.disabled} onClick={state.resource.retry}>
                {labels.retry}
              </Button>
            ))}
        </div>
      )}
      <div className={nativeStructure ? 'ar-crop-footer' : 'ds-cropper-footer'}>
        <span className={nativeStructure ? 'ar-crop-summary' : undefined}>
          {nativeStructure ? (
            <>
              {labels.spec}<strong>{state.valid ? labels.dimensions(output.width, output.height) : labels.invalidSize}</strong>
            </>
          ) : state.valid ? (
            labels.dimensions(output.width, output.height)
          ) : (
            labels.invalidSize
          )}
        </span>
        <div className={nativeStructure ? 'ar-crop-actions' : 'ds-cropper-actions'}>
          {!nativeStructure && (
            <Button size="sm" disabled={state.blocked} onClick={() => state.update({ zoom: 1, x: 0, y: 0 })}>
              {labels.reset}
            </Button>
          )}
          {props.onCancel &&
            (nativeStructure ? (
              <button
                type="button"
                className="workspace-button"
                data-ar-reselect-img
                disabled={props.disabled}
                onClick={state.cancel}
              >
                <Icon className="xyz-icon" name="image" strokeWidth={2} />
                {labels.cancel}
              </button>
            ) : (
              <Button size="sm" disabled={props.disabled} onClick={state.cancel}>
                {labels.cancel}
              </Button>
            ))}
          {props.onConfirm &&
            (nativeStructure ? (
              <button
                ref={confirm}
                type="button"
                className="workspace-button is-primary"
                data-ar-apply-crop
                disabled={state.blocked}
                onClick={() => void state.confirm()}
              >
                <Icon className="xyz-icon" name="check" strokeWidth={2} />
                {state.busy ? labels.processing : labels.confirm}
              </button>
            ) : (
              <Button
                ref={confirm}
                size="sm"
                variant="primary"
                disabled={state.blocked}
                onClick={() => void state.confirm()}
              >
                {state.busy ? labels.processing : labels.confirm}
              </Button>
            ))}
        </div>
      </div>
    </Root>
  );
}
