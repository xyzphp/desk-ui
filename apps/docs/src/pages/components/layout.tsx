import { useState } from 'react';
import {
  Avatar, Button, Checkbox, Disclosure, DocumentPane, EmptyState, Field, Input, List, ListGroup, ListItem, Panel, Property, PropertySheet, SearchField,
  Select, Sidebar, SidebarAddButton, SplitLayout, Tag, Title, Toolbar, ToolbarActions,
} from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';

const people = [
  { id: 'a', name: '李明', role: '管理员', on: true },
  { id: 'b', name: '王芳', role: '编辑', on: true },
  { id: 'c', name: '赵强', role: '访客', on: false },
];

function SplitDemo() {
  const [selected, setSelected] = useState('a');
  const [query, setQuery] = useState('');
  const current = people.find((p) => p.id === selected);
  const shown = people.filter((p) => p.name.includes(query));
  return (
    <SplitLayout
      sidebar={
        <Sidebar
          title="账号"
          count={shown.length}
          actions={<SidebarAddButton label="新增账号" />}
          search={<SearchField placeholder="搜索账号" value={query} onChange={(e) => setQuery(e.target.value)} />}
        >
          <List>
            {shown.map((p) => (
              <ListItem
                key={p.id}
                icon="users"
                title={p.name}
                subtitle={p.role}
                selected={p.id === selected}
                trailing={<Tag tone={p.on ? 'success' : 'muted'}>{p.on ? '启用' : '停用'}</Tag>}
                onSelect={() => setSelected(p.id)}
              />
            ))}
          </List>
        </Sidebar>
      }
    >
      <Toolbar title="账号详情">
        <ToolbarActions>
          <Button icon="pencil">编辑</Button>
          <Button variant="danger" icon="trash-2">删除</Button>
        </ToolbarActions>
      </Toolbar>
      <DocumentPane>
        <Title>{current?.name ?? '未选择'}</Title>
      </DocumentPane>
    </SplitLayout>
  );
}

function GroupedList() {
  const [selected, setSelected] = useState('tokens');
  const items = [
    ['系统设置', [['tokens', '个人令牌', 'key-round'], ['roles', '角色管理', 'contact-round']]],
    ['内容', [['articles', '文章管理', 'newspaper'], ['bookmarks', '收藏夹', 'bookmark']]],
  ] as const;
  return (
    <div style={{ width: 'min(100%, 320px)' }}>
      <List>
        {items.map(([group, entries]) => (
          <ListGroup key={group} title={group}>
            {entries.map(([id, title, icon]) => (
              <ListItem key={id} icon={icon} title={title} selected={selected === id} onSelect={() => setSelected(id)} />
            ))}
          </ListGroup>
        ))}
      </List>
    </div>
  );
}

function PropertyDemo() {
  return (
    <div style={{ width: '100%' }}>
      <PropertySheet>
        <Property label="名称"><Input aria-label="名称" defaultValue="AI 工作助手" /></Property>
        <Property label="有效期">
          <Select aria-label="有效期" defaultValue="30"><option value="30">30 天</option><option value="0">永久</option></Select>
        </Property>
        <Property label="状态"><Tag tone="success">已启用</Tag></Property>
      </PropertySheet>
    </div>
  );
}

export const panelDoc: ComponentDoc = {
  name: { 'zh-CN': '面板', 'en-US': 'Panel' },
  summary: {
    'zh-CN': '带边框的内容面板，用于把设置、表单或说明分块。文档站自己的每个区块也是 Panel。',
    'en-US': 'Bordered content panel for grouping settings, forms, or explanations; every docs-site section is itself a Panel.',
  },
  usage: ['面板之间的间距由外层容器控制，Panel 自身不带外边距。', '内嵌表格或列表时用 flush 去掉内边距，由内容自行撑满。', 'muted 使用窗口底色，用于次级区域。'],
  demos: [{
    title: '标题、面板与内嵌内容',
    code: `<Panel title="基本信息"><Field label="名称"><Input /></Field></Panel>
<Panel muted>次级区域</Panel>`,
    layout: 'stack',
    render: () => (
      <>
        <Panel title="基本信息"><Field label="名称"><Input placeholder="请输入名称" /></Field></Panel>
        <Panel muted>次级区域</Panel>
      </>
    ),
  }],
  api: [{ component: 'Panel', props: [
    { name: 'title', type: 'ReactNode', description: '面板标题，渲染为 h3。' },
    { name: 'flush', type: 'boolean', description: '去掉内边距与间距。' },
    { name: 'muted', type: 'boolean', description: '使用窗口底色。' },
  ] }],
  a11y: ['使用 section 元素；有标题时请保证标题层级连续。'],
};

export const toolbarDoc: ComponentDoc = {
  name: { 'zh-CN': '工具栏', 'en-US': 'Toolbar' },
  summary: {
    'zh-CN': '页面顶部操作栏：左侧标题，右侧操作组，窄窗口自动换行。',
    'en-US': 'Top action bar with a title on the left and actions on the right, wrapping automatically in narrow windows.',
  },
  usage: ['同类操作保持一致位置和层级：主操作靠右，破坏性操作使用 danger。', '次级操作就地展开，不用侵入式模态弹窗。'],
  demos: [{
    title: '标题与操作',
    code: `<Toolbar title="个人令牌">
  <ToolbarActions>
    <Button icon="rotate-ccw">刷新</Button>
    <Button variant="primary" icon="plus">新增令牌</Button>
  </ToolbarActions>
</Toolbar>`,
    layout: 'stack',
    render: () => (
      <Panel flush>
        <Toolbar title="个人令牌">
          <ToolbarActions>
            <Button icon="rotate-ccw">刷新</Button>
            <Button variant="primary" icon="plus">新增令牌</Button>
          </ToolbarActions>
        </Toolbar>
      </Panel>
    ),
  }],
  api: [
    { component: 'Toolbar', props: [{ name: 'title', type: 'ReactNode', description: '左侧标题，渲染为 h2。' }] },
    { component: 'ToolbarActions', props: [{ name: '…div 属性', type: "ComponentProps<'div'>", description: '操作按钮容器，自动换行。' }] },
  ],
  a11y: ['标题使用标题元素；按钮顺序即 Tab 顺序。'],
};

export const splitDoc: ComponentDoc = {
  name: { 'zh-CN': '分栏布局', 'en-US': 'Split layout' },
  summary: {
    'zh-CN': '列表 / 文档类页面的基准布局：左侧栏（标题、计数、搜索、列表），右侧主区。以项目管理页为视觉基准。',
    'en-US': 'Baseline layout for list / document pages: left sidebar (title, count, search, list) and right main area, visually based on the project management page.',
  },
  usage: [
    '整页放进 Workspace，布局按容器宽度折叠：宽度小于 800px 收窄侧栏，小于 600px 改为上下排布。',
    '侧栏保持中性底色，搜索框与正文不使用粗蓝色焦点边框。',
    '右侧通常是 Toolbar + DocumentPane；DocumentPane 负责内容区滚动。',
  ],
  demos: [{
    title: '账号管理样例',
    description: '拖动浏览器窗口宽度可查看容器查询折叠效果。',
    code: `<SplitLayout sidebar={
  <Sidebar title="账号" count={shown.length}
    actions={<SidebarAddButton label="新增账号" />}
    search={<SearchField placeholder="搜索账号" value={query} onChange={...} />}>
    <List>
      <ListItem icon="users" title="李明" subtitle="管理员" selected
        trailing={<Tag tone="success">启用</Tag>} onSelect={...} />
    </List>
  </Sidebar>
}>
  <Toolbar title="账号详情">…</Toolbar>
  <DocumentPane>…</DocumentPane>
</SplitLayout>`,
    layout: 'frame',
    render: () => <SplitDemo />,
  }],
  api: [
    { component: 'SplitLayout', props: [{ name: 'sidebar', type: 'ReactNode', description: '必填，通常是 <Sidebar>。' }, { name: 'children', type: 'ReactNode', description: '主区内容。' }] },
  ],
  a11y: ['Sidebar 使用 aside；SearchField 使用 type="search" 并带名称。', '窄容器折叠由容器查询完成，不依赖视口，嵌入任意宽度窗口都成立。'],
};

export const sidebarDoc: ComponentDoc = {
  name: { 'zh-CN': '列表侧栏', 'en-US': 'Sidebar' },
  summary: {
    'zh-CN': '数据列表的侧栏容器，包含标题、计数、就地操作、搜索、列表与可选底栏。',
    'en-US': 'Sidebar container for data lists with title, count, inline actions, search, list, and an optional footer.',
  },
  usage: ['通常放进分栏布局的 sidebar 属性；中性背景和窄容器折叠由公共组件负责。', '固定功能导航使用导航侧栏；可搜索、可新增的数据集合使用本组件。', '标题操作通过 actions 注入，搜索通过 search 注入。聊天等已由窗口命名的页面可省略 title；没有标题、计数和标题操作时不占用空标题行。'],
  demos: [{
    title: '标题、搜索与数据列表',
    code: `<Sidebar title="账号" count={1}
  search={<SearchField label="搜索账号" placeholder="搜索账号" />}>
  <List><ListItem title="李明" subtitle="管理员" selected /></List>
</Sidebar>`,
    render: () => <div style={{ height: 260, width: 'min(100%, 280px)', display: 'flex' }}>
      <Sidebar title="账号" count={1} search={<SearchField label="搜索账号" placeholder="搜索账号" />}>
        <List><ListItem title="李明" subtitle="管理员" selected /></List>
      </Sidebar>
    </div>,
  }],
  api: [{ component: 'Sidebar', props: [
    { name: 'title', type: 'ReactNode', description: '可选标题；title、count 和 actions 都未提供时不渲染空标题行，可直接展示 search。' },
    { name: 'count', type: 'number', description: '标题旁的计数徽标。' },
    { name: 'actions', type: 'ReactNode', description: '标题行右侧操作，如 SidebarAddButton。' },
    { name: 'search', type: 'ReactNode', description: '列表上方区域，通常为搜索框。' },
    { name: 'footer', type: 'ReactNode', description: '带分隔线的底部区域。' },
    { name: '…aside 属性', type: "ComponentProps<'aside'>", description: 'className / ref / aria-label 等透传。' },
  ] }],
  a11y: ['使用原生 aside，内部控件保留各自的标签、焦点与键盘行为。'],
};

function SearchDemo() {
  const [query, setQuery] = useState('');
  const shown = people.filter((person) => person.name.includes(query));
  return <div style={{ width: 'min(100%, 320px)' }}>
    <SearchField label="搜索账号" placeholder="搜索账号" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
    <List>{shown.map((person) => <ListItem key={person.id} title={person.name} subtitle={person.role} />)}</List>
    {shown.length === 0 && <EmptyState compact>没有匹配账号</EmptyState>}
  </div>;
}

export const searchDoc: ComponentDoc = {
  name: { 'zh-CN': '搜索框', 'en-US': 'Search field' },
  summary: {
    'zh-CN': '带搜索图标的单行搜索输入，复用侧栏的中性边框与焦点状态。',
    'en-US': 'Single-line search input with a search icon, reusing the sidebar neutral border and focus states.',
  },
  usage: ['通过 label 提供名称，省略时取 placeholder；原生 type 固定为 search。', 'variant="pill" 提供开始菜单 / 桌面导航的沉浸式搜索条形态（40px 全圆角、半透明面板底、14px 字号），常与 showIcon=false 搭配；焦点沿用公共边框变色。', '组件只回调输入，不发请求或筛选数据，筛选与空态由调用方处理。'],
  demos: [{
    title: '筛选账号', description: '输入“李”“王”或“赵”筛选本地示例记录；没有匹配时显示空态。',
    code: `const [query, setQuery] = useState('');
const shown = people.filter((person) => person.name.includes(query));
<SearchField label="搜索账号" placeholder="搜索账号" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
<List>{shown.map((person) => <ListItem key={person.id} title={person.name} subtitle={person.role} />)}</List>
{shown.length === 0 && <EmptyState compact>没有匹配账号</EmptyState>}`, render: () => <SearchDemo />,
  }, {
    title: '沉浸式搜索条',
    code: '<SearchField label="搜索收藏" placeholder="搜索收藏或输入关键词" showIcon={false} variant="pill" />',
    render: () => <SearchField label="搜索收藏" placeholder="搜索收藏或输入关键词" showIcon={false} variant="pill" />,
  }],
  api: [{ component: 'SearchField', props: [
    { name: 'label', type: 'string', description: '无障碍名称，缺省取 placeholder。' },
    { name: 'showIcon', type: 'boolean', default: 'true', description: '是否显示装饰性的搜索图标。' },
    { name: 'variant', type: '"default" | "pill"', default: '"default"', description: 'pill 为开始菜单 / 桌面导航的沉浸式全圆角形态。' },
    { name: '…input 属性', type: "Omit<ComponentProps<'input'>, 'type'>", description: 'value / onChange / disabled / ref 等透传到输入框。' },
  ] }],
  a11y: ['原生 search 输入带可访问名称；装饰图标对读屏隐藏，焦点沿用公共样式。'],
};

export const listDoc: ComponentDoc = {
  name: { 'zh-CN': '列表', 'en-US': 'List' },
  summary: { 'zh-CN': '组织列表项与可选分组，统一行间距、滚动和密度。', 'en-US': 'Organizes list items and optional groups with unified row spacing, scrolling, and density.' },
  usage: ['子项使用列表项，分组使用 ListGroup；选择状态由列表项与调用方维护。', 'density 提供 roomy（66px）、默认（54px）、dense（36px）三档行高。'],
  demos: [{
    title: '分组列表',
    code: `<List>
  <ListGroup title="系统设置">
    <ListItem icon="key-round" title="个人令牌" selected={...} onSelect={...} />
  </ListGroup>
</List>`,
    render: () => <GroupedList />,
  }],
  api: [
    { component: 'List', props: [{ name: 'density', type: "'default' | 'roomy' | 'dense'", default: "'default'", description: '行高档位。' }] },
    { component: 'ListGroup', props: [{ name: 'title', type: 'ReactNode', description: '必填，分组标题。' }] },
  ],
  a11y: ['列表使用 ul / li，列表项是原生 button，可用 Tab 与 Enter 操作。', '选中不仅靠颜色，还有勾选标记。'],
};

function ListItemDemo() {
  const [selected, setSelected] = useState('a');
  return <List>
    <ListItem leading={<Avatar name="李明" size={32} decorative />} title="李明" subtitle="管理员" selected={selected === 'a'} onSelect={() => setSelected('a')} />
    <ListItem title="王芳" selected={selected === 'b'} showSelectionMark={false}
      trailing={<Tag tone="success">启用</Tag>} onSelect={() => setSelected('b')} />
    <ListItem title="不可用账号" disabled />
  </List>;
}

export const listItemDoc: ComponentDoc = {
  name: { 'zh-CN': '列表项', 'en-US': 'List item' },
  summary: {
    'zh-CN': '可选择的数据条目，统一浅色强调背景、强调色标题和勾选标记。',
    'en-US': 'Selectable data entry with unified light accent background, accent-colored title, and check mark.',
  },
  usage: ['放在 List 中，单选状态通过 selected + onSelect 由调用方维护。', 'trailing 放状态等次要信息，不嵌套操作按钮；暂不可选的条目传 disabled。'],
  demos: [{
    title: '选中、状态与禁用',
    code: `const [selected, setSelected] = useState('a');
<List>
  <ListItem title="李明" subtitle="管理员" selected={selected === 'a'} onSelect={() => setSelected('a')} />
  <ListItem title="王芳" selected={selected === 'b'} showSelectionMark={false}
    trailing={<Tag tone="success">启用</Tag>} onSelect={() => setSelected('b')} />
  <ListItem title="不可用账号" disabled />
</List>`, render: () => <ListItemDemo />, layout: 'stack',
  }],
  api: [{ component: 'ListItem', props: [
    { name: 'title', type: 'ReactNode', description: '必填，主文字。' },
    { name: 'subtitle / icon', type: 'ReactNode / IconName', description: '次要文字与左侧图标。' },
    { name: 'leading', type: 'ReactNode', description: '替代 icon 的前置内容，例如 decorative Avatar；保留原生列表项与按钮语义。' },
    { name: 'selected / disabled', type: 'boolean', description: '选中或禁用状态。' },
    { name: 'showSelectionMark', type: 'boolean', default: 'true', description: '是否显示选中对号。关闭后仍保留选中高亮和 aria-pressed。' },
    { name: 'trailing', type: 'ReactNode', description: '右侧附加内容。' },
    { name: 'onSelect', type: '() => void', description: '点击或键盘激活时回调。' },
  ] }],
  a11y: ['列表项使用原生按钮，Enter / Space 可选择；aria-pressed 表达选中。', '默认用勾选标记辅助识别选中；禁用时不可激活。'],
};

export const propertyDoc: ComponentDoc = {
  name: { 'zh-CN': '属性表单', 'en-US': 'Property sheet' },
  summary: { 'zh-CN': '纵向组织属性行，统一详情页字段之间的间距。', 'en-US': 'Arranges property rows vertically, unifying spacing between detail-page fields.' },
  usage: ['子项使用 Property，每行的标签与控件布局由属性行负责。', '需要错误与提示的字段使用 Field，不与属性行重复嵌套。'],
  demos: [{ title: '详情编辑区', code: `<PropertySheet>
  <Property label="名称"><Input aria-label="名称" defaultValue="AI 工作助手" /></Property>
  <Property label="有效期"><Select aria-label="有效期" defaultValue="30"><option value="30">30 天</option><option value="0">永久</option></Select></Property>
  <Property label="状态"><Tag tone="success">已启用</Tag></Property>
</PropertySheet>`, render: () => <PropertyDemo />, layout: 'stack' }],
  api: [
    { component: 'PropertySheet', props: [{ name: '…div 属性', type: "ComponentProps<'div'>", description: '纵向排布各属性行。' }] },
  ],
  a11y: ['Property 的名称是视觉标签；可交互控件仍需 aria-label 或使用 Field。'],
};

export const propertyRowDoc: ComponentDoc = {
  name: { 'zh-CN': '属性行', 'en-US': 'Property row' },
  summary: {
    'zh-CN': '左侧属性名称与右侧控件的一行布局，窄容器下自动改为上下排列。',
    'en-US': 'One-line layout with the property name on the left and the control on the right, stacking vertically in narrow containers.',
  },
  usage: ['通常放在属性表单内；名称列为 120px，控件列自适应。', 'label 是视觉标签，控件仍须提供 aria-label；有提示或错误时改用字段容器。'],
  demos: [{
    title: '名称与控件', code: `<Property label="名称"><Input aria-label="名称" defaultValue="AI 工作助手" /></Property>`,
    render: () => <Property label="名称"><Input aria-label="名称" defaultValue="AI 工作助手" /></Property>, layout: 'stack',
  }],
  api: [{ component: 'Property', props: [
    { name: 'label', type: 'ReactNode', description: '必填，视觉名称。' },
    { name: 'children', type: 'ReactNode', description: '必填，右侧控件或属性值。' },
    { name: '…div 属性', type: "ComponentProps<'div'>", description: 'className / ref 等透传到根容器。' },
  ] }],
  a11y: ['可编辑控件通过 aria-label 提供名称；窄容器仅改变布局，保持键盘顺序。'],
};

function ControlledDisclosureDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="docs-stack">
      <Checkbox checked={open} onChange={(event) => setOpen(event.currentTarget.checked)}>显示连接参数</Checkbox>
      <Disclosure title="连接参数" open={open} onOpenChange={setOpen}>
        <Field label="超时（毫秒）"><Input type="number" min={1000} defaultValue={30000} /></Field>
      </Disclosure>
      <Disclosure title="尚未开放" disabled>后续配置</Disclosure>
      <Disclosure title="只读参数" defaultOpen disabled>
        <Field label="最大并发"><Input type="number" value={4} readOnly /></Field>
      </Disclosure>
    </div>
  );
}

export const disclosureDoc: ComponentDoc = {
  name: { 'zh-CN': '就地展开', 'en-US': 'Disclosure' },
  summary: {
    'zh-CN': '就地展开次级配置，沿用模型管理的分隔线、标题与内容间距。折叠保留内容节点和未提交草稿。',
    'en-US': 'Expands secondary configuration in place, following the model-management divider, title, and content spacing; collapsing keeps content nodes and unsubmitted drafts.',
  },
  usage: [
    '用于连接参数、校验选项等次级操作；常规配置流程直接展开，不另开模态。标题只放文字或非交互节点。',
    '默认折叠，defaultOpen 初始展开；open + onOpenChange 可由外部状态控制。',
    'disabled 只禁用展开按钮，不改变当前展开状态；内容里的控件需要调用方自行设置 disabled 或 readOnly。',
    '折叠不会卸载子组件，也不保存到存储。权限判断、锁屏 / 退出清理与草稿恢复仍由应用负责，不能把折叠当作内容隔离。',
  ],
  demos: [
    {
      title: '就地编辑并保留草稿',
      description: '展开后修改超时，再收起、打开，输入仍然保留。',
      code: `<Disclosure title="连接参数">
  <Field label="超时（毫秒）"><Input type="number" min={1000} defaultValue={30000} /></Field>
</Disclosure>`,
      render: () => <Disclosure title="连接参数"><Field label="超时（毫秒）"><Input type="number" min={1000} defaultValue={30000} /></Field></Disclosure>,
      layout: 'stack',
    },
    {
      title: '受控与禁用',
      code: `const [open, setOpen] = useState(true);

<Checkbox checked={open} onChange={(event) => setOpen(event.currentTarget.checked)}>显示连接参数</Checkbox>
<Disclosure title="连接参数" open={open} onOpenChange={setOpen}>
  <Field label="超时（毫秒）"><Input type="number" min={1000} defaultValue={30000} /></Field>
</Disclosure>
<Disclosure title="尚未开放" disabled>后续配置</Disclosure>
<Disclosure title="只读参数" defaultOpen disabled>
  <Field label="最大并发"><Input type="number" value={4} readOnly /></Field>
</Disclosure>`,
      render: () => <ControlledDisclosureDemo />,
      layout: 'stack',
    },
  ],
  api: [{ component: 'Disclosure', props: [
    { name: 'title', type: 'ReactNode', description: '必填，展开按钮的标签；不要嵌套交互控件。' },
    { name: 'children', type: 'ReactNode', description: '必填，展开内容，折叠时保持挂载。' },
    { name: 'open / defaultOpen', type: 'boolean', default: 'false', description: '受控展开状态 / 非受控初始状态。' },
    { name: 'onOpenChange', type: '(open: boolean) => void', description: '点击或键盘激活时通知新的展开状态。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '仅禁用展开按钮，不禁用内部控件。' },
    { name: '…div 属性', type: "Omit<ComponentProps<'div'>, 'title' | 'children'>", description: 'id / className / ref / data-* 等透传到根容器。' },
  ] }],
  a11y: [
    '原生 button 支持 Enter / Space，默认 type="button"，不会提交表单。',
    'aria-expanded 表达状态，aria-controls 与有名称的 region 使用独立标识关联，支持同页多个实例。',
    '隐藏内容通过 hidden 退出键盘顺序与可访问树；触发按钮保留公共焦点环，长标题可换行。',
  ],
};
