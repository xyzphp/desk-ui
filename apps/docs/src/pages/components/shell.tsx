import { useState } from 'react';
import {
  AppIcon,
  Button,
  DesktopArea,
  Dock,
  DockItem,
  Inline,
  DockSeparator,
  MenuBar,
  MenuBarApp,
  MenuBarClock,
  Notification,
  NotificationStack,
  Window,
  WindowTitlebar,
  appGradients,
  type WindowGeometry,
} from '@xyzos/desk-ui';
import { AppIconDemo } from './AppIconDemo';
import appIconDemoSource from './AppIconDemo.tsx?raw';
import { OverlayMenuDemo as PopoverDemo, ContextMenuDemo as ContextDemo } from './OverlayMenuDemo';
import menuDemoSource from './OverlayMenuDemo.tsx?raw';
import type { ComponentDoc } from '../../blocks/types';
import { MenuBarDemo } from './MenuBarDemo';
import menubarSource from './MenuBarDemo.tsx?raw';

function DockDemo({ autoHide = false }: { autoHide?: boolean }) {
  const [running, setRunning] = useState(new Set(['guide']));
  const toggle = (id: string) =>
    setRunning((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const apps = [
    { id: 'guide', label: '使用指南', icon: 'book-open' as const, color: appGradients.blue },
    { id: 'forms', label: '表单', icon: 'text-cursor-input' as const, color: appGradients.green },
    { id: 'layout', label: '布局', icon: 'layout-grid' as const, color: appGradients.pink },
  ];
  return (
    <Dock autoHide={autoHide}>
      {apps.slice(0, 2).map((a) => (
        <DockItem key={a.id} label={a.label} running={running.has(a.id)} onActivate={() => toggle(a.id)}>
          <AppIcon icon={a.icon} color={a.color} />
        </DockItem>
      ))}
      <DockSeparator />
      {apps.slice(2).map((a) => (
        <DockItem key={a.id} label={a.label} running={running.has(a.id)} onActivate={() => toggle(a.id)}>
          <AppIcon icon={a.icon} color={a.color} />
        </DockItem>
      ))}
    </Dock>
  );
}

const dockDemoCode = `function DockDemo() {
  const [running, setRunning] = useState(new Set(['guide']));
  const toggle = (id: string) => setRunning((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const apps = [
    { id: 'guide', label: '使用指南', icon: 'book-open' as const, color: appGradients.blue },
    { id: 'forms', label: '表单', icon: 'text-cursor-input' as const, color: appGradients.green },
    { id: 'layout', label: '布局', icon: 'layout-grid' as const, color: appGradients.pink },
  ];
  return (
    <Dock>
      {apps.slice(0, 2).map((a) => (
        <DockItem key={a.id} label={a.label} running={running.has(a.id)} onActivate={() => toggle(a.id)}>
          <AppIcon icon={a.icon} color={a.color} />
        </DockItem>
      ))}
      <DockSeparator />
      {apps.slice(2).map((a) => (
        <DockItem key={a.id} label={a.label} running={running.has(a.id)} onActivate={() => toggle(a.id)}>
          <AppIcon icon={a.icon} color={a.color} />
        </DockItem>
      ))}
    </Dock>
  );
}`;

function WindowDemo() {
  const [geometry, setGeometry] = useState<WindowGeometry>({ x: 28, y: 14, width: 420, height: 250 });
  const [maximized, setMaximized] = useState(false);
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState<{ geometry: WindowGeometry; maximized: boolean }>();
  return (
    <DesktopArea>
      {open ? (
        <Window
          title="示例窗口"
          geometry={geometry}
          onGeometryChange={setGeometry}
          maximized={maximized}
          onToggleMaximize={() => setMaximized((v) => !v)}
          onClose={() => setOpen(false)}
          minWidth={280}
          minHeight={160}
        >
          <div style={{ padding: 16, color: 'var(--text)' }}>
            <p>拖动标题栏移动，拖动边缘缩放，双击标题栏最大化。</p>
            <Inline>
              <Button size="sm" onClick={() => setSaved({ geometry: { ...geometry }, maximized })}>
                记录示例布局
              </Button>
              <Button
                size="sm"
                disabled={!saved}
                onClick={() => {
                  if (!saved) return;
                  setGeometry(saved.geometry);
                  setMaximized(saved.maximized);
                }}
              >
                恢复示例布局
              </Button>
            </Inline>
          </div>
        </Window>
      ) : (
        <Button style={{ margin: 16 }} onClick={() => setOpen(true)}>
          重新打开窗口
        </Button>
      )}
    </DesktopArea>
  );
}

export const menubarDoc: ComponentDoc = {
  name: { 'zh-CN': '菜单栏', 'en-US': 'Menu bar' },
  summary: {
    'zh-CN': '顶部菜单栏：左侧标志与当前应用名，中间模式切换，右侧图标按钮与时钟。Windows 风格下整条栏移到底部，与 Dock 合并为任务栏。',
    'en-US': 'Top menu bar: logo and current app name on the left, mode switch in the middle, icon buttons and clock on the right; in Windows style the whole bar moves to the bottom and merges with the Dock into the taskbar.',
  },
  usage: [
    '必须放在 Desktop 内；位置、高度和是否上下排列由 Desktop 的 dockStyle 变量决定，页面不单独设置。',
    '所在 Desktop 设 cardStyle="liquid" 时，菜单栏同步切换为液态玻璃底板与细高光边界，嵌套示例舞台不会向外或向内泄漏。',
    '菜单栏图标按钮使用 MenuBarIconButton，必须提供 label。',
    '点击标志展开系统菜单；使用 Popover variant="system" 复刻原站强调色悬停、纯文字项与分隔线，应用启动入口留在桌面与 Dock。',
    '窄屏（≤900px）自动改为两行排布，与原系统一致。',
  ],
  demos: [
    {
      title: 'macOS 风格',
      code: menubarSource,
      layout: 'stage',
      render: () => <MenuBarDemo />,
    },
    {
      title: 'Windows 风格（任务栏）',
      description: '同一组件，仅 Desktop 的 dockStyle 不同；时钟变为上下两行。',
      code: `<Desktop dockStyle="windows"><MenuBar … /></Desktop>`,
      layout: 'stage',
      stage: { dockStyle: 'windows', wallpaper: 'sonoma' },
      render: () => <MenuBarDemo />,
    },
  ],
  api: [
    {
      component: 'MenuBar',
      props: [{ name: 'left / center / right', type: 'ReactNode', description: '三个区域的内容。' }],
    },
    {
      component: 'MenuBarLogo / MenuBarApp',
      props: [
        { name: 'active', type: 'boolean', description: '（Logo）弹层展开时的高亮。' },
        {
          name: 'avatar / image / fallbackImage',
          type: 'string',
          description:
            '（Logo）依次回退的账号头像、站点图标和默认图。头像圆形裁切；图标保留比例。全部失败时显示 children。',
        },
      ],
    },
    {
      component: 'MenuBarIconButton',
      props: [
        { name: 'icon', type: 'IconName', description: '必填。' },
        { name: 'label', type: 'string', description: '必填，无障碍名称与悬停提示。' },
      ],
    },
    {
      component: 'MenuBarClock',
      props: [
        { name: 'date', type: 'string', description: '日期文字，为空时隐藏。' },
        { name: 'time', type: 'string', description: '必填，时间文字。' },
      ],
    },
  ],
  a11y: ['图标按钮均有 aria-label；时钟按钮名称为"日期与时间"。', '聚焦显示强调色焦点环。'],
};

export const dockDoc: ComponentDoc = {
  name: { 'zh-CN': '程序坞', 'en-US': 'Dock' },
  summary: {
    'zh-CN': 'macOS 风格的底部悬浮程序坞，显示应用图标、运行指示点与悬停提示，指针经过时放大邻近图标，新打开的应用会跳动。',
    'en-US': 'macOS-style floating bottom dock with app icons, running indicators, and hover tooltips; nearby icons magnify as the pointer passes and newly opened apps bounce.',
  },
  usage: [
    '放在 dockStyle="macos" 的 Desktop 中，窗口与系统菜单仍由各自组件负责。',
    '所在 Desktop 设 cardStyle="liquid" 时，macOS 悬浮 Dock 切换为液态玻璃底板、135° 菲涅耳高光环与悬停提示泡；嵌套示例舞台独立回退默认样式。',
    '图标放在 DockItem 内，running 表示窗口已打开，显示指示点。',
    '用 DockSeparator 分隔常驻应用与其他应用；hidden 可让程序坞滑出屏幕，autoHide 可在 macOS 风格下默认收起并在鼠标移至容器底部边缘时自动上滑显示、离开后延后收起（holdOpen 可在打开图标右键菜单等期间保持展开）。',
    '指针放大沿用原系统参数：静止 54px，指针正下方 84px，150px 内按余弦衰减，离开后恢复；传入 itemSize 时峰值与范围按 54px 基准等比缩放；进入 Dock 时立即响应，移动时按未放大前的位置计算，避免图标变宽后相互挤动；Windows 任务栏不放大。DockItem 的 running 由 false 变为 true 时图标跳动两次（1.2 秒），首次渲染已在运行不跳。开启“减少动态效果”时 Dock 仍响应指针尺寸变化但取消过渡，启动跳动停用。',
    'Windows 风格请查看独立的任务栏页面。',
  ],
  demos: [
    {
      title: 'macOS 风格',
      description: '点击图标切换运行状态。',
      code: `${dockDemoCode}

<Desktop dockStyle="macos"><DockDemo /></Desktop>`,
      layout: 'stage',
      render: () => <DockDemo />,
    },
    {
      title: '自动隐藏（鼠标移至底边自动显示）',
      description: '将鼠标移至演示舞台底边，程序坞自动滑出显示；移开后自动收起并清除放大状态。',
      code: `<Desktop dockStyle="macos"><Dock autoHide>…</Dock></Desktop>`,
      layout: 'stage',
      render: () => <DockDemo autoHide />,
    },
  ],
  api: [
    {
      component: 'Dock',
      props: [
        { name: 'hidden', type: 'boolean', description: '隐藏 Dock，同时停止并清除放大。' },
        {
          name: 'autoHide',
          type: 'boolean',
          description: 'macOS 风格下启用底边触发自动显隐；idle 时收起并标记 inert，移入底边自动展开。',
        },
        {
          name: 'holdOpen',
          type: 'boolean',
          description: 'autoHide 启用期间保持展开不自动收起（如右键菜单打开时）。',
        },
        { name: 'magnify', type: 'boolean', default: 'dockStyle === "macos"', description: '指针经过时放大邻近图标。' },
        { name: 'itemSize', type: 'number', description: '静止状态项尺寸（px），放大峰值与感应范围等比缩放。' },
      ],
    },
    {
      component: 'DockItem',
      props: [
        { name: 'label', type: 'string', description: '必填，名称，同时作为无障碍名称与提示。' },
        { name: 'running', type: 'boolean', description: '显示运行指示点。' },
        { name: 'onActivate', type: '() => void', description: '点击或 Enter / Space。' },
      ],
    },
  ],
  a11y: ['DockItem 是可聚焦的 role="button"，Enter / Space 触发；聚焦显示强调色外框。'],
};

export const taskbarDoc: ComponentDoc = {
  ...dockDoc,
  name: { 'zh-CN': '任务栏', 'en-US': 'Taskbar' },
  summary: {
    'zh-CN': 'Windows 风格的底部任务栏。应用区域仍由 Dock 渲染，系统菜单与时钟通过 MenuBar 放入左右区域。',
    'en-US': 'Windows-style bottom taskbar; the app area is still rendered by Dock, with the system menu and clock placed in the left and right areas via MenuBar.',
  },
  usage: [
    '使用 Desktop 的 dockStyle="windows"，复用现有 Dock 与 MenuBar，不创建另一套任务栏组件。',
    'DockItem 的 running 与 onActivate 仍由调用方维护。',
    'Windows 风格不启用悬停放大或提示；隐藏应用区域时仍保留任务栏占位。',
    '所在 Desktop 设 cardStyle="liquid" 时，任务栏底条切换为液态玻璃底板与顶缘高光，嵌套的常规舞台独立保留毛玻璃效果。',
    '开始按钮与开始菜单见“开始菜单”页：StartMenu 作为 Dock 的第一个子元素，随应用按钮组一起居中；要让整组靠左，给 Desktop 设置 dockAlign="left"（默认 center），右侧仍会为托盘留白。',
  ],
  demos: [
    {
      title: '应用区与系统区',
      code: `${dockDemoCode}

<Desktop dockStyle="windows">
  <MenuBar
    left={<MenuBarApp>桌面</MenuBarApp>}
    right={<MenuBarClock date="11月4日 周三" time="14:30" />}
  />
  <DockDemo />
</Desktop>`,
      description: '点击应用图标切换运行状态，左右区域展示应用名称与时钟。',
      layout: 'stage',
      stage: { dockStyle: 'windows', wallpaper: 'aurora' },
      render: () => (
        <>
          <MenuBar left={<MenuBarApp>桌面</MenuBarApp>} right={<MenuBarClock date="11月4日 周三" time="14:30" />} />
          <DockDemo />
        </>
      ),
    },
  ],
};

export const appIconDoc: ComponentDoc = {
  name: { 'zh-CN': '应用图标', 'en-US': 'App icon' },
  summary: {
    'zh-CN': '统一的应用与桌面图标，通过显示模式提供纯图形或带名称的桌面入口，共用亮度、外框、内部图形尺寸与笔画配置。',
    'en-US': 'Unified app and desktop icon; display modes provide a pure graphic or a named desktop entry, sharing brightness, frame, inner glyph sizing, and stroke configuration.',
  },
  usage: [
    '统一使用 AppIcon。variant="graphic" 是默认装饰图形，用于程序坞、通知等；variant="desktop" 增加名称、选中和打开行为，必须提供 label。',
    'size 调整外框尺寸，iconSize 单独调整中间图形的像素尺寸（优先于 symbolScale）；symbolScale 按倍数整体缩放内部图形，默认 1 相当于外框 50%，图片始终占满。strokeWidth 调整 lucide 笔画，默认 1.8，单位是 SVG viewBox 单位。',
    '图形模式与桌面模式默认都是原色 1（与原站一致）；brightness=1 为原色，0 为黑色，大于 1 提亮。只调整图形区域，桌面名称和选中态不受亮度影响。',
    '桌面图标选中时使用半透明底色和加粗名称，无白色描边或内侧高光。',
    'appGradients 前 8 组是原站各应用的配色，其后的 cyan、teal、amber、violet、brown、graphite 是补充色，供应用较多的新页面区分；shadow="tinted" 把中性阴影换成与背景同色的柔和阴影，属于可选项，已迁移页面不默认启用。',
    '图形优先级为非空 children > image > icon > glyph。icon 使用图库注册的名称；color 支持可信纯色或渐变；图片默认白色底板，transparent 去除底板与圆角。',
    '内部图形限制在外框内，字符字号至少 12px。负的亮度、内部尺寸和笔画按 0 处理，非有限数值回退默认；外框正值最小 24px，无效值跟随容器。',
    '桌面模式放在 DesktopArea / DesktopIcons 中，selected、onSelect、onOpen 由宿主控制，仍不含网格位置记忆、拖拽或框选。',
    '图片地址和背景由宿主提供可信资源，上传、配置存储与应用打开均由宿主处理。',
  ],
  demos: [
    {
      title: '纯图形与独立尺寸',
      description: '外框相同，内部图形大小与笔画可以分别设置，也可按倍数整体缩放。',
      code: `<AppIcon icon="book-open" color={appGradients.blue} size={56} iconSize={24} strokeWidth={1} />
<AppIcon icon="book-open" color={appGradients.blue} size={56} iconSize={36} strokeWidth={2.5} />
<AppIcon icon="book-open" color={appGradients.blue} size={56} symbolScale={0.7} />
<AppIcon glyph="▦" color={appGradients.orange} size={56} symbolScale={1.3} />`,
      render: () => (
        <>
          <AppIcon icon="book-open" color={appGradients.blue} size={56} iconSize={24} strokeWidth={1} />
          <AppIcon icon="book-open" color={appGradients.blue} size={56} iconSize={36} strokeWidth={2.5} />
          <AppIcon icon="book-open" color={appGradients.blue} size={56} symbolScale={0.7} />
          <AppIcon glyph="▦" color={appGradients.orange} size={56} symbolScale={1.3} />
        </>
      ),
    },
    {
      title: '自由调节',
      description: '切换显示模式、图形、背景、亮度、外框和内部图形大小；矢量图标还可调整笔画粗细。',
      layout: 'stack',
      code: appIconDemoSource,
      render: () => <AppIconDemo />,
    },
  ],
  api: [
    {
      component: 'AppIcon',
      props: [
        {
          name: 'variant',
          type: "'graphic' | 'desktop'",
          default: "'graphic'",
          description: '同一个组件的纯图形 / 桌面入口模式。',
        },
        {
          name: 'icon / glyph / image',
          type: 'IconName / string / string',
          description: '矢量图标、字符或可信图片地址。',
        },
        {
          name: 'color / transparent',
          type: 'string / boolean',
          description: '纯色 / 渐变背景，默认 appGradients.slate；transparent 只用于图片。',
        },
        {
          name: 'size',
          type: 'number',
          default: '容器尺寸或 56',
          description: '外框像素尺寸，正值最小 24；桌面点击区随外框调整。',
        },
        {
          name: 'iconSize',
          type: 'number',
          default: '图标 50% / 图片 100%',
          description: '内部图形像素尺寸，限制在外框内；字符字体最小 12px。',
        },
        {
          name: 'symbolScale',
          type: 'number',
          default: '1',
          description: '内部图形相对默认尺寸（底板 50%）的缩放倍数，正数有效；与 iconSize 同用时 iconSize 优先。',
        },
        {
          name: 'strokeWidth',
          type: 'number',
          default: '1.8',
          description: 'lucide 笔画宽度（SVG 单位），只影响矢量图标，0 可隐藏笔画。',
        },
        {
          name: 'brightness',
          type: 'number',
          default: '1',
          description: '非负亮度系数，默认原色以匹配原站；小于 1 压暗，大于 1 提亮。',
        },
        {
          name: 'shadow',
          type: "'default' | 'tinted'",
          default: "'default'",
          description:
            'tinted 取背景渐变末端的十六进制色（或 shadowColor）做同色柔和阴影；图片图标没有 shadowColor 时保持默认阴影。',
        },
        {
          name: 'shadowColor',
          type: 'string',
          description: 'tinted 阴影的颜色，用于图片图标或不含十六进制色值的背景；透明底板的图片用同色投影。',
        },
        {
          name: 'label / selected / onSelect / onOpen',
          type: 'string / boolean / () => void / () => void',
          description: '桌面模式使用；label 必填，单击选择，双击或 Enter / Space 打开。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '可选，非交互的自定义图形优先；自定义内容的尺寸与笔画由内容自身响应。',
        },
        {
          name: '…div 属性',
          type: "ComponentProps<'div'>",
          description: '透传 ref、className、style 和原生事件；桌面事件 preventDefault 可接管默认动作。',
        },
      ],
    },
  ],
  a11y: [
    '纯图形为装饰内容，由外层控件提供名称；桌面模式必须提供 label，aria-pressed 表达选中态，键盘聚焦使用强调色焦点环。',
    '亮度限于图形，名称始终至少 12px；强制颜色模式不应用滤镜，自定义 children 不放交互控件。',
  ],
};

export const windowDoc: ComponentDoc = {
  name: { 'zh-CN': '窗口', 'en-US': 'Window' },
  summary: {
    'zh-CN': '桌面窗口：标题栏（拖动、双击最大化）、内容区和三向缩放。标题栏控件按平台切换——macOS 为左侧红黄绿圆点，Windows 为右侧矩形按钮。',
    'en-US': 'Desktop window: title bar (drag, double-click to maximize), content area, and three-side resizing; title-bar controls switch by platform, with macOS traffic lights on the left and Windows rectangles on the right.',
  },
  usage: [
    '放在 DesktopArea 内；位置、尺寸、层级和最大化 / 最小化状态由调用方保存，Window 只回调 onGeometryChange。',
    '平台样式由 Desktop 的 windowPlatform 决定（缺省跟随 dockStyle）；独立展示完整标题栏用 WindowTitlebar，WindowControls 只提供按钮本身。',
    'active 控制焦点窗口：非焦点窗口标题变灰、阴影变浅；点击窗口任意位置触发 onFocus。',
    '最小化通过 minimized 隐藏并保留内容；最大化铺满 DesktopArea，再按 --ds-maximize-inset 预留底部空间。任务栏已在 DesktopArea 外占位时设为 0，避免重复扣减高度。',
    '迁移站把普通矩形、层级、最小化 / 最大化及活动窗口保存到按账号和标签页隔离的服务端工作区。恢复时重新校验授权并适配当前屏幕，恢复期间的新打开、移动和关闭优先。示例按钮只在内存中演示布局记录与恢复。',
    '应用间跳转由迁移宿主的 openApp / canOpenApp 和 appWindows 目录管理；已有单例恢复焦点并接收非空启动参数。窗口组件不识别应用 ID、不保存参数或私有草稿。',
    '扩展应用窗口沿原站 SDK 显式提交恢复状态，每个窗口最多 512 KiB JSON 对象或 null。宿主按窗口恢复标识隔离状态、标题和关闭操作，锁屏、撤权和刷新后取消旧请求；紧凑桌面卡片不获得窗口能力。这些接线由迁移宿主负责，不读取 iframe DOM。',
    '默认由窗口体滚动；子内容已管理滚动时设置 scrollable=false，窗口体纵向排列并横向拉伸子布局，将滚动交给正文和侧栏，避免双滚动条。',
  ],
  demos: [
    {
      title: '拖动、缩放、最大化',
      code: `<Window title="示例窗口" geometry={geometry} onGeometryChange={setGeometry}
  maximized={maximized} onToggleMaximize={…} onClose={…}>
  内容
</Window>`,
      layout: 'stage',
      render: () => <WindowDemo />,
    },
    {
      title: 'Windows 标题栏',
      code: `<Desktop windowPlatform="windows">…</Desktop>`,
      layout: 'stage',
      stage: { dockStyle: 'macos', windowPlatform: 'windows', wallpaper: 'dusk' },
      render: () => <WindowDemo />,
    },
    {
      title: '标题栏控件',
      description: 'macOS 控件位于左侧，Windows 控件位于右侧；两个示例不受外层文档窗口的平台影响。',
      code: `<WindowTitlebar title="macOS 标题栏" platform="macos" />
<WindowTitlebar title="Windows 标题栏" platform="windows" />`,
      layout: 'stack',
      render: () => (
        <>
          <WindowTitlebar title="macOS 标题栏" platform="macos" />
          <WindowTitlebar title="Windows 标题栏" platform="windows" />
        </>
      ),
    },
  ],
  api: [
    {
      component: 'Window',
      props: [
        {
          name: 'scrollable',
          type: 'boolean',
          default: 'true',
          description: '设为 false 时窗口体固定，由内部布局管理滚动。文档窗口使用该模式。',
        },
        { name: 'title', type: 'string', description: '必填，标题。' },
        { name: 'geometry', type: 'WindowGeometry', description: '必填，{ x, y, width, height }。' },
        { name: 'onGeometryChange', type: '(next) => void', description: '拖动 / 缩放回调。' },
        { name: 'active / maximized / minimized', type: 'boolean', description: '焦点、最大化、最小化状态。' },
        {
          name: 'embedded',
          type: 'boolean',
          default: 'false',
          description: '嵌入模式：无标题栏与缩放手柄，铺满定位容器；用于管理后台外框，切换时内容不重挂。',
        },
        {
          name: 'titlebarControls / titlebarActions',
          type: 'readonly WindowAction[] / ReactNode',
          description: '筛选标题栏控件，并在标题栏另一侧放置宿主操作。',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: '应用图标；Windows 标题栏在标题前显示，macOS 标题栏不渲染。',
        },
        {
          name: 'zIndex / minWidth / minHeight',
          type: 'number',
          default: '360 / 240',
          description: '层级与最小尺寸。',
        },
        { name: 'onFocus / onClose / onMinimize / onToggleMaximize', type: '() => void', description: '窗口事件。' },
      ],
    },
    {
      component: 'WindowControls',
      props: [
        { name: 'platform', type: "'macos' | 'windows'", description: '缺省取 Desktop 的配置。' },
        { name: 'maximized', type: 'boolean', description: '最大化图标切换。' },
        {
          name: 'controls',
          type: "readonly ('close' | 'minimize' | 'maximize')[]",
          description: '可选，仅显示指定控件；仍按平台布局排序，省略时显示全部。',
        },
      ],
    },
  ],
  a11y: [
    '窗口为 role="dialog" 并以标题命名，最小化时 aria-hidden。',
    '控件为原生按钮，带中文 aria-label；最大化按钮用 aria-pressed 表达状态。',
    '拖动使用指针捕获，触屏与鼠标一致。',
  ],
};

export const windowTitlebarDoc: ComponentDoc = {
  name: { 'zh-CN': '窗口标题栏', 'en-US': 'Window titlebar' },
  summary: {
    'zh-CN': '窗口与独立示例共用的完整标题栏，可按需显示关闭、最小化和最大化按钮。',
    'en-US': 'Complete title bar shared by windows and standalone examples, with close, minimize, and maximize buttons shown as needed.',
  },
  usage: [
    'macOS 按钮在左侧、标题居中；Windows 标题在左侧、按钮在右侧。',
    'platform 显式指定时优先采用指定值，省略时读取最近的 Desktop；布局只由当前标题栏决定。',
    'controls 可筛选显示的按钮，剩余按钮仍按当前平台的顺序和位置排列；省略时显示全部。',
    '按钮保留原站 `data-window-action` 标记，避免嵌在应用内容中时被业务按钮的基础样式覆盖。',
    '控件保留原站 `window-controls`、`t-close` / `t-min` / `t-max` 与 `xyz-icon` 选择器，同时保留 `ds-*` 组件类，便于迁移页继续使用原生窗口 CSS。',
    '原生模板需要 header 根标签时传 as="header"；控件与标题仍是直接子节点，不增加包装层。',
    'actions 插槽放置标题栏另一侧的宿主操作；点击或双击操作区不会移动或最大化窗口。',
    '控件动作通过回调交给调用方；移动和双击行为通过原生事件接入，标题栏本身不保存窗口位置或状态。',
  ],
  demos: [
    {
      title: 'macOS：按钮在左',
      code: `<WindowTitlebar title="macOS 标题栏" platform="macos" />`,
      layout: 'stack',
      render: () => <WindowTitlebar title="macOS 标题栏" platform="macos" />,
    },
    {
      title: 'Windows：按钮在右',
      code: `<WindowTitlebar title="Windows 标题栏" platform="windows" />`,
      layout: 'stack',
      render: () => <WindowTitlebar title="Windows 标题栏" platform="windows" />,
    },
    {
      title: '只显示关闭按钮',
      description: '收藏夹等应用弹窗可以只保留关闭控件，标题栏外观继续与应用窗口一致。',
      code: `<WindowTitlebar title="导入收藏夹" controls={['close']} onClose={close} />`,
      layout: 'stack',
      render: () => <WindowTitlebar title="导入收藏夹" controls={['close']} />,
    },
    {
      title: '保留原生 header 根节点',
      code: `<WindowTitlebar as="header" title="智能补全" controls={['close']} />`,
      layout: 'stack',
      render: () => <WindowTitlebar as="header" title="智能补全" controls={['close']} />,
    },
  ],
  api: [
    {
      component: 'WindowTitlebar',
      props: [
        { name: 'title', type: 'string', description: '必填，窗口标题，长标题按原生样式省略。' },
        {
          name: 'as',
          type: "'div' | 'header'",
          default: "'div'",
          description: '选择根标签以保留原生标题栏 DOM 语义。',
        },
        {
          name: 'platform',
          type: "'macos' | 'windows'",
          description: '省略时取最近 Desktop 的窗口平台，显式值可用于独立预览。',
        },
        { name: 'maximized', type: 'boolean', default: 'false', description: '切换最大化 / 还原图标与无障碍名称。' },
        {
          name: 'controls',
          type: "readonly ('close' | 'minimize' | 'maximize')[]",
          description: '仅显示列出的控件，仍按平台排序；省略时显示全部。',
        },
        { name: 'actions', type: 'ReactNode', description: '可选的标题栏操作区，与平台控件分列两侧。' },
        {
          name: 'titleId',
          type: 'string',
          description: '标题文字元素的 id。对话框用 aria-labelledby 引用它，名称只含标题，不并入窗口控件。',
        },
        { name: 'onClose / onMinimize / onToggleMaximize', type: '() => void', description: '窗口动作回调。' },
        {
          name: '…div 属性',
          type: '原生 div 属性',
          description: 'onPointerDown / onDoubleClick / className / ref 等透传。',
        },
      ],
    },
  ],
  a11y: [
    '动作按钮保留中文可访问名称、键盘操作与焦点环；最大化按钮以 aria-pressed 表达状态。',
    '筛选控件后仍保留平台布局；左右布局与平台一致，标题省略不会隐藏按钮。',
  ],
};

export const popoverDoc: ComponentDoc = {
  name: { 'zh-CN': '弹出层', 'en-US': 'Popover' },
  summary: {
    'zh-CN': '系统菜单、控制中心和日历共用的玻璃面板，基于公共锚点层管理位置与焦点，并随所在 Desktop 的 cardStyle 切换毛玻璃或液态玻璃材质。',
    'en-US':
      'Glass panel shared by the system menu, control center, and calendar, positioned and focused through the shared anchor layer and switching between frosted and liquid finishes via the enclosing Desktop cardStyle.',
  },
  usage: [
    'anchor 传入触发按钮引用，align 控制首尾对齐；variant 选择普通菜单、原站系统菜单、控制中心或日历。',
    '触发器提供 aria-haspopup / aria-expanded，键盘 Enter / Space 可打开。菜单打开后聚焦第一项。',
    '菜单项执行后请求关闭；event.preventDefault 可保留菜单。外部点击、焦点移出、滚动和 Esc 关闭。',
  ],
  demos: [
    {
      title: '动作与键盘导航',
      description: '点击按钮或在示例区域右键打开操作菜单。',
      code: menuDemoSource,
      layout: 'stage',
      render: () => <PopoverDemo />,
    },
  ],
  api: [
    {
      component: 'Popover',
      props: [
        {
          name: 'open / anchor',
          type: 'boolean / RefObject<HTMLElement | null>',
          description: '必填，显示状态与触发器。',
        },
        { name: 'align', type: "'left' | 'right'", default: "'left'", description: '锚点首端 / 尾端对齐。' },
        {
          name: 'initialFocus',
          type: "'first' | 'last'",
          default: "'first'",
          description: '初始焦点位置，菜单按钮的向上键入口使用末项。',
        },
        {
          name: 'variant',
          type: "'menu' | 'system' | 'control' | 'calendar'",
          default: "'menu'",
          description: 'system 保留菜单键盘语义，使用原站强调色悬停与 4px 锚点间距；其余为普通菜单或内容面板。',
        },
        { name: 'onClose', type: '() => void', description: '请求关闭，宿主更新 open。' },
      ],
    },
  ],
  a11y: [
    '单层菜单支持上下方向键、Home / End、文字前缀匹配、Enter / Space；跳过禁用项。',
    'Esc 返回触发器，焦点移出关闭且保留新焦点；控制中心和日历使用 dialog 语义，保留自身控件键盘。',
  ],
};

export const menuItemDoc: ComponentDoc = {
  name: { 'zh-CN': '菜单项', 'en-US': 'Menu item' },
  summary: {
    'zh-CN': '动作菜单中的单行按钮，统一图标、柔和选中、焦点和禁用外观。',
    'en-US': 'Single-row button in action menus with unified icon, soft selection, focus, and disabled looks.',
  },
  usage: [
    '放在菜单类型的 Popover 中，动作由 onClick 回调，不执行请求。',
    '以 MenuSeparator 分组，disabled 项跳过键盘导航。复杂内容可提供 textValue 用于前缀搜索。',
    '多级分支使用「右键菜单」页中的 ContextMenuSubmenu。就地表单使用 AnchorPopover。',
  ],
  demos: [
    {
      title: '操作与禁用项',
      description: '点击按钮或在示例区域右键打开操作菜单，选中后下方显示结果。',
      code: menuDemoSource,
      layout: 'stage',
      render: () => <PopoverDemo />,
    },
  ],
  api: [
    {
      component: 'MenuItem',
      props: [
        { name: 'icon / textValue', type: 'IconName / string', description: '图标与键盘搜索文字，默认读取内容。' },
        {
          name: 'children / disabled / onClick',
          type: '原生 button 属性',
          description: '名称、禁用与动作；阻止默认事件可保留菜单。',
        },
      ],
    },
    { component: 'MenuSeparator', props: [] },
  ],
  a11y: ['原生按钮的 Enter / Space 激活，容器负责方向键与初始焦点。', 'menuitem 不进入普通 Tab 顺序，Tab 离开菜单。'],
};

export const contextMenuDoc: ComponentDoc = {
  name: { 'zh-CN': '右键菜单', 'en-US': 'Context menu' },
  summary: { 'zh-CN': '支持多级子菜单、勾选和快捷键提示的桌面右键菜单。', 'en-US': 'Desktop context menu with nested submenus, checks, and shortcut hints.' },
  usage: [
    '迁移桌面和文档桌面共用原站的半透明菜单底板、中性悬停和右侧勾选；位于 cardStyle="liquid" 的 Desktop 内时切换为高透液态玻璃底板与高光悬停。',
    'x / y 直接使用右键事件 clientX / clientY；无需相减桌面坐标或自行估算菜单尺寸。',
    '用 ContextMenuSubmenu 嵌套菜单项。悬停或点击均可展开，同一级只展开一个分支。移过普通项时可继续进入已展开的子菜单。',
    '子菜单默认在右侧展开，空间不足时向左翻转。',
    '动作执行后请求关闭整组菜单，preventDefault 可保留。快捷键提示由宿主注册。',
  ],
  demos: [
    {
      title: '多级桌面菜单',
      description: '右键打开菜单，试试「查看 → 图标大小」或「桌面背景」的壁纸缩略图。',
      code: menuDemoSource,
      layout: 'stage',
      render: () => <ContextDemo />,
    },
  ],
  api: [
    {
      component: 'ContextMenu',
      props: [
        { name: 'x / y', type: 'number', description: '必填，视口像素坐标。' },
        { name: 'onClose', type: '() => void', description: '关闭整组菜单的请求。' },
      ],
    },
    {
      component: 'ContextMenuSubmenu',
      props: [
        { name: 'label / icon', type: 'string / IconName', description: '可见名称必填，图标可选。' },
        { name: 'disabled', type: 'boolean', description: '禁用该分支，不能展开。' },
        { name: 'children', type: 'ReactNode', description: '菜单项、分隔线或更深一层的子菜单。' },
      ],
    },
    {
      component: 'ContextMenuItem',
      props: [
        {
          name: 'icon / shortcut / textValue',
          type: 'IconName / string / string',
          description: '装饰图标、快捷键与前缀搜索文字。',
        },
        {
          name: 'wallpaper',
          type: 'WallpaperName',
          description: '在名称旁显示 36×24 的预设壁纸缩略图，辅助区分桌面背景。',
        },
        {
          name: 'checked / checkRole',
          type: "boolean / 'checkbox' | 'radio'",
          description: '传入 checked 时标注选中状态，互斥选项用 radio。',
        },
        { name: 'disabled / onClick', type: '原生 button 属性', description: '禁用与动作回调。' },
      ],
    },
  ],
  a11y: [
    '示例按钮支持 Enter、菜单键或 Shift + F10 打开。上下方向键、Home / End 与前缀搜索在当前层导航，跳过禁用项。',
    '右方向键或 Enter 进入子菜单，左方向键返回上一级。Tab 退出整组菜单，Esc 关闭并返回原焦点。',
  ],
};
export const notificationDoc: ComponentDoc = {
  name: { 'zh-CN': '通知', 'en-US': 'Notification' },
  summary: {
    'zh-CN': '系统通知卡片，固定在右上角堆叠，显示来源应用图标、标题和正文，点击可定位到来源。',
    'en-US': 'System notification card stacked at the top-right, showing the source app icon, title, and body; clicking locates the source.',
  },
  usage: [
    '来源应用用 app 属性传入 AppIcon 的参数。',
    '浮动形态有右侧滑入动画；自动消失与队列由宿主负责。',
    '内联形态用于 NotificationCenter，保留卡片内容但去掉背景滤镜、浮动阴影与入场动画；位于 cardStyle="liquid" 的 Desktop 内时，浮动通知与内联卡片底色同步适配液态玻璃变量。',
    '短暂的就地反馈用 Notice，跨应用的消息用 Notification；历史列表使用 NotificationCenter。',
  ],
  demos: [
    {
      title: '通知堆叠',
      code: `<NotificationStack>
  <Notification title="新消息" message="李明：设计稿已更新" app={{ icon: 'bell', color: appGradients.orange }} />
  <Notification title="令牌即将到期" message="“AI 工作助手”将在 3 天后失效" app={{ icon: 'key-round', color: appGradients.indigo }} />
</NotificationStack>`,
      layout: 'stage',
      render: () => (
        <NotificationStack>
          <Notification
            title="新消息"
            message="李明：设计稿已更新"
            app={{ icon: 'bell', color: appGradients.orange }}
          />
          <Notification
            title="令牌即将到期"
            message="“AI 工作助手”将在 3 天后失效"
            app={{ icon: 'key-round', color: appGradients.indigo }}
          />
        </NotificationStack>
      ),
    },
    {
      title: '内联卡片与禁用',
      layout: 'stack',
      code: '<Notification variant="inline" title="处理中的通知" message="稍后可以查看详情" disabled />',
      render: () => <Notification variant="inline" title="处理中的通知" message="稍后可以查看详情" disabled />,
    },
  ],
  api: [
    {
      component: 'Notification',
      props: [
        { name: 'title', type: 'string', description: '必填。' },
        { name: 'message', type: 'string', description: '正文。' },
        { name: 'app', type: 'AppIconGraphicProps', description: '来源应用的装饰图标。' },
        { name: 'onActivate', type: '() => void', description: '点击回调。' },
        {
          name: 'variant / disabled',
          type: 'toast | inline / boolean',
          default: 'toast / false',
          description: '浮动通知或通知中心使用的内联卡片，禁用保留原生按钮语义。',
        },
      ],
    },
  ],
  a11y: ['堆叠容器 aria-live="polite"，新通知会被读屏软件播报；通知本身是可聚焦按钮。'],
};
