import { useState } from 'react';
import {
  Checkbox,
  PermissionTree,
  SelectionTree,
  type PermissionTreeLabels,
  type PermissionTreeNode,
  type SelectionTreeNode,
} from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';

const treeLabels: PermissionTreeLabels = {
  expand: (label) => '展开' + label,
  collapse: (label) => '收起' + label,
  children: (label) => label + '子项',
  selectAll: (label) => '全选' + label,
  count: (selected, total) => selected + ' / ' + total,
  required: '必选',
  inherited: '角色继承',
};

const labelsCode = `const treeLabels: PermissionTreeLabels = {
  expand: (label) => '展开' + label, collapse: (label) => '收起' + label,
  children: (label) => label + '子项', selectAll: (label) => '全选' + label,
  count: (selected, total) => selected + ' / ' + total,
  required: '必选', inherited: '角色继承',
};`;

const permissionNodes: PermissionTreeNode[] = [
  {
    id: 'records',
    label: '记录工具',
    icon: 'folder',
    childPolicy: 'require-parent',
    children: [
      { id: 'records-read', label: '查看记录', description: '读取当前可见记录。' },
      { id: 'records-edit', label: '编辑记录', description: '编辑已获授权的记录。' },
      { id: 'records-delete', label: '删除记录', disabled: true, description: '当前操作者不能授予此项。' },
    ],
  },
  {
    id: 'preferences',
    label: '基础偏好',
    required: true,
    icon: 'settings',
    children: [
      { id: 'appearance', label: '外观设置' },
      {
        id: 'advanced-preferences',
        label: '高级偏好',
        childPolicy: 'require-parent',
        children: [{ id: 'export-preferences', label: '导出偏好' }],
      },
    ],
  },
  { id: 'extensions', label: '扩展能力', groupOnly: true, children: [{ id: 'calendar', label: '日历查看' }] },
];

const selectionNodes: SelectionTreeNode[] = [
  {
    id: 'records-api',
    label: '记录接口',
    icon: 'folder',
    children: [
      {
        id: 'records-query',
        label: '查询',
        children: [
          { id: 'records-list', label: '读取列表' },
          { id: 'records-detail', label: '读取详情' },
        ],
      },
      { id: 'records-update', label: '更新记录' },
      { id: 'records-remove', label: '删除记录', disabled: true },
      { id: 'unavailable', label: '暂无可用接口', children: [] },
    ],
  },
];

function PermissionDemo() {
  const [value, setValue] = useState<string[]>(['records']);
  const [inherited, setInherited] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [nativeStructure, setNativeStructure] = useState(false);
  const [expanded, setExpanded] = useState<readonly string[]>([
    'records',
    'preferences',
    'advanced-preferences',
    'extensions',
  ]);
  return (
    <div className="docs-stack">
      <Checkbox checked={inherited} onChange={(event) => setInherited(event.currentTarget.checked)}>
        角色授予查看记录
      </Checkbox>
      <Checkbox checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)}>
        只读查看
      </Checkbox>
      <Checkbox checked={nativeStructure} onChange={(event) => setNativeStructure(event.currentTarget.checked)}>
        原站 HTML 结构
      </Checkbox>
      <PermissionTree
        aria-label="应用授权"
        nodes={permissionNodes}
        value={value}
        onValueChange={setValue}
        inheritedValues={inherited ? ['records-read'] : []}
        expanded={expanded}
        onExpandedChange={setExpanded}
        labels={treeLabels}
        readOnly={readOnly}
        nativeStructure={nativeStructure}
      />
      <output aria-label="直接授权">直接授权：{value.join(', ') || '无'}</output>
    </div>
  );
}

function SelectionDemo() {
  const [value, setValue] = useState<string[]>(['records-list']);
  const [readOnly, setReadOnly] = useState(false);
  const [nativeStructure, setNativeStructure] = useState(false);
  return (
    <div className="docs-stack">
      <Checkbox checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)}>
        只读查看
      </Checkbox>
      <Checkbox checked={nativeStructure} onChange={(event) => setNativeStructure(event.currentTarget.checked)}>
        原站 HTML 结构
      </Checkbox>
      <SelectionTree
        aria-label="API 范围选择"
        nodes={selectionNodes}
        value={value}
        onValueChange={setValue}
        labels={treeLabels}
        readOnly={readOnly}
        inlineLeaves
        nativeStructure={nativeStructure}
        leafAttribute="data-token-scope"
      />
      <output aria-label="选中的 API 范围">选中的叶子：{value.join(', ') || '无'}</output>
    </div>
  );
}

const sharedProps = [
  {
    name: 'value / onValueChange',
    type: 'readonly string[] / (value: string[]) => void',
    description: '必填受控值；缺少回调时只读。',
  },
  {
    name: 'expanded / defaultExpanded',
    type: 'readonly string[]',
    description: '受控展开项 / 非受控初始展开项；用户操作的展开状态在重绘时保留。',
  },
  {
    name: 'onExpandedChange',
    type: '(value: readonly string[]) => void',
    description: '展开变化回调，供宿主保存工作区状态。',
  },
  { name: 'readOnly', type: 'boolean', default: 'false', description: '禁止选择修改，仍可展开浏览。' },
  {
    name: 'labels',
    type: 'PermissionTreeLabels',
    description: '必填，展开 / 收起 / 分组名称 / 全选 / 计数 / 必选与继承文案，示例中给出完整写法。',
  },
  { name: 'aria-label', type: 'string', description: '必填，整组控件的名称。' },
  {
    name: 'nativeStructure',
    type: 'boolean',
    default: 'false',
    description: '迁移原站时保留 account-perm-* 类名、apps 字段名与 data-perm-* 标记。',
  },
];

export const permissionTreeDoc: ComponentDoc = {
  name: { 'zh-CN': '应用权限树', 'en-US': 'Permission tree' },
  summary: {
    'zh-CN': '迁移账号与角色共用的分组授权界面，区分直接授权、角色继承、必选项和不可授予项。',
    'en-US':
      'Migrates the grouped authorization UI shared by accounts and roles, distinguishing direct grants, role inheritance, required items, and non-grantable items.',
  },
  usage: [
    'value 仅提供直接授权，inheritedValues 单独提供角色继承。继承项显示勾选并禁用，不因其他操作被写回直接授权；原有直接值在继承撤销后仍保留。',
    '勾选父项不会全选子权限，取消任意父项均会同步清除其可编辑后代；需要勾选子项时自动补选父项可配置 childPolicy="require-parent"，仅影响可编辑节点。',
    '节点 description 通过可悬停、可键盘聚焦的问号提示展示；行末统一只放置问号提示图标。启用 childActions 后不增加额外下箭头或行末按钮，单击父复选框仅切换当前节点（取消时同步取消可编辑后代），单击节点标题名称可同时勾选或取消当前可编辑节点与全部可编辑子级（纯分组节点直接提供半选联动复选框）。',
    '权限树按一级竖排、二级横向并排、三级竖排的横竖交替层级组织（不再绘制左侧连接线）；二级与三级均不额外包裹边框或底色容器，直接按层级缩进展开。',
    'groupOnly 仅分组；required 固定显示勾选。二者都不自动生成直接授权，必选初值的业务规范由宿主处理。',
    'required、disabled 与 readOnly 都不能替代服务端授权。节点目录、管理员限制、修订号和保存请求必须由宿主与服务端处理。',
    '展开状态可受控以接入工作区。省略时只在首次挂载按必选项或已选子项初始化，随后保留用户操作；异步载入时由宿主提供展开状态。',
    '不可见的既有直接值在回调中保留，不由 UI 静默撤销；调用方在保存时仍需按当前目录和服务端规则校验。',
    'nativeStructure 保留迁移源的 account-perm-* 节点类名、apps 字段名与 data-perm-* 标记；选择和展开仍由该组件控制。',
  ],
  demos: [
    {
      title: '直接授权与角色继承',
      description: '切换角色授予和只读状态；帮助图标统一位于行末，下方输出展示直接授权，继承项不会被复制进去。',
      code: `${labelsCode}
const permissionNodes: PermissionTreeNode[] = ${JSON.stringify(permissionNodes, null, 2)};
const [value, setValue] = useState<string[]>(['records']);
const [inherited, setInherited] = useState(true);
const [readOnly, setReadOnly] = useState(false);
const [nativeStructure, setNativeStructure] = useState(false);
const [expanded, setExpanded] = useState<readonly string[]>(['records', 'preferences', 'extensions']);
<PermissionTree aria-label="应用授权" nodes={permissionNodes} value={value} onValueChange={setValue}
  inheritedValues={inherited ? ['records-read'] : []} expanded={expanded} onExpandedChange={setExpanded} labels={treeLabels}
  readOnly={readOnly} nativeStructure={nativeStructure} />`,
      render: () => <PermissionDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'PermissionTree',
      props: [
        {
          name: 'nodes',
          type: 'readonly PermissionTreeNode[]',
          description: '必填，唯一 id、label、可选 children / icon / description / disabled。',
        },
        ...sharedProps,
        {
          name: 'inheritedValues',
          type: 'readonly string[]',
          description: '角色继承的有效权限，单独显示且不可直接编辑。',
        },
        {
          name: '节点 required / groupOnly',
          type: 'boolean',
          description: '固定勾选 / 只有分组标题；不自动生成直接授权。',
        },
        {
          name: '节点 childPolicy',
          type: "'independent' | 'require-parent'",
          default: "'independent'",
          description: '独立勾选子项 / 勾选子项时补选可编辑父项（两种模式取消父项均清除可编辑后代）。',
        },
        {
          name: 'nativeStructure',
          type: 'boolean',
          default: 'false',
          description: '迁移原站时保留 account-perm-* 类名、apps 字段名与 data-perm-* 标记，不注入 ds-* 结构类。',
        },
      ],
    },
  ],
  a11y: [
    '采用命名 group、原生复选框与展开按钮，Tab / Space / Enter 保留原生行为；不冒充需要方向键导航的 ARIA tree。',
    '展开通过 aria-expanded / aria-controls 关联；帮助提示可悬停或键盘聚焦，并在行末对齐，继承和必选状态与控件描述关联。',
    '采用 28px 主行、横向并排二级列表与纵向三级列表；不绘制左侧连接线，窄容器允许行内工具与子级横向换行。',
  ],
};

export const selectionTreeDoc: ComponentDoc = {
  name: { 'zh-CN': 'API 范围树', 'en-US': 'API scope tree' },
  summary: {
    'zh-CN': '迁移个人令牌的嵌套 API 选择界面，分组支持全选与半选，结果仅包含可选叶子标识。',
    'en-US':
      'Migrates the nested API selection UI for personal tokens; groups support select-all and indeterminate, and results contain only selectable leaf ids.',
  },
  usage: [
    '没有 children 属性的节点才是叶子；children: [] 代表空分组，显示为不可选择，不能被当作 API 范围。',
    '分组勾选只批量修改可编辑叶子，禁用项保持原值。可编辑叶子已经全选时，再次操作可清空它们，即使禁用项让整组仍呈半选。',
    '回调只返回当前节点目录中的叶子，不返回任何分组标识。选择操作不发请求，不向账号授予应用权限。',
    'value 由宿主控制，readOnly 时仍可展开；初始默认展开所有有内容的分组，也可显式控制 expanded。',
    '目录只能包含账号当前可用的范围；最终机器令牌范围仍由服务端与账号直接 / 全部角色授权取交集。',
    'inlineLeaves 只会横向排列直接子项全部为叶子的分组；含嵌套分组的层级保持原有纵向结构。',
    '迁移已有页面时可启用 nativeStructure，保留原站 account-perm-* 类名和叶子直接挂载结构；leafAttribute 可继续提供原站筛选用的 data-* 属性。该模式按原站过滤空分组。',
  ],
  demos: [
    {
      title: '嵌套、半选与受限项',
      description: '操作任意分组检查半选与叶子结果；受限项和空分组不可选择。',
      code: `${labelsCode}
const selectionNodes: SelectionTreeNode[] = ${JSON.stringify(selectionNodes, null, 2)};
const [value, setValue] = useState<string[]>(['records-list']);
const [readOnly, setReadOnly] = useState(false);
const [nativeStructure, setNativeStructure] = useState(false);
<SelectionTree aria-label="API 范围选择" nodes={selectionNodes} value={value} onValueChange={setValue} labels={treeLabels}
  readOnly={readOnly} inlineLeaves nativeStructure={nativeStructure} leafAttribute="data-token-scope" />`,
      render: () => <SelectionDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'SelectionTree',
      props: [
        {
          name: 'nodes',
          type: 'readonly SelectionTreeNode[]',
          description: '必填，唯一 id、label、可选 children / icon / description / disabled。',
        },
        ...sharedProps,
        {
          name: '节点 children',
          type: 'readonly SelectionTreeNode[]',
          description: '存在该属性即为分组，空数组代表空分组。',
        },
        { name: '节点 disabled', type: 'boolean', description: '禁止修改该叶子；用于分组时禁止该分组及其后代的修改。' },
        {
          name: 'inlineLeaves',
          type: 'boolean',
          default: 'false',
          description: '仅将直接子项全为叶子的分组横向排列，兼容原站个人令牌 API 范围布局。',
        },
        {
          name: 'nativeStructure',
          type: 'boolean',
          default: 'false',
          description: '按原站输出 account-perm-* DOM 类名和分组 / 叶子层级，迁移页面适配原 CSS。',
        },
        {
          name: 'leafAttribute',
          type: '`data-${string}`',
          description: 'nativeStructure 启用时添加到叶子复选框的原站 data-* 属性。',
        },
      ],
    },
  ],
  a11y: [
    '分组原生复选框同步 indeterminate 与 aria-checked="mixed"，同时展示选中计数。',
    '禁用项不因批量操作改变；折叠内容退出可访问树和键盘顺序。',
  ],
};
