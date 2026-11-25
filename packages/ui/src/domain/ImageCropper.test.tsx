import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cropGeometry, normalizeCrop, validCropSize } from './cropGeometry';
import { exportCrop, loadCropImage, type CropImageResource } from './cropImage';
import { ImageCropper } from './ImageCropper';

vi.mock('./cropImage', async (original) => {
  const actual = await original<typeof import('./cropImage')>();
  return { ...actual, loadCropImage: vi.fn() };
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(loadCropImage).mockReset();
});
const resource = (): CropImageResource => ({
  image: document.createElement('img'),
  url: 'blob:crop-test',
  width: 1000,
  height: 500,
  close: vi.fn(),
});

describe('裁剪计算与导出', () => {
  it('cover 取景、归一化、边缘缩放与输出尺寸保护', () => {
    expect(
      cropGeometry({ width: 1000, height: 500 }, { width: 500, height: 500 }, { zoom: 1, x: 0, y: 0 }).source,
    ).toEqual({ x: 250, y: 0, width: 500, height: 500 });
    expect(
      cropGeometry({ width: 1000, height: 500 }, { width: 500, height: 500 }, { zoom: 2, x: 1, y: -1 }).source,
    ).toEqual({ x: 0, y: 250, width: 250, height: 250 });
    expect(normalizeCrop({ zoom: Infinity, x: -20, y: NaN })).toEqual({ zoom: 1, x: -1, y: 0 });
    expect(validCropSize({ width: 4096, height: 4096 })).toBe(false);
    expect(validCropSize({ width: -1, height: 20 })).toBe(false);
    const small = cropGeometry({ width: 1, height: 1 }, { width: 500, height: 500 }, { zoom: 3, x: 0, y: 0 });
    expect(small.source.x).toBeCloseTo(1 / 3);
    expect(small.source.width).toBeCloseTo(1 / 3);
  });
  it('canvas 使用相同源矩形，JPEG 垫白，导出期间取消不返回旧结果', async () => {
    const drawImage = vi.fn(),
      fillRect = vi.fn();
    const context = { drawImage, fillRect, fillStyle: '', imageSmoothingQuality: '' };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    let complete: BlobCallback | undefined;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      complete = callback;
    });
    const controller = new AbortController();
    const image = resource();
    const promise = exportCrop(
      image,
      { width: 500, height: 500 },
      { zoom: 1, x: 0, y: 0 },
      'image/jpeg',
      0.92,
      controller.signal,
    );
    expect(drawImage).toHaveBeenCalledWith(image.image, 250, 0, 500, 500, 0, 0, 500, 500);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 500, 500);
    const result = expect(promise).rejects.toHaveProperty('name', 'AbortError');
    controller.abort();
    complete!(new Blob(['image'], { type: 'image/jpeg' }));
    await result;
  });
});

describe('ImageCropper', () => {
  it('加载后支持键盘平移、公共缩放与重置，禁用不写值，卸载释放资源', async () => {
    const image = resource();
    vi.mocked(loadCropImage).mockResolvedValue(image);
    const changed = vi.fn();
    const file = new Blob(['image'], { type: 'image/png' });
    const { rerender, unmount } = render(<ImageCropper label="裁剪" source={file} onValueChange={changed} />);
    const viewport = await screen.findByRole('group', { name: '裁剪' });
    viewport.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ x: expect.any(Number) }));
    expect(changed.mock.calls[0]![0].x).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole('slider', { name: '缩放' }), { target: { value: '2' } });
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ zoom: 2 }));
    await userEvent.click(screen.getByRole('button', { name: '重置取景' }));
    expect(changed).toHaveBeenLastCalledWith({ zoom: 1, x: 0, y: 0 });
    changed.mockClear();
    rerender(<ImageCropper label="裁剪" source={file} disabled onValueChange={changed} />);
    fireEvent.keyDown(viewport, { key: 'ArrowRight' });
    expect(changed).not.toHaveBeenCalled();
    unmount();
    expect(image.close).toHaveBeenCalledTimes(1);
  });
  it('切换图片拒绝旧解码结果，失败提供重试，空值不解码', async () => {
    const old = resource();
    let resolve: (image: CropImageResource) => void = () => {};
    vi.mocked(loadCropImage).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { rerender } = render(<ImageCropper label="裁剪" source={new Blob(['a'], { type: 'image/png' })} />);
    vi.mocked(loadCropImage).mockRejectedValue(new Error('Decode failed'));
    rerender(<ImageCropper label="裁剪" source={new Blob(['b'], { type: 'image/png' })} />);
    await act(async () => {
      resolve(old);
    });
    expect(old.close).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('图片加载失败'));
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
    rerender(<ImageCropper label="裁剪" source={null} />);
    expect(screen.getByText('请选择图片')).toBeInTheDocument();
  });
  it('nativeStructure 保留文章封面裁剪器的原站类名与控件节点', async () => {
    vi.mocked(loadCropImage).mockResolvedValue(resource());
    render(
      <ImageCropper
        label="文章封面"
        source={new Blob(['cover'], { type: 'image/jpeg' })}
        outputSize={{ width: 900, height: 383 }}
        nativeStructure
        onCancel={() => undefined}
        onConfirm={() => undefined}
        labels={{
          cancel: '更换图片',
          confirm: '裁剪并设为封面',
          dimensions: () => '横幅封面（2.35:1 · 900 × 383 px）',
        }}
      />,
    );
    await screen.findByRole('group', { name: '文章封面' });
    const root = document.querySelector('.ar-crop-workspace')!;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('ar-crop-workspace');
    expect(root.querySelector('.ar-crop-viewport-wrap .ar-crop-viewport .ar-crop-img')).toBeInTheDocument();
    expect(root.querySelector('.ar-crop-zoom-group input.workspace-range')).toBeInTheDocument();
    expect(root.querySelector('.ar-crop-zoom-group [data-ar-crop-zoom-val]')).toBeInTheDocument();
    expect(root.querySelectorAll('.ar-crop-pos-btns > button[data-ar-pos]')).toHaveLength(3);
    expect(root.querySelector('.ar-crop-pos-btns .ds-button')).not.toBeInTheDocument();
    expect(root.querySelector('.ar-crop-footer .ar-crop-actions')).toBeInTheDocument();
    expect(root.querySelector('[data-ar-reselect-img] > .xyz-icon')).toBeInTheDocument();
    expect(root.querySelector('[data-ar-apply-crop]')).toHaveClass('workspace-button', 'is-primary');
    expect(root.querySelector('[data-ar-apply-crop] > .xyz-icon')).toBeInTheDocument();
    expect(root.querySelector('.ar-crop-summary > strong')).toHaveTextContent('横幅封面（2.35:1 · 900 × 383 px）');
  });
});
