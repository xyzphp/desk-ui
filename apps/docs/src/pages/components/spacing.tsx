import type { ComponentDoc } from '../../blocks/types';
import { StackDemo, InlineDemo, GridDemo } from './SpacingDemo';
import source from './SpacingDemo.tsx?raw';

const common = [
  { name: 'gap', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'", description: '公共间距令牌：0 / 4 / 8 / 12 / 16 / 24 / 32px。' },
  { name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", description: '交叉方向对齐。' },
  { name: 'justify', type: "'start' | 'center' | 'end' | 'between'", description: '主方向分布。' },
  { name: '…div 属性', type: '原生属性', description: 'children、ref、className、style 和 ARIA 属性透传，不添加交互语义。' },
];
export const stackDoc: ComponentDoc = {
  name: { 'zh-CN': '纵向布局', 'en-US': 'Stack' },
  summary: {
    'zh-CN': '统一页面内的纵向间距和对齐，减少重复 flex / gap 写法。',
    'en-US': 'Unifies vertical spacing and alignment within pages, reducing repeated flex / gap code.',
  },
  usage: ['默认 gap=md、align=stretch、justify=start；需要面板底板时组合 Panel。', '只负责布局，标题层级和业务操作由子内容声明。'],
  demos: [{ title: '面板纵向排列', layout: 'stack', code: source, render: () => <StackDemo /> }],
  api: [{ component: 'Stack', props: common }], a11y: ['保留 DOM 阅读顺序，不通过 CSS 调换内容。'],
};
export const inlineDoc: ComponentDoc = {
  name: { 'zh-CN': '横向布局', 'en-US': 'Inline' },
  summary: {
    'zh-CN': '用于操作栏、标签和短内容的横排组合，默认自动换行。',
    'en-US': 'Horizontal composition for action bars, tags, and short content, wrapping by default.',
  },
  usage: ['默认 gap=sm、align=center、wrap=true；窄容器自然换行。', 'wrap=false 由调用方保证内容不会溢出；不承载工具栏键盘模式。'],
  demos: [{ title: '分组操作与换行', layout: 'stack', code: source, render: () => <InlineDemo /> }],
  api: [{ component: 'Inline', props: [...common,
    { name: 'wrap', type: 'boolean', default: 'true', description: '是否允许换行。' },
  ] }], a11y: ['只是布局容器，不添加 toolbar 角色或拦截键盘。'],
};
export const gridDoc: ComponentDoc = {
  name: { 'zh-CN': '栅格布局', 'en-US': 'Grid' },
  summary: {
    'zh-CN': '使用统一间距的固定列或自适应最小列宽布局，保持内容高度排列。',
    'en-US': 'Fixed-column or auto-fit min-column layout with unified spacing, keeping content height arrangement.',
  },
  usage: ['固定 columns 默认 3，限制为 1–12；在 Workspace 容器内，800px 以下最多两列，600px 以下一列。',
    'minItemWidth 提供时改用 auto-fit，可独立随自身宽度排列。responsive=false 只关闭固定列的容器断点。',
    '行按内容高度从顶部排列，不把空白平均拉高；应用图标文档的参数区和预览区已用 Stack / Grid 分开。'],
  demos: [{ title: '固定列与自适应列', layout: 'frame', code: source, render: () => <GridDemo /> }],
  api: [{ component: 'Grid', props: [
    { name: 'columns / minItemWidth', type: 'number / number', default: '3 / —', description: '固定列数或自适应最小列宽，单位 px。' },
    { name: 'gap / responsive', type: 'Spacing / boolean', default: 'md / true', description: '公共间距与固定列断点。' },
    { name: '…div 属性', type: '原生属性', description: '子项、ARIA、ref 和必要的布局 style。' },
  ] }], a11y: ['保持普通内容顺序，不声明交互 grid 角色；窄列不强制内容超出容器。'],
};
