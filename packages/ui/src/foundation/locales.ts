import { zhCN, type ComponentLabels } from './locale';
import { enUS } from './localeEnUS';
import { matchLocale } from './messages';

export interface LocaleDefinition {
  /** BCP 47 标签，同时写入根元素的 lang。 */
  tag: string;
  /** 语言自己的名称，任何界面语言下都原样显示。 */
  name: string;
  /** 切换入口上的短码，类似输入法指示。 */
  short: string;
  labels: ComponentLabels;
}

/** 语言登记表：新增语言只在这里加一项并补齐对应字典，切换逻辑与入口不变。第一项是回退语言。 */
export const locales: readonly LocaleDefinition[] = [
  { tag: 'zh-CN', name: '简体中文', short: '中', labels: zhCN },
  { tag: 'en-US', name: 'English', short: 'EN', labels: enUS },
];

/** 语言偏好里“跟随系统”的取值；其余取值是登记表里的语言标签。 */
export const SYSTEM_LOCALE = 'system';

/** 校验持久化的语言偏好：只接受“跟随系统”和已登记的语言，其余回退为跟随系统。 */
export function normalizeLocaleChoice(value: unknown, list: readonly LocaleDefinition[] = locales): string {
  return typeof value === 'string' && list.some((item) => item.tag === value) ? value : SYSTEM_LOCALE;
}

/** 把语言偏好解析成登记项；跟随系统时按宿主传入的系统语言列表匹配，库本身不读浏览器语言。 */
export function resolveLocale(
  choice: string,
  systemLanguages: readonly string[] = [],
  list: readonly LocaleDefinition[] = locales,
): LocaleDefinition {
  const fallback = list[0]!;
  const tags = list.map((item) => item.tag);
  const tag = matchLocale(choice === SYSTEM_LOCALE ? systemLanguages : [choice], tags, fallback.tag);
  return list.find((item) => item.tag === tag) ?? fallback;
}
