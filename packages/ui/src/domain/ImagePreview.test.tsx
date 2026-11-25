import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ImagePreview, type ImagePreviewLabels } from './ImagePreview';

const labels: ImagePreviewLabels = {
  close: '关闭预览', previous: '上一张', next: '下一张', loading: '正在载入', error: '加载失败', retry: '重试', empty: '没有图片',
  count: (index, total) => index + ' / ' + total,
  zoomOut: '缩小', zoomIn: '放大', resetZoom: '适应窗口',
};
const items = [{ src: '/first.png', alt: '第一张', title: '示例一' }, { src: '/second.png', alt: '第二张' }];
const prototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(prototype, 'close');

// DOM 环境仅模拟 open 生命周期；浏览器的顶层、inert 与焦点陷阱留给独立浏览器验收。
beforeAll(() => {
  Object.defineProperty(prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterAll(() => {
  if (originalShow) Object.defineProperty(prototype, 'showModal', originalShow); else Reflect.deleteProperty(prototype, 'showModal');
  if (originalClose) Object.defineProperty(prototype, 'close', originalClose); else Reflect.deleteProperty(prototype, 'close');
});

describe('ImagePreview', () => {
  it('打开原生对话框并聚焦关闭按钮，关闭与卸载时归还触发器焦点', () => {
    const onClose = vi.fn();
    const { rerender } = render(<><button>查看图片</button><ImagePreview open={false} label="图片预览" items={items} onClose={onClose} labels={labels} /></>);
    const trigger = screen.getByRole('button', { name: '查看图片' });
    trigger.focus();
    rerender(<><button>查看图片</button><ImagePreview open label="图片预览" items={items} onClose={onClose} labels={labels} /></>);
    expect(screen.getByRole('dialog', { name: '图片预览' })).toHaveAttribute('open');
    expect(screen.getByRole('button', { name: '关闭预览' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '关闭预览' }));
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<><button>查看图片</button><ImagePreview open={false} label="图片预览" items={items} onClose={onClose} labels={labels} /></>);
    expect(trigger).toHaveFocus();
    rerender(<><button>查看图片</button><ImagePreview open label="图片预览" items={items} onClose={onClose} labels={labels} /></>);
    expect(screen.getByRole('button', { name: '关闭预览' })).toHaveFocus();
    rerender(<><button>查看图片</button></>);
    expect(trigger).toHaveFocus();
  });

  it('受控索引只回调，等待宿主更新，方向键停在首尾边界', () => {
    const onIndexChange = vi.fn(), onClose = vi.fn();
    const { rerender } = render(<ImagePreview open label="预览" items={items} index={0} onIndexChange={onIndexChange} onClose={onClose} labels={labels} />);
    const dialog = screen.getByRole('dialog');
    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled();
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(screen.getByAltText('第一张')).toBeInTheDocument();
    rerender(<ImagePreview open label="预览" items={items} index={1} onIndexChange={onIndexChange} onClose={onClose} labels={labels} />);
    expect(screen.getByRole('button', { name: '下一张' })).toBeDisabled();
    onIndexChange.mockClear();
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('在工具栏显示由宿主提供的操作', () => {
    render(<ImagePreview open label="预览" items={items} onClose={() => {}} labels={labels}
      toolbarActions={<button type="button">下载原图</button>} />);
    expect(screen.getByRole('button', { name: '下载原图' })).toBeInTheDocument();
  });

  it('启用 QuickLook 缩放后支持按钮、快捷键和 25% 至 500% 边界', () => {
    render(<ImagePreview open label="预览" items={items} onClose={() => {}} labels={labels} zoomable />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '放大' }));
    expect(screen.getByText('125%')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: '0' });
    expect(screen.getByText('100%')).toBeInTheDocument();
    for (let index = 0; index < 30; index += 1) fireEvent.keyDown(dialog, { key: '+' });
    expect(screen.getByText('500%')).toBeInTheDocument();
  });

  it('非受控切图和失败重试各自重建图片，旧图事件不污染新图状态', () => {
    render(<ImagePreview open label="预览" items={items} onClose={() => {}} labels={labels} />);
    const old = screen.getByAltText('第一张');
    fireEvent.error(old);
    expect(screen.getByText('加载失败')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    expect(screen.getByText('正在载入')).toBeInTheDocument();
    const retried = screen.getByAltText('第一张');
    expect(retried).not.toBe(old);
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    const next = screen.getByAltText('第二张');
    fireEvent.load(retried);
    expect(next).not.toBeVisible();
    fireEvent.load(next);
    expect(next).toBeVisible();
    expect(screen.queryByText('正在载入')).not.toBeInTheDocument();
  });

  it('拒绝脚本、带凭据与非图片 data URL，空列表仍可关闭', () => {
    const { rerender, container } = render(<ImagePreview open label="预览" items={[{ src: 'javascript:alert(1)', alt: '不可信' }]} onClose={() => {}} labels={labels} />);
    expect(container.querySelector('img')).toBeNull();
    for (const src of ['https://user:password@example.com/image.png', 'data:text/html,hello', 'data:image/svg+xml;base64,PHN2Zy8+']) {
      rerender(<ImagePreview open label="预览" items={[{ src, alt: '不可信' }]} onClose={() => {}} labels={labels} />);
      expect(container.querySelector('img')).toBeNull();
    }
    rerender(<ImagePreview open label="预览" items={[]} onClose={() => {}} labels={labels} />);
    expect(screen.getByText('没有图片')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关闭预览' })).toBeEnabled();
  });

  it('原生取消仅请求关闭；从图片拖向背景不触发背景关闭', async () => {
    const onClose = vi.fn(), user = userEvent.setup();
    render(<ImagePreview open label="预览" items={items} onClose={onClose} labels={labels} />);
    const dialog = screen.getByRole('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    onClose.mockClear();
    fireEvent.pointerDown(screen.getByAltText('第一张'));
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    await user.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
