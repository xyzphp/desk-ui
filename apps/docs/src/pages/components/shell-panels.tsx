import type { ComponentDoc } from '../../blocks/types';
import { NotificationCenterDemo } from './NotificationCenterDemo';
import { WindowSwitcherDemo } from './WindowSwitcherDemo';
import notificationSource from './NotificationCenterDemo.tsx?raw';
import windowSource from './WindowSwitcherDemo.tsx?raw';

export const notificationCenterDoc: ComponentDoc = {
  name: { 'zh-CN': '通知中心', 'en-US': 'Notification center' },
  summary: {
    'zh-CN': '展示宿主管理的通知历史，提供未读筛选、定位、已读与移除操作。',
    'en-US': 'Shows the host-managed notification history with unread filtering, locating, read, and remove actions.',
  },
  usage: ['items 由宿主维护，复用 Toast 的 id / title / message / tone 字段；临时 Toast 队列不等于持久通知历史。',
    '顺序、时间文字和未读状态由宿主提供，不自动排序、到期删除或把激活操作自动记为已读。',
    '操作只回调；单条已读、移除和批量入口在提供对应回调时才出现，数据变化后才更新视图。',
    '通知卡片复用 Notification 的 inline 形态，取消浮动通知的背景滤镜、阴影和入场动画，保持公共文字 / 图标布局。',
    '忙碌禁用内部操作；锁屏、退出和账号切换时由宿主卸载或清空私密历史，不读写浏览器存储。'],
  demos: [{ title: '未读筛选、已读与移除', layout: 'stack', code: notificationSource, render: () => <NotificationCenterDemo /> }],
  api: [{ component: 'NotificationCenter', props: [
    { name: 'label / items / onActivate', type: 'string / readonly NotificationCenterItem[] / (item) => void', description: '区域名称、历史快照与定位来源回调。' },
    { name: 'NotificationCenterItem', type: '{ id, title, message?, tone?, unread?, time?, dateTime?, app?, disabled? }', description: '时间和图标由宿主提供。' },
    { name: 'onMarkRead / onDismiss', type: '(id: string) => void', description: '单条操作，不自动修改传入数组。' },
    { name: 'onMarkAllRead / onClear', type: '() => void', description: '可选批量回调，是否需要确认由宿主决定。' },
    { name: 'busy / labels / …section 属性', type: 'boolean / Partial<NotificationCenterLabels> / ComponentProps<section>', description: '忙碌、默认文案、ref 与原生属性。' },
  ] }],
  a11y: ['筛选使用具名原生按钮和 aria-pressed，计数通过 status 更新，历史列表不使用逐条实时播报。',
    '移除和未读视图里的已读操作后尝试聚焦相邻入口；已移到其他控件时不抢回。忙碌焦点复用公共 hook。'],
};

export const windowSwitcherDoc: ComponentDoc = {
  name: { 'zh-CN': '窗口切换器', 'en-US': 'Window switcher' },
  summary: {
    'zh-CN': '展示受控窗口目录、预览和状态，提供键盘定位及激活回调。',
    'en-US': 'Shows a controlled window directory with previews and status, offering keyboard locating and activation callbacks.',
  },
  usage: ['宿主提供已授权窗口列表、当前窗口 id 和激活回调，组件不操作真实窗口或替代工作区恢复。',
    '预览是宿主提供的 React 内容，组件不抓屏；只应传入当前用户可见的内容，并在锁屏 / 登出时清空。',
    '预览与操作按钮是同级节点，预览 inert 且对辅助技术隐藏，不允许操作预览中的表单或链接。',
    '最小化 / 当前状态只展示，宿主在 onActivate 中决定恢复、置顶或关闭选择器；本组件不自动隐藏。',
    '不注册全局 Alt+Tab，不拦截操作系统快捷键；可作为内容嵌入宿主管理的 Modal 或其他容器。'],
  demos: [{ title: '窗口预览、键盘定位与切换', layout: 'stack', code: windowSource, render: () => <WindowSwitcherDemo /> }],
  api: [{ component: 'WindowSwitcher', props: [
    { name: 'label / items / onActivate', type: 'string / readonly WindowSwitcherItem[] / (item) => void', description: '区域名称、窗口快照与激活回调。' },
    { name: 'WindowSwitcherItem', type: '{ id, title, app?, preview?, minimized?, disabled? }', description: '稳定 id、标题、AppIcon 属性、预览和状态。' },
    { name: 'currentId / onCancel / disabled', type: 'string / () => void / boolean', description: '当前窗口、可选取消回调与整体禁用。' },
    { name: 'labels / …section 属性', type: 'Partial<WindowSwitcherLabels> / ComponentProps<section>', description: '默认文案、ref、className、style 与原生事件。' },
  ] }],
  a11y: ['当前窗口使用 aria-pressed，最小化状态同时有文字；所有操作是原生 button。',
    '同组一个 Tab 入口，方向键和 Home / End 定位，Enter / Space 激活，Esc 请求取消；不自动抢焦点或形成模态陷阱。'],
};
