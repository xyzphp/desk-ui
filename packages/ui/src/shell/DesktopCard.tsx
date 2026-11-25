import { useLabels } from '../foundation/ConfigProvider';
import type { LabelOverrides } from '../foundation/locale';
import { useId, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { useControllable } from '../foundation/useControllable';
import { useFormReset } from '../foundation/useFormReset';
import { usePointerGesture, type PointerPoint } from '../foundation/usePointerGesture';
import { clockZoneInfo } from './clockFormat';
import type { DesktopCardStyle } from './Desktop';

export type DesktopCardDrag = { phase: 'move' | 'drop'; start: PointerPoint; point: PointerPoint } | { phase: 'cancel' };

export interface DesktopCardAction {
  id: string;
  label: string;
  icon: IconName;
  disabled?: boolean;
  onClick: () => void;
}
export interface DesktopCardLabels { collapse: string; expand: string }
export interface DesktopCardToolbarProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: string;
  cardStyle?: DesktopCardStyle;
}

/** 桌面卡片栏的标题与操作区。 */
export function DesktopCardToolbar({ title, cardStyle, className, children, ...rest }: DesktopCardToolbarProps) {
  return <div {...rest} className={cx('ds-desktop-card-toolbar', className)} data-card-style={cardStyle}>
    <span className="ds-desktop-card-toolbar-title"><Icon name="layout-grid" />{title}</span>
    <div className="ds-desktop-card-toolbar-actions">{children}</div>
  </div>;
}
export interface DesktopCardProps extends Omit<ComponentProps<'article'>, 'title'> {
  title: ReactNode;
  icon?: IconName;
  /** 扩展应用等卡片的真实图标资源，存在时优先于 icon。 */
  image?: string;
  meta?: ReactNode;
  /** 独立的原生拖动按钮插槽，不把整个含交互控件的标题栏改成按钮。 */
  dragHandle?: ReactNode;
  actions?: readonly DesktopCardAction[];
  footer?: ReactNode;
  summary?: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  collapsible?: boolean;
  labels?: Partial<DesktopCardLabels>;
  variant?: 'glass' | 'solid';
  cardStyle?: DesktopCardStyle;
  bodyProps?: ComponentProps<'div'>;
  /** 供宿主接入拖动 / 键盘定位，宿主必须排除内部按钮与编辑控件。 */
  headerProps?: ComponentProps<'header'>;
  /** 从标题或标题栏空白开始，移动超过 4px 后报告拖动。 */
  onHeaderDrag?: (gesture: DesktopCardDrag) => void;
}

/** 便签、待办、备忘与扩展应用共用卡片外壳，不管理桌面布局或业务数据。 */
export function DesktopCard({
  title, icon, image, meta, dragHandle, actions = [], footer, summary, children, collapsed, defaultCollapsed = false, onCollapsedChange,
  collapsible = true, labels: overrides, variant = 'glass', cardStyle, bodyProps = {}, headerProps = {}, onHeaderDrag, className, ...rest
}: DesktopCardProps) {
  const labels = useLabels('desktopCard', overrides);
  const [folded, setFolded] = useControllable(collapsed, defaultCollapsed, onCollapsedChange);
  const id = useId();
  const gesture = usePointerGesture<PointerPoint>({
    move: (start, point) => onHeaderDrag?.({ phase: 'move', start, point }),
    finish: (start, point) => onHeaderDrag?.({ phase: 'drop', start, point }),
    cancel: () => onHeaderDrag?.({ phase: 'cancel' }),
  }, 4);
  return <article
    {...rest} className={cx('ds-desktop-card', variant === 'solid' && 'is-solid', folded && 'is-collapsed', className)}
    data-card-style={variant === 'solid' ? undefined : cardStyle}
    aria-labelledby={`${id}-title`}
  >
    <header {...headerProps} className={cx('ds-desktop-card-head', headerProps.className)} data-movable={!!onHeaderDrag || undefined}
      onPointerDown={(event) => {
        headerProps.onPointerDown?.(event);
        const interactive = (event.target as Element).closest('button, input, select, textarea, a, [contenteditable]');
        if (onHeaderDrag && !interactive && !event.defaultPrevented) gesture.start(event, { x: event.clientX, y: event.clientY });
      }} onKeyDown={(event) => {
        if (event.key === 'Escape' && gesture.cancel()) { event.preventDefault(); return; }
        headerProps.onKeyDown?.(event);
      }}>
      {dragHandle}
      {image ? <span className="ds-desktop-card-symbol is-image"><img src={image} alt="" /></span>
        : icon && <span className="ds-desktop-card-symbol"><Icon name={icon} /></span>}
      <h3 id={`${id}-title`} className="ds-desktop-card-title">{title}</h3>
      {meta && <span className="ds-desktop-card-meta">{meta}</span>}
      <span className="ds-desktop-card-actions">
        {actions.map((action) => <button key={action.id} className="ds-desktop-card-action" type="button" title={action.label}
          aria-label={action.label} disabled={action.disabled} onClick={action.onClick}><Icon name={action.icon} /></button>)}
        {collapsible && <button className="ds-desktop-card-action" type="button" aria-label={folded ? labels.expand : labels.collapse}
          title={folded ? labels.expand : labels.collapse} aria-expanded={!folded} aria-controls={`${id}-body`}
          onClick={() => setFolded(!folded)}><Icon name={folded ? 'chevron-down' : 'chevron-up'} /></button>}
      </span>
    </header>
    <div id={`${id}-body`} className="ds-desktop-card-content" hidden={folded}>
      <div {...bodyProps} className={cx('ds-desktop-card-body ds-scrollable', bodyProps.className)}>{children}</div>
      {footer && <footer className="ds-desktop-card-footer">{footer}</footer>}
    </div>
    {folded && summary && <div className="ds-desktop-card-summary">{summary}</div>}
  </article>;
}

export type DesktopNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'white';
export interface DesktopNoteLabels extends DesktopCardLabels {
  input: string;
  color: string;
  colors: Record<DesktopNoteColor, string>;
  placeholder: string;
  images: (count: number) => string;
}
export interface DesktopNoteProps extends Omit<DesktopCardProps, 'children' | 'footer' | 'summary' | 'variant' | 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  color?: DesktopNoteColor;
  defaultColor?: DesktopNoteColor;
  onColorChange?: (color: DesktopNoteColor) => void;
  placement?: 'note' | 'card';
  labels?: LabelOverrides<DesktopNoteLabels>;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  imageCount?: number;
  /** 图片网格等已授权内容通过插槽组合，上传 / 预览继续复用已有组件。 */
  children?: ReactNode;
  tools?: ReactNode;
  /** 底栏色卡前的添加附件等操作。 */
  leadingTools?: ReactNode;
  status?: ReactNode;
  error?: ReactNode;
  inputProps?: Omit<ComponentProps<'textarea'>, 'children' | 'value' | 'defaultValue' | 'onChange' | 'aria-label' | 'disabled' | 'readOnly' | 'maxLength'>;
}
const noteColors: DesktopNoteColor[] = ['yellow', 'blue', 'green', 'pink', 'white'];

/** 文字便签视图，共用卡片壳；草稿 / 颜色 / 折叠可受控，不自动保存或发送给 AI。 */
export function DesktopNote({
  value, defaultValue = '', onValueChange, color, defaultColor = 'yellow', onColorChange, placement = 'note',
  labels: overrides, readOnly, disabled, maxLength = 4000, imageCount = 0, children, tools, leadingTools, status, error,
  inputProps = {}, bodyProps, className, ...rest
}: DesktopNoteProps) {
  const labels = useLabels('desktopNote', overrides);
  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);
  const [paper, setPaper] = useControllable(color, defaultColor, onColorChange);
  const textarea = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(inputProps.ref, () => textarea.current!, []);
  const id = useId();
  useFormReset(textarea, () => {
    if (value === undefined) setDraft(defaultValue);
    else if (textarea.current) textarea.current.value = draft;
  }, inputProps.form);
  const description = [inputProps['aria-describedby'], status ? `${id}-status` : undefined, error ? `${id}-error` : undefined]
    .filter(Boolean).join(' ') || undefined;
  return <DesktopCard {...rest} labels={labels} className={cx('ds-desktop-note', className)} data-color={paper} data-placement={placement}
    bodyProps={{ ...bodyProps, className: cx('ds-scrollable-hidden', bodyProps?.className) }}
    summary={imageCount > 0 ? [draft, labels.images(imageCount)].filter(Boolean).join(' · ') : draft || labels.placeholder} footer={<>
      {leadingTools && <fieldset className="ds-note-leading-tools" disabled={disabled || readOnly}>{leadingTools}</fieldset>}
      <div className="ds-note-colors" role="group" aria-label={labels.color}>
        {noteColors.map((choice) => <button key={choice} type="button" className="ds-note-color" data-color={choice} aria-label={labels.colors[choice]}
          title={labels.colors[choice]} aria-pressed={paper === choice} disabled={disabled || readOnly} onClick={() => setPaper(choice)}>
          {paper === choice && <Icon name="check" />}
        </button>)}
      </div>
      {tools && <fieldset className="ds-note-tools" disabled={disabled || readOnly}>{tools}</fieldset>}
      {status && <p id={`${id}-status`} className="ds-note-status" role="status">{status}</p>}
      {error && <p id={`${id}-error`} className="ds-field-error" role="alert">{error}</p>}
    </>}>
    <textarea {...inputProps} ref={textarea} className={cx('ds-control-input ds-note-input ds-scrollable-hidden', inputProps.className)}
      aria-label={labels.input} aria-describedby={description} aria-invalid={Boolean(error) || inputProps['aria-invalid']}
      value={draft} disabled={disabled} readOnly={readOnly} maxLength={Number.isFinite(maxLength) && maxLength >= 0 ? Math.floor(maxLength) : undefined}
      placeholder={inputProps.placeholder ?? labels.placeholder} rows={inputProps.rows ?? 3}
      onChange={(event) => { if (!disabled && !readOnly) setDraft(event.currentTarget.value); }} />
    {children}
  </DesktopCard>;
}

export interface ClockCardProps extends Omit<DesktopCardProps, 'children' | 'summary' | 'meta'> {
  now: Date | number;
  timeZone?: string;
  locale?: string;
  showSeconds?: boolean;
  analog?: boolean;
  invalidLabel?: string;
  compact?: boolean;
}
/** 时钟卡片只格式化注入时刻，不创建定时器；宿主按可见性更新 now 并负责清理。 */
export function ClockCard({
  now, timeZone = 'Asia/Shanghai', locale = 'zh-CN', showSeconds = true, analog = true, compact, invalidLabel: customInvalid, ...rest
}: ClockCardProps) {
  const labels = useLabels('clockCard');
  const invalidLabel = customInvalid ?? labels.invalid;
  const date = new Date(typeof now === 'number' ? now : now.getTime());
  let time = invalidLabel, day = '', hours = 0, minutes = 0, seconds = 0, valid = false;
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone, hour: '2-digit', minute: '2-digit', ...(showSeconds ? { second: '2-digit' as const } : {}), hourCycle: 'h23',
    });
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const part = (name: string) => Number(parts.find((item) => item.type === name)?.value || 0);
    hours = part('hour'); minutes = part('minute'); seconds = part('second');
    time = formatter.format(date);
    day = new Intl.DateTimeFormat(locale, { timeZone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(date);
    valid = true;
  } catch { /* 无效时区 / 时刻只展示调用方提供的回退，不切换到设备时区。 */ }
  let offset = '';
  try { offset = clockZoneInfo(timeZone, date).offset; } catch { /* 显示无效时区提示。 */ }
  const secondsText = showSeconds && valid ? time.slice(-3) : '';
  return <DesktopCard {...rest} data-compact={compact || undefined} className={cx('ds-clock-card', rest.className)} meta={offset} summary={<>{time} · {day}</>}>
    <div className="ds-clock-body">
      {analog && valid && <svg className="ds-clock-face" viewBox="0 0 80 80" aria-hidden="true">
        <circle className="ds-clock-dial" cx="40" cy="40" r="37" />
        {Array.from({ length: 12 }, (_, index) => <line
          key={index} x1="40" x2="40" y1="7" y2={index % 3 === 0 ? 13 : 10}
          transform={`rotate(${index * 30} 40 40)`} className="ds-clock-tick"
        />)}
        <line x1="40" x2="40" y1="42" y2="23" className="ds-clock-hour" transform={`rotate(${hours % 12 * 30 + minutes / 2} 40 40)`} />
        <line x1="40" x2="40" y1="43" y2="14" className="ds-clock-minute" transform={`rotate(${minutes * 6 + seconds / 10} 40 40)`} />
        {showSeconds && <line x1="40" x2="40" y1="46" y2="10" className="ds-clock-second" transform={`rotate(${seconds * 6} 40 40)`} />}
        <circle cx="40" cy="40" r="2.5" className="ds-clock-pivot" />
      </svg>}
      <div className="ds-clock-info"><time className="ds-clock-time" dateTime={valid ? date.toISOString() : undefined}>
        {secondsText ? time.slice(0, -3) : time}{secondsText && <span className="ds-clock-seconds">{secondsText}</span>}</time>
        <p className="ds-clock-date">{day}</p>
      </div>
    </div>
  </DesktopCard>;
}
