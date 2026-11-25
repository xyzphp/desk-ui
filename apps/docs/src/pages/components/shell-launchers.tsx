import type { ComponentDoc } from '../../blocks/types';
import { CommandPaletteDemo } from './CommandPaletteDemo';
import { LaunchpadDemo } from './LaunchpadDemo';
import commandSource from './CommandPaletteDemo.tsx?raw';
import launchSource from './LaunchpadDemo.tsx?raw';

export const commandPaletteDoc: ComponentDoc = {
  name: { 'zh-CN': '命令面板', 'en-US': 'Command palette' },
  summary: {
    'zh-CN': '可嵌入的命令搜索与执行列表，沿用公共搜索和浅色选中状态。',
    'en-US': 'Embeddable command search and execution list following the shared search and light selected state.',
  },
  usage: ['组件展示命令内容，不创建弹窗。宿主需要临时窗口时可组合 Modal；文档站搜索仍在侧栏直接筛选。',
    'items 使用稳定唯一 id，注入标题、说明、分组、快捷键和搜索别名；不内置业务动作或注册全局快捷键。',
    '查询支持受控 / 非受控，按名称、说明、分组和别名匹配，保留 NFKC / 大小写归一化与多关键词交集。',
    '加载时保留搜索草稿，冻结命令执行；禁用项仍展示但不参与键盘定位。执行和取消只触发宿主回调。'],
  demos: [{ title: '搜索、键盘执行与加载', layout: 'stack', code: commandSource, render: () => <CommandPaletteDemo /> }],
  api: [{ component: 'CommandPalette', props: [
    { name: 'label / items / onExecute', type: 'string / readonly CommandItem[] / (item) => void', description: '必填区域名称、命令快照与执行回调。' },
    { name: 'CommandItem', type: '{ id, label, description?, icon?, group?, shortcut?, keywords?, disabled? }', description: '命令文字与装饰信息，快捷键仅展示。' },
    { name: 'query / defaultQuery / onQueryChange', type: 'string / string / (query) => void', default: '— / 空串 / —', description: '搜索值，不联网或持久化。' },
    { name: 'loading / disabled / error / onCancel', type: 'boolean / boolean / string / () => void', description: '加载、禁用、宿主错误与可选取消回调。' },
    { name: 'labels / …section 属性', type: 'Partial<CommandPaletteLabels> / ComponentProps<section>', description: '默认文案、ref、className、style 与原生事件。' },
  ] }],
  a11y: ['输入使用 combobox / listbox / aria-activedescendant，方向键定位、Enter 执行，禁用项跳过；焦点留在输入框。',
    'Home / End 保留文本编辑，Esc 在提供 onCancel 时回调；输入法组合回车不执行。鼠标点击与键盘各只执行一次。'],
};

export const launchpadDoc: ComponentDoc = {
  name: { 'zh-CN': '应用启动器', 'en-US': 'Launchpad' },
  summary: { 'zh-CN': '组合公共搜索与 AppIcon 展示应用网格，支持鼠标和键盘启动。', 'en-US': 'App grid combining shared search and AppIcon, launchable by mouse and keyboard.' },
  usage: ['宿主只提供当前账号已授权的应用清单、图标和启动回调；组件不读取系统注册表或绕过应用鉴权。',
    '图形复用 AppIcon，底板亮度、内部图标大小和笔画沿用同一套属性，不另建桌面图标实现。',
    'columns 为 1～8 列，默认四列；宿主可按容器设置列数，方向键上下按列移动。',
    '查询支持受控 / 非受控，名称、说明和别名参与匹配；空结果展示公共空态，不打开搜索弹窗。'],
  demos: [{ title: '应用搜索与启动回调', layout: 'stack', code: launchSource, render: () => <LaunchpadDemo /> }],
  api: [{ component: 'Launchpad', props: [
    { name: 'label / items / onLaunch', type: 'string / readonly LaunchpadItem[] / (item) => void', description: '区域名称、应用目录与启动回调。' },
    { name: 'LaunchpadItem', type: '{ id, name, description?, app?, keywords?, disabled? }', description: 'app 复用 AppIconAppearance，URL 和应用授权由宿主负责。' },
    { name: 'query / defaultQuery / onQueryChange', type: 'string / string / (query) => void', description: '搜索状态，默认空串。' },
    { name: 'columns / disabled / labels', type: 'number / boolean / Partial<LaunchpadLabels>', default: '4 / false / 中文', description: '列数、整体禁用与文案。' },
    { name: '…section 属性', type: 'ComponentProps<section>', description: 'ref、className、style 与原生事件。' },
  ] }],
  a11y: ['应用是原生 button，同组一个 Tab 入口；方向键、Home / End 定位，Enter / Space 启动，禁用项跳过。',
    '搜索与应用列表分别命名，图标是装饰，应用名称始终可读；组件不抢占全局快捷键。'],
};
