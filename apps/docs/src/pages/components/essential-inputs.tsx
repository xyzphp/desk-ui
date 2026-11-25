import type { ComponentDoc } from '../../blocks/types';
import { RadioDemo, RadioGroupDemo } from './RadioDemo';
import radioSource from './RadioDemo.tsx?raw';
import { InputNumberDemo } from './InputNumberDemo';
import numberSource from './InputNumberDemo.tsx?raw';
import { PasswordInputDemo } from './PasswordInputDemo';
import passwordSource from './PasswordInputDemo.tsx?raw';

export const radioDoc: ComponentDoc = {
  name: { 'zh-CN': '单选', 'en-US': 'Radio' },
  summary: {
    'zh-CN': '保留原生同名选择与表单提交的单选控件，用于互斥的表单值。',
    'en-US': 'Radio control that keeps native same-name selection and form submission, for mutually exclusive form values.',
  },
  usage: [
    '同一组使用相同 name 和不同 value；使用 defaultChecked 或受控 checked。',
    '需要组标题、方向键、默认值重置和错误说明时使用 RadioGroup；视图切换仍使用 SegmentedControl。',
  ],
  demos: [{ title: '同名选项与原生表单', layout: 'stack', code: radioSource, render: () => <RadioDemo /> }],
  api: [
    {
      component: 'Radio',
      props: [
        { name: 'value / children', type: 'string / ReactNode', description: '提交值与可见名称。' },
        {
          name: 'checked / defaultChecked / onChange',
          type: '原生 input 属性',
          description: '受控 / 非受控与真实 change 事件。',
        },
        {
          name: 'name / form / disabled / required / ref',
          type: '原生 input 属性',
          description: '表单、禁用、约束与原生 ref。',
        },
      ],
    },
  ],
  a11y: [
    '原生 input[type=radio]，整行标签可点击，保留清晰的小范围键盘焦点。',
    '禁用项不可激活；图形、文字与选中态使用公共主题令牌。',
  ],
};

export const radioGroupDoc: ComponentDoc = {
  name: { 'zh-CN': '单选组', 'en-US': 'Radio group' },
  summary: {
    'zh-CN': '组合单选控件并提供字段组名称、错误、键盘切换和受控值。',
    'en-US': 'Composes radio controls with a field group name, errors, keyboard switching, and controlled values.',
  },
  usage: [
    '子项使用 Radio；不要与其它组复用同一 name。省略 name 会生成唯一组名。',
    '上下左右方向键循环选择并跳过禁用项，Tab 使用原生同名组焦点行为。',
    '非受控 reset 恢复 defaultValue；受控 reset 保留宿主 value。外部表单通过 form 关联。',
  ],
  demos: [{ title: '分组、禁用与重置', layout: 'stack', code: radioSource, render: () => <RadioGroupDemo /> }],
  api: [
    {
      component: 'RadioGroup',
      props: [
        { name: 'label / children', type: 'ReactNode', description: '组名称和 Radio 子项。' },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string / string / (value) => void',
          description: '受控或非受控选择。',
        },
        { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: '选项排列。' },
        {
          name: 'name / form / disabled / required',
          type: 'string / string / boolean / boolean',
          description: '表单与约束，自动传入各子项。',
        },
        { name: 'hint / error', type: 'ReactNode', description: '组描述，错误优先并关联各单选。' },
      ],
    },
  ],
  a11y: [
    'fieldset / legend 与 radiogroup 命名，错误关联到组和各控件。',
    '提供 aria-required，实际 required 校验仍由原生表单负责。',
  ],
};

export const inputNumberDoc: ComponentDoc = {
  name: { 'zh-CN': '数字输入', 'en-US': 'Number input' },
  summary: {
    'zh-CN': '带步进按钮的原生数字输入，支持空值、精度、表单约束和中性焦点。',
    'en-US': 'Native number input with stepper buttons, supporting empty values, precision, form constraints, and a neutral focus.',
  },
  usage: [
    'value / defaultValue 使用 number 或 null，空值不等于 0；Field 提供标签和描述。',
    '键入时保留原生草稿和范围校验，不把越界内容悄悄改为边界值。precision 在失焦和步进时舍入，范围与步长应与精度匹配。',
    '步进和上下方向键遵循原生步长与边界；step="any" 时按钮按 1 步进。输入法组合期间不执行步进。',
    '与 NumberRangePicker 共用有限数值解析；受控值由宿主接受或拒绝，reset 不自动提交。',
  ],
  demos: [{ title: '精度、空值与原生表单', layout: 'stack', code: numberSource, render: () => <InputNumberDemo /> }],
  api: [
    {
      component: 'InputNumber',
      props: [
        {
          name: 'value / defaultValue / onValueChange',
          type: 'number | null / number | null / (value) => void',
          description: '空值为 null，非有限值显示为空。',
        },
        {
          name: 'min / max / step',
          type: "number / number / number | 'any'",
          default: '— / — / 1',
          description: '原生范围和步长；步长须为正。',
        },
        {
          name: 'precision / controls',
          type: 'number / boolean',
          default: '— / true',
          description: '0–12 位舍入精度，是否显示步进按钮。',
        },
        {
          name: 'labels',
          type: 'Partial<InputNumberLabels>',
          description: 'increase / decrease；默认读取 ConfigProvider。',
        },
        {
          name: '…input 属性',
          type: '原生属性',
          description:
            'name、form、required、readOnly、disabled、onChange、ref 等；ref 指向 input。className / style 作用于外框。',
        },
      ],
    },
  ],
  a11y: [
    '原生 spinbutton 与键盘编辑，步进按钮有名称，边界 / 禁用 / 只读时不可操作。',
    '只保留外框一层细边框，内部无原生黑色描边。',
  ],
};

export const passwordInputDoc: ComponentDoc = {
  name: { 'zh-CN': '密码输入', 'en-US': 'Password input' },
  summary: {
    'zh-CN': '用于密码、密钥等内容的输入视图，带可访问的显隐切换，默认隐藏。',
    'en-US': 'Input view for passwords and keys with an accessible visibility toggle, hidden by default.',
  },
  usage: [
    '输入值和“留空保留已有配置”的规则由宿主提供，组件不读取服务端已保存值。',
    '默认 type=password，显隐不修改内容；表单重置、禁用或关闭显隐能力后重新隐藏。',
    '配合 Field 关联名称和错误。密码不加入持久化草稿；锁屏时由宿主卸载或清空。',
    '密码修改页可把多个 PasswordInput 放进同一 Panel，用行分隔字段，并在组内组合验证码和提交操作；分组布局由业务页面负责。',
  ],
  demos: [{ title: '密码与安全表单组', layout: 'stack', code: passwordSource, render: () => <PasswordInputDemo /> }],
  api: [
    {
      component: 'PasswordInput',
      props: [
        {
          name: 'value / defaultValue / onChange',
          type: '原生 input 属性',
          description: '沿用原生值与表单，不复制一份明文状态。',
        },
        {
          name: 'revealable / onVisibilityChange',
          type: 'boolean / (visible: boolean) => void',
          default: 'true / —',
          description: '显隐按钮和状态回调。',
        },
        {
          name: 'labels',
          type: 'Partial<PasswordInputLabels>',
          description: 'show / hide，支持 Provider 和组件覆盖。',
        },
        {
          name: '…input 属性',
          type: '原生属性',
          description: 'autoComplete、name、form、ref、只读和禁用等。className / style 作用于外框。',
        },
      ],
    },
  ],
  a11y: [
    '切换按钮有名称与 aria-pressed，不触发表单提交；原生输入保留标签和错误描述。',
    '切换保留输入内容，指针操作不抢走输入焦点。',
  ],
};
