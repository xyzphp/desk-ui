import { useEffect, useState } from 'react';
import {
  wallpapers,
  type DesktopCardStyle,
  type DesktopIconPlacementMode,
  type ThemeChoice,
  type WallpaperName,
} from '@desk/ui';

export type ChromeStyle = 'system' | 'windows' | 'macos';

export interface Preferences {
  theme: ThemeChoice;
  titlebar: ChromeStyle;
  dock: ChromeStyle;
  cardStyle: DesktopCardStyle;
  wallpaper: WallpaperName;
  accent: string;
  iconPlacement: DesktopIconPlacementMode;
  /** desktop 为桌面形态；admin 为后台形态（左侧分类菜单 + 页签 + 内容区）。 */
  workspaceMode: 'desktop' | 'admin';
  /** Windows 任务栏里应用按钮（含开始按钮）居中或靠左。 */
  dockAlign: 'center' | 'left';
}

const KEY = 'docs-desktop-preferences';

export const defaultPreferences: Preferences = {
  theme: 'auto',
  titlebar: 'system',
  dock: 'system',
  cardStyle: 'frosted',
  wallpaper: 'sequoia',
  accent: '#0a84ff',
  iconPlacement: 'grid',
  workspaceMode: 'desktop',
  dockAlign: 'center',
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

function read(): Preferences {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Partial<Record<keyof Preferences, unknown>>;
    return {
      theme: oneOf(raw.theme, ['auto', 'light', 'dark'], defaultPreferences.theme),
      titlebar: oneOf(raw.titlebar, ['system', 'windows', 'macos'], defaultPreferences.titlebar),
      dock: oneOf(raw.dock, ['system', 'windows', 'macos'], defaultPreferences.dock),
      cardStyle: oneOf(raw.cardStyle, ['frosted', 'liquid'], defaultPreferences.cardStyle),
      wallpaper: oneOf(raw.wallpaper, wallpapers, defaultPreferences.wallpaper),
      accent: typeof raw.accent === 'string' && /^#[0-9a-f]{6}$/i.test(raw.accent) ? raw.accent : defaultPreferences.accent,
      iconPlacement: oneOf(raw.iconPlacement, ['grid', 'free'], defaultPreferences.iconPlacement),
      workspaceMode: oneOf(raw.workspaceMode, ['desktop', 'admin'], defaultPreferences.workspaceMode),
      dockAlign: oneOf(raw.dockAlign, ['center', 'left'], defaultPreferences.dockAlign),
    };
  } catch {
    return defaultPreferences;
  }
}

/** 外观偏好（主题、标题栏、Dock、壁纸、强调色、桌面 / 后台模式、任务栏对齐）。仅保存在本机浏览器，读写失败时静默回退；同时把主题与强调色写到根元素。 */
export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void] {
  const [prefs, setPrefs] = useState<Preferences>(read);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = prefs.theme === 'auto' ? (media.matches ? 'dark' : 'light') : prefs.theme;
    };
    apply();
    if (prefs.theme !== 'auto') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [prefs.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', prefs.accent);
  }, [prefs.accent]);

  const update = (patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* 存储不可用时仅保留当前会话的选择 */
      }
      return next;
    });
  };
  return [prefs, update];
}

/** 与原系统一致：Windows 平台取 Windows 风格，其余取 macOS 风格。 */
export function systemChrome(): 'windows' | 'macos' {
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /win/i.test(platform) ? 'windows' : 'macos';
}

export const resolveChrome = (style: ChromeStyle): 'windows' | 'macos' => (style === 'system' ? systemChrome() : style);
