import type { ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import type { CopyButtonLabels } from '../foundation/locale';
import { Button, type ButtonProps } from './Button';
import { Input, type InputProps } from './Field';
import { useCopyFeedback, type CopyHandler } from './useCopyFeedback';

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'onClick' | 'onCopy'> {
  text: string;
  onCopy: CopyHandler;
  onCopied?: () => void;
  onCopyError?: (error: unknown) => void;
  labels?: Partial<CopyButtonLabels>;
}

/** 注入复制能力；无剪贴板权限请求、后台读取或自动复制。 */
export function CopyButton({
  text, onCopy, onCopied, onCopyError, labels: overrides, disabled, className, ...rest
}: CopyButtonProps) {
  const labels = useLabels('copyButton', overrides);
  const { state, copy } = useCopyFeedback(text, onCopy, onCopied, onCopyError);
  const message = state === 'copied' ? labels.copied : state === 'error' ? labels.failed : '';
  return <span className={cx('ds-copy-action', className)}>
    <Button
      {...rest} disabled={disabled || state === 'pending'} aria-busy={state === 'pending' || undefined}
      icon={state === 'copied' ? 'check' : 'copy'} onClick={() => { void copy(); }}
    >{state === 'pending' ? labels.copying : state === 'copied' ? labels.copied : labels.copy}</Button>
    <span className="ds-copy-feedback" role={state === 'error' ? 'alert' : 'status'} aria-live="polite">{message}</span>
  </span>;
}

export interface CopyFieldProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'readOnly' | 'onChange' | 'onCopy'> {
  value: string;
  onCopy: CopyHandler;
  onCopied?: () => void;
  onCopyError?: (error: unknown) => void;
  labels?: Partial<CopyButtonLabels>;
}

/** 可选择的只读文字与复制动作；标签可通过 Field 关联。 */
export function CopyField({ value, onCopy, onCopied, onCopyError, labels, className, style, ...rest }: CopyFieldProps) {
  return <div className={cx('ds-copy-field', className)} style={style}>
    <Input {...rest} value={value} readOnly />
    <CopyButton text={value} onCopy={onCopy} onCopied={onCopied} onCopyError={onCopyError} labels={labels} disabled={rest.disabled} />
  </div>;
}

export interface CodeBlockLabels { code: string }
export interface CodeBlockProps extends Omit<ComponentProps<'figure'>, 'children' | 'onCopy'> {
  code: string;
  label?: string;
  language?: string;
  wrap?: boolean;
  onCopy?: CopyHandler;
  labels?: Partial<CodeBlockLabels>;
}

/** 仅渲染转义文字，语言标签不触发执行、网络请求或语法高亮依赖。 */
export function CodeBlock({ code, label, language, wrap = false, onCopy, labels: overrides, className, ...rest }: CodeBlockProps) {
  const labels = useLabels('codeBlock', overrides);
  const name = label ?? labels.code;
  return <figure {...rest} className={cx('ds-code-block', wrap && 'is-wrapped', className)}>
    <figcaption className="ds-code-head">
      <span>{name}</span>
      {language && <span className="ds-code-language">{language}</span>}
      {onCopy && <CopyButton text={code} onCopy={onCopy} size="sm" variant="quiet" />}
    </figcaption>
    <pre tabIndex={0} aria-label={name} className="ds-code-content ds-scrollable"><code>{code}</code></pre>
  </figure>;
}
