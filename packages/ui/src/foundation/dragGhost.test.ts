import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDragGhost, setDragGhostImage } from './dragGhost';

function source() {
  const card = document.createElement('section');
  card.id = 'card';
  card.className = 'card is-drag-source';
  card.dataset.drop = 'before';
  card.innerHTML = `
    <h2 id="title">标题</h2>
    <textarea></textarea>
    <input type="radio" name="tone" value="warm">
    <iframe src="about:blank" style="width: 120px; height: 80px"></iframe>`;
  document.body.appendChild(card);
  card.querySelector('textarea')!.value = '当前草稿';
  card.querySelector('input')!.checked = true;
  return card;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('createDragGhost', () => {
  it('复制源元素为只读影子：去掉标识与状态，保留表单值，内嵌页面换成占位', () => {
    const card = source();
    const ghost = createDragGhost(card, { x: 10, y: 10 }, { className: 'extra', removeClasses: ['is-drag-source'] });
    const element = ghost.element;
    expect(element.parentElement).toBe(document.body);
    expect(element).toHaveClass('card', 'ds-drag-ghost', 'extra');
    expect(element).not.toHaveClass('is-drag-source');
    expect(element).toHaveAttribute('aria-hidden', 'true');
    expect(element.id).toBe('');
    expect(element.dataset.drop).toBeUndefined();
    expect(element.querySelector('[id]')).toBeNull();
    expect(element.querySelector('textarea')!.value).toBe('当前草稿');
    const radio = element.querySelector('input')!;
    expect(radio.checked).toBe(true);
    expect(radio.hasAttribute('name')).toBe(false);
    expect(card.querySelector('input')!.checked).toBe(true);
    expect(element.querySelector('iframe')).toBeNull();
    expect(element.querySelector<HTMLElement>('.ds-drag-ghost-frame')!.style.width).toBe('120px');
    expect(card.querySelector('iframe')).not.toBeNull();
  });

  it('跟随指针移动，销毁后从文档移除，源元素不变', () => {
    const card = source();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const ghost = createDragGhost(card, { x: 0, y: 0 }, { host });
    expect(ghost.element.parentElement).toBe(host);
    ghost.move({ x: 40, y: 25 });
    expect(ghost.element.style.transform).toBe('translate3d(40px, 25px, 0)');
    ghost.destroy();
    expect(ghost.element.isConnected).toBe(false);
    expect(card.isConnected).toBe(true);
    expect(card).toHaveClass('is-drag-source');
  });
});

describe('setDragGhostImage', () => {
  it('把影子交给浏览器作为拖动图像，下一轮移除；不支持时返回 false', () => {
    vi.useFakeTimers();
    try {
      const card = source();
      const setDragImage = vi.fn();
      expect(setDragGhostImage({ setDragImage } as unknown as DataTransfer, card, { x: 0, y: 0 })).toBe(true);
      const [image, x, y] = setDragImage.mock.calls[0]!;
      expect(image).toHaveClass('ds-drag-ghost');
      expect((image as HTMLElement).isConnected).toBe(true);
      expect([x, y]).toEqual([0, 0]);
      vi.runAllTimers();
      expect((image as HTMLElement).isConnected).toBe(false);
      expect(setDragGhostImage({} as DataTransfer, card, { x: 0, y: 0 })).toBe(false);
      expect(setDragGhostImage(null, card, { x: 0, y: 0 })).toBe(false);
      expect(document.querySelector('.ds-drag-ghost')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
