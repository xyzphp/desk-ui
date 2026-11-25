import { useId, useImperativeHandle, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Button } from '../primitives/Button';
import type { DisplayTone } from '../primitives/Display';
import { shiftMonth } from './monthCalendarModel';
import { useMonthCalendar } from './useMonthCalendar';

export interface MonthCalendarEvent { id: string; date: string; title: string; tone?: DisplayTone }
export interface MonthCalendarLabels {
  previous: string; next: string; today: string; weekdays: readonly string[];
  title: (year: number, month: number) => string;
  date: (value: string) => string;
  more: (count: number) => string;
}
export interface MonthCalendarProps extends Omit<ComponentProps<'section'>, 'children' | 'onSelect' | 'defaultValue'> {
  label: string;
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (date: string) => void;
  today?: string;
  events?: readonly MonthCalendarEvent[];
  onEventClick?: (event: MonthCalendarEvent) => void;
  maxEvents?: number;
  weekStartsOn?: 0 | 1;
  disabled?: boolean;
  isDateDisabled?: (date: string) => boolean;
  labels?: Partial<MonthCalendarLabels>;
}
function CalendarEvents({ events, disabled, onEventClick }: {
  events: readonly MonthCalendarEvent[]; disabled?: boolean; onEventClick?: (event: MonthCalendarEvent) => void;
}) {
  return <ul className="ds-month-events">{events.map((event) => <li key={event.id}>
    {onEventClick ? <button type="button" className={cx('ds-month-event', `ds-display-tone--${event.tone ?? 'accent'}`)}
      disabled={disabled} title={event.title} onClick={() => onEventClick(event)}>{event.title}</button>
      : <span className={cx('ds-month-event', `ds-display-tone--${event.tone ?? 'accent'}`)} title={event.title}>{event.title}</span>}
  </li>)}</ul>;
}
/** 整月事件视图；日期与月份分别受控，业务事件和操作均由宿主提供。 */
export function MonthCalendar(props: MonthCalendarProps) {
  const { label, month, defaultMonth, onMonthChange, value, defaultValue, onValueChange, today, events, onEventClick,
    maxEvents = 2, weekStartsOn, disabled, isDateDisabled, labels: overrides, ref, className, ...rest } = props;
  const { root, ...state } = useMonthCalendar(props);
  const labels = useLabels('monthCalendar', overrides);
  const id = useId();
  useImperativeHandle(ref, () => root.current!, [root]);
  const limit = Number.isFinite(maxEvents) ? Math.max(0, Math.floor(maxEvents)) : 2;
  const title = labels.title(Number(state.month.slice(0, 4)), Number(state.month.slice(5, 7)));
  const weekdays = Array.from({ length: 7 }, (_, index) => labels.weekdays[(index + state.weekStartsOn) % 7]);
  return <section {...rest} ref={root} className={cx('ds-month-calendar', className)} aria-label={label}>
    <div className="ds-month-calendar-head">
      <h3 id={`${id}-title`} aria-live="polite">{title}</h3>
      <div className="ds-month-calendar-actions">
        <Button size="sm" variant="quiet" icon="chevron-left" aria-label={labels.previous}
          disabled={disabled || !shiftMonth(state.month, -1)} onClick={() => state.move(-1)} />
        <Button size="sm" variant="quiet" disabled={disabled} onClick={() => state.changeMonth(state.today.slice(0, 7))}>{labels.today}</Button>
        <Button size="sm" variant="quiet" icon="chevron-right" aria-label={labels.next}
          disabled={disabled || !shiftMonth(state.month, 1)} onClick={() => state.move(1)} />
      </div>
    </div>
    <div className="ds-month-calendar-scroll ds-scrollable">
      <table className="ds-month-calendar-table" aria-labelledby={`${id}-title`}>
        <thead><tr>{weekdays.map((day, index) => <th scope="col" key={index}>{day}</th>)}</tr></thead>
        <tbody>{Array.from({ length: 6 }, (_, week) => <tr key={week}>
          {state.days.slice(week * 7, week * 7 + 7).map(({ date, disabled: blocked }, dayIndex) => {
            if (!date) return <td key={dayIndex} />;
            const entries = state.eventsByDate.get(date) ?? [];
            const hidden = entries.slice(limit);
            return <td key={date} data-outside={!date.startsWith(state.month) || undefined}>
              <button type="button" className="ds-month-date" data-calendar-date={date} aria-label={labels.date(date)}
                aria-pressed={date === state.value} aria-current={date === state.today ? 'date' : undefined} disabled={blocked}
                tabIndex={date === state.tabDate ? 0 : -1} onFocus={() => state.setFocused(date)}
                onClick={() => state.select(date)} onKeyDown={(event) => state.keyDown(event, date)}>{Number(date.slice(8))}</button>
              <CalendarEvents events={entries.slice(0, limit)} disabled={disabled} onEventClick={onEventClick} />
              {!!hidden.length && <details className="ds-month-event-more"><summary>{labels.more(hidden.length)}</summary>
                <CalendarEvents events={hidden} disabled={disabled} onEventClick={onEventClick} />
              </details>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
