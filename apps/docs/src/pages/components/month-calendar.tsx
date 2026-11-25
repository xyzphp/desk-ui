import type { ComponentDoc } from '../../blocks/types';
import { MonthCalendarDemo } from './MonthCalendarDemo';
import source from './MonthCalendarDemo.tsx?raw';

export const monthCalendarDoc: ComponentDoc = {
  name: { 'zh-CN': '整月事件日历', 'en-US': 'Month calendar' },
  summary: {
    'zh-CN': '按民用日期展示整月事件，月份、选中日期和事件动作分别由宿主控制。',
    'en-US': 'Displays a full month of events by civil date; month, selected date, and event actions are controlled by the host.',
  },
  usage: ['菜单栏小日历继续用 Calendar，日期输入继续用 DatePicker；本组件用于需要显示事件的整月内容区。',
    'month 使用 YYYY-MM，日期 / today / 事件 date 使用 YYYY-MM-DD，仅支持 0001～9999 年合法日期。',
    '月份与选中日期分别受控 / 非受控；浏览月份不改变选择，点击相邻月份日期同时请求切换月份。',
    '事件由宿主按稳定 id 提供，保持给定顺序；超过 maxEvents 的内容就地展开，不打开弹窗。',
    'isDateDisabled 只限制日期选择；事件按钮由全局 disabled 控制，权限与业务可执行性仍由宿主校验。',
    '不请求事件、不拖动排期、不创建循环日程、不推断时区；窄容器保留可横向滚动的完整周表格。'],
  demos: [{ title: '日期选择、事件与溢出展开', layout: 'stack', code: source, render: () => <MonthCalendarDemo /> }],
  api: [{ component: 'MonthCalendar', props: [
    { name: 'label', type: 'string', description: '日历区域可访问名称。' },
    { name: 'month / defaultMonth / onMonthChange', type: 'string / string / (month) => void', default: '— / today 所在月 / —',
      description: '显示月份，不修改选中日期；非法月份回退到 today 所在月。' },
    { name: 'value / defaultValue / onValueChange', type: 'string / string / (date) => void', default: '— / 空串 / —', description: '选中日期；非法值展示为未选。' },
    { name: 'today / weekStartsOn', type: 'string / 0 | 1', default: '当前本地日期 / 1', description: '今日标记和每周起点（周日 / 周一）；确定性渲染时显式传 today。' },
    { name: 'events / onEventClick', type: 'readonly MonthCalendarEvent[] / (event) => void', default: '[] / —',
      description: '事件含 id、date、title、tone；未提供回调时显示静态文本。' },
    { name: 'maxEvents', type: 'number', default: '2', description: '每天初始可见事件数，0 时全部通过展开入口查看。' },
    { name: 'disabled / isDateDisabled', type: 'boolean / (date) => boolean', description: '冻结月份 / 选择 / 事件动作，或限制特定日期选择。' },
    { name: 'labels / …section 属性', type: 'Partial<MonthCalendarLabels> / ComponentProps<section>', description: '月份、周标题、日期和溢出文案，支持 ref 和原生属性。' },
  ] }],
  a11y: ['原生 table / th / button 保留周标题与事件操作，日期按钮使用完整日期名称；不声明不完整的 grid 角色。',
    '日期方向键按日 / 周移动，Home / End 到周首尾，PageUp / PageDown 按月，Shift 按年；跳过禁用日期，边界保留焦点。',
    'Enter / Space 选择日期；月份标题礼貌宣布变化；选中和今日分别有 aria-pressed / aria-current，不只靠颜色。'],
};
