import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent,
} from 'react';
import { createDragGhost, type DragGhost } from '../foundation/dragGhost';
import { insertionIndex, reorderIds, sameOrder } from './sortableModel';
import type { SortableListLabels, SortableListProps } from './SortableList';

const transferType = 'application/x-component-sort';

interface SortSession {
  id: string;
  order: readonly string[];
  locked: readonly string[];
  to: number;
  kind: 'native' | 'pointer' | 'keyboard';
  pointer?: number;
  x?: number;
  y?: number;
  handle?: HTMLElement;
  moved?: boolean;
}

interface RowPress {
  id: string;
  pointer: number;
  x: number;
  y: number;
  order: readonly string[];
  locked: readonly string[];
  row: HTMLLIElement;
  timer: number;
  active: boolean;
}

export function useSortableList(props: SortableListProps, labels: SortableListLabels) {
  const root = useRef<HTMLUListElement>(null);
  const session = useRef<SortSession | null>(null);
  const rowPress = useRef<RowPress | null>(null);
  // 指针拖动（触屏手柄、长按整行）没有浏览器拖动图像，用跟随指针的影子补齐；鼠标手柄走 HTML5 拖拽，由浏览器绘制。
  const ghost = useRef<DragGhost | null>(null);
  const suppressClick = useRef(false);
  const suppressRowClick = useRef<string | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rowClickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const [active, setActive] = useState<SortSession | null>(null);
  const [message, setMessage] = useState('');
  const order = props.items.map((item) => item.id);
  const locked = new Set(props.items.filter((item) => item.disabled).map((item) => item.id));
  const blocked = !!props.disabled || !!props.readOnly;

  const focus = (item: string) => {
    const control = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-sort-handle]') ?? []).find(
      (element) => element.dataset.sortHandle === item,
    );
    control?.focus({ preventScroll: true });
  };

  const dropGhost = () => {
    ghost.current?.destroy();
    ghost.current = null;
  };

  const follow = (current: SortSession, x: number, y: number) => {
    if (!ghost.current) {
      const row = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-sort-id]') ?? []).find(
        (element) => element.dataset.sortId === current.id,
      );
      if (!row) return;
      // 挂在列表内，保留宿主对行内容的作用域样式；fixed 定位不占位、不受列表滚动影响。
      ghost.current = createDragGhost(
        row,
        { x: current.x ?? x, y: current.y ?? y },
        {
          host: root.current ?? undefined,
          className: 'ds-sortable-ghost',
          removeClasses: ['is-dragging', 'is-drag-source', 'is-before', 'is-after'],
        },
      );
    }
    ghost.current.move({ x, y });
  };

  const finish = () => {
    dropGhost();
    const current = session.current;
    session.current = null;
    setActive(null);
    if (current?.pointer !== undefined && current.handle?.hasPointerCapture?.(current.pointer)) {
      current.handle.releasePointerCapture(current.pointer);
    }
    return current;
  };

  const cancel = () => {
    const current = finish();
    if (current) {
      setMessage(labels.cancelled);
      focus(current.id);
    }
  };

  const clearRowPress = (press: RowPress) => {
    if (press.timer !== undefined) clearTimeout(press.timer);
    if (rowPress.current === press) rowPress.current = null;
    try {
      if (press.row.hasPointerCapture?.(press.pointer)) press.row.releasePointerCapture(press.pointer);
    } catch {
      // The pointer may already have been released by the browser.
    }
  };

  const valid = () => {
    const current = session.current;
    return current && !blocked && sameOrder(current.order, order) && sameOrder(current.locked, [...locked])
      ? current
      : null;
  };

  useLayoutEffect(() => {
    const pending = rowPress.current;
    if (pending && (blocked || !sameOrder(pending.order, order) || !sameOrder(pending.locked, [...locked]))) {
      clearRowPress(pending);
      if (pending.active) cancel();
    }
    if (session.current && !valid()) cancel();
  });

  useLayoutEffect(
    () => () => {
      clearTimeout(clickTimer.current);
      clearTimeout(rowClickTimer.current);
      if (rowPress.current) clearRowPress(rowPress.current);
      dropGhost();
      const current = session.current;
      rowPress.current = null;
      session.current = null;
      if (current?.pointer !== undefined && current.handle?.hasPointerCapture?.(current.pointer)) {
        current.handle.releasePointerCapture(current.pointer);
      }
    },
    [],
  );

  const lift = (item: string, kind: SortSession['kind']) => {
    if (blocked || locked.has(item) || !order.includes(item)) return null;
    const next: SortSession = { id: item, order, locked: [...locked], to: order.indexOf(item), kind };
    session.current = next;
    setActive({ ...next });
    setMessage(labels.lifted(props.items.find((entry) => entry.id === item)!.label));
    return next;
  };

  const target = (to: number) => {
    const current = valid();
    if (!current || (reorderIds(order, current.id, to, locked) === order && to !== order.indexOf(current.id))) return;
    const next = { ...current, to };
    session.current = next;
    setActive({ ...next });
    const label = props.items.find((item) => item.id === current.id)!.label;
    setMessage(labels.position(label, to + 1, order.length));
  };

  const commit = (item: string, to: number) => {
    if (blocked) return;
    const next = reorderIds(order, item, to, locked);
    if (next === order) return;
    const label = props.items.find((entry) => entry.id === item)!.label;
    props.onOrderChange(next);
    setMessage(labels.moved(label, next.indexOf(item) + 1, next.length));
    queueMicrotask(() => focus(item));
  };

  const drop = () => {
    const current = valid();
    finish();
    if (current) commit(current.id, current.to);
  };

  const targetAt = (element: Element | null, x: number, y: number) => {
    const row = element?.closest<HTMLElement>('[data-sort-id]');
    const current = valid();
    if (!current) return;
    if (!row || row.closest('[data-sort-list]') !== root.current || row.dataset.sortId === current.id) {
      target(order.indexOf(current.id));
      return;
    }
    const rect = row.getBoundingClientRect();
    const after =
      props.orientation === 'horizontal' ? x >= rect.left + rect.width / 2 : y >= rect.top + rect.height / 2;
    const latest = valid();
    if (latest && row.dataset.sortId) {
      const to = insertionIndex(order, latest.id, row.dataset.sortId, after);
      target(reorderIds(order, latest.id, to, locked) === order ? order.indexOf(latest.id) : to);
    }
  };

  const dragStart = (event: DragEvent<HTMLElement>, item: string) => {
    if (event.currentTarget.matches(':disabled') || !event.dataTransfer || !lift(item, 'native')) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    try {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(transferType, id);
    } catch {
      event.preventDefault();
      cancel();
    }
  };

  const dragOver = (event: DragEvent<HTMLUListElement>) => {
    if (valid()?.kind !== 'native' || !Array.from(event.dataTransfer.types).includes(transferType)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    targetAt(event.target as Element, event.clientX, event.clientY);
  };

  const nativeDrop = (event: DragEvent<HTMLUListElement>) => {
    if (valid()?.kind !== 'native') return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.getData(transferType) !== id) {
      cancel();
      return;
    }
    targetAt(event.target as Element, event.clientX, event.clientY);
    drop();
  };

  const pointerDown = (event: PointerEvent<HTMLButtonElement>, item: string) => {
    if (event.pointerType === 'mouse' || event.button !== 0 || event.currentTarget.matches(':disabled')) return;
    const current = lift(item, 'pointer');
    if (!current) return;
    event.preventDefault();
    event.currentTarget.focus();
    suppressClick.current = false;
    Object.assign(current, {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      handle: event.currentTarget,
      moved: false,
    });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = valid();
    if (!current || current.kind !== 'pointer' || current.pointer !== event.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.x!, event.clientY - current.y!) < 4) return;
    current.moved = true;
    suppressClick.current = true;
    follow(current, event.clientX, event.clientY);
    targetAt(
      root.current?.ownerDocument.elementFromPoint?.(event.clientX, event.clientY) ?? (event.target as Element),
      event.clientX,
      event.clientY,
    );
  };

  const pointerUp = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const current = session.current;
    if (current?.pointer !== event.pointerId || current.kind !== 'pointer') return;
    if (cancelled || !current.moved) finish();
    else drop();
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const rowPointerDown = (event: PointerEvent<HTMLLIElement>, item: string) => {
    if (props.dragMode !== 'row' || blocked || event.button !== 0) return;
    if (!event.nativeEvent.isPrimary || !['mouse', 'pen'].includes(event.pointerType)) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('button, input, select, textarea, [data-sort-no-drag]')) return;
    if (!order.includes(item) || locked.has(item) || rowPress.current) return;
    const press: RowPress = {
      id: item,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      order,
      locked: [...locked],
      row: event.currentTarget,
      timer: 0,
      active: false,
    };
    rowPress.current = press;
    press.timer = window.setTimeout(() => {
      if (
        rowPress.current !== press ||
        blocked ||
        !sameOrder(press.order, order) ||
        !sameOrder(press.locked, [...locked])
      ) {
        if (rowPress.current === press) rowPress.current = null;
        return;
      }
      const current = lift(item, 'pointer');
      if (!current) {
        rowPress.current = null;
        return;
      }
      press.active = true;
      Object.assign(current, {
        pointer: press.pointer,
        x: press.x,
        y: press.y,
        handle: press.row,
        moved: false,
      });
      try {
        press.row.setPointerCapture(press.pointer);
      } catch {
        // Pointer capture may be unavailable in older browsers; document hit testing still tracks movement.
      }
    }, 430);
  };

  const rowPointerMove = (event: PointerEvent<HTMLLIElement>) => {
    const press = rowPress.current;
    if (!press || press.pointer !== event.pointerId) return;
    if (!press.active) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 9) clearRowPress(press);
      return;
    }
    const current = valid();
    if (!current || current.kind !== 'pointer' || current.pointer !== event.pointerId) {
      rowPointerUp(event, true);
      return;
    }
    if (!current.moved && Math.hypot(event.clientX - current.x!, event.clientY - current.y!) < 4) return;
    current.moved = true;
    event.preventDefault();
    follow(current, event.clientX, event.clientY);
    targetAt(
      root.current?.ownerDocument.elementFromPoint?.(event.clientX, event.clientY) ?? (event.target as Element),
      event.clientX,
      event.clientY,
    );
  };

  const rowPointerUp = (event: PointerEvent<HTMLLIElement>, cancelled = false) => {
    const press = rowPress.current;
    if (!press || press.pointer !== event.pointerId) return;
    clearRowPress(press);
    if (!press.active) return;
    event.preventDefault();
    if (cancelled) {
      cancel();
      return;
    }
    const current = valid();
    if (current?.kind === 'pointer' && current.pointer === event.pointerId && current.moved) {
      targetAt(
        root.current?.ownerDocument.elementFromPoint?.(event.clientX, event.clientY) ?? (event.target as Element),
        event.clientX,
        event.clientY,
      );
      drop();
    } else {
      finish();
    }
    suppressRowClick.current = press.id;
    clearTimeout(rowClickTimer.current);
    rowClickTimer.current = setTimeout(() => {
      suppressRowClick.current = null;
    }, 900);
  };

  const rowClickCapture = (event: ReactMouseEvent<HTMLLIElement>, item: string) => {
    if (suppressRowClick.current !== item) return;
    event.preventDefault();
    event.stopPropagation();
    suppressRowClick.current = null;
    clearTimeout(rowClickTimer.current);
  };

  const click = (item: string) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (valid()?.id === item && session.current?.kind === 'keyboard') drop();
    else {
      finish();
      lift(item, 'keyboard');
    }
  };

  const key = (event: KeyboardEvent<HTMLUListElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && session.current) {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }
    const item = (event.target as HTMLElement).dataset.sortHandle;
    if (!item || blocked || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const before = props.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const after = props.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const current = valid();
    if (props.dragMode === 'row' && !current && event.key === ' ') {
      event.preventDefault();
      lift(item, 'keyboard');
    } else if (event.altKey && [before, after].includes(event.key)) {
      event.preventDefault();
      finish();
      commit(item, order.indexOf(item) + (event.key === before ? -1 : 1));
    } else if (current?.kind === 'keyboard') {
      if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        drop();
      } else if ([before, after].includes(event.key)) {
        event.preventDefault();
        target(Math.max(0, Math.min(order.length - 1, current.to + (event.key === before ? -1 : 1))));
      }
    }
  };

  return {
    root,
    id,
    active,
    message,
    order,
    locked,
    blocked,
    focus,
    cancel,
    finish,
    commit,
    dragStart,
    dragOver,
    nativeDrop,
    pointerDown,
    pointerMove,
    pointerUp,
    rowPointerDown,
    rowPointerMove,
    rowPointerUp,
    rowClickCapture,
    click,
    key,
    leave: () => {
      const pending = rowPress.current;
      if (pending) {
        clearRowPress(pending);
        if (pending.active && session.current?.id === pending.id) {
          finish();
          setMessage(labels.cancelled);
        }
        return;
      }
      if (session.current?.kind === 'keyboard') {
        finish();
        setMessage(labels.cancelled);
      }
    },
  };
}
