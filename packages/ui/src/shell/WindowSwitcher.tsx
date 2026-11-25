import { useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { Icon } from '../foundation/Icon';
import { useLabels } from '../foundation/ConfigProvider';
import { useChoiceNavigation } from '../foundation/useChoiceNavigation';
import { EmptyState, Tag } from '../primitives/Feedback';
import { AppIcon, type AppIconAppearance } from './AppIcon';

export interface WindowSwitcherItem {
  id: string; title: string; app?: AppIconAppearance; preview?: ReactNode; minimized?: boolean; disabled?: boolean;
}
export interface WindowSwitcherLabels { windows: string; empty: string; current: string; minimized: string }
export interface WindowSwitcherProps extends Omit<ComponentProps<'section'>, 'children'> {
  label: string;
  items: readonly WindowSwitcherItem[];
  currentId?: string;
  onActivate: (item: WindowSwitcherItem) => void;
  onCancel?: () => void;
  disabled?: boolean;
  labels?: Partial<WindowSwitcherLabels>;
}
/** 受控窗口目录与切换内容；不注册全局 Alt+Tab、不抓屏或读取真实窗口。 */
export function WindowSwitcher({ label, items, currentId, onActivate, onCancel, disabled, labels: overrides,
  ref, className, onKeyDown, ...rest }: WindowSwitcherProps) {
  const root = useRef<HTMLElement>(null);
  const labels = useLabels('windowSwitcher', overrides);
  const choices = items.map((item) => ({ ...item, disabled: disabled || item.disabled }));
  const navigation = useChoiceNavigation(choices, root, { initialId: currentId, onChoose: onActivate });
  useImperativeHandle(ref, () => root.current!, []);
  return <section {...rest} ref={root} aria-label={label} className={cx('ds-window-switcher', className)} onKeyDown={(event) => {
    onKeyDown?.(event); navigation.keyDown(event);
    if (!event.defaultPrevented && !event.nativeEvent.isComposing && event.key === 'Escape' && onCancel) {
      event.preventDefault(); event.stopPropagation(); onCancel();
    }
  }}>
    <ul className="ds-window-switcher-list ds-scrollable" aria-label={labels.windows}>
      {choices.map((item) => <li key={item.id} className="ds-window-switcher-card" data-current={item.id === currentId || undefined}>
        <div className="ds-window-switcher-preview" aria-hidden="true" inert>
          {item.preview ?? <Icon name="app-window" />}
        </div>
        <button type="button" className="ds-window-switcher-choice" disabled={item.disabled} aria-pressed={item.id === currentId}
          tabIndex={item.id === navigation.active?.id ? 0 : -1} data-choice-id={item.id}
          onFocus={() => navigation.setActive(item.id)} onClick={() => onActivate(item)}>
          <AppIcon {...item.app} size={item.app?.size ?? 32} />
          <span className="ds-window-switcher-title">{item.title}</span>
          {item.id === currentId && <Tag tone="info">{labels.current}</Tag>}
          {item.minimized && <Tag>{labels.minimized}</Tag>}
        </button>
      </li>)}
    </ul>
    {!items.length && <EmptyState compact>{labels.empty}</EmptyState>}
  </section>;
}
