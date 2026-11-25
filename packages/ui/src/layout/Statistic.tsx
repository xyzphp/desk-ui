import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { Skeleton } from '../primitives/Display';
import { Panel, type PanelProps } from './Layout';

export interface StatisticLabels { empty: string; loading: string }
export interface StatisticTrend {
  direction: 'up' | 'down' | 'flat';
  label: string;
  tone?: 'success' | 'danger' | 'muted';
}
export interface StatisticContentProps {
  label: ReactNode;
  value: number | string | null | undefined;
  format?: (value: number | string) => ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  description?: ReactNode;
  trend?: StatisticTrend;
  loading?: boolean;
  labels?: Partial<StatisticLabels>;
}
export interface StatisticProps extends Omit<ComponentProps<'dl'>, 'prefix'>, StatisticContentProps {}

/** 展示宿主提供的数值，不推断涨跌的业务含义、不发请求或自动刷新。 */
export function Statistic({
  label, value, format, prefix, suffix, description, trend, loading = false, labels: overrides, className, ...rest
}: StatisticProps) {
  const labels = useLabels('statistic', overrides);
  const empty = value == null || typeof value === 'number' && !Number.isFinite(value);
  const content = empty ? labels.empty : format ? format(value!) : String(value);
  return <dl {...rest} className={cx('ds-statistic', className)} aria-busy={loading || undefined}>
    <dt className="ds-statistic-label">{label}</dt>
    <dd className="ds-statistic-value">
      {loading ? <Skeleton rows={1} label={labels.loading} /> : <>
        {prefix != null && <span className="ds-statistic-affix">{prefix}</span>}
        <strong>{content}</strong>
        {suffix != null && <span className="ds-statistic-affix">{suffix}</span>}
      </>}
    </dd>
    {(description != null || trend) && <dd className="ds-statistic-description">
      {trend && <span className={cx('ds-statistic-trend', `is-${trend.tone ?? 'muted'}`)}>
        <Icon name={trend.direction === 'up' ? 'arrow-up' : trend.direction === 'down' ? 'arrow-down' : 'minus'} />
        {trend.label}
      </span>}
      {description != null && <span>{description}</span>}
    </dd>}
  </dl>;
}

export interface StatCardProps extends Omit<PanelProps, 'title' | 'children' | 'prefix'>, StatisticContentProps {
  icon?: IconName;
  actions?: ReactNode;
}
/** 统计卡片复用 Panel；数值格式、操作与加载状态由宿主提供。 */
export function StatCard({
  label, value, format, prefix, suffix, description, trend, loading, labels, icon, actions, className, ...rest
}: StatCardProps) {
  return <Panel {...rest} className={cx('ds-stat-card', className)}>
    <div className="ds-stat-card-row">
      {icon && <span className="ds-stat-card-icon"><Icon name={icon} /></span>}
      <Statistic {...{ label, value, format, prefix, suffix, description, trend, loading, labels }} />
      {actions && <div className="ds-stat-card-actions">{actions}</div>}
    </div>
  </Panel>;
}
