import { useCallback, useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../foundation/cx';
import { useLabels } from '../foundation/ConfigProvider';
import { useDesktop } from './Desktop';

export interface DockProps extends Omit<ComponentProps<'footer'>, 'children'> {
  /** 隐藏 Dock（macOS 风格下滑出屏幕；Windows 任务栏保持占位）。 */
  hidden?: boolean;
  /** macOS 自动隐藏：默认下滑隐去，指针移至底部边缘时自动上滑显示，离开后延后收起。 */
  autoHide?: boolean;
  /** 自动隐藏启用时，临时保持 Dock 显示（如打开 Dock 图标右键菜单期间）。 */
  holdOpen?: boolean;
  /** 指针经过时放大邻近图标；默认仅 macOS 风格开启，Windows 任务栏不放大。 */
  magnify?: boolean;
  /** 静止状态项尺寸（px）；放大峰值与感应范围按默认 54px 基准等比缩放。 */
  itemSize?: number;
  children: ReactNode;
}

/** 与原系统一致：静止 54px，指针正下方放大到 84px，150px 范围内按余弦衰减。 */
const magnification = { base: 54, max: 84, range: 150 } as const;

const magnificationFor = (itemSize?: number) =>
  !itemSize || itemSize === magnification.base
    ? magnification
    : {
        base: itemSize,
        max: Math.round((itemSize * magnification.max) / magnification.base),
        range: Math.round((itemSize * magnification.range) / magnification.base),
      };

/** 底部 Dock / 任务栏。外观由所在 Desktop 的 dockStyle 决定；macOS 风格支持指针放大与底边呼出。 */
export function Dock({
  hidden,
  autoHide,
  holdOpen,
  magnify,
  itemSize,
  inert,
  className,
  children,
  onFocus,
  onBlur,
  ...rest
}: DockProps) {
  const labels = useLabels('dock');
  const desktop = useDesktop();
  const autoReveal = Boolean(autoHide && !hidden && desktop.dockStyle === 'macos');
  const [revealed, setRevealed] = useState(false);
  const [focusedInside, setFocusedInside] = useState(false);
  const [prevAutoReveal, setPrevAutoReveal] = useState(autoReveal);
  if (autoReveal !== prevAutoReveal) {
    setPrevAutoReveal(autoReveal);
    if (!autoReveal) {
      setRevealed(false);
      setFocusedInside(false);
    }
  }
  const shownByAuto = autoReveal && (revealed || Boolean(holdOpen) || focusedInside);
  const isVisuallyHidden = Boolean(hidden || (autoReveal && !shownByAuto));
  const enabled = (magnify ?? desktop.dockStyle === 'macos') && !isVisuallyHidden;
  const scale = magnificationFor(itemSize);
  const footerRef = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const measuredItems = useRef<HTMLElement[]>([]);
  const centers = useRef<number[]>([]);
  const pointerOnDock = useRef(false);
  const pointerInteracting = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const clearPointer = () => {
      pointerInteracting.current = false;
    };
    window.addEventListener('pointerup', clearPointer, true);
    window.addEventListener('pointercancel', clearPointer, true);
    return () => {
      window.removeEventListener('pointerup', clearPointer, true);
      window.removeEventListener('pointercancel', clearPointer, true);
    };
  }, []);
  const revealedRef = useRef(revealed);
  const holdOpenRef = useRef(Boolean(holdOpen));
  const focusedInsideRef = useRef(focusedInside);
  useEffect(() => {
    revealedRef.current = revealed;
    holdOpenRef.current = Boolean(holdOpen);
    focusedInsideRef.current = focusedInside;
  }, [focusedInside, holdOpen, revealed]);
  const cancelHide = useCallback(() => {
    if (hideTimer.current !== undefined) {
      clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
    }
  }, []);
  const scheduleHide = useCallback(() => {
    if (hideTimer.current !== undefined || holdOpenRef.current || focusedInsideRef.current) return;
    hideTimer.current = setTimeout(() => {
      hideTimer.current = undefined;
      if (!pointerOnDock.current && !holdOpenRef.current && !focusedInsideRef.current) setRevealed(false);
    }, 320);
  }, []);
  const clear = useCallback(() => {
    measuredItems.current = [];
    centers.current = [];
    dock.current?.querySelectorAll<HTMLElement>('.ds-dock-item').forEach((item) => {
      item.style.width = item.style.height = '';
      const icon = item.firstElementChild;
      if (icon instanceof HTMLElement) {
        icon.style.fontSize = '';
        icon.style.removeProperty('--ds-app-icon-size');
      }
    });
  }, []);
  // 关闭放大、隐藏 Dock 或切换样式时恢复静止尺寸。
  useEffect(() => {
    if (!enabled) clear();
  }, [clear, enabled]);
  useEffect(() => {
    if (!autoReveal) {
      pointerOnDock.current = false;
      cancelHide();
      return;
    }
    if (holdOpen || focusedInside) cancelHide();
    else if (revealed && !pointerOnDock.current) scheduleHide();
  }, [autoReveal, cancelHide, focusedInside, holdOpen, revealed, scheduleHide]);
  useEffect(() => {
    if (!autoReveal) return;
    const scope = footerRef.current?.closest('.ds-desktop');
    const target: EventTarget = scope ?? window;
    const readScopeRect = () => {
      if (scope instanceof HTMLElement) {
        const rect = scope.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return rect;
      }
      return {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
    };
    const handleMove = (event: Event) => {
      const mouse = event as MouseEvent;
      if ((mouse.buttons ?? 0) !== 0) return;
      const rect = readScopeRect();
      if (rect.bottom <= rect.top || rect.right <= rect.left) return;
      const inX = mouse.clientX >= rect.left && mouse.clientX <= rect.right;
      const atBottom = inX && mouse.clientY >= rect.bottom - 14 && mouse.clientY <= rect.bottom;
      if (atBottom) {
        cancelHide();
        setRevealed(true);
        return;
      }
      if (pointerOnDock.current) {
        cancelHide();
        return;
      }
      const dockNode = dock.current;
      if (dockNode) {
        const dockRect = dockNode.getBoundingClientRect();
        if (
          dockRect.width > 0 &&
          mouse.clientX >= dockRect.left - 12 &&
          mouse.clientX <= dockRect.right + 12 &&
          mouse.clientY >= dockRect.top - 18 &&
          mouse.clientY <= rect.bottom
        ) {
          cancelHide();
          return;
        }
      }
      if (revealedRef.current) scheduleHide();
    };
    const handleLeave = () => {
      pointerOnDock.current = false;
      if (revealedRef.current) scheduleHide();
    };
    target.addEventListener('mousemove', handleMove);
    target.addEventListener('mouseleave', handleLeave);
    return () => {
      target.removeEventListener('mousemove', handleMove);
      target.removeEventListener('mouseleave', handleLeave);
      pointerOnDock.current = false;
      cancelHide();
    };
  }, [autoReveal, cancelHide, scheduleHide]);
  const move = (clientX: number) => {
    if (!enabled) return;
    const items = Array.from(dock.current?.querySelectorAll<HTMLElement>('.ds-dock-item') ?? []);
    const sameItems =
      items.length === measuredItems.current.length &&
      items.every((item, index) => item === measuredItems.current[index]);
    if (!sameItems) {
      measuredItems.current = items;
      centers.current = items.map((item) => {
        const rect = item.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });
    }
    items.forEach((item, index) => {
      const center = centers.current[index];
      if (center === undefined) return;
      const distance = Math.abs(clientX - center);
      const size =
        distance > scale.range
          ? scale.base
          : scale.base + (scale.max - scale.base) * Math.cos((distance / scale.range) * (Math.PI / 2));
      item.style.width = item.style.height = `${size}px`;
      const icon = item.firstElementChild;
      if (icon instanceof HTMLElement) {
        icon.style.fontSize = `${size * 0.48}px`;
        icon.style.setProperty('--ds-app-icon-size', `${size}px`);
      }
    });
  };
  return (
    <>
      {autoReveal && !shownByAuto && (
        <div
          className="ds-dock-edge-trigger"
          aria-hidden="true"
          onMouseEnter={() => {
            cancelHide();
            setRevealed(true);
          }}
        />
      )}
      <footer
        {...rest}
        ref={footerRef}
        className={cx('ds-dock-wrap', isVisuallyHidden && 'is-hidden', autoReveal && 'is-auto-hide', className)}
        aria-label={labels.label}
        inert={isVisuallyHidden || inert || undefined}
        onPointerDownCapture={() => {
          pointerInteracting.current = true;
        }}
        onKeyDownCapture={() => {
          pointerInteracting.current = false;
        }}
        onFocus={(event) => {
          onFocus?.(event);
          const fromPointer = pointerInteracting.current;
          pointerInteracting.current = false;
          if (!autoReveal || fromPointer) return;
          cancelHide();
          setFocusedInside(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          pointerInteracting.current = false;
          if (!footerRef.current?.contains(event.relatedTarget as Node | null)) setFocusedInside(false);
        }}
      >
        <div
          ref={dock}
          className="ds-dock ds-scrollable"
          onMouseEnter={(event) => {
            if (autoReveal) {
              pointerOnDock.current = true;
              cancelHide();
            }
            move(event.clientX);
          }}
          onMouseMove={(event) => move(event.clientX)}
          onMouseLeave={() => {
            pointerOnDock.current = false;
            if (autoReveal && revealedRef.current) scheduleHide();
            clear();
          }}
        >
          {children}
        </div>
      </footer>
    </>
  );
}

export interface DockItemProps extends Omit<ComponentProps<'div'>, 'children' | 'onClick'> {
  label: string;
  /** 只让图标图形闪烁，不显示数字角标。 */
  attention?: boolean;
  /** 按当前未读数扩展辅助名称；提示文字仍使用 label。 */
  attentionLabel?: string;
  /** 应用正在运行：图标下方显示指示点。 */
  running?: boolean;
  /** 打开应用时是否执行跳动动画（默认 true；刷新页面恢复已有窗口时设为 false）。 */
  bounceOnLaunch?: boolean;
  /** 外部直接控制跳动动画（可选）。 */
  bouncing?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
  /** 图标图形，通常是 <AppIcon />。 */
  children: ReactNode;
}

/** Dock 项：图标、运行指示点和悬停提示。 */
export function DockItem({
  label,
  attention,
  attentionLabel,
  running,
  bounceOnLaunch = true,
  bouncing: controlledBouncing,
  disabled,
  onActivate,
  children,
  className,
  onKeyDown: customKeyDown,
  ...rest
}: DockItemProps) {
  // 应用由未运行变为运行（打开了新窗口）时跳动一次；首次渲染已在运行不跳；恢复已有窗口（bounceOnLaunch=false）不跳。
  const [wasRunning, setWasRunning] = useState(!!running);
  const [internalBouncing, setInternalBouncing] = useState(false);
  if (!!running !== wasRunning) {
    setWasRunning(!!running);
    if (running && bounceOnLaunch) setInternalBouncing(true);
  }
  useEffect(() => {
    if (!internalBouncing) return;
    const timer = setTimeout(() => setInternalBouncing(false), 1200);
    return () => clearTimeout(timer);
  }, [internalBouncing]);
  const bouncing = controlledBouncing ?? internalBouncing;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    customKeyDown?.(e);
    if (disabled || e.defaultPrevented || e.nativeEvent.isComposing || e.repeat) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate?.();
    }
  };
  return (
    <div
      {...rest}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={attentionLabel ?? label}
      title={label}
      className={cx(
        'ds-dock-item',
        running && 'is-running',
        bouncing && 'is-bouncing',
        attention && 'app-attention-flash',
        className,
      )}
      onClick={() => {
        if (!disabled) onActivate?.();
      }}
      onKeyDown={onKeyDown}
    >
      {children}
      <i className="ds-dock-dot" />
      <span className="ds-dock-tip">{label}</span>
    </div>
  );
}

export function DockSeparator() {
  return <div className="ds-dock-separator" role="separator" />;
}
