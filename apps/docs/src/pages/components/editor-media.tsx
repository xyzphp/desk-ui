import type { ComponentDoc } from '../../blocks/types';
import { ImageCropperDemo } from './ImageCropperDemo';
import { MarkdownEditorDemo } from './MarkdownEditorDemo';
import cropSource from './ImageCropperDemo.tsx?raw';
import markdownSource from './MarkdownEditorDemo.tsx?raw';

export const imageCropperDoc: ComponentDoc = {
  name: { 'zh-CN': '图片裁剪', 'en-US': 'Image cropper' },
  summary: {
    'zh-CN': '复用原系统封面取景与 canvas 裁剪，支持缩放、平移、对齐和本地图片导出。',
    'en-US': 'Reuses the original cover framing and canvas cropping, supporting zoom, pan, alignment, and local image export.',
  },
  usage: [
    'source 是已选的本地 Blob / File，选择入口复用 UploadZone；组件不抓取远程图片，也不自动上传或下载。',
    '保持原系统 cover 取景、1–3 倍缩放、居中与边缘对齐。x / y 为 -1 至 1 的归一化偏移，适应不同宽度视窗。',
    'outputSize 每边为 1–4096 的整数，总像素不超过 11,500,000；默认 512 × 512。PNG 保留透明，JPEG 垫白。',
    '系统设置中的站点图标使用 256 × 256 PNG；组件只处理裁剪，文件库选择、上传和保存由页面处理。',
    'onConfirm 返回 Blob、输出尺寸、原图裁剪矩形和取景参数；宿主负责校验、文件命名、上传和保存。',
    '新图片是否保留取景由宿主决定；示例通过 key 重建并恢复默认取景。切换图片、尺寸、卸载或取消后忽略旧导出结果。',
    '组件释放内部对象 URL；宿主为输出 Blob 创建的预览 URL 由宿主释放，临时图片不写入恢复快照。',
    '迁移原生封面弹窗时可启用 nativeStructure：保留 .ar-crop-* / .workspace-button 节点与 data-* 标记，不注入组件库按钮类。',
    '交互和裁剪算法仍由组件管理，页面加载原站文章 CSS。',
  ],
  demos: [{ title: '本地图片、取景与裁剪结果', layout: 'stack', code: cropSource, render: () => <ImageCropperDemo /> }],
  api: [
    {
      component: 'ImageCropper',
      props: [
        {
          name: 'label / source',
          type: 'string / Blob | null',
          description: '可访问名称与本地图片；空值显示选择提示。支持 PNG、JPEG、WebP、GIF、AVIF、BMP。',
        },
        {
          name: 'outputSize',
          type: 'CropSize',
          default: '{ width: 512, height: 512 }',
          description: '输出宽高决定裁剪比例，并限制 canvas 分配。',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'CropValue / CropValue / (value) => void',
          default: '{ zoom: 1, x: 0, y: 0 }',
          description: '受控 / 非受控取景；非法数值规范到范围，受控值不被组件写回。',
        },
        {
          name: 'mimeType / quality',
          type: 'image/png | image/jpeg / number',
          default: 'image/png / 0.92',
          description: '导出格式与 JPEG 质量，质量限制在 0–1。',
        },
        {
          name: 'onConfirm / onCancel / onError',
          type: '(result) => void / () => void / (error: Error) => void',
          description: '结果、取消和解码 / 导出错误；省略确认 / 取消回调时不展示对应按钮。',
        },
        {
          name: 'disabled / labels',
          type: 'boolean / Partial<ImageCropperLabels>',
          description: '禁用修改与导出；文案默认读取 ConfigProvider。',
        },
        {
          name: 'nativeStructure',
          type: 'boolean',
          default: 'false',
          description: '启用后保留原文章封面裁剪器节点和 data-* 标记，不注入 .ds-button；调用方加载对应原站样式。',
        },
        {
          name: '…根容器属性',
          type: 'ComponentProps<section> / nativeStructure 下 ComponentProps<div>',
          description: '根容器的 className、style、ref 与原生属性。',
        },
      ],
    },
  ],
  a11y: [
    '取景区域可聚焦，方向键微调、Shift 加方向键快速移动，触屏 / 指针拖动，Esc 或 pointercancel 撤销本次拖动。',
    '缩放使用公共 Range，额外提供对齐和重置按钮；错误可见，导出期间禁用修改，取消仍可用。',
    '图片只作为装饰预览，裁剪区域和尺寸有文字名称；动画图片按浏览器解码后的当前帧导出，不保留动画。',
  ],
};

export const markdownEditorDoc: ComponentDoc = {
  name: { 'zh-CN': 'Markdown 编辑器', 'en-US': 'Markdown editor' },
  summary: {
    'zh-CN': '包装原系统源码编辑、格式命令和历史记录规则，预览与附件能力由宿主注入。',
    'en-US': 'Wraps the original source editing, formatting commands, and history rules; preview and attachment abilities are injected by the host.',
  },
  usage: [
    '复用原系统 10 个格式命令、最多 60 步历史与 350ms 输入合并；没有另建 Markdown 解析器或复制原生业务上传接口。',
    '默认使用原生 textarea 编辑源码，保留 Field、原生表单、校验与 reset。value 与模式可分别受控；只读允许选中复制。',
    'renderPreview 由宿主返回经过审查的 React 节点，支持源码 / 分屏 / 预览；未提供时只展示源码。不要直接返回未经审查的 HTML。',
    '示例预览仅演示标题和引用的接线，不代表完整 Markdown 渲染。可视化预览编辑、图片尺寸 / 排列仍由原生编辑器及后续宿主适配处理。',
    '附件按钮与文件粘贴只回调文件 / 源码选区；上传后通过 ref.insert 插入已授权引用。快照源码或 historyKey 变化时拒绝插入。',
    'historyKey 标识账号 / 文档上下文，变化时清空历史；普通外部值替换也清空历史。锁屏时宿主应卸载或清空私密正文。',
  ],
  demos: [
    {
      title: '格式、历史、预览接入与表单',
      layout: 'stack',
      code: markdownSource,
      render: () => <MarkdownEditorDemo />,
    },
  ],
  api: [
    {
      component: 'MarkdownEditor',
      props: [
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value) => void',
          default: '— / 空串 / —',
          description: 'Markdown 源码，原生 onChange 同时保留；不会自动保存。',
        },
        {
          name: 'mode / defaultMode / onModeChange',
          type: 'MarkdownEditorMode / MarkdownEditorMode / (mode) => void',
          default: '— / edit / —',
          description: 'edit / split / preview；没有预览适配时仅源码，必填无效会展示源码与错误。',
        },
        {
          name: 'renderPreview',
          type: '(markdown: string) => ReactNode',
          description: '宿主经过审查的预览渲染器，预览区只读。',
        },
        {
          name: 'onPickAttachment / onFiles',
          type: '(selection) => void / (files, selection) => void',
          description: '宿主附件选择 / 文件粘贴入口，均不上传。',
        },
        { name: 'attachments / actions', type: 'ReactNode', description: '底部的已授权附件与宿主动作插槽。' },
        {
          name: 'historyKey / busy / labels',
          type: 'string | number / boolean / 局部 MarkdownEditorLabels',
          description: '上下文重置、忙碌禁用与文案配置。',
        },
        {
          name: 'ref',
          type: 'Ref<MarkdownEditorHandle>',
          description: 'input、focus、selection、insert、format、undo、redo、resetHistory；insert 返回是否接受。',
        },
        {
          name: '…textarea 属性',
          type: 'ComponentProps<textarea>',
          description: 'name、form、required、maxLength、readOnly、disabled 与事件；className / style 作用于外框。',
        },
      ],
    },
  ],
  a11y: [
    '工具栏左侧模式、右侧格式和附件，沿用原系统单行布局，窄容器横向滚动；分屏在窄容器纵排。',
    '命名原生按钮按 Tab 使用；Ctrl / ⌘ + B、I、K 格式化，Z 撤销，Shift+Z / Y 重做，保留输入选区和焦点。',
    '输入法组合期间不执行格式或历史快捷键，合成完成后记录历史；粘贴 HTML 不执行，源输入保持原生纯文本。',
    '必填错误关联源码输入并展示；受控拒绝修改时显示恢复宿主值，reset 不伪造业务提交。',
  ],
};
