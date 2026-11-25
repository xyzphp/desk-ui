import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Grid, Inline, type GridProps } from './Spacing';

export interface FormSectionProps extends ComponentProps<'fieldset'> {
  label: ReactNode;
  description?: ReactNode;
  columns?: GridProps['columns'];
  gap?: GridProps['gap'];
}
/** 原生分组只负责内容排列，不创建 form 或处理提交。 */
export function FormSection({ label, description, columns = 2, gap = 'lg', children, className, ...rest }: FormSectionProps) {
  const id = useId();
  const describedBy = [rest['aria-describedby'], description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined;
  return <fieldset {...rest} className={cx('ds-form-section', className)} aria-describedby={describedBy}>
    <legend className="ds-form-section-label">{label}</legend>
    {description && <p id={`${id}-description`} className="ds-form-section-description">{description}</p>}
    <Grid columns={columns} gap={gap}>{children}</Grid>
  </fieldset>;
}
export interface FormActionsProps extends ComponentProps<'fieldset'> {
  label?: string;
  status?: ReactNode;
  busy?: boolean;
}
export function FormActions({ label, status, busy, disabled, children, className, ...rest }: FormActionsProps) {
  const labels = useLabels('form');
  return <fieldset {...rest} aria-label={label ?? labels.actions} disabled={disabled || busy} aria-busy={busy || undefined}
    className={cx('ds-form-actions', className)}>
    <Inline justify="between" gap="md">
      {status != null && <span className="ds-form-actions-status" role="status">{status}</span>}
      <Inline className="ds-form-actions-buttons">{children}</Inline>
    </Inline>
  </fieldset>;
}
