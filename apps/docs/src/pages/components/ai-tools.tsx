import { AIReferenceList, AIResultPanel } from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';
import { AIToolbarDemo } from './AIToolbarDemo';
import toolbarSource from './AIToolbarDemo.tsx?raw';
import { AIReferenceListDemo } from './AIReferenceListDemo';
import referenceSource from './AIReferenceListDemo.tsx?raw';
import { AIResultPanelDemo } from './AIResultPanelDemo';
import resultSource from './AIResultPanelDemo.tsx?raw';

const hostBoundary =
  '宿主提供已授权的动作、模型、参考项和当前草稿，逐次复核权限与原修订号；UI 包不发现模型、不读取表单或历史、不发请求。锁屏、会话切换、关闭或卸载时由宿主取消请求并丢弃过期结果。';

export const aiToolbarDoc: ComponentDoc = {
  name: { 'zh-CN': 'AI 工具栏', 'en-US': 'AI toolbar' },
  summary: {
    'zh-CN': '复用快捷工具窗口：标题栏、动作网格、内容区与底部输入区（补充要求、参数、模型选择、生成 / 停止）。',
    'en-US': 'Reusable quick-tool window: title bar, action grid, content area, and bottom input row (extra requirements, parameters, model selection, generate / stop).',
  },
  usage: [
    'actions 和 models 均由宿主注入；首次取各自第一个可用项，也可显式控制。动作为顶部网格按钮，选中项使用强调色浅背景；模型是输入区右侧的静默按钮（名称 + 箭头），点击打开模型列表，选中项带勾选。切换只改变选择，不自动生成。',
    '提供 onClose 时显示与桌面窗口一致的标题栏（仅关闭控件）；children 放在动作栏与输入区之间，通常是原文对比和 AIResultPanel；instruction 提供底部输入区的补充要求。生成按钮是圆形向上箭头，忙碌时变为停止；回调只返回 { action, model }，补充要求由宿主自行保存。宿主发起操作时同步设置 busy，并独立防止重复提交；停止回调不自动清空原草稿。',
    '当前模型移除、停用或动作失效时阻止生成；保留原选择等待宿主明确更新，避免悄悄改用另一个模型。',
    'options 可放语言或图片质量等参数；忙碌时置于禁用 fieldset 内，宿主自定义控件也应响应 busy。',
    hostBoundary,
  ],
  demos: [
    {
      title: '选择、停止与失败反馈',
      description: '一秒延迟为本地模拟；不调用模型服务。',
      code: toolbarSource,
      render: () => <AIToolbarDemo />,
      layout: 'stack',
    },
    {
      title: '没有可用模型',
      code: `${toolbarSource}\n// 使用：<AIToolbarDemo emptyModels />`,
      render: () => <AIToolbarDemo emptyModels />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'AIToolbar',
      props: [
        {
          name: 'label / labels',
          type: 'string / AIToolbarLabels',
          description:
            '必填，区域名称以及 actions、model、generate、generating、stop、emptyModels、unavailableModel 文案。',
        },
        {
          name: 'actions / models',
          type: 'readonly AIToolAction[] / readonly AIModelOption[]',
          description:
            '必填；动作 { id, label, icon?, disabled? }，模型 { id, label, disabled? }。id 稳定且不重复，空字符串保留为未选择。',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value: string) => void',
          description: '当前动作，受控 / 非受控；默认首个可用动作。',
        },
        {
          name: 'modelValue / defaultModelValue / onModelValueChange',
          type: 'string / string / (value: string) => void',
          description: '本次模型，受控 / 非受控；默认首个可用模型，不修改系统默认模型。',
        },
        {
          name: 'onGenerate / onStop',
          type: '(selection: AIToolSelection) => void / () => void',
          description: '生成必填；忙碌时提供停止按钮，无停止回调则显示禁用的生成中状态。',
        },
        {
          name: 'busy / disabled / generateDisabled',
          type: 'boolean',
          default: 'false',
          description: '忙碌冻结选择，disabled 冻结全部动作；generateDisabled 表达额外业务校验。',
        },
        {
          name: 'title / onClose',
          type: 'string / () => void',
          description: '提供 onClose 后显示标题栏（默认标题同 label），只含关闭控件；拖动与缩放由宿主窗口承担。',
        },
        {
          name: 'instruction',
          type: 'AIToolbarInstruction',
          description: '{ value, onValueChange, label, placeholder?, maxLength? }；省略则不显示补充要求输入框。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '动作栏与输入区之间的内容区，可滚动。',
        },
        {
          name: 'options / status / error',
          type: 'ReactNode',
          description: '输入区左下角的参数插槽、实时状态和错误；失败不会自动更换选择或重试。',
        },
      ],
    },
  ],
  a11y: [
    '动作是带 aria-pressed 的原生按钮；模型按钮为 aria-haspopup="dialog" 并带当前模型名称，列表内每项是带 aria-pressed 的按钮，全部按钮默认 type="button"。',
    '模型列表为非模态浮层，Esc 或点击外部关闭并归还焦点；Tab 离开关闭，不限制页面焦点。生成 / 停止为图标按钮，提供 aria-label 与提示。',
    '区域通过 aria-busy 表达忙碌；状态为 status、错误为 alert。Button、非模态选择层、Notice 和 Spinner 共用令牌，选中和悬停状态分开。',
  ],
};

export const aiReferenceListDoc: ComponentDoc = {
  name: { 'zh-CN': 'AI 参考内容', 'en-US': 'AI reference list' },
  summary: {
    'zh-CN': '逐项选择本次可用参考，按需查看纯文本内容；默认不勾选任何项。',
    'en-US': 'Pick references available for this run item by item and view their plain text on demand; nothing is checked by default.',
  },
  usage: [
    'items 只包含当前用户可以查看且本次允许参考的字段。选中状态表达当前选择，不能代替服务端授权或参考字段白名单。',
    '参考项采用可选择卡片，勾选后使用浅色强调背景和细边框；预览通过原生 details 就地展开，内容按纯文本显示。只读状态禁止修改勾选，但仍能查看已提供内容。',
    '默认不选择参考；宿主可传 defaultValue 或受控 value。回调仅包含当前目录中的项；目录变化不会自动请求或改写宿主选择，提交前仍需重新取当前授权目录的交集。',
    '迁移站聊天由已授权会话能力接口提供历史聊天记录，打开选项时固定历史快照和序号，默认勾选并可取消。生成与提示词预览使用同一快照，取消后请求省略历史正文和序号。组合示例见消息线程页。',
    hostBoundary,
  ],
  demos: [
    { title: '选择与展开参考', code: referenceSource, render: () => <AIReferenceListDemo />, layout: 'stack' },
    {
      title: '只读与空列表',
      code: `<AIReferenceList label="只读参考" items={[{ id: 'title', label: '标题', content: '示例标题' }]} value={['title']} readOnly labels={{ empty: '暂无参考', preview: (item) => '查看' + item.label }} />
<AIReferenceList label="空参考" items={[]} labels={{ empty: '暂无参考', preview: (item) => '查看' + item.label }} />`,
      render: () => (
        <>
          <AIReferenceList
            label="只读参考"
            items={[{ id: 'title', label: '标题', content: '示例标题' }]}
            value={['title']}
            readOnly
            labels={{ empty: '暂无参考', preview: (item) => '查看' + item.label }}
          />
          <AIReferenceList
            label="空参考"
            items={[]}
            labels={{ empty: '暂无参考', preview: (item) => '查看' + item.label }}
          />
        </>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'AIReferenceList',
      props: [
        {
          name: 'label / items / labels',
          type: 'string / readonly AIReferenceItem[] / AIReferenceListLabels',
          description: '必填；项为 { id, label, content?, disabled? }，labels 为 { empty, preview(item) }。',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'readonly string[] / readonly string[] / (value: string[]) => void',
          default: '[]',
          description: '受控 / 非受控选择；不自动采集或提交内容。',
        },
        { name: 'disabled / readOnly', type: 'boolean', default: 'false', description: '禁止修改选择，预览仍可展开。' },
      ],
    },
  ],
  a11y: [
    '区域有名称；每个复选框由可见标签命名，Space 切换，禁用项不参与修改。',
    '预览使用原生 details / summary，长文本可键盘聚焦并使用公共滚动条；内容只经 React 转义。',
  ],
};

export const aiResultPanelDoc: ComponentDoc = {
  name: { 'zh-CN': 'AI 结果预览', 'en-US': 'AI result panel' },
  summary: {
    'zh-CN': '原文与生成草稿对比，支持编辑、停止、重试、舍弃、应用和追加回调。',
    'en-US': 'Compares the source text with the generated draft and supports editing, stop, retry, discard, apply, and append callbacks.',
  },
  usage: [
    'state 为 idle、generating、ready 或 error；流式内容通过受控 value 传入，组件不拼接流或发起重试请求。',
    '只有 ready、非空白且长度有效时允许应用或追加；生成中及错误时保留草稿并禁止写入动作。只读仍能选择和复制文本。',
    'onApply / onAppend 收到用户编辑后的完整原文，不自动替换或提交宿主字段；宿主必须重新核对目标记录、修订、权限与原文快照。',
    '用于提示词字段时，宿主先把结果合并到原选区，再校验完整字段的必要变量、允许变量与长度；校验失败保留原草稿并显示错误。迁移站的快捷工具提示词复用此组件，应用后仍需手动保存设置。',
    '聊天将替换选区与在光标处插入分别连接到 onApply / onAppend，按 UTF-16 偏移保留原位置并校验合并后最多 4000 个 Unicode 字符。应用前复核会话、子权限、配置修订及原草稿，切换会话取消旧结果。',
    '原文使用弱底色，结果保持编辑底色；标题、字数、加载占位和操作区分层显示。compare=false 只展示结果，窄窗口自动上下排列。HTML 和 Markdown 按纯文本显示，专用安全渲染由宿主接入。',
    hostBoundary,
  ],
  demos: [
    { title: '编辑、状态与结果操作', code: resultSource, render: () => <AIResultPanelDemo />, layout: 'stack' },
    {
      title: '只读预览',
      code: `<AIResultPanel label="只读结果" original="原文" defaultValue="生成草稿" state="ready" readOnly labels={{ original: '当前内容', result: '生成内容', empty: '等待生成', generating: '正在生成', apply: '应用', append: '追加', discard: '舍弃', retry: '重试', stop: '停止' }} />`,
      render: () => (
        <AIResultPanel
          label="只读结果"
          original="原文"
          defaultValue="生成草稿"
          state="ready"
          readOnly
          labels={{
            original: '当前内容',
            result: '生成内容',
            empty: '等待生成',
            generating: '正在生成',
            apply: '应用',
            append: '追加',
            discard: '舍弃',
            retry: '重试',
            stop: '停止',
          }}
        />
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'AIResultPanel',
      props: [
        {
          name: 'label / original / labels',
          type: 'string / string / AIResultPanelLabels',
          description: '必填；labels 包含 original、result、empty、generating、apply、append、discard、retry、stop。',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value: string) => void',
          default: "''",
          description: '受控 / 非受控结果草稿；切换状态和错误不会清空。',
        },
        {
          name: 'state / compare',
          type: 'AIResultState / boolean',
          default: "'idle' / true",
          description: '生成阶段与是否展示原文。',
        },
        {
          name: 'disabled / readOnly / maxLength',
          type: 'boolean / boolean / number',
          description: '编辑与动作边界；maxLength 为非负整数，超长的受控草稿也禁止应用。',
        },
        {
          name: 'onApply / onAppend',
          type: '(value: string) => void',
          description: '可选，只有提供对应回调时显示动作；保留原始空白和换行。',
        },
        {
          name: 'onDiscard / onRetry / onStop',
          type: '() => void',
          description: '可选，对应舍弃、失败重试、生成中停止；状态由宿主改变。',
        },
        { name: 'status / error', type: 'ReactNode', description: '状态与错误反馈；错误不执行清空或回滚。' },
      ],
    },
  ],
  a11y: [
    '原文为有名称的可聚焦文本区域，生成结果为关联可见标签的 textarea；中性焦点环只覆盖编辑区。',
    '生成阶段使用 aria-busy、只读草稿和停止按钮；错误通过 alert 关联到结果输入。',
    '所有操作为按钮，不提交外部表单；原文、结果和参考内容不解析不可信 HTML。',
  ],
};
