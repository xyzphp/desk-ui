import { useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon } from '../foundation/Icon';
import { wallpaperImage, wallpapers, type WallpaperName } from './Desktop';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'settings';
}

/** 分段控件（跟随系统 / Windows / macOS）。选项是切换按钮，当前项 aria-pressed。 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  variant,
  disabled,
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx('ds-segmented', variant === 'settings' && 'ds-segmented--settings', className)}
      role="group"
      aria-label={rest['aria-label']}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          aria-label={option.description}
          title={option.description}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type ThemeChoice = 'auto' | 'light' | 'dark';

const themeOptions: ThemeChoice[] = ['auto', 'light', 'dark'];

export interface ThemePickerProps {
  value: ThemeChoice;
  onChange: (value: ThemeChoice) => void;
  variant?: 'cards' | 'settings';
}

/** 外观选择卡片（自动 / 浅色 / 深色），带色块预览。 */
export function ThemePicker({ value, onChange, variant = 'cards' }: ThemePickerProps) {
  const labels = useLabels('themePicker');
  if (variant === 'settings') {
    const choices: ThemeChoice[] = ['light', 'dark', 'auto'];
    return (
      <SegmentedControl
        variant="settings"
        aria-label={labels.label}
        value={value}
        onChange={onChange}
        options={choices.map((choice) => ({ value: choice, label: labels[choice] }))}
      />
    );
  }
  return (
    <div className="ds-theme-picker">
      {themeOptions.map((option) => (
        <button key={option} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>
          <span className={cx('ds-swatch', `ds-swatch--${option}`)} />
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

export interface AccentPickerProps {
  colors: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'settings';
}

/** 强调色圆点选择。 */
export function AccentPicker({ colors, value, onChange, variant }: AccentPickerProps) {
  const labels = useLabels('accentPicker');
  return (
    <div
      className={cx('ds-accent-picker', variant === 'settings' && 'ds-accent-picker--settings')}
      role="group"
      aria-label={labels.label}
    >
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          style={{ background: color.value }}
          aria-label={color.label}
          title={color.label}
          aria-pressed={color.value === value}
          onClick={() => onChange(color.value)}
        />
      ))}
    </div>
  );
}

export interface WallpaperPickerProps {
  value?: WallpaperName;
  disabled?: boolean;
  onChange: (value: WallpaperName) => void;
  custom?: { url?: string; onClick: () => void };
}

/** 壁纸缩略图选择。 */
export function WallpaperPicker({ value, disabled, onChange, custom }: WallpaperPickerProps) {
  const labels = useLabels('wallpaperPicker');
  const image = wallpaperImage(custom?.url);
  return (
    <div
      className={cx('ds-wallpaper-picker', custom && 'ds-wallpaper-picker--settings')}
      role="group"
      aria-label={labels.label}
    >
      {wallpapers.map((name) => (
        <button
          key={name}
          type="button"
          className={`ds-wp-${name}`}
          aria-label={labels[name]}
          title={labels[name]}
          aria-pressed={!image && name === value}
          disabled={disabled}
          onClick={() => onChange(name)}
        />
      ))}
      {custom && (
        <button
          type="button"
          className="ds-wallpaper-custom"
          aria-pressed={!!image}
          aria-label={image ? labels.useCustom : labels.addCustom}
          disabled={disabled}
          onClick={custom.onClick}
          style={
            image
              ? { backgroundImage: `linear-gradient(180deg, rgba(10, 18, 32, .02), rgba(10, 18, 32, .48)), ${image}` }
              : undefined
          }
        >
          <Icon name={image ? 'check' : 'plus'} />
          <span>{labels.custom}</span>
        </button>
      )}
    </div>
  );
}

export interface CalendarProps extends ComponentProps<'div'> {
  /** 高亮"今天"的日期，缺省为当前日期。 */
  today?: Date;
}

/** 月历：上下月切换、周标题、今日高亮、相邻月份淡化。 */
export function Calendar({ today = new Date(), className, ...rest }: CalendarProps) {
  const labels = useLabels('calendar');
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = cursor.getDay();
  const days = Array.from({ length: 42 }, (_, i) => new Date(year, month, i - offset + 1));
  const move = (step: number) => setCursor(new Date(year, month + step, 1));
  return (
    <div className={className} {...rest}>
      <div className="ds-calendar-head">
        <button type="button" aria-label={labels.previous} onClick={() => move(-1)}>
          <Icon name="chevron-left" />
        </button>
        <span>{labels.title(year, month + 1)}</span>
        <button type="button" aria-label={labels.next} onClick={() => move(1)}>
          <Icon name="chevron-right" />
        </button>
      </div>
      <div className="ds-calendar-grid">
        {labels.weekdays.map((d, index) => (
          <div key={index} className="ds-calendar-weekday">
            {d}
          </div>
        ))}
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cx(
              'ds-calendar-day',
              d.getMonth() !== month && 'is-muted',
              d.toDateString() === today.toDateString() && 'is-today',
            )}
          >
            {d.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 加载指示。 */
export function Spinner({ label, className }: { label?: string; className?: string }) {
  const labels = useLabels('spinner');
  return <span className={cx('ds-spinner', className)} role="status" aria-label={label ?? labels.loading} />;
}
