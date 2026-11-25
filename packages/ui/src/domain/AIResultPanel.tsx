import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useControllable } from '../foundation/useControllable';
import { Button } from '../primitives/Button';
import { Skeleton } from '../primitives/Display';
import { Spinner } from '../shell/Pickers';

export type AIResultState = 'idle' | 'generating' | 'ready' | 'error';
export interface AIResultPanelLabels {
  original: string;
  result: string;
  empty: string;
  generating: string;
  apply: string;
  append: string;
  discard: string;
  retry: string;
  stop: string;
}
export interface AIResultPanelProps extends Omit<ComponentProps<'section'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  original: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  labels: AIResultPanelLabels;
  state?: AIResultState;
  compare?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  status?: ReactNode;
  error?: ReactNode;
  onApply?: (value: string) => void;
  onAppend?: (value: string) => void;
  onDiscard?: () => void;
  onRetry?: () => void;
  onStop?: () => void;
}

/** 纯文本生成草稿与原文对比；所有应用动作只回调，绝不自动写入业务表单。 */
export function AIResultPanel({
  label,
  original,
  value,
  defaultValue = '',
  onValueChange,
  labels,
  state = 'idle',
  compare = true,
  disabled = false,
  readOnly = false,
  maxLength,
  status,
  error,
  onApply,
  onAppend,
  onDiscard,
  onRetry,
  onStop,
  className,
  ...rest
}: AIResultPanelProps) {
  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);
  const id = useId();
  const busy = state === 'generating';
  const limit =
    maxLength !== undefined && Number.isFinite(maxLength) && maxLength >= 0 ? Math.floor(maxLength) : undefined;
  const canApply =
    state === 'ready' &&
    !error &&
    !disabled &&
    !readOnly &&
    draft.trim().length > 0 &&
    (limit === undefined || draft.length <= limit);
  const message = error ?? (state === 'idle' ? labels.empty : busy ? labels.generating : undefined);
  const description =
    [rest['aria-describedby'], message ? `${id}-message` : undefined, status ? `${id}-status` : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <section
      {...rest}
      className={cx('ds-ai-result', disabled && 'is-disabled', className)}
      aria-label={label}
      aria-busy={busy}
    >
      <div className={cx('ds-ai-comparison', compare && 'is-comparing')}>
        {compare && (
          <div className="ds-ai-compare-pane">
            <div className="ds-ai-pane-heading">
              <strong id={`${id}-original`}>{labels.original}</strong>
            </div>
            <pre className="ds-ai-original ds-scrollable" role="region" tabIndex={0} aria-labelledby={`${id}-original`}>
              {original}
            </pre>
          </div>
        )}
        <div className="ds-ai-compare-pane">
          <div className="ds-ai-pane-heading">
            <label htmlFor={`${id}-result`}>
              <strong>{labels.result}</strong>
            </label>
            <span className="ds-ai-result-count">
              {draft.length}
              {limit !== undefined && ` / ${limit}`}
            </span>
          </div>
          <div className="ds-ai-result-surface">
            <textarea
              className="ds-control-input ds-ai-editor ds-scrollable"
              id={`${id}-result`}
              rows={9}
              value={draft}
              maxLength={limit}
              disabled={disabled}
              placeholder={state === 'idle' ? labels.empty : undefined}
              readOnly={readOnly || state !== 'ready'}
              aria-describedby={description}
              aria-invalid={Boolean(error) || undefined}
              onChange={(event) => {
                if (!disabled && !readOnly && state === 'ready') setDraft(event.currentTarget.value);
              }}
            />
            {busy && !draft && (
              <div className="ds-ai-skeleton" aria-hidden="true">
                <Skeleton label={labels.generating} animated={false} />
              </div>
            )}
          </div>
        </div>
      </div>
      {message && (
        <div
          id={`${id}-message`}
          className={error ? 'ds-field-error' : 'ds-ai-status'}
          role={error ? 'alert' : 'status'}
        >
          {busy && <Spinner label={labels.generating} />}
          {message}
        </div>
      )}
      {status && (
        <div id={`${id}-status`} className="ds-ai-status" role="status">
          {status}
        </div>
      )}
      <div className="ds-ai-result-actions">
        {onApply && (
          <Button
            variant="primary"
            disabled={!canApply}
            onClick={() => {
              if (canApply) onApply(draft);
            }}
          >
            {labels.apply}
          </Button>
        )}
        {onAppend && (
          <Button
            disabled={!canApply}
            onClick={() => {
              if (canApply) onAppend(draft);
            }}
          >
            {labels.append}
          </Button>
        )}
        {state === 'error' && onRetry && (
          <Button
            disabled={disabled || readOnly}
            onClick={() => {
              if (!disabled && !readOnly) onRetry();
            }}
          >
            {labels.retry}
          </Button>
        )}
        {!busy && onDiscard && (
          <Button
            variant="quiet"
            disabled={disabled || readOnly}
            onClick={() => {
              if (!disabled && !readOnly) onDiscard();
            }}
          >
            {labels.discard}
          </Button>
        )}
        {busy && onStop && (
          <Button
            icon="square"
            disabled={disabled}
            onClick={() => {
              if (!disabled) onStop();
            }}
          >
            {labels.stop}
          </Button>
        )}
      </div>
    </section>
  );
}
