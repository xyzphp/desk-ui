import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { mergeLabels, zhCN, type ComponentLabels, type LabelOverrides } from './locale';

interface ConfigValue {
  labels: ComponentLabels;
  locale: string;
}

const ConfigContext = createContext<ConfigValue>({ labels: zhCN, locale: 'zh-CN' });

export interface ConfigProviderProps {
  children: ReactNode;
  labels?: LabelOverrides<ComponentLabels>;
  /** 当前语言的 BCP 47 标签，供 useLocale / useMessages 与 Intl 格式化使用；缺省继承父级，根默认 zh-CN。 */
  locale?: string;
}

/** 嵌套配置继承父级；仅提供 UI 文案与语言标签，不读浏览器语言、不保存配置。 */
export function ConfigProvider({ children, labels, locale }: ConfigProviderProps) {
  const parent = useContext(ConfigContext);
  const value = useMemo(
    () => ({ labels: mergeLabels<ComponentLabels>(parent.labels, labels), locale: locale ?? parent.locale }),
    [parent, labels, locale],
  );
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useLabels<K extends keyof ComponentLabels>(key: K, overrides?: LabelOverrides<ComponentLabels[K]>) {
  const config = useContext(ConfigContext);
  return mergeLabels<ComponentLabels[K]>(config.labels[key], overrides);
}

/** 最近的 ConfigProvider 给出的语言标签；日期、数字与排序格式化以它为准，不再写死 zh-CN。 */
export function useLocale() {
  return useContext(ConfigContext).locale;
}
