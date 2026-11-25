import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chart } from './Chart';

const points = [
  { key: 'a', label: '一月', value: 12, displayValue: '12' },
  { key: 'b', label: '二月', value: 18, displayValue: '18' },
];

describe('Chart', () => {
  it('renders a number metric without SVG and keeps zero as data', () => {
    render(
      <Chart type="number" title="总量" metricLabel="记录" data={[{ ...points[0]!, value: 0, displayValue: '0' }]} />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('supports a section root for source-compatible chart layouts', () => {
    const view = render(<Chart rootElement="section" type="bar" title="统计" metricLabel="数量" data={points} />);
    expect(view.container.querySelector('section.ds-chart')).toHaveAttribute('data-palette', 'theme');
  });

  it('supports keyboard selection for chart points', () => {
    const onSelect = vi.fn();
    render(<Chart type="line" title="趋势" metricLabel="访问量" data={points} onSelect={onSelect} />);
    const point = screen.getAllByRole('button')[0]!;
    fireEvent.keyDown(point, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(points[0]);
  });

  it('explains why negative values cannot render as a pie chart', () => {
    render(<Chart type="pie" title="占比" metricLabel="数量" data={[{ ...points[0]!, value: -2 }]} />);
    expect(screen.getByRole('status')).toHaveTextContent('饼图不支持负数');
  });

  it('limits graph detail to 50 points while leaving the caller data untouched', () => {
    const data = Array.from({ length: 52 }, (_, index) => ({
      key: String(index),
      label: `项目 ${index}`,
      value: index,
      displayValue: String(index),
    }));
    render(<Chart type="bar" title="项目统计" metricLabel="数量" data={data} />);
    expect(screen.getByText(/前 50 组/)).toBeInTheDocument();
    expect(data).toHaveLength(52);
  });

  it('allows applications to provide a separate overflow note for pie charts', () => {
    const data = Array.from({ length: 52 }, (_, index) => ({
      key: String(index),
      label: `项目 ${index}`,
      value: index + 1,
      displayValue: String(index + 1),
    }));
    render(
      <Chart
        type="pie"
        title="项目占比"
        metricLabel="数量"
        data={data}
        overflowLabel="通用说明"
        overflowPieLabel="饼图专用说明"
      />,
    );
    expect(screen.getByText('饼图专用说明')).toBeInTheDocument();
  });
});
