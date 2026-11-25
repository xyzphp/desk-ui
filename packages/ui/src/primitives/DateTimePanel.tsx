import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../foundation/Icon';
import { Button } from './Button';
import {
  civilDate as civil,
  civilDateText as dateText,
  localToday,
  padDatePart as pad,
  parseCivilDate as parseDate,
} from '../foundation/civilDate';

export type TemporalKind = 'date' | 'time' | 'datetime-local';
export interface DateTimePickerLabels {
  open: string;
  clear: string;
  confirm: string;
  cancel: string;
  today: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  date: string;
  time: string;
  dateTime: string;
  hour: string;
  minute: string;
  second: string;
  invalid: string;
  datePlaceholder: string;
  timePlaceholder: string;
  dateTimePlaceholder: string;
  rangeStartHint: string;
  rangeEndHint: string;
  weekdays: readonly string[];
  year: (value: number) => string;
  month: (value: number) => string;
  /** 日期网格的可访问名称，各语言给出完整的年月写法。 */
  monthTitle: (year: number, month: number) => string;
  dateLabel: (value: string) => string;
}

type RangeValue = readonly [string, string];

function CalendarPanel({
  value,
  min,
  max,
  range,
  preview,
  labels,
  isDisabled,
  onSelect,
  onHover,
  initialMonthShift = 0,
}: {
  value: string;
  min?: string;
  max?: string;
  range?: readonly [string, string];
  preview?: readonly [string, string];
  labels: DateTimePickerLabels;
  isDisabled: (date: string) => boolean;
  onSelect: (date: string) => void;
  onHover?: (date: string | undefined) => void;
  /** 初始月份偏移：双月面板的后继月传 1。 */
  initialMonthShift?: number;
}) {
  const today = localToday();
  const [first] = useState(() => {
    const supplied = parseDate(value);
    if (supplied && !isDisabled(value)) return supplied;
    const fallback = min && today < min ? min : max && today > max ? max : today;
    const seed = parseDate(fallback) ?? parseDate(today)!;
    const probe = new Date(seed);
    const direction = max && dateText(seed) >= max ? -1 : 1;
    for (let index = 0; index < 366; index++) {
      const text = dateText(probe);
      if (probe.getUTCFullYear() < 1 || probe.getUTCFullYear() > 9999 || (min && text < min) || (max && text > max))
        break;
      if (!isDisabled(text)) return new Date(probe);
      probe.setUTCDate(probe.getUTCDate() + direction);
    }
    return seed;
  });
  const firstEnabledDay = (monthStart: Date) => {
    const date = new Date(monthStart);
    while (date.getUTCMonth() === monthStart.getUTCMonth()) {
      const candidate = dateText(date);
      if (!isDisabled(candidate)) return candidate;
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return dateText(monthStart);
  };
  const [cursor, setCursor] = useState(() => {
    const shifted = civil(first.getUTCFullYear(), first.getUTCMonth() + initialMonthShift, 1);
    return shifted.getUTCFullYear() <= 9999 ? shifted : civil(9999, 11, 1);
  });
  const [focused, setFocused] = useState(() => (initialMonthShift ? firstEnabledDay(cursor) : dateText(first)));
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const root = useRef<HTMLDivElement>(null);
  const keyboardMove = useRef(false);
  const year = cursor.getUTCFullYear(),
    month = cursor.getUTCMonth();
  const offset = (cursor.getUTCDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => civil(year, month, index - offset + 1));
  const yearStart = Math.max(1, Math.floor(year / 12) * 12);
  const yearChoices = Array.from({ length: 12 }, (_, index) => yearStart + index).filter((item) => item <= 9999);
  const focusMonth = (next: Date) => {
    setCursor(next);
    setFocused(firstEnabledDay(next));
  };
  const changeMonth = (amount: number) => {
    const next = civil(year, month + amount, 1);
    if (next.getUTCFullYear() >= 1 && next.getUTCFullYear() <= 9999) focusMonth(next);
  };
  useLayoutEffect(() => {
    if (keyboardMove.current) {
      const target =
        root.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]:not(:disabled)`) ??
        root.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      target?.focus();
      keyboardMove.current = false;
    }
  }, [focused, mode]);
  useLayoutEffect(() => {
    if (mode !== 'day') root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
  }, [mode]);

  const key = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    let next: Date | undefined;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (delta) next = civil(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + delta);
    else if (event.key === 'Home' || event.key === 'End') {
      const weekday = (day.getUTCDay() + 6) % 7;
      next = civil(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate() + (event.key === 'Home' ? -weekday : 6 - weekday),
      );
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const shift = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const last = civil(day.getUTCFullYear(), day.getUTCMonth() + shift + 1, 0).getUTCDate();
      next = civil(day.getUTCFullYear(), day.getUTCMonth() + shift, Math.min(day.getUTCDate(), last));
    }
    if (!next) return;
    event.preventDefault();
    // 跳过受限日期；跨越边界时保留焦点，不把禁用日设为选中。
    for (let attempt = 0; attempt < 366; attempt++) {
      const text = dateText(next);
      if (next.getUTCFullYear() < 1 || next.getUTCFullYear() > 9999 || (min && text < min) || (max && text > max))
        return;
      if (!isDisabled(text)) {
        keyboardMove.current = true;
        setFocused(text);
        setCursor(civil(next.getUTCFullYear(), next.getUTCMonth(), 1));
        return;
      }
      next.setUTCDate(next.getUTCDate() + (['ArrowLeft', 'ArrowUp', 'PageUp', 'Home'].includes(event.key) ? -1 : 1));
    }
  };

  return (
    <div ref={root} className="ds-picker-calendar">
      <div className="ds-picker-calendar-head">
        <button
          type="button"
          className="ds-picker-tool"
          aria-label={labels.previousYear}
          disabled={year <= 1}
          onClick={() => changeMonth(mode === 'year' ? -144 : -12)}
        >
          <Icon name="chevrons-left" />
        </button>
        <button
          type="button"
          className="ds-picker-tool"
          aria-label={labels.previousMonth}
          disabled={year === 1 && month === 0}
          onClick={() => changeMonth(mode === 'year' ? -144 : mode === 'month' ? -12 : -1)}
        >
          <Icon name="chevron-left" />
        </button>
        <div className="ds-picker-calendar-title">
          <button type="button" onClick={() => setMode(mode === 'year' ? 'day' : 'year')}>
            {mode === 'year' ? `${yearStart} – ${yearChoices.at(-1)}` : labels.year(year)}
          </button>
          {mode !== 'year' && (
            <button type="button" onClick={() => setMode(mode === 'month' ? 'day' : 'month')}>
              {labels.month(month + 1)}
            </button>
          )}
        </div>
        <button
          type="button"
          className="ds-picker-tool"
          aria-label={labels.nextMonth}
          disabled={year === 9999 && month === 11}
          onClick={() => changeMonth(mode === 'year' ? 144 : mode === 'month' ? 12 : 1)}
        >
          <Icon name="chevron-right" />
        </button>
        <button
          type="button"
          className="ds-picker-tool"
          aria-label={labels.nextYear}
          disabled={year >= 9999}
          onClick={() => changeMonth(mode === 'year' ? 144 : 12)}
        >
          <Icon name="chevrons-right" />
        </button>
      </div>
      {mode === 'day' ? (
        <div role="grid" aria-label={labels.monthTitle(year, month + 1)} onPointerLeave={() => onHover?.(undefined)}>
          <div role="row" className="ds-picker-week">
            {labels.weekdays.slice(0, 7).map((text, index) => (
              <span role="columnheader" key={index}>
                {text}
              </span>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, week) => (
            <div role="row" className="ds-picker-week" key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const text = dateText(day);
                const outOfBounds = day.getUTCFullYear() < 1 || day.getUTCFullYear() > 9999;
                const included = range?.[0] && range[1] && range[0] <= range[1] && text > range[0] && text < range[1];
                const previewed =
                  preview?.[0] && preview[1] && preview[0] <= preview[1] && text > preview[0] && text < preview[1];
                return (
                  <button
                    type="button"
                    role="gridcell"
                    key={text}
                    data-date={text}
                    data-picker-focus={text === focused}
                    tabIndex={text === focused ? 0 : -1}
                    className="ds-picker-day"
                    aria-label={labels.dateLabel(text)}
                    aria-selected={value === text}
                    aria-current={text === today ? 'date' : undefined}
                    disabled={outOfBounds || isDisabled(text)}
                    data-muted={day.getUTCMonth() !== month}
                    data-in-range={Boolean(included)}
                    data-range-end={Boolean(range?.includes(text))}
                    data-preview={Boolean(previewed)}
                    onKeyDown={(event) => key(event, day)}
                    onPointerEnter={() => {
                      if (!outOfBounds && !isDisabled(text)) onHover?.(text);
                    }}
                    onClick={() => onSelect(text)}
                  >
                    {day.getUTCDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="ds-picker-calendar-choices"
          role="group"
          aria-label={mode === 'year' ? labels.year(year) : labels.month(month + 1)}
        >
          {(mode === 'year' ? yearChoices : Array.from({ length: 12 }, (_, index) => index + 1)).map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={item === (mode === 'year' ? year : month + 1)}
              onClick={() => {
                const next = civil(mode === 'year' ? item : year, mode === 'month' ? item - 1 : month, 1);
                if (mode === 'month') {
                  keyboardMove.current = true;
                  focusMonth(next);
                  setMode('day');
                } else {
                  setCursor(next);
                  setMode('month');
                }
              }}
            >
              {mode === 'year' ? labels.year(item) : labels.month(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TimePanel({
  value,
  seconds,
  labels,
  onChange,
}: {
  value: string;
  seconds: boolean;
  labels: DateTimePickerLabels;
  onChange: (value: string) => void;
}) {
  const parts = value.split(':');
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    root.current?.querySelectorAll<HTMLButtonElement>('[aria-selected="true"]').forEach((button) => {
      const column = button.parentElement!;
      column.scrollTop = Math.max(0, button.offsetTop - column.clientHeight / 2 + button.clientHeight / 2);
    });
  }, []);
  return (
    <div ref={root} className="ds-picker-time" role="group" aria-label={labels.time}>
      {[labels.hour, labels.minute, ...(seconds ? [labels.second] : [])].map((label, column) => (
        <div className="ds-picker-time-column" key={column}>
          <span className="ds-picker-time-heading">{label}</span>
          <div
            className="ds-picker-time-options ds-scrollable"
            role="listbox"
            aria-label={label}
            onKeyDown={(event) => {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
              const current = buttons.indexOf(event.target as HTMLButtonElement);
              const next =
                event.key === 'ArrowDown'
                  ? (current + 1) % buttons.length
                  : event.key === 'ArrowUp'
                    ? (current - 1 + buttons.length) % buttons.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? buttons.length - 1
                        : undefined;
              if (next !== undefined) {
                event.preventDefault();
                buttons[next]?.focus();
                buttons[next]?.click();
              }
            }}
          >
            {Array.from({ length: column === 0 ? 24 : 60 }, (_, index) => (
              <button
                type="button"
                role="option"
                key={index}
                aria-selected={Math.floor(Number(parts[column] || 0)) === index}
                tabIndex={Math.floor(Number(parts[column] || 0)) === index ? 0 : -1}
                data-picker-focus={column === 0 && Math.floor(Number(parts[0] || 0)) === index}
                onClick={() => {
                  const next = [parts[0] || '00', parts[1] || '00', ...(seconds ? [parts[2] || '00'] : [])];
                  next[column] = pad(index);
                  onChange(next.join(':'));
                }}
              >
                {pad(index)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function usesSeconds(time: string, step?: number | string) {
  const seconds = Number(step);
  return time.split(':').length > 2 || step === 'any' || (seconds > 0 && seconds % 60 !== 0);
}

/** 日期和日期时间的范围共用日历与级联选日，时间在同一个面板内编辑。 */
export function DateRangePanel({
  value,
  initialEndpoint,
  withTime,
  twin,
  min,
  max,
  step,
  required,
  clearable,
  labels,
  endpointLabels,
  formatValue,
  validate,
  errorForRange,
  onCommit,
  onClose,
}: {
  value: RangeValue;
  initialEndpoint: 0 | 1;
  withTime: boolean;
  twin: boolean;
  min?: string;
  max?: string;
  step?: number | 'any';
  required?: boolean;
  clearable: boolean;
  labels: DateTimePickerLabels;
  endpointLabels: RangeValue;
  formatValue: (value: string) => string;
  validate: (index: 0 | 1, value: string) => boolean;
  errorForRange: (value: RangeValue) => string | undefined;
  onCommit: (value: RangeValue) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [pendingStart, setPendingStart] = useState<string>();
  const [hovered, setHovered] = useState<string>();
  const cancel = useRef<HTMLButtonElement>(null);
  const days: RangeValue = [draft[0].slice(0, 10), draft[1].slice(0, 10)];
  const minDay = min?.slice(0, 10);
  const maxDay = max?.slice(0, 10);
  const hasDate = Boolean(days[0] || days[1]);
  const rangeError = withTime && hasDate && !pendingStart ? errorForRange(draft) : undefined;
  const canConfirm = hasDate && !pendingStart && !rangeError;
  const today = localToday();

  const isDisabled = (day: string) =>
    withTime
      ? Boolean((minDay && day < minDay) || (maxDay && day > maxDay))
      : !validate(pendingStart && day >= pendingStart ? 1 : 0, day);
  const select = (day: string) => {
    setHovered(undefined);
    if (!pendingStart || day < pendingStart) {
      setPendingStart(day);
      return;
    }
    if (!withTime) {
      onCommit([pendingStart, day]);
      return;
    }
    const startTime = draft[0].slice(11) || (pendingStart === minDay ? min?.slice(11) : '') || '00:00';
    const endTime = draft[1].slice(11) || (day === maxDay ? max?.slice(11) : '') || '23:59';
    setDraft([`${pendingStart}T${startTime}`, `${day}T${endTime}`]);
    setPendingStart(undefined);
  };
  const setEndpoint = (index: 0 | 1, next: string) => {
    setDraft((current) => (index === 0 ? [next, current[1]] : [current[0], next]));
  };
  const range: RangeValue = pendingStart ? [pendingStart, pendingStart] : days;
  const preview: RangeValue | undefined =
    pendingStart && hovered ? (pendingStart <= hovered ? [pendingStart, hovered] : [hovered, pendingStart]) : undefined;
  const calendarValue = pendingStart ?? (days[initialEndpoint] || days[0] || days[1]);
  const calendar = (shift: number) => (
    <CalendarPanel
      value={calendarValue}
      min={minDay}
      max={maxDay}
      range={range}
      preview={preview}
      labels={labels}
      initialMonthShift={shift}
      isDisabled={isDisabled}
      onSelect={select}
      onHover={setHovered}
    />
  );
  return (
    <>
      <div className="ds-picker-panel-body" data-twin={twin || undefined}>
        {calendar(0)}
        {twin && calendar(1)}
      </div>
      {(!withTime || pendingStart || !hasDate) && (
        <div className="ds-picker-panel-value" role="status">
          {pendingStart ? labels.rangeEndHint : labels.rangeStartHint}
        </div>
      )}
      {withTime && hasDate && !pendingStart && (
        <div className="ds-picker-range-times">
          {([0, 1] as const).map((index) => {
            if (!days[index]) return null;
            const time = draft[index].slice(11);
            return (
              <div className="ds-picker-range-time" key={index} role="group" aria-label={endpointLabels[index]}>
                <div className="ds-picker-range-time-head">
                  <span>{endpointLabels[index]}</span>
                  <span>{formatValue(draft[index])}</span>
                  {clearable && !required && (
                    <button
                      type="button"
                      className="ds-picker-tool"
                      aria-label={`${labels.clear} ${endpointLabels[index]}`}
                      onClick={() => {
                        // 清除后该端点的按钮会卸载，先将焦点留在面板内。
                        cancel.current?.focus();
                        setEndpoint(index, '');
                      }}
                    >
                      <Icon name="x" />
                    </button>
                  )}
                </div>
                <TimePanel
                  value={time}
                  seconds={usesSeconds(time, step)}
                  labels={labels}
                  onChange={(next) => setEndpoint(index, `${days[index]}T${next}`)}
                />
              </div>
            );
          })}
        </div>
      )}
      {rangeError && (
        <div className="ds-picker-panel-value" role="status">
          <span className="ds-field-error">{rangeError}</span>
        </div>
      )}
      <div className="ds-picker-footer">
        <Button size="sm" variant="quiet" disabled={isDisabled(today)} onClick={() => select(today)}>
          {labels.today}
        </Button>
        {withTime && (
          <Button ref={cancel} size="sm" variant="quiet" onClick={onClose}>
            {labels.cancel}
          </Button>
        )}
        {clearable && (
          <Button size="sm" variant="quiet" onClick={() => onCommit(['', ''])}>
            {labels.clear}
          </Button>
        )}
        {withTime && (
          <Button size="sm" variant="primary" disabled={!canConfirm} onClick={() => onCommit(draft)}>
            {labels.confirm}
          </Button>
        )}
      </div>
    </>
  );
}

export function DateTimePanel({
  type,
  value,
  min,
  max,
  step,
  clearable,
  labels,
  validate,
  onCommit,
  onClose,
}: {
  type: TemporalKind;
  value: string;
  min?: string;
  max?: string;
  step?: number | string;
  clearable: boolean;
  labels: DateTimePickerLabels;
  validate: (value: string) => boolean;
  onCommit: (value: string) => void;
  onClose: () => void;
}) {
  const base = type === 'time' ? '00:00' : type === 'date' ? localToday() : `${localToday()}T00:00`;
  const [draft, setDraft] = useState(value || min || base);
  const day = type === 'time' ? '' : draft.split('T')[0]!;
  const time = type === 'time' ? draft : draft.split('T')[1] || '00:00';
  const valid = validate(draft);
  const minDay = min?.split('T')[0],
    maxDay = max?.split('T')[0];
  const today = localToday();
  return (
    <>
      <div className="ds-picker-panel-body" data-with-time={type === 'datetime-local'}>
        {type !== 'time' && (
          <CalendarPanel
            value={type === 'date' ? value : day}
            min={minDay}
            max={maxDay}
            labels={labels}
            isDisabled={(date) =>
              type === 'date' ? !validate(date) : Boolean((minDay && date < minDay) || (maxDay && date > maxDay))
            }
            onSelect={(date) => {
              if (type === 'date') onCommit(date);
              else setDraft(`${date}T${time}`);
            }}
          />
        )}
        {type !== 'date' && (
          <TimePanel
            value={time}
            seconds={usesSeconds(time, step)}
            labels={labels}
            onChange={(next) => setDraft(type === 'time' ? next : `${day}T${next}`)}
          />
        )}
      </div>
      {type !== 'date' && (
        <div className="ds-picker-panel-value" role="status">
          {draft.replace('T', ' ')}
          {!valid && <span className="ds-field-error">{labels.invalid}</span>}
        </div>
      )}
      <div className="ds-picker-footer">
        {type === 'date' ? (
          <Button size="sm" variant="quiet" disabled={!validate(today)} onClick={() => onCommit(today)}>
            {labels.today}
          </Button>
        ) : (
          <Button size="sm" variant="quiet" onClick={onClose}>
            {labels.cancel}
          </Button>
        )}
        {clearable && (
          <Button size="sm" variant="quiet" onClick={() => onCommit('')}>
            {labels.clear}
          </Button>
        )}
        {type !== 'date' && (
          <Button
            size="sm"
            variant="primary"
            disabled={!valid}
            onClick={() => {
              if (valid) onCommit(draft);
            }}
          >
            {labels.confirm}
          </Button>
        )}
      </div>
    </>
  );
}
