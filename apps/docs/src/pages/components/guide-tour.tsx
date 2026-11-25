import type { ComponentDoc } from '../../blocks/types';
import { CoachmarkDemo } from './CoachmarkDemo';
import { TourDemo } from './TourDemo';
import coachmarkSource from './CoachmarkDemo.tsx?raw';
import tourSource from './TourDemo.tsx?raw';

const guideUsage = [
  '组件只负责显示与键盘交互，不记录「是否看过」；宿主按账号保存已看过的引导，并决定何时打开（首次使用、版本上新）。',
  '同一时间只显示一个引导；与登录、锁屏、确认弹窗等更高优先级的界面冲突时由宿主延后，不要叠加多个气泡。',
  '目标元素没有挂载（窗口未打开、权限不足）时气泡居中显示；如果说明离开目标就没有意义，由宿主跳过该步骤。',
  '文案写「这里能做什么」，一步一件事，标题不超过一行；不要用引导代替必要的界面说明或帮助文档。',
];

export const coachmarkDoc: ComponentDoc = {
  name: { 'zh-CN': '气泡引导', 'en-US': 'Coachmark' },
  summary: {
    'zh-CN': '指向某个界面元素的说明气泡，用于新功能提示或单条引导，可选聚光压暗其余区域。',
    'en-US':
      'An explanatory bubble pointing at an interface element for new-feature hints or single tips, with optional spotlight.',
  },
  usage: [
    ...guideUsage,
    '新功能提示可配合 Badge 的 dot 在入口上显示红点，用户查看提示或进入功能后由宿主同时清除两者。',
    '外部点击和滚动不会关闭气泡，避免用户误触后错过提示；只能通过「知道了」、关闭按钮或 Esc 结束。',
  ],
  demos: [{ title: '新功能提示与红点', layout: 'stack', code: coachmarkSource, render: () => <CoachmarkDemo /> }],
  api: [
    {
      component: 'Coachmark',
      props: [
        { name: 'open', type: 'boolean', description: '受控显示状态。' },
        { name: 'target', type: 'HTMLElement | null', description: '指向的元素；缺省或已移除时居中显示。' },
        { name: 'title / children', type: 'string / ReactNode', description: '标题（对话框名称）与说明正文。' },
        {
          name: 'placement',
          type: 'FloatingPlacement',
          default: 'bottom',
          description: '首选方向，空间不足时翻转并收敛到视口内。',
        },
        {
          name: 'spotlight',
          type: 'boolean',
          default: 'false',
          description: '压暗目标以外区域并给目标加强调描边，不拦截指针。',
        },
        { name: 'meta / actions', type: 'ReactNode', description: '底栏左侧信息与替换默认「知道了」的按钮组。' },
        {
          name: 'onClose',
          type: "(reason: 'done' | 'close' | 'escape') => void",
          description: '结束请求，宿主关闭并记录已看过。',
        },
        {
          name: 'labels',
          type: 'Partial<CoachmarkLabels>',
          description: '关闭 / 知道了 / 跳过 / 上一步 / 下一步 / 完成 / 步骤计数，读取 ConfigProvider。',
        },
      ],
    },
  ],
  a11y: [
    '气泡是以标题命名、关联说明的非模态 dialog，打开时聚焦最后一个操作按钮，关闭后焦点返回打开前的位置。',
    '标题与正文设为 aria-live=polite，内容切换时读屏会播报；Esc 关闭，聚光层与箭头对辅助技术隐藏。',
    '进入动画在 prefers-reduced-motion 下关闭；正文字号 13px，计数 12px。',
  ],
};

export const tourDoc: ComponentDoc = {
  name: { 'zh-CN': '分步引导', 'en-US': 'Tour' },
  summary: {
    'zh-CN': '由多个气泡组成的首次使用引导，提供上一步、下一步、跳过与完成，默认开启聚光。',
    'en-US':
      'A first-run walkthrough built from coachmarks with back, next, skip, and finish; spotlight is on by default.',
  },
  usage: [
    ...guideUsage,
    '步骤控制在 3–6 步；第一步可以不指定目标作为欢迎页，最后一步告诉用户在哪里重新查看引导。',
    'target 可以传函数，在显示该步时才查找元素，适合目标随窗口、程序坞变化的场景。',
  ],
  demos: [{ title: '首次使用引导', layout: 'stack', code: tourSource, render: () => <TourDemo /> }],
  api: [
    {
      component: 'Tour',
      props: [
        { name: 'open', type: 'boolean', description: '受控显示状态。' },
        {
          name: 'steps',
          type: 'TourStep[]',
          description: '{ id?, target?, title, description?, placement? }，target 可为元素或返回元素的函数。',
        },
        {
          name: 'current / defaultCurrent / onCurrentChange',
          type: 'number / number / (index) => void',
          default: '— / 0 / —',
          description: '受控 / 非受控的当前步骤（从 0 开始）。',
        },
        {
          name: 'onClose',
          type: "(reason: 'finish' | 'skip' | 'escape', index) => void",
          description: '完成、跳过（含关闭按钮）或 Esc，附带结束时的步骤。',
        },
        { name: 'spotlight', type: 'boolean', default: 'true', description: '聚光压暗其余区域。' },
        { name: '…Coachmark 属性', type: 'labels / className / data-*', description: '文案覆盖与原生属性透传。' },
      ],
    },
  ],
  a11y: [
    '每一步复用 Coachmark 的对话框语义；切换步骤时焦点留在主按钮上，标题与正文通过 aria-live 播报。',
    '底栏显示「当前 / 总数」；最后一步不再提供跳过，主按钮改为完成。',
  ],
};
