import { useLanguage } from '../../site/LocaleProvider';
import { TokensEn } from './Tokens.en-US';
import { TokensZh } from './Tokens.zh-CN';

/** 入口按语言选择内容组件。 */
export function Tokens() {
  const language = useLanguage();
  return language.current.startsWith('zh') ? <TokensZh /> : <TokensEn />;
}
