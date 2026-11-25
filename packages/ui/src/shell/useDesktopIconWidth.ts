import { useLayoutEffect, useState, type RefObject } from 'react';

/** 测量可用宽度，只调整能容纳的列数，不拉伸格距。 */
export function useDesktopIconWidth(root: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      if (node.clientWidth > 0) setWidth(node.clientWidth);
    };
    measure();
    const view = node.ownerDocument.defaultView;
    if (typeof ResizeObserver === 'undefined') {
      view?.addEventListener('resize', measure);
      return () => view?.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [root]);
  return width;
}
