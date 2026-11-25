import { useState } from 'react';
import {
  AppIcon,
  Dock,
  DockItem,
  MenuBar,
  MenuBarApp,
  MenuBarClock,
  StartMenu,
  appGradients,
  type StartMenuAction,
  type StartMenuItem,
} from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';

const apps = [
  { id: 'guide', label: '使用指南', icon: 'book-open', color: appGradients.blue },
  { id: 'forms', label: '表单', icon: 'text-cursor-input', color: appGradients.green },
  { id: 'layout', label: '布局', icon: 'layout-grid', color: appGradients.pink },
  { id: 'files', label: '文件管理', icon: 'folder', color: appGradients.orange },
  { id: 'chat', label: '聊天', icon: 'messages-square', color: appGradients.teal },
  { id: 'settings', label: '系统设置', icon: 'settings', color: appGradients.slate },
] as const;

const items: StartMenuItem[] = apps.map((app) => ({
  id: app.id,
  label: app.label,
  icon: <AppIcon icon={app.icon} color={app.color} />,
}));

function StartMenuDemo({ align }: { align: 'center' | 'left' }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const actions: StartMenuAction[] = [
    { id: 'settings', label: '系统设置', icon: 'settings', onSelect: () => setMessage('点击了系统设置') },
    { id: 'lock', label: '锁定屏幕', icon: 'key-round', onSelect: () => setMessage('点击了锁定屏幕') },
    { id: 'logout', label: '退出登录', icon: 'log-out', onSelect: () => setMessage('点击了退出登录') },
  ];
  return (
    <>
      <MenuBar
        left={<MenuBarApp>{message || '桌面'}</MenuBarApp>}
        right={<MenuBarClock date="11月12日 周四" time="14:30" />}
      />
      <Dock>
        <StartMenu
          open={open}
          onOpenChange={setOpen}
          align={align}
          items={items}
          onSelect={(id) => setMessage(`打开 ${apps.find((app) => app.id === id)?.label}`)}
          userName="小宇宙"
          actions={actions}
        />
        {apps.slice(0, 3).map((app) => (
          <DockItem key={app.id} label={app.label} running={app.id === 'guide'}>
            <AppIcon icon={app.icon} color={app.color} />
          </DockItem>
        ))}
      </Dock>
    </>
  );
}

const code = (align: string) => `const items = apps.map((app) => ({
  id: app.id,
  label: app.label,
  icon: <AppIcon icon={app.icon} color={app.color} />,
}));

<Desktop dockStyle="windows" dockAlign="${align}">
  <Dock>
    <StartMenu
      open={open}
      onOpenChange={setOpen}
      align="${align}"
      items={items}
      onSelect={openApp}
      userName="小宇宙"
      actions={[{ id: 'logout', label: '退出登录', icon: 'log-out', onSelect: logout }]}
    />
    {/* 其余 DockItem */}
  </Dock>
</Desktop>`;

export const startMenuDoc: ComponentDoc = {
  name: { 'zh-CN': '开始菜单', 'en-US': 'Start menu' },
  summary: {
    'zh-CN': 'Windows 任务栏的开始按钮与开始菜单：搜索框、按名称排序的应用列表和底部账号 / 电源入口（需要时可用 pinnedIds 增加“已固定”分区）。',
    'en-US': 'Windows taskbar start button and menu: search box, name-sorted app list, and bottom account / power entries (use pinnedIds to add a pinned section when needed).',
  },
  usage: [
    '放在 dockStyle="windows" 的 Desktop 中，作为 Dock 的第一个子元素；开始按钮与应用按钮同组，由 Desktop 的 dockAlign（center / left）决定整组居中或靠左，StartMenu 的 align 与它保持一致。',
    'items 是全部应用，icon 通常是 AppIcon，列表图标 28px（启用固定区时固定区 48px），由菜单设置 --ds-app-icon-size，不必再传 size。默认只显示应用列表；传 pinnedIds 才增加“已固定”网格分区。',
    'align 与任务栏应用按钮的对齐保持一致：center 时菜单位于屏幕水平中部，left 时距屏幕左侧 12px；菜单底边固定在任务栏上方 12px，高度取自 Desktop 的 --dock-space，不测量面板尺寸，因此不会压到任务栏。',
    '菜单用顶层 popover 渲染，位置以浏览器视口为准；文档站预览舞台里的菜单会出现在页面底部，而不是舞台内。',
    'actions 放底部的账号与电源入口（设置、锁定、退出等），选择后菜单自动关闭；选择应用、按 Esc 或点击菜单外部同样关闭，Esc 后焦点回到开始按钮。',
    '搜索按名称与 keywords 匹配，回车打开第一项；搜索时只显示结果，关闭菜单后清空搜索词。',
    '默认面板为半透明毛玻璃，所在 Desktop 设 cardStyle="liquid" 时切换为液态玻璃底板、高透模糊、斜向菲涅耳高光环与玻璃搜索胶囊；颜色全部取自主题令牌，开始图标用整数坐标与直角方块并取强调色。',
  ],
  demos: [
    {
      title: '居中（Windows 11 默认）',
      description: '点击开始按钮打开菜单；选择应用或底部入口后菜单关闭，菜单栏左侧显示结果。',
      layout: 'stage',
      stage: { dockStyle: 'windows', wallpaper: 'aurora' },
      code: code('center'),
      render: () => <StartMenuDemo align="center" />,
    },
    {
      title: '靠左',
      description: '应用按钮靠左时开始菜单也靠左弹出。',
      layout: 'stage',
      stage: { dockStyle: 'windows', dockAlign: 'left', wallpaper: 'dusk' },
      code: code('left'),
      render: () => <StartMenuDemo align="left" />,
    },
  ],
  api: [
    {
      component: 'StartMenu',
      props: [
        { name: 'open / onOpenChange', type: 'boolean / (open: boolean) => void', description: '必填，受控展开状态。' },
        { name: 'align', type: "'center' | 'left'", default: "'center'", description: '菜单的水平位置。' },
        { name: 'items', type: 'StartMenuItem[]', description: '必填，全部应用：id、label、icon、可选 keywords。' },
        {
          name: 'pinnedIds',
          type: 'string[]',
          description: '可选：固定区应用的 id 与顺序；缺省时不分区，只显示应用列表。',
        },
        { name: 'onSelect', type: '(id: string) => void', description: '必填，选择应用后触发，菜单随即关闭。' },
        { name: 'userName / avatarUrl', type: 'string', description: '底部账号栏的名称与头像，userName 必填。' },
        { name: 'actions', type: 'StartMenuAction[]', description: '底部入口：id、label、icon、onSelect。' },
        {
          name: 'labels',
          type: 'Partial<StartMenuLabels>',
          description: 'button / search / pinned / all / results / empty。',
        },
      ],
    },
    {
      component: 'StartButton',
      props: [{ name: 'active', type: 'boolean', description: '菜单展开时的按下态；其余属性同 button。' }],
    },
  ],
  a11y: [
    '开始按钮带 aria-haspopup="dialog" 与 aria-expanded；菜单是 role="dialog"，名称取 labels.button。',
    '打开后焦点进入搜索框，Tab 依次经过应用与底部入口；Esc 关闭并把焦点还给开始按钮。',
    '应用网格与列表都是带名称的 ul；无搜索结果时用 role="status" 提示。',
    '菜单入场动画在“减少动态效果”下关闭；强制颜色模式下开始按钮的展开态用高亮描边。',
  ],
};
