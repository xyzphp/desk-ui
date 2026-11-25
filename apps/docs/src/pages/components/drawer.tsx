import type { ComponentDoc } from '../../blocks/types';
import { DrawerDemo } from './DrawerDemo';
import source from './DrawerDemo.tsx?raw';

export const drawerDoc: ComponentDoc = {
  name: { 'zh-CN': '抽屉', 'en-US': 'Drawer' },
  summary: {
    'zh-CN': '从四边进入的模态详情面板，正文独立滚动，标题和底部操作共用模态组件。',
    'en-US': 'Modal detail panel entering from any of the four edges, with independently scrolling body and shared modal title and footer actions.',
  },
  usage: ['与 Modal 共用 DialogSurface；默认从右侧打开，点击背景或 Esc 只请求 onCancel，宿主更新 open。',
    'busy 禁用内部原生控件并阻止取消，失败内容通过插槽保留并反馈。组件不执行请求或自动保存。',
    '关闭时卸载内容，可恢复草稿应放在宿主状态；包含尚未确认的标签草稿时同时控制 TagInput.inputValue。',
    '窄视口最大占满可用宽高，普通就地操作仍优先非模态面板；不提供抽屉业务权限。'],
  demos: [{ title: '四边位置、草稿与忙碌反馈', layout: 'stack', code: source, render: () => <DrawerDemo /> }],
  api: [{ component: 'Drawer', props: [
    { name: 'open / title / children / footer', type: 'boolean / ReactNode', description: '受控显示、标题、正文与底部动作。' },
    { name: 'placement', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: '进入方向。' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '侧边宽度或上下高度：320 / 420 / 640px，受视口限制。' },
    { name: 'onCancel / closeOnBackdrop / busy', type: '() => void / boolean / boolean', default: '— / true / false', description: '取消请求、背景关闭和忙碌状态。' },
    { name: 'initialFocus / labels', type: 'RefObject / Partial<ModalLabels>', description: '初始焦点与关闭名称，默认读取 drawer 文案组。' },
    { name: '…Modal 属性', type: 'ModalProps', description: 'description / closable / ref 等共享属性。' },
  ] }],
  a11y: ['原生模态隔离背景焦点，关闭 / 卸载有条件返回触发器；减少动态效果时不播放进入动画。', '焦点、键盘与取消不另写第二套；业务工作区、锁屏清理仍由宿主处理。'],
};
