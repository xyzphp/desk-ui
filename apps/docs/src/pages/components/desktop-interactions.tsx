import type { ComponentDoc, PropSpec } from '../../blocks/types';
import { SelectionAreaDemo } from './SelectionAreaDemo';
import { DesktopIconGridDemo } from './DesktopIconGridDemo';
import { WidgetLayoutDemo } from './WidgetLayoutDemo';
import { DockWorkspaceDemo } from './DockWorkspaceDemo';
import selectionSource from './SelectionAreaDemo.tsx?raw';
import iconSource from './DesktopIconGridDemo.tsx?raw';
import widgetSource from './WidgetLayoutDemo.tsx?raw';
import dockSource from './DockWorkspaceDemo.tsx?raw';

const layoutProps: PropSpec[] = [
  {
    name: 'layout / defaultLayout / onLayoutChange',
    type: 'readonly GridPlacement[] / … / (layout) => void',
    description: '受控或非受控位置；只在提交移动或层级变化时回调。',
  },
  {
    name: 'GridPlacement',
    type: '{ id, column, row, width?, height?, zIndex? }',
    description: '零起始列、行、跨度及层级；稳定 id。无效值按网格范围归一化。',
  },
  {
    name: 'disabled / labels',
    type: 'boolean / Partial<GridLayoutLabels>',
    description: '禁用布局操作与统一默认文案覆盖；不禁用宿主提供的业务内容。',
  },
];
const gridA11y = [
  '聚焦拖动入口后按 Alt 加方向键移动，Esc、失焦和 pointercancel 取消且不提交。',
  '松手才提交位置；布局或目录快照变化会取消旧手势，位置结果通过 status 播报。',
];

export const selectionAreaDoc: ComponentDoc = {
  name: { 'zh-CN': '框选区域', 'en-US': 'Selection area' },
  summary: {
    'zh-CN': '通过空白区域拖动选择已登记节点，提供追加选择与键盘全选。',
    'en-US': 'Selects registered nodes by dragging from empty areas, with additive selection and keyboard select-all.',
  },
  usage: [
    '在可选择元素上标记 data-selection-id，value / onValueChange 维护稳定 id 集合。',
    '框选框沿用原站的半透明强调色底和细边框，框内的图标与壁纸保持可见。',
    'children 可以是接收预览选择的函数，预览不等于提交；指针结束只回调一次，取消不改变宿主选择。',
    'Ctrl、Command 或 Shift 追加选择；禁用项与当前区域以外的已选 id 保留。内部按钮、输入、链接不启动框选。',
    '嵌套区域只管理自身登记节点；宿主在退出、锁屏或目录变化时卸载区域，不持久化私有选择内容。',
  ],
  demos: [{ title: '框选与追加选择', layout: 'stack', code: selectionSource, render: () => <SelectionAreaDemo /> }],
  api: [
    {
      component: 'SelectionArea',
      props: [
        {
          name: 'label / children',
          type: 'string / ReactNode | ((previewIds) => ReactNode)',
          description: '具名区域和内容，函数子节点用于显示草稿选中态。',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'readonly string[] / … / (ids: string[]) => void',
          description: '受控或非受控选择，回调仅提交有效变化。',
        },
        {
          name: 'disabled / disabledIds',
          type: 'boolean / readonly string[]',
          description: '整体禁用或排除的节点；也识别 data-selection-disabled="true"。',
        },
        {
          name: 'labels / …div 属性',
          type: 'Partial<SelectionAreaLabels> / ComponentProps<div>',
          description: '文案与原生属性；布局由宿主内容决定。',
        },
      ],
    },
  ],
  a11y: [
    '区域是可聚焦 group，Ctrl / Command 加 A 全选区域内可选节点，Esc 取消框选；不拦截输入控件的文本全选。',
    '子节点仍须提供各自的键盘选择入口。框选框对辅助技术隐藏，选中数量通过 status 播报。',
  ],
};

export const desktopIconGridDoc: ComponentDoc = {
  name: { 'zh-CN': '桌面图标网格', 'en-US': 'Desktop icon grid' },
  summary: {
    'zh-CN': '应用图标的自动排列、网格对齐、自由摆放、框选和成组拖动。',
    'en-US': 'Auto arrangement, grid alignment, free placement, rubber-band selection, and group dragging for app icons.',
  },
  usage: [
    '图形、亮度、图标大小和笔画沿用 AppIcon 的 app 属性，选中态沿用公共桌面图标。',
    '按住图标直接拖动。网格对齐按原站的图标占位加 14px 排列；自由摆放沿用原站的 8px 微步，不吸附整格。',
    '按住任一已选图标可拖动整组。非自动排列时保留组内间距，禁用图标不参与拖动。按住 Ctrl / Command / Shift 可将起拖图标一并带入。',
    '开启 autoArrange 后图标按列紧凑排列，拖动单个或选中组会在落点插入并重排；Alt + 方向键可调整单个图标的顺序。',
    '非自动排列时松手整组避让边界和占用位置；自动排列时按落点插入顺序。布局变化只回调一次，取消保留原位。',
    '选中以半透明底色和加粗名称表示。悬停和拖动均使用普通箭头；拖动时隐藏选中底色与焦点提示，不绘制落点框。',
    '文档站桌面右键打开「查看 → 与网格对齐」。两种模式使用同一份位置；切换只换算显示，不提交位置。',
    '网格间距固定，列数跟随容器宽度。缺失位置按列向下排列；空间不足时可增加 rows，宿主目录不丢失。',
    '全屏桌面可将滚动容器的 ref、图标数和图形尺寸传给 useDesktopIconViewport，再把返回的行、列和高度传给网格。',
    '单击选择，Ctrl / Command / Shift 切换追加；双击或 Enter 请求打开，空格选择，背景拖动框选。',
    '库不读写存储。宿主将 layout / selectedIds 纳入账号隔离的工作区恢复，并在 onOpen 内验证授权。',
  ],
  demos: [
    {
      title: '图标排列与成组拖动',
      description: '拖动已选中的备忘录或文件，试试整组避开设置图标。也可以在空白处框选后再拖。',
      layout: 'stack',
      code: iconSource,
      render: () => <DesktopIconGridDemo />,
    },
  ],
  api: [
    {
      component: 'DesktopIconGrid',
      props: [
        {
          name: 'label / items',
          type: 'string / readonly DesktopIconGridItem[]',
          description: '区域名称；条目含 id、label、AppIconAppearance 类型 app 和 disabled。',
        },
        ...layoutProps,
        {
          name: 'autoArrange',
          type: 'boolean',
          default: 'false',
          description: '自动按列排列，拖动或键盘移动会重排；宿主保存 onLayoutChange 返回的完整顺序。',
        },
        {
          name: 'placementMode',
          type: "'grid' | 'free'",
          default: 'grid',
          description: '网格对齐或 8px 微步摆放；自由摆放回调的 column / row 可以是小数，宿主保存时保留精度。',
        },
        {
          name: 'columns / rows / rowHeight',
          type: 'number',
          default: '随容器 / 8 / 图标占位高度 + 14px',
          description: 'columns 限制最多可用列（1–128）；rows 为行数（1–1000）；可显式指定纵向格距。',
        },
        {
          name: 'minCanvasHeight',
          type: 'number',
          description: '宿主可传入可用高度，补足最后一行下方的空间；最多补不到一个格距，不增加网格行数。',
        },
        {
          name: 'selectedIds / defaultSelectedIds / onSelectionChange',
          type: 'readonly string[] / … / (ids) => void',
          description: '受控或非受控多选集合。',
        },
        {
          name: 'onOpen / …section 属性',
          type: '(item) => void / ComponentProps<section>',
          description: '打开请求与容器属性；组件不启动实际应用。',
        },
        {
          name: 'onItemContextMenu',
          type: '(item, point: { x: number; y: number }) => void',
          description: '图标右键菜单请求。鼠标使用指针坐标，键盘使用图标右上角坐标。菜单内容由宿主决定。',
        },
      ],
    },
  ],
  a11y: [...gridA11y, 'Alt + 方向键移动聚焦图标。菜单键或 Shift + F10 打开已配置的图标菜单。禁用图标不参与打开、框选或移动。'],
};

export const widgetLayoutDoc: ComponentDoc = {
  name: { 'zh-CN': '小组件布局', 'en-US': 'Widget layout' },
  summary: {
    'zh-CN': '桌面卡片的网格位置、拖动和层级管理，保留内部编辑状态。',
    'en-US': 'Grid positions, dragging, and z-order management for desktop cards while preserving internal edit state.',
  },
  usage: [
    '每项通过 content 注入内容，卡片壳和标题操作复用 DesktopCard，不另建外观。',
    'width / height 指定网格跨度，允许卡片重叠，通过“移到最前”调整 zIndex。',
    '位置更新保留同 id 的内容节点，输入、滚动与业务按钮不会启动拖动；组件不添加全局快捷键。',
    '宿主保存位置、层级和业务草稿，锁屏 / 退出时清理敏感内容；本组件不写浏览器存储。',
  ],
  demos: [{ title: '卡片定位、层级与草稿', layout: 'stage', code: widgetSource, render: () => <WidgetLayoutDemo /> }],
  api: [
    {
      component: 'WidgetLayout',
      props: [
        {
          name: 'label / items',
          type: 'string / readonly WidgetLayoutItem[]',
          description: '条目含 id、title、icon、content、actions 与 disabled。',
        },
        ...layoutProps,
        {
          name: 'columns / rows / rowHeight',
          type: 'number',
          default: '6 / 8 / 112',
          description: '列 1–12，行 1–1000，行高 80–400px；列宽随容器变化。',
        },
        {
          name: '…section 属性',
          type: 'ComponentProps<section>',
          description: 'className、style 和原生事件。内容高度超出卡片时在卡片内滚动。',
        },
      ],
    },
  ],
  a11y: [...gridA11y, '拖动手柄与标题动作均为原生按钮，不把含输入控件的卡片标题设为交互角色。'],
};

export const dockWorkspaceDoc: ComponentDoc = {
  name: { 'zh-CN': '应用栏工作区', 'en-US': 'Dock workspace' },
  summary: { 'zh-CN': '程序坞与任务栏共用的窗口预览、激活和应用顺序调整。', 'en-US': 'Window previews, activation, and app order adjustments shared by the dock and taskbar.' },
  usage: [
    '外观由 Desktop 的 dockStyle 决定，沿用 AppIcon 图形。没有窗口时回调 onLaunch，有窗口时打开锚点预览。',
    '预览直接复用 WindowSwitcher；宿主提供已授权快照，并在激活回调中恢复、置顶或切换实际窗口。',
    '右侧手柄打开就地排序区，复用 SortableList 的拖动、触摸和键盘排序；完成按钮收起，不再创建一套排序行为；当外层 Desktop 设 cardStyle="liquid" 时，排序面板与排序项同步继承液态玻璃表面样式。',
    'order 可受控保存，目录外的未知 id 在排序回调中保留；禁用条目固定。隐藏或禁用时不显示预览。',
    '不查询真实窗口、不抓屏、不启动应用或持久化；宿主负责权限、账号隔离与锁屏清理。',
  ],
  demos: [
    { title: 'macOS 程序坞', layout: 'stage', code: dockSource, render: () => <DockWorkspaceDemo /> },
    {
      title: 'Windows 任务栏',
      layout: 'stage',
      stage: { dockStyle: 'windows', windowPlatform: 'windows' },
      code: dockSource,
      render: () => <DockWorkspaceDemo />,
    },
  ],
  api: [
    {
      component: 'DockWorkspace',
      props: [
        {
          name: 'label / items',
          type: 'string / readonly DockWorkspaceItem[]',
          description: '条目含 id、label、app、windows、running、disabled。',
        },
        {
          name: 'order / defaultOrder / onOrderChange',
          type: 'readonly string[] / … / (ids) => void',
          description: '应用 id 顺序；窗口顺序由各 windows 数组决定。',
        },
        {
          name: 'onLaunch / onActivateWindow',
          type: '(app) => void / (window, app) => void',
          description: '宿主执行启动、恢复与激活。',
        },
        {
          name: 'currentWindowId / disabled / hidden',
          type: 'string / boolean / boolean',
          description: '当前窗口、禁用操作、隐藏整个应用栏工作区。',
        },
        {
          name: 'labels / …section 属性',
          type: 'Partial<DockWorkspaceLabels> / ComponentProps<section>',
          description: '默认文案和容器属性。',
        },
      ],
    },
  ],
  a11y: [
    '应用具名并支持 Enter / Space；预览有 dialog 名称，沿用公共锚点层的焦点进入、Esc 关闭及焦点返回。',
    '窗口预览不可交互，激活按钮支持方向键和 Home / End；排序区保留 SortableList 的键盘手柄和位置播报。',
  ],
};
