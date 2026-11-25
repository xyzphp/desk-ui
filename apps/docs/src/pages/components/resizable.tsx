import type { ComponentDoc } from '../../blocks/types';
import { ResizeHandleDemo, ResizableSplitDemo } from './ResizableSplitDemo';
import source from './ResizableSplitDemo.tsx?raw';

export const resizeHandleDoc: ComponentDoc = {
  name: { 'zh-CN': '调整手柄', 'en-US': 'Resize handle' },
  summary: { 'zh-CN': '可聚焦的尺寸分隔条，提供指针拖动、键盘调整和取消回调。', 'en-US': 'Focusable size divider with pointer dragging, keyboard adjustment, and a cancel callback.' },
  usage: ['value、min、max 均为 CSS 像素。竖分隔条调整宽度，横分隔条调整高度。',
    '指针捕获期间连续回调请求值；Esc、pointercancel 或丢失捕获回退到拖动开始值，并报告 cancelled。',
    '方向键按 step 调整，Shift 加速 10 倍，Home / End 到边界。尺寸状态、持久化与保存时机由宿主决定。'],
  demos: [{ title: '拖动与键盘', layout: 'stack', code: source, render: () => <ResizeHandleDemo /> }],
  api: [{ component: 'ResizeHandle', props: [
    { name: 'value / onValueChange', type: 'number / (value) => void', description: '受控尺寸与请求回调。' },
    { name: 'min / max / step', type: 'number', default: '0 / 1000 / 10', description: '边界与键盘步长；指针按像素连续调整。' },
    { name: 'orientation / disabled', type: "'vertical' | 'horizontal' / boolean", default: "'vertical' / false", description: '分隔条方向与禁用。' },
    { name: 'onResizeStart / onResizeEnd', type: '() => void / (value, cancelled) => void', description: '拖动生命周期，结束值是请求值。卸载只清理捕获，不自动保存。' },
    { name: 'labels / aria-controls', type: 'Partial<ResizeHandleLabels> / string', description: '名称、数值描述和控制区域关联。' },
  ] }],
  a11y: ['separator 有方向、当前值与范围；禁用时移出 Tab 顺序。', '支持键盘替代，指针交互依赖浏览器 Pointer Events / 捕获能力。'],
};

export const resizableSplitDoc: ComponentDoc = {
  name: { 'zh-CN': '可调整分栏', 'en-US': 'Resizable split' },
  summary: {
    'zh-CN': '组合两个真实滚动区域与调整手柄，支持左右或上下分栏。',
    'en-US': 'Composes two real scrolling areas with a resize handle, supporting left-right or top-bottom splits.',
  },
  usage: ['primary 是第一区域，children 是第二区域；组件需放入具有明确高度的容器。',
    '边界兼顾第一区域、分隔条和第二区域最小尺寸。窄横向容器上下排列并停用手柄，不写回宽度偏好；变宽后恢复。',
    '分栏与紧凑模式不卸载内容，输入草稿保持挂载。保存和账号隔离留在宿主，固定布局继续使用 SplitLayout。'],
  demos: [{ title: '方向、尺寸与保留草稿', layout: 'frame', code: source, render: () => <ResizableSplitDemo /> }],
  api: [{ component: 'ResizableSplit', props: [
    { name: 'primary / children', type: 'ReactNode', description: '两个内容区域，各自具有公共滚动样式。' },
    { name: 'size / defaultSize / onSizeChange', type: 'number / number / (value) => void', default: '— / 240 / —', description: '第一区域的像素偏好尺寸。' },
    { name: 'minSize / maxSize / minSecondarySize', type: 'number', default: '160 / 可用空间 / 160', description: '两区最小尺寸与第一区域最大尺寸。' },
    { name: 'direction / disabled', type: "'horizontal' | 'vertical' / boolean", default: "'horizontal' / false", description: '布局方向与是否禁止调整。' },
    { name: 'labels', type: 'Partial<ResizeHandleLabels>', description: '手柄文案。' },
  ] }],
  a11y: ['手柄关联两个区域的 ID，共用 ResizeHandle 的键盘与数值语义。', '容器测量会清理 ResizeObserver 和 resize 监听，尺寸变化不自动写入业务配置。'],
};
