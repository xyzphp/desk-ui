export interface CropValue { zoom: number; x: number; y: number }
export interface CropSize { width: number; height: number }
export const defaultCrop: CropValue = { zoom: 1, x: 0, y: 0 };
const bound = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function normalizeCrop(value: CropValue): CropValue {
  return { zoom: bound(value.zoom, 1, 3, 1), x: bound(value.x, -1, 1, 0), y: bound(value.y, -1, 1, 0) };
}
export function validCropSize(size: CropSize) {
  return [size.width, size.height].every((value) => Number.isInteger(value) && value > 0 && value <= 4096)
    && size.width * size.height <= 11_500_000;
}
/** 移植 articles.js 的 cover / 取景公式；偏移归一化以保持响应式视窗下的取景。 */
export function cropGeometry(image: CropSize, output: CropSize, raw: CropValue) {
  const value = normalizeCrop(raw);
  const scale = Math.max(output.width / image.width, output.height / image.height) * value.zoom;
  const width = image.width * scale, height = image.height * scale;
  const maxX = Math.max(0, (width - output.width) / 2), maxY = Math.max(0, (height - output.height) / 2);
  const left = (output.width - width) / 2 + value.x * maxX;
  const top = (output.height - height) / 2 + value.y * maxY;
  const sourceWidth = Math.min(image.width, output.width / scale), sourceHeight = Math.min(image.height, output.height / scale);
  const x = Math.max(0, Math.min(image.width - sourceWidth, -left / scale));
  const y = Math.max(0, Math.min(image.height - sourceHeight, -top / scale));
  return {
    left, top, width, height, maxX, maxY,
    source: { x, y, width: sourceWidth, height: sourceHeight },
  };
}
