import type { CSSProperties } from 'react';
import { appGradients } from '@xyzos/desk-ui';

export const APPEARANCE_APP_ID = 'appearance';

export function appearanceAppSpec(label: string) {
  return {
    id: APPEARANCE_APP_ID,
    label,
    icon: 'settings' as const,
    color: appGradients.slate,
  };
}

export type ChromeStyle = 'system' | 'windows' | 'macos';
export type DesktopIconSize = 'small' | 'medium' | 'large';
export type DesktopIconSort = 'default' | 'name' | 'manual';
export type FontPreset = 'apple' | 'system' | 'serif' | 'mono';
export type AccentName = 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'cyan' | 'gray';
export type SkinPresetId = 'graphite' | 'sand' | 'ocean' | 'contrast';
export type SkinId = 'default' | SkinPresetId;
export type DockVisibilityMode = 'always' | 'auto' | 'hidden';
export type AdminSidebarStyle = 'rail' | 'list';
export type AdminSidebarDensity = 'comfortable' | 'compact';

export const accentNames: readonly AccentName[] = ['blue', 'purple', 'pink', 'orange', 'green', 'cyan', 'gray'];
export const iconSizes: readonly DesktopIconSize[] = ['small', 'medium', 'large'];
export const fontValues: readonly FontPreset[] = ['apple', 'system', 'serif', 'mono'];
export const skinIds: readonly SkinId[] = ['default', 'graphite', 'sand', 'ocean', 'contrast'];

const legacyAccentHex: Record<AccentName, string> = {
  blue: '#0a84ff',
  purple: '#bf5af2',
  pink: '#ff375f',
  orange: '#ff9f0a',
  green: '#30d158',
  cyan: '#64d2ff',
  gray: '#8e8e93',
};

export const accentValue = (name: AccentName) => `var(--ds-accent-${name})`;

export const accentNameFromValue = (value: unknown): AccentName | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  const byName = accentNames.find((name) => name === normalized || `var(--ds-accent-${name})` === normalized);
  if (byName) return byName;
  return accentNames.find((name) => legacyAccentHex[name] === normalized);
};

export const fontStacks: Record<FontPreset, string> = {
  apple: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  system: "system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  serif: "'Songti SC', 'Noto Serif CJK SC', 'Source Han Serif SC', Georgia, serif",
  mono: 'var(--font-mono)',
};

export const desktopIconPixels: Record<DesktopIconSize, number> = {
  small: 44,
  medium: 56,
  large: 72,
};

const dockPixels = {
  small: { item: 44, height: 60, space: 76 },
  large: { item: 64, height: 80, space: 96 },
} as const;

const taskbarPixels = {
  small: { item: 36, icon: 24, height: 48 },
  large: { item: 52, icon: 40, height: 64 },
} as const;

/** Compute Dock / Taskbar CSS sizing variables aligned with the desktop shell presets. */
export function dockSizeVariables(
  chrome: 'windows' | 'macos',
  size: DesktopIconSize,
  hidden = false,
): CSSProperties {
  if (size === 'medium') return hidden && chrome === 'macos' ? ({ '--dock-space': '0px' } as CSSProperties) : {};
  if (chrome === 'windows') {
    const taskbar = taskbarPixels[size];
    return {
      '--dock-item': `${taskbar.item}px`,
      '--dock-icon-size': `${taskbar.icon}px`,
      '--dock-height': `${taskbar.height}px`,
      '--dock-space': `${taskbar.height}px`,
      '--system-bar-height': `${taskbar.height}px`,
    } as CSSProperties;
  }
  const dock = dockPixels[size];
  return {
    '--dock-item': `${dock.item}px`,
    '--dock-icon-size': `${dock.item}px`,
    '--dock-height': `${dock.height}px`,
    '--dock-space': hidden ? '0px' : `${dock.space}px`,
  } as CSSProperties;
}

export function dockItemPixels(size: DesktopIconSize): number {
  if (size === 'small') return dockPixels.small.item;
  if (size === 'large') return dockPixels.large.item;
  return 54;
}

export interface SkinPalette {
  window?: string;
  panel?: string;
  sidebar?: string;
  text?: string;
  textMuted?: string;
}

export interface SkinTokens {
  accent?: string;
  accents: readonly string[];
  light: SkinPalette;
  dark: SkinPalette;
  radius: number;
  shadow: number;
  border: number;
}

export const defaultSkinTokens: SkinTokens = {
  accents: [],
  light: {},
  dark: {},
  radius: 100,
  shadow: 100,
  border: 10,
};

export const skinPresets: Record<SkinPresetId, SkinTokens> = {
  graphite: {
    accents: ['#4f6bed', '#0f8a8a', '#7a5af5', '#c2410c', '#3f8f4f', '#6b7280'],
    light: { window: '#eef0f3', panel: '#fbfcfd', sidebar: '#e3e6ea', text: '#1f2328', textMuted: '#636c76' },
    dark: { window: '#16181c', panel: '#22252a', sidebar: '#1b1e22', text: '#e6e9ee', textMuted: '#9aa3ae' },
    radius: 80,
    shadow: 80,
    border: 12,
  },
  sand: {
    accent: '#c2703d',
    accents: ['#c2703d', '#a8572a', '#8a6d3b', '#7c8c4a', '#b0563f', '#5f7f8c'],
    light: { window: '#f6f1e7', panel: '#fffdf8', sidebar: '#ede5d6', text: '#2b2620', textMuted: '#7a6f60' },
    dark: { window: '#201c17', panel: '#2b2620', sidebar: '#25211b', text: '#f1eadf', textMuted: '#b0a595' },
    radius: 120,
    shadow: 90,
    border: 12,
  },
  ocean: {
    accent: '#2f80c8',
    accents: ['#2f80c8', '#1f9aa8', '#3a6ee0', '#2aa37a', '#6d5fd8', '#4a6a86'],
    light: { window: '#edf3f8', panel: '#ffffff', sidebar: '#e1ebf3', text: '#14273a', textMuted: '#5b7187' },
    dark: { window: '#101a24', panel: '#18242f', sidebar: '#142029', text: '#e3eef8', textMuted: '#93a8bb' },
    radius: 100,
    shadow: 100,
    border: 12,
  },
  contrast: {
    accents: ['#0a5cff', '#c81e1e', '#0b7a3b', '#7a1fd1', '#b35c00'],
    light: { window: '#ffffff', panel: '#ffffff', sidebar: '#f2f2f2', text: '#000000', textMuted: '#3d3d3d' },
    dark: { window: '#000000', panel: '#0d0d0d', sidebar: '#080808', text: '#ffffff', textMuted: '#c8c8c8' },
    radius: 40,
    shadow: 60,
    border: 24,
  },
};

export const skinTokensById = (id: SkinId): SkinTokens => (id === 'default' ? defaultSkinTokens : skinPresets[id]);

export const skinAccents = (tokens: SkinTokens): string[] =>
  [...new Set([...(tokens.accent ? [tokens.accent] : []), ...tokens.accents])];

export const skinAccent = (tokens: SkinTokens, choice?: string): string | undefined => {
  const palette = skinAccents(tokens);
  return choice && palette.includes(choice) ? choice : palette[0];
};

export const skinVariableNames = [
  '--bg-win',
  '--bg-glass-strong',
  '--bg-panel',
  '--bg-glass',
  '--bg-sidebar',
  '--text',
  '--hover',
  '--text-2',
  '--border',
  '--ds-radius-scale',
  '--ds-shadow-strength',
] as const;

export type SkinVariables = Partial<Record<(typeof skinVariableNames)[number], string>>;

const mix = (value: string, percent: number) => `color-mix(in srgb, ${value} ${percent}%, transparent)`;

/** Convert skin preset tokens into CSS custom properties on :root or a preview swatch. */
export function skinVariables(tokens: SkinTokens, dark: boolean): SkinVariables {
  const palette = dark ? tokens.dark : tokens.light;
  const variables: SkinVariables = {};
  if (palette.window) {
    variables['--bg-win'] = palette.window;
    variables['--bg-glass-strong'] = mix(palette.window, dark ? 88 : 86);
  }
  if (palette.panel) {
    variables['--bg-panel'] = palette.panel;
    variables['--bg-glass'] = mix(palette.panel, dark ? 55 : 62);
  }
  if (palette.sidebar) variables['--bg-sidebar'] = mix(palette.sidebar, 80);
  if (palette.text) {
    variables['--text'] = palette.text;
    variables['--hover'] = mix(palette.text, dark ? 8 : 6);
  }
  if (palette.textMuted) variables['--text-2'] = palette.textMuted;
  if (palette.text || tokens.border !== defaultSkinTokens.border)
    variables['--border'] = mix(palette.text ?? 'var(--text)', tokens.border);
  if (tokens.radius !== defaultSkinTokens.radius) variables['--ds-radius-scale'] = String(tokens.radius / 100);
  if (tokens.shadow !== defaultSkinTokens.shadow) variables['--ds-shadow-strength'] = String(tokens.shadow / 100);
  return variables;
}

export function skinPreviewVariables(tokens: SkinTokens, dark: boolean): Record<string, string> {
  const accent = skinAccent(tokens);
  return {
    '--ds-radius-scale': String(tokens.radius / 100),
    '--ds-shadow-strength': String(tokens.shadow / 100),
    ...skinVariables(tokens, dark),
    ...(accent ? { '--accent': accent } : null),
  };
}

export const dockVisibilityValue = (prefs: { dockHidden: boolean; dockAutoHide: boolean }): DockVisibilityMode =>
  prefs.dockHidden ? 'hidden' : prefs.dockAutoHide ? 'auto' : 'always';

export const dockVisibilityPatch = (mode: DockVisibilityMode) => ({
  dockHidden: mode === 'hidden',
  dockAutoHide: mode === 'auto',
});

/** Build AccentPicker props using either the active skin palette or the 7 system accents. */
export function buildAccentPicker(
  labels: Record<AccentName, string> & { skinAccent: (index: number) => string },
  prefs: { skin: SkinId; accent: AccentName; skinAccents: Partial<Record<SkinId, string>> },
  onChange: (patch: { accent?: AccentName; skinAccents?: Partial<Record<SkinId, string>> }) => void,
) {
  const tokens = skinTokensById(prefs.skin);
  const palette = skinAccents(tokens);
  if (palette.length) {
    return {
      colors: palette.map((value, index) => ({ value, label: labels.skinAccent(index + 1) })),
      value: skinAccent(tokens, prefs.skinAccents[prefs.skin]) ?? palette[0]!,
      onChange: (value: string) => onChange({ skinAccents: { ...prefs.skinAccents, [prefs.skin]: value } }),
    };
  }
  return {
    colors: accentNames.map((name) => ({ value: accentValue(name), label: labels[name] })),
    value: accentValue(prefs.accent),
    onChange: (value: string) => {
      const matched = accentNames.find((name) => accentValue(name) === value);
      if (matched) onChange({ accent: matched });
    },
  };
}

/** Detect Windows vs macOS chrome from navigator without false-matching "darwin". */
export function systemChrome(): 'windows' | 'macos' {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || '';
  return /^win/i.test(platform) || (!platform && /windows/i.test(nav.userAgent)) ? 'windows' : 'macos';
}

export const resolveChrome = (style: ChromeStyle): 'windows' | 'macos' => (style === 'system' ? systemChrome() : style);

export interface WallpaperErrorMessages {
  notImage: string;
  tooLarge: string;
  invalidSize: string;
  unavailable: string;
}

const MAX_WALLPAPER_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WALLPAPER_PIXELS = 32_000_000;
const MAX_WALLPAPER_EDGE = 1920;
const MAX_WALLPAPER_DATA_URL_LENGTH = 1_200_000;
const LOCAL_WALLPAPER_DATA_URL = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[A-Za-z0-9+/]+={0,2}$/i;

export const isLocalWallpaperDataUrl = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= MAX_WALLPAPER_DATA_URL_LENGTH && LOCAL_WALLPAPER_DATA_URL.test(value);

/**
 * Decode and downscale a locally chosen image purely in-browser (no upload) into a compact JPEG Data URL
 * suitable for immediate preview and localStorage persistence.
 */
export async function prepareLocalWallpaper(
  file: File,
  errors: WallpaperErrorMessages,
): Promise<{ dataUrl: string; name: string }> {
  if (!file.type.startsWith('image/')) throw new Error(errors.notImage);
  if (file.size > MAX_WALLPAPER_FILE_BYTES) throw new Error(errors.tooLarge);
  if (typeof createImageBitmap !== 'function') throw new Error(errors.unavailable);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(errors.notImage);
  }
  try {
    if (
      !bitmap.width ||
      !bitmap.height ||
      bitmap.width > 16000 ||
      bitmap.height > 16000 ||
      bitmap.width * bitmap.height > MAX_WALLPAPER_PIXELS
    ) {
      throw new Error(errors.invalidSize);
    }
    const scale = Math.min(1, MAX_WALLPAPER_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error(errors.unavailable);
    context.fillStyle = 'rgb(245, 245, 247)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.76, 0.64, 0.52]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (isLocalWallpaperDataUrl(dataUrl)) {
        return { dataUrl, name: file.name };
      }
    }
    throw new Error(errors.tooLarge);
  } finally {
    bitmap.close();
  }
}
