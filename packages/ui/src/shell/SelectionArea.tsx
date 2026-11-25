import { useEffect, useId, useImperativeHandle, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { useLabels } from '../foundation/ConfigProvider';
import { usePointerGesture, type PointerPoint } from '../foundation/usePointerGesture';

export interface SelectionAreaLabels {
  instructions: string;
  count: (count: number) => string;
}
export interface SelectionAreaProps extends Omit<ComponentProps<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  label: string;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (ids: string[]) => void;
  disabledIds?: readonly string[];
  disabled?: boolean;
  labels?: Partial<SelectionAreaLabels>;
  children: ReactNode | ((preview: readonly string[]) => ReactNode);
}
interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface SelectionSession {
  root: HTMLDivElement;
  start: PointerPoint;
  base: readonly string[];
  retained: readonly string[];
  revision: string;
  entries: { id: string; element: HTMLElement; bounds: Bounds }[];
}
const interactive = 'button,a,label,input,textarea,select,[contenteditable="true"],[role="button"],[data-no-selection]';
function localPoint(root: HTMLElement, point: PointerPoint): PointerPoint {
  const bounds = root.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(root.scrollWidth, point.x - bounds.left + root.scrollLeft)),
    y: Math.max(0, Math.min(root.scrollHeight, point.y - bounds.top + root.scrollTop)),
  };
}
function selectionPreview(session: SelectionSession, point: PointerPoint) {
  const end = localPoint(session.root, point);
  const box = {
    left: Math.min(session.start.x, end.x),
    top: Math.min(session.start.y, end.y),
    width: Math.abs(end.x - session.start.x),
    height: Math.abs(end.y - session.start.y),
  };
  const hits = session.entries
    .filter(
      ({ element, bounds }) =>
        element.isConnected &&
        box.width > 2 &&
        box.height > 2 &&
        bounds.left < box.left + box.width &&
        bounds.left + bounds.width > box.left &&
        bounds.top < box.top + box.height &&
        bounds.top + bounds.height > box.top,
    )
    .map(({ id }) => id);
  return { box, ids: [...new Set([...session.retained, ...session.base, ...hits])] };
}
/** 标记 data-selection-id 即可框选；只在结束时提交，内部输入与按钮不启动框选。 */
export function SelectionArea({
  label,
  value,
  defaultValue = [],
  onValueChange,
  disabledIds = [],
  disabled,
  labels: overrides,
  children,
  className,
  onPointerDown,
  onKeyDown,
  ref,
  ...rest
}: SelectionAreaProps) {
  const labels = useLabels('selectionArea', overrides);
  const [selected, setSelected] = useControllable<readonly string[]>(value, defaultValue, (next) =>
    onValueChange?.([...next]),
  );
  const [preview, setPreview] = useState<{ box: Bounds; ids: string[] } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  const revision = JSON.stringify([selected, disabledIds]);
  const instructions = useId();
  const gesture = usePointerGesture<SelectionSession>({
    move: (session, point) => {
      if (session.revision !== revision) {
        gesture.cancel();
        return;
      }
      setPreview(selectionPreview(session, point));
    },
    finish: (session, point) => {
      setPreview(null);
      if (
        disabled ||
        session.revision !== revision ||
        session.entries.some(({ element }) => !element.isConnected || element.dataset.selectionDisabled === 'true')
      )
        return;
      const next = selectionPreview(session, point).ids;
      if (next.length !== selected.length || next.some((id) => !selected.includes(id))) setSelected(next);
    },
    cancel: () => setPreview(null),
  });
  const { cancel } = gesture;
  useEffect(() => {
    cancel();
  }, [disabled, revision, cancel]);
  return (
    <div
      {...rest}
      ref={root}
      role="group"
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      aria-describedby={[rest['aria-describedby'], instructions].filter(Boolean).join(' ')}
      className={cx('ds-selection-area', preview && 'is-selecting', className)}
      data-selection-area=""
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (disabled || event.defaultPrevented || (event.target as Element).closest(interactive)) return;
        if ((event.target as Element).closest('[data-selection-area]') !== event.currentTarget) return;
        const element = event.currentTarget;
        const origin = element.getBoundingClientRect();
        const nodes = Array.from(element.querySelectorAll<HTMLElement>('[data-selection-id]')).filter(
          (node) => node.closest('[data-selection-area]') === element,
        );
        const entries = nodes
          .filter(
            (node) => !disabledIds.includes(node.dataset.selectionId!) && node.dataset.selectionDisabled !== 'true',
          )
          .map((node) => {
            const bounds = node.getBoundingClientRect();
            return {
              id: node.dataset.selectionId!,
              element: node,
              bounds: {
                left: bounds.left - origin.left + element.scrollLeft,
                top: bounds.top - origin.top + element.scrollTop,
                width: bounds.width,
                height: bounds.height,
              },
            };
          });
        const additive = event.ctrlKey || event.metaKey || event.shiftKey;
        const session = {
          root: element,
          start: localPoint(element, { x: event.clientX, y: event.clientY }),
          entries,
          revision,
          base: additive ? selected : [],
          retained: selected.filter((id) => !entries.some((entry) => entry.id === id)),
        };
        if (gesture.start(event, session)) {
          element.focus({ preventScroll: true });
          setPreview(selectionPreview(session, { x: event.clientX, y: event.clientY }));
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          disabled ||
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          (event.target as Element).closest('input,textarea,select,[contenteditable]')
        )
          return;
        if (event.key === 'Escape') {
          if (gesture.cancel()) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && root.current) {
          event.preventDefault();
          gesture.cancel();
          const ids = Array.from(root.current.querySelectorAll<HTMLElement>('[data-selection-id]'))
            .filter(
              (node) =>
                node.closest('[data-selection-area]') === root.current && node.dataset.selectionDisabled !== 'true',
            )
            .map((node) => node.dataset.selectionId!)
            .filter((id) => !disabledIds.includes(id));
          setSelected([...new Set([...selected, ...ids])]);
        }
      }}
    >
      <span id={instructions} className="ds-visually-hidden">
        {labels.instructions}
      </span>
      {typeof children === 'function' ? children(preview?.ids ?? selected) : children}
      {preview && <div className="ds-selection-box" aria-hidden="true" style={preview.box} />}
      <span className="ds-visually-hidden" role="status">
        {labels.count((preview?.ids ?? selected).length)}
      </span>
    </div>
  );
}
