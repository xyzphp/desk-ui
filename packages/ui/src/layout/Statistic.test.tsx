import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Statistic, StatCard } from './Statistic';
import { Grid, Inline, Stack } from './Spacing';

describe('Statistic / StatCard 和布局组合', () => {
  it('0 参与格式化，空值不格式化；趋势文字和操作保留语义', () => {
    const format = vi.fn((value) => `${value}.00`);
    render(<Grid columns={2}><StatCard label="总数" value={0} format={format} trend={{ direction: 'flat', label: '与昨天相同' }} />
      <Statistic label="未知" value={null} format={format} /></Grid>);
    expect(screen.getByText('0.00')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(format).toHaveBeenCalledExactlyOnceWith(0);
    expect(screen.getByText('与昨天相同')).toBeInTheDocument();
  });
  it('加载状态有可访问反馈，基础布局透传原生属性', () => {
    render(<Stack aria-label="纵向"><Inline role="group" aria-label="操作"><button>刷新</button></Inline>
      <Statistic label="处理中" value={5} loading /></Stack>);
    expect(screen.getByRole('group', { name: '操作' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('加载中');
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });
});
