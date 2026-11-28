import { ClockCard, DesktopCard, Text } from '@xyzos/desk-ui';
import type { ComponentDoc, PropSpec } from '../../blocks/types';
import { DesktopCardDemo } from './DesktopCardDemo';
import cardSource from './DesktopCardDemo.tsx?raw';
import { DesktopNoteDemo } from './DesktopNoteDemo';
import noteSource from './DesktopNoteDemo.tsx?raw';
import { DesktopNoteGalleryDemo } from './DesktopNoteGalleryDemo';
import noteGallerySource from './DesktopNoteGalleryDemo.tsx?raw';
import { DesktopNoteAIDemo } from './DesktopNoteAIDemo';
import noteAISource from './DesktopNoteAIDemo.tsx?raw';
import { ClockCardDemo } from './ClockCardDemo';
import clockSource from './ClockCardDemo.tsx?raw';
import { DesktopCardMotionDemo } from './DesktopCardMotionDemo';
import motionSource from './DesktopCardMotionDemo.tsx?raw';
import { DesktopCardStyleDemo } from './DesktopCardStyleDemo';
import styleSource from './DesktopCardStyleDemo.tsx?raw';
import { DesktopCardRailDemo } from './DesktopCardRailDemo';
import railSource from './DesktopCardRailDemo.tsx?raw';

export const desktopCardRailDoc: ComponentDoc = {
  name: { 'zh-CN': '桌面卡片分栏', 'en-US': 'Desktop card rail' },
  summary: {
    'zh-CN': '沿原站按实际高度分列；导航窄屏切换底部横向卡片轨道，并保留编辑与 iframe 状态。',
    'en-US': 'Columns cards by actual height like the original site; switches to a horizontal card rail at the bottom on narrow screens while preserving edit and iframe state.',
  },
  usage: [
    '父容器需要明确高度和定位上下文。卡片按 items 顺序从右向左分列，默认宽 300px，父容器不超过 560px 时宽 240px。',
    '默认给主工作区保留 120px，达到宽度预算后继续放入最后一列，溢出的列支持独立纵向滚动。',
    'navigationMode 沿原站断点调整卡片宽度；可用空间不超过 960px 时切为底部横向滚动轨道，并通过 onOccupiedHeightChange 回报内容占位。',
    '项目 id 必须唯一且稳定。换列和顺序调整使用稳定 portal 容器，支持 moveBefore 的浏览器保留 iframe 页面与焦点。旧浏览器回退插入节点，可能重新加载 iframe。',
    '支持首次就传入非空列表；移除一项只卸载该项，其他卡片保留节点。示例可隐藏首张卡片后继续编辑其余草稿，再恢复该卡片。',
    '数据读取、授权、锁屏清理、拖动排序与偏好保存由宿主处理，组件只提供布局和实际占位宽度回调。',
  ],
  demos: [
    { title: '自动分列、导航横栏与保留草稿', layout: 'stage', code: railSource, render: () => <DesktopCardRailDemo /> },
  ],
  api: [
    {
      component: 'DesktopCardRail',
      props: [
        {
          name: 'items',
          type: 'readonly DesktopCardRailItem[]',
          description: '稳定且唯一的 id 与 content，按顺序从右向左布局。',
        },
        { name: 'header', type: 'ReactNode', description: '卡片栏操作区，可组合 DesktopCardToolbar。' },
        {
          name: 'minimumWorkspace',
          type: 'number',
          default: '120',
          description: '计算最多列数时为主工作区保留的宽度。',
        },
        {
          name: 'navigationMode',
          type: 'boolean',
          default: 'false',
          description: '沿原站导航响应式布局：宽屏右侧分栏，窄屏改为底部横向轨道。',
        },
        {
          name: 'onOccupiedWidthChange',
          type: '(width: number) => void',
          description: '报告卡片及右侧留白、列间距的实际占位，隐藏时为 0。',
        },
        {
          name: 'onOccupiedHeightChange',
          type: '(height: number) => void',
          description: '导航横向轨道报告底部实际占位；其他布局或隐藏时为 0。',
        },
        {
          name: 'hidden / labels / …div 属性',
          type: '原生属性 / { list?: string; column?: (index: number) => string }',
          description: '隐藏保留卡片节点；卡片列表和列名称也可通过 ConfigProvider 配置。',
        },
      ],
    },
  ],
  a11y: [
    '溢出列或窄屏横向轨道可通过 Tab 聚焦并用键盘滚动。',
    '卡片的 DOM 阅读顺序按 items 顺序排列；分栏模式从右向左、每列从上到下。',
    '重排后保留卡片组件状态，提供原生 focus-visible 提示，卡片内部交互由各组件负责。',
  ],
};

const cardProps: PropSpec[] = [
  {
    name: 'dragHandle',
    type: 'ReactNode',
    description: '标题栏独立拖动按钮插槽；WidgetLayout 复用，不把整个标题设为按钮。',
  },
  {
    name: 'onHeaderDrag',
    type: '(gesture: DesktopCardDrag) => void',
    description: '标题或空白处按住移动超过 4px 后回调 move，松开回调 drop，取消回调 cancel。位置由宿主计算。',
  },
  {
    name: 'title / icon / meta',
    type: 'ReactNode / IconName / ReactNode',
    description: 'title 必填，标题、图标和头部附加数据。',
  },
  {
    name: 'image',
    type: 'string',
    description: '真实图标资源；存在时优先于 icon，用于扩展应用等卡片。',
  },
  {
    name: 'actions',
    type: 'readonly DesktopCardAction[]',
    description: '{ id, label, icon, disabled?, onClick }，操作为不提交表单的原生按钮。',
  },
  {
    name: 'collapsed / defaultCollapsed / onCollapsedChange',
    type: 'boolean / boolean / (value: boolean) => void',
    default: '未提供 / false',
    description: '受控 / 非受控折叠，正文节点保留，不清空草稿。',
  },
  {
    name: 'collapsible / labels / summary',
    type: 'boolean / Partial<DesktopCardLabels> / ReactNode',
    default: 'true / 中文',
    description: '折叠入口、{ collapse, expand } 和折叠摘要。',
  },
  {
    name: 'bodyProps',
    type: "ComponentProps<'div'>",
    description: '正文滚动容器属性；便签默认复用公共隐藏滚动条样式。',
  },
  { name: 'footer / children', type: 'ReactNode', description: '附加操作 / 状态与主体内容。' },
  {
    name: 'cardStyle',
    type: "'frosted' | 'liquid'",
    default: '继承 Desktop（frosted）',
    description: '单独指定卡片玻璃风格：毛玻璃或液态玻璃；variant="solid" 与纸张便签保持不透明底板。',
  },
  {
    name: 'variant',
    type: "'glass' | 'solid'",
    default: "'glass'",
    description: '桌面主题半透明底板或不透明应用面板。',
  },
  {
    name: 'headerProps / …article 属性',
    type: '原生属性',
    description: '宿主可设置标题栏焦点及键盘移动。内置拖动会避开按钮和编辑控件。',
  },
];
const hostBoundary =
  '独立迁移站与这些示例共用组件。宿主负责账号权限、卡片位置和顺序、恢复与保存，锁屏或退出时清理私有内容和异步回调。';

export const desktopCardDoc: ComponentDoc = {
  name: { 'zh-CN': '桌面卡片', 'en-US': 'Desktop card' },
  summary: {
    'zh-CN': '时钟、待办与扩展应用共用的桌面卡片壳，统一标题、动作、折叠和底栏。',
    'en-US': 'Shared desktop card shell for clocks, todos, and extension apps, unifying title, actions, collapse, and footer.',
  },
  usage: [
    '沿用原系统 18px 圆角、14px 内边距、半透明底板与中性边框；默认为常规毛玻璃（frosted），设置 cardStyle="liquid" 或外层 Desktop cardStyle="liquid" 时切换为高透液态玻璃折射滤镜、纤细斜向菲涅耳高光环与柔和内发光。',
    '标题与操作布局一致，主体通过 children 组合已有 List、Checkbox、Progress 等；独立迁移站已取消备忘录，原站来源仍用于说明组件设计。',
    '折叠使用 hidden 保留正文节点；variant="solid" 可嵌入普通应用。宽度与桌面位置交给外层布局，不自动抢占整张桌面。',
    hostBoundary,
  ],
  demos: [
    { title: '直接拖动标题栏', layout: 'stage', code: motionSource, render: () => <DesktopCardMotionDemo /> },
    { title: '待办卡片与折叠', layout: 'stage', code: cardSource, render: () => <DesktopCardDemo /> },
    { title: '毛玻璃与液态玻璃切换', layout: 'stage', code: styleSource, render: () => <DesktopCardStyleDemo /> },
    {
      title: '应用中的不透明卡片',
      layout: 'stack',
      code: `<DesktopCard title="工作记录" icon="file-text" variant="solid" summary="共两项记录"><Text>准备周报与下周计划。</Text></DesktopCard>`,
      render: () => (
        <DesktopCard title="工作记录" icon="file-text" variant="solid" summary="共两项记录">
          <Text>准备周报与下周计划。</Text>
        </DesktopCard>
      ),
    },
  ],
  api: [
    { component: 'DesktopCard', props: cardProps },
    {
      component: 'DesktopCardToolbar',
      props: [
        {
          name: 'title / children',
          type: 'string / ReactNode',
          description: '卡片栏名称及折叠、收起等操作，动作由宿主管理。',
        },
        {
          name: 'cardStyle',
          type: "'frosted' | 'liquid'",
          default: '继承 Desktop（frosted）',
          description: '工具条玻璃风格，未传时继承外层 Desktop 的 cardStyle。',
        },
      ],
    },
  ],
  a11y: [
    '卡片使用 article 并关联 h3 标题；折叠按钮带 aria-expanded / aria-controls，所有图标操作有名称。',
    '标题栏聚焦后，Escape 可取消当前拖动。宿主可用 headerProps 提供键盘移动和位置播报。',
    '深浅主题及强制颜色保留边框回退。',
  ],
};

export const desktopNoteDoc: ComponentDoc = {
  name: { 'zh-CN': '桌面便签', 'en-US': 'Desktop note' },
  summary: {
    'zh-CN': '复用桌面卡片的便签视图，支持纯文本草稿、五种纸张色、折叠及卡片形态切换。',
    'en-US': 'Note view reusing the desktop card shell, with plain-text drafts, five paper colors, collapse, and card form switching.',
  },
  usage: [
    'value / defaultValue 与 onValueChange 管理纯文本草稿；颜色、折叠可分别受控。组件不执行自动保存、不请求 AI，也不读取其他便签。',
    'placement="note" 展示原系统五色纸张；placement="card" 使用卡片栏玻璃底板，切换保留同一输入节点与纸张选择。',
    '标题编辑由宿主组合 Input；leadingTools 将添加图片放在色卡左侧，tools 放在右侧。图库使用独立 AnchorPopover，不放入 children 撑开正文；已选图片网格仍由 children 承载。',
    '自由便签沿原站 42px 标题栏、72px 起始正文与 460px 总高度；正文溢出滚动、底栏保留。输入框不再触发整张便签描边。支持 field-sizing 时随文字增高，默认上限 4000 字。',
    hostBoundary,
    'AI 入口由宿主通过 tools 组合，inputProps.ref 读取选区。迁移站使用原站独立文本接口，只发送选区或正文，不发送标题与图片；结果、撤销和自动保存仍由宿主处理。下方 AI 示例只使用本地固定结果。',
  ],
  demos: [
    {
      title: '拖动、切换外观与折叠摘要',
      layout: 'stage',
      code: motionSource,
      render: () => <DesktopCardMotionDemo note />,
    },
    { title: '纸张、卡片形态与失败保留', layout: 'stage', code: noteSource, render: () => <DesktopNoteDemo /> },
    {
      title: '原站底栏与独立图库浮层',
      layout: 'stage',
      code: noteGallerySource,
      render: () => <DesktopNoteGalleryDemo />,
    },
    {
      title: 'AI 结果应用与撤销（本地模拟）',
      layout: 'stage',
      code: noteAISource,
      render: () => <DesktopNoteAIDemo />,
    },
  ],
  api: [
    {
      component: 'DesktopNote',
      props: [
        ...cardProps.filter(
          (item) => !['footer / children', 'variant', 'collapsible / labels / summary'].includes(item.name),
        ),
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value: string) => void',
          default: "''",
          description: '正文草稿，真实 input 变化才回调；非受控原生表单 reset 恢复初始草稿并回调。',
        },
        {
          name: 'color / defaultColor / onColorChange',
          type: 'DesktopNoteColor / DesktopNoteColor / (color) => void',
          default: "未提供 / 'yellow'",
          description: 'yellow、blue、green、pink、white；切换样式不写业务数据。',
        },
        {
          name: 'placement / readOnly / disabled / maxLength',
          type: "'note' | 'card' / boolean / boolean / number",
          default: "'note' / false / false / 4000",
          description: '摆放外观、编辑边界和最大输入长度。',
        },
        {
          name: 'imageCount',
          type: 'number',
          default: '0',
          description: '折叠摘要显示图片数量。图片由宿主通过内容插槽渲染。',
        },
        {
          name: 'labels / collapsible',
          type: 'LabelOverrides<DesktopNoteLabels> / boolean',
          default: '中文 / true',
          description: '折叠、展开、输入、颜色、占位及 images(count) 文案。',
        },
        {
          name: 'children / leadingTools / tools / status / error / inputProps',
          type: 'ReactNode / ReactNode / ReactNode / ReactNode / ReactNode / textarea 属性',
          description:
            '附加图片内容、色卡前的附件操作、右侧操作、保存状态 / 错误、原生 name / form / ref 等；宿主管理请求与重试。',
        },
      ],
    },
  ],
  a11y: [
    '纯文本经原生 textarea 编辑，标签、错误和状态关联；保留输入法及原生撤销。',
    '颜色按钮带名称和 aria-pressed，勾选标记区分选中，不只靠色彩。',
    '正文提供中性键盘焦点提示，整张便签不因输入而描边；失败与折叠不清空草稿。',
  ],
};

export const clockCardDoc: ComponentDoc = {
  name: { 'zh-CN': '时钟卡片', 'en-US': 'Clock card' },
  summary: {
    'zh-CN': '世界时钟的数字、表盘与日期展示，使用公共卡片壳和明确时区。',
    'en-US': 'World clock display with digits, dial, and date, using the shared card shell and explicit time zones.',
  },
  usage: [
    '独立桌面从现有世界时钟配置读取可见时区，复用卡片标题栏拖动、排序和折叠。clockZoneInfo 按传入的界面语言给出时区名称（缺省中文），并给出随夏令时变化的 UTC 偏移。',
    'now 必须由宿主注入 Date 或毫秒时间戳；组件不创建定时器。示例的秒级更新由示例自身管理，隐藏文档时暂停取新值，卸载清理计时器。',
    'timeZone 使用 IANA 时区名，Intl 负责夏令时；不根据时区名称手算小时偏移。无效日期、语言或时区显示 invalidLabel，不悄悄退回设备时区。',
    'analog 和 showSeconds 控制表盘及秒；折叠显示简短时间与日期，不自动播报每一秒。',
    hostBoundary,
  ],
  demos: [
    { title: '世界时钟与时区切换', layout: 'stage', code: clockSource, render: () => <ClockCardDemo /> },
    {
      title: '无法解析的时刻',
      layout: 'stack',
      code: `<ClockCard title="时钟" now={NaN} variant="solid" invalidLabel="时间不可用" />`,
      render: () => <ClockCard title="时钟" now={NaN} variant="solid" invalidLabel="时间不可用" />,
    },
  ],
  api: [
    {
      component: 'ClockCard',
      props: [
        ...cardProps.filter(
          (item) => !['footer / children', 'collapsible / labels / summary', 'title / icon / meta'].includes(item.name),
        ),
        {
          name: 'title / now',
          type: 'ReactNode / Date | number',
          description: '必填，标题和当前时刻；number 为毫秒时间戳。',
        },
        {
          name: 'timeZone / locale',
          type: 'string',
          default: 'Asia/Shanghai / zh-CN',
          description: 'IANA 时区和 Intl 语言，不改变传入的 Date。',
        },
        {
          name: 'showSeconds / analog / invalidLabel',
          type: 'boolean / boolean / string',
          default: 'true / true / 时间不可用',
          description: '秒、表盘与无效输入提示。',
        },
        { name: 'compact', type: 'boolean', description: '用于设置页中的小尺寸桌面预览。' },
        {
          name: 'labels / collapsible / footer',
          type: 'Partial<DesktopCardLabels> / boolean / ReactNode',
          description: '共享卡片的折叠名称、折叠开关和附加底部内容。',
        },
      ],
    },
  ],
  a11y: [
    '可读数字时间使用 time 和完整 ISO 时刻，表盘仅作装饰。',
    '没有逐秒 live 区域，避免持续打断；宿主按可见性控制频率并在锁屏时清理。',
  ],
};
