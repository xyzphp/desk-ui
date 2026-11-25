import type { DateTimePickerLabels } from '../primitives/DateTimePanel';
import type { DesktopNoteLabels } from '../shell/DesktopCard';
import type { WallpaperName } from '../shell/Desktop';
import type { ChipLabels } from '../primitives/Chip';
import type { TagInputLabels } from '../primitives/tagInputModel';
import type { ResizeHandleLabels } from '../layout/ResizeHandle';
import type { StatisticLabels } from '../layout/Statistic';
import type { BreadcrumbLabels } from '../layout/Breadcrumb';
import type { SearchSelectLabels } from '../primitives/Select';
import type { TreeLabels } from '../layout/Tree';
import type { PopconfirmLabels } from '../primitives/Popconfirm';
import type { CoachmarkLabels } from '../primitives/Coachmark';
import type { ImageCropperLabels } from '../domain/ImageCropper';
import type { MarkdownEditorLabels } from '../domain/markdownTypes';
import type { SortableListLabels } from '../layout/SortableList';
import type { ColorPickerLabels } from '../primitives/ColorPicker';
import type { AvatarGroupLabels } from '../primitives/AvatarGroup';
import type { ResultLabels } from '../primitives/Result';
import type { RatingLabels } from '../primitives/Rating';
import type { MonthCalendarLabels } from '../layout/MonthCalendar';
import type { LockScreenLabels } from '../shell/LockScreen';
import type { LockCountdownLabels } from '../shell/LockCountdown';
import type { CommandPaletteLabels } from '../shell/CommandPalette';
import type { LaunchpadLabels } from '../shell/Launchpad';
import type { NotificationCenterLabels } from '../shell/NotificationCenter';
import type { WindowSwitcherLabels } from '../shell/WindowSwitcher';
import type { SelectionAreaLabels } from '../shell/SelectionArea';
import type { GridLayoutLabels } from '../shell/useGridLayout';
import type { DockWorkspaceLabels } from '../shell/DockWorkspace';
import type { ChartLabels } from '../domain/Chart';
import type { FileCollectionLabels } from '../domain/FileCollection';

export interface CopyButtonLabels {
  copy: string;
  copying: string;
  copied: string;
  failed: string;
}
export interface InputNumberLabels {
  increase: string;
  decrease: string;
}
export interface RangeInputLabels {
  slider: string;
  value: string;
}
export interface PasswordInputLabels {
  show: string;
  hide: string;
}
export interface AdminSidebarLabels {
  navigation: string;
  collapse: string;
  expand: string;
  density: string;
  comfortable: string;
  compact: string;
}

export interface StartMenuLabels {
  button: string;
  search: string;
  pinned: string;
  all: string;
  results: string;
  empty: string;
}

export interface PageTabsLabels {
  label: string;
  close: (label: string) => string;
  /** 页签右键菜单的名称与菜单项。 */
  menu: string;
  refresh: string;
  closeTab: string;
  closeOthers: string;
  closeAll: string;
}

export interface LanguageSwitcherLabels {
  label: string;
  system: string;
  current: (name: string) => string;
  /** 只有两种语言时入口直接互切，名称说明点击后的目标语言。 */
  switchTo: (name: string) => string;
}

export interface MarkdownViewLabels {
  task: { done: string; pending: string };
  /** 图片没有替代文字时的称呼。 */
  image: string;
  /** 可视化编辑时图片块的可访问名称。 */
  imageHint: (alt: string) => string;
  resizeImage: string;
}

/** 原站结构（nativeStructure）下权限树自带的可访问名称。 */
export interface PermissionTreeNativeLabels {
  toggle: (open: boolean, label: string) => string;
  children: (label: string) => string;
  apiChildren: (label: string) => string;
}

export interface ComponentLabels {
  selectionArea: SelectionAreaLabels;
  gridLayout: GridLayoutLabels;
  dockWorkspace: DockWorkspaceLabels;
  chart: ChartLabels;
  lockScreen: LockScreenLabels;
  lockCountdown: LockCountdownLabels;
  commandPalette: CommandPaletteLabels;
  launchpad: LaunchpadLabels;
  notificationCenter: NotificationCenterLabels;
  windowSwitcher: WindowSwitcherLabels;
  rangeSlider: { lower: string; upper: string };
  rangeInput: RangeInputLabels;
  otpInput: { input: string };
  rating: RatingLabels;
  monthCalendar: MonthCalendarLabels;
  checkboxGroup: { required: string; empty: string };
  form: { actions: string };
  colorPicker: ColorPickerLabels;
  timeline: { empty: string };
  avatarGroup: AvatarGroupLabels;
  result: ResultLabels;
  loadingOverlay: { loading: string };
  imageCropper: ImageCropperLabels;
  markdownEditor: MarkdownEditorLabels;
  sortableList: SortableListLabels;
  chip: ChipLabels;
  tagInput: TagInputLabels;
  resizeHandle: ResizeHandleLabels;
  statistic: StatisticLabels;
  breadcrumb: BreadcrumbLabels;
  drawer: { close: string };
  select: { placeholder: string; empty: string };
  searchSelect: SearchSelectLabels;
  tree: TreeLabels;
  popconfirm: PopconfirmLabels;
  coachmark: CoachmarkLabels;
  inputNumber: InputNumberLabels;
  passwordInput: PasswordInputLabels;
  copyButton: CopyButtonLabels;
  codeBlock: { code: string };
  modal: { close: string };
  toast: { close: string; region: string };
  dateTimePicker: DateTimePickerLabels;
  rangePicker: { start: string; end: string; separator: string; invalidOrder: string };
  desktopCard: { collapse: string; expand: string };
  desktopCardRail: { list: string; column: (index: number) => string };
  desktopNote: DesktopNoteLabels;
  clockCard: { invalid: string };
  skeleton: { loading: string };
  menuBar: { clock: string };
  window: { close: string; minimize: string; maximize: string; restore: string; controls: string; resize: string };
  calendar: {
    previous: string;
    next: string;
    weekdays: readonly string[];
    title: (year: number, month: number) => string;
  };
  themePicker: { label: string; auto: string; light: string; dark: string };
  accentPicker: { label: string };
  wallpaperPicker: Record<WallpaperName, string> & {
    label: string;
    custom: string;
    addCustom: string;
    useCustom: string;
  };
  spinner: { loading: string };
  dock: { label: string };
  adminSidebar: AdminSidebarLabels;
  startMenu: StartMenuLabels;
  pageTabs: PageTabsLabels;
  searchField: { search: string };
  sidebar: { add: string };
  languageSwitcher: LanguageSwitcherLabels;
  markdownView: MarkdownViewLabels;
  permissionTree: PermissionTreeNativeLabels;
  fileCollection: FileCollectionLabels;
  appIcon: { unread: (label: string, count: number) => string };
}

export type LabelOverrides<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: LabelOverrides<T[K]> }
      : T;

/** 所有库内默认文案集中于此（英文对照见 localeEnUS.ts，键由 ComponentLabels 约束一致）；业务标题、权限目录和结果内容仍由宿主提供。 */
export const zhCN: ComponentLabels = {
  selectionArea: {
    instructions: '在空白处拖动框选，Ctrl、Command 或 Shift 追加选择；Ctrl 或 Command 加 A 全选，Esc 取消框选。',
    count: (count) => `已选择 ${count} 项`,
  },
  gridLayout: {
    move: (title) => `移动：${title}`,
    position: (title, column, row) => `${title} 已定位到第 ${column} 列、第 ${row} 行`,
    pixelPosition: (title, x, y) => `${title} 已移动到横向 ${x} 像素、纵向 ${y} 像素`,
    groupPosition: (count) => `已移动 ${count} 个图标`,
    blocked: '目标位置已占用',
    cancelled: '已取消移动',
    front: '移到最前',
    overflow: (count) => `${count} 个图标没有空位，请增加网格行数`,
    instructions: '按住拖动以调整位置，或聚焦后按 Alt 加方向键移动，Esc 取消本次拖动。',
  },
  dockWorkspace: { reorder: '调整应用顺序', done: '完成', preview: (label) => `${label}的窗口` },
  chart: {
    empty: '暂无统计数据',
    negativePie: '饼图不支持负数，请切换图表类型',
    zeroPie: '当前指标合计为零，无法绘制饼图',
    overflow: '图形展示前 50 组，完整统计见下表',
    overflowPie: '前 50 组及其余分组合计；完整数据见下表',
    other: '其他',
  },
  lockScreen: {
    locked: '屏幕已锁定',
    unlock: '解锁',
    busy: '正在解锁…',
    signOut: '退出登录',
    password: '锁屏密码',
    passwordPlaceholder: '输入锁屏密码',
  },
  lockCountdown: { upcoming: '即将自动锁屏', remaining: (seconds) => `距离锁屏还剩 ${seconds} 秒`, cancel: '取消锁屏' },
  commandPalette: { search: '搜索命令', empty: '没有匹配的命令', loading: '正在加载命令', results: '命令结果' },
  launchpad: { search: '搜索应用', empty: '没有匹配的应用', applications: '应用列表' },
  notificationCenter: {
    all: '全部',
    unread: '未读',
    list: '通知列表',
    empty: '暂无通知',
    noUnread: '没有未读通知',
    markRead: '标为已读',
    dismiss: '移除通知',
    markAllRead: '全部已读',
    clear: '清空通知',
    count: (total, unread) => `${total} 条通知，${unread} 条未读`,
  },
  windowSwitcher: { windows: '窗口列表', empty: '暂无可切换窗口', current: '当前窗口', minimized: '已最小化' },
  rangeSlider: { lower: '起始值', upper: '结束值' },
  rangeInput: { slider: '滑块', value: '数值' },
  otpInput: { input: '验证码' },
  rating: { score: (value, max) => `${value} 分，满分 ${max} 分`, clear: '清除评分', unrated: '尚未评分' },
  monthCalendar: {
    previous: '上个月',
    next: '下个月',
    today: '本月',
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    title: (year, month) => `${year} 年 ${month} 月`,
    date: (value) => `${Number(value.slice(0, 4))} 年 ${Number(value.slice(5, 7))} 月 ${Number(value.slice(8))} 日`,
    more: (count) => `其余 ${count} 项`,
  },
  checkboxGroup: { required: '请至少选择一项', empty: '暂无可选项' },
  form: { actions: '表单操作' },
  colorPicker: { choose: '选择颜色', presets: '推荐颜色', clear: '清空颜色', placeholder: '#RRGGBB' },
  timeline: { empty: '暂无事件' },
  avatarGroup: { empty: '暂无成员', more: (count) => `查看其余 ${count} 位成员` },
  result: {
    titles: {
      success: '操作成功',
      error: '操作失败',
      warning: '请注意',
      info: '提示',
      'not-found': '页面不存在',
      forbidden: '暂无访问权限',
    },
  },
  loadingOverlay: { loading: '加载中' },
  sortableList: {
    empty: '暂无可排序条目',
    cancelled: '已取消排序',
    handle: (label) => `排序：${label}`,
    previous: (label) => `前移：${label}`,
    next: (label) => `后移：${label}`,
    lifted: (label) => `已选取 ${label}，使用方向键调整位置，回车确认`,
    moved: (label, position, total) => `${label} 的排序请求已提交：第 ${position} 项，共 ${total} 项`,
    position: (label, position, total) => `${label} 的目标位置：第 ${position} 项，共 ${total} 项，尚未确认`,
    instructions: '拖动手柄排序，或按 Alt 加方向键移动；点击手柄后可用方向键定位，回车或空格确认，Esc 取消。',
    rowInstructions:
      '长按条目可拖动排序；聚焦条目后按空格开始，方向键定位，回车确认，Esc 取消；Alt 加方向键可直接移动。',
    rowMovementInstructions:
      '按住条目并移动可拖动排序；聚焦条目后按空格开始，方向键定位，回车确认，Esc 取消；Alt 加方向键可直接移动。',
    roleDescription: '可排序条目',
  },
  markdownEditor: {
    edit: '源码',
    split: '分屏',
    preview: '预览',
    toolbar: '编辑工具',
    undo: '撤销',
    redo: '重做',
    attachment: '添加附件',
    placeholder: '从这里开始写作…',
    tooLong: (limit) => `正文不能超过 ${limit.toLocaleString('zh-CN')} 个字符`,
    formats: {
      bold: '加粗',
      italic: '斜体',
      heading: '标题',
      quote: '引用',
      code: '代码',
      'list-ul': '无序列表',
      'list-ol': '有序列表',
      table: '表格',
      hr: '分割线',
      link: '链接',
    },
    samples: {
      bold: '粗体文字',
      italic: '斜体文字',
      heading: '标题',
      quote: '引用内容',
      code: '代码',
      list: '列表项',
      link: '链接文字',
      table: '| 列 1 | 列 2 | 列 3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |',
    },
  },
  imageCropper: {
    empty: '请选择图片',
    loading: '正在加载图片',
    loadError: '图片加载失败',
    exportError: '图片导出失败，请重试',
    invalidSize: '裁剪输出尺寸无效',
    retry: '重试',
    zoom: '缩放',
    reset: '重置取景',
    center: '居中',
    top: '靠上',
    bottom: '靠下',
    left: '靠左',
    right: '靠右',
    confirm: '应用裁剪',
    processing: '正在处理',
    cancel: '取消',
    dimensions: (width, height) => `${width} × ${height} 像素`,
    spec: '规格：',
    instructions: '拖动平移图片，方向键微调，Shift 加方向键快速移动；Esc 取消本次拖动。',
  },
  chip: { remove: (text) => `移除标签：${text}` },
  tagInput: {
    placeholder: '输入后按回车添加',
    required: '请至少添加一个标签',
    duplicate: (value) => `标签已存在：${value}`,
    limit: (limit) => `最多添加 ${limit} 个标签`,
    length: (limit) => `每个标签最多 ${limit} 个字符`,
    invalid: (value) => `标签不符合要求：${value}`,
    added: (count) => `已添加 ${count} 个标签`,
  },
  resizeHandle: { label: '调整分栏大小', value: (value) => `${Math.round(value)} 像素` },
  statistic: { empty: '—', loading: '加载中' },
  breadcrumb: { navigation: '面包屑', more: '显示省略层级' },
  drawer: { close: '关闭抽屉' },
  select: { placeholder: '请选择', empty: '暂无可选项' },
  searchSelect: {
    search: '搜索选项',
    open: '展开选项',
    clear: '清空选择',
    loading: '正在加载选项',
    count: (count) => `已选择 ${count} 项`,
  },
  tree: { empty: '暂无节点', expand: (label) => `展开：${label}`, collapse: (label) => `收起：${label}` },
  popconfirm: { confirm: '确定', cancel: '取消', working: '处理中' },
  coachmark: {
    close: '关闭引导',
    done: '知道了',
    skip: '跳过',
    prev: '上一步',
    next: '下一步',
    finish: '完成',
    step: (current, total) => `${current} / ${total}`,
  },
  inputNumber: { increase: '增加数值', decrease: '减少数值' },
  passwordInput: { show: '显示内容', hide: '隐藏内容' },
  copyButton: { copy: '复制', copying: '正在复制', copied: '已复制', failed: '复制失败，请重试' },
  codeBlock: { code: '代码' },
  modal: { close: '关闭' },
  toast: { close: '关闭消息', region: '消息通知' },
  dateTimePicker: {
    open: '打开选择面板',
    clear: '清空',
    confirm: '确定',
    cancel: '取消',
    today: '今天',
    previousMonth: '上个月',
    nextMonth: '下个月',
    previousYear: '上一年',
    nextYear: '下一年',
    date: '选择日期',
    time: '选择时间',
    dateTime: '选择日期和时间',
    hour: '时',
    minute: '分',
    second: '秒',
    invalid: '请选择范围内且符合步进的值',
    datePlaceholder: '请选择日期',
    timePlaceholder: '请选择时间',
    dateTimePlaceholder: '请选择日期和时间',
    rangeStartHint: '请选择开始日期',
    rangeEndHint: '已选开始日期，请选择结束日期',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    year: (value) => `${value} 年`,
    month: (value) => `${value} 月`,
    monthTitle: (year, month) => `${year} 年${month} 月`,
    dateLabel: (value) => value.replace(/^(\d+)-(\d+)-(\d+)$/, '$1年$2月$3日'),
  },
  rangePicker: { start: '开始', end: '结束', separator: '至', invalidOrder: '结束值不能小于开始值' },
  desktopCard: { collapse: '折叠卡片', expand: '展开卡片' },
  desktopCardRail: { list: '桌面卡片列表', column: (index) => `桌面卡片第 ${index} 列` },
  desktopNote: {
    collapse: '折叠便签',
    expand: '展开便签',
    input: '便签正文',
    color: '便签颜色',
    placeholder: '写点什么…',
    images: (count) => `${count} 张图片`,
    colors: { yellow: '浅黄', blue: '浅蓝', green: '浅绿', pink: '浅粉', white: '白色' },
  },
  clockCard: { invalid: '时间不可用' },
  skeleton: { loading: '加载中' },
  menuBar: { clock: '日期与时间' },
  window: {
    close: '关闭窗口',
    minimize: '最小化窗口',
    maximize: '最大化窗口',
    restore: '还原窗口',
    controls: '窗口控制',
    resize: '调整窗口大小，方向键调整，Shift 加速',
  },
  calendar: {
    previous: '上个月',
    next: '下个月',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    title: (year, month) => `${year} 年 ${month} 月`,
  },
  themePicker: { label: '主题模式', auto: '自动', light: '浅色', dark: '深色' },
  accentPicker: { label: '强调色' },
  wallpaperPicker: {
    label: '桌面壁纸',
    sequoia: '红杉',
    sonoma: '索诺玛',
    aurora: '极光',
    dusk: '暮色',
    aquarium: '水族馆',
    forest: '森林',
    grassland: '草原',
    galaxy: '星空',
    custom: '自定义',
    addCustom: '添加自定义壁纸',
    useCustom: '使用自定义壁纸',
  },
  spinner: { loading: '加载中' },
  dock: { label: 'Dock 栏' },
  adminSidebar: {
    navigation: '应用菜单',
    collapse: '收起菜单',
    expand: '展开菜单',
    density: '菜单密度',
    comfortable: '宽松',
    compact: '紧凑',
  },
  startMenu: {
    button: '开始菜单',
    search: '搜索应用',
    pinned: '已固定',
    all: '全部',
    results: '搜索结果',
    empty: '没有匹配的应用',
  },
  pageTabs: {
    label: '已打开的页面',
    close: (label) => `关闭 ${label}`,
    menu: '页签菜单',
    refresh: '刷新',
    closeTab: '关闭',
    closeOthers: '关闭其他',
    closeAll: '关闭所有',
  },
  searchField: { search: '搜索' },
  sidebar: { add: '新增' },
  languageSwitcher: {
    label: '切换语言',
    system: '跟随系统',
    current: (name) => `当前语言：${name}`,
    switchTo: (name) => `切换到 ${name}`,
  },
  markdownView: {
    task: { done: '已完成', pending: '未完成' },
    image: '图片',
    imageHint: (alt) => `${alt}，选择后可调整尺寸和排列`,
    resizeImage: '调整图片宽度',
  },
  permissionTree: {
    toggle: (open, label) => `${open ? '收起' : '展开'}${label}子权限`,
    children: (label) => `${label}子权限`,
    apiChildren: (label) => `${label} API 权限`,
  },
  fileCollection: { grid: '图标视图', list: '列表视图', file: '文件' },
  appIcon: { unread: (label, count) => `${label}，${count} 条未读` },
};

/** 按已知键递归合并；数组和函数整体覆盖，undefined 不擦除父级文案。 */
export function mergeLabels<T extends object>(base: T, overrides?: LabelOverrides<T>): T {
  if (!overrides) return base;
  const next = { ...base };
  const changes = overrides as Partial<Record<keyof T, unknown>>;
  for (const key of Object.keys(base) as (keyof T)[]) {
    const value = changes[key];
    const previous = base[key];
    if (value === undefined || value === null) continue;
    next[key] =
      previous && typeof previous === 'object' && !Array.isArray(previous)
        ? (mergeLabels(previous, value as LabelOverrides<typeof previous>) as T[keyof T])
        : (value as T[keyof T]);
  }
  return next;
}
