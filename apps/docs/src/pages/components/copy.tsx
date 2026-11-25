import type { ComponentDoc } from '../../blocks/types';
import { CopyButtonDemo, CopyFieldDemo, CodeBlockDemo } from './CopyDemo';
import source from './CopyDemo.tsx?raw';

const copyBoundary = 'onCopy 是注入的复制操作，返回 void / true 视为成功，false 或拒绝的 Promise 视为失败；组件不会读取剪贴板或发请求。';
export const copyButtonDoc: ComponentDoc = {
  name: { 'zh-CN': '复制按钮', 'en-US': 'Copy button' },
  summary: {
    'zh-CN': '提供复制中、已复制与失败反馈的按钮，异步操作由宿主注入。',
    'en-US': 'Button with copying, copied, and failure feedback; async operations are injected by the host.',
  },
  usage: [copyBoundary, '仅点击时执行；等待期间防重复点击，原文变化或卸载后忽略过期结果。成功 / 失败反馈 2 秒后恢复。',
    '复制私有内容前由宿主校验权限，错误回调不要记录原文；复制失败保留可重试按钮。'],
  demos: [{ title: '成功、失败与禁用', layout: 'stack', code: source, render: () => <CopyButtonDemo /> }],
  api: [{ component: 'CopyButton', props: [
    { name: 'text / onCopy', type: 'string / CopyHandler', description: '必填，实际复制的原文和注入操作；此 onCopy 不同于原生剪贴板事件。' },
    { name: 'onCopied / onCopyError', type: '() => void / (error: unknown) => void', description: '当前操作的成功 / 失败回调。' },
    { name: 'labels', type: 'Partial<CopyButtonLabels>', description: 'copy / copying / copied / failed。' },
    { name: '…Button 属性', type: 'ButtonProps', description: 'variant / size / disabled 等；className 作用于动作和反馈外框。' },
  ] }],
  a11y: ['真实按钮，复制中 disabled / aria-busy，状态与失败可被读屏读取。', '不会自动提交表单或移动焦点。'],
};

export const copyFieldDoc: ComponentDoc = {
  name: { 'zh-CN': '复制字段', 'en-US': 'Copy field' },
  summary: {
    'zh-CN': '可选择的只读输入与复制按钮，用于地址、标识和宿主明确允许复制的内容。',
    'en-US': 'Selectable read-only input with a copy button for addresses, identifiers, and other content the host allows copying.',
  },
  usage: [copyBoundary, 'Field 提供名称与说明，输入为只读；需要隐藏内容时使用 PasswordInput。',
    '值由宿主提供，组件不加载已保存凭据；仍可通过 name / form 纳入原生表单。'],
  demos: [{ title: '只读地址', layout: 'stack', code: source, render: () => <CopyFieldDemo /> }],
  api: [{ component: 'CopyField', props: [
    { name: 'value / onCopy', type: 'string / CopyHandler', description: '只读值与注入复制。' },
    { name: 'onCopied / onCopyError / labels', type: '同 CopyButton', description: '复制反馈配置。' },
    { name: '…input 属性', type: '原生 input 属性', description: '名称、描述、disabled、name、form、ref 等。className / style 作用于整行。' },
  ] }],
  a11y: ['原生只读输入可聚焦、选择与复制，保留 Field 的名称 / 描述关联。', '禁用时输入和复制按钮同时禁用。'],
};

export const codeBlockDoc: ComponentDoc = {
  name: { 'zh-CN': '代码块', 'en-US': 'Code block' },
  summary: {
    'zh-CN': '按原文显示的代码容器，统一标题、语言标签、滚动与可选复制操作。',
    'en-US': 'Code container shown verbatim with unified title, language tag, scrolling, and optional copy action.',
  },
  usage: ['code 作为纯文本转义，保留换行和缩进；language 仅显示名称，不加载高亮依赖或执行代码。',
    '默认横向滚动，wrap 可启用换行；长内容限高滚动，不撑破窗口。', '仅提供 onCopy 时显示复制按钮，复用 CopyButton 的异步反馈与统一文案。'],
  demos: [{ title: '转义标记与长内容', layout: 'stack', code: source, render: () => <CodeBlockDemo /> }],
  api: [{ component: 'CodeBlock', props: [
    { name: 'code', type: 'string', description: '必填原文，不解析 HTML。' },
    { name: 'label / language', type: 'string', description: '标题 / 可访问名称和语言标签，默认标题读取配置。' },
    { name: 'wrap / onCopy', type: 'boolean / CopyHandler', default: 'false / —', description: '换行和复制能力。' },
    { name: 'labels', type: 'Partial<CodeBlockLabels>', description: 'code 标题；复制动作读取 copyButton 文案分组。' },
  ] }],
  a11y: ['语义 figure / figcaption / pre / code，代码区可聚焦并滚动。', '原文不会作为脚本、链接或事件属性执行。'],
};
