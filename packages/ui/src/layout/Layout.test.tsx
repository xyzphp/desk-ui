import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { List, ListItem } from './Layout';
import { Stepper, Table, Tabs } from './Data';

describe('ListItem', () => {
  it('选中态通过 aria-pressed 表达并显示勾选标记', () => {
    render(
      <List>
        <ListItem title="令牌 A" selected />
        <ListItem title="令牌 B" />
      </List>,
    );
    expect(screen.getByRole('button', { name: /令牌 A/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /令牌 B/ })).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelectorAll('.ds-list-trailing')).toHaveLength(1);
  });

  it('点击触发 onSelect', async () => {
    const onSelect = vi.fn();
    render(<List><ListItem title="令牌 A" onSelect={onSelect} /></List>);
    await userEvent.click(screen.getByRole('button', { name: /令牌 A/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('Tabs', () => {
  const items = [
    { value: 'a', label: '概览', content: '概览内容' },
    { value: 'b', label: '权限', content: '权限内容' },
    { value: 'c', label: '停用', disabled: true },
  ];

  it('方向键在可用页签间循环并切换内容', async () => {
    render(<Tabs aria-label="详情" items={items} defaultValue="a" />);
    const first = screen.getByRole('tab', { name: '概览' });
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: '权限' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('权限内容');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: '概览' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Table', () => {
  const columns = [
    { key: 'name', header: '名称', sortable: true },
    { key: 'status', header: '状态' },
  ];
  const rows = [{ id: '1', name: '甲', status: '启用' }];

  it('点击可排序表头请求升序，当前列带 aria-sort', async () => {
    const onSortChange = vi.fn();
    render(
      <Table caption="令牌" columns={columns} rows={rows} rowKey={(r) => r.id} sort={{ key: 'name', direction: 'ascending' }} onSortChange={onSortChange} />,
    );
    expect(screen.getByRole('columnheader', { name: /名称/ })).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(screen.getByRole('button', { name: /名称/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'descending' });
  });
});

describe('Stepper', () => {
  it('当前步骤标记 aria-current，点击回调步骤 id', async () => {
    const onSelect = vi.fn();
    render(
      <Stepper aria-label="发布流程" current="b" onSelect={onSelect} steps={[{ id: 'a', label: '连接' }, { id: 'b', label: '配置' }, { id: 'c', label: '发布' }]} />,
    );
    expect(screen.getByRole('button', { name: /配置/ })).toHaveAttribute('aria-current', 'step');
    await userEvent.click(screen.getByRole('button', { name: /发布/ }));
    expect(onSelect).toHaveBeenCalledWith('c');
  });
});
