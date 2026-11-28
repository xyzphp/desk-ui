import { useState } from 'react';
import { Button, CapsuleTag, Checkbox, EmptyState, HelpTip, Notice, Switch, Tag } from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';

function CheckboxDemo() {
  const [hide, setHide] = useState(true);
  return (
    <>
      <Checkbox checked={hide} onChange={(e) => setHide(e.target.checked)}>
        隐藏已完成
      </Checkbox>
      <Checkbox defaultChecked>同步到桌面</Checkbox>
      <Checkbox disabled>不可用</Checkbox>
    </>
  );
}

function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return (
    <>
      <Switch checked={enabled} onCheckedChange={setEnabled}>
        显示提示
      </Switch>
      <Switch defaultChecked>开启动画</Switch>
      <Switch disabled>不可用</Switch>
      <Switch defaultChecked disabled>
        已启用且不可更改
      </Switch>
    </>
  );
}

function NoticeDemo() {
  const [shown, setShown] = useState(true);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Button size="sm" onClick={() => setShown((v) => !v)}>
        {shown ? '隐藏成功提示' : '显示成功提示'}
      </Button>
      {shown && <Notice>已保存</Notice>}
      <Notice tone="error">保存失败：修订号已过期，请刷新后重试</Notice>
      <Notice tone="info">令牌原文只展示一次</Notice>
      <Notice tone="warning">该操作会影响已发布的应用</Notice>
    </div>
  );
}

export const checkboxDoc: ComponentDoc = {
  name: { 'zh-CN': '复选框', 'en-US': 'Checkbox' },
  summary: {
    'zh-CN': '复选框加文字标签，整行可点击。用于设置开关、筛选与多选列表。',
    'en-US':
      'Checkbox with a text label where the whole row is clickable, for setting toggles, filters, and multi-select lists.',
  },
  usage: [
    '标签文字就是无障碍名称，不要再单独写 aria-label。',
    '单项使用 Checkbox；同名多值、分组必填与只读使用 CheckboxGroup，权限父子关系仍由权限树负责。',
    'indeterminate 表达原生混合状态，由宿主计算；它不等于 checked，也不会自动更改表单值。',
  ],
  demos: [
    {
      title: '受控、默认选中与禁用',
      code: `<Checkbox checked={hide} onChange={(e) => setHide(e.target.checked)}>隐藏已完成</Checkbox>
<Checkbox defaultChecked>同步到桌面</Checkbox>
<Checkbox disabled>不可用</Checkbox>`,
      render: () => <CheckboxDemo />,
    },
  ],
  api: [
    {
      component: 'Checkbox',
      props: [
        { name: 'children', type: 'ReactNode', description: '必填，标签文字。' },
        { name: 'indeterminate', type: 'boolean', default: 'false', description: '原生半选状态；ref 仍指向 input。' },
        {
          name: '…input 属性',
          type: "Omit<ComponentProps<'input'>, 'type'>",
          description: 'checked / defaultChecked / onChange / disabled 等透传。',
        },
      ],
    },
  ],
  a11y: [
    '使用原生 checkbox，强调色由 accent-color 提供；键盘焦点只标出复选框，不包围整行文字。',
    '禁用态降低透明度并取消指针样式。',
  ],
};

export const switchDoc: ComponentDoc = {
  name: { 'zh-CN': '开关', 'en-US': 'Switch' },
  summary: {
    'zh-CN': '设置中的即时开关，沿用系统设置与快捷工具的 32 × 20px 轨道和 16px 滑块。整行标签可点击。',
    'en-US':
      'Instant settings switch following the 32 x 20px track and 16px knob from system settings and quick tools; the whole label row is clickable.',
  },
  usage: [
    '用于启用 / 停用某项设置；多选或待提交的选项优先用 Checkbox。',
    'children 提供稳定的标签，不随开关状态更换名称。checked + onCheckedChange 受控，defaultChecked 使用原生非受控状态。',
    '支持 name、value、required、ref 与原生 onChange；非受控开关随表单 reset 恢复初始值，reset 不触发修改回调。',
    '不保存设置或发请求。异步保存期间由调用方禁用，失败时由调用方恢复受控状态并显示错误。',
  ],
  demos: [
    {
      title: '受控、非受控与禁用',
      code: `const [enabled, setEnabled] = useState(true);

<Switch checked={enabled} onCheckedChange={setEnabled}>显示提示</Switch>
<Switch defaultChecked>开启动画</Switch>
<Switch disabled>不可用</Switch>
<Switch defaultChecked disabled>已启用且不可更改</Switch>`,
      render: () => <SwitchDemo />,
    },
  ],
  api: [
    {
      component: 'Switch',
      props: [
        { name: 'children', type: 'ReactNode', description: '必填，开关的文字标签。' },
        {
          name: 'checked / defaultChecked',
          type: 'boolean',
          default: 'false',
          description: '受控状态 / 非受控初始状态。',
        },
        {
          name: 'onCheckedChange',
          type: '(checked: boolean) => void',
          description: '用户修改时回调布尔值；不代替持久化。',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用开关与标签点击。' },
        { name: 'className', type: 'string', description: '合并到外层标签；其余原生属性和 ref 透传到 input。' },
        {
          name: '…input 属性',
          type: "Omit<ComponentProps<'input'>, 'type' | 'role' | 'children' | 'aria-checked'>",
          description: 'name / value / required / onChange / aria-describedby 等。',
        },
      ],
    },
  ],
  a11y: [
    '使用原生 checkbox + role="switch"，标签提供名称，原生 checked 状态表达开 / 关。',
    'Tab 聚焦、Space 切换；焦点只标出开关本身，禁用时不能修改。',
    '深浅色使用公共令牌；减少动态效果时去掉滑块动画，强制颜色模式回退为系统原生勾选控件。',
  ],
};

export const tagDoc: ComponentDoc = {
  name: { 'zh-CN': '状态标签', 'en-US': 'Tag' },
  summary: {
    'zh-CN': '状态标签。颜色由语义令牌提供，页面里不再写十六进制色值。',
    'en-US': 'Status tag; colors come from semantic tokens and pages no longer write hex values.',
  },
  usage: [
    '用语义而不是颜色选择 tone：success（启用 / 成功）、warning（待处理 / 受限）、danger（失败）、info（进行中）、muted（停用 / 次要）。',
    '标签只表达状态，不承载操作；需要点击的请用 Button。',
    '状态不能只靠颜色传达，文字必须写明状态。',
    'color 是装饰色，只用于分类、归属、来源这类没有好坏含义的标签；表达状态仍用 tone。同时提供时以 color 为准。',
    'CapsuleTag 用于“键 + 值”“状态 + 数量”这类成对信息，左段实色、右段浅色；单个信息用 Tag 即可。',
    '装饰色、全圆角与胶囊标签都是可选项，已迁移页面不默认启用，避免与原站观感产生差异。',
  ],
  demos: [
    {
      title: '语义色',
      code: `<Tag>默认</Tag>
<Tag tone="success">已启用</Tag>
<Tag tone="warning">待审核</Tag>
<Tag tone="danger">失败</Tag>
<Tag tone="info" icon="sparkles">AI 生成</Tag>
<Tag tone="muted">已停用</Tag>`,
      render: () => (
        <>
          <Tag>默认</Tag>
          <Tag tone="success">已启用</Tag>
          <Tag tone="warning">待审核</Tag>
          <Tag tone="danger">失败</Tag>
          <Tag tone="info" icon="sparkles">
            AI 生成
          </Tag>
          <Tag tone="muted">已停用</Tag>
        </>
      ),
    },
    {
      title: '装饰色与全圆角',
      description: '装饰色取自强调色令牌，浅色底配同色文字，用于分类而不是状态。',
      code: `<Tag color="blue">产品</Tag>
<Tag color="purple">设计</Tag>
<Tag color="pink">运营</Tag>
<Tag color="orange">市场</Tag>
<Tag color="green">研发</Tag>
<Tag color="cyan">数据</Tag>
<Tag color="gray">其他</Tag>
<Tag color="blue" shape="pill" icon="folder">项目</Tag>
<Tag tone="success" shape="pill" dot>已启用</Tag>
<Tag tone="info" shape="pill" dot>有更新</Tag>`,
      render: () => (
        <>
          <Tag color="blue">产品</Tag>
          <Tag color="purple">设计</Tag>
          <Tag color="pink">运营</Tag>
          <Tag color="orange">市场</Tag>
          <Tag color="green">研发</Tag>
          <Tag color="cyan">数据</Tag>
          <Tag color="gray">其他</Tag>
          <Tag color="blue" shape="pill" icon="folder">
            项目
          </Tag>
          <Tag tone="success" shape="pill" dot>
            已启用
          </Tag>
          <Tag tone="info" shape="pill" dot>
            有更新
          </Tag>
        </>
      ),
    },
    {
      title: '胶囊标签',
      description: '左段是键或状态名，右段是值或数量。',
      code: `<CapsuleTag label="版本" value="1.2.0" />
<CapsuleTag label="通过" value={128} tone="success" icon="check" />
<CapsuleTag label="待审核" value={6} tone="warning" />
<CapsuleTag label="失败" value={2} tone="danger" />
<CapsuleTag label="环境" value="预发" color="purple" />`,
      render: () => (
        <>
          <CapsuleTag label="版本" value="1.2.0" />
          <CapsuleTag label="通过" value={128} tone="success" icon="check" />
          <CapsuleTag label="待审核" value={6} tone="warning" />
          <CapsuleTag label="失败" value={2} tone="danger" />
          <CapsuleTag label="环境" value="预发" color="purple" />
        </>
      ),
    },
  ],
  api: [
    {
      component: 'Tag',
      props: [
        {
          name: 'tone',
          type: "'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'muted'",
          default: "'neutral'",
          description: '语义色。',
        },
        {
          name: 'color',
          type: "'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'cyan' | 'gray'",
          description: '装饰色，用于分类；提供后覆盖 tone 的配色。',
        },
        { name: 'shape', type: "'default' | 'pill'", default: "'default'", description: '圆角形态，pill 为全圆角。' },
        {
          name: 'dot',
          type: 'boolean',
          default: 'false',
          description: '在文字前显示带柔光光晕的状态圆点并加细描边（常与 shape="pill" 搭配）。',
        },
        { name: 'icon', type: 'IconName', description: '文字前的 12px 图标。' },
      ],
    },
    {
      component: 'CapsuleTag',
      props: [
        { name: 'label', type: 'ReactNode', description: '必填。左段内容：键或状态名，实色底。' },
        { name: 'value', type: 'ReactNode', description: '必填。右段内容：值或数量，浅色底。' },
        {
          name: 'tone',
          type: "'neutral' | 'success' | 'warning' | 'danger' | 'info'",
          default: "'neutral'",
          description: '语义色。',
        },
        { name: 'color', type: 'TagColor', description: '装饰色；提供后覆盖 tone。' },
        { name: 'icon', type: 'IconName', description: '左段文字前的 12px 图标。' },
      ],
    },
  ],
  a11y: [
    '字号 12px，文字与底色对比由令牌保证；深色模式自动适配。',
    '装饰色文字向正文色混合、胶囊左段向黑色混合以保证对比度；装饰色不承载状态含义，不能替代文字。',
    '胶囊标签两段是普通文本，读屏按“左段 右段”连读；强制颜色模式下补一条边框。',
  ],
};

export const helpTipDoc: ComponentDoc = {
  name: { 'zh-CN': '帮助提示', 'en-US': 'Help tip' },
  summary: {
    'zh-CN': '问号悬停提示。项目约定：必要说明统一用问号图标悬停展示，不堆叠说明小字。',
    'en-US':
      'Hover tip on a question-mark icon. By convention, required explanations use this hover pattern instead of stacking small print.',
  },
  usage: [
    '紧跟在需要解释的标签或标题之后。',
    '提示文本保持一两句；较长内容放进文档，不塞进提示。',
    '基于 Tooltip，键盘聚焦立即展示，悬停延迟展示；Esc 或激活后关闭。',
  ],
  demos: [
    {
      title: '标签旁的提示',
      code: `<span>有效期 <HelpTip text="到期后令牌自动失效，可随时重新创建" /></span>`,
      render: () => (
        <span>
          有效期 <HelpTip text="到期后令牌自动失效，可随时重新创建" />
        </span>
      ),
    },
  ],
  api: [
    {
      component: 'HelpTip',
      props: [{ name: 'text', type: 'string', description: '必填，提示内容，同时作为 aria-label。' }],
    },
  ],
  a11y: [
    'role="img" 并以 aria-label 提供文字；tabIndex=0 可聚焦。',
    '气泡具有 tooltip 角色并通过 aria-describedby 关联，不依赖 title 属性。',
  ],
};

export const noticeDoc: ComponentDoc = {
  name: { 'zh-CN': '内联提示', 'en-US': 'Notice' },
  summary: {
    'zh-CN': '内联提示条，用于保存结果、错误和重要说明。错误必须可见，不只写进控制台。',
    'en-US':
      'Inline notice bar for save results, errors, and important explanations; errors must stay visible, not only in the console.',
  },
  usage: [
    '放在相关操作区附近，而不是页面顶部之外的位置。',
    '成功提示可以自动淡出或由用户关闭；错误提示保留到问题解决。',
    '全局的短暂反馈由宿主的通知能力承担，Notice 只负责就地提示。',
  ],
  demos: [
    {
      title: '四种语气',
      code: `<Notice>已保存</Notice>
<Notice tone="error">保存失败：修订号已过期，请刷新后重试</Notice>
<Notice tone="info">令牌原文只展示一次</Notice>
<Notice tone="warning">该操作会影响已发布的应用</Notice>`,
      render: () => <NoticeDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Notice',
      props: [
        {
          name: 'tone',
          type: "'success' | 'error' | 'info' | 'warning'",
          default: "'success'",
          description: '语气；error 使用 role="alert"，其余为 role="status"。',
        },
      ],
    },
  ],
  a11y: ['状态变化会被读屏软件播报；颜色之外还有文字说明。'],
};

export const emptyDoc: ComponentDoc = {
  name: { 'zh-CN': '空状态', 'en-US': 'Empty state' },
  summary: {
    'zh-CN': '空列表或空详情的占位文字，合并三种空态写法。',
    'en-US': 'Placeholder text for empty lists or details, merging the three empty-state styles.',
  },
  usage: [
    '说明"没有什么"以及下一步，如"选择一个令牌，或创建新令牌"。',
    '加载中使用同一位置显示"正在读取…"，避免布局跳动。',
  ],
  demos: [
    {
      title: '默认与紧凑',
      code: `<EmptyState>选择一个令牌，或创建新令牌</EmptyState>
<EmptyState compact>没有匹配的令牌</EmptyState>`,
      render: () => (
        <div style={{ width: '100%' }}>
          <EmptyState>选择一个令牌，或创建新令牌</EmptyState>
          <EmptyState compact>没有匹配的令牌</EmptyState>
        </div>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'EmptyState',
      props: [{ name: 'compact', type: 'boolean', description: '减小内边距，用于侧栏列表。' }],
    },
  ],
  a11y: ['文字 12px、次级文字色；不依赖插图。'],
};
