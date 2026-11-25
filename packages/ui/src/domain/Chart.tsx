import type { ComponentProps, CSSProperties } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { CartesianChart, PieChart } from './ChartPlot';
import { prepareChartData, type ChartDatum } from './chartGeometry';

export type { ChartDatum } from './chartGeometry';
export type ChartType = 'bar' | 'line' | 'pie' | 'number';
export type ChartPalette = 'theme' | 'blue' | 'green';

export interface ChartLabels {
  empty: string;
  negativePie: string;
  zeroPie: string;
  overflow: string;
  overflowPie: string;
  /** 饼图超出展示上限时合并项的名称。 */
  other: string;
}

export interface ChartProps extends Omit<ComponentProps<'div'>, 'children' | 'title' | 'onSelect'> {
  rootElement?: 'div' | 'section';
  type: ChartType;
  title: string;
  metricLabel: string;
  data: readonly ChartDatum[];
  palette?: ChartPalette;
  legend?: boolean;
  labels?: boolean;
  grid?: boolean;
  formatAxisValue?: (value: number) => string;
  onSelect?: (datum: ChartDatum) => void;
  emptyLabel?: string;
  negativePieLabel?: string;
  zeroPieLabel?: string;
  overflowLabel?: string;
  overflowPieLabel?: string;
}

const paletteValues: Record<ChartPalette, string> = {
  theme: 'var(--accent)',
  blue: 'var(--ds-chart-blue)',
  green: 'var(--ds-chart-green)',
};

export function Chart({
  rootElement = 'div',
  type,
  title,
  metricLabel,
  data,
  palette = 'theme',
  legend = true,
  labels: showLabels = true,
  grid = true,
  formatAxisValue,
  onSelect,
  emptyLabel,
  negativePieLabel,
  zeroPieLabel,
  overflowLabel,
  overflowPieLabel,
  className,
  style,
  ...rest
}: ChartProps) {
  const copy = useLabels('chart');
  const { points, visible, overflow } = prepareChartData(data);
  const total = points.reduce((sum, datum) => sum + datum.value, 0);
  const negativePie = type === 'pie' && points.some((datum) => datum.value < 0);
  const invalidPie = negativePie || (type === 'pie' && total <= 0);
  const styleWithPalette = { ...style, '--ds-chart-color': paletteValues[palette] } as CSSProperties;
  const Root = rootElement;
  let content = (
    <div className="ds-chart-empty" role="status">
      {emptyLabel ?? copy.empty}
    </div>
  );

  if (points.length > 0 && type === 'number') {
    content = (
      <div className="ds-chart-metric" role="group" aria-label={`${title} · ${metricLabel}`}>
        <span>{metricLabel}</span>
        <strong>{visible[0]?.displayValue}</strong>
      </div>
    );
  } else if (points.length > 0 && negativePie) {
    content = (
      <div className="ds-chart-empty" role="status">
        {negativePieLabel ?? copy.negativePie}
      </div>
    );
  } else if (points.length > 0 && type === 'pie' && total <= 0) {
    content = (
      <div className="ds-chart-empty" role="status">
        {zeroPieLabel ?? copy.zeroPie}
      </div>
    );
  } else if (points.length > 0 && type === 'pie') {
    content = (
      <PieChart title={title} metricLabel={metricLabel} data={points} labels={showLabels} onSelect={onSelect} />
    );
  } else if (points.length > 0) {
    content = (
      <CartesianChart
        type={type}
        title={title}
        metricLabel={metricLabel}
        data={visible}
        labels={showLabels}
        grid={grid}
        formatAxisValue={formatAxisValue}
        onSelect={onSelect}
      />
    );
  }

  return (
    <Root {...rest} className={cx('ds-chart', className)} data-palette={palette} style={styleWithPalette}>
      {content}
      {type !== 'number' && legend && points.length > 0 && !invalidPie && (
        <div className="ds-chart-legend">
          <span className="ds-chart-swatch" aria-hidden="true" />
          <span>{metricLabel}</span>
        </div>
      )}
      {overflow && type !== 'number' && !invalidPie && (
        <p className="ds-chart-note">
          {type === 'pie' ? (overflowPieLabel ?? overflowLabel ?? copy.overflowPie) : (overflowLabel ?? copy.overflow)}
        </p>
      )}
    </Root>
  );
}
