import { useLocale } from './ConfigProvider';

/** 一组按语言登记的文案：基准语言的字典既是回退值，也是其它语言的类型约束。 */
export interface MessageCatalog<T extends object> {
  readonly base: string;
  readonly messages: Readonly<Record<string, T>>;
}

/**
 * 登记应用或页面自己的文案。基准字典（通常是 zh-CN）决定键与函数签名，
 * 其它语言必须提供同样的键，缺键在编译期报错；插值与复数用函数表达。
 */
export function defineMessages<T extends object>(
  base: string,
  source: T,
  translations: Readonly<Record<string, T>> = {},
): MessageCatalog<T> {
  return { base, messages: { ...translations, [base]: source } };
}

const language = (tag: string) => tag.toLowerCase().split('-')[0];

/**
 * 在受支持的语言里为偏好列表找最接近的一项：先完全相同，再主语言相同（en-GB → en-US），都没有则回退。
 * 偏好列表按优先级排列，可直接传入 navigator.languages。
 */
export function matchLocale(wanted: readonly string[], supported: readonly string[], fallback: string): string {
  for (const tag of wanted) {
    const exact = supported.find((item) => item.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
    const close = supported.find((item) => language(item) === language(tag));
    if (close) return close;
  }
  return fallback;
}

/** 非 React 代码按语言取字典；渲染路径优先用 useMessages。 */
export function pickMessages<T extends object>(catalog: MessageCatalog<T>, locale: string): T {
  return catalog.messages[matchLocale([locale], Object.keys(catalog.messages), catalog.base)]!;
}

/** 读取当前语言的字典，语言来自最近的 ConfigProvider；没有对应翻译时回退到基准语言。 */
export function useMessages<T extends object>(catalog: MessageCatalog<T>): T {
  return pickMessages(catalog, useLocale());
}
