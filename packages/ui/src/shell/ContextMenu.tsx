import {
  createContext,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { AnchorPopover, type AnchorPopoverProps } from '../foundation/AnchorPopover';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';
import { menuItemsIn, useMenuKeyboard } from '../foundation/useMenuKeyboard';
import type { WallpaperName } from './Desktop';

interface ContextMenuLevel {
  expandedId: string | null;
  expand: (id: string | null) => void;
  closeRoot?: () => void;
}
const MenuLevel = createContext<ContextMenuLevel | null>(null);

interface ContextMenuPanelProps extends Omit<AnchorPopoverProps, 'open' | 'role' | 'onClose'> {
  closeRoot?: () => void;
  onBack?: () => void;
}

function ContextMenuPanel({
  closeRoot,
  onBack,
  ref,
  className,
  children,
  onKeyDown,
  onClick,
  onMouseMove,
  ...rest
}: ContextMenuPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  // 打开前聚焦的元素：必须在首次渲染时读取，等 ref 回调时 AnchorPopover 已把焦点移进菜单。
  const [initialOpener] = useState<HTMLElement | null>(() => {
    const active = typeof document === 'undefined' ? null : document.activeElement;
    return active instanceof HTMLElement && active !== document.body ? active : null;
  });
  const opener = useRef<HTMLElement | null>(initialOpener);
  const connect = useCallback((node: HTMLDivElement | null) => {
    panel.current = node;
  }, []);
  // 路过普通项时焦点可以移动，已展开的分支仍可进入。
  const [expandedId, expand] = useState<string | null>(null);
  const level = useMemo(() => ({ expandedId, expand, closeRoot }), [expandedId, closeRoot]);
  const keyboard = useMenuKeyboard(panel, closeRoot, opener);
  useImperativeHandle(ref, () => panel.current!);

  return (
    <AnchorPopover
      {...rest}
      ref={connect}
      open
      role="menu"
      className={cx('ds-context-menu', className)}
      dismiss={!onBack}
      onClose={closeRoot}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          onBack &&
          event.key === 'ArrowLeft' &&
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          (event.target as Element).closest('[role="menu"]') === panel.current
        ) {
          event.preventDefault();
          event.stopPropagation();
          onBack();
          return;
        }
        // Tab 从任何一级退出整个菜单，由根面板计算外部焦点。
        if (!onBack || event.key !== 'Tab') keyboard.onKeyDown(event);
      }}
      onMouseMove={(event) => {
        onMouseMove?.(event);
        keyboard.onMouseMove(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        keyboard.onClick(event);
      }}
    >
      <MenuLevel.Provider value={level}>{children}</MenuLevel.Provider>
    </AnchorPopover>
  );
}

export interface ContextMenuProps extends Omit<ComponentProps<'div'>, 'role'> {
  /** 视口像素坐标，直接传入右键事件的 clientX / clientY。 */
  x: number;
  y: number;
  onClose?: () => void;
}

/** 同一棵右键菜单只注册一次外部关闭和 Escape 监听。 */
export function ContextMenu({ x, y, onClose, onContextMenu, ...rest }: ContextMenuProps) {
  return (
    <ContextMenuPanel
      {...rest}
      key={`${x}:${y}`}
      point={{ x, y }}
      closeRoot={onClose}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        event.preventDefault();
        event.stopPropagation();
      }}
    />
  );
}

export interface ContextMenuItemProps extends Omit<ComponentProps<'button'>, 'role'> {
  icon?: IconName;
  checked?: boolean;
  /** 多个互斥选项用 radio，独立开关保持默认 checkbox。 */
  checkRole?: 'checkbox' | 'radio';
  shortcut?: string;
  textValue?: string;
  /** 桌面背景菜单中的预设缩略图，与文字同列。 */
  wallpaper?: WallpaperName;
}

export function ContextMenuItem({
  icon,
  checked,
  checkRole = 'checkbox',
  shortcut,
  textValue,
  wallpaper,
  className,
  children,
  type = 'button',
  ...rest
}: ContextMenuItemProps) {
  return (
    <button
      type={type}
      role={checked === undefined ? 'menuitem' : `menuitem${checkRole}`}
      aria-checked={checked}
      tabIndex={-1}
      data-text-value={textValue}
      className={cx('ds-context-item', className)}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      <span className="ds-context-label">
        {wallpaper && <span className={cx('ds-context-wallpaper', `ds-wp-${wallpaper}`)} aria-hidden="true" />}
        {children}
      </span>
      {checked !== undefined && (
        <span className="ds-context-check" aria-hidden="true">
          {checked && <Icon name="check" />}
        </span>
      )}
      {shortcut && <kbd>{shortcut}</kbd>}
      {rest['aria-haspopup'] === 'menu' && <Icon name="chevron-right" />}
    </button>
  );
}

export function ContextMenuDivider() {
  return <div className="ds-context-divider" role="separator" />;
}

export interface ContextMenuSubmenuProps {
  label: string;
  icon?: IconName;
  disabled?: boolean;
  children: ReactNode;
}

/** 子菜单复用锚点顶层和本层键盘导航，可继续包含子菜单。 */
export function ContextMenuSubmenu({ label, icon, disabled, children }: ContextMenuSubmenuProps) {
  const level = useContext(MenuLevel);
  const anchor = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const open = !disabled && level?.expandedId === id;
  const show = (focus: boolean) => {
    if (!level || disabled) return;
    if (open && focus) {
      const panel = anchor.current?.ownerDocument.getElementById(id) ?? null;
      (menuItemsIn(panel)[0] ?? panel)?.focus({ preventScroll: true });
    } else if (!open) {
      setFocusOnOpen(focus);
      level.expand(id);
    }
  };
  return (
    <>
      <ContextMenuItem
        ref={anchor}
        icon={icon}
        disabled={disabled || !level}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') show(false);
        }}
        onClick={(event) => {
          event.preventDefault();
          show(true);
        }}
        onContextMenu={(event) => {
          if (!event.defaultPrevented) show(true);
        }}
        onKeyDown={(event) => {
          if (
            event.key === 'ArrowRight' &&
            !event.defaultPrevented &&
            !event.nativeEvent.isComposing &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            event.stopPropagation();
            show(true);
          }
        }}
      >
        {label}
      </ContextMenuItem>
      {open && (
        <ContextMenuPanel
          id={id}
          aria-label={label}
          anchor={anchor}
          placement="right-start"
          gap={10}
          initialFocus={focusOnOpen ? 'first' : false}
          restoreFocus={false}
          closeRoot={level?.closeRoot}
          onBack={() => {
            anchor.current?.focus({ preventScroll: true });
            level?.expand(null);
          }}
        >
          {children}
        </ContextMenuPanel>
      )}
    </>
  );
}
