import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/*
 * 画作类动态壁纸（水族馆、森林、草原、星空）的公共状态：
 * - night：跟随最近的 [data-theme] 祖先（桌面主题），深色主题显示夜景；
 * - play：开启动态壁纸、未要求减弱动态效果且页面可见时才播放动画与交互。
 */
export function useSceneState(root: RefObject<HTMLElement | null>, animated: boolean) {
  const [night, setNight] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);

  // 首帧前读到主题，避免深色主题下先闪一下白天再过渡到夜景。
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const doc = element.ownerDocument;
    const source = element.closest<HTMLElement>('[data-theme]') ?? doc.documentElement;
    const read = () => setNight(source.getAttribute('data-theme') === 'dark');
    read();
    const view = doc.defaultView;
    if (!view || typeof view.MutationObserver !== 'function') return;
    const observer = new view.MutationObserver(read);
    observer.observe(source, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    const element = root.current;
    const doc = element?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return;
    const motion = view.matchMedia?.('(prefers-reduced-motion: reduce)');
    const readMotion = () => setReduced(!!motion?.matches);
    const readVisibility = () => setVisible(doc.visibilityState !== 'hidden');
    readMotion();
    readVisibility();
    motion?.addEventListener?.('change', readMotion);
    doc.addEventListener('visibilitychange', readVisibility);
    return () => {
      motion?.removeEventListener?.('change', readMotion);
      doc.removeEventListener('visibilitychange', readVisibility);
    };
  }, [root]);

  return { night, play: animated && !reduced && visible };
}

/** 画面按 1672 × 941 铺满容器（等同 object-fit: cover）时的缩放与偏移。 */
export const sceneWidth = 1672;
export const sceneHeight = 941;

export function coverFit(width: number, height: number) {
  const scale = Math.max(width / sceneWidth, height / sceneHeight);
  return { scale, x: (width - sceneWidth * scale) / 2, y: (height - sceneHeight * scale) / 2 };
}

/** 固定种子的线性同余随机数，与参考壁纸一致，保证每次画面相同。 */
export function lcg(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * 1672 × 941 的舞台整体缩放铺满容器（cover）：返回缩放比例与 Canvas 的像素密度。
 * 密度按实际显示尺寸 × 设备像素比取 0.25 的倍数（0.5–2），大屏不发虚，小预览不浪费；未测量前 scale 为 0。
 */
export function useCoverFit(root: RefObject<HTMLElement | null>) {
  const [fit, setFit] = useState({ scale: 0, density: 0 });
  useLayoutEffect(() => {
    const element = root.current;
    const view = element?.ownerDocument.defaultView;
    if (!element || !view) return;
    const measure = () => {
      const { scale } = coverFit(element.clientWidth, element.clientHeight);
      const ratio = Math.min(view.devicePixelRatio || 1, 2);
      const density = Math.min(2, Math.max(0.5, Math.ceil(scale * ratio * 4) / 4));
      setFit((current) => (current.scale === scale && current.density === density ? current : { scale, density }));
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [root]);
  return fit;
}
