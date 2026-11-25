import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { AnchorPopover } from '../foundation/AnchorPopover';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { Button } from '../primitives/Button';
import { Notice } from '../primitives/Feedback';
import { Spinner } from '../shell/Pickers';
import { WindowTitlebar, type WindowTitlebarProps } from '../shell/Window';

export interface AIToolAction {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}
export interface AIModelOption {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface AIToolSelection {
  action: string;
  model: string;
}
export interface AIToolbarLabels {
  actions: string;
  model: string;
  generate: string;
  generating: string;
  stop: string;
  emptyModels: string;
  unavailableModel: string;
}
export interface AIToolbarInstruction {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
}

export interface AIToolbarProps extends Omit<ComponentProps<'section'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  /** 标题栏文字，默认与 label 相同；仅在提供 onClose 时显示标题栏。 */
  title?: string;
  /** 提供后显示与桌面窗口一致的标题栏（仅关闭控件）。 */
  onClose?: () => void;
  /** 标题栏附加属性，宿主用它接入拖动手柄（指针 / 键盘）。 */
  titlebarProps?: Omit<WindowTitlebarProps, 'title' | 'controls' | 'onClose' | 'as'>;
  actions: readonly AIToolAction[];
  models: readonly AIModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  modelValue?: string;
  defaultModelValue?: string;
  onModelValueChange?: (value: string) => void;
  onGenerate: (selection: AIToolSelection) => void;
  onStop?: () => void;
  labels: AIToolbarLabels;
  busy?: boolean;
  disabled?: boolean;
  generateDisabled?: boolean;
  status?: ReactNode;
  error?: ReactNode;
  /** 输入区上方的补充要求；省略则不显示输入框。 */
  instruction?: AIToolbarInstruction;
  /** 语言、图片参数等宿主配置；忙碌时使用原生 fieldset 禁用。 */
  options?: ReactNode;
  /** 动作栏与输入区之间的内容区，通常放置原文对比和生成结果。 */
  children?: ReactNode;
}

/**
 * AI 快捷工具窗口内容：标题栏、动作网格、内容区与底部输入区（补充要求、参数、模型选择、生成 / 停止）。
 * 不发现模型、不请求、不读取编辑器内容。
 */
export function AIToolbar({
  label,
  title,
  onClose,
  titlebarProps,
  actions,
  models,
  value,
  defaultValue,
  onValueChange,
  modelValue,
  defaultModelValue,
  onModelValueChange,
  onGenerate,
  onStop,
  labels,
  busy = false,
  disabled = false,
  generateDisabled = false,
  status,
  error,
  instruction,
  options,
  children,
  className,
  ...rest
}: AIToolbarProps) {
  const [action, setAction] = useControllable(
    value,
    defaultValue ?? actions.find((item) => item.id && !item.disabled)?.id ?? '',
    onValueChange,
  );
  const [model, setModel] = useControllable(
    modelValue,
    defaultModelValue ?? models.find((item) => item.id && !item.disabled)?.id ?? '',
    onModelValueChange,
  );
  const [picking, setPicking] = useState(false);
  const [prevBusy, setPrevBusy] = useState(busy);
  if (busy !== prevBusy) {
    setPrevBusy(busy);
    if (busy) setPicking(false);
  }
  const picker = useRef<HTMLButtonElement>(null);
  const id = useId();
  const availableAction = Boolean(action) && actions.some((item) => item.id === action && !item.disabled);
  const selectedModel = models.find((item) => item.id === model && !item.disabled);
  const blocked = busy || disabled;
  const canGenerate = !blocked && !generateDisabled && availableAction && Boolean(selectedModel);
  const canPick = !blocked && models.some((item) => !item.disabled);
  const modelText = selectedModel?.label ?? (models.length ? labels.unavailableModel : labels.emptyModels);

  return (
    <section {...rest} className={cx('ds-ai-toolbar', className)} aria-label={label} aria-busy={busy}>
      {onClose && (
        <WindowTitlebar
          as="header"
          className="ds-ai-titlebar"
          title={title ?? label}
          controls={['close']}
          onClose={onClose}
        />
      )}
      <div className="ds-ai-actions" role="group" aria-label={labels.actions}>
        {actions.map((item) => (
          <Button
            key={item.id}
            icon={item.icon}
            pressed={item.id === action}
            disabled={blocked || item.disabled}
            onClick={() => {
              if (!blocked && !item.disabled) setAction(item.id);
            }}
          >
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
      {children && <div className="ds-ai-body ds-scrollable">{children}</div>}
      <footer className="ds-ai-bottom">
        <div className="ds-ai-composer" role="group" aria-label={labels.generate}>
          {instruction && (
            <textarea
              className="ds-ai-instruction ds-scrollable"
              rows={1}
              maxLength={instruction.maxLength}
              value={instruction.value}
              aria-label={instruction.label}
              placeholder={instruction.placeholder}
              disabled={blocked}
              onChange={(event) => instruction.onValueChange(event.currentTarget.value)}
            />
          )}
          <fieldset className="ds-ai-options" disabled={blocked}>
            {options}
          </fieldset>
          <div className="ds-ai-composer-actions">
            <Button
              ref={picker}
              variant="quiet"
              className="ds-ai-model-choice"
              disabled={!canPick}
              aria-label={`${labels.model}：${modelText}`}
              aria-haspopup="dialog"
              aria-expanded={picking}
              aria-controls={picking ? `${id}-models` : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setPicking((open) => !open)}
            >
              <span className="ds-ai-model-name">{modelText}</span>
              <Icon name="chevron-down" />
            </Button>
            {busy ? (
              <Button
                variant="primary"
                className="ds-ai-send"
                icon="square"
                aria-label={onStop ? labels.stop : labels.generating}
                title={onStop ? labels.stop : labels.generating}
                disabled={disabled || !onStop}
                onClick={() => {
                  if (!disabled) onStop?.();
                }}
              />
            ) : (
              <Button
                variant="primary"
                className="ds-ai-send"
                icon="arrow-up"
                aria-label={labels.generate}
                title={labels.generate}
                disabled={!canGenerate}
                onClick={() => {
                  if (canGenerate) onGenerate({ action, model });
                }}
              />
            )}
          </div>
        </div>
        {status && (
          <div className="ds-ai-status" role="status">
            {busy && <Spinner label={labels.generating} />}
            {status}
          </div>
        )}
        {error && <Notice tone="error">{error}</Notice>}
      </footer>
      <AnchorPopover
        open={picking && canPick}
        anchor={picker}
        placement="top-end"
        id={`${id}-models`}
        role="dialog"
        aria-label={labels.model}
        className="ds-ai-picker"
        onClose={() => setPicking(false)}
      >
        <fieldset className="ds-ai-picker-section">
          <legend>{labels.model}</legend>
          {models.map((item) => (
            <Button
              key={item.id}
              variant="quiet"
              className="ds-ai-picker-option"
              pressed={item.id === model}
              disabled={item.disabled}
              title={item.label}
              onClick={() => {
                if (!blocked && !item.disabled) {
                  setModel(item.id);
                  setPicking(false);
                }
              }}
            >
              <span>{item.label}</span>
              <span className="ds-ai-picker-check" aria-hidden="true">
                <Icon name="check" />
              </span>
            </Button>
          ))}
        </fieldset>
      </AnchorPopover>
    </section>
  );
}
