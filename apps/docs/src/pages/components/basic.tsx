import { Avatar, Badge, Button, Divider, IconButton, Link, Scrollable, Text, Workspace } from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';
import lake from '../../assets/preview-lake.svg';
import { ProgressDemo, SkeletonDemo } from './BasicStatusDemo';
import statusSource from './BasicStatusDemo.tsx?raw';

const tones = "'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger'";
const nativeAttributes = { name: 'className / style / ref / data-*', type: '原生元素属性', description: '用于布局、样式令牌、元素引用与宿主钩子；不接入业务请求或存储。' };

export const textDoc: ComponentDoc = {
  name: { 'zh-CN': '文字', 'en-US': 'Text' },
  summary: {
    'zh-CN': '正文、次级文字和行内代码的统一排版，结合 Naive UI 的语义层次，保留桌面字号与主题。',
    'en-US': 'Unified typography for body text, secondary text, and inline code, following the semantic hierarchy with desktop font sizes and theming.',
  },
  usage: ['普通正文用默认色，补充信息用 muted；状态色需同时提供文字，不能只靠颜色表达。', 'Text 处理正文和行内文字，页面标题继续用已有 Title / Lead；不增加另一套标题。', 'ellipsis 只做单行省略；重要内容由宿主提供 title 或详情入口，不据此删除完整原文。'],
  demos: [{ title: '层次、状态与行内代码', layout: 'stack',
    code: `<Text as="p" strong>工作区概览</Text>
<Text as="p" tone="muted" size="sm">最近更新于 09:30</Text>
<Text tone="success">连接正常</Text>
<Text tone="warning">等待确认</Text>
<Text tone="danger">加载失败</Text>
<Text code>selectedOptions</Text>`,
    render: () => <><Text as="p" strong>工作区概览</Text><Text as="p" tone="muted" size="sm">最近更新于 09:30</Text><Text tone="success">连接正常</Text><Text tone="warning">等待确认</Text><Text tone="danger">加载失败</Text><Text code>selectedOptions</Text></> }],
  api: [{ component: 'Text', props: [
    { name: 'as / children', type: "'span' | 'p' / ReactNode", default: "'span'", description: '行内或段落语义，文字经 React 转义。' },
    { name: 'tone', type: tones, default: "'default'", description: '统一的正文 / 状态语义色。' },
    { name: 'size / strong / code / ellipsis', type: "'sm' | 'md' | 'lg' / boolean / boolean / boolean", default: "'md'", description: '字号 12 / 13 / 14px，强调、行内代码外观与单行省略；code 不解析内容。' }, nativeAttributes,
  ] }], a11y: ['span / p 保留文本和段落语义，标题层级由宿主用标题组件表达。', '可见文字不低于 12px；状态同时有文字，深浅主题使用公共令牌。'],
};

export const linkDoc: ComponentDoc = {
  name: { 'zh-CN': '文字链接', 'en-US': 'Text link' },
  summary: {
    'zh-CN': '真正的导航入口，保留原生链接行为、键盘焦点与新窗口隔离。',
    'en-US': 'A real navigation entry that keeps native link behavior, keyboard focus, and new-window isolation.',
  },
  usage: ['导航用 Link，提交或业务动作用 Button；两者保持原生语义。', '支持相对路径、HTTP(S)、mailto、tel；拒绝脚本、data 和含凭据的地址。宿主仍负责目标地址和访问权限。', 'target="_blank" 自动补 noopener / noreferrer；disabled 不导航、不触发动作回调。'],
  demos: [{ title: '导航、弱化与禁用', code: `<Link href="#/overview">查看使用指南</Link>
<Link href="#/tokens" quiet>设计令牌</Link>
<Link href="#/overview" disabled>暂不可用</Link>`, render: () => <><Link href="#/overview">查看使用指南</Link><Link href="#/tokens" quiet>设计令牌</Link><Link href="#/overview" disabled>暂不可用</Link></> }],
  api: [{ component: 'Link', props: [
    { name: 'href / target / rel / onClick', type: '原生 a 属性', description: '有效地址正常导航；新窗口补隔离关系，额外 rel 保留。' },
    { name: 'disabled / quiet', type: 'boolean', default: 'false', description: '禁用导航 / 使用次级文字色。无效地址同样禁用，退出 Tab 顺序。' }, nativeAttributes,
  ] }], a11y: ['原生链接支持 Tab / Enter 和浏览器复制链接等操作；禁用标记 aria-disabled。', '悬停加下划线，键盘焦点用单层细提示，保持文字可读。'],
};

export const dividerDoc: ComponentDoc = {
  name: { 'zh-CN': '分隔线', 'en-US': 'Divider' },
  summary: {
    'zh-CN': '内容与就地操作的水平 / 垂直分隔，使用公共边框色和稳定留白。',
    'en-US': 'Horizontal / vertical separator for content and inline actions using the shared border color and stable spacing.',
  },
  usage: ['用于内容层次，不用于拖动分栏；避免每个字段之间重复分隔。', '水平可带标题，垂直用于一行操作；纯装饰可设 role="presentation"。', '默认留白 16px，小 / 大分别 8px / 24px，不靠页面覆盖颜色或粗细。'],
  demos: [{ title: '内容分隔与行内操作', layout: 'stack', code: `<Text>常用设置</Text><Divider>更多设置</Divider><Text>高级选项</Text>
<Divider dashed spacing="sm" />
<div style={{ display: 'flex', alignItems: 'center' }}><Link href="#/overview">概览</Link><Divider vertical spacing="sm" /><Link href="#/tokens">令牌</Link></div>`,
    render: () => <><Text>常用设置</Text><Divider>更多设置</Divider><Text>高级选项</Text><Divider dashed spacing="sm" /><div style={{ display: 'flex', alignItems: 'center' }}><Link href="#/overview">概览</Link><Divider vertical spacing="sm" /><Link href="#/tokens">令牌</Link></div></> }],
  api: [{ component: 'Divider', props: [
    { name: 'children / align', type: "ReactNode / 'start' | 'center' | 'end'", default: "未提供 / 'center'", description: '水平分隔线标题和位置。' },
    { name: 'vertical / dashed / spacing', type: "boolean / boolean / 'sm' | 'md' | 'lg'", default: "false / false / 'md'", description: '方向、虚线与留白；垂直模式不显示标题。' }, nativeAttributes,
  ] }], a11y: ['默认 separator 并声明方向；它不可聚焦，不实现拖动或键盘调整宽度。', '边框使用当前主题中性色，标题 12px。'],
};

export const avatarDoc: ComponentDoc = {
  name: { 'zh-CN': '头像', 'en-US': 'Avatar' },
  summary: {
    'zh-CN': '账号、聊天和评论共用头像，图片失败回退首字，支持原系统各处尺寸和形状。',
    'en-US': 'Shared avatar for accounts, chats, and comments; falls back to the first character when images fail, with the sizes and shapes used across the original system.',
  },
  usage: ['name 提供名称与默认首字；图片先由宿主核对权限并提供 URL，组件不拼账号或 API 地址。', '账号可用圆形 34 / 46px，聊天可用 rounded 40px，个人预览可传 84px；size 支持数值和预设。', '图片失败留在名称回退，改变 src 会重新加载；不接管上传、裁剪、对象 URL 释放或会话清理。'],
  demos: [{ title: '账号、聊天与图片回退',
    code: `import lake from '../../assets/preview-lake.svg';
<Avatar name="林青" size={34} /><Avatar name="周雨" size={46} tone="success" />
<Avatar name="聊天联系人" shape="rounded" size={40} icon="users" />
<Avatar name="风景头像" src={lake} size={56} />
<Avatar name="未设置头像" src="javascript:example" size={40} />`,
    render: () => <><Avatar name="林青" size={34} /><Avatar name="周雨" size={46} tone="success" /><Avatar name="聊天联系人" shape="rounded" size={40} icon="users" /><Avatar name="风景头像" src={lake} size={56} /><Avatar name="未设置头像" src="javascript:example" size={40} /></> }],
  api: [{ component: 'Avatar', props: [
    { name: 'name / src / fallback / icon', type: 'string / string / ReactNode / IconName', description: 'name 必填；自定义回退优先于图标，最后使用名称首字。' },
    { name: 'size / shape', type: "number | 'sm' | 'md' | 'lg' / 'circle' | 'rounded'", default: "'md' / 'circle'", description: '预设 28 / 40 / 56px；数值限制 24–160px，回退文字至少 12px。' },
    { name: 'tone / decorative / onImageError', type: `${tones} / boolean / () => void`, default: "'accent' / false", description: '语义底色、纯装饰及真实图片加载失败回调。脚本 / 无效地址不创建图片。' }, nativeAttributes,
  ] }], a11y: ['默认 role="img" 并以 name 命名；内部图片为空 alt，避免重复播报。旁边已有同名文字时可用 decorative。', '失败回退保持尺寸，不依赖颜色识别用户；图片使用 no-referrer。'],
};

export const badgeDoc: ComponentDoc = {
  name: { 'zh-CN': '徽标', 'en-US': 'Badge' },
  summary: {
    'zh-CN': '未读数量、提示圆点与独立计数，兼容应用图标和账号列表的数量展示。',
    'en-US': 'Unread counts, hint dots, and standalone counters, compatible with app icons and account lists.',
  },
  usage: ['有 children 时附在右上角，没有时作为行内计数；不会截获被包裹按钮的事件。', 'label 提供完整可读含义；max 只控制视觉缩略，宿主可在 label 中给出完整数量。', '默认隐藏 0；dot 只表达有新状态，普通语义标签继续使用已有 Tag。不自动公告每次未读变化。'],
  demos: [{ title: '未读数、圆点和独立计数', code: `<Badge value={8} label="8 条未读消息"><IconButton icon="mail" label="收件箱" /></Badge>
<Badge value={128} label="128 条未读消息"><Avatar name="联系人" /></Badge>
<Badge dot tone="success" label="在线"><Avatar name="林青" /></Badge>
<Badge value={0} showZero tone="muted" label="0 个项目" />`,
    render: () => <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 28, padding: '8px 4px' }}>
      <Badge value={8} label="8 条未读消息"><IconButton icon="mail" label="收件箱" /></Badge><Badge value={128} label="128 条未读消息"><Avatar name="联系人" /></Badge><Badge dot tone="success" label="在线"><Avatar name="林青" /></Badge><Badge value={0} showZero tone="muted" label="0 个项目" />
    </div> }],
  api: [{ component: 'Badge', props: [
    { name: 'value / label / children', type: 'number | string / string / ReactNode', description: 'label 必填；数字计数或短文本，children 为被标记的图标 / 操作。' },
    { name: 'max / showZero / visible / dot', type: 'number / boolean / boolean / boolean', default: '99 / false / true / false', description: '上限显示 99+、零值、可见性和圆点。负数归零，非有限数字隐藏。' },
    { name: 'tone', type: tones, default: "'danger'", description: '沿用语义色，默认柔和危险色徽标。' }, nativeAttributes,
  ] }], a11y: ['徽标以完整 label 提供可读状态，视觉计数不重复播报；不强制建立 live 区域。', '不修改 children 的可访问名称、键盘和点击行为，数字最小 12px。'],
};

export const progressDoc: ComponentDoc = {
  name: { 'zh-CN': '进度条', 'en-US': 'Progress' },
  summary: {
    'zh-CN': '任务完成、文件用量与上传进度共用的展示，支持确定值和未知进度。',
    'en-US': 'Shared display for task completion, file usage, and upload progress, with determinate and indeterminate modes.',
  },
  usage: ['value / max 与原生 progress 一致，支持直接传字节或完成数；缺少 value 表示未知进度。', '组件只展示注入值，不启动上传、自动刷新或计时；状态色由调用方决定，不把 100% 自动解释为业务成功。', 'size="sm" 使用原系统文件区的 5px 轨道，默认结合 Naive UI 的 8px 轨道，支持 format 显示原值。'],
  demos: [{ title: '完成度、用量与未知进度', code: statusSource, render: () => <ProgressDemo />, layout: 'stack' }],
  api: [{ component: 'Progress', props: [
    { name: 'label / value / max', type: 'string / number / number', default: '必填 / 未知 / 100', description: 'value 限制到 0–max；无效 max 回退 100，无效 value 作为未知进度。' },
    { name: 'tone / size', type: `${tones} / 'sm' | 'md'`, default: "'accent' / 'md'", description: '语义色与 5 / 8px 轨道。' },
    { name: 'showValue / format / valueText', type: 'boolean / (value, max) => ReactNode / string', default: 'true', description: '视觉值、格式函数与读屏描述；未知进度不显示百分数。' }, nativeAttributes,
  ] }], a11y: ['role="progressbar" 及 label、范围、当前值；未知进度不伪造 aria-valuenow。', '百分数没有重复播报；减少动画设置停用未知进度动画。'],
};

export const skeletonDoc: ComponentDoc = {
  name: { 'zh-CN': '骨架屏', 'en-US': 'Skeleton' },
  summary: {
    'zh-CN': '数据与 AI 内容加载占位，完成后显示原内容，保留已挂载的草稿节点。',
    'en-US': 'Loading placeholder for data and AI content that reveals the original content when done and keeps mounted draft nodes.',
  },
  usage: ['loading 由宿主明确控制；组件没有计时器，不把加载失败隐藏成一直转动。', '子内容保持挂载并在加载时 hidden；草稿和本地状态保留。需要禁止提交时由宿主同步 disabled，不用占位代替业务禁用。', 'rows 控制文本行数，avatar 提供头像占位；已有 AI 结果预览复用此组件，避免再写一套灰条。'],
  demos: [{ title: '加载切换与保留草稿', code: statusSource, render: () => <SkeletonDemo />, layout: 'stack' }],
  api: [{ component: 'Skeleton', props: [
    { name: 'loading / rows / avatar / animated', type: 'boolean / number / boolean / boolean', default: 'true / 3 / false / true', description: '加载、行数 1–20、头像和动画；最后一行缩短。' },
    { name: 'label / children', type: 'string / ReactNode', default: '加载中', description: '加载时的可访问状态，完成后显示仍挂载的子内容。' }, nativeAttributes,
  ] }], a11y: ['根容器 aria-busy，加载文字使用 status，灰条仅为装饰。', '减少动画时停止渐变；非加载状态不保留无意义公告。'],
};

export const workspaceDoc: ComponentDoc = {
  name: { 'zh-CN': '工作区容器', 'en-US': 'Workspace container' },
  summary: { 'zh-CN': '独立应用内容的字体、主题、容器断点与公共滚动条入口。', 'en-US': 'Font, theme, container breakpoints, and shared scrollbar entry for standalone app content.' },
  usage: ['用于列表 / 文档应用根，内容仍由 Panel、Field 等组件组合；不创建会话、恢复记录或窗口状态。', '按实际布局设置尺寸，响应式组件使用容器宽度；输入重置现在由控件自身负责，单独使用也不漏原生黑框。'],
  demos: [{ title: '独立内容工作区', layout: 'stack', code: `<Workspace style={{ padding: 16, gap: 12 }}><Text strong>项目工作区</Text><Text tone="muted">统一字体、主题与容器断点</Text><Button>查看项目</Button></Workspace>`, render: () => <Workspace style={{ padding: 16, gap: 12 }}><Text strong>项目工作区</Text><Text tone="muted">统一字体、主题与容器断点</Text><Button>查看项目</Button></Workspace> }],
  api: [{ component: 'Workspace', props: [nativeAttributes, { name: 'children', type: 'ReactNode', description: '应用内容，底色和字体沿用系统令牌。' }] }], a11y: ['使用普通 div，不强加 main / application 语义或焦点限制。', '提供字体和容器查询；用户数据、权限及工作区恢复始终由宿主处理。'],
};

export const scrollableDoc: ComponentDoc = {
  name: { 'zh-CN': '滚动容器', 'en-US': 'Scrollable' },
  summary: {
    'zh-CN': '真实滚动区域的统一滚动条，保持原生键盘、触控和高对比度回退。',
    'en-US': 'Unified scrollbars for real scrolling areas while keeping native keyboard, touch, and high-contrast fallbacks.',
  },
  usage: ['通过高度与 overflow 建立真实滚动容器；Scrollable 只提供公共滚动条，不模拟滚动。', '滚动条样式已改为全局生效（base.css 的 * 规则）：页面、文本域、下拉列表等所有滚动容器都是 8px 宽、无轨道的圆角细滑块（可见部分约 4px，悬停加深），颜色取当前元素正文色的混合，随浅色 / 深色主题自动适配；Scrollable 不再是必需的，仅保留为语义标记。需要隐藏滚动条时用 ds-scrollable-hidden。', '独立区域提供 role、名称和 tabIndex，窗口内正文只保留一个负责滚动的层级。'],
  demos: [{ title: '可聚焦内容区域', layout: 'stack', code: `<Scrollable role="region" aria-label="最近记录" tabIndex={0} style={{ maxHeight: 140, overflow: 'auto' }}>
  {Array.from({ length: 10 }, (_, index) => <Text as="p" key={index}>第 {index + 1} 条记录</Text>)}
</Scrollable>`, render: () => <Scrollable role="region" aria-label="最近记录" tabIndex={0} style={{ maxHeight: 140, overflow: 'auto' }}>{Array.from({ length: 10 }, (_, index) => <Text as="p" key={index}>第 {index + 1} 条记录</Text>)}</Scrollable> }],
  api: [{ component: 'Scrollable', props: [nativeAttributes, { name: 'role / aria-label / tabIndex', type: '原生属性', description: '独立内容区域的语义、名称与键盘进入方式由宿主提供。' }] }], a11y: ['保留真实滚动、原生触控和键盘，强制颜色模式使用浏览器回退。', '不拦截 Tab、滚轮和方向键，不把静态内容强制变为滚动区域。'],
};
