import type { ComponentDoc } from '../../blocks/types';
import { DetailLayoutDemo, DetailLayoutPlainDemo } from './DetailLayoutDemo';
import source from './DetailLayoutDemo.tsx?raw';

export const detailLayoutDoc: ComponentDoc = {
  name: { 'zh-CN': '详情页布局', 'en-US': 'Detail layout' },
  summary: {
    'zh-CN': '详情页的头部（图形、标题、说明、标签、主操作）加正文与右侧信息栏两栏布局，窄容器下信息栏排到正文之后。',
    'en-US': 'Detail page with a header (media, title, description, tags, primary action) above a content column and a side panel that moves below in narrow containers.',
  },
  usage: [
    '用于应用、成员、项目等单个对象的只读详情。带编辑的设置页用 PropertySheet 与 FormSection；整页侧栏导航用 SplitLayout。',
    '头部只放一个主操作；状态提示（Notice）放在正文开头。正文由若干 DetailSection 组成，小节没有边框，标题级别自动取 headingLevel 的下一级。',
    'aside 放若干 Panel，信息面板里的键值对用 PropertySheet density="compact"：名称列按最长名称对齐，值可换行。不传 aside 时正文占满整行。',
    '信息栏宽 220–300px，所在 Workspace 窄于 600px 时改为单栏，正文在前。',
  ],
  demos: [
    { title: '应用详情', description: '安装后头部操作变为状态标签，正文开头出现提示。', layout: 'stack', code: source, render: () => <DetailLayoutDemo /> },
    { title: '无信息栏', layout: 'stack', code: source, render: () => <DetailLayoutPlainDemo /> },
  ],
  api: [
    {
      component: 'DetailLayout',
      props: [
        { name: 'title', type: 'ReactNode', description: '必填，标题，同时命名整个 article。' },
        { name: 'description / media / meta', type: 'ReactNode', description: '标题下的说明、标题左侧图形（AppIcon、Avatar）、标签行。' },
        { name: 'actions', type: 'ReactNode', description: '头部右侧的主操作。' },
        { name: 'aside', type: 'ReactNode', description: '右侧信息栏；false 与空值视为未提供。' },
        { name: 'headingLevel', type: '1 | 2 | 3', default: '2', description: '标题级别，独立页面用 1，窗口或标签页内用 2。' },
        { name: 'children', type: 'ReactNode', description: '正文，通常是 Notice 与若干 DetailSection。' },
        { name: '…article 属性', type: "ComponentProps<'article'>", description: 'className、data-* 等透传到根元素。' },
      ],
    },
    {
      component: 'DetailSection',
      props: [
        { name: 'title', type: 'ReactNode', description: '必填，小节标题，同时命名该 section。' },
        { name: '…section 属性', type: "ComponentProps<'section'>", description: 'className、data-* 等透传。' },
      ],
    },
    {
      component: 'PropertySheet',
      props: [{ name: 'density', type: "'default' | 'compact'", default: "'default'", description: 'compact 用于只读信息面板，见属性表单页。' }],
    },
  ],
  a11y: [
    '根元素是以标题命名的 article，小节是以小节标题命名的 section，标题级别连续。',
    '窄容器只改变排布，不改变阅读与键盘顺序：头部、正文、信息栏。',
  ],
};
