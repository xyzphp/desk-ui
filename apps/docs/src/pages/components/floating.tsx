import { Button, Tooltip } from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';
import { AnchorPopoverDemo } from './AnchorPopoverDemo';
import anchorSource from './AnchorPopoverDemo.tsx?raw';
import { ModalDemo } from './ModalDemo';
import modalSource from './ModalDemo.tsx?raw';
import { ModalNativeDemo } from './ModalNativeDemo';
import modalNativeSource from './ModalNativeDemo.tsx?raw';
import { ToastDemo } from './ToastDemo';
import toastSource from './ToastDemo.tsx?raw';

export const anchorPopoverDoc: ComponentDoc = {
  name: { 'zh-CN': '锚点浮层', 'en-US': 'Anchor popover' },
  summary: {
    'zh-CN': '选择器、桌面菜单和普通非模态内容共用的定位与关闭底层，进入浏览器顶层并保留主题。',
    'en-US': 'Positioning and dismissal base shared by pickers, desktop menus, and regular non-modal content, entering the browser top layer while keeping the theme.',
  },
  usage: [
    '提供 anchor 元素引用，或 point 视口坐标。靠近边缘时沿定位方向翻转并夹取，面板大小或视口变化时重新定位。',
    '原生模板要求 section 等根标签时传 as；内容直接成为该根节点的子元素，不会增加中间包装层。',
    '调用方设置 role、名称、触发器 aria-haspopup / aria-expanded / aria-controls；表单内容用 dialog，动作菜单用 Popover。',
    'Esc 返回打开前的触发元素；点外部、滚动或焦点移走时关闭，不抢回新焦点。不支持 Popover API 的环境就地展示，可能受裁切。',
  ],
  demos: [{ title: '就地筛选', layout: 'stack', code: anchorSource, render: () => <AnchorPopoverDemo /> }],
  api: [
    {
      component: 'AnchorPopover',
      props: [
        {
          name: 'as',
          type: "'div' | 'section'",
          default: "'div'",
          description: '选择浮层根标签以保留原生 DOM 结构，不增加内容包装层。',
        },
        {
          name: 'open / onClose',
          type: 'boolean / (reason: DismissReason) => void',
          description: '受控显示与关闭原因。',
        },
        {
          name: 'anchor / point',
          type: 'RefObject<HTMLElement | null> / { x, y }',
          description: '元素或视口坐标，至少提供一种。',
        },
        {
          name: 'placement / gap',
          type: 'FloatingPlacement / number',
          default: "'bottom-start' / 6",
          description: '支持上下定位及左右起始对齐，间距单位 px。',
        },
        {
          name: 'initialFocus',
          type: "false | 'first' | 'last' | RefObject",
          default: "'first'",
          description: '初始焦点，空内容聚焦面板。',
        },
        {
          name: 'matchAnchorWidth',
          type: 'boolean',
          default: 'false',
          description: '与锚点同宽（最小 160px），受视口宽度限制。',
        },
        {
          name: 'restoreFocus / dismissOnFocusOutside',
          type: 'boolean',
          default: 'true',
          description: '焦点恢复与移出关闭。',
        },
        {
          name: 'dismiss',
          type: 'boolean',
          default: 'true',
          description: '父浮层统一处理关闭时可传 false，如右键菜单的子菜单。',
        },
      ],
    },
  ],
  a11y: ['非模态，不阻止 Tab 离开；嵌套浮层只关闭最上层，模态内的选择器先处理 Esc。', '不自动补全内容的 ARIA 模式。'],
};

export const tooltipDoc: ComponentDoc = {
  name: { 'zh-CN': '提示气泡', 'en-US': 'Tooltip' },
  summary: {
    'zh-CN': '鼠标悬停或键盘聚焦时展示的简短纯文本说明，与帮助问号共用实现。',
    'en-US': 'Short plain-text hint shown on hover or keyboard focus, sharing the implementation with the help question mark.',
  },
  usage: [
    '用渲染函数把 trigger 属性透传给一个可聚焦元素，保留名称；已有描述用 describedBy 合并。',
    '不放交互内容，也不承载必须阅读才能完成操作的错误；错误使用 Notice 或 Field。',
    '聚焦立即显示，悬停默认延迟 300ms；可移入气泡阅读，Esc 或激活触发器关闭。',
  ],
  demos: [
    {
      title: '按钮说明',
      code: `<Tooltip text="将当前视图恢复为默认布局">{(trigger) => <Button {...trigger}>重置布局</Button>}</Tooltip>`,
      render: () => (
        <Tooltip text="将当前视图恢复为默认布局">{(trigger) => <Button {...trigger}>重置布局</Button>}</Tooltip>
      ),
    },
  ],
  api: [
    {
      component: 'Tooltip',
      props: [
        { name: 'text', type: 'string', description: '必填纯文本，不执行 HTML。' },
        {
          name: 'children',
          type: '(trigger: TooltipTriggerProps) => ReactNode',
          description: '透传 ref、描述与悬停 / 聚焦事件。',
        },
        {
          name: 'delay / placement / disabled',
          type: 'number / FloatingPlacement / boolean',
          default: "300 / 'top' / false",
          description: '悬停延迟、位置和禁用。',
        },
        { name: 'describedBy', type: 'string', description: '已有描述 ID，与气泡 ID 合并。' },
      ],
    },
  ],
  a11y: ['role="tooltip"，通过 aria-describedby 关联；不移动键盘焦点。', '不额外添加 title，避免双重提示。'],
};

export const modalDoc: ComponentDoc = {
  name: { 'zh-CN': '通用模态框', 'en-US': 'Modal' },
  summary: {
    'zh-CN': '承载任意表单和详情内容的原生模态层，统一标题、正文滚动、底部操作和焦点生命周期。',
    'en-US': 'Native modal layer for any form or detail content, unifying title, body scrolling, footer actions, and focus lifecycle.',
  },
  usage: [
    '多字段编辑和详情使用 Modal；简短确认、输入确认仍用 ConfirmDialog / PromptDialog。',
    '宿主控制 open、请求和错误，组件不会保存或自动关闭。busy 禁用内部原生表单控件并阻止 Esc / 背景取消。',
    '关闭卸载内容，需恢复的草稿放在宿主状态；initialFocus 可指定安全的首个控件。',
    '迁移原生表单可用 renderNative：回调内容直接放在 dialog 下，className 也改为附加到 dialog；不插入默认面板、标题、fieldset 或底部包装。源页面负责 dialog 的尺寸、表面和遮罩，示例显式复用组件库表面样式。',
    'renderNative 提供 titleId、descriptionId 和 busy；调用方关联标题及可选描述，显式禁用表单和动作。原生打开 / 关闭、取消保护和焦点返回仍由 Modal 管理。',
  ],
  demos: [
    { title: '多字段内容与底部操作', layout: 'stack', code: modalSource, render: () => <ModalDemo /> },
    { title: '保留原生表单结构', layout: 'stack', code: modalNativeSource, render: () => <ModalNativeDemo /> },
  ],
  api: [
    {
      component: 'Modal',
      props: [
        {
          name: 'open / title / children / footer',
          type: 'boolean / ReactNode',
          description: '受控显示、标题、任意内容与底部动作。',
        },
        { name: 'description', type: 'ReactNode', description: '简短描述，关联 aria-describedby。' },
        {
          name: 'renderNative',
          type: '(context: { titleId: string; descriptionId: string; busy: boolean }) => ReactNode',
          description:
            '保留 dialog 内的源结构，替代默认标题 / children / footer；className 作用于 dialog。调用方负责标题关联、源样式和 busy 时禁用表单。',
        },
        {
          name: 'onCancel / closeOnBackdrop',
          type: '() => void / boolean',
          default: '— / false',
          description: '关闭请求和是否允许背景取消。',
        },
        {
          name: 'busy / closable',
          type: 'boolean',
          default: 'false / true',
          description: '忙碌防重复动作，标题关闭按钮。',
        },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '360 / 520 / 760px，受视口限制。' },
        {
          name: 'initialFocus / labels',
          type: 'RefObject / Partial<ModalLabels>',
          description: '初始焦点和关闭名称。',
        },
      ],
    },
  ],
  a11y: [
    '原生 dialog.showModal 隔离背景焦点，关闭或卸载后有条件恢复触发器。',
    'SystemDialog 与其确认特例复用同一底层；请求和权限留在宿主。',
    '原生结构模式必须把 titleId 放到标题节点；传入 description 时也需渲染并关联 descriptionId。危险表单用 initialFocus 指向取消按钮。',
  ],
};

export const toastDoc: ComponentDoc = {
  name: { 'zh-CN': '消息队列', 'en-US': 'Toast' },
  summary: {
    'zh-CN': '用于操作反馈的消息队列，可自动关闭、悬停暂停、手动关闭与清空，内容保存在 Provider 内存中。',
    'en-US': 'Message queue for action feedback with auto dismiss, hover pause, manual close, and clearing; content lives in the provider memory.',
  },
  usage: [
    '在桌面或工作区根部挂 ToastProvider，通过 useToast().notify 入队；OS.notify 的接入由宿主负责。',
    '默认同时显示 3 条，后续排队；队列最多 50 条，超出移除最早消息并回调 overflow。计时从显示后开始。',
    '默认 5 秒，duration=0 持续显示。悬停、内部焦点与标签页隐藏暂停；重要错误优先持续展示。',
    '锁屏 / 退出时调用 clear 或卸载 Provider。卸载不调用业务生命周期回调；未显示消息不触发 onOpen。',
  ],
  demos: [{ title: '自动关闭、暂停与排队', layout: 'stage', code: toastSource, render: () => <ToastDemo /> }],
  api: [
    {
      component: 'ToastProvider / useToast',
      props: [
        {
          name: 'maxVisible / labels',
          type: 'number / Partial<ToastLabels>',
          default: '3 / 中文',
          description: '1–10 条可见消息与区域 / 关闭名称。',
        },
        {
          name: 'notify(options)',
          type: '(ToastOptions) => string',
          description: '返回 ID，传 title、message、tone、duration、onOpen、onClose、onActivate。',
        },
        {
          name: 'dismiss(id) / clear()',
          type: '(id: string) => void / () => void',
          description: '关闭单条或清空队列；均不会请求服务端。',
        },
        {
          name: 'onClose(reason)',
          type: '(ToastCloseReason) => void',
          description: 'timeout / dismiss / activate / clear / overflow。',
        },
      ],
    },
    {
      component: 'Toast',
      props: [
        {
          name: 'item / onDismiss / labels',
          type: 'ToastEntry / (id, reason) => void / Partial<ToastLabels>',
          description: '可独立使用的消息卡片及计时行为。',
        },
      ],
    },
  ],
  a11y: [
    '普通消息 role="status"，错误 role="alert"；出现时不抢焦点。',
    '关闭按钮可键盘访问，聚焦期间暂停计时；动画尊重减少动态效果。',
  ],
};
