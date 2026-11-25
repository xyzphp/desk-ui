/** 双语展示文案：中文必填，英文可选，缺失时回退中文。 */
export type LocalizedText = { 'zh-CN': string; 'en-US'?: string };

/** 按生效语言取展示文案；纯字符串值原样返回，英文缺失时回退中文。 */
export function docText(value: string | LocalizedText, locale: string): string {
  if (typeof value === 'string') return value;
  if (locale.startsWith('zh')) return value['zh-CN'];
  return value['en-US'] ?? value['zh-CN'];
}
