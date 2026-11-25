export type FloatingPlacement = 'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end' | 'right-start' | 'left-start';
export interface FloatingPoint { x: number; y: number }

/** 视口坐标；沿锚点择侧，再把面板夹取到可视区域。 */
export function floatingPosition(
  anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'width'>,
  size: Pick<DOMRect, 'width' | 'height'>,
  viewport: { width: number; height: number },
  placement: FloatingPlacement,
  gap: number,
) {
  const edge = 8;
  const [side, align] = placement.split('-');
  if (side === 'right' || side === 'left') {
    const right = anchor.right + gap, left = anchor.left - size.width - gap;
    const rightSpace = viewport.width - edge - right, leftSpace = anchor.left - gap - edge;
    const preferRight = side === 'right';
    const useRight = preferRight
      ? rightSpace >= size.width || (leftSpace < size.width && rightSpace >= leftSpace)
      : leftSpace < size.width && (rightSpace >= size.width || rightSpace > leftSpace);
    return {
      left: Math.max(edge, Math.min(useRight ? right : left, viewport.width - size.width - edge)),
      top: Math.max(edge, Math.min(anchor.top, viewport.height - size.height - edge)),
    };
  }
  const below = anchor.bottom + gap;
  const above = anchor.top - size.height - gap;
  const preferTop = side === 'top';
  const fitsTop = above >= edge;
  const fitsBottom = below + size.height <= viewport.height - edge;
  const top = preferTop ? (fitsTop || !fitsBottom ? above : below) : (fitsBottom || !fitsTop ? below : above);
  const left = align === 'end' ? anchor.right - size.width
    : align === 'start' ? anchor.left : anchor.left + (anchor.width - size.width) / 2;
  return {
    left: Math.max(edge, Math.min(left, viewport.width - size.width - edge)),
    top: Math.max(edge, Math.min(top, viewport.height - size.height - edge)),
  };
}
