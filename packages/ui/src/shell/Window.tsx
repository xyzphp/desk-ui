import { useRef, useState, type ComponentProps, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { Icon, type IconName } from '../foundation/Icon';
import { useDesktop, type WindowPlatform } from './Desktop';

export type WindowAction = 'close' | 'minimize' | 'maximize';

function maximizeIcon(platform: WindowPlatform, maximized: boolean): IconName {
  if (platform === 'macos') return maximized ? 'minimize-2' : 'maximize-2';
  return maximized ? 'copy' : 'square';
}

export interface WindowControlsProps {
  platform?: WindowPlatform;
  maximized?: boolean;
  /** 可见标题栏按钮，省略时显示全部平台控件。 */
  controls?: readonly WindowAction[];
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
}

/** 标题栏控件。macOS：左侧红黄绿圆点，悬停显示图标；Windows：右侧矩形按钮，关闭悬停变红。 */
export function WindowControls({
  platform,
  maximized = false,
  controls,
  onClose,
  onMinimize,
  onToggleMaximize,
}: WindowControlsProps) {
  const labels = useLabels('window');
  const desktop = useDesktop();
  const current = platform ?? desktop.windowPlatform;
  const order: WindowAction[] =
    current === 'windows' ? ['minimize', 'maximize', 'close'] : ['close', 'minimize', 'maximize'];
  const visible = controls ? order.filter((action) => controls.includes(action)) : order;
  const handlers: Record<WindowAction, (() => void) | undefined> = {
    close: onClose,
    minimize: onMinimize,
    maximize: onToggleMaximize,
  };
  const icons: Record<WindowAction, IconName> = {
    close: 'x',
    minimize: 'minus',
    maximize: maximizeIcon(current, maximized),
  };
  return (
    <div
      className="ds-window-controls window-controls traffic"
      data-platform={current}
      role="group"
      aria-label={labels.controls}
    >
      {visible.map((action) => (
        <button
          key={action}
          type="button"
          className={`is-${action} t-${action === 'minimize' ? 'min' : action === 'maximize' ? 'max' : 'close'}`}
          data-window-action={action}
          title={action === 'maximize' && maximized ? labels.restore : labels[action]}
          aria-label={action === 'maximize' && maximized ? labels.restore : labels[action]}
          aria-pressed={action === 'maximize' ? maximized : undefined}
          onClick={(e) => {
            e.stopPropagation();
            handlers[action]?.();
          }}
        >
          <Icon className="xyz-icon" name={icons[action]} />
        </button>
      ))}
    </div>
  );
}

export interface WindowTitlebarProps
  extends Omit<ComponentProps<'div'>, 'title' | 'children' | 'onClose'>, WindowControlsProps {
  title: string;
  /** 应用图标；Windows 平台显示在标题前，macOS 平台不渲染。 */
  icon?: ReactNode;
  /** 保留原生模板需要的根标签，标题栏子结构保持不变。 */
  as?: 'div' | 'header';
  actions?: ReactNode;
  /** 标题文字的 id，供对话框 aria-labelledby 引用；只指向标题，不把窗口控件并入名称。 */
  titleId?: string;
}

/** 完整标题栏：macOS 左侧控件与居中标题，Windows 右侧控件与左对齐标题。 */
export function WindowTitlebar({
  title,
  icon,
  as = 'div',
  platform,
  maximized,
  controls,
  onClose,
  onMinimize,
  onToggleMaximize,
  actions,
  titleId,
  className,
  ...rest
}: WindowTitlebarProps) {
  const desktop = useDesktop();
  const current = platform ?? desktop.windowPlatform;
  const content = (
    <>
      <WindowControls
        platform={current}
        maximized={maximized}
        controls={controls}
        onClose={onClose}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
      />
      {icon && current === 'windows' && (
        <span className="ds-window-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="ds-window-title" id={titleId}>
        {title}
      </div>
      {actions && <div className="ds-window-titlebar-actions">{actions}</div>}
    </>
  );
  const titlebarClass = cx('ds-window-titlebar', !!actions && 'has-actions', className);
  return as === 'header' ? (
    <header {...rest} className={titlebarClass} data-platform={current}>
      {content}
    </header>
  ) : (
    <div {...rest} className={titlebarClass} data-platform={current}>
      {content}
    </div>
  );
}

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowProps {
  /** A surrounding native dialog owns the accessible role in WindowDialog. */
  role?: 'dialog' | 'presentation';
  title: string;
  geometry: WindowGeometry;
  /** 拖动标题栏或边缘缩放时回调新的几何信息，位置状态由调用方保存。 */
  onGeometryChange?: (next: WindowGeometry) => void;
  zIndex?: number;
  /** 是否为当前焦点窗口；非焦点窗口标题变灰、阴影变浅。 */
  active?: boolean;
  maximized?: boolean;
  minimized?: boolean;
  minWidth?: number;
  minHeight?: number;
  onFocus?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  /** Optional header actions, placed opposite macOS controls and beside Windows controls. */
  titlebarActions?: ReactNode;
  /** Optional visible titlebar controls; omitted means all platform controls. */
  titlebarControls?: readonly WindowAction[];
  /** 应用图标；随标题栏平台显示（当前仅 Windows 标题栏）。 */
  icon?: ReactNode;
  className?: string;
  /** 内容自己管理滚动时设为 false，避免窗口体与内部容器同时出现滚动条。 */
  scrollable?: boolean;
  /**
   * 嵌入模式：不显示标题栏和缩放手柄，忽略几何 / 最大化 / 最小化，铺满定位容器
   *（边距由 --ds-window-embedded-inset 控制）。与普通模式切换时内容不会重新挂载。
   */
  embedded?: boolean;
  children: ReactNode;
}

type Gesture = 'move' | 'e' | 's' | 'w' | 'se';

/** 桌面窗口：标题栏（拖动 / 双击最大化）、内容区、三向缩放。必须放在 DesktopArea 内；embedded 时作为铺满容器的页面区域。 */
export function Window({
  title,
  geometry,
  onGeometryChange,
  zIndex,
  active = true,
  maximized = false,
  minimized = false,
  role = 'dialog',
  minWidth = 360,
  minHeight = 240,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  titlebarActions,
  titlebarControls,
  icon,
  className,
  scrollable = true,
  embedded = false,
  children,
}: WindowProps) {
  const { windowPlatform } = useDesktop();
  const labels = useLabels('window');
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ mode: Gesture; startX: number; startY: number; origin: WindowGeometry } | null>(null);

  const begin = (e: PointerEvent<HTMLElement>, mode: Gesture) => {
    if (e.button !== 0 || maximized) return;
    if (mode === 'move' && (e.target as HTMLElement).closest('.ds-window-controls, .ds-window-titlebar-actions'))
      return;
    if (mode !== 'move') {
      e.preventDefault();
      e.stopPropagation();
    }
    gesture.current = { mode, startX: e.clientX, startY: e.clientY, origin: geometry };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const { x, y, width, height } = g.origin;
    if (g.mode === 'move') onGeometryChange?.({ x: x + dx, y: Math.max(0, y + dy), width, height });
    else if (g.mode === 'e') onGeometryChange?.({ x, y, width: Math.max(minWidth, width + dx), height });
    else if (g.mode === 's') onGeometryChange?.({ x, y, width, height: Math.max(minHeight, height + dy) });
    else if (g.mode === 'se')
      onGeometryChange?.({ x, y, width: Math.max(minWidth, width + dx), height: Math.max(minHeight, height + dy) });
    else {
      const nextWidth = Math.max(minWidth, width - dx);
      onGeometryChange?.({ x: x + width - nextWidth, y, width: nextWidth, height });
    }
  };

  const end = (e: PointerEvent<HTMLElement>) => {
    if (!gesture.current) return;
    gesture.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const style: CSSProperties = embedded
    ? {}
    : maximized
      ? { left: 0, top: 0, width: '100%', height: 'calc(100% - var(--ds-maximize-inset, 0px))', zIndex }
      : {
          left: geometry.x,
          top: geometry.y,
          width: geometry.width,
          height: geometry.height,
          minWidth,
          minHeight,
          zIndex,
        };

  const drag = { onPointerMove: move, onPointerUp: end, onPointerCancel: end };

  return (
    <section
      role={embedded ? 'region' : role}
      aria-label={embedded || role === 'dialog' ? title : undefined}
      aria-hidden={(minimized && !embedded) || undefined}
      className={cx(
        'ds-window',
        embedded && 'is-embedded',
        !active && !embedded && 'is-inactive',
        maximized && !embedded && 'is-maximized',
        minimized && !embedded && 'is-minimized',
        dragging && !embedded && 'is-dragging',
        className,
      )}
      data-platform={windowPlatform}
      style={style}
      onPointerDownCapture={onFocus}
    >
      {!embedded && (
        <WindowTitlebar
          title={title}
          platform={windowPlatform}
          maximized={maximized}
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
          controls={titlebarControls}
          actions={titlebarActions}
          icon={icon}
          onPointerDown={(event) => begin(event, 'move')}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest('.ds-window-controls, .ds-window-titlebar-actions'))
              onToggleMaximize?.();
          }}
          {...drag}
        />
      )}
      <div className={cx('ds-window-body', !scrollable && 'ds-window-body--contained')}>{children}</div>
      {!maximized && !embedded && (
        <>
          <div className="ds-resizer ds-resizer--e" onPointerDown={(event) => begin(event, 'e')} {...drag} />
          <div className="ds-resizer ds-resizer--s" onPointerDown={(event) => begin(event, 's')} {...drag} />
          <div className="ds-resizer ds-resizer--w" onPointerDown={(event) => begin(event, 'w')} {...drag} />
          <button
            type="button"
            className="ds-resizer ds-resizer--se"
            aria-label={labels.resize}
            aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
            disabled={!onGeometryChange}
            onKeyDown={(event) => {
              if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
              )
                return;
              event.preventDefault();
              event.stopPropagation();
              const step = event.shiftKey ? 50 : 10;
              const width =
                geometry.width + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0);
              const height = geometry.height + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0);
              onGeometryChange?.({
                ...geometry,
                width: Math.max(minWidth, width),
                height: Math.max(minHeight, height),
              });
            }}
            onPointerDown={(event) => begin(event, 'se')}
            {...drag}
          />
        </>
      )}
    </section>
  );
}
