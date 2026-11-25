import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../foundation/cx';

export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch';
export type LayoutJustify = 'start' | 'center' | 'end' | 'between';
const alignments = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
const justifications = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };

interface SpacingProps extends ComponentProps<'div'> {
  gap?: Spacing;
  align?: LayoutAlign;
  justify?: LayoutJustify;
}
const variables = (gap: Spacing, align: LayoutAlign, justify: LayoutJustify): CSSProperties => ({
  ['--ds-layout-gap' as string]: `var(--ds-space-${gap})`,
  ['--ds-layout-align' as string]: alignments[align],
  ['--ds-layout-justify' as string]: justifications[justify],
});

export type StackProps = SpacingProps;
export function Stack({ gap = 'md', align = 'stretch', justify = 'start', style, className, ...rest }: StackProps) {
  return <div {...rest} className={cx('ds-stack', className)} style={{ ...variables(gap, align, justify), ...style }} />;
}

export interface InlineProps extends SpacingProps { wrap?: boolean }
export function Inline({ gap = 'sm', align = 'center', justify = 'start', wrap = true, style, className, ...rest }: InlineProps) {
  return <div
    {...rest} className={cx('ds-inline', !wrap && 'is-nowrap', className)}
    style={{ ...variables(gap, align, justify), ...style }}
  />;
}

export interface GridProps extends Omit<ComponentProps<'div'>, 'align'> {
  columns?: number;
  gap?: Spacing;
  /** 提供时使用自适应列宽，替代固定 columns。 */
  minItemWidth?: number;
  responsive?: boolean;
}
export function Grid({ columns = 3, gap = 'md', minItemWidth, responsive = true, className, style, ...rest }: GridProps) {
  const count = Number.isFinite(columns) ? Math.max(1, Math.min(12, Math.floor(columns))) : 3;
  const auto = minItemWidth !== undefined && Number.isFinite(minItemWidth) && minItemWidth > 0;
  return <div
    {...rest} className={cx('ds-grid', auto && 'is-auto', !responsive && 'is-fixed', className)}
    style={{
      ['--ds-layout-gap' as string]: `var(--ds-space-${gap})`, ['--ds-grid-columns' as string]: count,
      ['--ds-grid-compact' as string]: Math.min(2, count), ['--ds-grid-min' as string]: `${minItemWidth ?? 160}px`, ...style,
    }}
  />;
}
