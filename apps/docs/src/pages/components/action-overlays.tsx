import type { ComponentDoc } from '../../blocks/types';
import { DropdownMenuDemo } from './DropdownMenuDemo';
import { PopconfirmDemo } from './PopconfirmDemo';
import menuSource from './DropdownMenuDemo.tsx?raw';
import confirmSource from './PopconfirmDemo.tsx?raw';

export const dropdownMenuDoc: ComponentDoc = {
  name: { 'zh-CN': '菜单按钮', 'en-US': 'Menu button' },
  summary: {
    'zh-CN': '将普通操作按钮与已有菜单组合，统一展开、键盘导航与关闭后的焦点。',
    'en-US': 'Combines regular action buttons with existing menus for unified open, keyboard navigation, and focus restoration after close.',
  },
  usage: ['children 使用 MenuItem / MenuSeparator；不要在菜单里放输入表单，表单浮层使用 AnchorPopover。',
    '点击动作后自动关闭；动作事件 preventDefault 可保留菜单，受控 open 由宿主响应 onOpenChange。',
    '常用操作直接使用 Button，多个次要动作再合并为菜单；是否允许执行仍由宿主权限与状态控制。'],
  demos: [{ title: '动作、禁用和保持展开', layout: 'stack', code: menuSource, render: () => <DropdownMenuDemo /> }],
  api: [{ component: 'DropdownMenu', props: [
    { name: 'label / children', type: 'string / ReactNode', description: '触发器与菜单名称，以及现有菜单子项。' },
    { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', default: '— / false / —', description: '受控 / 非受控展开状态。' },
    { name: 'align', type: 'left | right', default: 'left', description: '相对按钮对齐，越界翻转与收敛复用公共浮层。' },
    { name: '…Button 属性', type: 'ButtonProps', description: '图标、尺寸、样式、disabled、事件与原生按钮 ref。' },
  ] }],
  a11y: ['触发器是命名按钮，声明 aria-haspopup=menu、expanded 与 controls；子项使用 menuitem。',
    'Enter / Space 打开，向下键打开首项，向上键打开末项；菜单内上下键、Home / End 和前缀搜索复用现有菜单逻辑。',
    'Esc 返回按钮；Tab 离开菜单，点击外部或外部滚动关闭；禁用项跳过。'],
};
export const popconfirmDoc: ComponentDoc = {
  name: { 'zh-CN': '气泡确认', 'en-US': 'Popconfirm' },
  summary: {
    'zh-CN': '紧邻触发按钮的轻量确认面板，复用公共浮层并提供忙碌与失败反馈。',
    'en-US': 'Lightweight confirmation panel anchored to the trigger button, reusing the shared overlay with busy and failure feedback.',
  },
  usage: ['适用于局部、简短操作确认；需要隔离背景或复杂表单时使用 ConfirmDialog / Modal。',
    'open 必须受控，onConfirm 只通知宿主；宿主负责请求、重复提交、busy、error，并在成功后关闭。',
    '忙碌时动作按钮禁用，忽略取消、外部点击和 Esc；失败保留面板与错误，允许重试。',
    '组件不请求、不保存数据，不把非模态面板当作权限或数据安全边界。'],
  demos: [{ title: '确认、等待与失败重试', layout: 'stack', code: confirmSource, render: () => <PopconfirmDemo /> }],
  api: [{ component: 'Popconfirm', props: [
    { name: 'label / title / description', type: 'string / string / ReactNode', description: '按钮名称、确认标题与可选说明。' },
    { name: 'open / onOpenChange', type: 'boolean / (open) => void', description: '必需的受控展开状态与关闭请求。' },
    { name: 'onConfirm / onCancel', type: '() => void', description: '确认通知；取消、Esc 或点击外部时回调取消（busy 除外）。' },
    { name: 'busy / error / danger', type: 'boolean / string / boolean', default: 'false / — / false', description: '忙碌锁定、可见错误和确认动作危险色。' },
    { name: 'labels', type: 'Partial<PopconfirmLabels>', description: '确定 / 取消 / 处理中，读取 ConfigProvider。' },
    { name: '…Button 属性', type: 'ButtonProps', description: '触发器外观、disabled、事件和原生按钮 ref。' },
  ] }],
  a11y: ['使用命名的非模态 dialog，默认聚焦取消；标题与说明关联面板，错误使用 alert。',
    'Esc、焦点离开、外部点击或外部滚动请求关闭；取消 / 键盘关闭返回触发器，外部点击保留外部焦点。',
    'busy 期间焦点保留在面板，结束后恢复取消入口；不锁定背景焦点。'],
};
