import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { EmptyState } from './Feedback';
import { Inline, Stack } from '../layout/Spacing';

export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | 'not-found' | 'forbidden';
export interface ResultLabels { titles: Record<ResultStatus, string> }
export interface ResultProps extends Omit<ComponentProps<'section'>, 'title'> {
  status?: ResultStatus;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  labels?: { titles?: Partial<ResultLabels['titles']> };
}
const statusIcons: Record<ResultStatus, IconName> = {
  success: 'circle-check', error: 'triangle-alert', warning: 'triangle-alert', info: 'info', 'not-found': 'folder', forbidden: 'shield-check',
};
const statusTones = { success: 'success', error: 'danger', warning: 'warning', info: 'accent', 'not-found': 'muted', forbidden: 'warning' };

/** 静态结果视图，复用 EmptyState 文本与公共布局；不捕获 React 异常或执行重试。 */
export function Result({ status = 'info', title, description, actions, labels: overrides, children, className, ...rest }: ResultProps) {
  const labels = useLabels('result', overrides);
  const id = useId();
  return <section {...rest} aria-labelledby={rest['aria-labelledby'] ?? (rest['aria-label'] ? undefined : `${id}-title`)}
    className={cx('ds-result', className)}>
    <Stack gap="lg" align="center">
      <span className={cx('ds-result-icon', `ds-display-tone--${statusTones[status]}`)} aria-hidden="true"><Icon name={statusIcons[status]} /></span>
      <h2 className="ds-result-title" id={`${id}-title`}>{title ?? labels.titles[status]}</h2>
      {description != null && <EmptyState compact>{description}</EmptyState>}
      {children}
      {actions != null && <Inline justify="center">{actions}</Inline>}
    </Stack>
  </section>;
}
