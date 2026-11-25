import { cropGeometry, normalizeCrop, validCropSize, type CropSize, type CropValue } from './cropGeometry';

export interface CropImageResource extends CropSize { image: HTMLImageElement; url: string; close: () => void }
export interface ImageCropResult extends CropSize {
  blob: Blob;
  value: CropValue;
  source: { x: number; y: number; width: number; height: number };
}
const aborted = () => new DOMException('Aborted', 'AbortError');

/** 沿用原生封面编辑的 Image 解码路径，显式释放 URL 并拒绝过期结果。 */
export function loadCropImage(file: Blob, signal: AbortSignal): Promise<CropImageResource> {
  if (signal.aborted) return Promise.reject(aborted());
  if (!/^image\/(png|jpeg|webp|gif|avif|bmp)$/i.test(file.type)) return Promise.reject(new Error('Unsupported image'));
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    const close = () => { image.onload = null; image.onerror = null; image.src = ''; URL.revokeObjectURL(url); };
    const cancel = () => { close(); reject(aborted()); };
    const finish = () => signal.removeEventListener('abort', cancel);
    signal.addEventListener('abort', cancel, { once: true });
    image.onload = () => {
      finish();
      if (signal.aborted || !image.naturalWidth || !image.naturalHeight) {
        close(); reject(signal.aborted ? aborted() : new Error('Invalid image')); return;
      }
      resolve({ image, url, width: image.naturalWidth, height: image.naturalHeight, close });
    };
    image.onerror = () => { finish(); close(); reject(new Error('Image decode failed')); };
    image.src = url;
  });
}

/** 复用原生 canvas 源矩形裁剪；PNG 保留透明度，JPEG 垫白。 */
export async function exportCrop(
  resource: CropImageResource, size: CropSize, value: CropValue, type: 'image/png' | 'image/jpeg', quality: number, signal: AbortSignal,
): Promise<ImageCropResult> {
  if (signal.aborted) throw aborted();
  if (!validCropSize(size)) throw new Error('Invalid output size');
  const geometry = cropGeometry(resource, size, value);
  const canvas = document.createElement('canvas');
  canvas.width = size.width; canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size.width, size.height); }
  const { x, y, width, height } = geometry.source;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(resource.image, x, y, width, height, 0, 0, size.width, size.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Canvas export failed')), type, quality);
  });
  if (signal.aborted) throw aborted();
  return { ...size, blob, value: normalizeCrop(value), source: geometry.source };
}
