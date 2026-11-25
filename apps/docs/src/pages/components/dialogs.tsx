import type { PropSpec, ComponentDoc } from '../../blocks/types';
import { ConfirmDialogDemo } from './ConfirmDialogDemo';
import confirmSource from './ConfirmDialogDemo.tsx?raw';
import { PromptDialogDemo } from './PromptDialogDemo';
import promptSource from './PromptDialogDemo.tsx?raw';
import { AlertDialogDemo } from './AlertDialogDemo';
import alertSource from './AlertDialogDemo.tsx?raw';
import { SystemDialogDemo } from './SystemDialogDemo';
import systemSource from './SystemDialogDemo.tsx?raw';
import { DialogQueueDemo } from './DialogQueueDemo';
import queueSource from './DialogQueueDemo.tsx?raw';
import { WindowDialogDemo } from './WindowDialogDemo';
import windowDialogSource from './WindowDialogDemo.tsx?raw';

export const windowDialogDoc: ComponentDoc = {
  name: { 'zh-CN': '窗口式弹窗', 'en-US': 'Window dialog' },
  summary: {
    'zh-CN': '将可拖动、缩放和最大化的窗口置于原生模态层，保留平台标题栏与焦点返回。',
    'en-US': 'Places a draggable, resizable, maximizable window on the native modal layer, keeping platform title bars and focus restoration.',
  },
  usage: [
    'geometry 和 onGeometryChange 控制普通窗口矩形，拖动或缩放会按当前视口收敛边界。最大化单独受控，保留普通矩形用于还原。',
    'open 控制显示，关闭按钮和 Esc 共用 onCancel；点击背景保持打开。初始焦点可用 initialFocus 指定，关闭后返回原触发元素。',
    'titlebarControls 可筛选平台控件；titlebarActions 在标题栏另一侧放置宿主按钮，例如“在新标签页打开”。这些按钮不会启动标题栏拖动或双击最大化。',
    '右下角缩放按钮支持方向键，每次调整 10px，Shift 配合方向键调整 50px；鼠标仍可拖动边缘和右下角。',
    '内容沿用 Window 的 scrollable 规则。iframe、请求、网址校验、会话清理和布局持久化由宿主负责，组件不访问子页面。',
  ],
  demos: [{ title: '隔离网页预览', code: windowDialogSource, render: () => <WindowDialogDemo />, layout: 'stack' }],
  api: [
    {
      component: 'WindowDialog',
      props: [
        {
          name: 'open / title / onCancel',
          type: 'boolean / string / () => void',
          description: '必填；模态显示、窗口名称和关闭请求。',
        },
        {
          name: 'geometry / onGeometryChange',
          type: 'WindowGeometry / (value: WindowGeometry) => void',
          description: '普通位置与尺寸，以及边界收敛后的移动 / 缩放回调。',
        },
        {
          name: 'maximized / onToggleMaximize',
          type: 'boolean / () => void',
          description: '最大化状态及标题栏按钮 / 双击回调。',
        },
        {
          name: 'titlebarControls / titlebarActions',
          type: 'readonly WindowAction[] / ReactNode',
          description: '按平台顺序筛选标题栏控件，并在标题栏另一侧放置操作。',
        },
        {
          name: 'minWidth / minHeight',
          type: 'number',
          default: '360 / 260',
          description: '最小尺寸，窄视口会收敛到可用范围。',
        },
        {
          name: 'initialFocus / scrollable',
          type: 'RefObject<HTMLElement | null> / boolean',
          default: '自动 / true',
          description: '初始焦点与窗口体滚动方式。',
        },
        { name: 'children / className', type: 'ReactNode / string', description: '窗口内容及窗口表面附加类。' },
      ],
    },
  ],
  a11y: [
    '原生 dialog 提供模态焦点隔离与一个具名对话框，内部窗口使用呈现角色。',
    'Esc 触发 onCancel，关闭或卸载后恢复焦点。缩放按钮可通过 Tab 和方向键操作。',
  ],
};

const commonProps: PropSpec[] = [
  {
    name: 'open / title / message',
    type: 'boolean / string / ReactNode',
    description: 'open、title 必填；message 说明当前结果或操作后果。',
  },
  {
    name: 'busy / status / error',
    type: 'boolean / ReactNode / ReactNode',
    description: 'busy 冻结动作和取消；状态使用 status，错误使用 alert，错误不自动关闭弹窗。',
  },
  { name: 'className', type: 'string', description: '附加到原生模态层。' },
];
const commonUsage = [
  '组件仅显示受控弹窗、回调动作，不自动关闭、不发请求，也不改变业务数据。宿主在发起异步动作时同步设置 busy，成功后关闭，失败则显示 error 并保留内容。',
  '沿用原生 .dialog 的 280px 面板、圆角、遮罩和操作层级；通过原生 dialog.showModal() 进入浏览器顶层，保留 DOM 树中的主题继承。不会在文档加载时自动打开。',
  '需要排队时由宿主保证每次只显示一个确认。迁移站 host.dialog 已统一提示、确认、输入和多项选择的先进先出队列；useDialogs 为页面提供卸载 / 撤权取消。锁屏、会话或授权变化时取消活动项与排队项；UI 包不读取会话或存储。',
];
const commonA11y = [
  '标题与正文通过 aria-labelledby / aria-describedby 关联；原生模态对话框负责焦点隔离与 Tab 循环，需要支持 showModal 的浏览器。',
  '关闭或卸载后归还仍存在的触发器焦点；Esc 不会继续触发宿主窗口动作，忙碌时阻止取消。',
  '所有操作为 type="button"，不会提交外层表单；长正文可滚动，动作区可换行，字体不低于 12px。',
];

export const confirmDialogDoc: ComponentDoc = {
  name: { 'zh-CN': '确认弹窗', 'en-US': 'Confirm dialog' },
  summary: {
    'zh-CN': '普通与危险操作共用的确认弹窗，默认聚焦取消，支持忙碌、错误保留与重试。',
    'en-US': 'Confirm dialog shared by regular and dangerous actions; focuses cancel by default and supports busy state, error retention, and retry.',
  },
  usage: [
    '用 confirmLabel 明确表达具体动作，用 cancelLabel 提供安全退出；删除、放弃草稿等操作传 danger。危险确认使用红色主按钮，初始焦点始终放在取消上。',
    ...commonUsage,
    '默认点击背景不关闭；需要轻量取消时可传 closeOnBackdrop。背景关闭必须从背景按下并释放，从面板拖到背景不会取消。',
  ],
  demos: [
    {
      title: '普通确认',
      description: '点击按钮打开，确认后演示 800ms 的忙碌状态；不请求业务 API。',
      code: confirmSource + '\n// 默认普通确认：<ConfirmDialogDemo />',
      render: () => <ConfirmDialogDemo />,
    },
    {
      title: '危险操作、失败与重试',
      description: '第一次确认演示失败，保留弹窗；再次确认演示成功。',
      code: confirmSource + '\n// 危险操作示例：<ConfirmDialogDemo danger simulateFailure />',
      render: () => <ConfirmDialogDemo danger simulateFailure />,
    },
  ],
  api: [
    {
      component: 'ConfirmDialog',
      props: [
        ...commonProps,
        { name: 'confirmLabel / cancelLabel', type: 'string', description: '必填，确认 / 取消按钮名称。' },
        {
          name: 'onConfirm / onCancel',
          type: '() => void',
          description: '必填，确认与取消回调；取消按钮、Esc 和可选背景取消共用 onCancel。',
        },
        {
          name: 'danger / confirmDisabled',
          type: 'boolean / boolean',
          default: 'false',
          description: '危险按钮外观 / 禁止确认；禁用确认不影响取消。',
        },
        { name: 'busyLabel', type: 'string', description: '忙碌时替换确认文案，未提供则保留 confirmLabel。' },
        { name: 'closeOnBackdrop', type: 'boolean', default: 'false', description: '允许点击背景取消；忙碌期间无效。' },
      ],
    },
  ],
  a11y: ['使用 alertdialog，初始聚焦取消，避免回车默认执行危险动作。', ...commonA11y],
};

export const promptDialogDoc: ComponentDoc = {
  name: { 'zh-CN': '输入确认', 'en-US': 'Prompt dialog' },
  summary: {
    'zh-CN': '重命名等简短输入的确认弹窗，提供可见标签、输入法保护、受控草稿与错误反馈。',
    'en-US': 'Confirm dialog for short inputs like renaming, with visible labels, IME protection, controlled drafts, and error feedback.',
  },
  usage: [
    'value / onValueChange 用于受控草稿，defaultValue 初始化非受控草稿。关闭不会自动清空；需要每次重置时，由宿主在打开动作中显式设置 value。',
    'required 会阻止空白文本确认；maxLength 同时约束输入及初始 / 受控超长文本。更具体的校验由宿主通过 confirmDisabled 和 error 表达，onConfirm 收到未裁剪的原文。',
    '首次打开聚焦并选中输入内容；Enter 确认，Esc 取消，输入法组合、229 键码与长按回车不会误提交。可用 selectInputOnOpen=false 关闭初始全选。',
    ...commonUsage,
  ],
  demos: [
    {
      title: '名称输入与校验',
      description: '清空后确认按钮禁用；输入单个字符可查看错误，修正后可继续确认。',
      code: promptSource,
      render: () => <PromptDialogDemo />,
    },
  ],
  api: [
    {
      component: 'PromptDialog',
      props: [
        ...commonProps,
        { name: 'inputLabel', type: 'string', description: '必填，输入框的可见标签与可访问名称。' },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value: string) => void',
          default: "''",
          description: '受控 / 非受控草稿。',
        },
        {
          name: 'placeholder / maxLength / required',
          type: 'string / number / boolean',
          description: '占位、非负整数最大长度、是否要求非空白文本；无效 maxLength 视为不限制。',
        },
        {
          name: 'confirmLabel / cancelLabel / busyLabel',
          type: 'string',
          description: '确认、取消名称必填；忙碌文案可选。',
        },
        {
          name: 'onConfirm / onCancel',
          type: '(value: string) => void / () => void',
          description: '必填，回调完整原文 / 请求取消。',
        },
        {
          name: 'confirmDisabled / selectInputOnOpen',
          type: 'boolean / boolean',
          default: 'false / true',
          description: '额外业务校验 / 打开时是否全选输入内容。',
        },
      ],
    },
  ],
  a11y: [
    '使用 dialog，输入框显式关联标签、错误、required 和 maxLength；忙碌期间保留文本并只读。',
    '焦点样式只包围输入框，不包含上方标签；使用公共中性焦点令牌。',
    ...commonA11y,
  ],
};

export const alertDialogDoc: ComponentDoc = {
  name: { 'zh-CN': '提示弹窗', 'en-US': 'Alert dialog' },
  summary: {
    'zh-CN': '单按钮的结果提示，适用于需要明确知晓的信息；普通反馈优先使用内联提示或通知。',
    'en-US': 'Single-button result notice for information the user must acknowledge; prefer inline notices or toasts for regular feedback.',
  },
  usage: [
    'confirmLabel 和 onConfirm 表达“已知晓”。按钮与 Esc 都触发同一回调，宿主在回调内关闭；背景点击不关闭。',
    '此组件用于结果告知，不执行危险动作；需要让用户决定是否执行时用 ConfirmDialog，普通成功反馈使用 Notice / Notification。',
    ...commonUsage.filter((line) => !line.includes('同步设置 busy')),
  ],
  demos: [{ title: '结果告知', code: alertSource, render: () => <AlertDialogDemo /> }],
  api: [
    {
      component: 'AlertDialog',
      props: [
        commonProps[0]!,
        commonProps[2]!,
        {
          name: 'confirmLabel / onConfirm',
          type: 'string / () => void',
          description: '必填，知晓按钮及回调。Esc 同样触发此回调。',
        },
        { name: 'status', type: 'ReactNode', description: '可选补充状态。' },
      ],
    },
  ],
  a11y: [
    '使用 alertdialog，初始聚焦唯一的知晓按钮，Esc 表达知晓并请求关闭。',
    ...commonA11y.filter((line) => !line.includes('忙碌')),
  ],
};

export const systemDialogDoc: ComponentDoc = {
  name: { 'zh-CN': '系统对话框', 'en-US': 'System dialog' },
  summary: {
    'zh-CN': '确认、输入确认和提示弹窗共用的模态基础组件，也可组合多个明确动作。',
    'en-US': 'Modal base shared by confirm, prompt, and alert dialogs, also composable for multiple explicit actions.',
  },
  usage: [
    '常规两项选择、输入和提示分别优先使用 ConfirmDialog、PromptDialog、AlertDialog；SystemDialog 用于三项动作等自定义组合。',
    '操作按钮按文案宽度排列。空间不足时，按钮整体换到下一行。',
    '旧 open、title、message、input 和 actions 写法保留兼容。新增 onCancel 统一处理 Esc；初始焦点可指定 input 或 actions 的索引，默认优先输入框，再选第一个可用动作。',
    ...commonUsage,
  ],
  demos: [
    { title: '多项操作', code: systemSource, render: () => <SystemDialogDemo /> },
    {
      title: '依次显示',
      description: '仅演示受控顺序；实际宿主负责 Promise、会话隔离和取消，不持久化输入。',
      code: queueSource,
      render: () => <DialogQueueDemo />,
    },
  ],
  api: [
    {
      component: 'SystemDialog',
      props: [
        ...commonProps,
        {
          name: 'actions',
          type: 'readonly DialogAction[]',
          description:
            '必填，{ id?, label, variant?: default | primary | danger, disabled?, onClick? }。动作完成后由宿主关闭。',
        },
        {
          name: 'input',
          type: 'DialogInput',
          description:
            '可选，{ value, onChange, label?, placeholder?, maxLength?, required?, onEnter? }；默认通过标题命名。',
        },
        {
          name: 'onCancel / closeOnBackdrop',
          type: '() => void / boolean',
          default: '未提供 / false',
          description: 'Esc / 可选背景取消；未提供 onCancel 时不会隐式关闭。',
        },
        {
          name: 'initialFocus / selectInputOnOpen',
          type: "'input' | number / boolean",
          default: '自动 / true',
          description: '输入框或动作索引；不可用目标回退到首个可用控件或模态层。',
        },
        {
          name: 'role',
          type: "'dialog' | 'alertdialog'",
          default: "'dialog'",
          description: '模态语义，由具体用途确定。',
        },
      ],
    },
  ],
  a11y: commonA11y,
};
