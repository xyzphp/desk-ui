import { useImperativeHandle, useRef, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useBusyFocus } from '../foundation/useBusyFocus';
import { Spinner } from '../shell/Pickers';

export interface LoadingOverlayProps extends ComponentProps<'div'> {
  loading: boolean;
  label?: string;
  labels?: Partial<{ loading: string }>;
}
/** 子树保持挂载；inert 阻断焦点与操作，fieldset 暂时禁用原生表单字段。 */
export function LoadingOverlay({ loading, label, labels: overrides, children, ref, className, onFocusCapture, ...rest }: LoadingOverlayProps) {
  const labels = useLabels('loadingOverlay', overrides);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useBusyFocus(root, true, loading, () => {
    const target = previous.current;
    if (target?.isConnected && content.current?.contains(target) && !target.matches(':disabled') && !target.closest('[inert]')) {
      target.focus({ preventScroll: true });
    }
  });
  return <><div {...rest} ref={root} tabIndex={rest.tabIndex ?? -1} aria-busy={loading || undefined}
    className={cx('ds-loading-overlay', className)} onFocusCapture={(event) => {
      if (event.target instanceof HTMLElement && content.current?.contains(event.target)) previous.current = event.target;
      onFocusCapture?.(event);
    }}>
    <fieldset className="ds-loading-fields" disabled={loading}><div ref={content} inert={loading || undefined}>{children}</div></fieldset>
    {loading && <div className="ds-loading-veil" onPointerDown={(event) => { event.preventDefault(); root.current?.focus(); }}
      onClick={(event) => event.stopPropagation()}>
      <span aria-hidden="true"><Spinner label={label ?? labels.loading} /></span>
      <span aria-hidden="true">{label ?? labels.loading}</span>
    </div>}
  </div><span role="status" className="ds-visually-hidden">{loading ? label ?? labels.loading : ''}</span></>;
}
