import { useEffect, useState } from 'react';
import {
  wallpapers,
  type DesktopCardStyle,
  type DesktopIconPlacementMode,
  type GridPlacement,
  type ThemeChoice,
  type WallpaperName,
} from '@xyzos/desk-ui';
import {
  accentNameFromValue,
  accentNames,
  accentValue,
  fontStacks,
  fontValues,
  iconSizes,
  isLocalWallpaperDataUrl,
  resolveChrome,
  skinAccent,
  skinAccents,
  skinIds,
  skinTokensById,
  skinVariableNames,
  skinVariables,
  systemChrome,
  type AccentName,
  type AdminSidebarDensity,
  type AdminSidebarStyle,
  type ChromeStyle,
  type DesktopIconSize,
  type DesktopIconSort,
  type FontPreset,
  type SkinId,
} from './appearance';

export { resolveChrome, systemChrome, type ChromeStyle };

export interface Preferences {
  theme: ThemeChoice;
  titlebar: ChromeStyle;
  dock: ChromeStyle;
  dockHidden: boolean;
  dockAutoHide: boolean;
  dockIconSize: DesktopIconSize;
  cardStyle: DesktopCardStyle;
  wallpaper: WallpaperName;
  wallpaperMotion: boolean;
  customWallpaper: string;
  customWallpaperName: string;
  accent: AccentName;
  font: FontPreset;
  skin: SkinId;
  skinAccents: Partial<Record<SkinId, string>>;
  iconSize: DesktopIconSize;
  iconPlacement: DesktopIconPlacementMode;
  autoArrange: boolean;
  iconsVisible: boolean;
  iconSort: DesktopIconSort;
  iconLayout: GridPlacement[];
  /** desktop for desktop shell; admin for admin shell (left sidebar + tabs + doc page). */
  workspaceMode: 'desktop' | 'admin';
  dockAlign: 'center' | 'left';
  adminSidebar: AdminSidebarStyle;
  adminSidebarDensity: AdminSidebarDensity;
  adminSidebarCollapsed: boolean;
  adminTabs: boolean;
}

const KEY = 'docs-desktop-preferences';

export const defaultPreferences: Preferences = {
  theme: 'auto',
  titlebar: 'system',
  dock: 'system',
  dockHidden: false,
  dockAutoHide: false,
  dockIconSize: 'medium',
  cardStyle: 'frosted',
  wallpaper: 'sequoia',
  wallpaperMotion: true,
  customWallpaper: '',
  customWallpaperName: '',
  accent: 'blue',
  font: 'apple',
  skin: 'default',
  skinAccents: {},
  iconSize: 'medium',
  iconPlacement: 'grid',
  autoArrange: false,
  iconsVisible: true,
  iconSort: 'default',
  iconLayout: [],
  workspaceMode: 'desktop',
  dockAlign: 'center',
  adminSidebar: 'rail',
  adminSidebarDensity: 'comfortable',
  adminSidebarCollapsed: false,
  adminTabs: true,
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

const bool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

function readSkinAccents(raw: unknown): Partial<Record<SkinId, string>> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Partial<Record<SkinId, string>> = {};
  for (const [id, color] of Object.entries(raw as Record<string, unknown>)) {
    if (!(skinIds as readonly string[]).includes(id) || id === 'default') continue;
    if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) {
      result[id as SkinId] = color.toLowerCase();
    }
  }
  return result;
}

function readIconLayout(raw: unknown): GridPlacement[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is GridPlacement => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.column === 'number' &&
      Number.isFinite(candidate.column) &&
      typeof candidate.row === 'number' &&
      Number.isFinite(candidate.row)
    );
  });
}

function read(): Preferences {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Partial<Record<keyof Preferences, unknown>>;
    const customWallpaper = isLocalWallpaperDataUrl(raw.customWallpaper) ? raw.customWallpaper : '';
    const customWallpaperName =
      customWallpaper && typeof raw.customWallpaperName === 'string' ? raw.customWallpaperName.slice(0, 120) : '';
    return {
      theme: oneOf(raw.theme, ['auto', 'light', 'dark'], defaultPreferences.theme),
      titlebar: oneOf(raw.titlebar, ['system', 'windows', 'macos'], defaultPreferences.titlebar),
      dock: oneOf(raw.dock, ['system', 'windows', 'macos'], defaultPreferences.dock),
      dockHidden: bool(raw.dockHidden, defaultPreferences.dockHidden),
      dockAutoHide: bool(raw.dockAutoHide, defaultPreferences.dockAutoHide),
      dockIconSize: oneOf(raw.dockIconSize, iconSizes, defaultPreferences.dockIconSize),
      cardStyle: oneOf(raw.cardStyle, ['frosted', 'liquid'], defaultPreferences.cardStyle),
      wallpaper: oneOf(raw.wallpaper, wallpapers, defaultPreferences.wallpaper),
      wallpaperMotion: bool(raw.wallpaperMotion, defaultPreferences.wallpaperMotion),
      customWallpaper,
      customWallpaperName,
      accent: accentNameFromValue(raw.accent) ?? oneOf(raw.accent, accentNames, defaultPreferences.accent),
      font: oneOf(raw.font, fontValues, defaultPreferences.font),
      skin: oneOf(raw.skin, skinIds, defaultPreferences.skin),
      skinAccents: readSkinAccents(raw.skinAccents),
      iconSize: oneOf(raw.iconSize, iconSizes, defaultPreferences.iconSize),
      iconPlacement: oneOf(raw.iconPlacement, ['grid', 'free'], defaultPreferences.iconPlacement),
      autoArrange: bool(raw.autoArrange, defaultPreferences.autoArrange),
      iconsVisible: bool(raw.iconsVisible, defaultPreferences.iconsVisible),
      iconSort: oneOf(raw.iconSort, ['default', 'name', 'manual'], defaultPreferences.iconSort),
      iconLayout: readIconLayout(raw.iconLayout),
      workspaceMode: oneOf(raw.workspaceMode, ['desktop', 'admin'], defaultPreferences.workspaceMode),
      dockAlign: oneOf(raw.dockAlign, ['center', 'left'], defaultPreferences.dockAlign),
      adminSidebar: oneOf(raw.adminSidebar, ['rail', 'list'], defaultPreferences.adminSidebar),
      adminSidebarDensity: oneOf(raw.adminSidebarDensity, ['comfortable', 'compact'], defaultPreferences.adminSidebarDensity),
      adminSidebarCollapsed: bool(raw.adminSidebarCollapsed, defaultPreferences.adminSidebarCollapsed),
      adminTabs: bool(raw.adminTabs, defaultPreferences.adminTabs),
    };
  } catch {
    return defaultPreferences;
  }
}

export interface PreferencesActions {
  dark: boolean;
  reset: () => void;
}

/**
 * Local appearance preferences persisted in localStorage, syncing theme, accent,
 * font family, and built-in visual skin variables to the document root.
 */
export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void, PreferencesActions] {
  const [prefs, setPrefs] = useState<Preferences>(read);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const dark = prefs.theme === 'dark' || (prefs.theme === 'auto' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = dark ? 'dark' : 'light';
    const skin = skinTokensById(prefs.skin);
    const variables = skinVariables(skin, dark);
    for (const name of skinVariableNames) {
      const value = variables[name];
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    }
    const palette = skinAccents(skin);
    const activeAccent = palette.length
      ? (skinAccent(skin, prefs.skinAccents[prefs.skin]) ?? palette[0]!)
      : accentValue(prefs.accent);
    root.style.setProperty('--accent', activeAccent);
    root.style.setProperty('--font', fontStacks[prefs.font]);
  }, [dark, prefs.accent, prefs.font, prefs.skin, prefs.skinAccents]);

  const persist = (next: Preferences) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // If custom wallpaper pushes past browser quota, keep it in session memory while persisting other settings.
      if (next.customWallpaper) {
        try {
          window.localStorage.setItem(
            KEY,
            JSON.stringify({ ...next, customWallpaper: '', customWallpaperName: '' }),
          );
        } catch {
          /* Storage unavailable: keep session state only */
        }
      }
    }
  };

  const update = (patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setPrefs(defaultPreferences);
    persist(defaultPreferences);
  };

  return [prefs, update, { dark, reset }];
}
