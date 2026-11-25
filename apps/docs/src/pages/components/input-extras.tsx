import type { ComponentDoc } from '../../blocks/types';
import { RangeSliderDemo } from './RangeSliderDemo';
import { OTPInputDemo } from './OTPInputDemo';
import { RatingDemo } from './RatingDemo';
import { RangeInputDemo } from './RangeInputDemo';
import rangeSource from './RangeSliderDemo.tsx?raw';
import rangeInputSource from './RangeInputDemo.tsx?raw';
import otpSource from './OTPInputDemo.tsx?raw';
import ratingSource from './RatingDemo.tsx?raw';

export const rangeSliderDoc: ComponentDoc = {
  name: { 'zh-CN': '双滑块范围', 'en-US': 'Range slider' },
  summary: {
    'zh-CN': '两个原生范围输入共用轨道，提供起止值、最小间隔和键盘操作。',
    'en-US': 'Two native range inputs share one track, providing start and end values, a minimum gap, and keyboard operation.',
  },
  usage: ['单值使用 Range，手动输入端点使用 NumberRangePicker；双滑块用于直观地限制一个数值区间。',
    '起止值支持受控 / 非受控，name 分别传两个字段名；reset 恢复非受控初值，受控值保留。',
    'step 为正数，max 向下对齐 min 起始的步长网格，minGap 向上对齐并限制在有效跨度内。',
    '宿主值规范到边界和步长，冲突时先确定结束值，再限制起始值；不会交换端点或因 props 改变触发回调。',
    '数值限 ±10¹²、步长至少 10⁻⁸，精度最多十位小数；跨度为零时禁用输入，不参与原生提交。'],
  demos: [{ title: '双值表单、间隔与小数步进', layout: 'stack', code: rangeSource, render: () => <RangeSliderDemo /> }],
  api: [{ component: 'RangeSlider', props: [
    { name: 'label / name', type: 'ReactNode / readonly [string, string]', description: '分组 legend 与起止字段名；不再包 Field。' },
    { name: 'value / defaultValue / onValueChange', type: 'RangeSliderValue / RangeSliderValue / (value) => void',
      default: '— / [min, max] / —', description: 'readonly [number, number]，按起止顺序提供。' },
    { name: 'min / max / step / minGap', type: 'number', default: '0 / 100 / 1 / 0', description: '边界、步长与两滑块最小间隔。' },
    { name: 'hint / error / labels', type: 'ReactNode / ReactNode / Partial<ComponentLabels["rangeSlider"]>',
      description: '说明、宿主错误与两端点名称，消费全局文案配置。' },
    { name: '…fieldset 属性', type: 'ComponentProps<fieldset>', description: 'disabled、form、ref、className、style 和原生事件。' },
  ] }],
  a11y: ['两个原生 slider 都能 Tab 聚焦，保留方向键、Home / End 和平台原生步进；拖动仅改变对应端点。',
    '可访问上下界随另一个端点与间隔更新，标签和错误分别关联；共用单滑条的轨道 / 滑块外观。'],
};

export const rangeInputDoc: ComponentDoc = {
  name: { 'zh-CN': '滑块数值输入', 'en-US': 'Range input' },
  summary: {
    'zh-CN': '把原生滑块与精确数值输入组合在一行，双向同步并只提交一个表单值。',
    'en-US': 'Combines a native slider and numeric input in one row, synchronizing both while submitting one form value.',
  },
  usage: [
    '用一个控件同时支持拖动调节与精确输入；label 命名控件组，name 只落在数值输入上。',
    'value / defaultValue 采用单值受控 / 非受控模式；数值输入按 min、max、step 规范后同步到滑块。',
    'step 为正数，边界按 min 起始的步长网格对齐；未指定时使用 0、100、1。',
    '原生方向键、必填、禁用、只读、外部 form 和 reset 保留；禁用字段不进入 FormData。',
    'suffix 仅作为可见单位展示；hint / error 关联到两个输入，组件不执行保存或业务请求。',
  ],
  demos: [{ title: '双向同步、单位与原生表单', layout: 'stack', code: rangeInputSource, render: () => <RangeInputDemo /> }],
  api: [{ component: 'RangeInput', props: [
    { name: 'label', type: 'ReactNode', description: '控件组名称，同时作为滑块与数值输入的可访问名称前缀。' },
    { name: 'value / defaultValue / onValueChange', type: 'number / number / (value) => void',
      default: '— / min / —', description: '受控 / 非受控数值；两种输入保持一致。' },
    { name: 'min / max / step / precision', type: 'number', default: '0 / 100 / 1 / —',
      description: '滑块与数值输入共用的边界、步长和小数精度。' },
    { name: 'name / suffix', type: 'string / ReactNode', description: '单一表单字段名与可见单位后缀。' },
    { name: 'required / readOnly / disabled', type: 'boolean', default: 'false', description: '原生必填、只读与禁用语义。' },
    { name: 'hint / error / labels', type: 'ReactNode / ReactNode / Partial<RangeInputLabels>',
      description: '辅助说明、错误状态与滑块 / 数值的屏幕阅读器标签。' },
    { name: '…fieldset 属性', type: 'ComponentProps<fieldset>', description: 'form、ref、className、style、ARIA 与数据属性。' },
  ] }],
  a11y: [
    '保留独立可聚焦的原生 slider 与 spinbutton，均由 legend 命名；方向键行为与浏览器原生控件一致。',
    'name 只绑定数值输入，避免同一值在 FormData 中重复；hint 与 error 同时关联两个输入。',
  ],
};

export const otpInputDoc: ComponentDoc = {
  name: { 'zh-CN': '分段验证码', 'en-US': 'OTP input' },
  summary: { 'zh-CN': '使用单个原生文本输入承接验证码，显示为可定位的分段格。', 'en-US': 'Uses a single native text input for verification codes displayed as focusable segments.' },
  usage: ['配合 Field 提供标签，未提供名称时使用默认验证码文案；ref 指向唯一的原生 input。',
    '只接受数字，支持全角数字归一化与粘贴分隔文本；length 限 1～12，默认六位。',
    '整串粘贴覆盖全部值，部分粘贴替换当前选区；方向键、选择与退格保留单输入的原生行为。',
    '输入法组合期间保留临时内容，完成后再规范数字；完整长度通过 pattern 校验，required 决定是否允许空值。',
    '不会自动提交、验证、发短信或持久化验证码；宿主在锁屏、登出和验证结束时清空，禁止加入恢复快照。'],
  demos: [{ title: '输入、粘贴与原生校验', layout: 'stack', code: otpSource, render: () => <OTPInputDemo /> }],
  api: [{ component: 'OTPInput', props: [
    { name: 'value / defaultValue / onValueChange', type: 'string / string / (value) => void', default: '— / 空串 / —',
      description: '仅提交规范后的数字字符串，输入完成不会自动触发业务操作。' },
    { name: 'length', type: 'number', default: '6', description: '段数与合法长度，取 1～12 的整数。' },
    { name: 'labels', type: 'Partial<ComponentLabels["otpInput"]>', description: '没有 Field 或显式名称时的默认可访问名称。' },
    { name: '…input 属性', type: 'ComponentProps<input>', description: 'name、form、required、disabled、readOnly、ref 和事件；外框接收 className / style。' },
  ] }],
  a11y: ['仅一个 textbox 和表单字段，辅助技术不会重复读取分段格；保留原生自动填充。',
    '文本输入焦点只提示当前分段，中性细边框；原生验证失败显示错误并聚焦输入。'],
};

export const ratingDoc: ComponentDoc = {
  name: { 'zh-CN': '评分', 'en-US': 'Rating' },
  summary: {
    'zh-CN': '以星形展示整数评分，保留同名原生单选、清空与必填语义。',
    'en-US': 'Shows an integer rating as stars, keeping native same-name radios, clearing, and required semantics.',
  },
  usage: ['0 表示尚未评分，合法分数为 1～max，max 限 1～10；不提供半星或业务评分计算。',
    '方向键切换分数；readOnly 保留焦点与原生表单值，disabled 沿用原生排除提交规则。',
    'clearable 可清空到 0；required 要求实际选中一个分数，不把 0 作为已评分提交。',
    'reset 恢复非受控初值、受控值保留；组件只回调分数，不请求、保存或聚合评价。'],
  demos: [{ title: '评分、清空、必填与只读', layout: 'stack', code: ratingSource, render: () => <RatingDemo /> }],
  api: [{ component: 'Rating', props: [
    { name: 'label / name', type: 'ReactNode / string', description: '分组 legend 与原生提交字段名；不再包 Field。' },
    { name: 'value / defaultValue / onValueChange', type: 'number / number / (score) => void', default: '— / 0 / —', description: '整数分数，有限数值规范为 0～max。' },
    { name: 'max / clearable', type: 'number / boolean', default: '5 / true', description: '最高分与清空入口。' },
    { name: 'readOnly / required / disabled', type: 'boolean', default: 'false', description: '只读、必填与原生禁用。' },
    { name: 'hint / error / labels', type: 'ReactNode / ReactNode / Partial<RatingLabels>', description: '说明、宿主错误与评分 / 清空 / 未评分文案。' },
    { name: '…fieldset 属性', type: 'ComponentProps<fieldset>', description: 'form、ref、className、style 和原生事件。' },
  ] }],
  a11y: ['radiogroup / legend 命名，原生 radio 提供 checked 与必填约束；同组只保留一个 Tab 入口。',
    '星形之外有明确分数文字和 status，不只靠颜色；方向键处理与 RadioGroup 共用。'],
};
