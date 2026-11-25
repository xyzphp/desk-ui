import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  PermissionTree,
  SelectionTree,
  type PermissionTreeLabels,
  type PermissionTreeNode,
  type SelectionTreeNode,
} from './PermissionTree';

const labels: PermissionTreeLabels = {
  expand: (label) => `展开${label}`,
  collapse: (label) => `收起${label}`,
  children: (label) => `${label}子项`,
  selectAll: (label) => `全选${label}`,
  count: (selected, total) => `${selected} / ${total}`,
  required: '必选',
  inherited: '角色继承',
};
const nodes: PermissionTreeNode[] = [
  {
    id: 'tools',
    label: '工具',
    children: [
      { id: 'read', label: '读取' },
      { id: 'write', label: '写入' },
      { id: 'locked', label: '受限操作', disabled: true },
    ],
  },
];

describe('PermissionTree', () => {
  it('勾选父项不会自动授予子权限；取消任意父项会同步清除可编辑子权限', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <PermissionTree
          aria-label="授权"
          nodes={nodes}
          value={value}
          onValueChange={setValue}
          labels={labels}
          defaultExpanded={['tools']}
        />
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('checkbox', { name: '工具' }));
    expect(screen.getByRole('checkbox', { name: '工具' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '读取' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).not.toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: '读取' }));
    expect(screen.getByRole('checkbox', { name: '读取' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: '工具' }));
    expect(screen.getByRole('checkbox', { name: '工具' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '读取' })).not.toBeChecked();
  });

  it('开启 childActions 时点击复选框只切换当前节点，点击标题可同时勾选当前可编辑节点与子级（含独立策略组），再次点击同步取消，不触碰受限子项', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <PermissionTree
          aria-label="授权"
          nodes={[
            { ...nodes[0]!, childPolicy: 'require-parent' },
            {
              id: 'account-settings',
              label: '账号设置',
              childPolicy: 'independent',
              children: [{ id: 'security-settings', label: '登录设置' }],
            },
            {
              id: 'extensions',
              label: '扩展',
              groupOnly: true,
              children: [
                { id: 'ext-a', label: '插件A' },
                { id: 'ext-locked', label: '插件受限', disabled: true },
              ],
            },
          ]}
          value={value}
          onValueChange={setValue}
          labels={labels}
          defaultExpanded={['tools', 'account-settings', 'extensions']}
          childActions={{ selectChildren: '勾选子级', clearChildren: '取消子级' }}
        />
      );
    }
    const { container } = render(<Demo />);
    expect(container.querySelector('.ds-permission-group-tools')).not.toBeInTheDocument();
    expect(container.querySelector('.ds-permission-check-trigger')).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: '工具' }));
    expect(screen.getByRole('checkbox', { name: '工具' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '读取' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: '勾选子级 工具' }));
    expect(screen.getByRole('checkbox', { name: '工具' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '读取' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '受限操作' })).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: '取消子级 工具' }));
    expect(screen.getByRole('checkbox', { name: '工具' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '读取' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: '勾选子级 账号设置' }));
    expect(screen.getByRole('checkbox', { name: '账号设置' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '登录设置' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: '取消子级 账号设置' }));
    expect(screen.getByRole('checkbox', { name: '账号设置' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '登录设置' })).not.toBeChecked();

    const groupCheck = screen.getByRole('checkbox', { name: '全选扩展' });
    await user.click(groupCheck);
    expect(groupCheck).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '插件A' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '插件受限' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: '取消子级 扩展' }));
    expect(groupCheck).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '插件A' })).not.toBeChecked();
  });

  it('按配置补选父项，但继承父项不进入直接授权', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const dependent: PermissionTreeNode[] = [{ ...nodes[0]!, childPolicy: 'require-parent' }];
    const { rerender } = render(
      <PermissionTree
        aria-label="授权"
        nodes={dependent}
        value={[]}
        onValueChange={onValueChange}
        labels={labels}
        defaultExpanded={['tools']}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: '写入' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['write', 'tools']);

    rerender(
      <PermissionTree
        aria-label="授权"
        nodes={dependent}
        value={[]}
        inheritedValues={['tools']}
        onValueChange={onValueChange}
        labels={labels}
      />,
    );
    expect(screen.getByRole('checkbox', { name: '工具' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: '写入' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['write']);
  });

  it('角色变化重新计算显示状态，不把继承权限回写成直接授权', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <PermissionTree
        aria-label="授权"
        nodes={nodes}
        value={['read']}
        inheritedValues={['read', 'write']}
        onValueChange={onValueChange}
        labels={labels}
        defaultExpanded={['tools']}
      />,
    );
    expect(screen.getByRole('checkbox', { name: '读取' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: '写入' })).toHaveAccessibleDescription('角色继承');
    rerender(
      <PermissionTree aria-label="授权" nodes={nodes} value={['read']} onValueChange={onValueChange} labels={labels} />,
    );
    expect(screen.getByRole('checkbox', { name: '读取' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).toBeEnabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('原站权限树保留结构标记、二级横向并排与三级竖排，并将问号提示放在行末', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <PermissionTree
        aria-label="账号直接应用权限"
        nodes={[
          {
            id: 'settings',
            label: '系统设置',
            description: '系统基础能力',
            icon: 'settings',
            required: true,
            children: [
              { id: 'profile', label: '个人资料', description: '读取个人资料信息。' },
              { id: 'roles', label: '访问角色' },
              {
                id: 'extensions',
                label: '扩展能力',
                description: '管理扩展。',
                childPolicy: 'require-parent',
                children: [
                  { id: 'download', label: '下载文件' },
                  {
                    id: 'advanced',
                    label: '高级选项',
                    children: [{ id: 'debug', label: '调试模式' }],
                  },
                ],
              },
            ],
          },
        ]}
        value={[]}
        onValueChange={onValueChange}
        labels={labels}
        childActions={{ selectChildren: '勾选子级', clearChildren: '取消子级' }}
        defaultExpanded={['settings', 'extensions', 'advanced']}
        nativeStructure
        data-account-permissions=""
      />,
    );
    expect(container.querySelector('.account-perm-tree[data-account-permissions]')).toBeInTheDocument();
    const settingsNode = container.querySelector('.account-perm-node[data-perm-group="settings"]');
    expect(settingsNode).toBeInTheDocument();
    expect(settingsNode?.querySelector(':scope > .account-perm-row')?.lastElementChild).toHaveClass('account-help-tip');
    expect(settingsNode?.querySelector('.account-perm-group-tools')).not.toBeInTheDocument();
    expect(settingsNode?.querySelector(':scope > .account-perm-row .account-perm-title-toggle')).toBeInTheDocument();
    expect(settingsNode?.querySelector(':scope > .account-perm-children')).toHaveClass('is-horizontal');

    expect(container.querySelector('input[name="apps"][data-perm-parent="settings"]')).toBeDisabled();
    expect(container.querySelector('input[name="apps"][data-perm-child-of="settings"]')).toHaveAttribute(
      'value',
      'profile',
    );
    expect(container.querySelector('.account-perm-child--with-help .account-help-tip')).toHaveAttribute(
      'title',
      '读取个人资料信息。',
    );
    const roleInput = container.querySelector<HTMLInputElement>('input[name="apps"][value="roles"]');
    expect(roleInput?.parentElement?.querySelector('.account-perm-spacer')).not.toBeInTheDocument();
    const nestedGroup = container.querySelector('.account-perm-node[data-perm-group="extensions"]');
    expect(nestedGroup).toHaveClass('account-perm-node--nested');
    expect(nestedGroup?.parentElement?.closest('[data-perm-group]')).toHaveAttribute('data-perm-group', 'settings');
    expect(nestedGroup?.querySelector(':scope > .account-perm-row')?.lastElementChild).toHaveClass('account-help-tip');
    const levelThreeChildren = nestedGroup?.querySelector(':scope > .account-perm-children');
    expect(levelThreeChildren).not.toHaveClass('is-horizontal');
    const downloadInput = container.querySelector<HTMLInputElement>(
      'input[name="apps"][data-perm-child-of="extensions"][value="download"]',
    );
    expect(downloadInput).toBeInTheDocument();
    expect(downloadInput?.parentElement?.querySelector('.account-perm-spacer')).toBeInTheDocument();
    expect(container.querySelector('.account-perm-parent.is-required .account-perm-required')).toHaveTextContent(
      '必选',
    );
    await user.click(screen.getByRole('checkbox', { name: '个人资料' }));
    expect(onValueChange).toHaveBeenCalledWith(['profile']);
  });

  it('默认样式同样按二级横向、三级竖排交替，不渲染行末计数/子级按钮且问号提示位于行末', () => {
    const { container } = render(
      <PermissionTree
        aria-label="角色应用权限"
        nodes={[
          {
            id: 'settings',
            label: '系统设置',
            description: '系统级设置',
            children: [
              { id: 'accounts', label: '账号管理', description: '管理用户' },
              {
                id: 'security-group',
                label: '账号设置',
                description: '账号策略',
                children: [{ id: 'login', label: '登录设置', description: '登录入口与安全' }],
              },
            ],
          },
        ]}
        value={[]}
        inheritedValues={['accounts']}
        onValueChange={vi.fn()}
        labels={labels}
        childActions={{ selectChildren: '勾选子级', clearChildren: '取消子级' }}
        defaultExpanded={['settings', 'security-group']}
      />,
    );

    const rootNode = container.querySelector('.ds-permission-tree > .ds-permission-node');
    const rootRow = rootNode?.querySelector(':scope > .ds-permission-row');
    expect(rootRow?.lastElementChild).toHaveClass('ds-help-tip');
    expect(rootRow?.querySelector('.ds-permission-group-tools')).not.toBeInTheDocument();
    expect(rootRow?.querySelector('.ds-permission-title-toggle')).toBeInTheDocument();

    const levelTwoChildren = rootNode?.querySelector(':scope > .ds-permission-children');
    expect(levelTwoChildren).toHaveClass('is-horizontal');
    expect(screen.getByRole('checkbox', { name: '账号管理' })).toHaveAccessibleDescription(/角色继承/);

    const levelThreeChildren = levelTwoChildren?.querySelector('.ds-permission-node--nested > .ds-permission-children');
    expect(levelThreeChildren).not.toHaveClass('is-horizontal');
    const levelThreeRow = levelThreeChildren?.querySelector('.ds-permission-leaf > .ds-permission-row');
    expect(levelThreeRow?.lastElementChild).toHaveClass('ds-help-tip');
  });

  it('取消父项只清除可编辑子项，保留继承和禁用的直接授权', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PermissionTree
        aria-label="授权"
        nodes={[{ ...nodes[0]!, childPolicy: 'require-parent' }]}
        value={['tools', 'read', 'write', 'locked']}
        inheritedValues={['read']}
        onValueChange={onValueChange}
        labels={labels}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: '工具' }));
    expect(onValueChange).toHaveBeenCalledWith(['read', 'locked']);
  });

  it('只读树仍可键盘展开，明确折叠状态不会因 value 更新而丢失', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <PermissionTree
        aria-label="授权"
        nodes={nodes}
        value={['read']}
        labels={labels}
        readOnly
        onExpandedChange={onExpandedChange}
      />,
    );
    const collapse = screen.getByRole('button', { name: '收起工具' });
    await user.click(collapse);
    expect(screen.queryByRole('checkbox', { name: '读取' })).not.toBeInTheDocument();
    rerender(
      <PermissionTree
        aria-label="授权"
        nodes={nodes}
        value={['write']}
        labels={labels}
        readOnly
        onExpandedChange={onExpandedChange}
      />,
    );
    const expand = screen.getByRole('button', { name: '展开工具' });
    expand.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('checkbox', { name: '写入' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '写入' })).toBeDisabled();
    // 回调参数是展开的节点 id 数组：先收起为 []，再展开为 ['tools']。
    expect(onExpandedChange.mock.calls).toEqual([[[]], [['tools']]]);
  });

  it('分组与必选项不会变成新的直接授权，已有未知值保留', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PermissionTree
        aria-label="授权"
        nodes={[
          { id: 'fixed', label: '基础能力', required: true },
          {
            id: 'group',
            label: '扩展',
            groupOnly: true,
            childPolicy: 'require-parent',
            children: [{ id: 'leaf', label: '扩展能力' }],
          },
        ]}
        value={['unlisted']}
        onValueChange={onValueChange}
        labels={labels}
        defaultExpanded={['group']}
      />,
    );
    expect(screen.getByRole('checkbox', { name: '基础能力' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '基础能力' })).toBeDisabled();
    expect(screen.queryByRole('checkbox', { name: '扩展' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: '扩展能力' }));
    expect(onValueChange).toHaveBeenCalledWith(['unlisted', 'leaf']);
  });
});

describe('SelectionTree', () => {
  const groups: SelectionTreeNode[] = [{ id: 'api', label: '接口', children: nodes[0]!.children }];

  it('半选分组批量选择叶子，忽略禁用项，再次操作可清除可编辑项', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Demo() {
      const [value, setValue] = useState(['read']);
      return (
        <SelectionTree
          aria-label="API 范围"
          nodes={groups}
          value={value}
          labels={labels}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Demo />);
    const group = screen.getByRole('checkbox', { name: '全选接口' }) as HTMLInputElement;
    expect(group).toHaveAttribute('aria-checked', 'mixed');
    expect(group.indeterminate).toBe(true);
    await user.click(group);
    expect(onValueChange).toHaveBeenLastCalledWith(['read', 'write']);
    expect(screen.getByRole('checkbox', { name: '受限操作' })).not.toBeChecked();
    expect(group.indeterminate).toBe(true);
    await user.click(group);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('嵌套分组不进入叶子结果，空分组不可选择', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SelectionTree
        aria-label="API 范围"
        nodes={[
          {
            id: 'root',
            label: '全部',
            children: [
              { id: 'nested', label: '记录', children: [{ id: 'read', label: '读取' }] },
              { id: 'empty', label: '空分组', children: [] },
            ],
          },
        ]}
        value={[]}
        onValueChange={onValueChange}
        labels={labels}
      />,
    );
    expect(screen.getByRole('checkbox', { name: '全选空分组' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: '全选全部' }));
    expect(onValueChange).toHaveBeenCalledWith(['read']);
  });

  it('内联模式将直接叶子渲染成横向列表，嵌套分组保留分层结构', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <SelectionTree
        aria-label="API 范围"
        nodes={[
          {
            id: 'root',
            label: '全部',
            children: [
              {
                id: 'flat',
                label: '常用接口',
                children: [
                  { id: 'read', label: '读取' },
                  { id: 'write', label: '写入' },
                ],
              },
              {
                id: 'nested',
                label: '记录',
                children: [{ id: 'list', label: '列表', children: [{ id: 'detail', label: '详情' }] }],
              },
            ],
          },
        ]}
        value={[]}
        onValueChange={onValueChange}
        labels={labels}
        inlineLeaves
      />,
    );
    const inline = container.querySelector('.ds-permission-children.is-inline');
    expect(inline?.children).toHaveLength(2);
    expect(inline?.querySelectorAll(':scope > .ds-permission-child')).toHaveLength(2);
    expect(container.querySelectorAll('.ds-permission-children.is-inline')).toHaveLength(2);
    expect(
      container.querySelector('.ds-permission-children.is-inline > .ds-permission-child input'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: '读取' }));
    expect(onValueChange).toHaveBeenCalledWith(['read']);
  });

  it('原站结构模式保留 account-perm DOM、数据属性和原生选择行为', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <SelectionTree
        aria-label="API 范围"
        nodes={[{ id: 'root', label: '全部', children: [{ id: 'read', label: '读取' }] }]}
        value={[]}
        onValueChange={onValueChange}
        labels={labels}
        nativeStructure
        inlineLeaves
        leafAttribute="data-token-scope"
        data-token-scope-tree=""
      />,
    );
    expect(container.querySelector('.account-perm-tree[data-token-scope-tree]')).toBeInTheDocument();
    expect(container.querySelector('.ds-permission-tree')).not.toBeInTheDocument();
    expect(
      container.querySelector('.account-perm-node[data-selection-group="root"] .account-perm-parent input'),
    ).toHaveAttribute('data-selection-parent', 'root');
    expect(container.querySelector('.account-perm-child input[data-token-scope="read"]')).toHaveAttribute(
      'data-selection-child-of',
      'root',
    );
    expect(container.querySelector('.account-perm-child input[data-token-scope="read"]')).toHaveAttribute(
      'value',
      'read',
    );
    await user.click(screen.getByRole('checkbox', { name: '读取' }));
    expect(onValueChange).toHaveBeenCalledWith(['read']);
  });

  it('受控调用方未应用结果时，点击不会让原生半选状态丢失', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SelectionTree
        aria-label="API 范围"
        nodes={groups}
        value={['read']}
        onValueChange={onValueChange}
        labels={labels}
      />,
    );
    const group = screen.getByRole('checkbox', { name: '全选接口' }) as HTMLInputElement;
    await user.click(group);
    expect(onValueChange).toHaveBeenCalledWith(['read', 'write']);
    expect(group.indeterminate).toBe(true);
    expect(group).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByRole('checkbox', { name: '写入' })).not.toBeChecked();
  });

  it('父分组禁用时，根分组的批量选择也不能更改其后代', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SelectionTree
        aria-label="API 范围"
        nodes={[
          {
            id: 'root',
            label: '全部',
            children: [
              { id: 'restricted', label: '受限分组', disabled: true, children: [{ id: 'locked', label: '既有授权' }] },
              { id: 'editable', label: '可选能力' },
            ],
          },
        ]}
        value={['locked']}
        onValueChange={onValueChange}
        labels={labels}
      />,
    );
    expect(screen.getByRole('checkbox', { name: '既有授权' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: '全选全部' }));
    expect(onValueChange).toHaveBeenCalledWith(['locked', 'editable']);
  });
});
