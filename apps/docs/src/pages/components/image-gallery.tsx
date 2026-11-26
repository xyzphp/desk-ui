import type { ComponentDoc } from '../../blocks/types';
import { ImageGalleryDemo } from './ImageGalleryDemo';
import source from './ImageGalleryDemo.tsx?raw';

export const imageGalleryDoc: ComponentDoc = {
  name: { 'zh-CN': '图片画廊', 'en-US': 'Image gallery' },
  summary: {
    'zh-CN': '横向滚动的缩略图条，点击用图片预览放大浏览，适合详情页的截图与示例图。',
    'en-US': 'Horizontally scrolling thumbnail strip that opens the image preview on click, for screenshots and samples on detail pages.',
  },
  usage: [
    '用于应用截图、模板示例、作品集等一组只读图片。需要选择或上传图片时用 UploadZone，单张图片直接用 img。',
    '缩略图统一为 16:10 并裁切填充，放大预览显示完整图片，支持缩放、拖拽与左右切换；预览位置随点击的缩略图。',
    'items 与 ImagePreview 相同，每张图片必须有 alt。不可显示的地址会被跳过，没有可显示的图片时组件不渲染，所在小节由宿主决定是否保留。',
    '组件不发请求、不缓存地址；图片来源与授权由宿主负责，临时 blob URL 由宿主释放。',
  ],
  demos: [{ title: '截图条', description: '点击任一缩略图放大，Esc 关闭后焦点回到该缩略图。', layout: 'stack', code: source, render: () => <ImageGalleryDemo /> }],
  api: [
    {
      component: 'ImageGallery',
      props: [
        { name: 'label', type: 'string', description: '必填，缩略图列表与放大预览共用的名称。' },
        { name: 'items', type: 'readonly ImagePreviewItem[]', description: '必填，{ src, alt, title?, description? }。' },
        { name: 'labels', type: 'Partial<ImageGalleryLabels>', default: 'ConfigProvider', description: 'open(alt)：缩略图按钮的可访问名称。' },
        { name: 'previewLabels', type: 'Partial<ImagePreviewLabels>', default: 'ConfigProvider', description: '透传给放大预览的文案覆盖。' },
        { name: '…ul 属性', type: "ComponentProps<'ul'>", description: 'className、data-* 等透传到列表。' },
      ],
    },
  ],
  a11y: [
    '缩略图是带名称的原生按钮，列表带 role="list" 并以 label 命名。',
    '放大预览复用 ImagePreview 的原生模态对话框：打开聚焦关闭按钮，关闭后焦点回到触发的缩略图。',
  ],
};
