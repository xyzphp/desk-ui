import type { ComponentDoc } from '../../blocks/types';
import { AppCardGridDemo, AppCardStatesDemo } from './AppCardDemo';
import source from './AppCardDemo.tsx?raw';

export const appCardDoc: ComponentDoc = {
  name: { 'zh-CN': '应用卡片', 'en-US': 'App card' },
  summary: {
    'zh-CN': '应用目录里的卡片：图标、名称、两行简介、标签和底栏操作，整卡点击打开详情；配合应用卡片网格排成等宽列表。',
    'en-US': 'Catalog card with icon, name, two-line summary, tags, and footer actions; the whole card opens details. Lay out with the app card grid.',
  },
  usage: [
    '用于应用商店、插件市场、模板库等“浏览 → 打开详情 → 安装”的目录页。普通内容分组仍用 Panel，桌面上的小组件用 DesktopCard，统计摘要用 StatCard。',
    'href 与 onOpen 二选一：静态站点或路由用 href，同页切换详情用 onOpen。名称是打开动作的可访问名称，点击区铺满整张卡片；标签与 actions 位于点击区之上，各自保持原有动作。',
    '底栏 actions 只放一两个直接操作（安装、更新），不要再放“查看详情”这类与整卡重复的按钮。状态用 tags 中的 Tag 表达，不能只靠颜色。',
    'icon 与 AppIcon 的外观属性相同；图片地址只接受可显示的 HTTP(S)、相对路径、blob 与栅格 data URL，不可用时回退为名称首字。',
    '多张卡片放进 AppCardGrid：保留列表语义，列宽 260px 起自适应；结果较少时卡片保持列宽，不会被拉伸到整行。任意内容的栅格仍用 Grid。',
  ],
  demos: [
    {
      title: '目录与安装',
      description: '点击卡片任意位置打开详情；安装按钮只触发安装。',
      layout: 'stack',
      code: source,
      render: () => <AppCardGridDemo />,
    },
    { title: '链接与仅展示', layout: 'stack', code: source, render: () => <AppCardStatesDemo /> },
  ],
  api: [
    {
      component: 'AppCard',
      props: [
        { name: 'name', type: 'string', description: '必填，标题与打开动作的名称；也用于生成首字图标。' },
        { name: 'summary', type: 'ReactNode', description: '简介，超过两行截断。' },
        { name: 'icon', type: 'AppIconAppearance', description: '图标外观：image、icon、glyph、color 等，尺寸固定 44px。' },
        { name: 'tags / meta / actions', type: 'ReactNode', description: '标签行、底栏左侧次要信息、底栏右侧操作；false 与空值视为未提供。' },
        { name: 'href / onOpen', type: 'string / () => void', description: '打开详情的链接或回调，二选一；都不提供时只展示。' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '3', description: '标题级别，按所在页面的大纲选择。' },
        { name: '…article 属性', type: "ComponentProps<'article'>", description: 'className、data-* 等透传到根元素。' },
      ],
    },
    {
      component: 'AppCardGrid',
      props: [
        { name: 'children', type: 'ReactNode', description: '若干 AppCard；每个元素包进一个列表项，false 与空值跳过。' },
        { name: '…ul 属性', type: "ComponentProps<'ul'>", description: '用 aria-label 给列表命名。' },
      ],
    },
  ],
  a11y: [
    '每张卡片是以名称命名的 article，标题级别可调；网格是带 role="list" 的列表，样式去掉圆点后仍保留列表语义。',
    '整卡点击区来自标题里的链接或按钮，键盘只经过这一个打开目标和各个操作按钮，不形成嵌套交互；焦点环画在整张卡片外。',
    '图标是装饰图形，不重复朗读。',
  ],
};
