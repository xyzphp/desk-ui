import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { Icon, type IconName } from '../foundation/Icon';

/** 默认与预设的应用图标渐变：前 8 组取自原系统各应用的 color 配置，其后为补充的可选色，供应用较多时区分。 */
export const appGradients = {
  slate: 'linear-gradient(135deg,#8e9eab,#5d6d7e)',
  blue: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  indigo: 'linear-gradient(135deg,#667eea,#536dfe)',
  green: 'linear-gradient(135deg,#43e97b,#38f9d7)',
  orange: 'linear-gradient(135deg,#f6d365,#fda085)',
  pink: 'linear-gradient(135deg,#ff9a9e,#fad0c4)',
  purple: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  red: 'linear-gradient(135deg,#ff6b6b,#ee5a6f)',
  cyan: 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
  teal: 'linear-gradient(135deg,#2dd4bf,#0f9d8a)',
  amber: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
  violet: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  brown: 'linear-gradient(135deg,#b08968,#7f5539)',
  graphite: 'linear-gradient(135deg,#4b5563,#1f2937)',
} as const;

export interface AppIconAppearance {
  /** lucide 图标名称。 */
  icon?: IconName;
  /** 文字 / 符号图标（原系统的 app.icon），优先级低于 image。 */
  glyph?: string;
  /** 图片图标地址，白色圆角底板。 */
  image?: string;
  /** 渐变或纯色背景，仅用于 icon / glyph。 */
  color?: string;
  /** 透明背景的独立图标，去掉底板与圆角裁切。 */
  transparent?: boolean;
  /** 像素尺寸；缺省由容器（Dock、桌面图标）的 CSS 决定。 */
  size?: number;
  /** 图形亮度系数：0 为黑色，1 为原色，大于 1 提亮；默认 1（原色）；负数按 0 处理。 */
  brightness?: number;
  /** 阴影：default 为原站的中性阴影；tinted 取背景渐变的末端色（或 shadowColor）做同色柔和阴影。 */
  shadow?: 'default' | 'tinted';
  /** tinted 阴影的颜色，用于图片图标或背景不含十六进制色值的图标；缺省时取背景渐变末端色，图片图标无色可取则保持默认阴影。 */
  shadowColor?: string;
  /** 内部图形的像素尺寸；默认图标占底板 50%，图片占满。 */
  iconSize?: number;
  /** 内部图形相对默认尺寸（底板 50%）的缩放倍数，正数有效；iconSize 提供时优先使用 iconSize。 */
  symbolScale?: number;
  /** lucide 矢量笔画宽度（SVG 单位），默认 1.8。 */
  strokeWidth?: number;
}

interface AppIconBaseProps extends Omit<ComponentProps<'div'>, 'children' | 'onSelect' | 'color'>, AppIconAppearance {
  children?: ReactNode;
}

export interface AppIconGraphicProps extends AppIconBaseProps {
  variant?: 'graphic';
  label?: never;
  selected?: never;
  onSelect?: never;
  onOpen?: never;
  unreadCount?: never;
  attention?: never;
  unreadLabel?: never;
}

export interface AppIconDesktopProps extends AppIconBaseProps {
  variant: 'desktop';
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
  /** 可选未读数；只在桌面图标形态显示角标。 */
  unreadCount?: number;
  /** 收到新消息时闪烁图形，不改变图标背景。 */
  attention?: boolean;
  /** 覆盖包含未读数量的可访问名称。 */
  unreadLabel?: (count: number) => string;
}

export type AppIconProps = AppIconGraphicProps | AppIconDesktopProps;

type IconStyle = CSSProperties & {
  '--ds-app-icon-shadow-color'?: string;
  '--ds-app-icon-brightness'?: number | string;
  '--ds-app-icon-size'?: string;
  '--ds-app-icon-symbol-size'?: string;
  '--ds-app-icon-symbol-scale'?: number | string;
  '--desktop-icon-size'?: string;
};

function validBrightness(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) ? Math.max(0, value) : undefined;
}

/** 统一应用图标：graphic 提供装饰图形，desktop 增加名称、选中与打开行为。 */
export function AppIcon({
  variant = 'graphic',
  label,
  selected,
  onSelect,
  onOpen,
  unreadCount,
  attention,
  unreadLabel,
  icon,
  glyph,
  image,
  color = appGradients.slate,
  transparent,
  size,
  brightness,
  shadow,
  shadowColor: tint,
  iconSize,
  symbolScale,
  strokeWidth,
  children,
  className,
  style,
  onClick,
  onDoubleClick,
  onKeyDown,
  ...rest
}: AppIconProps) {
  const pixels = size !== undefined && Number.isFinite(size) && size > 0 ? Math.max(24, size) : undefined;
  const symbol = validBrightness(iconSize);
  const scale = validBrightness(symbolScale);
  const light = validBrightness(brightness);
  const labels = useLabels('appIcon');
  const unread = Number.isFinite(unreadCount) ? Math.max(0, Math.floor(unreadCount ?? 0)) : 0;
  const accessibleLabel =
    variant === 'desktop' && label && unread > 0
      ? unreadLabel?.(unread) ?? labels.unread(label, unread)
      : label;
  const iconStyle: IconStyle = {
    ...style,
    ...(pixels !== undefined
      ? {
          '--ds-app-icon-size': pixels + 'px',
          ...(variant === 'desktop' ? { '--desktop-icon-size': pixels + 'px' } : { width: pixels, height: pixels }),
        }
      : null),
    ...(symbol !== undefined ? { '--ds-app-icon-symbol-size': symbol + 'px' } : null),
    ...(scale !== undefined ? { '--ds-app-icon-symbol-scale': scale } : null),
    ...(light !== undefined ? { '--ds-app-icon-brightness': light } : null),
  };
  const shadowColor =
    shadow === 'tinted' ? (tint ?? (image ? undefined : color.match(/#[\da-f]{3,8}\b/gi)?.at(-1))) : undefined;
  const artworkClass = cx(
    'ds-app-icon',
    shadowColor && 'ds-app-icon--tinted',
    image && 'ds-app-icon--image',
    image && transparent && 'ds-app-icon--transparent',
  );
  const artworkStyle: IconStyle = {
    background: image ? (transparent ? 'transparent' : 'var(--ds-icon-image-bg)') : color,
    ...(shadowColor ? { '--ds-app-icon-shadow-color': shadowColor } : null),
  };
  const content = image ? (
    <img src={image} alt="" draggable={false} />
  ) : icon ? (
    <Icon name={icon} strokeWidth={validBrightness(strokeWidth)} />
  ) : (
    (glyph ?? '▢')
  );
  if (variant === 'graphic') {
    return (
      <div
        aria-hidden="true"
        {...rest}
        className={cx(artworkClass, 'ds-app-icon--graphic', className)}
        style={{ ...artworkStyle, ...iconStyle }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        {children ?? content}
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      aria-pressed={selected ?? false}
      title={label}
      {...rest}
      className={cx(
        'ds-desktop-icon',
        selected && 'is-selected',
        unread > 0 && 'has-app-unread',
        unread > 0 && attention && 'app-attention-flash',
        className,
      )}
      style={iconStyle}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSelect?.();
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented) onOpen?.();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.repeat) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="ds-desktop-icon-art" aria-hidden="true">
        {children ?? (
          <div className={artworkClass} style={artworkStyle} aria-hidden="true">
            {content}
          </div>
        )}
        {unread > 0 && (
          <b className="ds-app-icon-unread" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </b>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
