import type { ComponentDoc } from '../../blocks/types';
import { MarkdownViewDemo } from './MarkdownViewDemo';
import source from './MarkdownViewDemo.tsx?raw';

export const markdownViewDoc: ComponentDoc = {
  name: { 'zh-CN': 'Markdown 渲染', 'en-US': 'Markdown view' },
  summary: {
    'zh-CN': '将原系统 Markdown 子集渲染为语义化 React 节点，不执行原始 HTML，也不会自动请求远程图片。',
    'en-US': 'Renders the original Markdown subset as semantic React nodes without executing raw HTML or auto-requesting remote images.',
  },
  usage: [
    '支持标题、段落、换行、强调、删除线、行内 / 围栏代码、引用、列表、任务项、表格和分隔线；原始 HTML 按普通文字显示。',
    '链接仅允许 HTTP、HTTPS、站内根路径和片段；危险或不受支持的链接只保留文字。链接使用新标签页并设置 noopener / noreferrer。',
    '外部 Markdown 图片不会自动加载，会成为普通链接。内嵌图片必须由宿主通过 media 显式映射到同源根路径；组件不解析账号、项目或文件 API，也不自行发请求。',
    'value 最多渲染前 80,000 个字符。editable 仅为顶层区块附加源码偏移，供宿主自己的选择工具定位；它不会让内容变为可编辑。',
    'visualEditable 仅在宿主明确开启 contentEditable 时使用：图片框保持不可编辑，并提供键盘可达的宽度滑块；源码序列化、粘贴过滤、宽度 / 排列保存和权限仍由宿主负责。',
    '宿主可使用顶层区块的源码偏移还原选择，并缓存未修改区块的原文，避免富文本预览重写 Markdown；图片面板、宽度与排列保存继续由宿主控制。',
    '宿主应把白名单图片引用映射到项目 / 文章自己的文件范围，并根据 data-md-start / data-md-end 保留未修改区块原文；图片面板、宽度与行数校验、工作区草稿由宿主控制。',
    '原生模板要求 div 根节点时传 as="div"；内容直接渲染在该根节点下，不增加包裹层。',
    'after 可把宿主生成的附件列表等节点追加在 Markdown 区块之后，并保留在同一个根节点内；媒体授权仍通过 media 显式提供。',
    '默认只读。visualEditable 为宿主提供可视化编辑的图片操作入口；文本编辑、Markdown 序列化、附件上传 / 白名单映射与内容保存仍由宿主和 MarkdownEditor 配合完成。',
  ],
  demos: [{ title: '安全 Markdown 区块与链接', layout: 'stack', code: source, render: () => <MarkdownViewDemo /> }],
  api: [
    {
      component: 'MarkdownView',
      props: [
        {
          name: 'as',
          type: "'article' | 'div'",
          default: "'article'",
          description: '选择根节点以保留原生预览结构；不额外包装 Markdown 内容。',
        },
        { name: 'value', type: 'string', description: 'Markdown 源码；长度超过 80,000 个字符时截断。' },
        { name: 'after', type: 'ReactNode', description: '可选的宿主内容，追加在 Markdown 区块之后，不增加包裹层。' },
        {
          name: 'media',
          type: 'Readonly<Record<string, MarkdownMedia>>',
          description: '可选的媒体白名单；每项提供同源根路径 url 和 image 能力。没有精确映射时不生成内嵌图片。',
        },
        {
          name: 'editable',
          type: 'boolean',
          default: 'false',
          description: '给顶层区块附加 data-md-start / data-md-end 源码偏移，不启用 contenteditable。',
        },
        {
          name: 'visualEditable',
          type: 'boolean',
          default: 'false',
          description:
            '在宿主启用 contentEditable 时，将白名单图片框设为不可编辑，并添加键盘可达的宽度滑块；不序列化或保存 Markdown。',
        },
        {
          name: '…article 属性',
          type: 'ComponentProps<article>',
          description: 'className、style、ref 与原生 article 属性。',
        },
      ],
    },
    {
      component: 'MarkdownMedia',
      props: [
        { name: 'url', type: 'string', description: '仅接受单斜线开头的同源根路径，不接受协议、双斜线或反斜线。' },
        {
          name: 'image',
          type: 'boolean',
          description: '只有为 true 时才允许 Markdown 图片语法生成 img；否则保留为可点击链接。',
        },
      ],
    },
  ],
  a11y: [
    '使用语义标题、段落、列表、引用、表格和代码块；任务项同时保留文字状态名称。',
    '图片 alt 来自 Markdown 替代文本；链接采用安全新标签页属性，拒绝危险协议。',
    '默认不创建焦点、弹层、按钮或交互状态；visualEditable 会为白名单图片提供非文本编辑框和宽度滑块，宿主负责键盘调整、候选值校验与错误反馈。',
  ],
};
