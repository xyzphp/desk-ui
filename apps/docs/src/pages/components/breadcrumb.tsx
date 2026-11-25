import type { ComponentDoc } from '../../blocks/types';
import { BreadcrumbDemo } from './BreadcrumbDemo';
import source from './BreadcrumbDemo.tsx?raw';

export const breadcrumbDoc: ComponentDoc = {
  name: { 'zh-CN': '面包屑', 'en-US': 'Breadcrumb' },
  summary: {
    'zh-CN': '展示层级路径和当前页，支持真实链接、宿主导航、中间层级折叠及原页面包屑兼容。',
    'en-US': 'Shows hierarchy paths and the current page, supporting real links, host navigation, middle-level collapsing, and the original breadcrumb compatibility.',
  },
  usage: ['items 使用稳定且唯一的 id，最后一项是当前页。提供 href 时使用真实链接；无 href 的历史项可由 onSelect 回调导航。',
    '超过 maxItems 时保留首项与尾部层级，中间入口在公共锚点浮层中按普通链接 / 按钮展示。',
    '迁移原页面时，可将 maxItems 设为足够大的值以保留完整横向路径；activateCurrent 允许将当前层级作为按钮触发 onSelect。',
    '禁用项不可导航，链接协议复用 Link 安全规则。空 items 不展示导航。'],
  demos: [{ title: '折叠路径与返回', layout: 'stack', code: source, render: () => <BreadcrumbDemo /> }],
  api: [{ component: 'Breadcrumb', props: [
    { name: 'items', type: 'readonly BreadcrumbItem[]', description: '{ id, label, href?, disabled? }；label 为可见路径名称。' },
    { name: 'maxItems', type: 'number', default: '4', description: '包含省略入口的最大可见段数，最小 3。' },
    { name: 'onSelect', type: '(item: BreadcrumbItem) => void', description: '没有 href 的历史项导航动作。' },
    { name: 'activateCurrent', type: 'boolean', default: 'false', description: '为 true 时当前层级也使用按钮并触发 onSelect。' },
    { name: 'labels', type: 'Partial<BreadcrumbLabels>', description: 'navigation / more，默认从 ConfigProvider 读取。' },
  ] }],
  a11y: ['nav / 有序列表，当前项 aria-current="page"；省略入口有展开状态和明确名称。',
    '省略层是非模态 dialog，普通 Tab 导航、Esc 关闭并返回触发器；不声明未实现的菜单模式。'],
};
