/** 仅接受可显示的图片地址；不接受脚本、凭据或控制字符。 */
export function safeImage(value: string | undefined) {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return undefined;
  const source = value.trim();
  if (/^data:/i.test(source)) return /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon);base64,/i.test(source) ? source : undefined;
  try {
    const url = new URL(source, 'https://image.invalid/');
    return ['https:', 'http:', 'blob:'].includes(url.protocol) && !url.username && !url.password ? source : undefined;
  } catch { return undefined; }
}
