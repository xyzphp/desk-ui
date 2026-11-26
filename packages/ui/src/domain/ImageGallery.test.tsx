import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ImageGallery } from './ImageGallery';

const prototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(prototype, 'close');

// DOM 环境仅模拟 open 生命周期；浏览器的顶层与焦点陷阱留给独立浏览器验收。
beforeAll(() => {
  Object.defineProperty(prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterAll(() => {
  if (originalShow) Object.defineProperty(prototype, 'showModal', originalShow); else Reflect.deleteProperty(prototype, 'showModal');
  if (originalClose) Object.defineProperty(prototype, 'close', originalClose); else Reflect.deleteProperty(prototype, 'close');
});

const items = [
  { src: '/first.png', alt: '首页' },
  { src: 'javascript:alert(1)', alt: '无效地址' },
  { src: '/second.png', alt: '设置页' },
];

describe('ImageGallery', () => {
  it('跳过不可显示的地址，缩略图按钮带默认可访问名称', () => {
    render(<ImageGallery label="应用截图" items={items} />);
    const list = screen.getByRole('list', { name: '应用截图' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '查看大图：首页' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '查看大图：无效地址' })).not.toBeInTheDocument();
  });

  it('点击缩略图打开对应图片，关闭后焦点回到缩略图', () => {
    render(<ImageGallery label="应用截图" items={items} labels={{ open: (alt) => `放大 ${alt}` }} />);
    const second = screen.getByRole('button', { name: '放大 设置页' });
    second.focus();
    fireEvent.click(second);
    const dialog = screen.getByRole('dialog', { name: '应用截图' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: '关闭图片预览' }));
    expect(second).toHaveFocus();
  });

  it('没有可显示的图片时不渲染', () => {
    const { container } = render(<ImageGallery label="应用截图" items={[{ src: '', alt: '空' }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
