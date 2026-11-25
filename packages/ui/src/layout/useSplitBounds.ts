import { useLayoutEffect, useState, type RefObject } from 'react';

export function splitBounds(extent: number, divider: number, minSize: number, maxSize: number | undefined, minSecondarySize: number) {
  const first = Number.isFinite(minSize) ? Math.max(0, minSize) : 160;
  const second = Number.isFinite(minSecondarySize) ? Math.max(0, minSecondarySize) : 160;
  const available = extent > 0 ? Math.max(0, extent - divider - second) : 1000;
  const max = Math.min(available, maxSize !== undefined && Number.isFinite(maxSize) ? Math.max(0, maxSize) : available);
  return { min: Math.min(first, max), max, compact: extent > 0 && extent < first + second + divider };
}

export function useSplitBounds(
  root: RefObject<HTMLDivElement | null>, handle: RefObject<HTMLDivElement | null>,
  direction: 'horizontal' | 'vertical', minSize: number, maxSize: number | undefined, minSecondarySize: number,
) {
  const [bounds, setBounds] = useState(() => splitBounds(0, 8, minSize, maxSize, minSecondarySize));
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const view = node.ownerDocument.defaultView!;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const rect = node.getBoundingClientRect();
      const extent = direction === 'horizontal' ? node.clientWidth || rect.width : node.clientHeight || rect.height;
      const divider = Number.parseFloat(view.getComputedStyle(node).getPropertyValue('--ds-resize-hit-size')) || 8;
      const next = splitBounds(extent, divider, minSize, maxSize, minSecondarySize);
      setBounds((previous) => previous.min === next.min && previous.max === next.max && previous.compact === next.compact ? previous : next);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(node);
    if (handle.current) observer?.observe(handle.current);
    view.addEventListener('resize', measure);
    return () => { alive = false; observer?.disconnect(); view.removeEventListener('resize', measure); };
  }, [root, handle, direction, minSize, maxSize, minSecondarySize]);
  return bounds;
}
