import type { ComponentDoc } from '../../blocks/types';
import { ChipDemo, TagInputDemo } from './TagInputDemo';
import source from './TagInputDemo.tsx?raw';

export const chipDoc: ComponentDoc = {
  name: { 'zh-CN': '文本令牌', 'en-US': 'Chip' },
  summary: {
    'zh-CN': '复用标签外观的可移除文本令牌，用于已选项与标签输入。',
    'en-US': 'Removable text token reusing the tag look, for selected options and tag inputs.',
  },
  usage: [
    '只接收纯文本 children；移除按钮名称由文本生成，业务删除由 onRemove 处理。',
    '省略 onRemove 时只读，disabled 阻止移除；静态状态标签仍可直接使用 Tag。',
  ],
  demos: [{ title: '移除、只读与禁用', layout: 'stack', code: source, render: () => <ChipDemo /> }],
  api: [
    {
      component: 'Chip',
      props: [
        { name: 'children / onRemove', type: 'string / () => void', description: '文本与可选移除动作。' },
        {
          name: 'disabled / tone',
          type: 'boolean / TagTone',
          default: 'false / neutral',
          description: '禁用动作与公共标签色调。',
        },
        {
          name: 'labels',
          type: 'Partial<ChipLabels>',
          description: 'remove(text) 生成移除名称，默认读取 ConfigProvider。',
        },
      ],
    },
  ],
  a11y: ['移除是命名的原生按钮，支持键盘；不把整个令牌伪装为按钮。', '不支持拖拽或排序，动作仅回调。'],
};

export const tagInputDoc: ComponentDoc = {
  name: { 'zh-CN': '标签输入', 'en-US': 'Tag input' },
  summary: {
    'zh-CN': '支持输入确认、批量粘贴、校验和移除的多值文本输入，保持原生表单接入。',
    'en-US':
      'Multi-value text input with commit-on-enter, batch paste, validation, and removal, keeping native form integration.',
  },
  usage: [
    '回车、英文 / 中文逗号确认，输入法组合期间不确认也不提交；空草稿按退格移除最后一项。',
    '粘贴多项时保留有效项，重复、超长、超过数量上限或校验失败的项留在草稿，并通过 onReject 报告。',
    '去除首尾空格后精确去重，大小写不同视为不同标签；maxTagLength 按 Unicode 码点计数。程序注入的 value 由宿主保证合法。',
    'name 按同名多值提交已确认标签；草稿不计入表单。required 要求至少一个已确认标签。',
    '值和输入草稿都可受控；reset 恢复非受控初值，受控值保留。保存、权限和工作区恢复由宿主管理。',
  ],
  demos: [{ title: '输入、验证与表单重置', layout: 'stack', code: source, render: () => <TagInputDemo /> }],
  api: [
    {
      component: 'TagInput',
      props: [
        {
          name: 'value / defaultValue / onValueChange',
          type: 'readonly string[] / readonly string[] / (values) => void',
          description: '已确认标签的受控 / 非受控值。',
        },
        {
          name: 'options',
          type: 'readonly TagInputOption[]',
          description: '可选预设标签，渲染为可点击切换多选的圆角按钮，同时支持自由输入新增。',
        },
        {
          name: 'inputValue / defaultInputValue / onInputValueChange',
          type: 'string / string / (value) => void',
          description: '待确认草稿，可供宿主恢复。',
        },
        {
          name: 'maxTags / maxTagLength / validateTag',
          type: 'number / number / (text) => boolean',
          description: '可选数量、长度和同步校验；未提供上限时不限制。',
        },
        {
          name: 'onReject',
          type: '(items: readonly TagRejection[]) => void',
          description: 'value 与 duplicate / limit / length / invalid 原因。',
        },
        {
          name: 'labels',
          type: 'Partial<TagInputLabels>',
          description: '占位、校验和添加反馈；令牌的移除文案使用 chip 分组。',
        },
        {
          name: '…input 属性',
          type: '原生 input 属性',
          description:
            'name / form / required / readOnly / disabled / ref 等；ref 指向文本输入，className / style 作用于外框。',
        },
      ],
    },
  ],
  a11y: [
    'Field 自动关联名称 / 错误，拒绝反馈可见并关联输入；添加结果使用礼貌状态区。',
    '移除后焦点回输入；复制粘贴只读取用户触发的粘贴事件，不请求系统剪贴板。',
  ],
};
