import type { ComponentDoc } from '../../blocks/types';
import { AdminShellDemo } from './AdminShellDemo';
import source from './AdminShellDemo.tsx?raw';

export const adminShellDoc: ComponentDoc = {
  name: { 'zh-CN': '管理后台外框', 'en-US': 'Admin shell' },
  summary: {
    'zh-CN': '左侧应用菜单 + 顶栏 + 页面页签 + 内容区的后台布局，与桌面模式共用同一批应用和窗口状态。',
    'en-US': 'Admin layout with sidebar app menu, header, page tabs, and content area, sharing apps and window state with the desktop mode.',
  },
  usage: [
    'AdminLayout 铺满所在的定位容器；sidebar 放 AdminSidebar，header 依次放 AdminHeader 与 PageTabs，children 是当前页面或空状态。',
    'AdminSidebar 的 collapsed 由调用方保存；actions 可在侧栏品牌栏放置折叠控制，建议用 Tooltip 提示操作，并使用 panel-left-close / panel-left-open 图标表达状态。收起后保留品牌区首个子元素；鼠标移入 Logo 时展开图标覆盖 Logo 显示，键盘聚焦按钮时也会显示。',
    'variant="list" 是应用图标与名称同行的列表；density="comfortable" 为 208px 宽、菜单项最小高度 36px，density="compact" 为 184px 宽、菜单项最小高度 34px，并收紧条目与分组间距。两种密度使用相同的彩色应用图标与选中样式。',
    'variant="rail" 是固定 76px 宽的图标栏，图标在上、名称在下，不提供折叠按钮；列表可收起为 56px。',
    'AdminHeader 是后台顶栏：title 放当前页名称，end 放模式切换、通知、主题和账号菜单等操作，children 放中间内容。',
    'AdminMenuItem 的 current 表示当前页，open 表示已打开但不在前台，badge 放未读数等角标。应用较多时用 AdminMenuGroup 分组。',
    'PageTabs 每个打开的页面一个页签；提供 onClose 后页签可关闭（closable: false 的固定页签除外），支持中键与 Delete 关闭。',
    '页签右键菜单按提供的回调显示：onRefresh（刷新）、onClose（关闭）、onCloseOthers（关闭其他）、onCloseAll（关闭所有）；固定页签不可关闭，没有可关闭的目标时对应项禁用。关闭其他 / 关闭所有只给出意图，实际关闭哪些页签、遇到未保存内容是否取消由调用方决定。',
    '提供 onReorder 后页签可拖拽排序（拖到目标页签的左半或右半，出现强调色插入线），也可用 Ctrl + Shift + ← / → 移动当前页签；页签顺序由调用方保存。',
    '桌面壳的后台侧栏菜单项由外壳接管排序：菜单项提供 data-dragging 与 data-drop（before / after）状态样式，插入线与页签栏一致，键盘排序快捷键由调用方约定。',
    '桌面壳中把 Window 设为 embedded，即可让同一个窗口在桌面模式与后台模式间切换而不重新挂载内容；' +
      '位置由 --ds-window-embedded-inset 控制。',
    '宽度由 --ds-admin-sidebar-width / --ds-admin-sidebar-collapsed-width 调整，顶栏与页签栏高度由 --ds-admin-header-height / --ds-page-tabs-height 调整。',
  ],
  demos: [
    {
      title: '菜单、页签与内容区',
      description:
        '点击菜单打开页面，页签可切换、关闭、拖拽排序，右键页签可刷新、关闭、关闭其他、关闭所有（“文章”为固定页签）；展开时品牌栏按钮收起列表，收起后移入 Logo 显示展开图标；顶栏右侧按钮切换图标栏与列表形态，列表密度可独立切换。',
      layout: 'stack',
      code: source,
      render: () => <AdminShellDemo />,
    },
  ],
  api: [
    {
      component: 'AdminLayout',
      props: [
        { name: 'sidebar', type: 'ReactNode', description: '必填，左侧菜单。' },
        { name: 'header', type: 'ReactNode', description: '内容区顶部，通常是 AdminHeader 与 PageTabs。' },
      ],
    },
    {
      component: 'AdminHeader',
      props: [
        { name: 'title', type: 'ReactNode', description: '左侧标题，通常是当前页面名称。' },
        { name: 'start', type: 'ReactNode', description: '标题左侧的附加内容，例如返回按钮。' },
        { name: 'end', type: 'ReactNode', description: '右侧操作区。' },
        { name: 'children', type: 'ReactNode', description: '标题与操作区之间的内容。' },
      ],
    },
    {
      component: 'AdminSidebar',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          description: '顶部品牌区；list 收起时只保留首个子元素，鼠标移入时显示 actions 操作；rail 始终显示。',
        },
        {
          name: 'actions',
          type: 'ReactNode',
          description:
            '品牌栏内的附加操作，例如列表侧栏的收起 / 展开按钮；收起后操作叠在 Logo 上，鼠标移入或聚焦按钮时显示；rail 通常不传。',
        },
        {
          name: 'variant',
          type: "'list' | 'rail'",
          default: "'list'",
          description: 'rail 为图标在上、名称在下的图标栏。',
        },
        {
          name: 'density',
          type: "'comfortable' | 'compact'",
          default: "'comfortable'",
          description:
            'list 的密度；comfortable 为 208px / 36px 菜单项最小高度，compact 为 184px / 34px 并收紧条目间距。',
        },
        {
          name: 'collapsed',
          type: 'boolean',
          default: 'false',
          description: 'list 收起为 56px 窄栏；rail 忽略此值并保持固定宽度。',
        },
        { name: 'footer', type: 'ReactNode', description: '菜单下方显示的附加内容。' },
        { name: 'labels', type: "Partial<Pick<AdminSidebarLabels, 'navigation'>>", description: 'navigation。' },
      ],
    },
    {
      component: 'AdminMenuItem',
      props: [
        { name: 'label', type: 'string', description: '必填，菜单名称。' },
        { name: 'icon', type: 'ReactNode', description: '图标节点，通常是 AppIcon 或 Icon。' },
        { name: 'current', type: 'boolean', description: '当前页，输出 aria-current="page"。' },
        { name: 'open', type: 'boolean', description: '已打开但不是当前页，显示小圆点。' },
        { name: 'badge', type: 'ReactNode', description: '右侧角标；收起时浮在图标右上角。' },
      ],
    },
    {
      component: 'AdminMenuGroup',
      props: [{ name: 'label', type: 'string', description: '必填，分组名；收起时显示为分隔线。' }],
    },
    {
      component: 'PageTabs',
      props: [
        { name: 'items', type: 'readonly PageTab[]', description: '{ id, label, icon?, closable? }。' },
        { name: 'value', type: 'string', description: '当前页签 id；无匹配时全部未选中。' },
        { name: 'onChange', type: '(id: string) => void', description: '点击或方向键切换页签。' },
        { name: 'onClose', type: '(id: string) => void', description: '提供后显示关闭按钮。' },
        {
          name: 'onReorder',
          type: '(ids: string[]) => void',
          description: '提供后页签可拖拽或用 Ctrl + Shift + ←/→ 排序，参数是排序后的全部页签 id。',
        },
        { name: 'onRefresh', type: '(id: string) => void', description: '提供后右键菜单显示“刷新”。' },
        { name: 'onCloseOthers', type: '(id: string) => void', description: '提供后右键菜单显示“关闭其他”。' },
        { name: 'onCloseAll', type: '() => void', description: '提供后右键菜单显示“关闭所有”。' },
        { name: 'extra', type: 'ReactNode', description: '页签栏右侧的附加操作。' },
        { name: 'panelId', type: 'string', description: '内容区 id，写入当前页签的 aria-controls。' },
        {
          name: 'labels',
          type: 'Partial<PageTabsLabels>',
          description: 'label / close(label) / menu / refresh / closeTab / closeOthers / closeAll。',
        },
      ],
    },
  ],
  a11y: [
    '顶栏是 header 元素，操作按钮各自带可访问名称。',
    '菜单是具名 nav，当前项 aria-current="page"；侧栏操作由调用方提供可访问名称，折叠态悬停 Logo 显示展开操作，键盘聚焦按钮也可见并提示状态。',
    '页签使用 tablist / tab：方向键循环切换，Home / End 跳到首尾，Delete 关闭当前页签；关闭按钮不占 Tab 顺序。',
    '页签菜单可用右键、ContextMenu 键或 Shift + F10 打开（定位在页签下方），菜单是具名 menu，方向键选择、Esc 关闭；拖拽是鼠标专用，键盘用户用 Ctrl + Shift + ←/→ 排序。',
    '嵌入的 Window 是以标题命名的 region，不再声明 dialog。收起动画遵循 prefers-reduced-motion。',
  ],
};
