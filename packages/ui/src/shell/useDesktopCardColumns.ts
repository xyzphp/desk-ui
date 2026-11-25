import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import { desktopCardColumns } from './desktopCardColumns';

interface DesktopCardLayoutOptions {
  hidden?: boolean;
  navigationMode?: boolean;
  onOccupiedWidthChange?: (width: number) => void;
  onOccupiedHeightChange?: (height: number) => void;
}

export function useDesktopCardColumns(
  root: RefObject<HTMLDivElement | null>,
  host: RefObject<HTMLDivElement | null>,
  ids: readonly string[],
  minimumWorkspace: number,
  columnLabel: (index: number) => string,
  { hidden = false, navigationMode = false, onOccupiedWidthChange, onOccupiedHeightChange }: DesktopCardLayoutOptions = {},
) {
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const observer = useRef<ResizeObserver | undefined>(undefined);
  const schedule = useRef<(() => void) | undefined>(undefined);
  const idsKey = ids.join('\0');
  const latest = useRef({
    ids,
    minimumWorkspace,
    columnLabel,
    navigationMode,
    onOccupiedWidthChange,
    onOccupiedHeightChange,
  });
  useLayoutEffect(() => {
    latest.current = {
      ids,
      minimumWorkspace,
      columnLabel,
      navigationMode,
      onOccupiedWidthChange,
      onOccupiedHeightChange,
    };
  });
  useLayoutEffect(() => {
    schedule.current?.();
  }, [idsKey, hidden, minimumWorkspace, columnLabel, navigationMode, onOccupiedWidthChange, onOccupiedHeightChange]);

  const register = useCallback(
    (id: string, node: HTMLDivElement) => {
      nodes.current.set(id, node);
      host.current?.appendChild(node);
      observer.current?.observe(node);
      schedule.current?.();
      return () => {
        observer.current?.unobserve(node);
        if (nodes.current.get(id) === node) nodes.current.delete(id);
        node.remove();
        schedule.current?.();
      };
    },
    [host],
  );

  useLayoutEffect(() => {
    const rail = root.current;
    const container = host.current;
    const parent = rail?.parentElement;
    const view = rail?.ownerDocument.defaultView;
    if (!rail || !container || !parent || !view) return;
    const mounted = nodes.current;
    let frame = 0;
    let reportedWidth = -1;
    let reportedHeight = -1;
    const columns: HTMLDivElement[] = [];
    const setVariable = (name: string, value: string) => {
      if (rail.style.getPropertyValue(name) !== value) rail.style.setProperty(name, value);
    };
    const report = (width: number) => {
      if (width === reportedWidth) return;
      reportedWidth = width;
      latest.current.onOccupiedWidthChange?.(width);
    };
    const reportHeight = (height: number) => {
      if (height === reportedHeight) return;
      reportedHeight = height;
      latest.current.onOccupiedHeightChange?.(height);
    };
    const reflow = () => {
      frame = 0;
      if (!rail.getClientRects().length || rail.hidden) {
        setVariable('--ds-card-rail-height', '0px');
        report(0);
        reportHeight(0);
        return;
      }
      const viewportWidth = parent.clientWidth;
      const compact = latest.current.navigationMode ? viewportWidth <= 560 : parent.clientWidth <= 560;
      const horizontal = latest.current.navigationMode && viewportWidth <= 960;
      const preferredWidth = horizontal
        ? 280
        : latest.current.navigationMode && viewportWidth <= 1080
          ? 260
          : compact
            ? 240
            : 300;
      const width = Math.max(1, Math.min(preferredWidth, parent.clientWidth - 32));
      const gap = compact ? 9 : 12;
      setVariable('--ds-card-rail-width', `${width}px`);
      setVariable('--ds-card-rail-gap', `${gap}px`);
      rail.dataset.compact = String(compact);
      container.dataset.layout = horizontal ? 'horizontal' : 'columns';
      const active = latest.current.ids.flatMap((id) => {
        const node = nodes.current.get(id);
        return node ? [node] : [];
      });
      if (horizontal) {
        const focused = rail.ownerDocument.activeElement;
        let previous: HTMLDivElement | undefined;
        active.forEach((node) => {
          const next = previous ? previous.nextElementSibling : container.firstElementChild;
          if (next !== node) {
            if (container.moveBefore && node.isConnected) container.moveBefore(node, next);
            else container.insertBefore(node, next);
          }
          previous = node;
        });
        columns.forEach((column) => column.remove());
        columns.length = 0;
        const cardHeight = (node: HTMLElement) =>
          (node.firstElementChild as HTMLElement | null)?.getBoundingClientRect().height ??
          node.getBoundingClientRect().height;
        const tallest = Math.max(0, ...active.map(cardHeight));
        const railLimit = Math.max(120, Math.min(220, Math.floor(parent.clientHeight * 0.3)));
        const contentHeight = active.length ? Math.min(railLimit, tallest) : 0;
        active.forEach((node) => {
          node.classList.add('ds-scrollable');
          const scrollable = contentHeight > 0 && cardHeight(node) > contentHeight + 8;
          node.dataset.scrollable = String(scrollable);
          if (scrollable) node.tabIndex = 0;
          else node.removeAttribute('tabindex');
        });
        const toolbar = rail.firstElementChild as HTMLElement | null;
        const height = active.length ? Math.ceil(contentHeight + (toolbar?.offsetHeight ?? 0) + gap) : 0;
        setVariable('--ds-card-rail-height', `${height}px`);
        report(0);
        reportHeight(height);
        container.tabIndex = active.length ? 0 : -1;
        if (focused instanceof HTMLElement && focused.isConnected && rail.ownerDocument.activeElement !== focused)
          focused.focus({ preventScroll: true });
        return;
      }
      setVariable('--ds-card-rail-height', '');
      reportHeight(0);
      active.forEach((node) => {
        delete node.dataset.scrollable;
        node.classList.remove('ds-scrollable');
        node.removeAttribute('tabindex');
      });
      const available = container.clientHeight;
      if (!available) return;
      const right = parseFloat(view.getComputedStyle(rail).right) || 0;
      const budget = Math.max(0, latest.current.minimumWorkspace);
      const maximum = Math.max(1, Math.floor((parent.clientWidth - budget - right) / (width + gap)));
      const { columns: placements, totals } = desktopCardColumns(
        active.map((node) => node.getBoundingClientRect().height),
        available,
        maximum,
        gap,
      );
      const focused = rail.ownerDocument.activeElement;
      placements.forEach((items, index) => {
        let column = columns[index];
        if (!column) {
          column = rail.ownerDocument.createElement('div');
          column.className = 'ds-desktop-card-column ds-scrollable';
          column.dataset.cardColumn = String(index);
          column.setAttribute('role', 'group');
          columns[index] = column;
          container.appendChild(column);
        }
        column.setAttribute('aria-label', latest.current.columnLabel(index + 1));
        let previous: HTMLDivElement | undefined;
        items.forEach((item) => {
          const node = active[item]!;
          const next = previous ? previous.nextElementSibling : column.firstElementChild;
          if (next !== node) {
            if (column.moveBefore && node.isConnected) column.moveBefore(node, next);
            else column.insertBefore(node, next);
          }
          previous = node;
        });
        const scrollable = totals[index]! > available + (column.dataset.scrollable === 'true' ? 0 : 8);
        column.dataset.scrollable = String(scrollable);
        column.tabIndex = scrollable ? 0 : -1;
      });
      while (columns.length > placements.length) columns.pop()?.remove();
      if (focused instanceof HTMLElement && focused.isConnected && rail.ownerDocument.activeElement !== focused)
        focused.focus({ preventScroll: true });
      report(
        active.length ? Math.ceil(parent.getBoundingClientRect().right - rail.getBoundingClientRect().left) + 14 : 0,
      );
    };
    const enqueue = () => {
      if (!frame) frame = view.requestAnimationFrame(reflow);
    };
    schedule.current = enqueue;
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(enqueue);
    observer.current = resize;
    resize?.observe(parent);
    resize?.observe(container);
    nodes.current.forEach((node) => resize?.observe(node));
    const mutations = new MutationObserver(enqueue);
    mutations.observe(rail, { attributes: true, attributeFilter: ['hidden'] });
    if (!resize)
      mutations.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['hidden'],
      });
    view.addEventListener('resize', enqueue);
    enqueue();
    return () => {
      view.cancelAnimationFrame(frame);
      view.removeEventListener('resize', enqueue);
      resize?.disconnect();
      mutations.disconnect();
      observer.current = undefined;
      schedule.current = undefined;
      // StrictMode 重建布局前保留每个 portal 容器和其中的编辑状态。
      mounted.forEach((node) => container.appendChild(node));
      columns.forEach((column) => column.remove());
      latest.current.onOccupiedWidthChange?.(0);
      latest.current.onOccupiedHeightChange?.(0);
    };
  }, [root, host]);
  return register;
}
