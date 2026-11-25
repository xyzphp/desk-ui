import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider, normalizeLocaleChoice, pickMessages, resolveLocale, SYSTEM_LOCALE } from '@xyzos/desk-ui';
import { docsMessages } from './locale';

/** 仅保存在本机浏览器，与外观偏好分开存放，便于其它标签页同步。 */
const KEY = 'docs-locale';

interface LanguageState {
  /** 语言偏好：跟随系统或某个已登记的语言标签。 */
  choice: string;
  /** 实际生效的语言标签。 */
  current: string;
  setChoice: (choice: string) => void;
}

// 没有 Provider（如单元测试）时保持基准语言，切换为空操作。
const LanguageContext = createContext<LanguageState>({ choice: SYSTEM_LOCALE, current: 'zh-CN', setChoice: () => {} });

function readChoice() {
  try {
    return normalizeLocaleChoice(window.localStorage.getItem(KEY));
  } catch {
    return SYSTEM_LOCALE;
  }
}

/** 语言偏好的唯一入口：解析生效语言、写入根元素 lang，并把语言与组件库文案交给 ConfigProvider；切换即时生效，不刷新页面。 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState(readChoice);
  const [systemLanguages, setSystemLanguages] = useState<readonly string[]>(() => navigator.languages);
  useEffect(() => {
    const onLanguageChange = () => setSystemLanguages(navigator.languages);
    // 其它标签页切换语言后本页跟随。
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) setChoiceState(readChoice());
    };
    window.addEventListener('languagechange', onLanguageChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('languagechange', onLanguageChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const locale = resolveLocale(choice, systemLanguages);
  useEffect(() => {
    document.documentElement.lang = locale.tag;
    document.title = pickMessages(docsMessages, locale.tag).docs.title;
  }, [locale.tag]);
  const setChoice = useCallback((value: string) => {
    const next = normalizeLocaleChoice(value);
    setChoiceState(next);
    try {
      if (next === SYSTEM_LOCALE) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {
      /* 存储不可用时仅保留当前会话的选择 */
    }
  }, []);
  const value = useMemo(() => ({ choice, current: locale.tag, setChoice }), [choice, locale.tag, setChoice]);
  return (
    <LanguageContext.Provider value={value}>
      <ConfigProvider locale={locale.tag} labels={locale.labels}>
        {children}
      </ConfigProvider>
    </LanguageContext.Provider>
  );
}

/** 语言切换入口读取偏好与生效语言；业务代码取文案用 useMessages、取语言标签用 useLocale。 */
export function useLanguage() {
  return useContext(LanguageContext);
}
