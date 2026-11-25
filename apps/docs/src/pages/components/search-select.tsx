import type { ComponentDoc } from '../../blocks/types';
import { ComboboxDemo } from './ComboboxDemo';
import { MultiSelectDemo } from './MultiSelectDemo';
import comboboxSource from './ComboboxDemo.tsx?raw';
import multiSource from './MultiSelectDemo.tsx?raw';

const sharedProps = [
  { name: 'query / defaultQuery / onQueryChange', type: 'string / string / (query) => void', description: '搜索草稿，独立于提交值；关闭后清空。' },
  { name: 'loading / readOnly / clearable', type: 'boolean', default: 'false / false / true', description: '加载时阻止选项修改；只读阻止展开；清空保留禁用的已选项。' },
  { name: 'labels / searchLabels', type: 'Partial<ComponentLabels["select"]> / Partial<SearchSelectLabels>', description: '基础占位 / 空态与搜索、清空、加载、计数文案。' },
  { name: '…select 属性', type: '原生 select 属性', description: 'children、name、form、required、disabled、ref、Field 关联和原生 change；ref 指向 select，focus 转到可见控件。' },
];
const sharedUsage = [
  '复用 Select 的原生表单、option / optgroup、禁用分组和轻量选中态；不是系统原生下拉菜单。',
  '按标签、值、组名及 option 的 data-search-text 筛选；大小写不敏感，多个空白分词必须同时命中。拼音别名需宿主提供。',
  '输入仅筛选已有选项，不创建新值；不包含远程请求、防抖、虚拟列表或业务权限判断。',
  '受控值与搜索草稿分别交给宿主；reset 恢复非受控初值并关闭面板，受控值保留。',
];
export const comboboxDoc: ComponentDoc = {
  name: { 'zh-CN': '搜索选择器', 'en-US': 'Combobox' },
  summary: {
    'zh-CN': '带输入筛选的单选控件，复用 Select 的选项模型、原生表单和公共菜单。',
    'en-US': 'Single-select control with input filtering, reusing the Select option model, native form integration, and shared menu.',
  },
  usage: [...sharedUsage, '需要任意文本输入时使用 Input；多值自由文本使用 TagInput，多选已有值使用 MultiSelect。'],
  demos: [{ title: '搜索、分组与状态', layout: 'stack', code: comboboxSource, render: () => <ComboboxDemo /> }],
  api: [{ component: 'Combobox', props: [
    { name: 'value / defaultValue / onValueChange', type: 'string / string / (value: string) => void', description: '单选值；清空时为空串。也可使用原生 onChange。' },
    ...sharedProps,
  ] }],
  a11y: ['输入框使用 combobox + listbox；焦点留在输入框，通过 aria-activedescendant 表达当前候选。',
    '上下键移动候选，Home / End 在展开时跳首尾，回车确认且不提交表单，Esc 关闭；输入法组合期间不确认。',
    '必填错误关联可见输入；禁用 / 只读保持原生表单边界，加载和空结果提供可见反馈。'],
};
export const multiSelectDoc: ComponentDoc = {
  name: { 'zh-CN': '多选下拉', 'en-US': 'Multi-select' },
  summary: {
    'zh-CN': '支持搜索、标签移除和数量折叠的枚举多选面板，提交同名多值。',
    'en-US': 'Enumerated multi-select panel with search, tag removal, and count collapsing, submitting same-name multiple values.',
  },
  usage: [...sharedUsage, '选择后保持展开；标签显示上限只影响展示，完整已选值通过可访问说明和计数保留。',
    '清空与退格保留禁用分组 / 选项中的已有选择；onValueChange 保留这些值，原生 FormData 按浏览器规则排除禁用项。',
    '需要始终可见的列表时继续使用 Select multiple；本组件专用于可搜索的下拉多选。'],
  demos: [{ title: '搜索、多选与表单重置', layout: 'stack', code: multiSource, render: () => <MultiSelectDemo /> }],
  api: [{ component: 'MultiSelect', props: [
    { name: 'value / defaultValue / onValueChange', type: 'readonly string[] / readonly string[] / (values) => void',
      description: '受控 / 非受控多选值；原生 onChange 也保留。' },
    { name: 'maxVisibleTags', type: 'number', default: '3', description: '最多可见标签数，溢出显示 +N；0 仅显示数量。' },
    ...sharedProps,
  ] }],
  a11y: ['触发器声明 dialog，展开后焦点进入搜索框；内部 combobox 控制多选 listbox，选项使用 aria-selected。',
    '搜索框的上下键与回车移动 / 切换候选；空草稿退格移除最后一个可编辑项；Esc 返回触发器。',
    '标签移除是独立命名按钮，没有按钮嵌套；必填使用原生 select 约束，name 按同名多值提交。'],
};
