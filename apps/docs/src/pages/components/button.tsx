import { useState } from 'react';
import { Button, Checkbox, Field, IconButton, Select, type ButtonVariant } from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';

function Toggle() {
  const [on, setOn] = useState(false);
  return <Button pressed={on} icon="check-square" onClick={() => setOn((v) => !v)}>隐藏已完成</Button>;
}

function Playground() {
  const [variant, setVariant] = useState<ButtonVariant>('default');
  const [disabled, setDisabled] = useState(false);
  const [withIcon, setWithIcon] = useState(true);
  return (
    <div style={{ width: '100%' }}>
      <div className="docs-controls" style={{ margin: '-20px -20px 20px' }}>
        <Field label="variant">
          <Select value={variant} onChange={(e) => setVariant(e.target.value as ButtonVariant)}>
            <option value="default">default</option>
            <option value="primary">primary</option>
            <option value="quiet">quiet</option>
            <option value="danger">danger</option>
          </Select>
        </Field>
        <Checkbox checked={disabled} onChange={(e) => setDisabled(e.target.checked)}>disabled</Checkbox>
        <Checkbox checked={withIcon} onChange={(e) => setWithIcon(e.target.checked)}>icon</Checkbox>
      </div>
      <Button variant={variant} disabled={disabled} icon={withIcon ? 'plus' : undefined}>新建项目</Button>
    </div>
  );
}

export const doc: ComponentDoc = {
  name: { 'zh-CN': '按钮', 'en-US': 'Button' },
  summary: {
    'zh-CN': '通用按钮，合并原生页面里并行的三套按钮写法。同一语义只用一个组件，变体通过属性表达。',
    'en-US': 'General button that merges the three parallel button styles in the original pages; one component per semantic with variants expressed through props.',
  },
  usage: [
    '主操作用 primary，每个操作区至多一个；次要操作用默认样式，工具栏中的弱操作用 quiet，删除等破坏性操作用 danger。',
    '文字前可通过 icon 添加装饰图标；只有图标的操作改用独立的图标按钮组件。',
    '切换类按钮（筛选、显示开关）使用 pressed，渲染为 aria-pressed，按下态为浅色强调背景。',
    '默认 type="button"，放进表单时需要提交请显式传 type="submit"。',
  ],
  demos: [
    {
      title: '变体',
      code: `<Button>默认</Button>
<Button variant="primary">保存</Button>
<Button variant="quiet">取消</Button>
<Button variant="danger">删除</Button>
<Button disabled>不可用</Button>`,
      render: () => (
        <>
          <Button>默认</Button>
          <Button variant="primary">保存</Button>
          <Button variant="quiet">取消</Button>
          <Button variant="danger">删除</Button>
          <Button disabled>不可用</Button>
        </>
      ),
    },
    {
      title: '带图标的按钮',
      description: '图标名称沿用原生 data-lucide 的名称。',
      code: `<Button icon="plus" variant="primary">新增令牌</Button>
<Button icon="rotate-ccw">刷新</Button>`,
      render: () => (
        <>
          <Button icon="plus" variant="primary">新增令牌</Button>
          <Button icon="rotate-ccw">刷新</Button>
        </>
      ),
    },
    {
      title: '切换按钮',
      code: `const [on, setOn] = useState(false);
<Button pressed={on} icon="check-square" onClick={() => setOn((v) => !v)}>
  隐藏已完成
</Button>`,
      render: () => <Toggle />,
    },
    {
      title: '交互调试',
      description: '调试面板本身由 Field、Select、Checkbox 搭成。',
      code: `<Button variant={variant} disabled={disabled} icon="plus">新建项目</Button>`,
      render: () => <Playground />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Button',
      props: [
        { name: 'variant', type: "'default' | 'primary' | 'quiet' | 'danger'", default: "'default'", description: '视觉变体。' },
        { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'md 高 32px，sm 高 28px。' },
        { name: 'icon', type: 'IconName', description: '文字前的图标。' },
        { name: 'pressed', type: 'boolean', description: '切换按钮的按下状态，渲染为 aria-pressed。' },
        { name: 'block', type: 'boolean', description: '撑满容器宽度。' },
        { name: '…button 属性', type: "ComponentProps<'button'>", description: '其余原生属性透传，type 默认为 "button"。' },
      ],
    },
  ],
  a11y: [
    '使用原生 button 元素，Enter / Space 触发；聚焦显示内缩的 2px 焦点环。',
    '禁用态透明度降为 45% 并移除悬停反馈，文字不低于 12px。',
    '图标默认 aria-hidden，按钮文字提供可访问名称。',
  ],
};

export const iconButtonDoc: ComponentDoc = {
  name: { 'zh-CN': '图标按钮', 'en-US': 'Icon button' },
  summary: {
    'zh-CN': '只有图标的紧凑操作按钮，用于编辑、删除、刷新等已有清晰语境的次级操作。',
    'en-US': 'Compact icon-only action button for secondary actions with clear context such as edit, delete, and refresh.',
  },
  usage: ['icon 与 label 都必填；label 同时提供可访问名称和悬停提示。', '沿用按钮的 variant、pressed、disabled 与原生事件属性，尺寸固定为公共小按钮尺寸。', '文字不可省略的主操作使用按钮，不用图标替代。'],
  demos: [{
    title: '编辑、删除与禁用',
    code: `<IconButton icon="pencil" label="编辑" />
<IconButton icon="trash-2" label="删除" variant="danger" />
<IconButton icon="rotate-ccw" label="刷新" disabled />`,
    render: () => <>
      <IconButton icon="pencil" label="编辑" />
      <IconButton icon="trash-2" label="删除" variant="danger" />
      <IconButton icon="rotate-ccw" label="刷新" disabled />
    </>,
  }],
  api: [{ component: 'IconButton', props: [
    { name: 'icon', type: 'IconName', description: '必填，图标名称。' },
    { name: 'label', type: 'string', description: '必填，无障碍名称与悬停提示。' },
    { name: 'variant', type: "'default' | 'primary' | 'quiet' | 'danger'", default: "'default'", description: '与按钮共用视觉变体。' },
    { name: 'pressed', type: 'boolean', description: '切换状态，映射为 aria-pressed。' },
    { name: '…button 属性', type: "ComponentProps<'button'>", description: 'disabled / onClick / ref 等透传，默认 type="button"。' },
  ] }],
  a11y: ['使用原生 button，Enter / Space 可激活，label 提供可访问名称。', '禁用与焦点沿用公共按钮；图标本身对读屏隐藏。'],
};
