import { useLayoutEffect, useState, type RefObject } from 'react';
import { desktopIconMetrics } from './desktopIconPlacement';

/** 根据可见工作区和原站格距计算图标网格行列。 */
export function useDesktopIconViewport(viewport: RefObject<HTMLElement | null>, count: number, iconSize = 56) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = node;
      setSize((previous) => (previous.width === width && previous.height === height ? previous : { width, height }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      const view = node.ownerDocument.defaultView;
      view?.addEventListener('resize', measure);
      return () => view?.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewport]);

  const { gap, stepX, stepY } = desktopIconMetrics(iconSize);
  const columns = Math.max(1, Math.min(128, Math.floor((size.width + gap) / stepX)));
  // 至少留一个空格；高度不足时由桌面图标容器纵向滚动。
  const rows = Math.max(Math.floor((size.height + gap) / stepY), Math.ceil((count + 1) / columns));
  return { columns, rows, minCanvasHeight: size.height };
}
