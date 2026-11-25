import type { ComponentDoc } from '../../blocks/types';
import { ChartDemo } from './ChartDemo';
import source from './ChartDemo.tsx?raw';

export const chartDoc: ComponentDoc = {
  name: { 'zh-CN': '图表', 'en-US': 'Chart' },
  summary: {
    'zh-CN': '展示单指标的柱状图、折线图、饼图或指标卡，选择与数据请求由宿主提供。',
    'en-US': 'Bar, line, pie, or metric card for a single indicator; selection and data requests are provided by the host.',
  },
  usage: [
    '调用方把授权后的数据投影为有序标签、数值和已格式化文案；组件不发请求、不解析日期，也不修改数据。',
    '图形最多绘制 50 组；饼图用全部分母计算占比，并将其余分组合并为“其他”。完整数据表由应用单独展示。',
    '传入 onSelect 时，数据点可用鼠标、Enter 或空格激活；只读预览不应传入回调。',
    '负数或总和为零时饼图显示原因；报表表格类型继续由调用方使用 Table 展示。',
  ],
  demos: [{ title: '图表类型与交互', layout: 'stack', code: source, render: () => <ChartDemo /> }],
  api: [
    {
      component: 'Chart',
      props: [
        {
          name: 'rootElement',
          type: "'div' | 'section'",
          default: "'div'",
          description: '选择组件根元素；迁移已有页面时可用 section 保留原图表容器语义。',
        },
        {
          name: 'type',
          type: "'bar' | 'line' | 'pie' | 'number'",
          description: '展示形式；表格类型由调用方复用 Table。',
        },
        { name: 'title / metricLabel', type: 'string / string', description: '图形的可访问名称与当前指标名称。' },
        {
          name: 'data',
          type: 'readonly ChartDatum[]',
          description: '{ key, label, value, displayValue }；值由宿主先按权限和业务格式投影。',
        },
        {
          name: 'palette / legend / labels / grid',
          type: "'theme' | 'blue' | 'green' / boolean",
          default: "'theme' / true / true / true",
          description: '配色和数据图层显示选项。',
        },
        { name: 'formatAxisValue', type: '(value: number) => string', description: '可选坐标轴文案格式化函数。' },
        {
          name: 'onSelect',
          type: '(datum: ChartDatum) => void',
          description: '可选数据点操作；提供后增加按钮语义、键盘激活和焦点提示。',
        },
        {
          name: 'emptyLabel / negativePieLabel / zeroPieLabel / overflowLabel / overflowPieLabel',
          type: 'string',
          description: '分别覆盖空数据、饼图非法值和超出图形上限的说明。',
        },
      ],
    },
  ],
  a11y: [
    'SVG 图形带有 img 角色和名称；交互点带按钮语义、可见焦点，Enter 与空格执行相同回调。',
    '空数据和饼图不可绘制的原因通过 status 播报。',
  ],
};
