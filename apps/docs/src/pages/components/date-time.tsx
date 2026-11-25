import { DatePicker, DateTimePicker, Field, TimePicker } from '@xyzos/desk-ui';
import type { ComponentDoc, PropSpec } from '../../blocks/types';
import { DateRangePickerDemo } from './DateRangePickerDemo';
import dateRangeSource from './DateRangePickerDemo.tsx?raw';
import { DateRangePickerNativeDemo } from './DateRangePickerNativeDemo';
import dateRangeNativeSource from './DateRangePickerNativeDemo.tsx?raw';
import { DateRangeFieldDemo } from './DateRangeFieldDemo';
import dateRangeFieldSource from './DateRangeFieldDemo.tsx?raw';
import { TimeRangePickerDemo } from './TimeRangePickerDemo';
import timeRangeSource from './TimeRangePickerDemo.tsx?raw';
import { NumberRangePickerDemo } from './NumberRangePickerDemo';
import numberRangeSource from './NumberRangePickerDemo.tsx?raw';

const inputProps: PropSpec[] = [
  { name: 'value / defaultValue', type: 'string', description: '受控值 / 非受控初始值；空字符串表示未选择。' },
  {
    name: 'onValueChange / onChange',
    type: '(value: string) => void / ChangeEventHandler',
    description: '回调标准格式值；原生事件仍透传。',
  },
  {
    name: 'min / max / step',
    type: "string / string / number | 'any'",
    description: '原生范围与步进校验；日期步进单位为天，时间及日期时间为秒。',
  },
  { name: 'required / disabled / readOnly', type: 'boolean', description: '原生必填、禁用和只读语义。' },
  {
    name: 'name / form / ref / aria-*',
    type: '原生 input 属性',
    description: '参与原生表单与重置；ref 指向输入框；Field 自动关联标签、提示和错误。',
  },
  {
    name: 'clearable / pickerLabels',
    type: 'boolean / Partial<DateTimePickerLabels>',
    default: 'true / 中文',
    description: '清空入口及面板文案，支持周标题、年月和日期名称格式函数；不改变值格式。',
  },
];
const inputUsage = [
  '输入使用原生日期 / 时间语义，日历和时间列使用组件库主题面板；结合 Naive UI 的轻边框、柔和选中和轻投影，颜色仍跟随系统主题。需要可见标签时包在 Field 内，也可自行提供 aria-label。',
  'value + onValueChange 受控，defaultValue 非受控；不自动选择今天，不自动提交或发请求。',
  '点击末尾图标或按 Alt+↓ / F4 打开面板。日期点选即生效；时间和日期时间在面板内编辑后按确定，取消保留原值。打开面板不写入默认值。',
  'min / max / step / required 仍参与原生表单校验；面板确认前复核原生范围和步进。现代浏览器通过 Popover API 展示非模态顶层，外部点击、外部滚动、移出焦点或 Esc 关闭。',
];
const inputA11y = [
  '原生输入保留键盘分段编辑与表单；日期网格支持方向键、Home / End、PageUp / PageDown（Shift 跨年），年月列表使用 Tab / Enter，时间列支持方向键与 Home / End。',
  '选中日、今天标记、范围高亮与键盘焦点分开；选中背景不会被 hover 覆盖。禁用 / 只读不能展开或清空，Esc / 确认关闭返回仍存在的触发器。',
  '输入区域聚焦时只改变一层中性细边框，不叠加描边或聚焦投影；控件正文 13px，辅助文字 12px，适配深浅主题。',
];

export const datePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '日期选择器', 'en-US': 'Date picker' },
  summary: {
    'zh-CN': '选择不含时区的民用日期，复用项目计划和生成应用的原生日期输入。',
    'en-US':
      'Selects a timezone-free civil date, reusing the native date inputs from project plans and generated apps.',
  },
  usage: [...inputUsage, '使用 YYYY-MM-DD 字符串传值，不通过 UTC 时间戳截取日期，避免跨时区偏移。'],
  demos: [
    {
      title: '日期范围限制与不可编辑状态',
      layout: 'stack',
      code: `<Field label="计划日期" required><DatePicker required min="2026-01-01" max="2027-12-31" defaultValue="2026-11-04" /></Field>
<Field label="只读日期"><DatePicker readOnly defaultValue="2026-11-04" /></Field>
<Field label="暂不可编辑"><DatePicker disabled /></Field>`,
      render: () => (
        <>
          <Field label="计划日期" required>
            <DatePicker required min="2026-01-01" max="2027-12-31" defaultValue="2026-11-04" />
          </Field>
          <Field label="只读日期">
            <DatePicker readOnly defaultValue="2026-11-04" />
          </Field>
          <Field label="暂不可编辑">
            <DatePicker disabled />
          </Field>
        </>
      ),
    },
  ],
  api: [{ component: 'DatePicker', props: inputProps }],
  a11y: inputA11y,
};

export const timePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '时间选择器', 'en-US': 'Time picker' },
  summary: {
    'zh-CN': '选择一天内的时间，支持秒级步进和原生范围校验。',
    'en-US': 'Selects a time within one day with second-level stepping and native range validation.',
  },
  usage: [...inputUsage, '使用 HH:mm 或 HH:mm:ss[.sss]；step 默认 60 秒，选择秒时传 step={1}。不绑定日期和时区。'],
  demos: [
    {
      title: '分钟步进、秒与禁用状态',
      layout: 'stack',
      code: `<Field label="预约时间"><TimePicker defaultValue="09:30" min="08:00" max="18:00" step={900} /></Field>
<Field label="精确到秒"><TimePicker defaultValue="12:30:15" step={1} /></Field>
<Field label="暂不可编辑"><TimePicker disabled defaultValue="09:30" /></Field>`,
      render: () => (
        <>
          <Field label="预约时间">
            <TimePicker defaultValue="09:30" min="08:00" max="18:00" step={900} />
          </Field>
          <Field label="精确到秒">
            <TimePicker defaultValue="12:30:15" step={1} />
          </Field>
          <Field label="暂不可编辑">
            <TimePicker disabled defaultValue="09:30" />
          </Field>
        </>
      ),
    },
  ],
  api: [{ component: 'TimePicker', props: inputProps }],
  a11y: inputA11y,
};

export const dateTimePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '日期时间选择器', 'en-US': 'Date-time picker' },
  summary: {
    'zh-CN': '本地日期与时间输入，用于提醒、筛选和到期时间草稿。',
    'en-US': 'Local date and time input for reminders, filters, and due-date drafts.',
  },
  usage: [
    ...inputUsage,
    '格式为 YYYY-MM-DDTHH:mm[:ss[.sss]]，表示墙上时间，没有时区或 UTC 偏移。宿主明确时区和夏令时策略后再转换为业务时间戳。',
    '不复刻工坊的只读展示框与隐藏选择器，直接保留可编辑的原生输入。',
  ],
  demos: [
    {
      title: '本地时间、只读与错误反馈',
      layout: 'stack',
      code: `<Field label="提醒时间"><DateTimePicker step={1} defaultValue="2026-11-04T09:30:15" /></Field>
<Field label="已登记时间"><DateTimePicker readOnly defaultValue="2026-11-04T09:30" /></Field>
<Field label="到期时间" error="请选择有效时间"><DateTimePicker required /></Field>`,
      render: () => (
        <>
          <Field label="提醒时间">
            <DateTimePicker step={1} defaultValue="2026-11-04T09:30:15" />
          </Field>
          <Field label="已登记时间">
            <DateTimePicker readOnly defaultValue="2026-11-04T09:30" />
          </Field>
          <Field label="到期时间" error="请选择有效时间">
            <DateTimePicker required />
          </Field>
        </>
      ),
    },
  ],
  api: [{ component: 'DateTimePicker', props: inputProps }],
  a11y: inputA11y,
};

const rangeProps: PropSpec[] = [
  {
    name: 'label / labels',
    type: 'string / Partial<RangePickerLabels>',
    description: 'label 必填；端点与顺序错误文案默认读取 ConfigProvider，可局部覆盖。',
  },
  {
    name: 'value / defaultValue / onValueChange',
    type: 'readonly [string, string] / 同类型 / (value) => void',
    default: "['', '']",
    description: '受控 / 非受控范围；空端点表示不限，不自动交换、截断或补齐。',
  },
  {
    name: 'min / max / step',
    type: "string / string / number | 'any'",
    description: '同时应用到两端；原生表单约束保持有效。',
  },
  { name: 'required / disabled / readOnly', type: 'boolean', description: '两端同时生效；required 要求两端均有值。' },
  {
    name: 'startName / endName / form',
    type: 'string',
    description: '两端参与原生表单；非受控表单重置恢复 defaultValue 并回调；受控重置由宿主决定。',
  },
  {
    name: 'error / hint',
    type: 'ReactNode',
    description: '外部错误优先；其次为顺序错误，最后为提示。顺序错误还设置结束端的原生自定义有效性。',
  },
  {
    name: '…div 属性',
    type: "ComponentProps<'div'>",
    description: 'id / className / ref 等传到组容器；不使用 Field 包裹多个输入。',
  },
];
const rangeUsage = [
  '内置组标签和起止输入的独立名称，两端共用一条细边框。聚焦时标出当前端点，窄容器按纵向排列。',
  '允许未完成的范围草稿，结束早于开始时保留原值、显示错误并阻止原生表单提交；不自动改动另一端。',
  '不传 required 时允许一侧留空，业务是否接受单侧筛选由宿主判断；min / max / step 的原生错误在表单提交或 reportValidity() 时反馈。',
];
const temporalRangeProps: PropSpec[] = [
  ...rangeProps,
  {
    name: 'clearable / pickerLabels',
    type: 'boolean / Partial<DateTimePickerLabels>',
    default: 'true / 中文',
    description: '两端共用的清空配置及日期 / 时间面板文案。',
  },
];
const rangeA11y = [
  '使用命名 group、独立 label 与真实 input；提示和错误关联到两个端点，顺序错误通过 alert 和结束端 aria-invalid 表达。',
  '组合框只保留一层中性焦点边框，当前端点使用轻底色；标签留在输入区外，保留原生键盘、步进、禁用、只读与表单校验。',
];
export const dateRangePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '日期范围选择器', 'en-US': 'Date range picker' },
  summary: {
    'zh-CN': '日期或日期时间的起止范围，支持单侧筛选、顺序校验和独立字段提交。',
    'en-US':
      'Start and end range for dates or date-times, supporting one-sided filters, order validation, and separate field submission.',
  },
  usage: [
    ...rangeUsage,
    'type="date" 为日期；type="datetime-local" 为墙上时间。比较不套用设备时区；宿主负责时间戳转换及服务端校验。',
    '在同一面板依次选择开始和结束日期，悬停可预览区间，点击更早日期会重置起点。纯日期选完即可提交，日期时间继续在双月面板内调整两端时间，点「确定」提交。按 Esc 或点击外部放弃草稿，面板里的「清空」清除两端。',
    '原页面需要保留标签和字段的 HTML 层级时，使用 renderNative 接收原生起止 input 与 groupProps；范围状态、表单字段和顺序校验仍由组件管理。',
    '紧凑表单的内联布局（可见端点标签）请使用 DateRangeField，不再依赖 renderNative。',
  ],
  demos: [
    { title: '日期范围与顺序校验', code: dateRangeSource, render: () => <DateRangePickerDemo />, layout: 'stack' },
    {
      title: '日期时间范围',
      code: `${dateRangeSource}\n// 使用：<DateRangePickerDemo withTime />`,
      render: () => <DateRangePickerDemo withTime />,
      layout: 'stack',
    },
    {
      title: '保留原页面结构',
      code: dateRangeNativeSource,
      render: () => <DateRangePickerNativeDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'DateRangePicker',
      props: [
        ...temporalRangeProps,
        { name: 'type', type: "'date' | 'datetime-local'", default: "'date'", description: '两端的原生输入类型。' },
        {
          name: 'renderNative',
          type: '(fields: { start, end, groupProps }) => ReactNode',
          description: '以调用方 HTML 结构渲染原生输入，同时保留组件的状态、原生表单和范围顺序校验。',
        },
      ],
    },
  ],
  a11y: [...rangeA11y, '在日期格按 Enter 依次选起止日期，方向键在日期和时间列表内移动，Esc 关闭并返回触发器。'],
};
export const dateRangeFieldDoc: ComponentDoc = {
  name: { 'zh-CN': '日期范围字段', 'en-US': 'Date range field' },
  summary: {
    'zh-CN':
      '内联的日期或日期时间范围字段。起止共用一个双月面板，日期可跟随系统时钟格式和年份选项，支持顺序校验和原生表单提交。',
    'en-US':
      'Inline date or date-time range field with one two-month picker, clock-based date formatting, order validation, and native form submission.',
  },
  usage: [
    '端点标签以 12px 小字内联显示在输入面内，适合项目资料等紧凑表单；label 作为分组的可访问名称，不重复渲染。',
    '空态占位与日历面板文案默认读取 ConfigProvider（请选择日期 / Select date），需要局部覆盖时传 pickerLabels。',
    '范围状态、原生表单字段与顺序校验与 DateRangePicker 相同：结束早于开始时保留原值、显示错误并阻止提交；未选择日期时端点允许留空。',
    '点击输入面任意位置打开一个双月面板，两份日历可各自翻月。先选开始日期，再选结束日期。输入面宽度随内容自适应，窄视口下双月面板可上下排列。',
    '纯日期在第二次点选后提交。日期时间在同一面板调整两端时间后点「确定」。未选过时间时起始默认 00:00，结束默认 23:59，遇到端点当天有最小或最大值时取对应边界。已有时间可继续使用。',
    'Esc、点击外部或再次点击日历图标关闭面板并丢弃草稿。「清空」清除两端，非必填的日期时间还可在面板里移除单侧。',
    '传入 dateFormat 和 showYear 可同步系统时钟的日期显示。日期按 YYYY-MM-DD 提交，日期时间提交带 T 的本地时间值，由宿主转换时区。',
  ],
  demos: [
    { title: '项目计划日期', code: dateRangeFieldSource, render: () => <DateRangeFieldDemo />, layout: 'stack' },
    {
      title: '创建时间范围',
      code: `${dateRangeFieldSource}\n// 使用：<DateRangeFieldDemo withTime />`,
      render: () => <DateRangeFieldDemo withTime />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'DateRangeField',
      props: [
        ...temporalRangeProps,
        { name: 'type', type: "'date' | 'datetime-local'", default: "'date'", description: '两端的原生输入类型。' },
        {
          name: 'dateFormat',
          type: "'month-day' | 'ymd' | 'numeric' | 'numeric-year' | 'dash-month-day' | 'iso'",
          description: '可选的时钟日期格式族，只改变端点的日期显示。',
        },
        { name: 'showYear', type: 'boolean', description: '显式添加或隐藏年份；未传时由 dateFormat 自身决定。' },
        {
          name: 'labelPlacement',
          type: "'inside' | 'outside'",
          default: "'inside'",
          description: '将端点名称放在输入面内，或放在输入面上方。',
        },
      ],
    },
  ],
  a11y: [
    '使用命名 group 与两个可见 label 关联端点；提示和错误关联到两个端点，顺序错误通过 alert 与结束端 aria-invalid 表达。',
    '末尾日历按钮和格式化端点都可键盘打开面板。方向键、翻页和年月切换在日历中可用，方向键在时间列切换选项，Esc 和确认后焦点回到触发器。',
  ],
};
export const timeRangePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '时间范围选择器', 'en-US': 'Time range picker' },
  summary: {
    'zh-CN': '当天的起止时段，保留秒级步进和表单重置。',
    'en-US': 'Start and end slots within a day, keeping second-level stepping and form resets.',
  },
  usage: [...rangeUsage, '仅用于同一天内的时段；跨午夜请使用包含日期的日期时间范围。step 单位为秒。'],
  demos: [{ title: '工作时段与重置', code: timeRangeSource, render: () => <TimeRangePickerDemo />, layout: 'stack' }],
  api: [{ component: 'TimeRangePicker', props: temporalRangeProps }],
  a11y: rangeA11y,
};
export const numberRangePickerDoc: ComponentDoc = {
  name: { 'zh-CN': '数值范围选择器', 'en-US': 'Number range picker' },
  summary: {
    'zh-CN': '数值上下限输入，适合筛选区间；已有滑条 Range 仍用于单个数值。',
    'en-US':
      'Upper and lower number bounds input for filter ranges; the existing Range slider stays for a single value.',
  },
  usage: [
    ...rangeUsage,
    'value 为 [number | null, number | null]，空端点为 null，数值 0 保留。step 默认 1；小数可指定精度或 any。',
  ],
  demos: [
    { title: '小数步进与开放范围', code: numberRangeSource, render: () => <NumberRangePickerDemo />, layout: 'stack' },
  ],
  api: [
    {
      component: 'NumberRangePicker',
      props: rangeProps.map((prop) =>
        prop.name === 'value / defaultValue / onValueChange'
          ? { ...prop, type: 'NumberRangeValue / 同类型 / (value: NumberRangeValue) => void', default: '[null, null]' }
          : prop.name === 'min / max / step'
            ? { ...prop, type: "number / number / number | 'any'" }
            : prop,
      ),
    },
  ],
  a11y: rangeA11y,
};
