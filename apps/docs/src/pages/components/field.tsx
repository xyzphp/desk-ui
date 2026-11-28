import { useState } from 'react';
import { Button, Field, Input, Range, Select, Textarea } from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';
import { SelectFormDemo } from './SelectFormDemo';
import selectFormSource from './SelectFormDemo.tsx?raw';

function Validation() {
  const [name, setName] = useState('');
  const error = name.trim() === '' ? '名称不能为空' : undefined;
  return (
    <div style={{ width: 'min(100%, 360px)' }}>
      <Field label="令牌名称" required hint="最多 80 字" error={error}>
        <Input value={name} maxLength={80} placeholder="例如：AI 工作助手" onChange={(e) => setName(e.target.value)} />
      </Field>
    </div>
  );
}

export const doc: ComponentDoc = {
  name: { 'zh-CN': '字段容器', 'en-US': 'Field' },
  summary: {
    'zh-CN': '为单个表单控件提供可见标签、提示与错误，自动关联控件名称、描述及错误状态。',
    'en-US':
      'Provides a visible label, hint, and error for a single form control, auto-linking the control name, description, and error state.',
  },
  usage: [
    '需要可见标签时用 Field 包住控件，id、aria-describedby、aria-invalid 由 Field 注入，不需要手写。',
    '没有可见标签的控件（如列表筛选）自行提供 aria-label。',
    '错误优先于提示显示，并使用 role="alert" 通知读屏软件；提示文字保持简短，必要说明改用 HelpTip。',
    '一个字段容器对应一个控件；required 只显示星号，原生必填校验还需给内部控件传 required。',
  ],
  demos: [
    {
      title: '基本用法',
      code: `<Field label="名称"><Input placeholder="请输入名称" /></Field>
<Field label="有效期">
  <Select defaultValue="30">
    <option value="7">7 天</option>
    <option value="30">30 天</option>
    <option value="0">永久</option>
  </Select>
</Field>
<Field label="说明" tip="建议简明填写用途与范围，悬停或聚焦问号可查看补充说明。"><Textarea placeholder="补充说明" /></Field>`,
      layout: 'stack',
      render: () => (
        <>
          <Field label="名称">
            <Input placeholder="请输入名称" />
          </Field>
          <Field label="有效期">
            <Select defaultValue="30">
              <option value="7">7 天</option>
              <option value="30">30 天</option>
              <option value="0">永久</option>
            </Select>
          </Field>
          <Field label="说明" tip="建议简明填写用途与范围，悬停或聚焦问号可查看补充说明。">
            <Textarea placeholder="补充说明" />
          </Field>
        </>
      ),
    },
    {
      title: '校验与提示',
      description: '清空输入框可看到错误态；有错误时提示被替换。',
      code: `<Field label="令牌名称" required hint="最多 80 字" error={error}>
  <Input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
</Field>`,
      render: () => <Validation />,
    },
    {
      title: '只读与禁用',
      code: `<Field label="令牌前缀"><Input readOnly value="tk_3f9a" /></Field>
<Field label="创建人"><Input disabled value="管理员" /></Field>`,
      layout: 'stack',
      render: () => (
        <>
          <Field label="令牌前缀">
            <Input readOnly defaultValue="tk_3f9a" />
          </Field>
          <Field label="创建人">
            <Input disabled defaultValue="管理员" />
          </Field>
        </>
      ),
    },
  ],
  api: [
    {
      component: 'Field',
      props: [
        { name: 'label', type: 'ReactNode', description: '必填，可见标签。' },
        { name: 'tip', type: 'string', description: '标签旁的问号悬停提示，用于收起长段说明而不堆叠小字。' },
        { name: 'hint', type: 'ReactNode', description: '辅助说明，通过 aria-describedby 关联。' },
        { name: 'error', type: 'ReactNode', description: '错误信息；存在时控件标记 aria-invalid，并替代 hint。' },
        { name: 'required', type: 'boolean', description: '在标签后显示 * 标记（不改变原生 required）。' },
      ],
    },
  ],
  a11y: [
    '标签通过 htmlFor 与控件关联；错误以 role="alert" 播报。',
    '控件高度 34px，输入文字 13px；聚焦只调整一层中性细边框，错误态使用红色边框。',
    '禁用态降低对比并显示 not-allowed 光标，只读态使用窗口底色区分。',
  ],
};

export const inputDoc: ComponentDoc = {
  name: { 'zh-CN': '单行输入框', 'en-US': 'Input' },
  summary: {
    'zh-CN': '统一单行输入外观，保留原生输入类型、受控状态、表单与键盘行为。',
    'en-US':
      'Unified single-line input look that keeps native input types, controlled state, form, and keyboard behavior.',
  },
  usage: [
    '需要可见标签时配合字段容器；独立使用时提供 aria-label。',
    'value + onChange 受控，defaultValue 提供非受控初始值。',
    '只读使用 readOnly；暂不可编辑使用 disabled。',
  ],
  demos: [
    {
      title: '默认、只读与禁用',
      code: `<Field label="名称"><Input placeholder="请输入名称" /></Field>
<Field label="记录编号"><Input readOnly defaultValue="record-01" /></Field>
<Field label="创建人"><Input disabled defaultValue="管理员" /></Field>`,
      render: () => (
        <>
          <Field label="名称">
            <Input placeholder="请输入名称" />
          </Field>
          <Field label="记录编号">
            <Input readOnly defaultValue="record-01" />
          </Field>
          <Field label="创建人">
            <Input disabled defaultValue="管理员" />
          </Field>
        </>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Input',
      props: [
        {
          name: '…input 属性',
          type: "ComponentProps<'input'>",
          description: 'type / value / defaultValue / onChange / readOnly / disabled / ref 等透传。',
        },
        { name: 'id / aria-*', type: '原生属性', description: '字段容器自动关联描述，显式传入时优先采用传入值。' },
      ],
    },
  ],
  a11y: [
    '原生 input 保留表单与键盘行为；标签或 aria-label 提供名称。',
    '最小高度 34px，字号 13px；控件自身清除原生黑框，焦点使用单层中性边框，不依赖工作区祖先。',
  ],
};

export const textareaDoc: ComponentDoc = {
  name: { 'zh-CN': '多行文本框', 'en-US': 'Textarea' },
  summary: {
    'zh-CN': '可纵向调整高度的多行输入区域，复用表单字段的边框、错误和焦点状态。',
    'en-US': 'Vertically resizable multi-line area reusing the field border, error, and focus states.',
  },
  usage: [
    '用于说明或正文草稿，提供字段标签并按业务需要限制 maxLength。',
    '支持 value + onChange 与 defaultValue，输入内容只通过回调交给调用方。',
  ],
  demos: [
    {
      title: '说明与不可编辑状态',
      code: `<Field label="说明"><Textarea placeholder="补充说明" maxLength={500} /></Field>
<Field label="已保存说明"><Textarea readOnly defaultValue="保留的说明内容" /></Field>
<Field label="暂不可编辑"><Textarea disabled placeholder="等待加载" /></Field>`,
      render: () => (
        <>
          <Field label="说明">
            <Textarea placeholder="补充说明" maxLength={500} />
          </Field>
          <Field label="已保存说明">
            <Textarea readOnly defaultValue="保留的说明内容" />
          </Field>
          <Field label="暂不可编辑">
            <Textarea disabled placeholder="等待加载" />
          </Field>
        </>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Textarea',
      props: [
        {
          name: '…textarea 属性',
          type: "ComponentProps<'textarea'>",
          description: 'value / defaultValue / onChange / rows / maxLength / readOnly / disabled / ref 等透传。',
        },
        { name: 'id / aria-*', type: '原生属性', description: '可由字段容器关联，也可由调用方显式指定。' },
      ],
    },
  ],
  a11y: [
    '原生 textarea 支持键盘编辑和调整高度，最小高度 72px。',
    '字段容器负责标签、提示与错误关联；组件不自动保存草稿。',
  ],
};

function SelectDemo() {
  const [value, setValue] = useState('30');
  return (
    <Field label="有效期">
      <Select value={value} onChange={(event) => setValue(event.currentTarget.value)}>
        <option value="7">7 天</option>
        <option value="30">30 天</option>
        <option value="0">永久</option>
      </Select>
    </Field>
  );
}

export const selectDoc: ComponentDoc = {
  name: { 'zh-CN': '下拉选择', 'en-US': 'Select' },
  summary: {
    'zh-CN': '同主题的下拉菜单与选中标记，保留原生 select 的表单、值、校验及变更事件。',
    'en-US':
      'Themed dropdown menu with selection marks, keeping the native select form, value, validation, and change events.',
  },
  usage: [
    '通过 option 或 optgroup 提供选项，value + onChange 或 defaultValue 管理选择；代码写法保持兼容。片段和自定义选项组件也从实际选项读取。',
    '输入与展开菜单使用同一套主题：单层细边框、圆角、浅色选中背景及右侧勾选。菜单跟随控件宽度，外部点击 / 滚动或 Esc 关闭。',
    '标签、提示和错误由字段容器提供，独立使用时传 aria-label；required、name、form、原生 change 和表单 reset 保留。必填错误显示在控件下方。',
    'multiple 或 size > 1 时使用相同样式的内联列表；disabled 选项及禁用分组不可选，hidden 选项不展示。',
    '需要输入筛选时使用 Combobox；可搜索下拉多选使用 MultiSelect，两者共用本组件的表单与选项实现，并分别有独立文档。',
    'ref 仍指向原生 select，用于取值、selectedOptions、form 和约束校验；focus 会交给可见控件。className / style 用于组件外层，手动改原生 value 后派发 change 同步显示。',
    '设置页可通过外层的 --ds-choice-select-font-size、--ds-picker-surface-height 和 --ds-picker-surface-bg 调整字体、控件高度与底色。',
  ],
  demos: [
    {
      title: '受控选择',
      code: `const [value, setValue] = useState('30');
<Field label="有效期">
  <Select value={value} onChange={(event) => setValue(event.currentTarget.value)}>
    <option value="7">7 天</option><option value="30">30 天</option><option value="0">永久</option>
  </Select>
</Field>`,
      render: () => <SelectDemo />,
      layout: 'stack',
    },
    {
      title: '禁用',
      code: `<Field label="不可更改"><Select disabled defaultValue="30"><option value="30">30 天</option></Select></Field>`,
      render: () => (
        <Field label="不可更改">
          <Select disabled defaultValue="30">
            <option value="30">30 天</option>
          </Select>
        </Field>
      ),
      layout: 'stack',
    },
    {
      title: '分组、禁用项与长选项',
      layout: 'stack',
      code: `<Field label="处理方式"><Select defaultValue="standard">
  <optgroup label="可用"><option value="standard">标准处理</option><option value="detail">包含完整明细的详细处理方式</option></optgroup>
  <optgroup label="暂不可用" disabled><option value="archive">归档处理</option></optgroup>
</Select></Field>`,
      render: () => (
        <Field label="处理方式">
          <Select defaultValue="standard">
            <optgroup label="可用">
              <option value="standard">标准处理</option>
              <option value="detail">包含完整明细的详细处理方式</option>
            </optgroup>
            <optgroup label="暂不可用" disabled>
              <option value="archive">归档处理</option>
            </optgroup>
          </Select>
        </Field>
      ),
    },
    { title: '必填校验与表单重置', code: selectFormSource, render: () => <SelectFormDemo />, layout: 'stack' },
    {
      title: '多选列表',
      layout: 'stack',
      code: `<Field label="显示字段"><Select multiple defaultValue={['name']}><option value="name">名称</option><option value="status">状态</option><option value="time">时间</option></Select></Field>`,
      render: () => (
        <Field label="显示字段">
          <Select multiple defaultValue={['name']}>
            <option value="name">名称</option>
            <option value="status">状态</option>
            <option value="time">时间</option>
          </Select>
        </Field>
      ),
    },
  ],
  api: [
    {
      component: 'Select',
      props: [
        {
          name: '…select 属性',
          type: "ComponentProps<'select'>",
          description:
            'value / defaultValue / onChange / disabled / required / name / form / ref 由原生表单元素维护；children 为选项。',
        },
        {
          name: 'labels',
          type: 'Partial<ComponentLabels["select"]>',
          description: '默认文案读取 ConfigProvider，组件 labels 局部覆盖；显式 placeholder / emptyText 优先。',
        },
        {
          name: 'placeholder / emptyText',
          type: 'string',
          default: '请选择 / 暂无可选项',
          description: '未选中时的显示和空菜单文案。',
        },
        {
          name: 'multiple / size',
          type: 'boolean / number',
          description: '多选或 size > 1 展示内联列表，原生 selectedOptions 与多值表单提交保持有效。',
        },
        {
          name: 'searchable / dropdown',
          type: 'boolean / boolean',
          default: 'false / false',
          description:
            '搜索显示层；multiple + dropdown 使用下拉多选，通常直接使用 Combobox / MultiSelect。扩展参数见对应独立页。',
        },
        {
          name: 'className / style',
          type: 'string / CSSProperties',
          description: '用于组件外层布局，菜单最小宽度 160px 并跟随控件，长列表使用公共滚动条。',
        },
        { name: 'id / aria-*', type: '原生属性', description: '字段容器自动关联描述，显式属性优先。' },
      ],
    },
  ],
  a11y: [
    '可见控件使用 combobox、listbox / option；原生表单元素从辅助技术中隐藏，避免重复选项。',
    '支持方向键、Home / End、文字定位、Enter / Space 选择；Esc 返回触发器，Tab 离开不限制页面焦点。',
    '分组、禁用、必填、错误和选中通过 ARIA 表达；输入只有一层中性边框，菜单焦点使用侧边标记，保持选中背景。',
  ],
};

function RangeDemo() {
  const [quality, setQuality] = useState(70);
  return (
    <div className="docs-stack">
      <Field label="画质">
        <Range min={10} max={100} step={10} value={quality} onValueChange={setQuality} aria-valuetext={quality + '%'} />
      </Field>
      <output aria-label="当前画质">{quality}%</output>
    </div>
  );
}

export const rangeDoc: ComponentDoc = {
  name: { 'zh-CN': '滑条', 'en-US': 'Range' },
  summary: {
    'zh-CN': '迁移原系统的画质和封面缩放滑条，保留原生范围输入、步进和数值填充。',
    'en-US':
      'Migrates the original quality and cover-zoom sliders, keeping native range inputs, stepping, and value fill.',
  },
  usage: [
    'min / max 定义有效范围，step 定义步长；使用数值类型的 value 或 defaultValue。',
    '受控时通过 onValueChange 接收 number；也支持原生 onChange、name、ref 和非受控表单重置。',
    '通过字段容器或 aria-label 提供名称；格式化的数值可用 aria-valuetext 描述。',
    '组件不保存偏好、裁剪图片或调用模型，只处理滑条状态。',
  ],
  demos: [
    {
      title: '画质与步进',
      code: `const [quality, setQuality] = useState(70);
<Field label="画质"><Range min={10} max={100} step={10} value={quality} onValueChange={setQuality} aria-valuetext={quality + '%'} /></Field>
<output aria-label="当前画质">{quality}%</output>`,
      render: () => <RangeDemo />,
      layout: 'stack',
    },
    {
      title: '非受控与表单重置',
      code: `<form>
  <Field label="默认画质"><Range name="quality" defaultValue={25} /></Field>
  <Button type="reset">恢复默认</Button>
</form>`,
      render: () => (
        <form>
          <Field label="默认画质">
            <Range name="quality" defaultValue={25} />
          </Field>
          <Button type="reset">恢复默认</Button>
        </form>
      ),
      layout: 'stack',
    },
    {
      title: '禁用',
      code: `<Field label="不可调整"><Range defaultValue={50} disabled /></Field>`,
      render: () => (
        <Field label="不可调整">
          <Range defaultValue={50} disabled />
        </Field>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Range',
      props: [
        { name: 'min / max', type: 'number', default: '0 / 100', description: '原生滑条范围。' },
        { name: 'value / defaultValue', type: 'number', description: '受控值 / 非受控初始值；省略时使用原生中间值。' },
        { name: 'step', type: "number | 'any'", default: '1', description: '原生步长，可传 any 使用连续数值。' },
        {
          name: 'onValueChange',
          type: '(value: number) => void',
          description: '用户调整时回调实际数值；重置不触发回调。',
        },
        { name: 'className', type: 'string', description: '合并到外层焦点容器，style 和 ref 作用于原生 input。' },
        {
          name: '…input 属性',
          type: '原生范围输入属性',
          description: 'name / disabled / onChange / aria-valuetext 等透传，type 固定为 range。',
        },
      ],
    },
  ],
  a11y: [
    '原生 range 提供 slider 语义及方向键、Home / End 行为。',
    '标签与提示由字段容器关联；外层显示公共焦点环，不被输入框焦点重置覆盖。',
    '沿用 6px 轨道与 18px 滑块，强制颜色模式使用原生外观。',
  ],
};
