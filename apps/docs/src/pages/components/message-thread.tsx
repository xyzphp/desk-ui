import type { ComponentDoc } from '../../blocks/types';
import { MessageThreadDemo } from './MessageThreadDemo';
import source from './MessageThreadDemo.tsx?raw';
import { ChatDraftAIDemo } from './ChatDraftAIDemo';
import chatDraftSource from './ChatDraftAIDemo.tsx?raw';

export const messageThreadDoc: ComponentDoc = {
  name: { 'zh-CN': '消息线程', 'en-US': 'Message thread' },
  summary: {
    'zh-CN': '沿用原站聊天气泡和任务评论布局，组合时间、头像、正文、附件与操作。',
    'en-US': 'Follows the original chat bubbles and task comment layout, combining time, avatar, body, attachments, and actions.',
  },
  usage: [
    'items 按宿主提供的顺序展示，以稳定 id 保留消息节点；组件不排序、分页、自动滚动或插入实时消息。',
    'bubble 模式时间位于整行上方，own 消息位于右侧；comment 模式作者、时间和操作位于正文上方。头像通过 avatar 插槽组合 Avatar。',
    '普通聊天使用 text，保留换行并由 React 转义；content 可组合 MarkdownView 等已审查的评论内容，不能直接注入 HTML。',
    'attachments 位于正文底板之外，可组合图片预览与文件按钮。媒体 URL、授权、加载、下载和临时资源释放由宿主处理。',
    '时间由宿主按系统时钟设置格式化，dateTime 提供机器可读时间。权限、发送状态、幂等重试和草稿恢复不属于本视图。',
  ],
  demos: [
    { title: '聊天与评论两种布局', layout: 'stack', code: source, render: () => <MessageThreadDemo /> },
    {
      title: '聊天草稿与 AI 参考组合',
      layout: 'stack',
      code: chatDraftSource,
      render: () => <ChatDraftAIDemo />,
      description: '使用合成历史与固定结果，演示选区替换、光标插入、草稿变化保护和撤销。',
    },
  ],
  api: [
    {
      component: 'MessageThread',
      props: [
        {
          name: 'label / items',
          type: 'string / readonly MessageThreadItem[]',
          description: '必填的线程名称与按时间排列的消息。',
        },
        { name: 'variant', type: 'bubble | comment', default: 'bubble', description: '聊天气泡或评论线程布局。' },
        { name: 'empty', type: 'ReactNode', description: '没有消息时的内容，由宿主提供。' },
        { name: '…ol 属性', type: 'ComponentProps<ol>', description: 'ref、aria-busy、className 等标准列表属性。' },
      ],
    },
    {
      component: 'MessageThreadItem',
      props: [
        { name: 'id', type: 'string', description: '线程内稳定且唯一的编号，用于节点身份和宿主滚动锚点。' },
        {
          name: 'text / content',
          type: 'string / ReactNode',
          description: '纯文本正文及可选富内容；只有附件的消息可以省略。',
        },
        { name: 'avatar / author', type: 'ReactNode', description: '头像和作者；宿主控制安全的头像来源。' },
        { name: 'time / dateTime', type: 'ReactNode / string', description: '可见的格式化时间及 ISO 时间。' },
        { name: 'own', type: 'boolean', description: 'bubble 模式将本人消息放在右侧，comment 模式保持评论布局。' },
        {
          name: 'attachments / actions',
          type: 'ReactNode',
          description: '独立附件和有名称的操作。组件不会替宿主下载或删除。',
        },
        {
          name: 'ref',
          type: 'Ref<HTMLElement>',
          description: '正文及附件所在的 article，供宿主测量可见范围或恢复锚点。',
        },
      ],
    },
  ],
  a11y: [
    '使用有名称的有序列表和 article，保留正文选择与复制；不将历史列表设为实时播报区，以免重复朗读私有消息。',
    '视觉上的左右布局不改变 DOM 阅读顺序。附件和操作使用真正的链接 / 按钮并提供独立名称。',
    '测量到节点不代表已读。宿主还需核对活动窗口、页面可见、连续消息序号和真实可见范围。',
  ],
};
