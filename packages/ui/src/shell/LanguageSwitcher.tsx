import { useId, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import type { LabelOverrides, LanguageSwitcherLabels } from '../foundation/locale';
import { locales as registeredLocales, SYSTEM_LOCALE, type LocaleDefinition } from '../foundation/locales';
import { MenuSeparator, Popover } from './Overlay';

export type LanguageOption = Pick<LocaleDefinition, 'tag' | 'name' | 'short'>;

export interface LanguageSwitcherProps extends Omit<
  ComponentProps<'button'>,
  'children' | 'onChange' | 'ref' | 'value'
> {
  /** 语言偏好：SYSTEM_LOCALE（跟随系统）或某个语言标签。 */
  choice: string;
  /** 实际生效的语言标签，决定入口上的短码；跟随系统时由宿主解析后传入。 */
  current: string;
  onChoiceChange: (choice: string) => void;
  /** 可选语言，默认取语言登记表。不超过两种时点击直接互切，多于两种才弹出菜单。 */
  locales?: readonly LanguageOption[];
  /** 菜单里是否提供“跟随系统”；只在多于两种语言的菜单形态下出现。 */
  allowSystem?: boolean;
  /** menubar 用在菜单栏 / 任务栏，plain 用在后台顶栏、登录页等普通工具区。 */
  variant?: 'menubar' | 'plain';
  /** 菜单相对入口的水平停靠。 */
  align?: 'left' | 'right';
  labels?: LabelOverrides<LanguageSwitcherLabels>;
}

/**
 * 语言切换入口，无边框显示当前语言短码。
 * 两种语言时点一下直接换成另一种；多于两种时点开单选菜单。只回调选择，偏好的保存与解析由宿主负责。
 */
export function LanguageSwitcher({
  choice,
  current,
  onChoiceChange,
  locales = registeredLocales,
  allowSystem = true,
  variant = 'menubar',
  align = 'right',
  labels: labelOverrides,
  className,
  onClick,
  ...rest
}: LanguageSwitcherProps) {
  const labels = useLabels('languageSwitcher', labelOverrides);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const active = locales.find((item) => item.tag === current) ?? locales[0];
  const hasMenu = locales.length > 2;
  // 互切形态的目标语言：当前生效语言之外的那一种。
  const other = hasMenu ? undefined : locales.find((item) => item.tag !== active?.tag);
  const name = other ? labels.switchTo(other.name) : active ? labels.current(active.name) : labels.label;
  const option = (value: string, text: string, lang?: string) => (
    <button
      key={value}
      type="button"
      role="menuitemradio"
      aria-checked={choice === value}
      tabIndex={-1}
      lang={lang}
      className="ds-menu-item ds-language-option"
      onClick={() => {
        if (choice !== value) onChoiceChange(value);
      }}
    >
      <span>{text}</span>
      <span className="ds-language-option-check">{choice === value && <Icon name="check" />}</span>
    </button>
  );
  return (
    <>
      <button
        {...rest}
        ref={trigger}
        type="button"
        className={cx(
          variant === 'menubar' ? 'ds-menubar-item' : 'ds-language-switcher--plain',
          'ds-language-switcher',
          open && 'is-active',
          className,
        )}
        aria-haspopup={hasMenu ? 'menu' : undefined}
        aria-expanded={hasMenu ? open : undefined}
        aria-controls={open ? menuId : undefined}
        aria-label={name}
        title={hasMenu ? labels.label : name}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (hasMenu) setOpen((value) => !value);
          else if (other) onChoiceChange(other.tag);
        }}
      >
        {active && (
          <span className="ds-language-switcher-code" lang={active.tag} aria-hidden="true">
            {active.short}
          </span>
        )}
      </button>
      {hasMenu && (
        <Popover
          id={menuId}
          open={open}
          anchor={trigger}
          align={align}
          aria-label={labels.label}
          onClose={() => setOpen(false)}
        >
          {locales.map((item) => option(item.tag, item.name, item.tag))}
          {allowSystem && <MenuSeparator />}
          {allowSystem && option(SYSTEM_LOCALE, labels.system)}
        </Popover>
      )}
    </>
  );
}
