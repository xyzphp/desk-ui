import { createContext, useContext, type ComponentProps } from 'react';
import { cx } from '../foundation/cx';
import { WallpaperFlow } from './WallpaperScene';
import { sceneWallpaperNames, type SceneWallpaperName } from './wallpapers/names';
import { SceneWallpaper } from './wallpapers/SceneWallpaper';

export type DockStyle = 'macos' | 'windows';
export type WindowPlatform = 'macos' | 'windows';
export type DesktopCardStyle = 'frosted' | 'liquid';
export type { SceneWallpaperName };
export type WallpaperName = 'sequoia' | 'sonoma' | 'aurora' | 'dusk' | SceneWallpaperName;

/**
 * 内置壁纸名称；显示名称来自 ConfigProvider 的 wallpaperPicker 文案。
 * 前四个是渐变预设；aquarium / forest / grassland / galaxy 是按需加载的手绘画作动态场景。
 */
export const wallpapers: readonly WallpaperName[] = ['sequoia', 'sonoma', 'aurora', 'dusk', ...sceneWallpaperNames];

/** 手绘画作 + SVG / Canvas 动画的场景壁纸（水族馆、森林、草原、星空），昼夜跟随深色主题。 */
export const isSceneWallpaper = (name: WallpaperName): name is SceneWallpaperName =>
  (sceneWallpaperNames as readonly string[]).includes(name);

/** 自带场景的动态壁纸（即画作场景）：选中时宿主通常一并开启动态效果。 */
export const isDynamicWallpaper = (name: WallpaperName) => isSceneWallpaper(name);

/** 宿主给出的壁纸图片仅允许同源根路径，或本地安全光栅图片 Data URL / Blob URL。 */
export function wallpaperImage(url?: string) {
  if (!url) return undefined;
  if (/^\/(?![\/\\])[^\u0000-\u0020"'\\]*$/.test(url)) return `url("${url}")`;
  if (/^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(url)) return `url("${url}")`;
  if (/^blob:(?:null|https?:\/\/[^\u0000-\u0020"'\\()<>]+)\/[0-9a-z-]+$/i.test(url)) return `url("${url}")`;
  return undefined;
}

interface DesktopContextValue {
  windowPlatform: WindowPlatform;
  dockStyle: DockStyle;
  cardStyle: DesktopCardStyle;
}

const DesktopContext = createContext<DesktopContextValue>({
  windowPlatform: 'macos',
  dockStyle: 'macos',
  cardStyle: 'frosted',
});

/** 读取最近的 Desktop 配置（窗口标题栏平台、Dock 样式、桌面卡片样式）。 */
export function useDesktop(): DesktopContextValue {
  return useContext(DesktopContext);
}

export interface DesktopProps extends ComponentProps<'div'> {
  /** Dock / 菜单栏样式：macOS 悬浮 Dock，Windows 底部任务栏。 */
  dockStyle?: DockStyle;
  /** 窗口标题栏样式；缺省跟随 dockStyle。 */
  windowPlatform?: WindowPlatform;
  /** Windows 任务栏里应用按钮（含开始按钮）的位置：居中（默认）或靠左；仅 dockStyle="windows" 生效。 */
  dockAlign?: 'center' | 'left';
  /** 桌面卡片及工作区玻璃样式：默认 frosted（毛玻璃），liquid 为液态玻璃。 */
  cardStyle?: DesktopCardStyle;
  wallpaper?: WallpaperName;
  /** 同源图片路径，或本地安全光栅图片 Data URL / Blob URL，预设壁纸作为回退。 */
  wallpaperUrl?: string;
  /**
   * 动态壁纸：渐变预设叠加变形光斑与摆动色带，图片壁纸缓慢推移；水族馆、森林、草原、星空是手绘画作上的动画层
   * （摆尾的鱼群与气泡、雾、水波、草浪、牛羊、星星与流星）。水族馆的鱼躲开指针，点击桌面空白处惊散鱼群、冒出气泡；
   * 森林随指针视差、散出光点，划过湖面泛起涟漪。
   * 关闭时场景壁纸仍显示完整画面但静止；系统要求减弱动态效果时一律静止。
   */
  wallpaperMotion?: boolean;
}

/**
 * 桌面根容器：壁纸、壳层样式变量和窗口平台。对应原系统的 body + #wallpaper。
 * 内部的 MenuBar、Dock、弹层使用 position: fixed，会相对本容器定位，所以可铺满页面，也可放进示例舞台。
 */
export function Desktop({
  dockStyle = 'macos',
  windowPlatform,
  dockAlign,
  cardStyle = 'frosted',
  wallpaper = 'sequoia',
  wallpaperUrl,
  wallpaperMotion,
  className,
  children,
  ...rest
}: DesktopProps) {
  const platform = windowPlatform ?? dockStyle;
  return (
    <DesktopContext.Provider value={{ windowPlatform: platform, dockStyle, cardStyle }}>
      <div
        className={cx('ds-desktop', 'ds-scrollable', className)}
        data-dock-style={dockStyle}
        data-window-platform={platform}
        data-dock-align={dockStyle === 'windows' && dockAlign === 'left' ? 'left' : undefined}
        data-card-style={cardStyle}
        {...rest}
      >
        <Wallpaper name={wallpaper} url={wallpaperUrl} motion={wallpaperMotion} />
        {children}
      </div>
    </DesktopContext.Provider>
  );
}

export interface WallpaperProps extends Omit<ComponentProps<'div'>, 'children'> {
  name?: WallpaperName;
  /** 同源图片路径，或本地安全光栅图片 Data URL / Blob URL；有图片时显示图片，预设壁纸作为回退。 */
  url?: string;
  /** 同 Desktop 的 wallpaperMotion。 */
  motion?: boolean;
}

/**
 * 壁纸层：预设渐变、画作场景或宿主图片。Desktop 内部使用，也可单独铺在登录页等全屏背景里；
 * 指针交互只在 .ds-desktop 或带 data-wallpaper-scope 的祖先范围内生效。
 */
export function Wallpaper({ name = 'sequoia', url, motion, className, style, ...rest }: WallpaperProps) {
  const image = wallpaperImage(url);
  return (
    <div
      className={cx('ds-wallpaper', `ds-wp-${name}`, motion && 'is-animated', image && 'has-image', className)}
      style={image ? { ...style, backgroundImage: image } : style}
      {...rest}
    >
      {!image && isSceneWallpaper(name) && <SceneWallpaper name={name} animated={!!motion} />}
      {!image && !isDynamicWallpaper(name) && motion && <WallpaperFlow />}
    </div>
  );
}

/** 菜单栏下方的工作区域，放桌面图标与窗口。 */
export function DesktopArea({ className, ...rest }: ComponentProps<'main'>) {
  return <main className={cx('ds-desktop-area', className)} {...rest} />;
}

/** 桌面图标容器：纵向排列、满列换行（原系统由脚本记录每个图标的网格位置）。 */
export function DesktopIcons({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('ds-desktop-icons', 'ds-scrollable', className)} {...rest} />;
}
