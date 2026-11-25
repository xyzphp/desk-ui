import type { KeyboardEvent } from 'react';
import { useLabels, useLocale } from '../foundation/ConfigProvider';
import { chartScale, pieSlicePath, pieSlices, type ChartDatum } from './chartGeometry';
import type { ChartProps } from './Chart';

const viewWidth = 800;
const axisLeft = 80;
const axisRight = 775;
const tickCount = 4;

function chartKeyDown(event: KeyboardEvent<SVGElement>, datum: ChartDatum, onSelect?: (datum: ChartDatum) => void) {
  if (!onSelect || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  onSelect(datum);
}

function pointLabel(datum: ChartDatum, metricLabel: string) {
  return `${datum.label} · ${metricLabel}：${datum.displayValue}`;
}

export function CartesianChart({
  type,
  title,
  metricLabel,
  data,
  labels,
  grid,
  formatAxisValue,
  onSelect,
}: Pick<ChartProps, 'type' | 'title' | 'metricLabel' | 'labels' | 'grid' | 'formatAxisValue' | 'onSelect'> & {
  data: readonly ChartDatum[];
}) {
  const locale = useLocale();
  const { min, max, y } = chartScale(data);
  const range = max - min || 1;
  const stepX = (axisRight - axisLeft) / data.length;
  const values = data.map((datum, index) => ({ datum, x: axisLeft + (index + 0.5) * stepX, y: y(datum.value) }));
  const zeroY = y(0);
  const path = values.map((point) => `${point.x},${point.y}`).join(' ');
  const format =
    formatAxisValue ??
    ((value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value));
  const showPointLabels = labels && data.length <= 12;
  const showCategoryLabels = (index: number) => index % Math.max(1, Math.ceil(data.length / 8)) === 0;

  return (
    <svg
      className="ds-chart-plot"
      viewBox={`0 0 ${viewWidth} 320`}
      role={onSelect ? 'group' : 'img'}
      aria-label={`${title} · ${metricLabel}`}
    >
      {Array.from({ length: tickCount + 1 }, (_, index) => {
        const value = min + (range * index) / tickCount;
        const at = y(value);
        return (
          <g key={index}>
            {grid && <line x1={axisLeft} y1={at} x2={axisRight} y2={at} stroke="var(--border)" />}
            <text x={axisLeft - 10} y={at + 5} textAnchor="end" fill="currentColor" fontSize="16">
              {format(value)}
            </text>
          </g>
        );
      })}
      <line x1={axisLeft} y1={zeroY} x2={axisRight} y2={zeroY} stroke="var(--text-2)" />
      {type === 'line' && <polyline points={path} fill="none" stroke="var(--ds-chart-color)" strokeWidth="2" />}
      {values.map(({ datum, x, y: pointY }, index) => {
        const selectable = onSelect
          ? {
              role: 'button' as const,
              tabIndex: 0,
              'aria-label': pointLabel(datum, metricLabel),
              onClick: () => onSelect(datum),
              onKeyDown: (event: KeyboardEvent<SVGElement>) => chartKeyDown(event, datum, onSelect),
            }
          : {};
        const width = Math.max(2, Math.min(240 / data.length, stepX * 0.72));
        const shape =
          type === 'line' ? (
            <circle cx={x} cy={pointY} r="5" fill="var(--ds-chart-color)" {...selectable}>
              <title>{pointLabel(datum, metricLabel)}</title>
            </circle>
          ) : (
            <rect
              x={x - width / 2}
              y={Math.min(pointY, zeroY)}
              width={width}
              height={Math.max(1, Math.abs(zeroY - pointY))}
              rx="2"
              fill="var(--ds-chart-color)"
              {...selectable}
            >
              <title>{pointLabel(datum, metricLabel)}</title>
            </rect>
          );
        return (
          <g key={datum.key}>
            {shape}
            {showCategoryLabels(index) && (
              <text x={x} y="292" textAnchor="middle" fill="currentColor" fontSize="16">
                {datum.label.slice(0, 10)}
              </text>
            )}
            {showPointLabels && (
              <text
                x={x}
                y={pointY + (datum.value < 0 ? 22 : -10)}
                textAnchor="middle"
                fill="currentColor"
                fontSize="16"
              >
                {datum.displayValue}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function PieChart({
  title,
  metricLabel,
  data,
  labels,
  onSelect,
}: Pick<ChartProps, 'title' | 'metricLabel' | 'labels' | 'onSelect'> & { data: readonly ChartDatum[] }) {
  const slices = pieSlices(data, useLabels('chart').other);
  return (
    <svg
      className="ds-chart-plot"
      viewBox="0 0 800 320"
      role={onSelect ? 'group' : 'img'}
      aria-label={`${title} · ${metricLabel}`}
    >
      {slices.map((slice, index) => {
        if (slice.value <= 0) return null;
        const fraction = (slice.endAngle - slice.startAngle) / (Math.PI * 2);
        const opacity = 0.3 + (0.7 * (index + 1)) / slices.length;
        const selectable =
          slice.datum && onSelect
            ? {
                role: 'button' as const,
                tabIndex: 0,
                'aria-label': pointLabel(slice.datum, metricLabel),
                onClick: () => onSelect(slice.datum!),
                onKeyDown: (event: KeyboardEvent<SVGElement>) => chartKeyDown(event, slice.datum!, onSelect),
              }
            : {};
        const titleText = slice.datum ? pointLabel(slice.datum, metricLabel) : `${slice.label}：${slice.value}`;
        const point =
          fraction >= 0.999999 ? (
            <circle cx="250" cy="155" r="125" fill="var(--ds-chart-color)" opacity={opacity} {...selectable}>
              <title>{titleText}</title>
            </circle>
          ) : (
            <path
              d={pieSlicePath(slice.startAngle, slice.endAngle) ?? ''}
              fill="var(--ds-chart-color)"
              opacity={opacity}
              {...selectable}
            >
              <title>{titleText}</title>
            </path>
          );
        const middle = (slice.startAngle + slice.endAngle) / 2;
        return (
          <g key={slice.key}>
            {point}
            {labels && slices.length <= 8 && (
              <text
                x={250 + Math.cos(middle) * 145}
                y={155 + Math.sin(middle) * 145}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize="16"
              >
                {slice.label.slice(0, 12)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
