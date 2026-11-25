import { useLanguage } from '../../site/LocaleProvider';
import { ConventionsEn } from './Conventions.en-US';
import { ConventionsZh } from './Conventions.zh-CN';

/** 入口按语言选择内容组件。 */
export function Conventions() {
  const language = useLanguage();
  return language.current.startsWith('zh') ? <ConventionsZh /> : <ConventionsEn />;
}
