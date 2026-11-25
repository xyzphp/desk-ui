import type { ComponentDoc } from '../../blocks/types';
import { SortableListDemo } from './SortableListDemo';
import source from './SortableListDemo.tsx?raw';

export const sortableListDoc: ComponentDoc = {
  name: { 'zh-CN': '排序列表', 'en-US': 'Sortable list' },
  summary: {
    'zh-CN': '复用原系统的移除后插入、拖动快照与键盘重排，提供可访问的受控列表排序。',
    'en-US': 'Reuses the original remove-and-insert, drag snapshot, and keyboard reordering to provide an accessible controlled list sort.',
  },
  usage: [
    'items 的 id 在列表内唯一、稳定，onOrderChange 只给出新 ID 顺序；宿主响应更新 items，并负责权限、保存和修订冲突。',
    '默认由手柄开始拖动，也可用移动按钮或 Alt + 方向键。dragMode="row" 不显示手柄；默认长按开始拖动，也可设 rowDragActivation="movement"，按下并移动后直接拖动。',
    '行拖动只接受鼠标 / 笔；movement 模式使用原生拖动预览，条目会跟随指针移动，普通点击不会开始排序。触屏 / 笔的手柄模式沿用指针捕获。投放位置按条目前半 / 后半判断，只允许当前实例内排序。',
    '没有浏览器拖动图像的指针拖动（触屏手柄、长按整行）由 createDragGhost 生成跟随指针的影子，挂在列表内、不参与命中测试；拖动中的原位条目带 is-drag-source 并淡化到 --ds-drag-source-opacity，键盘选取只显示选中态。其他宿主的指针拖动可直接复用 createDragGhost；HTML5 拖拽需要同款样式时用 setDragGhostImage。',
    '禁用项固定且形成边界，可移动项不能跨越；readOnly 隐藏操作，disabled 保留禁用操作。',
    '拖动期间数据顺序、禁用集合或整体状态变化会取消；Esc / pointercancel 取消，行模式下可聚焦条目后按空格、方向键与回车排序。',
    'renderItem 可组合业务内容，手柄和移动按钮可分别配置；不把交互按钮嵌在另一个按钮内。',
    '桌面导航的常用收藏复用整行模式和横向排序。卡片、图标、纯标题的业务底板由导航页面维护；显示设置独立于列表，排序指引通过 aria-describedby 提供，不作为可见说明占据列表布局。',
    'trailing 提供列表末尾的新增入口等操作，随列表排布，但不参与排序、固定项边界或顺序回调。',
  ],
  demos: [{ title: '拖动、键盘与固定条目', layout: 'stack', code: source, render: () => <SortableListDemo /> }],
  api: [
    {
      component: 'SortableList',
      props: [
        {
          name: 'label / items',
          type: 'string / readonly SortableListItem[]',
          description: '列表名称与 id、label、description、icon、disabled。',
        },
        {
          name: 'onOrderChange',
          type: '(ids: readonly string[]) => void',
          description: '必填，返回完整顺序，无变化或越过固定项时不回调。',
        },
        {
          name: 'orientation',
          type: 'vertical | horizontal',
          default: 'vertical',
          description: '决定投放方向和键盘方向；横向列表可换行。',
        },
        {
          name: 'dragMode',
          type: 'handle | row',
          default: 'handle',
          description: 'row 模式整行可拖动，并提供可聚焦的键盘排序项。',
        },
        {
          name: 'rowDragActivation',
          type: 'long-press | movement',
          default: 'long-press',
          description:
            'row 模式的鼠标 / 笔启动方式；movement 按下后移动即可开始并显示跟随指针的预览，长按模式保持原行为。',
        },
        { name: 'showMoveButtons', type: 'boolean', default: 'true', description: '是否显示前移 / 后移按钮。' },
        { name: 'disabled / readOnly', type: 'boolean', default: 'false', description: '禁用或只读，阻止所有修改。' },
        {
          name: 'renderItem',
          type: '(item: SortableListItem) => ReactNode',
          description: '自定义条目正文，排序入口与按钮由组件选项控制。',
        },
        { name: 'trailing', type: 'ReactNode', description: '放在列表末尾的操作区，内容由宿主提供，不参与排序。' },
        {
          name: 'labels',
          type: 'Partial<SortableListLabels>',
          description: '操作名称、两种模式的指引、空态、目标位置与提交反馈，读取 ConfigProvider。',
        },
        { name: '…ul 属性', type: 'ComponentProps<ul>', description: 'className、style、ref 与原生事件作用于列表。' },
      ],
    },
  ],
  a11y: [
    '保持 ul / li 语义，不伪装为需要单选的 listbox；操作按钮均有独立名称。',
    'Alt 加方向键可直接移动；手柄模式使用手柄键盘排序，row 模式聚焦条目后用空格选取、方向键调整、回车提交，Esc 取消。movement 模式保留单击行为，拖动预览跟随指针。',
    '目标位置、完成与取消通过礼貌状态区宣布，提交后焦点返回对应手柄或条目；移出列表取消键盘选取。',
  ],
};
