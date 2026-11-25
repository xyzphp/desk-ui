import { useLanguage } from '../../site/LocaleProvider';
import { LLMsEn } from './LLMs.en-US';
import { LLMsZh } from './LLMs.zh-CN';

/** LLM 文档入口跟随文档站的当前语言。 */
export function LLMs() {
  const language = useLanguage();
  return language.current.startsWith('zh') ? <LLMsZh /> : <LLMsEn />;
}
