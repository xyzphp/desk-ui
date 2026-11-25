import type { PointerPoint } from './usePointerGesture';

export interface DragGhostOptions {
  /** 追加到影子上的类名，宿主可用它微调外观（例如倾斜角度）。 */
  className?: string;
  /** 影子挂载的位置，默认 `document.body`；需要继承宿主作用域样式时传入宿主根节点。 */
  host?: HTMLElement;
  /** 从影子根节点去掉的状态类（例如源元素拖动中的淡化、落点指示）。 */
  removeClasses?: readonly string[];
}

export interface DragGhost {
  readonly element: HTMLElement;
  /** 按下点相对源元素左上角的位置。 */
  readonly offset: PointerPoint;
  /** 让影子跟随指针；抓取点与按下时相对源元素的位置保持一致。 */
  move: (point: PointerPoint) => void;
  destroy: () => void;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), Math.max(max, 0));

/** 影子只用于显示：去掉会重复的标识、会重新加载的内嵌页面，并带上源元素当前的表单值。 */
function prepare(source: HTMLElement, ghost: HTMLElement) {
  const fields = 'input, textarea, select';
  const from = Array.from(source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(fields));
  const to = Array.from(ghost.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(fields));
  to.forEach((field, index) => {
    const original = from[index];
    if (original) {
      if (field instanceof HTMLInputElement && original instanceof HTMLInputElement) field.checked = original.checked;
      field.value = original.value;
    }
    // 同名单选框会与原控件互相取消选中，影子里的控件一律去掉 name。
    field.removeAttribute('name');
    field.removeAttribute('autofocus');
  });
  const sourceCanvases = Array.from(source.querySelectorAll('canvas'));
  ghost.querySelectorAll('canvas').forEach((canvas, index) => {
    const original = sourceCanvases[index];
    try {
      if (original) canvas.getContext('2d')?.drawImage(original, 0, 0);
    } catch {
      // 跨源或不支持的画布保持空白即可。
    }
  });
  ghost.querySelectorAll('iframe, object, embed').forEach((frame) => {
    const placeholder = frame.ownerDocument.createElement('div');
    placeholder.className = 'ds-drag-ghost-frame';
    const rect = (frame as HTMLElement).getBoundingClientRect?.();
    const width = (frame as HTMLElement).style.width || (rect?.width ? `${rect.width}px` : '');
    const height = (frame as HTMLElement).style.height || (rect?.height ? `${rect.height}px` : '');
    if (width) placeholder.style.width = width;
    if (height) placeholder.style.height = height;
    frame.replaceWith(placeholder);
  });
  [
    ghost,
    ...Array.from(ghost.querySelectorAll<HTMLElement>('[id], [data-dragging], [data-drop], [autofocus]')),
  ].forEach((node) => {
    node.removeAttribute('id');
    node.removeAttribute('data-dragging');
    node.removeAttribute('data-drop');
  });
}

/**
 * 拖动影子：复制源元素放到指针下方跟随移动，对应原站 HTML5 拖拽时浏览器绘制的半透明拖动图像。
 * 只负责显示，不参与命中测试（`pointer-events: none`），不改变源元素与布局；调用方在结束或取消时 `destroy()`。
 */
export function createDragGhost(source: HTMLElement, start: PointerPoint, options: DragGhostOptions = {}): DragGhost {
  const doc = source.ownerDocument;
  const rect = source.getBoundingClientRect();
  const offset = { x: clamp(start.x - rect.left, rect.width), y: clamp(start.y - rect.top, rect.height) };
  const ghost = source.cloneNode(true) as HTMLElement;
  prepare(source, ghost);
  if (options.removeClasses?.length) ghost.classList.remove(...options.removeClasses);
  ghost.classList.add('ds-drag-ghost');
  if (options.className) ghost.classList.add(...options.className.split(/\s+/).filter(Boolean));
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  ghost.hidden = false;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  (options.host ?? doc.body).appendChild(ghost);
  // 祖先带 transform / filter 时 fixed 以祖先为参照，先量出影子在 (0, 0) 时的实际位置再抵消。
  const base = ghost.getBoundingClientRect();
  const origin = { x: base.left, y: base.top };
  const move = (point: PointerPoint) => {
    ghost.style.transform = `translate3d(${point.x - offset.x - origin.x}px, ${point.y - offset.y - origin.y}px, 0)`;
  };
  move(start);
  return {
    element: ghost,
    offset,
    move,
    destroy: () => ghost.remove(),
  };
}

/**
 * HTML5 拖拽用同一套影子样式作为浏览器拖动图像（对应原站 navigation.js 的 `setDragImage`）。
 * 影子先放到屏幕外供浏览器截取，下一轮事件循环移除；不支持时返回 false，浏览器沿用默认拖动图像。
 */
export function setDragGhostImage(
  transfer: DataTransfer | null | undefined,
  source: HTMLElement,
  point: PointerPoint,
  options: DragGhostOptions = {},
) {
  if (!transfer || typeof transfer.setDragImage !== 'function') return false;
  const ghost = createDragGhost(source, point, options);
  ghost.element.style.transform = 'translate3d(-10000px, 0, 0)';
  try {
    transfer.setDragImage(ghost.element, ghost.offset.x, ghost.offset.y);
  } catch {
    ghost.destroy();
    return false;
  }
  (source.ownerDocument.defaultView ?? window).setTimeout(ghost.destroy, 0);
  return true;
}
