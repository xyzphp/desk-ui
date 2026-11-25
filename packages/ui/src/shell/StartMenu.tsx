import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../foundation/cx';
import { useLabels, useLocale } from '../foundation/ConfigProvider';
import type { IconName } from '../foundation/Icon';
import type { LabelOverrides, StartMenuLabels } from '../foundation/locale';
import { Avatar } from '../primitives/Display';
import { IconButton } from '../primitives/Button';
import { SearchField } from '../layout/Layout';

/** 开始按钮：Windows 11 风格的四个方块，24px 画布上 11px 方块、整数坐标、直角、自上而下略微变亮的渐变，保证在 1x / 2x 屏幕上边缘清晰。 */
export function StartButton({ active, className, ...rest }: ComponentProps<'button'> & { active?: boolean }) {
  const labels = useLabels('startMenu');
  const gradient = useId();
  return (
    <button
      type="button"
      className={cx('ds-start-button', active && 'is-active', className)}
      aria-label={labels.button}
      title={labels.button}
      {...rest}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'color-mix(in srgb, currentColor 62%, white)' }} />
            <stop offset="1" style={{ stopColor: 'currentColor' }} />
          </linearGradient>
        </defs>
        {[0, 13].flatMap((y) =>
          [0, 13].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="11" height="11" fill={`url(#${gradient})`} />),
        )}
      </svg>
    </button>
  );
}

export interface StartMenuItem {
  id: string;
  label: string;
  /** 图标节点，通常是 AppIcon；尺寸由 --ds-app-icon-size 控制（固定区 48px，列表 28px）。 */
  icon: ReactNode;
  /** 搜索时额外匹配的关键词。 */
  keywords?: string;
}

export interface StartMenuAction {
  id: string;
  label: string;
  icon: IconName;
  onSelect: () => void;
}

export interface StartMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 与任务栏应用按钮一致：center 时菜单位于屏幕水平中部，left 时靠左。 */
  align?: 'center' | 'left';
  /** 全部应用：“全部”分区与搜索基于它。 */
  items: readonly StartMenuItem[];
  /** 可选：需要“已固定”分区时给出其应用 id（按给定顺序，网格显示）；缺省或匹配不到任何应用时不分区，只显示按名称排序的应用列表。 */
  pinnedIds?: readonly string[];
  onSelect: (id: string) => void;
  userName: string;
  avatarUrl?: string;
  /** 底部的账号与电源入口，选择后菜单自动关闭。 */
  actions?: readonly StartMenuAction[];
  labels?: LabelOverrides<StartMenuLabels>;
}

/**
 * 开始按钮与开始菜单。按钮放在 Dock 里作为第一项；菜单用顶层 popover 按任务栏高度固定在任务栏上方，
 * 不测量面板尺寸，因此不会压到任务栏。Esc、点击外部关闭，关闭后焦点回到开始按钮。
 */
export function StartMenu({
  open,
  onOpenChange,
  align = 'center',
  items,
  pinnedIds,
  onSelect,
  userName,
  avatarUrl,
  actions = [],
  labels: overrides,
}: StartMenuProps) {
  const labels = useLabels('startMenu', overrides);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLocaleLowerCase();
  const locale = useLocale();
  const sorted = useMemo(() => {
    const collator = new Intl.Collator(locale);
    return [...items].sort((a, b) => collator.compare(a.label, b.label));
  }, [items, locale]);
  const pinned = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    const found = (pinnedIds ?? []).flatMap((pinnedId) => byId.get(pinnedId) ?? []);
    return found;
  }, [items, pinnedIds]);
  const found = useMemo(
    () =>
      keyword
        ? sorted.filter((item) => `${item.label} ${item.keywords ?? ''}`.toLocaleLowerCase().includes(keyword))
        : [],
    [keyword, sorted],
  );

  useEffect(() => {
    const layer = menu.current;
    if (!open || !layer) return;
    layer.showPopover?.();
    layer.querySelector<HTMLInputElement>('input')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!layer.contains(target) && !button.current?.contains(target)) onOpenChange(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onOpenChange(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      try {
        layer.hidePopover?.();
      } catch {
        // 元素已随面板卸载。
      }
    };
  }, [open, onOpenChange]);
  // 菜单关闭后清空搜索，下次打开回到应用列表。
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const choose = (itemId: string) => {
    onOpenChange(false);
    onSelect(itemId);
  };
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && found[0]) choose(found[0].id);
  };
  const tiles = (list: readonly StartMenuItem[], view: 'grid' | 'list', label: string) => (
    <ul className="ds-start-grid" data-view={view} aria-label={label}>
      {list.map((item) => (
        <li key={item.id}>
          <button type="button" className="ds-start-app" onClick={() => choose(item.id)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <StartButton
        ref={button}
        active={open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => onOpenChange(!open)}
      />
      {open && (
        <div
          ref={menu}
          id={id}
          popover="manual"
          role="dialog"
          aria-label={labels.button}
          className="ds-start-menu"
          data-align={align}
          tabIndex={-1}
        >
          <SearchField
            variant="pill"
            className="ds-start-search"
            label={labels.search}
            placeholder={labels.search}
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          <div className="ds-start-body ds-scrollable">
            {keyword ? (
              <>
                <div className="ds-start-heading">{labels.results}</div>
                {found.length === 0 ? (
                  <p className="ds-start-empty" role="status">
                    {labels.empty}
                  </p>
                ) : (
                  tiles(found, 'list', labels.results)
                )}
              </>
            ) : (
              <>
                {pinned.length > 0 && (
                  <>
                    <div className="ds-start-heading">{labels.pinned}</div>
                    {tiles(pinned, 'grid', labels.pinned)}
                    <div className="ds-start-heading">{labels.all}</div>
                  </>
                )}
                {tiles(sorted, 'list', labels.all)}
              </>
            )}
          </div>
          <div className="ds-start-footer">
            <span className="ds-start-user">
              <Avatar name={userName} src={avatarUrl} size="sm" decorative />
              <span>{userName}</span>
            </span>
            <span className="ds-start-power">
              {actions.map((action) => (
                <IconButton
                  key={action.id}
                  variant="quiet"
                  icon={action.icon}
                  label={action.label}
                  onClick={() => {
                    onOpenChange(false);
                    action.onSelect();
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
