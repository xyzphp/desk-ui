import type { ComponentDoc } from '../../blocks/types';
import { StatisticDemo, StatCardDemo } from './StatisticDemo';
import source from './StatisticDemo.tsx?raw';
import { FormatBytesDemo } from './FormatBytesDemo';
import formatSource from './FormatBytesDemo.tsx?raw';

const statisticProps = [
  { name: 'label / value', type: 'ReactNode / number | string | null | undefined', description: '标题和数值；0 是合法值，非有限数值按空值展示。' },
  { name: 'format / prefix / suffix', type: '(value) => ReactNode / ReactNode / ReactNode', description: '宿主格式化与前后缀，组件不推断单位或语言。' },
  { name: 'description / trend', type: 'ReactNode / StatisticTrend', description: '说明与 { direction, label, tone }；涨跌和语义色由宿主分别指定。' },
  { name: 'loading / labels', type: 'boolean / Partial<StatisticLabels>', default: 'false / 中文', description: '骨架占位，empty / loading 文案。' },
];
export const statisticDoc: ComponentDoc = {
  name: { 'zh-CN': '统计数值', 'en-US': 'Statistic' },
  summary: { 'zh-CN': '标题、数值、单位和趋势的展示组合，不包含数据请求。', 'en-US': 'Display combination of title, value, unit, and trend without data requests.' },
  usage: ['格式化通过 format 注入，缺省保留原值字符串。空值显示占位，0 不作为空值处理。',
    '趋势方向与业务好坏分开提供，不能只靠颜色说明趋势；加载时复用 Skeleton。',
    '文件大小复用 formatBytes，默认 1024 基数与原系统 KB / MB 单位，可显式覆盖单位、精度、语言和空值；无效或负大小不显示为零。'],
  demos: [{ title: '格式化、零值与空值', layout: 'stack', code: source, render: () => <StatisticDemo /> },
    { title: '文件大小格式化', layout: 'stack', code: formatSource, render: () => <FormatBytesDemo /> }],
  api: [{ component: 'Statistic', props: statisticProps }, { component: 'formatBytes', props: [
    { name: 'formatBytes(bytes, options?)', type: '(number | null | undefined, FormatBytesOptions?) => string', description: '纯展示辅助函数，不读取存储或发请求。' },
    { name: 'base / units', type: '1000 | 1024 / readonly string[]', default: '1024 / B、KB、MB、GB、TB、PB、EB', description: '基数和按量级排列的单位。' },
    { name: 'precision / locale / empty', type: 'number / Intl.LocalesArgument / string', default: '1 / 运行环境 / —',
      description: '小数精度限 0～6，字节无小数；显式语言可稳定服务端渲染。四舍五入跨单位边界会晋位。' },
  ] }],
  a11y: ['dl / dt / dd 关联标题和值；加载有 aria-busy 和可访问状态。', '趋势包含文字，装饰图标不重复朗读。'],
};
export const statCardDoc: ComponentDoc = {
  name: { 'zh-CN': '统计卡片', 'en-US': 'Stat card' },
  summary: { 'zh-CN': '使用公共 Panel 承载统计数值，支持图标、趋势与就地操作。', 'en-US': 'Hosts a statistic in the shared Panel with icon, trend, and inline actions.' },
  usage: ['需要带底板的统计摘要时使用，基础数值仍由 Statistic 提供。',
    '多卡排列使用 Grid；actions 放明确操作，不把整张卡片伪装为按钮。不包含自动刷新或定时请求。'],
  demos: [{ title: '统计卡片与加载', layout: 'stack', code: source, render: () => <StatCardDemo /> }],
  api: [{ component: 'StatCard', props: [...statisticProps,
    { name: 'icon / actions', type: 'IconName / ReactNode', description: '装饰图标和就地操作，保留操作的原生语义。' },
    { name: '…Panel 属性', type: 'PanelProps', description: 'muted、className、style 等容器属性。' },
  ] }],
  a11y: ['保留 Statistic 语义，操作独立可聚焦；格式化结果由 React 转义。', '不内置账号范围或权限目录。'],
};
