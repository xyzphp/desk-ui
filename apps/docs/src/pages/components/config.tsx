import type { ComponentDoc } from '../../blocks/types';
import { ConfigProviderDemo } from './ConfigProviderDemo';
import source from './ConfigProviderDemo.tsx?raw';

export const configProviderDoc: ComponentDoc = {
  name: { 'zh-CN': '文案配置', 'en-US': 'Config provider' },
  summary: {
    'zh-CN': '按组件分组配置库内默认文案，支持嵌套继承和组件局部覆盖。',
    'en-US': 'Configures built-in label defaults grouped by component, with nested inheritance and per-component overrides.',
  },
  usage: ['未提供配置时使用 zhCN。优先级为显式文字属性或组件 labels > 最近的 Provider > 上层 Provider > 默认文案。',
    '按已知键递归合并；undefined 不擦除父值，数组与函数整体替换。不要原地修改默认文案对象。',
    '已接入选择、数字、密码、复制、代码、模态、Toast、日期 / 范围、桌面卡片 / 便签 / 时钟、骨架 / 加载、菜单栏 / 窗口 / Dock、主题 / 强调色 / 日历、搜索 / 侧栏新增。',
    '第四批追加 chip、tagInput、resizeHandle、statistic、breadcrumb、drawer；第五批追加 searchSelect、tree、popconfirm。',
    '当前共 64 组；第十批追加框选、公共网格布局与应用栏工作区文案，之前分组继续保留。',
    '多语言 P1 追加 markdownView、permissionTree（原站结构下的名称）、fileCollection、appIcon 四组，并为 chart、sortableList、imageCropper、dateTimePicker 补键。',
    '库内提供 zhCN 与 enUS 两份完整文案；切换语言时把登记表里对应语言的 labels 与 locale 一起交给根部 Provider，见“语言切换”页。',
    '这是文案配置，不自动翻译页面内容、业务标题、调用方选项、壁纸资源名称或依赖宿主提供的领域 labels；也不改变日期值、时区或权限。'],
  demos: [{ title: '全局、嵌套与单项覆盖', layout: 'stack', code: source, render: () => <ConfigProviderDemo /> }],
  api: [{ component: 'ConfigProvider', props: [
    { name: 'labels', type: 'LabelOverrides<ComponentLabels>', description: '按组件键分组的深层局部文案，省略键继承父级。' },
    { name: 'locale', type: 'string', description: '当前语言的 BCP 47 标签，省略时继承父级，根默认 zh-CN；useLocale() 读取，用于日期、数字与排序格式化。' },
    { name: 'children', type: 'ReactNode', description: '需要消费文案的子树，不添加布局 DOM。' },
  ] }, { component: 'useLabels / useLocale / zhCN / enUS', props: [
    { name: 'useLabels(key, overrides?)', type: '(key, overrides) => ComponentLabels[key]', description: '组合组件读取默认值并应用局部覆盖；只能在组件 / hook 中使用。' },
    { name: 'zhCN / enUS', type: 'ComponentLabels', description: '完整的中文与英文默认文案；新增语言以同一类型为基准。' },
    { name: 'useLocale()', type: '() => string', description: '最近的 Provider 给出的语言标签。' },
    { name: 'LabelOverrides<T>', type: '递归局部类型', description: '保留数组与函数合同，不把函数拆成对象。' },
  ] }],
  a11y: ['可访问名称与状态文案同步消费配置；业务字段的可见名称仍由调用方提供。', '配置只在内存中生效，不读取系统语言或持久化私有内容；语言偏好的读取与保存由宿主负责。'],
};
