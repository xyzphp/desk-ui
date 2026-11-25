import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { PickerPopover } from '../foundation/PickerPopover';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { useFieldProps, type InputProps } from './Field';
import { DateRangePanel, DateTimePanel, type DateTimePickerLabels, type TemporalKind } from './DateTimePanel';
import { useLabels, useLocale } from '../foundation/ConfigProvider';
import { formatCivilDate, type DateDisplayFormat } from '../foundation/dateFormat';
import { commitInput } from '../foundation/commitInput';
import { numberText, numberValue } from '../foundation/number';

export type { DateTimePickerLabels } from './DateTimePanel';

export interface DateTimeInputProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'min' | 'max'> {
  value?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  onValueChange?: (value: string) => void;
  clearable?: boolean;
  pickerLabels?: Partial<DateTimePickerLabels>;
}

export type DatePickerProps = DateTimeInputProps;
export type TimePickerProps = DateTimeInputProps;
export type DateTimePickerProps = DateTimeInputProps;

function validTemporalValue(input: HTMLInputElement | null, value: string) {
  if (!input) return false;
  const probe = input.cloneNode(false) as HTMLInputElement;
  probe.value = value;
  return (value === '' || Boolean(probe.value)) && probe.validity.valid;
}

function TemporalInput({
  type,
  value,
  defaultValue,
  min,
  max,
  step,
  onValueChange,
  onChange,
  onKeyDown,
  clearable = true,
  pickerLabels,
  className,
  ref,
  disabled,
  readOnly,
  placeholder,
  suppressNativePicker,
  pickerOpen,
  onPickerOpenChange,
  renderPanel,
  ...rest
}: DateTimeInputProps & {
  type: TemporalKind;
  /** 输入位于复合范围字段中时，阻止浏览器原生日历与范围弹层同时打开。 */
  suppressNativePicker?: boolean;
  /** 由范围选择器托管的受控面板状态；不传时保持组件内部自治。 */
  pickerOpen?: boolean;
  onPickerOpenChange?: (open: boolean) => void;
  renderPanel?: (onClose: () => void) => ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const sessionOpen = pickerOpen ?? open;
  const setSessionOpen = useCallback(
    (next: boolean) => {
      if (pickerOpen === undefined) setOpen(next);
      onPickerOpenChange?.(next);
    },
    [pickerOpen, onPickerOpenChange],
  );
  const draft = value ?? current;
  const blocked = Boolean(disabled || readOnly);
  const labels = useLabels('dateTimePicker', pickerLabels);
  const field = useFieldProps(rest);
  const id = useId();
  useImperativeHandle(ref, () => input.current!, []);
  useEffect(() => {
    if (blocked) setSessionOpen(false);
  }, [blocked, setSessionOpen]);
  useEffect(() => {
    if (value === undefined && input.current) setCurrent(input.current.value);
  }, [value, defaultValue]);
  useFormReset(
    input,
    () => {
      const node = input.current;
      if (!node) return;
      if (value !== undefined) node.value = value;
      setCurrent(node.value);
      setSessionOpen(false);
    },
    rest.form,
  );

  const validate = (next: string) => Boolean(next) && validTemporalValue(input.current, next);
  const commit = (next: string) => {
    const node = input.current;
    if (!node || blocked || (next && !validate(next))) return;
    if (next !== node.value) {
      // 经过真实 input/change 事件，保留 React onChange、原生表单和受控回退合同。
      commitInput(node, next);
    }
    setSessionOpen(false);
  };
  return (
    <div
      ref={anchor}
      className={cx(
        'ds-picker-surface ds-temporal-control',
        sessionOpen && !blocked && 'is-open',
        disabled && 'is-disabled',
        readOnly && 'is-readonly',
      )}
    >
      <div className={cx('ds-temporal-entry', !draft && 'is-empty')}>
        <input
          {...rest}
          {...field}
          ref={input}
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          className={cx('ds-control-input ds-temporal-input', className)}
          aria-haspopup="dialog"
          aria-expanded={sessionOpen && !blocked}
          aria-controls={sessionOpen ? `${id}-panel` : undefined}
          onFocus={(event) => {
            rest.onFocus?.(event);
            if (sessionOpen) setSessionOpen(false);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              !event.defaultPrevented &&
              !blocked &&
              (event.key === 'F4' || (event.altKey && event.key === 'ArrowDown'))
            ) {
              event.preventDefault();
              setSessionOpen(true);
            }
          }}
          onChange={(event) => {
            if (blocked) return;
            setCurrent(event.currentTarget.value);
            onValueChange?.(event.currentTarget.value);
            onChange?.(event);
          }}
          onClick={(event) => {
            rest.onClick?.(event);
            if (suppressNativePicker) event.preventDefault();
          }}
        />
        {!draft && (
          <span className="ds-temporal-placeholder" aria-hidden="true">
            {placeholder ??
              (type === 'date'
                ? labels.datePlaceholder
                : type === 'time'
                  ? labels.timePlaceholder
                  : labels.dateTimePlaceholder)}
          </span>
        )}
      </div>
      {draft && clearable && !blocked && (
        <button
          type="button"
          className="ds-picker-tool ds-picker-clear"
          aria-label={labels.clear}
          onClick={() => commit('')}
        >
          <Icon name="x" />
        </button>
      )}
      <button
        type="button"
        className="ds-picker-tool"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={sessionOpen && !blocked}
        aria-controls={`${id}-panel`}
        disabled={blocked}
        onClick={() => setSessionOpen(!sessionOpen)}
      >
        <Icon name={type === 'time' ? 'clock-3' : 'calendar-days'} />
      </button>
      <PickerPopover
        open={sessionOpen && !blocked}
        anchor={anchor}
        label={type === 'time' ? labels.time : type === 'date' ? labels.date : labels.dateTime}
        onClose={() => setSessionOpen(false)}
      >
        <div id={`${id}-panel`}>
          {renderPanel ? (
            renderPanel(() => setSessionOpen(false))
          ) : (
            <DateTimePanel
              type={type}
              value={draft}
              min={min}
              max={max}
              step={step}
              clearable={clearable}
              labels={labels}
              validate={validate}
              onCommit={commit}
              onClose={() => setSessionOpen(false)}
            />
          )}
        </div>
      </PickerPopover>
    </div>
  );
}

/** 主题日历配合原生日期输入；值为 YYYY-MM-DD，不做时区转换。 */
export function DatePicker(props: DatePickerProps) {
  return <TemporalInput {...props} type="date" />;
}
/** 主题时间列配合原生时间输入；值为 HH:mm[:ss[.sss]]，step 的单位是秒。 */
export function TimePicker(props: TimePickerProps) {
  return <TemporalInput {...props} type="time" />;
}
/** 本地墙上时间，不携带时区。转换为时间戳的策略由宿主决定。 */
export function DateTimePicker(props: DateTimePickerProps) {
  return <TemporalInput {...props} type="datetime-local" />;
}

export type DateTimeRangeValue = readonly [string, string];
export type NumberRangeValue = readonly [number | null, number | null];

export interface RangePickerLabels {
  start: string;
  end: string;
  separator: string;
  invalidOrder: string;
}

interface RangePickerBase extends Omit<ComponentProps<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  label: string;
  labels?: Partial<RangePickerLabels>;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  startName?: string;
  endName?: string;
  form?: string;
  hint?: ReactNode;
  error?: ReactNode;
}

interface TemporalRangeProps extends RangePickerBase {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onValueChange?: (value: DateTimeRangeValue) => void;
  min?: string;
  max?: string;
  step?: number | 'any';
  clearable?: boolean;
  pickerLabels?: Partial<DateTimePickerLabels>;
}

export interface DateRangePickerProps extends TemporalRangeProps {
  type?: 'date' | 'datetime-local';
  /** Render plain native inputs through a caller-owned source structure, while retaining shared range state and validation. */
  renderNative?: (fields: { start: ReactNode; end: ReactNode; groupProps: ComponentProps<'div'> }) => ReactNode;
}
export type TimeRangePickerProps = TemporalRangeProps;
export interface NumberRangePickerProps extends RangePickerBase {
  value?: NumberRangeValue;
  defaultValue?: NumberRangeValue;
  onValueChange?: (value: NumberRangeValue) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
}

type RangeType = 'date' | 'time' | 'datetime-local' | 'number';

// 按民用日期 / 墙上时间比较，不使用设备时区或夏令时来改变输入值。
function scalar(type: RangeType, value: string): number {
  if (!value) return NaN;
  if (type === 'number') return numberValue(value) ?? NaN;
  if (type === 'time') {
    const match = /^(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,3})?)?$/.exec(value);
    if (!match) return NaN;
    const [, hours, minutes, seconds = '0', fraction = '0'] = match;
    return Number(hours) < 24 && Number(minutes) < 60 && Number(seconds) < 60
      ? (Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(fraction)) * 1000
      : NaN;
  }
  const [day, time] = value.split('T');
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number(day.slice(0, 4)) < 1) return NaN;
  const date = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== day) return NaN;
  return type === 'date' ? date : date + scalar('time', time ?? '');
}

function InputRange({
  type,
  label,
  labels: overrides,
  value,
  defaultValue = ['', ''],
  onValueChange,
  min,
  max,
  step,
  clearable,
  pickerLabels,
  disabled,
  readOnly,
  required,
  startName,
  endName,
  form,
  hint,
  error,
  className,
  renderNative,
  inline,
  dateFormat,
  showYear,
  labelPlacement,
  ...rest
}: RangePickerBase & {
  type: RangeType;
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onValueChange?: (value: DateTimeRangeValue) => void;
  min?: string | number;
  max?: string | number;
  step?: number | 'any';
  clearable?: boolean;
  pickerLabels?: Partial<DateTimePickerLabels>;
  renderNative?: DateRangePickerProps['renderNative'];
  /** 内联表单布局：端点标签可见，占位改用语言字典的日期占位文案。 */
  inline?: boolean;
  dateFormat?: DateDisplayFormat;
  showYear?: boolean;
  labelPlacement?: 'inside' | 'outside';
}) {
  const labels = useLabels('rangePicker', overrides);
  const pickerText = useLabels('dateTimePicker', pickerLabels);
  const locale = useLocale();
  const withTime = type === 'datetime-local';
  const hasCalendar = type === 'date' || withTime;
  const blocked = Boolean(disabled || readOnly);
  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);
  const start = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const applyingRange = useRef(false);
  const [openEndpoint, setOpenEndpoint] = useState<0 | 1 | undefined>(undefined);
  const open = openEndpoint !== undefined && !blocked;
  const closeRange = () => setOpenEndpoint(undefined);
  const id = useId();
  const wrongOrder = scalar(type, draft[0]) > scalar(type, draft[1]);
  const note = error ?? (wrongOrder ? labels.invalidOrder : hint);
  const invalid = Boolean(error) || wrongOrder;
  const noteId = note ? `${id}-note` : undefined;
  const describedBy = [rest['aria-describedby'], noteId].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    end.current?.setCustomValidity(wrongOrder ? labels.invalidOrder : '');
  }, [wrongOrder, labels.invalidOrder]);
  useEffect(() => {
    if (blocked) setOpenEndpoint(undefined);
  }, [blocked]);

  useFormReset(
    start,
    () => {
      closeRange();
      if (value !== undefined) {
        if (start.current) start.current.value = draft[0];
        if (end.current) end.current.value = draft[1];
      } else if (draft[0] !== defaultValue[0] || draft[1] !== defaultValue[1]) {
        setDraft([...defaultValue]);
      }
    },
    form,
  );

  const change = (index: 0 | 1, next: string) => {
    if (blocked || applyingRange.current || next === draft[index]) return;
    setDraft(index === 0 ? [next, draft[1]] : [draft[0], next]);
  };
  const commitRange = (next: DateTimeRangeValue) => {
    if (blocked) return;
    if (next[0] !== draft[0] || next[1] !== draft[1]) {
      // 保留各端点的原生事件，宿主一次接收完整范围。
      applyingRange.current = true;
      try {
        if (start.current) commitInput(start.current, next[0]);
        if (end.current) commitInput(end.current, next[1]);
      } finally {
        applyingRange.current = false;
      }
      setDraft(next);
    }
    closeRange();
  };
  const validate = (index: 0 | 1, next: string) => validTemporalValue((index === 0 ? start : end).current, next);
  const errorForRange = (next: DateTimeRangeValue) => {
    if (scalar(type, next[0]) > scalar(type, next[1])) return labels.invalidOrder;
    if (!validate(0, next[0]) || !validate(1, next[1])) return pickerText.invalid;
    return undefined;
  };
  const formatValue = (value: string) => {
    const [day = '', time] = value.split('T');
    const dateText = dateFormat ? formatCivilDate(day, dateFormat, locale, showYear) : day;
    return time ? `${dateText} ${time}` : dateText;
  };
  const rangePanel = (index: 0 | 1, twin: boolean, onClose: () => void) => (
    <DateRangePanel
      value={draft}
      initialEndpoint={index}
      withTime={withTime}
      twin={twin}
      min={min as string | undefined}
      max={max as string | undefined}
      step={step}
      required={required}
      clearable={clearable ?? true}
      labels={pickerText}
      endpointLabels={[labels.start, labels.end]}
      formatValue={formatValue}
      validate={validate}
      errorForRange={errorForRange}
      onCommit={commitRange}
      onClose={onClose}
    />
  );

  const input = (index: 0 | 1) => {
    const inputRef = index === 0 ? start : end;
    const inputId = `${id}-${index === 0 ? 'start' : 'end'}`;
    const inputName = index === 0 ? startName : endName;
    const inputValue = draft[index];
    const inputInvalid = Boolean(error) || (index === 1 && wrongOrder);
    const onInputChange = (event: { currentTarget: HTMLInputElement }) => change(index, event.currentTarget.value);
    if (inline && (withTime || (type === 'date' && dateFormat))) {
      const endpoint = index === 0 ? labels.start : labels.end;
      const displayValue = inputValue
        ? formatValue(inputValue)
        : withTime
          ? pickerText.dateTimePlaceholder
          : pickerText.datePlaceholder;
      return (
        <>
          <button
            type="button"
            id={inputId}
            className="ds-date-range-field-value"
            aria-label={`${endpoint}: ${displayValue}`}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? `${id}-range-panel` : undefined}
            aria-invalid={inputInvalid || undefined}
            aria-describedby={describedBy}
            disabled={blocked}
          >
            {displayValue}
          </button>
          <input
            ref={inputRef}
            className="ds-visually-hidden"
            type={withTime ? 'datetime-local' : 'date'}
            value={inputValue}
            name={inputName}
            form={form}
            min={min as string | undefined}
            max={max as string | undefined}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            tabIndex={-1}
            aria-hidden="true"
            aria-invalid={inputInvalid || undefined}
            aria-describedby={describedBy}
            onChange={onInputChange}
            onInvalid={(event) => {
              event.preventDefault();
              if (!blocked) setOpenEndpoint(index);
            }}
          />
        </>
      );
    }
    if (renderNative && type !== 'number' && type !== 'time') {
      return (
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={inputValue}
          name={inputName}
          form={form}
          min={min as string | undefined}
          max={max as string | undefined}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-label={index === 0 ? labels.start : labels.end}
          aria-invalid={inputInvalid || undefined}
          aria-describedby={describedBy}
          onChange={onInputChange}
        />
      );
    }
    return type === 'number' ? (
      <input
        className="ds-control-input"
        ref={inputRef}
        id={inputId}
        type="number"
        value={inputValue}
        name={inputName}
        form={form}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        placeholder={index === 0 ? labels.start : labels.end}
        aria-invalid={inputInvalid || undefined}
        aria-describedby={describedBy}
        onChange={onInputChange}
      />
    ) : (
      <TemporalInput
        ref={inputRef}
        id={inputId}
        type={type}
        value={inputValue}
        name={inputName}
        form={form}
        min={min as string | undefined}
        max={max as string | undefined}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        clearable={clearable}
        pickerLabels={pickerLabels}
        suppressNativePicker={type === 'date' && inline}
        // 内联范围在整行锚点下只打开一个面板。
        pickerOpen={hasCalendar ? !inline && open && openEndpoint === index : undefined}
        onPickerOpenChange={
          hasCalendar
            ? (next) => {
                if (next) setOpenEndpoint(index);
                else setOpenEndpoint((current) => (current === index ? undefined : current));
              }
            : undefined
        }
        renderPanel={hasCalendar && !inline ? (onClose) => rangePanel(index, withTime, onClose) : undefined}
        placeholder={inline ? undefined : index === 0 ? labels.start : labels.end}
        aria-invalid={inputInvalid || undefined}
        aria-describedby={describedBy}
        onValueChange={(next) => change(index, next)}
      />
    );
  };

  if (renderNative) {
    const groupProps: ComponentProps<'div'> = {
      ...rest,
      className,
      role: 'group',
      'aria-label': label,
      'aria-describedby': describedBy,
    };
    return (
      <>
        {renderNative({ start: input(0), end: input(1), groupProps })}
        {note && (
          <p id={noteId} className={invalid ? 'ds-field-error' : 'ds-field-hint'} role={invalid ? 'alert' : undefined}>
            {note}
          </p>
        )}
      </>
    );
  }

  if (inline) {
    return (
      <div
        {...rest}
        className={cx('ds-date-range-field', className)}
        role="group"
        aria-label={label}
        aria-describedby={describedBy}
      >
        <div className={cx('ds-date-range-field-stack', labelPlacement === 'outside' && 'has-outside-labels')}>
          {labelPlacement === 'outside' && (
            <div className="ds-date-range-field-endpoint-labels">
              <label htmlFor={`${id}-start`}>{labels.start}</label>
              <span />
              <label htmlFor={`${id}-end`}>{labels.end}</label>
              <span />
            </div>
          )}
          <div
            ref={rowRef}
            className={cx(
              'ds-date-range-field-row',
              invalid && 'is-invalid',
              disabled && 'is-disabled',
              readOnly && 'is-readonly',
            )}
            onClick={(event) => {
              if (blocked || open) return;
              const row = event.currentTarget;
              if (!row.contains(row.ownerDocument.activeElement)) trigger.current?.focus();
              setOpenEndpoint(0);
            }}
          >
            <div className="ds-date-range-field-endpoint">
              {labelPlacement !== 'outside' && (
                <label className="ds-date-range-field-label" htmlFor={`${id}-start`}>
                  {labels.start}
                </label>
              )}
              {input(0)}
            </div>
            <span className="ds-date-range-separator" aria-hidden="true">
              <Icon name="arrow-right" />
            </span>
            <div className="ds-date-range-field-endpoint">
              {labelPlacement !== 'outside' && (
                <label className="ds-date-range-field-label" htmlFor={`${id}-end`}>
                  {labels.end}
                </label>
              )}
              {input(1)}
            </div>
            <button
              ref={trigger}
              type="button"
              className="ds-picker-tool ds-date-range-trigger"
              aria-label={pickerText.open}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? `${id}-range-panel` : undefined}
              disabled={blocked}
              onClick={(event) => {
                event.stopPropagation();
                if (open) closeRange();
                else setOpenEndpoint(0);
              }}
            >
              <Icon name="calendar-days" />
            </button>
          </div>
        </div>
        <PickerPopover
          open={open}
          anchor={rowRef}
          label={withTime ? pickerText.dateTime : pickerText.date}
          gap={0}
          onClose={closeRange}
        >
          <div id={`${id}-range-panel`}>{rangePanel(0, true, closeRange)}</div>
        </PickerPopover>
        {note && (
          <p id={noteId} className={invalid ? 'ds-field-error' : 'ds-field-hint'} role={invalid ? 'alert' : undefined}>
            {note}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={cx('ds-range-picker', className)}
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
    >
      <span className="ds-field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <div
        className={cx(
          'ds-range-picker-fields',
          disabled && 'is-disabled',
          readOnly && 'is-readonly',
          invalid && 'is-invalid',
        )}
      >
        <div className="ds-range-picker-endpoint">
          <label className="ds-visually-hidden" htmlFor={`${id}-start`}>
            {labels.start}
          </label>
          {input(0)}
        </div>
        <span className="ds-range-picker-separator" aria-hidden="true">
          {labels.separator}
        </span>
        <div className="ds-range-picker-endpoint">
          <label className="ds-visually-hidden" htmlFor={`${id}-end`}>
            {labels.end}
          </label>
          {input(1)}
        </div>
      </div>
      {note && (
        <p id={noteId} className={invalid ? 'ds-field-error' : 'ds-field-hint'} role={invalid ? 'alert' : undefined}>
          {note}
        </p>
      )}
    </div>
  );
}

/** 日期或日期时间的起止区间；允许单侧为空，required 时两侧必填。 */
export function DateRangePicker({ type = 'date', ...rest }: DateRangePickerProps) {
  return <InputRange {...rest} type={type} />;
}
export interface DateRangeFieldProps extends TemporalRangeProps {
  type?: 'date' | 'datetime-local';
  /** Only the displayed date uses the clock format. Form values keep their native date or date-time format. */
  dateFormat?: DateDisplayFormat;
  /** Adds or removes the year while preserving the selected format family. */
  showYear?: boolean;
  /** Places endpoint labels above the shared input surface instead of inside it. */
  labelPlacement?: 'inside' | 'outside';
}

/** 表单内联的日期范围字段；标签位置和日期格式可配置，文案跟随 ConfigProvider 语言。 */
export function DateRangeField({
  type = 'date',
  dateFormat,
  showYear,
  labelPlacement = 'inside',
  ...rest
}: DateRangeFieldProps) {
  return (
    <InputRange
      {...rest}
      type={type}
      inline
      dateFormat={dateFormat}
      showYear={showYear}
      labelPlacement={labelPlacement}
    />
  );
}
/** 同一天内的起止时间；跨午夜范围应使用包含日期的 DateRangePicker。 */
export function TimeRangePicker(props: TimeRangePickerProps) {
  return <InputRange {...props} type="time" />;
}

/** 数值上下限；空端点使用 null，与合法数值 0 区分。 */
export function NumberRangePicker({
  value,
  defaultValue = [null, null],
  onValueChange,
  ...rest
}: NumberRangePickerProps) {
  return (
    <InputRange
      {...rest}
      type="number"
      value={value && [numberText(value[0]), numberText(value[1])]}
      defaultValue={[numberText(defaultValue[0]), numberText(defaultValue[1])]}
      onValueChange={(next) => onValueChange?.([numberValue(next[0]), numberValue(next[1])])}
    />
  );
}
