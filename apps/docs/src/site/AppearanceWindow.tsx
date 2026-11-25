import { useState } from 'react';
import {
  AccentPicker,
  AppLayout,
  AppMain,
  Button,
  HelpTip,
  NavItem,
  NavSidebar,
  Notice,
  SegmentedControl,
  Select,
  SettingsRow,
  Stack,
  Switch,
  ThemePicker,
  Wallpaper,
  WallpaperPicker,
  useLabels,
  useMessages,
  type DesktopCardStyle,
  type WallpaperName,
} from '@xyzos/desk-ui';
import {
  buildAccentPicker,
  dockVisibilityPatch,
  dockVisibilityValue,
  fontValues,
  iconSizes,
  resolveChrome,
  skinIds,
  skinPreviewVariables,
  skinTokensById,
  type AdminSidebarDensity,
  type AdminSidebarStyle,
  type ChromeStyle,
  type DesktopIconSize,
  type DockVisibilityMode,
  type FontPreset,
} from './appearance';
import { docsMessages } from './locale';
import type { Preferences } from './usePreferences';

type AppearanceSection = 'all' | 'general' | 'desktop' | 'admin';

export interface AppearanceWindowProps {
  prefs: Preferences;
  wallpaperBusy: boolean;
  wallpaperError: string;
  onChooseWallpaper: () => void;
  onSelectWallpaper: (wallpaper: WallpaperName) => void;
  onChange: (patch: Partial<Preferences>) => void;
  onReset: () => void;
}

const previewModes = ['light', 'dark'] as const;

/**
 * In-window / in-tab Appearance Settings app reusing @xyzos/desk-ui AppLayout and NavSidebar,
 * matching CategoryWindow and the desktop System Settings experience.
 */
export function AppearanceWindow({
  prefs,
  wallpaperBusy,
  wallpaperError,
  onChooseWallpaper,
  onSelectWallpaper,
  onChange,
  onReset,
}: AppearanceWindowProps) {
  const docs = useMessages(docsMessages).docs;
  const t = docs.appearance;
  const sidebarLabels = useLabels('adminSidebar');
  const wallpaperLabels = useLabels('wallpaperPicker');
  const [section, setSection] = useState<AppearanceSection>('all');

  const dockStyle = resolveChrome(prefs.dock);
  const accentPickerProps = buildAccentPicker(docs.accents, prefs, onChange);

  const chromeOptions: { value: ChromeStyle; label: string }[] = [
    { value: 'system', label: docs.themes.system },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
  ];
  const dockAlignOptions: { value: 'center' | 'left'; label: string }[] = [
    { value: 'center', label: docs.dockAlign.center },
    { value: 'left', label: docs.dockAlign.left },
  ];
  const dockVisibilityOptions: { value: DockVisibilityMode; label: string }[] = [
    { value: 'always', label: t.dockVisibilityModes.always },
    { value: 'auto', label: t.dockVisibilityModes.auto },
    { value: 'hidden', label: t.dockVisibilityModes.hidden },
  ];
  const sizeOptions: { value: DesktopIconSize; label: string }[] = iconSizes.map((value) => ({
    value,
    label: t.sizes[value],
  }));
  const cardStyleOptions: { value: DesktopCardStyle; label: string }[] = [
    { value: 'frosted', label: docs.cardStyles.frosted },
    { value: 'liquid', label: docs.cardStyles.liquid },
  ];
  const adminSidebarOptions: { value: AdminSidebarStyle; label: string }[] = [
    { value: 'rail', label: t.adminSidebars.rail },
    { value: 'list', label: t.adminSidebars.list },
  ];
  const adminDensityOptions: { value: AdminSidebarDensity; label: string }[] = [
    { value: 'comfortable', label: sidebarLabels.comfortable },
    { value: 'compact', label: sidebarLabels.compact },
  ];

  const wallpaperLabel = prefs.customWallpaper
    ? prefs.customWallpaperName || t.customWallpaper
    : wallpaperLabels[prefs.wallpaper];

  const showGeneral = section === 'all' || section === 'general';
  const showDesktop = section === 'all' || section === 'desktop';
  const showAdmin = section === 'all' || section === 'admin';

  return (
    <AppLayout>
      <NavSidebar
        title={t.title}
        aria-label={t.sectionsAria}
        footer={
          <Button className="docs-appearance-reset" icon="rotate-ccw" onClick={onReset}>
            {t.resetDefaults}
          </Button>
        }
      >
        <NavItem icon="sliders-horizontal" current={section === 'all'} onClick={() => setSection('all')}>
          {t.sections.all}
        </NavItem>
        <NavItem icon="palette" current={section === 'general'} onClick={() => setSection('general')}>
          {t.sections.general}
        </NavItem>
        <NavItem icon="monitor" current={section === 'desktop'} onClick={() => setSection('desktop')}>
          {t.sections.desktop}
        </NavItem>
        <NavItem icon="columns-3" current={section === 'admin'} onClick={() => setSection('admin')}>
          {t.sections.admin}
        </NavItem>
      </NavSidebar>
      <AppMain>
        <div className="docs-window-scroll ds-scrollable">
          <div className="docs-content docs-appearance-stack">
            {showGeneral && (
              <>
                <section className="docs-settings-group" aria-labelledby="docs-appearance-general">
                  <div className="docs-settings-group-head">
                    <h3 id="docs-appearance-general">{t.general}</h3>
                  </div>
                  <Stack gap="sm">
                    <SettingsRow label={t.theme}>
                      <ThemePicker variant="settings" value={prefs.theme} onChange={(theme) => onChange({ theme })} />
                    </SettingsRow>
                    <SettingsRow label={t.accent}>
                      <AccentPicker variant="settings" {...accentPickerProps} />
                    </SettingsRow>
                    <SettingsRow label={t.systemFont}>
                      <Select
                        className="docs-settings-font"
                        aria-label={t.systemFont}
                        value={prefs.font}
                        onChange={(event) => onChange({ font: event.currentTarget.value as FontPreset })}
                      >
                        {fontValues.map((font) => (
                          <option key={font} value={font}>
                            {t.fonts[font]}
                          </option>
                        ))}
                      </Select>
                    </SettingsRow>
                  </Stack>
                </section>

                <section className="docs-settings-group" aria-labelledby="docs-appearance-skin">
                  <div className="docs-settings-group-head">
                    <h3 id="docs-appearance-skin">{t.skin}</h3>
                    <HelpTip text={t.skinHint} />
                  </div>
                  <div className="docs-skin-grid" role="group" aria-label={t.skin}>
                    {skinIds.map((id) => {
                      const tokens = skinTokensById(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          className="docs-skin-tile"
                          aria-pressed={prefs.skin === id}
                          onClick={() => onChange({ skin: id })}
                        >
                          <span className="docs-skin-swatch" aria-hidden="true">
                            {previewModes.map((mode) => (
                              <span key={mode} data-theme={mode} style={skinPreviewVariables(tokens, mode === 'dark')}>
                                <i />
                              </span>
                            ))}
                          </span>
                          <span>{t.skinPresets[id]}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {showDesktop && (
              <section className="docs-settings-group" aria-labelledby="docs-appearance-desktop">
                <div className="docs-settings-group-head">
                  <h3 id="docs-appearance-desktop">{t.desktopTitle}</h3>
                </div>
                <Stack gap="sm">
                  <SettingsRow label={t.titlebar}>
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.titlebar}
                      options={chromeOptions}
                      value={prefs.titlebar}
                      onChange={(titlebar) => onChange({ titlebar })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.dock}>
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.dock}
                      options={chromeOptions}
                      value={prefs.dock}
                      onChange={(dock) => onChange({ dock })}
                    />
                  </SettingsRow>
                  {dockStyle === 'windows' ? (
                    <SettingsRow label={t.taskbarAlign}>
                      <SegmentedControl
                        variant="settings"
                        aria-label={t.taskbarAlign}
                        options={dockAlignOptions}
                        value={prefs.dockAlign}
                        onChange={(dockAlign) => onChange({ dockAlign })}
                      />
                    </SettingsRow>
                  ) : (
                    <SettingsRow label={t.dockVisibility}>
                      <HelpTip text={t.dockVisibilityHint} />
                      <SegmentedControl
                        variant="settings"
                        aria-label={t.dockVisibility}
                        options={dockVisibilityOptions}
                        value={dockVisibilityValue(prefs)}
                        onChange={(mode) => onChange(dockVisibilityPatch(mode))}
                      />
                    </SettingsRow>
                  )}
                  <SettingsRow label={t.dockIconSize}>
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.dockIconSize}
                      options={sizeOptions}
                      value={prefs.dockIconSize}
                      onChange={(dockIconSize) => onChange({ dockIconSize })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.iconSize}>
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.iconSize}
                      options={sizeOptions}
                      value={prefs.iconSize}
                      onChange={(iconSize) => onChange({ iconSize })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.showIcons}>
                    <Switch
                      aria-label={t.showIcons}
                      checked={prefs.iconsVisible}
                      onCheckedChange={(iconsVisible) => onChange({ iconsVisible })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.alignToGrid}>
                    <Switch
                      aria-label={t.alignToGrid}
                      checked={prefs.iconPlacement === 'grid'}
                      onCheckedChange={(aligned) => onChange({ iconPlacement: aligned ? 'grid' : 'free' })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.autoArrange}>
                    <Switch
                      aria-label={t.autoArrange}
                      checked={prefs.autoArrange}
                      onCheckedChange={(autoArrange) =>
                        onChange({
                          autoArrange,
                          ...(autoArrange && prefs.iconSort !== 'manual' ? { iconLayout: [] } : null),
                        })
                      }
                    />
                  </SettingsRow>
                  <SettingsRow
                    label={t.wallpaper}
                    layout="stacked"
                    actions={
                      <>
                        {prefs.customWallpaper && prefs.customWallpaperName && (
                          <span className="docs-settings-filename" title={prefs.customWallpaperName}>
                            {prefs.customWallpaperName}
                          </span>
                        )}
                        <Button icon="image-plus" disabled={wallpaperBusy} onClick={onChooseWallpaper}>
                          {t.addImage}
                        </Button>
                        {prefs.customWallpaper && (
                          <Button
                            icon="rotate-ccw"
                            disabled={wallpaperBusy}
                            onClick={() => onSelectWallpaper(prefs.wallpaper)}
                          >
                            {t.resetPreset}
                          </Button>
                        )}
                      </>
                    }
                  >
                    <WallpaperPicker
                      value={prefs.customWallpaper ? undefined : prefs.wallpaper}
                      disabled={wallpaperBusy}
                      onChange={onSelectWallpaper}
                      custom={{
                        url: prefs.customWallpaper || undefined,
                        onClick: onChooseWallpaper,
                      }}
                    />
                    {wallpaperError && <Notice tone="error">{wallpaperError}</Notice>}
                    <div
                      className="docs-wallpaper-preview"
                      data-card-style={prefs.cardStyle}
                      role="img"
                      aria-label={`${t.wallpaperPreview}: ${wallpaperLabel}`}
                    >
                      <Wallpaper
                        name={prefs.wallpaper}
                        url={prefs.customWallpaper || undefined}
                        motion={prefs.wallpaperMotion}
                      />
                      <div className="docs-wallpaper-preview-chrome" aria-hidden="true">
                        <span className="docs-wallpaper-preview-badge">{wallpaperLabel}</span>
                        <div className="docs-wallpaper-preview-card">
                          <span className="docs-wallpaper-preview-dot" />
                          <span className="docs-wallpaper-preview-line" />
                        </div>
                      </div>
                    </div>
                  </SettingsRow>
                  <SettingsRow label={t.wallpaperMotion}>
                    <HelpTip text={t.wallpaperMotionHint} />
                    <Switch
                      aria-label={t.wallpaperMotion}
                      checked={prefs.wallpaperMotion}
                      onCheckedChange={(wallpaperMotion) => onChange({ wallpaperMotion })}
                    />
                  </SettingsRow>
                  <SettingsRow label={t.cardStyle}>
                    <HelpTip text={t.cardStyleHint} />
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.cardStyle}
                      options={cardStyleOptions}
                      value={prefs.cardStyle}
                      onChange={(cardStyle) => onChange({ cardStyle })}
                    />
                  </SettingsRow>
                </Stack>
              </section>
            )}

            {showAdmin && (
              <section className="docs-settings-group" aria-labelledby="docs-appearance-admin">
                <div className="docs-settings-group-head">
                  <h3 id="docs-appearance-admin">{t.adminTitle}</h3>
                </div>
                <Stack gap="sm">
                  <SettingsRow label={t.adminSidebar}>
                    <SegmentedControl
                      variant="settings"
                      aria-label={t.adminSidebar}
                      options={adminSidebarOptions}
                      value={prefs.adminSidebar}
                      onChange={(adminSidebar) => onChange({ adminSidebar })}
                    />
                  </SettingsRow>
                  {prefs.adminSidebar === 'list' && (
                    <>
                      <SettingsRow label={sidebarLabels.density}>
                        <SegmentedControl
                          variant="settings"
                          aria-label={sidebarLabels.density}
                          options={adminDensityOptions}
                          value={prefs.adminSidebarDensity}
                          onChange={(adminSidebarDensity) => onChange({ adminSidebarDensity })}
                        />
                      </SettingsRow>
                      <SettingsRow label={t.adminSidebarCollapsed}>
                        <Switch
                          aria-label={t.adminSidebarCollapsed}
                          checked={prefs.adminSidebarCollapsed}
                          onCheckedChange={(adminSidebarCollapsed) => onChange({ adminSidebarCollapsed })}
                        />
                      </SettingsRow>
                    </>
                  )}
                  <SettingsRow label={t.adminTabs}>
                    <Switch
                      aria-label={t.adminTabs}
                      checked={prefs.adminTabs}
                      onCheckedChange={(adminTabs) => onChange({ adminTabs })}
                    >
                      {t.show}
                    </Switch>
                  </SettingsRow>
                </Stack>
              </section>
            )}
          </div>
        </div>
      </AppMain>
    </AppLayout>
  );
}
