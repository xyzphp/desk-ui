import {
  useId,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { floatingPosition, type FloatingPlacement } from '../foundation/floatingPosition';
import { useControllable } from '../foundation/useControllable';
import { Button } from './Button';

export interface CoachmarkLabels {
  close: string;
  done: string;
  skip: string;
  prev: string;
  next: string;
  finish: string;
  step: (current: number, total: number) => string;
}

/** done：主按钮「知道了」；close：右上角关闭；escape：键盘 Esc。 */
export type CoachmarkCloseReason = 'done' | 'close' | 'escape';

export interface CoachmarkProps extends Omit<ComponentProps<'div'>, 'title' | 'children' | 'ref'> {
  open: boolean;
  /** 气泡指向的元素；缺省、未挂载或已移除时居中显示，并在聚光模式下压暗整个视口。 */
  target?: HTMLElement | null;
  title: string;
  /** 说明正文。 */
  children?: ReactNode;
  placement?: FloatingPlacement;
  /** 压暗目标以外的区域并给目标加一圈强调描边；不拦截指针，用户仍可直接操作目标。 */
  spotlight?: boolean;
  /** 底栏左侧的附加信息，如步骤计数。 */
  meta?: ReactNode;
  /** 替换默认的「知道了」按钮；最后一个按钮获得初始焦点。 */
  actions?: ReactNode;
  onClose: (reason: CoachmarkCloseReason) => void;
  labels?: Partial<CoachmarkLabels>;
}

const gap = 12;
const spotPadding = 4;
const arrowInset = 16;

type Side = 'top' | 'bottom' | 'left' | 'right';
function sideOf(box: { left: number; top: number; right: number; bottom: number }, target: DOMRect): Side | undefined {
  if (box.top >= target.bottom - 1) return 'bottom';
  if (box.bottom <= target.top + 1) return 'top';
  if (box.left >= target.right - 1) return 'right';
  if (box.right <= target.left + 1) return 'left';
  return undefined;
}
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));

/** 聚光层：先于气泡进入顶层，保证气泡叠在压暗层之上。 */
function CoachmarkSpot({ spot }: { spot: RefObject<HTMLDivElement | null> }) {
  useLayoutEffect(() => {
    const node = spot.current;
    if (!node || typeof node.showPopover !== 'function') return;
    node.showPopover();
    return () => {
      if (node.matches(':popover-open')) node.hidePopover();
    };
  }, [spot]);
  return <div ref={spot} popover="manual" className="ds-coachmark-spot" aria-hidden="true" data-empty="true" />;
}

/**
 * 气泡引导：指向某个界面元素的非模态说明卡片，用于首次使用与新功能提示。
 * 位置随目标移动（窗口拖动、程序坞放大）逐帧跟随；外部点击与滚动不会关闭，只能由按钮或 Esc 结束。
 * 组件不记录「是否看过」，由宿主决定何时打开与持久化。
 */
export function Coachmark({
  open,
  target,
  title,
  children,
  placement = 'bottom',
  spotlight = false,
  meta,
  actions,
  onClose,
  labels: overrides,
  className,
  onKeyDown,
  ...rest
}: CoachmarkProps) {
  const labels = useLabels('coachmark', overrides);
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const view = node.ownerDocument.defaultView!;
    const schedule = (callback: () => void) =>
      typeof view.requestAnimationFrame === 'function'
        ? view.requestAnimationFrame(callback)
        : view.setTimeout(callback, 16);
    const cancel = (handle: number) =>
      typeof view.cancelAnimationFrame === 'function' ? view.cancelAnimationFrame(handle) : view.clearTimeout(handle);
    let frame = 0;
    let last = '';
    const sync = () => {
      frame = schedule(sync);
      const rect = target?.isConnected ? target.getBoundingClientRect() : undefined;
      const box = node.getBoundingClientRect();
      const viewport = { width: view.innerWidth, height: view.innerHeight };
      const key = [
        rect?.left,
        rect?.top,
        rect?.width,
        rect?.height,
        box.width,
        box.height,
        viewport.width,
        viewport.height,
      ]
        .map(String)
        .join();
      if (key === last) return;
      last = key;
      const position = rect
        ? floatingPosition(rect, box, viewport, placement, gap)
        : { left: Math.max(8, (viewport.width - box.width) / 2), top: Math.max(8, (viewport.height - box.height) / 2) };
      node.style.left = `${position.left}px`;
      node.style.top = `${position.top}px`;
      const shade = spot.current;
      if (shade) {
        shade.dataset.empty = rect ? 'false' : 'true';
        shade.style.left = `${rect ? rect.left - spotPadding : viewport.width / 2}px`;
        shade.style.top = `${rect ? rect.top - spotPadding : viewport.height / 2}px`;
        shade.style.width = `${rect ? rect.width + spotPadding * 2 : 0}px`;
        shade.style.height = `${rect ? rect.height + spotPadding * 2 : 0}px`;
      }
      const placed = {
        left: position.left,
        top: position.top,
        right: position.left + box.width,
        bottom: position.top + box.height,
      };
      const side = rect && sideOf(placed, rect);
      if (!rect || !side) {
        delete node.dataset.side;
        return;
      }
      node.dataset.side = side;
      const offset =
        side === 'top' || side === 'bottom'
          ? clamp(rect.left + rect.width / 2 - placed.left, arrowInset, box.width - arrowInset)
          : clamp(rect.top + rect.height / 2 - placed.top, arrowInset, box.height - arrowInset);
      node.style.setProperty('--ds-coachmark-arrow', `${offset}px`);
    };
    sync();
    return () => cancel(frame);
  }, [open, target, placement]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onClose('escape');
  };

  return (
    <>
      {spotlight && <CoachmarkSpot spot={spot} />}
      <AnchorPopover
        {...rest}
        open
        manual
        dismiss={false}
        initialFocus="last"
        ref={panel}
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={children ? `${id}-body` : undefined}
        className={cx('ds-coachmark', className)}
        onKeyDown={handleKeyDown}
      >
        <div className="ds-coachmark-head">
          <h3 id={`${id}-title`} aria-live="polite">
            {title}
          </h3>
          <Button
            size="sm"
            variant="quiet"
            icon="x"
            className="ds-coachmark-close"
            aria-label={labels.close}
            onClick={() => onClose('close')}
          />
        </div>
        {children && (
          <div className="ds-coachmark-body" id={`${id}-body`} aria-live="polite">
            {children}
          </div>
        )}
        <div className="ds-coachmark-foot">
          {meta != null && <span className="ds-coachmark-meta">{meta}</span>}
          <div className="ds-coachmark-actions">
            {actions ?? (
              <Button size="sm" variant="primary" onClick={() => onClose('done')}>
                {labels.done}
              </Button>
            )}
          </div>
        </div>
      </AnchorPopover>
    </>
  );
}

export interface TourStep {
  /** 稳定标识，便于宿主记录与测试；不显示。 */
  id?: string;
  /** 目标元素；函数在渲染当前步骤时求值，返回 null 时该步居中显示。 */
  target?: HTMLElement | null | (() => HTMLElement | null);
  title: string;
  description?: ReactNode;
  placement?: FloatingPlacement;
}

/** finish：最后一步完成；skip：跳过或关闭；escape：键盘 Esc。 */
export type TourCloseReason = 'finish' | 'skip' | 'escape';

export interface TourProps extends Omit<
  CoachmarkProps,
  'target' | 'title' | 'children' | 'placement' | 'meta' | 'actions' | 'onClose'
> {
  steps: readonly TourStep[];
  /** 受控的当前步骤（从 0 开始）。 */
  current?: number;
  defaultCurrent?: number;
  onCurrentChange?: (index: number) => void;
  /** index 为结束时所在的步骤。 */
  onClose: (reason: TourCloseReason, index: number) => void;
}

/** 多步气泡引导：上一步 / 下一步 / 跳过，最后一步显示「完成」，只有一步时显示「知道了」。默认开启聚光。 */
export function Tour({
  open,
  steps,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  onClose,
  spotlight = true,
  labels: overrides,
  ...rest
}: TourProps) {
  const labels = useLabels('coachmark', overrides);
  const [index, setIndex] = useControllable(current, defaultCurrent, onCurrentChange);
  const total = steps.length;
  const safe = clamp(Math.floor(index), 0, total - 1);
  const step = steps[safe];
  if (!open || !step) return null;
  const target = typeof step.target === 'function' ? step.target() : step.target;
  const last = safe === total - 1;
  return (
    <Coachmark
      {...rest}
      open
      target={target}
      title={step.title}
      placement={step.placement}
      spotlight={spotlight}
      labels={overrides}
      meta={total > 1 ? labels.step(safe + 1, total) : undefined}
      onClose={(reason) => onClose(reason === 'escape' ? 'escape' : reason === 'done' ? 'finish' : 'skip', safe)}
      actions={
        <>
          {!last && (
            <Button size="sm" variant="quiet" onClick={() => onClose('skip', safe)}>
              {labels.skip}
            </Button>
          )}
          {safe > 0 && (
            <Button size="sm" onClick={() => setIndex(safe - 1)}>
              {labels.prev}
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={() => (last ? onClose('finish', safe) : setIndex(safe + 1))}>
            {last ? (total === 1 ? labels.done : labels.finish) : labels.next}
          </Button>
        </>
      }
    >
      {step.description}
    </Coachmark>
  );
}
