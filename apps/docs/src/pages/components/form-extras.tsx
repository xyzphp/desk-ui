import type { ComponentDoc } from '../../blocks/types';
import { CheckboxGroupDemo } from './CheckboxGroupDemo';
import { FormDemo } from './FormDemo';
import { ColorPickerDemo } from './ColorPickerDemo';
import { FieldAddonDemo } from './FieldAddonDemo';
import { InputGroupDemo } from './InputGroupDemo';
import checkboxSource from './CheckboxGroupDemo.tsx?raw';
import formSource from './FormDemo.tsx?raw';
import colorSource from './ColorPickerDemo.tsx?raw';
import fieldAddonSource from './FieldAddonDemo.tsx?raw';
import inputGroupSource from './InputGroupDemo.tsx?raw';

export const checkboxGroupDoc: ComponentDoc = {
  name: { 'zh-CN': '复选框组', 'en-US': 'Checkbox group' },
  summary: {
    'zh-CN': '组合现有 Checkbox 的原生表单多选，支持分组校验、只读与半选展示。',
    'en-US': 'Native form multi-select composing existing checkboxes, with group validation, read-only, and indeterminate display.',
  },
  usage: ['label 使用 legend，不需要再包 Field；每项 value 唯一且稳定，name 按同名多值提交。',
    'required 要求至少选中一个可用项；全部项禁用或为空时没有可校验字段。禁用项的已有值保留，但原生表单排除。',
    'indeterminate 只控制外观与原生混合状态，不等于选中，不自动计算父子关系或权限继承。',
    '值支持受控 / 非受控，reset 恢复非受控初值，受控值保留；readOnly 可聚焦、可提交但不能切换。',
    '需要权限父子联动时继续使用 PermissionTree / SelectionTree；本组件不包含业务授权或保存。'],
  demos: [{ title: '多选、必填与原生表单', layout: 'stack', code: checkboxSource, render: () => <CheckboxGroupDemo /> }],
  api: [{ component: 'CheckboxGroup', props: [
    { name: 'label / options', type: 'ReactNode / readonly CheckboxOption[]', description: '分组标题；选项含 value、label、disabled、indeterminate。' },
    { name: 'value / defaultValue / onValueChange', type: 'readonly string[] / readonly string[] / (values) => void',
      default: '— / [] / —', description: '已选项；未展示的值保留在状态中，不生成隐藏提交字段。' },
    { name: 'required / readOnly / disabled', type: 'boolean', default: 'false', description: '至少选一项校验、只读或整体禁用。' },
    { name: 'direction / hint / error', type: 'horizontal | vertical / ReactNode / ReactNode', default: 'horizontal', description: '排列、说明与宿主错误。' },
    { name: 'name / form / ref', type: '原生 fieldset 属性', description: 'name 应用于所有选项；form 支持外部表单关联；ref 指向 fieldset。' },
    { name: 'labels', type: 'Partial<ComponentLabels["checkboxGroup"]>', description: '分组必填和空选项文案。' },
  ] }, { component: 'Checkbox', props: [
    { name: 'indeterminate', type: 'boolean', default: 'false', description: '第七批补充的原生混合状态，ref 仍指向 input。' },
  ] }],
  a11y: ['fieldset / legend 提供分组名称，独立 checkbox 保留 Tab 和 Space；混合状态通过原生 indeterminate 表达。',
    '分组必填使用首个可用输入的原生自定义约束，错误可见且关联每项，校验失败聚焦对应输入。',
    '不把每一项都设为 required，避免误要求所有项选中；禁用状态沿用原生表单规则。'],
};

export const formSectionDoc: ComponentDoc = {
  name: { 'zh-CN': '表单分组', 'en-US': 'Form section' },
  summary: {
    'zh-CN': '统一 fieldset / legend 和响应式字段栅格，沿用原系统设置表单布局。',
    'en-US': 'Unified fieldset / legend and responsive field grid, following the original settings form layout.',
  },
  usage: ['只组织已有字段，不创建 form、不收集业务值或自动提交；字段标签仍由 Field 或复合组提供。',
    '原生 disabled 影响本组字段与表单提交；form 属性关联 fieldset 本身，不会自动改变子字段的 form 归属。',
    '列数与间距复用 Grid，窄容器按公共断点折为单列；不要在页面 CSS 里重设字段外观。'],
  demos: [{ title: '分组、响应式字段与保存动作', layout: 'stack', code: formSource, render: () => <FormDemo /> }],
  api: [{ component: 'FormSection', props: [
    { name: 'label / description', type: 'ReactNode / ReactNode', description: '必填 legend 与可选分组说明。' },
    { name: 'columns / gap', type: 'number / Spacing', default: '2 / lg', description: '直接复用 Grid 的列数与公共间距。' },
    { name: 'children / …fieldset 属性', type: 'ReactNode / ComponentProps<fieldset>', description: '字段内容，支持 disabled、ref、className、style 与原生事件。' },
  ] }],
  a11y: ['原生 fieldset / legend 提供字段组语义，说明通过 aria-describedby 关联。',
    '字段保留各自的名称、键盘与校验；不模拟表单状态，不接管焦点。'],
};
export const formActionsDoc: ComponentDoc = {
  name: { 'zh-CN': '表单操作区', 'en-US': 'Form actions' },
  summary: {
    'zh-CN': '统一表单底部状态与动作的位置，复用公共 Inline 和原生禁用分组。',
    'en-US': 'Unified placement for form footer status and actions, reusing the shared Inline and native disabled grouping.',
  },
  usage: ['状态靠左、动作靠右并允许换行；按钮类型显式提供 submit / reset，组件不发起保存。',
    'busy 仅禁用本操作区，不禁用其他字段；需要冻结正文时由宿主同步禁用 FormSection。',
    '已有表单规则和请求生命周期由宿主管理，不根据状态文字推断成功或失败。'],
  demos: [{ title: '状态、禁用与原生提交', layout: 'stack', code: formSource, render: () => <FormDemo /> }],
  api: [{ component: 'FormActions', props: [
    { name: 'label', type: 'string', default: '表单操作', description: '分组可访问名称，默认读取 ConfigProvider.form。' },
    { name: 'status / children', type: 'ReactNode / ReactNode', description: '礼貌状态区与动作按钮插槽。' },
    { name: 'busy / disabled', type: 'boolean', default: 'false', description: '设置原生 disabled；busy 同时表达 aria-busy。' },
    { name: '…fieldset 属性', type: 'ComponentProps<fieldset>', description: 'ref、className、style 和原生属性。' },
  ] }],
  a11y: ['操作区有名称，状态使用 status；按钮保留自身语义与键盘操作。', '原生 fieldset 禁用不替代服务端鉴权或宿主重复提交保护。'],
};

export const fieldAddonDoc: ComponentDoc = {
  name: { 'zh-CN': '表单附件组合', 'en-US': 'Field addon' },
  summary: {
    'zh-CN': '主控件与尾部附件（勾选框、开关或短文本）共用一个表面，统一边框、悬停与焦点态。',
    'en-US': 'A main control and a trailing addon (checkbox, switch, or short text) share one surface with unified border, hover, and focus states.',
  },
  usage: [
    '主控件放 children，附件放 addon；自带边框的库控件外壳被抹平，边框与焦点态由组合表面呈现。',
    '附件推荐复用 Checkbox / Switch 等库控件；纯文本附件用 span 包裹。',
    '组合只是布局表面，不管理表单状态；无独立标签时由 aria-label 提供控件名称。',
  ],
  demos: [{ title: '下拉 + 勾选、输入框 + 单位', layout: 'stack', code: fieldAddonSource, render: () => <FieldAddonDemo /> }],
  api: [{ component: 'FieldAddon', props: [
    { name: 'children / addon', type: 'ReactNode / ReactNode', description: '主控件与尾部附件；addon 为空或 false 时不渲染附件列。' },
    { name: '…div 属性', type: 'ComponentProps<"div">', description: 'ref、className、style 与原生属性。' },
  ] }],
  a11y: ['组合容器不产生额外语义，子控件保留各自标签、键盘与校验；焦点落在任一子控件时表面呈现统一焦点边框。'],
};

export const inputGroupDoc: ComponentDoc = {
  name: { 'zh-CN': '输入表单组', 'en-US': 'Input group' },
  summary: {
    'zh-CN': '将输入控件、前后缀文本与相邻操作按钮拼成一整行共享边框的表单组，输入项自动撑满剩余宽度。',
    'en-US': 'Stitches inputs, static addons, and adjacent action buttons into one full-width row where the input grows to fill remaining space.',
  },
  usage: [
    '用于「输入框 + 一个或多个操作按钮」「前缀/后缀 + 输入框」「下拉 + 输入框 + 动作」等需要整行对齐的组合表单。',
    '默认 block=true 撑满父容器宽度，输入控件自动 flex 拉伸；按钮与 InputGroupAddon 保持自身宽度且不换行。',
    '窄容器（Workspace <= 440px 或视口 <= 400px）下默认自动换行并恢复各子项独立圆角，防止输入内容被挤压。',
    '与 FieldAddon 的区别：FieldAddon 适合主控件内嵌勾选框 / 开关 / 短单位；InputGroup 适合多个同级控件（特别是主次操作按钮）无缝拼边。',
  ],
  demos: [{ title: '输入框 + 多按钮、前后缀与下拉组合', layout: 'stack', code: inputGroupSource, render: () => <InputGroupDemo /> }],
  api: [
    {
      component: 'InputGroup',
      props: [
        { name: 'block', type: 'boolean', default: 'true', description: '是否撑满父容器整行；设为 false 时按内容宽度收缩。' },
        { name: 'responsive', type: 'boolean', default: 'true', description: '窄容器下自动换行并恢复独立圆角。' },
        { name: 'children / …div 属性', type: 'ReactNode / ComponentProps<"div">', description: '组合的 Input、Select、Button、InputGroupAddon 与原生属性。' },
      ],
    },
    {
      component: 'InputGroupAddon',
      props: [
        { name: 'children / …span 属性', type: 'ReactNode / ComponentProps<"span">', description: '静态前缀或后缀文本槽。' },
      ],
    },
  ],
  a11y: [
    '容器不注入冗余语义，可配合 Field 或 SettingsRow 提供分组标签；各子控件保留独立的键盘导航、焦点环与原生校验。',
    '悬停或聚焦任意子控件时自动提升层叠顺序，确保焦点边框完整可见不被相邻边线裁切。',
  ],
};

export const colorPickerDoc: ComponentDoc = {
  name: { 'zh-CN': '取色器', 'en-US': 'Color picker' },
  summary: {
    'zh-CN': '结合原系统色卡、HEX 草稿和原生取色面板，使用公共输入与选中状态。',
    'en-US': 'Combines the original swatches, HEX drafts, and native color panel using shared input and selected states.',
  },
  usage: ['支持 #RGB、#RRGGBB 与空值；不支持透明度、颜色函数、CSS 变量或任意 CSS 字符串。',
    '文本保留编辑草稿，合法值触发 onValueChange，失焦规范为六位小写；不合法草稿保留并由原生 pattern 阻止提交。',
    'presets 由宿主提供，不额外创造业务配色；非法预设被过滤。已选色卡使用公共浅色背景和勾选。',
    'ref 指向 HEX 输入；onValueChange 接收全部选择途径，原生 onChange 对应文本输入事件。',
    '清空为可选行为，required 由原生约束校验；readOnly 保留文本提交并禁用取色 / 色卡操作。'],
  demos: [{ title: '色卡、取色与表单校验', layout: 'stack', code: colorSource, render: () => <ColorPickerDemo /> }],
  api: [{ component: 'ColorPicker', props: [
    { name: 'value / defaultValue / onValueChange', type: 'string / string / (hex) => void', default: '— / 空串 / —',
      description: '已确认颜色，宿主提供合法 HEX 或空串；受控拒绝时恢复宿主值。' },
    { name: 'presets', type: 'readonly ColorPreset[]', default: '[]', description: 'value / label 预设列表，只显示合法非空 HEX。' },
    { name: 'clearable / labels', type: 'boolean / Partial<ColorPickerLabels>', default: 'true', description: '清空按钮与取色、色卡和占位文案。' },
    { name: '…input 属性', type: 'ComponentProps<input>', description: 'Field、name、form、required、readOnly、disabled、ref 与事件；className / style 作用于外框。' },
  ] }],
  a11y: ['颜色之外保留文字名称、HEX 与选中勾选；原生 color 输入提供平台取色面板的键盘能力。',
    '文本和复合框只保留一层中性焦点；非法 / 必填错误关联文本输入。Esc 放弃未确认草稿，reset 恢复初值。',
    '空值时原生取色按钮预览黑色作为平台起点，不代表文本表单值为黑色；提交使用 HEX 文本。'],
};
