export interface ChartDatum {
  key: string;
  label: string;
  value: number;
  displayValue: string;
}

export interface PieSlice {
  key: string;
  label: string;
  value: number;
  datum?: ChartDatum;
  startAngle: number;
  endAngle: number;
}

export const maxChartPoints = 50;

export function prepareChartData(data: readonly ChartDatum[]) {
  const points = data.filter((datum) => Number.isFinite(datum.value));
  return { points, visible: points.slice(0, maxChartPoints), overflow: points.length > maxChartPoints };
}

export function chartScale(data: readonly ChartDatum[]) {
  const min = Math.min(0, ...data.map((datum) => datum.value));
  const max = Math.max(0, ...data.map((datum) => datum.value));
  const range = max - min || 1;
  return { min, max, y: (value: number) => 252 - ((value - min) / range) * 210 };
}

/** otherLabel：超出展示上限的分组合并项名称，由调用方按界面语言提供。 */
export function pieSlices(data: readonly ChartDatum[], otherLabel: string): PieSlice[] {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const points: { datum?: ChartDatum; label: string; value: number }[] = data
    .slice(0, maxChartPoints)
    .map((datum) => ({ datum, label: datum.label, value: datum.value }));
  if (data.length > maxChartPoints) {
    points.push({
      label: otherLabel,
      value: data.slice(maxChartPoints).reduce((sum, datum) => sum + datum.value, 0),
    });
  }
  let angle = -Math.PI / 2;
  return points.map((point) => {
    const startAngle = angle;
    angle += (point.value / total) * Math.PI * 2;
    return { ...point, key: point.datum?.key ?? 'other', startAngle, endAngle: angle };
  });
}

export function pieSlicePath(startAngle: number, endAngle: number) {
  const fraction = (endAngle - startAngle) / (Math.PI * 2);
  if (fraction >= 0.999999) return undefined;
  const startX = 250 + Math.cos(startAngle) * 125;
  const startY = 155 + Math.sin(startAngle) * 125;
  const endX = 250 + Math.cos(endAngle) * 125;
  const endY = 155 + Math.sin(endAngle) * 125;
  return `M 250 155 L ${startX} ${startY} A 125 125 0 ${fraction > 0.5 ? 1 : 0} 1 ${endX} ${endY} Z`;
}
