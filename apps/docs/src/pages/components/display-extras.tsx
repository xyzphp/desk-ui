import type { ComponentDoc } from '../../blocks/types';
import { TimelineDemo } from './TimelineDemo';
import { AvatarGroupDemo } from './AvatarGroupDemo';
import { KbdDemo, LoadingOverlayDemo, ResultDemo } from './StatusExtrasDemo';
import timelineSource from './TimelineDemo.tsx?raw';
import avatarSource from './AvatarGroupDemo.tsx?raw';
import statusSource from './StatusExtrasDemo.tsx?raw';

export const timelineDoc: ComponentDoc = {
  name: { 'zh-CN': '时间线', 'en-US': 'Timeline' },
  summary: {
    'zh-CN': '沿用原系统评论记录的层次，展示通用事件、时间与操作内容。',
    'en-US': 'Follows the original comment-record hierarchy to display generic events, times, and action content.',
  },
  usage: ['items 按宿主给出的顺序显示，id 唯一稳定；时间文字和时区转换由宿主负责。',
    '仅展示事件，不包含评论发送、分页、加载请求或业务权限；内容 / 动作通过 React 节点传入。',
    '语义色与图标表达状态，同时保留标题文字，不只靠颜色区分事件。'],
  demos: [{ title: '事件、状态与内容插槽', layout: 'stack', code: timelineSource, render: () => <TimelineDemo /> }],
  api: [{ component: 'Timeline', props: [
    { name: 'label / items', type: 'string / readonly TimelineItem[]', description: '必填列表名称与事件数组。' },
    { name: 'TimelineItem', type: '{ id, title, content?, time?, dateTime?, icon?, tone? }', description: '时间文字与机器可读时间分别传入；内容为 ReactNode。' },
    { name: 'labels', type: 'Partial<ComponentLabels["timeline"]>', description: '空记录文字，默认读取 ConfigProvider。' },
    { name: '…ol 属性', type: 'ComponentProps<ol>', description: 'ref、className、style 和原生属性。' },
  ] }],
  a11y: ['保留 ol / li 的事件顺序语义；时间使用 time / dateTime，装饰图标从辅助技术隐藏。',
    '交互内容保持自身按钮 / 链接语义，列表不接管键盘。'],
};

export const avatarGroupDoc: ComponentDoc = {
  name: { 'zh-CN': '头像组', 'en-US': 'Avatar group' },
  summary: {
    'zh-CN': '复用 Avatar 展示成员与溢出人数，剩余成员可就地展开查阅。',
    'en-US': 'Reuses Avatar to show members and overflow counts; remaining members can be expanded in place.',
  },
  usage: ['每位成员提供稳定 id、name 和已授权头像 URL；不包含成员查询、权限或选择业务。',
    'max 只限制初始可见人数，溢出按钮以原生 details 展开剩余成员。max=0 时全部通过溢出入口查阅。',
    '尺寸、形状、失败回退和图片安全策略复用 Avatar，列表始终有文字可访问名称。'],
  demos: [{ title: '人数折叠与完整名单', layout: 'stack', code: avatarSource, render: () => <AvatarGroupDemo /> }],
  api: [{ component: 'AvatarGroup', props: [
    { name: 'label / items', type: 'string / readonly AvatarGroupItem[]', description: '分组名称；成员含 id 与 Avatar 的 name、src、fallback、icon、tone、onImageError。' },
    { name: 'max / size / shape', type: 'number / AvatarProps["size"] / AvatarProps["shape"]', default: '5 / md / circle',
      description: '可见人数与头像外观；max 规范为非负整数。' },
    { name: 'labels', type: 'Partial<AvatarGroupLabels>', description: '空成员和查看其余人数文案。' },
    { name: '…div 属性', type: 'ComponentProps<div>', description: 'ref、className、style 和原生属性。' },
  ] }],
  a11y: ['可见头像使用成员名称；原生 summary 支持 Tab、Enter / Space，展开后有完整姓名。',
    '隐藏成员的头像为装饰，姓名保持可读；不把静态头像伪装为按钮。'],
};

export const kbdDoc: ComponentDoc = {
  name: { 'zh-CN': '快捷键提示', 'en-US': 'Kbd' },
  summary: { 'zh-CN': '沿用菜单快捷键的等宽文字层次，提供可组合的原生键帽。', 'en-US': 'Follows the monospace hierarchy of menu shortcuts and provides composable native key caps.' },
  usage: ['只展示快捷键，不注册监听；组合键内容由宿主按平台和实际操作提供。',
    '特殊符号可通过 aria-label 提供明确名称；多个键帽使用公共 Inline 排列。'],
  demos: [{ title: '组合键与平台符号', layout: 'stack', code: statusSource, render: () => <KbdDemo /> }],
  api: [{ component: 'Kbd', props: [
    { name: 'children / …kbd 属性', type: 'ReactNode / ComponentProps<kbd>', description: '键帽内容、ref、aria-label、className 与原生属性。' },
  ] }],
  a11y: ['保留原生 kbd 语义，字号不低于 12px；显示文字不暗示已经注册快捷键。'],
};

export const resultDoc: ComponentDoc = {
  name: { 'zh-CN': '结果页', 'en-US': 'Result' },
  summary: {
    'zh-CN': '组合 EmptyState、语义图标和公共布局，展示成功、错误或无权限结果。',
    'en-US': 'Combines EmptyState, semantic icons, and the shared layout to show success, error, or no-permission results.',
  },
  usage: ['用于整块内容的处理结果，短消息仍使用 Notice / Toast，空列表继续用 EmptyState。',
    'actions 只展示宿主传入的操作，组件不重试、不导航、不捕获 React 异常。Result 是视图，不是 ErrorBoundary。',
    '标题可覆盖默认状态文案，说明和详细内容由宿主提供；无权限视图不能代替服务端鉴权。'],
  demos: [{ title: '结果状态与重试动作', layout: 'stack', code: statusSource, render: () => <ResultDemo /> }],
  api: [{ component: 'Result', props: [
    { name: 'status', type: 'success | error | warning | info | not-found | forbidden', default: 'info', description: '默认图标、语义色和标题。' },
    { name: 'title / description / children / actions', type: 'ReactNode', description: '标题、简短说明、详细内容与动作插槽。' },
    { name: 'labels', type: '{ titles?: Partial<Record<ResultStatus, string>> }', description: '覆盖默认状态标题，读取 ConfigProvider.result。' },
    { name: '…section 属性', type: 'ComponentProps<section>', description: 'ref、className、style 和原生属性。' },
  ] }],
  a11y: ['结果区域与标题关联，状态同时有文字，图标为装饰；不自动使用打断式 alert 或抢夺焦点。',
    '宿主负责路由焦点和需要时的动态结果宣布，动作保留独立按钮 / 链接语义。'],
};

export const loadingOverlayDoc: ComponentDoc = {
  name: { 'zh-CN': '区域加载遮罩', 'en-US': 'Loading overlay' },
  summary: {
    'zh-CN': '加载时保留子内容与草稿，复用 Spinner、原生禁用与统一忙碌焦点逻辑。',
    'en-US': 'Keeps children and drafts during loading, reusing Spinner, native disabling, and unified busy focus logic.',
  },
  usage: ['loading 由宿主控制，不内置请求、计时、取消或成功状态；示例计时只模拟加载。',
    '内容始终挂载；加载时使用 inert 阻止焦点 / 链接操作，并以 fieldset 禁用原生表单字段。',
    '禁用字段按原生规则暂不参与 FormData，加载中不要读取它们作为完整提交数据；宿主同时管理外部提交入口。',
    '加载若从内部控件启动则把焦点留在区域外壳，结束后恢复原控件；用户已移到外部时不抢回焦点。',
    '不提供权限或遮密保证，锁屏 / 登出仍由宿主清理私密内容；仅支持现代 inert 环境。'],
  demos: [{ title: '内容保留与操作阻断', layout: 'stack', code: statusSource, render: () => <LoadingOverlayDemo /> }],
  api: [{ component: 'LoadingOverlay', props: [
    { name: 'loading', type: 'boolean', description: '必填，由宿主管理加载生命周期。' },
    { name: 'label / labels', type: 'string / Partial<ComponentLabels["loadingOverlay"]>', default: '加载中', description: '显式状态文字优先，否则读取文案配置。' },
    { name: 'children / …div 属性', type: 'ReactNode / ComponentProps<div>', description: '保持挂载的内容；ref、className、style 和事件作用于区域外壳。' },
  ] }],
  a11y: ['aria-busy 表达状态，加载文字可见且有 status；Spinner 不重复宣布相同文字。',
    '加载区不形成模态焦点陷阱，外部仍可操作；结束时只在焦点仍留在外壳时恢复原位置。'],
};
