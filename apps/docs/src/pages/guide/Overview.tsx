import { useLanguage } from '../../site/LocaleProvider';
import { OverviewEn } from './Overview.en-US';
import { OverviewZh } from './Overview.zh-CN';

export interface OverviewProps { componentCount: number; pageCount: number; categoryCount: number }

/** 入口按语言选择内容组件；统计数字由 registry 派生，两份内容共用。 */
export function Overview(props: OverviewProps) {
  const language = useLanguage();
  return language.current.startsWith('zh') ? <OverviewZh {...props} /> : <OverviewEn {...props} />;
}
