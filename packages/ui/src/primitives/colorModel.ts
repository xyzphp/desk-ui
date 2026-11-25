/** 仅允许不透明 HEX；不接受 CSS 表达式、URL 或脚本。 */
export function normalizeColor(value: string): string | undefined {
  const text = value.trim();
  if (!text) return '';
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(text)) return '#' + Array.from(text.slice(1), (character) => character + character).join('').toLowerCase();
  return undefined;
}
