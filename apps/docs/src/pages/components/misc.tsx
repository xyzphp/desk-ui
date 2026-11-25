import { useState } from 'react';
import {
  AccentPicker,
  AppLayout,
  AppMain,
  Calendar,
  Desktop,
  DocumentPane,
  Lead,
  NavGroupLabel,
  NavItem,
  NavSidebar,
  Panel,
  SegmentedControl,
  Spinner,
  Stack,
  Switch,
  ThemePicker,
  Title,
  WallpaperPicker,
  type ThemeChoice,
  type WallpaperName,
} from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';
import { SettingsRowDemo, WallpaperSettingsDemo } from './SettingsRowDemo';
import settingsSource from './SettingsRowDemo.tsx?raw';
import { LockSettingsDemo } from './LockSettingsDemo';
import lockSettingsSource from './LockSettingsDemo.tsx?raw';

const accents = [
  { value: '#0a84ff', label: '蓝色' },
  { value: '#bf5af2', label: '紫色' },
  { value: '#ff375f', label: '粉色' },
  { value: '#ff9f0a', label: '橙色' },
  { value: '#30d158', label: '绿色' },
];

function NavDemo() {
  const [current, setCurrent] = useState('appearance');
  const items = [
    ['appearance', '外观', 'sun-moon'],
    ['about', '关于本机', 'info'],
    ['site', '站点设置', 'globe-2'],
    ['security', '安全设置', 'shield-check'],
  ] as const;
  return (
    <AppLayout>
      <NavSidebar title="系统设置" aria-label="系统设置">
        {items.map(([id, label, icon]) => (
          <NavItem key={id} icon={icon} current={current === id} onClick={() => setCurrent(id)}>
            {label}
          </NavItem>
        ))}
        <NavGroupLabel>账号</NavGroupLabel>
        <NavItem icon="users" current={current === 'accounts'} onClick={() => setCurrent('accounts')}>
          账号管理
        </NavItem>
        <NavItem icon="contact-round" current={current === 'roles'} onClick={() => setCurrent('roles')}>
          角色管理
        </NavItem>
      </NavSidebar>
      <AppMain>
        <DocumentPane>
          <Title>
            {
              [...items.map(([id, label]) => [id, label]), ['accounts', '账号管理'], ['roles', '角色管理']].find(
                ([id]) => id === current,
              )?.[1]
            }
          </Title>
          <Lead>左侧是应用导航，右侧是该页内容。</Lead>
        </DocumentPane>
      </AppMain>
    </AppLayout>
  );
}

function SegmentedDemo({ settings = true }: { settings?: boolean }) {
  const [titlebar, setTitlebar] = useState<'system' | 'windows' | 'macos'>('system');
  return (
    <div style={{ width: 'min(100%, 320px)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SegmentedControl
        variant={settings ? 'settings' : 'default'}
        aria-label="标题栏样式"
        value={titlebar}
        onChange={setTitlebar}
        options={[
          { value: 'system', label: '跟随系统' },
          { value: 'windows', label: 'Windows' },
          { value: 'macos', label: 'macOS' },
        ]}
      />
    </div>
  );
}

function ThemeDemo({ settings }: { settings?: boolean }) {
  const [theme, setTheme] = useState<ThemeChoice>('auto');
  return (
    <div style={{ width: 'min(100%, 320px)' }}>
      <ThemePicker variant={settings ? 'settings' : 'cards'} value={theme} onChange={setTheme} />
    </div>
  );
}

function AccentDemo() {
  const [accent, setAccent] = useState('#0a84ff');
  return <AccentPicker variant="settings" colors={accents} value={accent} onChange={setAccent} />;
}

function WallpaperDemo() {
  const [wallpaper, setWallpaper] = useState<WallpaperName>();
  const [busy, setBusy] = useState(false);
  const [motion, setMotion] = useState(false);
  return (
    <Stack gap="sm">
      <Desktop wallpaper={wallpaper} wallpaperMotion={motion} style={{ height: 180 }} />
      <WallpaperPicker value={wallpaper} onChange={setWallpaper} disabled={busy} />
      <Switch checked={motion} onCheckedChange={setMotion}>
        动态壁纸
      </Switch>
      <Switch checked={busy} onCheckedChange={setBusy}>
        模拟壁纸保存中
      </Switch>
    </Stack>
  );
}

export const appLayoutDoc: ComponentDoc = {
  name: { 'zh-CN': '应用布局', 'en-US': 'App layout' },
  summary: {
    'zh-CN': '应用窗口内的导航区与主内容区外框，负责横向排布和主区容器查询上下文。',
    'en-US':
      'Frame for the navigation area and main content inside an app window, handling horizontal layout and the main area container-query context.',
  },
  usage: [
    '以 AppLayout 包住导航侧栏与 AppMain，主区按剩余宽度伸展。',
    'AppMain 提供容器查询上下文，内容区滚动与内边距由内部组件负责。',
    '当前导航项与内容由调用方维护，布局本身不负责路由。',
  ],
  demos: [
    {
      title: '导航与主区',
      code: `<AppLayout>
  <NavSidebar title="应用导航" aria-label="应用导航"><NavItem icon="info" current>概览</NavItem></NavSidebar>
  <AppMain><DocumentPane><Title>概览</Title><Lead>主区随窗口宽度伸展。</Lead></DocumentPane></AppMain>
</AppLayout>`,
      layout: 'frame',
      render: () => (
        <AppLayout>
          <NavSidebar title="应用导航" aria-label="应用导航">
            <NavItem icon="info" current>
              概览
            </NavItem>
          </NavSidebar>
          <AppMain>
            <DocumentPane>
              <Title>概览</Title>
              <Lead>主区随窗口宽度伸展。</Lead>
            </DocumentPane>
          </AppMain>
        </AppLayout>
      ),
    },
  ],
  api: [
    {
      component: 'AppLayout',
      props: [
        {
          name: '…div 属性',
          type: "ComponentProps<'div'>",
          description: '横向排布导航与主区，透传 className / ref 等属性。',
        },
      ],
    },
    {
      component: 'AppMain',
      props: [
        { name: '…div 属性', type: "ComponentProps<'div'>", description: '可伸展的内容列，提供容器查询上下文。' },
      ],
    },
  ],
  a11y: ['布局不改变子控件的语义与键盘顺序；导航区域需单独提供可访问名称。'],
};

export const settingsRowDoc: ComponentDoc = {
  name: { 'zh-CN': '设置行', 'en-US': 'Settings row' },
  summary: {
    'zh-CN': '原站系统设置的独立选项卡片，支持标签旁的控件和占满下方的预览内容。',
    'en-US':
      'Standalone option card from the original system settings, supporting controls next to the label and full-height preview content below.',
  },
  usage: [
    '常规设置用默认布局，标签在左、控件在右。多项设置可用 Stack gap="sm" 纵向排列。',
    '选择器与保存按钮组合时，用 Inline wrap={false} 保持同一行，限制选择器宽度并允许窄窗口收缩。',
    '壁纸等需要整行预览的设置使用 stacked，标题旁的按钮放在 actions，预览内容放在 children。',
    '设置面板可放入 AppMain，内容宽度不足时操作与预览自动换行。选中状态与持久化由宿主管理。',
  ],
  demos: [
    {
      title: '系统设置的外观布局',
      description: '试试切换主题选项、Dock 样式或壁纸。示例状态仅用于本页预览。',
      layout: 'frame',
      code: settingsSource,
      render: () => <SettingsRowDemo />,
    },
    {
      title: '个人账号的锁屏设置',
      description: '标题右侧放置保存和读取操作。字段用分隔线区分，窄处可换行。',
      layout: 'stack',
      code: lockSettingsSource,
      render: () => <LockSettingsDemo />,
    },
  ],
  api: [
    {
      component: 'SettingsRow',
      props: [
        { name: 'label', type: 'string', description: '必填，可见标签及设置组名称。' },
        {
          name: 'layout',
          type: "'inline' | 'stacked'",
          default: 'inline',
          description: '左右排列或标题与预览上下排列。',
        },
        {
          name: 'actions / children',
          type: 'ReactNode',
          description: '堆叠布局的标题栏操作，以及右侧控件或下方内容。',
        },
      ],
    },
  ],
  a11y: [
    '可见标签通过 aria-labelledby 命名设置组，各控件仍提供自己的名称。',
    'Tab 顺序沿用文档顺序，窄容器折行保留全部操作。',
  ],
};

export const navDoc: ComponentDoc = {
  name: { 'zh-CN': '导航侧栏', 'en-US': 'Nav sidebar' },
  summary: {
    'zh-CN':
      '按功能分组的应用导航，统一侧栏底色、标题、图标底块、行高与选中态；数据列表侧栏使用 SplitLayout + Sidebar。',
    'en-US':
      'App navigation grouped by function with unified sidebar background, title, icon block, row height, and selected state; data-list sidebars use SplitLayout + Sidebar.',
  },
  usage: [
    '固定功能入口使用 NavSidebar 与 NavItem；应用窗口内存在分组导航时，NavSidebar 设置 as="aside"，否则默认输出 nav。',
    '当前页用 current 标记，渲染为 aria-current="page"；分组用 NavGroupLabel，图标块由组件统一绘制。',
    '设置类常驻入口可放 footer，固定在侧栏底部，主体内容随之内部滚动。',
    '需要搜索、计数、可新增的数据列表用 SplitLayout + Sidebar，不要另写一套选中态。',
  ],
  demos: [
    {
      title: '系统设置式导航',
      code: `<AppLayout>
  <NavSidebar title="系统设置" aria-label="系统设置">
    <NavItem icon="sun-moon" current onClick={…}>外观</NavItem>
    <NavGroupLabel>账号</NavGroupLabel>
    <NavItem icon="users">账号管理</NavItem>
  </NavSidebar>
  <AppMain>…</AppMain>
</AppLayout>`,
      layout: 'frame',
      render: () => <NavDemo />,
    },
  ],
  api: [
    {
      component: 'NavSidebar',
      props: [
        { name: 'title', type: 'ReactNode', description: '导航标题。' },
        {
          name: 'as',
          type: "'nav' | 'aside'",
          default: 'nav',
          description: '外层语义；内部嵌套分组 nav 时使用 aside。',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: '固定在侧栏底部的区域（如设置入口），提供后主体改为内部滚动。',
        },
      ],
    },
    {
      component: 'NavItem',
      props: [
        { name: 'icon', type: 'IconName', description: '左侧图标块。' },
        { name: 'current', type: 'boolean', description: '当前页。' },
      ],
    },
  ],
  a11y: ['NavSidebar 使用 nav 元素，导航项是原生 button，当前页 aria-current="page"；聚焦显示内缩焦点环。'],
};

export const spinnerDoc: ComponentDoc = {
  name: { 'zh-CN': '加载指示器', 'en-US': 'Spinner' },
  summary: {
    'zh-CN': '加载指示，用于窗口或区域首次加载。局部加载优先在原位置显示"正在读取…"文字，避免布局跳动。',
    'en-US':
      'Loading indicator for first loads of windows or areas; prefer in-place reading text for partial loads to avoid layout jumps.',
  },
  usage: [
    'role="status" 并带名称；需要更具体的说明时传 label。',
    '尺寸 26px，如需更小请在容器内用 transform 缩放，不新增尺寸变体。',
  ],
  demos: [
    {
      title: '加载中',
      code: `<Spinner />
<Spinner label="正在读取令牌…" />`,
      render: () => (
        <>
          <Spinner />
          <span>正在读取令牌…</span>
        </>
      ),
    },
  ],
  api: [
    {
      component: 'Spinner',
      props: [{ name: 'label', type: 'string', default: "'加载中'", description: '无障碍名称。' }],
    },
  ],
  a11y: ['role="status"；系统开启"减少动态效果"时放慢旋转。'],
};

export const pickersDoc: ComponentDoc = {
  name: { 'zh-CN': '分段控件', 'en-US': 'Segmented control' },
  summary: {
    'zh-CN': '在一小组互斥选项间切换，以公共选中态展示当前值。',
    'en-US':
      'Switches among a small set of mutually exclusive options, showing the current value with the shared selected state.',
  },
  usage: [
    '通过 options 提供值与文字，value + onChange 由调用方控制。',
    '控制中心使用等宽短选项，系统设置使用紧凑的 settings 外观；长说明可作为 description 显示悬停提示和无障碍名称。',
  ],
  demos: [
    {
      title: '标题栏样式',
      code: `const [titlebar, setTitlebar] = useState<'system' | 'windows' | 'macos'>('system');
<SegmentedControl variant="settings" aria-label="标题栏样式" value={titlebar} onChange={setTitlebar}
  options={[{ value: 'system', label: '跟随系统' }, { value: 'windows', label: 'Windows' }, { value: 'macos', label: 'macOS' }]} />`,
      render: () => <SegmentedDemo />,
    },
    {
      title: '控制中心分段选项',
      code: `<SegmentedControl aria-label="标题栏样式" value={titlebar} onChange={setTitlebar}
  options={[{ value: 'system', label: '跟随系统' }, { value: 'windows', label: 'Windows' }, { value: 'macos', label: 'macOS' }]} />`,
      render: () => <SegmentedDemo settings={false} />,
    },
  ],
  api: [
    {
      component: 'SegmentedControl<T>',
      props: [
        {
          name: 'options',
          type: '{ value: T; label: string; description?: string }[]',
          description: '必填；description 可选，用作提示与无障碍名称。',
        },
        { name: 'value / onChange', type: 'T / (v: T) => void', description: '必填。' },
        { name: 'aria-label', type: 'string', description: '必填，分组名称。' },
        { name: 'variant', type: "'default' | 'settings'", description: '常规等宽选项或原站紧凑设置样式。' },
      ],
    },
  ],
  a11y: [
    '分组使用 role="group" 与提供的名称；选项为原生 button，aria-pressed 表达当前值。description 提供悬停提示和选项的无障碍名称。',
  ],
};

export const themePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '主题选择器', 'en-US': 'Theme picker' },
  summary: {
    'zh-CN': '自动、浅色和深色选择，支持控制中心预览卡片与外观页分段按钮。',
    'en-US':
      'Automatic, light, and dark choices, supporting control-center preview cards and segmented buttons on the appearance page.',
  },
  usage: [
    'value 取 auto / light / dark，onChange 回调新的主题选择。',
    '组件只显示选择状态，由宿主应用 data-theme；本页示例不修改文档桌面的外观。',
  ],
  demos: [
    {
      title: '控制中心预览卡片',
      code: '<ThemePicker value={theme} onChange={setTheme} />',
      render: () => <ThemeDemo />,
    },
    {
      title: '设置页分段按钮',
      code: '<ThemePicker variant="settings" value={theme} onChange={setTheme} />',
      render: () => <ThemeDemo settings />,
    },
  ],
  api: [
    {
      component: 'ThemePicker',
      props: [
        { name: 'value', type: 'ThemeChoice', description: '必填，auto / light / dark。' },
        { name: 'onChange', type: '(value: ThemeChoice) => void', description: '必填，选择变化回调。' },
        { name: 'variant', type: "'cards' | 'settings'", default: 'cards', description: '色块预览或紧凑分段按钮。' },
      ],
    },
  ],
  a11y: ['卡片是带文字名称的原生按钮，以 aria-pressed 表达选中状态。'],
};

export const accentPickerDoc: ComponentDoc = {
  name: { 'zh-CN': '强调色选择器', 'en-US': 'Accent picker' },
  summary: {
    'zh-CN': '带名称的颜色圆点列表，用外圈描边标记当前强调色。',
    'en-US': 'Named color-dot list that marks the current accent with an outer ring.',
  },
  usage: [
    'colors 由调用方提供，每项同时包含 value 和可读名称 label。',
    '组件回调选择的颜色值，实际主题变量由宿主更新。',
  ],
  demos: [
    {
      title: '颜色选择',
      description: '选择颜色只改变当前示例的选中状态。',
      code: `const [accent, setAccent] = useState('#0a84ff');
const accents = [
  { value: '#0a84ff', label: '蓝色' }, { value: '#bf5af2', label: '紫色' },
  { value: '#ff375f', label: '粉色' }, { value: '#ff9f0a', label: '橙色' }, { value: '#30d158', label: '绿色' },
];
<AccentPicker variant="settings" colors={accents} value={accent} onChange={setAccent} />`,
      render: () => <AccentDemo />,
    },
  ],
  api: [
    {
      component: 'AccentPicker',
      props: [
        { name: 'colors', type: '{ value: string; label: string }[]', description: '必填，带名称的颜色选项。' },
        {
          name: 'value / onChange',
          type: 'string / (value: string) => void',
          description: '必填，当前颜色与变更回调。',
        },
        { name: 'variant', type: "'default' | 'settings'", description: '设置行中使用 settings，色卡可换行。' },
      ],
    },
  ],
  a11y: ['每个颜色按钮有 aria-label 与 title，选中通过 aria-pressed 表达；名称不依赖色彩识别。'],
};

export const wallpaperPickerDoc: ComponentDoc = {
  name: { 'zh-CN': '壁纸选择器', 'en-US': 'Wallpaper picker' },
  summary: {
    'zh-CN': '使用已有壁纸预设的缩略图选择，标记当前值并回调选择结果。',
    'en-US': 'Thumbnail picker over existing wallpaper presets, marking the current value and reporting selection.',
  },
  usage: [
    'value 使用 WallpaperName，onChange 交给宿主更新壁纸。custom.url 生效时只选中自定义图块。',
    '独立桌面的控制中心与系统设置共用此选择器，上传、保存和恢复预设由宿主调用既有接口。',
    'Desktop 的 wallpaperUrl 可显示宿主提供的同源图片路径，wallpaper 指定预设回退。',
    'Desktop 的 wallpaperMotion 开启动态壁纸：渐变预设叠加变形光斑与摆动色带，图片壁纸缓慢推移；系统减弱动态效果时保持静止。',
    'aquarium（水族馆「深海秘境」：海底画作上的光柱与 Canvas 鱼群，18 条鱼逐帧摆尾、远小近大，两侧气泡上升）、forest（森林「晨雾秘境」：流动薄雾、瀑布水线、湖面波纹、摇曳与飘落的叶子）、grassland（草原「风的牧场」：随风摆动的草丛与草茎、吃草的牛羊、云带与山谷薄雾）、galaxy（星空「星海之境」：漂移的星云、行星光环、闪烁的星星、星尘与流星）是手绘画作上的 SVG / Canvas 动画，选中时才按需加载场景代码与画作；深色主题切到各自的夜景（森林另有月亮、星星与萤火虫）。未开启 wallpaperMotion 或系统减弱动态效果时画面完整但静止。开启动态后，水族馆的鱼躲开指针，点击空白处惊散鱼群并冒出气泡；森林随指针轻微视差、散出光点，划过湖面泛起涟漪，点击空白处迸出一簇光点（按钮、链接、输入框、窗口、菜单栏、Dock、图标与 data-desktop-interactive 区域除外）。',
    'Wallpaper 是 Desktop 内部的壁纸层，也可单独铺在登录页等全屏背景里；指针交互只在 .ds-desktop 或带 data-wallpaper-scope 的祖先内生效。isSceneWallpaper / isDynamicWallpaper 判断壁纸类型，宿主可在选中动态壁纸时一并开启 wallpaperMotion。',
  ],
  demos: [
    {
      title: '壁纸预览与保存中状态',
      layout: 'stack',
      code: `const [wallpaper, setWallpaper] = useState<WallpaperName>();
<Desktop wallpaper={wallpaper} wallpaperMotion={motion} style={{ height: 180 }} />
<WallpaperPicker value={wallpaper} onChange={setWallpaper} disabled={busy} />`,
      render: () => <WallpaperDemo />,
    },
    {
      title: '设置页的预设与自定义壁纸',
      layout: 'stack',
      code: settingsSource,
      render: () => <WallpaperSettingsDemo />,
    },
  ],
  api: [
    {
      component: 'WallpaperPicker',
      props: [
        { name: 'value', type: 'WallpaperName', description: '当前预设名称。缺省时所有预设均为未选中。' },
        { name: 'disabled', type: 'boolean', description: '保存期间禁用预设按钮，保留当前选中状态。' },
        { name: 'onChange', type: '(value: WallpaperName) => void', description: '必填，选择变化回调。' },
        {
          name: 'custom',
          type: '{ url?: string; onClick: () => void }',
          description: '添加第五个等高图块。url 为同源根路径，onClick 由宿主处理。',
        },
      ],
    },
  ],
  a11y: ['缩略图按钮提供壁纸的中文名称，以 aria-pressed 表达选中。'],
};

export const calendarDoc: ComponentDoc = {
  name: { 'zh-CN': '日历', 'en-US': 'Calendar' },
  summary: {
    'zh-CN': '月历：上下月切换、周标题、今日高亮，相邻月份淡化。用于菜单栏时钟的日历弹层。',
    'en-US':
      'Month view with previous / next months, weekday header, today highlight, and dimmed adjacent months, used by the menu-bar clock popover.',
  },
  usage: [
    'today 缺省为当前日期，测试或截图时可固定。',
    '目前只做展示与翻月，不含日期选择；需要选择日期时扩展 onSelect。',
  ],
  demos: [
    {
      title: '日历弹层内容',
      code: `<Calendar />`,
      render: () => (
        <Panel style={{ width: 260 }}>
          <Calendar />
        </Panel>
      ),
    },
  ],
  api: [
    {
      component: 'Calendar',
      props: [{ name: 'today', type: 'Date', default: 'new Date()', description: '高亮的日期。' }],
    },
  ],
  a11y: ['翻月按钮带 aria-label；今日以填充强调色表达，并非唯一信息（数字仍可读）。'],
};
