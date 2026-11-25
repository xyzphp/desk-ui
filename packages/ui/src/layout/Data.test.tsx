import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { Pagination, Table, type PaginationLabels } from './Data';

const labels: PaginationLabels = {
  previous: '上一页',
  next: '下一页',
  pageSize: '每页条数',
  page: (page, pageCount) => `${page} / ${pageCount}`,
  total: (total) => `共 ${total} 条`,
};

describe('Pagination', () => {
  it('支持非受控翻页，首尾页禁用对应按钮', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination aria-label="记录分页" total={45} pageSize={20} labels={labels} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: '记录分页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 / 3');
    await user.click(screen.getByRole('button', { name: '下一页' }));
    expect(screen.getByRole('status')).toHaveTextContent('3 / 3');
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '上一页' }));
    expect(onPageChange.mock.calls).toEqual([[2], [3], [2]]);
  });

  it('受控页码等待调用方更新，不主动请求新的页码', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination
        aria-label="记录分页"
        total={45}
        pageSize={20}
        page={2}
        labels={labels}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: '上一页' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('status')).toHaveTextContent('2 / 3');
    rerender(
      <Pagination
        aria-label="记录分页"
        total={45}
        pageSize={20}
        page={1}
        labels={labels}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 / 3');
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it('总数减少与空数据只收敛显示边界，不触发隐式回调', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination
        aria-label="记录分页"
        total={45}
        pageSize={20}
        page={5}
        labels={labels}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('3 / 3');
    rerender(
      <Pagination aria-label="记录分页" total={0} pageSize={20} page={5} labels={labels} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 / 1');
    expect(screen.getByText('共 0 条')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('条数选择只通知新条数，由调用方统一重置页码', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        aria-label="记录分页"
        total={200}
        pageSize={20}
        page={3}
        pageSizeOptions={[50, 50, -1]}
        labels={labels}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const select = screen.getByRole('combobox', { name: '每页条数' });
    expect(select).toHaveTextContent('20');
    await user.click(select);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.click(screen.getByRole('option', { name: '50' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(select).toHaveTextContent('20');
    expect(screen.getByRole('status')).toHaveTextContent('3 / 10');
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('加载时可统一禁用所有操作；无条数回调时选择器不可更改', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const { rerender } = render(
      <Pagination
        aria-label="记录分页"
        total={100}
        pageSize={20}
        page={2}
        pageSizeOptions={[20, 50]}
        labels={labels}
        disabled
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const next = screen.getByRole('button', { name: '下一页' });
    expect(next).toBeDisabled();
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: '每页条数' })).toBeDisabled();
    await user.click(next);
    expect(onPageChange).not.toHaveBeenCalled();
    expect(onPageSizeChange).not.toHaveBeenCalled();

    rerender(<Pagination aria-label="记录分页" total={100} pageSize={20} pageSizeOptions={[20, 50]} labels={labels} />);
    expect(screen.getByRole('combobox', { name: '每页条数' })).toBeDisabled();
  });

  it('非法数值不会显示 NaN、无穷页数或产生可点击的越界页码', () => {
    render(<Pagination aria-label="记录分页" total={NaN} pageSize={0} page={Infinity} labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent('1 / 1');
    expect(screen.getByText('共 0 条')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
  });
});

describe('Table', () => {
  it('ref 指向滚动容器，可读写滚动位置', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Table
        ref={ref}
        caption="示例"
        columns={[{ key: 'name', header: '名称' }]}
        rows={[{ name: '甲' }]}
        rowKey={(row) => row.name}
      />,
    );
    expect(ref.current).toHaveClass('ds-table-scroll');
    expect(ref.current).toContainElement(screen.getByRole('table'));
    ref.current!.scrollTop = 12;
    expect(ref.current!.scrollTop).toBe(12);
  });
});
