import type { ComponentDoc } from '../../blocks/types';
import { AppCardGridDemo, AppCardStatesDemo } from './AppCardDemo';
import source from './AppCardDemo.tsx?raw';

export const appCardDoc: ComponentDoc = {
  name: { 'zh-CN': '应用卡片', 'en-US': 'App card' },
  summary: {
    'zh-CN':
      '约 9:6 比例的淡雅渐变应用卡片：图标、名称、两行简介、紧凑标签行和底栏操作，支持页面加载时随机分配柔和背景色，整卡点击打开详情；配合应用卡片网格排成等宽列表。',
    'en-US':
      'Compact 9:6 soft-gradient catalog card with icon, title, two-line summary, compact pill tags, footer meta/actions, and randomized pastel tinting.',
  },
  usage: [
    '用于应用商店、已安装应用管理、插件市场等“浏览 → 打开详情 → 安装 / 管理”的目录页。普通内容分组仍用 Panel，桌面上的小组件用 DesktopCard，统计摘要用 StatCard。',
    '默认采用约 9:6 紧凑比例与轻透超淡渐变表面，tint="auto" 在每次页面加载时随机打乱蓝 / 紫 / 青绿 / 暖粉 / 暖杏五种同频柔光渐变色的映射，并通过 tintSeed（缺省取 name）保持筛选与跨栏显示稳定一致；需要素雅珍珠浅底时显式传入 tint="neutral"。',
    'tags 推荐放 2–3 个紧凑胶囊标签（可配合 Tag 的 shape="pill" dot 展示状态点，及分类 / 来源标签）；避免在卡片中部再堆叠多行说明框以免拉高卡片比例。',
    'href 与 onOpen 二选一：静态站点或路由用 href，同页切换详情用 onOpen。名称是打开动作的可访问名称，点击区铺满整张卡片；tags、headerAction 与 actions 位于点击区之上，各自保持原有动作。',
    'meta 放在底栏左侧（版本号或简短标识），actions 放在底栏右侧；若希望卡片常态更克制，可设置 revealActions 在悬停或聚焦卡片时渐显底栏操作（如商店的「安装」或已禁用的「已安装」），触屏设备会自动常显。',
    'icon 与 AppIcon 的外观属性相同；图片地址只接受可显示的 HTTP(S)、相对路径、blob 与栅格 data URL，不可用时回退为名称首字。',
    '多张卡片放进 AppCardGrid：保留列表语义，列宽 264px 起自适应（宽屏 4 列）；结果较少时卡片保持列宽，不会被拉伸到整行。外层使用 Workspace surface="ambient"（或纯文档页用 DocumentPane surface="ambient"）时，卡片与顶部工具栏将共同落在与商店一致的浅雾微光画布上。',
  ],
  demos: [
    {
      title: '工作台目录、随机柔和背景与移入操作',
      description:
        '默认按随机柔和色系分布；未安装卡片悬停或聚焦渐显「安装」，已安装卡片常驻显示不可点击的「已安装」按钮。',
      layout: 'stack',
      code: source,
      render: () => <AppCardGridDemo />,
    },
    {
      title: '链接、右上快捷操作与指定色系',
      description:
        '支持静态路由 href、headerAction 快捷按钮以及显式指定 tint（blue / purple / teal / rose / amber / neutral）。',
      layout: 'stack',
      code: source,
      render: () => <AppCardStatesDemo />,
    },
  ],
  api: [
    {
      component: 'AppCard',
      props: [
        { name: 'name', type: 'string', description: '必填，标题与打开动作的名称；也用于生成首字图标。' },
        { name: 'summary', type: 'ReactNode', description: '简介，超过两行截断。' },
        {
          name: 'icon',
          type: 'AppIconAppearance',
          description: '图标外观：image、icon、glyph、color 等，尺寸固定 44px。',
        },
        {
          name: 'tint',
          type: "'auto' | 'blue' | 'purple' | 'teal' | 'rose' | 'amber' | 'neutral'",
          default: "'auto'",
          description: '淡雅浅色渐变底色方向；auto 随页面加载随机分布多种柔和渐变（需要无彩色底时显式设 neutral）。',
        },
        {
          name: 'tintSeed',
          type: 'string',
          description: 'tint="auto" 时用于选色的稳定种子（如应用 slug）；缺省使用 name。',
        },
        { name: 'headerAction', type: 'ReactNode', description: '顶部右侧可选辅助操作按钮，独立于整卡点击区。' },
        { name: 'tags', type: 'ReactNode', description: '分类、来源、状态等紧凑标签，false 与空值视为未提供。' },
        { name: 'meta / actions', type: 'ReactNode', description: '底栏左侧元信息与右侧操作按钮；不提供时自动省略。' },
        {
          name: 'revealActions',
          type: 'boolean',
          default: 'false',
          description: '是否仅在悬停或键盘聚焦卡片时渐显底栏 actions（触屏设备自动常显）。',
        },
        {
          name: 'href / onOpen',
          type: 'string / () => void',
          description: '打开详情的链接或回调，二选一；都不提供时只展示。',
        },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '3', description: '标题级别，按所在页面的大纲选择。' },
        { name: '…article 属性', type: "ComponentProps<'article'>", description: 'className、data-* 等透传到根元素。' },
      ],
    },
    {
      component: 'AppCardGrid',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '若干 AppCard；每个元素包进一个列表项，false 与空值跳过。',
        },
        { name: '…ul 属性', type: "ComponentProps<'ul'>", description: '用 aria-label 给列表命名。' },
      ],
    },
  ],
  a11y: [
    '每张卡片是以名称命名的 article，标题级别可调；网格是带 role="list" 的列表，样式去掉圆点后仍保留列表语义。',
    '整卡点击区来自标题里的链接或按钮，键盘只经过这一个打开目标和各个操作按钮，不形成嵌套交互；焦点环画在整张卡片内缘。',
    '卡片底部元信息与正文在各柔和渐变底色上均保持可读对比度，全部可见文字不小于 12px；图标与状态圆点不重复朗读。',
    '在系统开启“减少动态效果”时自动取消卡片悬停上浮与过渡动画。',
  ],
};
