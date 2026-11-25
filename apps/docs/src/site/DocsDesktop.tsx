import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import {
  AccentPicker,
  AlertDialog,
  AppIcon,
  Calendar,
  ContextMenu,
  ContextMenuDivider,
  ContextMenuItem,
  ContextMenuSubmenu,
  Desktop,
  DesktopArea,
  Dock,
  DockItem,
  DockSeparator,
  LanguageSwitcher,
  MenuBar,
  MenuBarApp,
  MenuBarClock,
  MenuBarIconButton,
  MenuBarLogo,
  MenuItem,
  MenuSeparator,
  Popover,
  PopoverTitle,
  SegmentedControl,
  StartMenu,
  ThemePicker,
  WallpaperPicker,
  Window,
  appGradients,
  isDynamicWallpaper,
  useLabels,
  useMessages,
  wallpapers,
  type DesktopCardStyle,
  type StartMenuAction,
  type StartMenuItem,
  type WallpaperName,
} from '@xyzos/desk-ui';
import { docsMessages } from './locale';
import { docText } from '../blocks/docText';
import { categories, defaultPageId, findCategory, findPage, pages, pagesOf } from '../registry';
import { AppearanceWindow } from './AppearanceWindow';
import {
  APPEARANCE_APP_ID,
  appearanceAppSpec,
  buildAccentPicker,
  dockItemPixels,
  dockSizeVariables,
  dockVisibilityPatch,
  dockVisibilityValue,
  iconSizes,
  prepareLocalWallpaper,
  resolveChrome,
  type ChromeStyle,
  type DockVisibilityMode,
} from './appearance';
import { CategoryWindow } from './CategoryWindow';
import { DesktopCategoryIcons } from './DesktopCategoryIcons';
import { DocsAdmin } from './DocsAdmin';
import { useLanguage } from './LocaleProvider';
import { usePreferences } from './usePreferences';
import { useWindows } from './useWindows';

type PopoverName = 'logo' | 'control' | 'calendar' | null;

function useClock() {
  const t = useMessages(docsMessages).docs.clock;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return {
    date: t.date(now.getMonth() + 1, now.getDate(), t.weekdays[now.getDay()]!),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  };
}

/** Route hash format: #/<page-id>. */
const routeOf = () => window.location.hash.replace(/^#\/?/, '');

/**
 * Component docs browser desktop built from @xyzos/desk-ui shell components.
 * Each component category and the Appearance Settings app open as shared windows/tabs.
 */
export function DocsDesktop() {
  const [prefs, setPrefs, { dark: darkNow, reset: resetPrefs }] = usePreferences();
  const language = useLanguage();
  const docs = useMessages(docsMessages).docs;
  const menu = docs.menu;
  const wallpaperLabels = useLabels('wallpaperPicker');
  const manager = useWindows();
  const clock = useClock();
  const [popover, setPopover] = useState<PopoverName>(null);
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [context, setContext] = useState<{ x: number; y: number } | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [wallpaperBusy, setWallpaperBusy] = useState(false);
  const [wallpaperError, setWallpaperError] = useState('');
  const wallpaperInput = useRef<HTMLInputElement>(null);
  const wallpaperPickSeq = useRef(0);
  const desktopRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLButtonElement>(null);

  const dockStyle = resolveChrome(prefs.dock);
  const admin = prefs.workspaceMode === 'admin';
  const platform = resolveChrome(prefs.titlebar);
  const canHideDock = dockStyle === 'macos';
  const dockHidden = canHideDock && prefs.dockHidden;
  const hasMaximizedWindow =
    canHideDock && !admin && manager.windows.some((win) => win.maximized && !win.minimized);
  const dockAutoHide = canHideDock && !dockHidden && (prefs.dockAutoHide || hasMaximizedWindow);
  const reserveHiddenDock = dockHidden || dockAutoHide || (canHideDock && admin);

  const appearanceApp = appearanceAppSpec(menu.appearanceSettings);
  const activeWindow = manager.windows.find((w) => w.id === manager.activeId);
  const activeCategory = activeWindow ? findCategory(activeWindow.id) : undefined;
  const activeAppTitle =
    activeWindow?.id === APPEARANCE_APP_ID
      ? appearanceApp.label
      : activeCategory
        ? docText(activeCategory.name, language.current)
        : menu.desktop;

  const openWindow = manager.open;
  const openPage = useCallback(
    (pageId: string) => {
      const page = findPage(pageId);
      if (page) openWindow(page.category, page.id);
    },
    [openWindow],
  );

  const openApp = useCallback(
    (appId: string) => {
      if (appId === APPEARANCE_APP_ID) {
        openWindow(APPEARANCE_APP_ID, APPEARANCE_APP_ID);
        return;
      }
      const existing = manager.windows.find((w) => w.id === appId);
      manager.open(appId, existing?.pageId ?? pagesOf(appId)[0]?.id ?? defaultPageId);
    },
    [manager, openWindow],
  );

  const openAppearance = useCallback(() => {
    setPopover(null);
    setContext(null);
    setStartOpen(false);
    openWindow(APPEARANCE_APP_ID, APPEARANCE_APP_ID);
  }, [openWindow]);

  // Follow initial URL hash and hashchange events to reveal the target page window.
  useEffect(() => {
    openPage(findPage(routeOf()) ? routeOf() : defaultPageId);
    const onHash = () => {
      if (findPage(routeOf())) openPage(routeOf());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [openPage]);

  const selectPage = (windowId: string, pageId: string) => {
    manager.setPage(windowId, pageId);
    window.history.replaceState(null, '', `#/${pageId}`);
  };

  const togglePopover = (name: Exclude<PopoverName, null>) => setPopover((current) => (current === name ? null : name));

  const selectWallpaper = useCallback(
    (wallpaper: WallpaperName) => {
      wallpaperPickSeq.current += 1;
      setWallpaperBusy(false);
      setWallpaperError('');
      setPrefs({
        wallpaper,
        customWallpaper: '',
        customWallpaperName: '',
        ...(isDynamicWallpaper(wallpaper) ? { wallpaperMotion: true } : null),
      });
    },
    [setPrefs],
  );

  const chooseWallpaper = useCallback(() => {
    if (!wallpaperBusy) wallpaperInput.current?.click();
  }, [wallpaperBusy]);

  const handleWallpaperFile = async (file: File) => {
    const seq = ++wallpaperPickSeq.current;
    setWallpaperBusy(true);
    setWallpaperError('');
    try {
      const prepared = await prepareLocalWallpaper(file, docs.appearance.wallpaperErrors);
      if (seq !== wallpaperPickSeq.current) return;
      setPrefs({
        customWallpaper: prepared.dataUrl,
        customWallpaperName: prepared.name,
      });
    } catch (error) {
      if (seq !== wallpaperPickSeq.current) return;
      setWallpaperError(error instanceof Error ? error.message : docs.appearance.wallpaperErrors.unavailable);
    } finally {
      if (seq === wallpaperPickSeq.current) setWallpaperBusy(false);
    }
  };

  const onDesktopContext = (event: MouseEvent) => {
    if (event.defaultPrevented || (event.target as Element).closest('.ds-window, [role="menu"]')) return;
    event.preventDefault();
    setContext({ x: event.clientX, y: event.clientY });
    setPopover(null);
  };

  const accentPickerProps = buildAccentPicker(docs.accents, prefs, setPrefs);

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
    { value: 'always', label: docs.appearance.dockVisibilityModes.always },
    { value: 'auto', label: docs.appearance.dockVisibilityModes.auto },
    { value: 'hidden', label: docs.appearance.dockVisibilityModes.hidden },
  ];
  const cardStyleOptions: { value: DesktopCardStyle; label: string }[] = [
    { value: 'frosted', label: docs.cardStyles.frosted },
    { value: 'liquid', label: docs.cardStyles.liquid },
  ];

  const startItems: StartMenuItem[] = [
    ...categories.map((category) => ({
      id: category.id,
      label: docText(category.name, language.current),
      icon: <AppIcon icon={category.icon} color={category.color} shadow="tinted" />,
      keywords: pages
        .filter((page) => page.category === category.id)
        .map((page) => docText(page.title, language.current))
        .join(' '),
    })),
    {
      id: appearanceApp.id,
      label: appearanceApp.label,
      icon: <AppIcon icon={appearanceApp.icon} color={appearanceApp.color} shadow="tinted" />,
      keywords: docs.appearance.summary,
    },
  ];
  const startActions: StartMenuAction[] = [
    { id: 'about', label: menu.about, icon: 'info', onSelect: () => setAboutOpen(true) },
    { id: 'control', label: menu.controlCenter, icon: 'sliders-horizontal', onSelect: () => setPopover('control') },
    { id: 'close-all', label: menu.closeAll, icon: 'x', onSelect: manager.closeAll },
  ];

  return (
    <Desktop
      ref={desktopRef}
      className="docs-root"
      dockStyle={dockStyle}
      dockAlign={prefs.dockAlign}
      windowPlatform={platform}
      wallpaper={prefs.wallpaper}
      wallpaperUrl={prefs.customWallpaper || undefined}
      wallpaperMotion={prefs.wallpaperMotion}
      cardStyle={prefs.cardStyle}
      data-dock-hidden={reserveHiddenDock || undefined}
      style={dockSizeVariables(dockStyle, prefs.dockIconSize, reserveHiddenDock)}
    >
      <input
        ref={wallpaperInput}
        type="file"
        accept="image/*"
        aria-label={docs.appearance.wallpaperAria}
        hidden
        onChange={(event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          input.value = '';
          if (file) void handleWallpaperFile(file);
        }}
      />
      {admin ? (
        <DocsAdmin
          windows={manager.windows}
          activeId={manager.activeId}
          dark={darkNow}
          prefs={prefs}
          wallpaperBusy={wallpaperBusy}
          wallpaperError={wallpaperError}
          onChooseWallpaper={chooseWallpaper}
          onSelectWallpaper={selectWallpaper}
          onChangePrefs={setPrefs}
          onResetPrefs={resetPrefs}
          controlRef={controlRef}
          controlOpen={popover === 'control'}
          onOpenApp={openApp}
          onCloseCategory={manager.close}
          onCloseAll={manager.closeAll}
          onSelectPage={selectPage}
          onOpenPage={(pageId) => {
            openPage(pageId);
            window.history.replaceState(null, '', `#/${pageId}`);
          }}
          onToggleSidebarCollapsed={() => setPrefs({ adminSidebarCollapsed: !prefs.adminSidebarCollapsed })}
          onToggleControl={() => togglePopover('control')}
          onToggleTheme={() => setPrefs({ theme: darkNow ? 'light' : 'dark' })}
          onAbout={() => setAboutOpen(true)}
          onDesktop={() => {
            setPopover(null);
            setPrefs({ workspaceMode: 'desktop' });
          }}
        />
      ) : (
        <MenuBar
          left={
            dockStyle === 'windows' ? undefined : (
              <>
                <MenuBarLogo
                  ref={logoRef}
                  aria-label={menu.systemMenu}
                  aria-haspopup="menu"
                  aria-expanded={popover === 'logo'}
                  active={popover === 'logo'}
                  onClick={() => togglePopover('logo')}
                >
                  <AppIcon icon="component" color={appGradients.indigo} shadow="tinted" />
                </MenuBarLogo>
                <MenuBarApp>{activeAppTitle}</MenuBarApp>
              </>
            )
          }
          right={
            <>
              <MenuBarIconButton
                icon="app-window"
                label={menu.switchToAdmin}
                onClick={() => {
                  setPopover(null);
                  setPrefs({ workspaceMode: 'admin' });
                }}
              />
              {canHideDock && (
                <MenuBarIconButton
                  icon="panel-bottom-close"
                  label={prefs.dockHidden ? menu.showDock : menu.hideDock}
                  aria-pressed={prefs.dockHidden}
                  onClick={() => setPrefs({ dockHidden: !prefs.dockHidden })}
                />
              )}
              <LanguageSwitcher choice={language.choice} current={language.current} onChoiceChange={language.setChoice} />
              <MenuBarIconButton
                icon={darkNow ? 'sun' : 'moon'}
                label={menu.switchTheme}
                onClick={() => setPrefs({ theme: darkNow ? 'light' : 'dark' })}
              />
              <MenuBarIconButton
                ref={controlRef}
                icon="sliders-horizontal"
                label={menu.controlCenter}
                aria-haspopup="dialog"
                aria-expanded={popover === 'control'}
                onClick={() => togglePopover('control')}
              />
              <MenuBarClock
                ref={calendarRef}
                date={clock.date}
                time={clock.time}
                aria-haspopup="dialog"
                aria-expanded={popover === 'calendar'}
                onClick={() => togglePopover('calendar')}
              />
            </>
          }
        />
      )}

      <Popover
        anchor={logoRef}
        open={popover === 'logo' && !admin}
        align="left"
        onClose={() => setPopover(null)}
        aria-label={menu.systemMenu}
      >
        <MenuItem
          icon="info"
          onClick={() => {
            setPopover(null);
            setAboutOpen(true);
          }}
        >
          {menu.about}
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon="settings" onClick={openAppearance}>
          {menu.appearanceSettingsDots}
        </MenuItem>
        <MenuItem
          icon="sliders-horizontal"
          onClick={(event) => {
            event.preventDefault();
            setPopover('control');
          }}
        >
          {menu.controlCenterDots}
        </MenuItem>
        <MenuItem
          icon="x"
          onClick={() => {
            setPopover(null);
            manager.closeAll();
          }}
        >
          {menu.closeAll}
        </MenuItem>
      </Popover>

      <Popover
        anchor={controlRef}
        open={popover === 'control'}
        align="right"
        variant="control"
        onClose={() => setPopover(null)}
        aria-label={menu.controlCenter}
      >
        <PopoverTitle>{menu.appearance}</PopoverTitle>
        <ThemePicker value={prefs.theme} onChange={(theme) => setPrefs({ theme })} />
        {!admin && (
          <>
            <PopoverTitle>{menu.titlebarStyle}</PopoverTitle>
            <SegmentedControl
              aria-label={menu.titlebarStyleAria}
              options={chromeOptions}
              value={prefs.titlebar}
              onChange={(titlebar) => setPrefs({ titlebar })}
            />
            <PopoverTitle>{menu.dockStyle}</PopoverTitle>
            <SegmentedControl
              aria-label={menu.dockStyleAria}
              options={chromeOptions}
              value={prefs.dock}
              onChange={(dock) => setPrefs({ dock })}
            />
            {dockStyle === 'windows' ? (
              <>
                <PopoverTitle>{menu.taskbarButtons}</PopoverTitle>
                <SegmentedControl
                  aria-label={menu.taskbarButtonsAria}
                  options={dockAlignOptions}
                  value={prefs.dockAlign}
                  onChange={(dockAlign) => setPrefs({ dockAlign })}
                />
              </>
            ) : (
              <>
                <PopoverTitle>{menu.dockVisibility}</PopoverTitle>
                <SegmentedControl
                  aria-label={menu.dockVisibilityAria}
                  options={dockVisibilityOptions}
                  value={dockVisibilityValue(prefs)}
                  onChange={(mode) => setPrefs(dockVisibilityPatch(mode))}
                />
              </>
            )}
            <PopoverTitle>{menu.cardStyle}</PopoverTitle>
            <SegmentedControl
              aria-label={menu.cardStyleAria}
              options={cardStyleOptions}
              value={prefs.cardStyle}
              onChange={(cardStyle) => setPrefs({ cardStyle })}
            />
          </>
        )}
        <PopoverTitle>{menu.accentColor}</PopoverTitle>
        <AccentPicker {...accentPickerProps} />
        {!admin && (
          <>
            <PopoverTitle>{menu.wallpaper}</PopoverTitle>
            <WallpaperPicker
              value={prefs.customWallpaper ? undefined : prefs.wallpaper}
              disabled={wallpaperBusy}
              onChange={selectWallpaper}
            />
          </>
        )}
        <MenuSeparator />
        <MenuItem icon="settings" onClick={openAppearance}>
          {menu.openAppearance}
        </MenuItem>
      </Popover>

      <Popover
        anchor={calendarRef}
        open={popover === 'calendar'}
        align="right"
        variant="calendar"
        onClose={() => setPopover(null)}
        aria-label={menu.calendar}
      >
        <Calendar />
      </Popover>

      {!admin && (
        <>
          <DesktopArea
            className="docs-workarea"
            style={{
              '--ds-maximize-inset': dockStyle === 'macos' && !reserveHiddenDock ? 'var(--dock-space)' : '0px',
            } as CSSProperties}
            onContextMenu={onDesktopContext}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget && e.button === 0) setSelectedIcons([]);
            }}
            onKeyDown={(event) => {
              if (event.defaultPrevented || event.nativeEvent.isComposing || (event.target as HTMLElement).closest('.ds-window'))
                return;
              if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
              event.preventDefault();
              const rect = (event.target as HTMLElement).getBoundingClientRect();
              setPopover(null);
              setContext({ x: rect.right, y: rect.top });
            }}
          >
            {prefs.iconsVisible && (
              <DesktopCategoryIcons
                iconSize={prefs.iconSize}
                placementMode={prefs.iconPlacement}
                autoArrange={prefs.autoArrange}
                sort={prefs.iconSort}
                layout={prefs.iconLayout}
                onLayoutChange={(iconLayout) => setPrefs({ iconLayout })}
                selectedIds={selectedIcons}
                onSelectionChange={setSelectedIcons}
                onOpen={(id) => {
                  setSelectedIcons([id]);
                  openApp(id);
                }}
              />
            )}

            {manager.windows.map((win) => {
              const isAppearance = win.id === APPEARANCE_APP_ID;
              const category = isAppearance ? undefined : findCategory(win.id);
              if (!isAppearance && !category) return null;
              const title = isAppearance ? appearanceApp.label : docText(category!.name, language.current);
              const winIcon = isAppearance ? (
                <AppIcon icon={appearanceApp.icon} color={appearanceApp.color} shadow="tinted" size={16} />
              ) : (
                <AppIcon icon={category!.icon} color={category!.color} shadow="tinted" size={16} />
              );
              return (
                <Window
                  key={win.id}
                  title={title}
                  icon={winIcon}
                  scrollable={false}
                  geometry={win.geometry}
                  zIndex={win.z}
                  active={win.id === manager.activeId}
                  maximized={win.maximized}
                  minimized={win.minimized}
                  onGeometryChange={(g) => manager.move(win.id, g)}
                  onFocus={() => manager.focus(win.id)}
                  onClose={() => manager.close(win.id)}
                  onMinimize={() => manager.minimize(win.id)}
                  onToggleMaximize={() => manager.toggleMaximize(win.id)}
                >
                  {isAppearance ? (
                    <AppearanceWindow
                      prefs={prefs}
                      wallpaperBusy={wallpaperBusy}
                      wallpaperError={wallpaperError}
                      onChooseWallpaper={chooseWallpaper}
                      onSelectWallpaper={selectWallpaper}
                      onChange={setPrefs}
                      onReset={resetPrefs}
                    />
                  ) : (
                    <CategoryWindow
                      category={category!}
                      pageId={win.pageId}
                      onSelectPage={(pageId) => selectPage(win.id, pageId)}
                      onOpenPage={(pageId) => {
                        openPage(pageId);
                        window.history.replaceState(null, '', `#/${pageId}`);
                      }}
                    />
                  )}
                </Window>
              );
            })}
          </DesktopArea>

          <Dock hidden={dockHidden} autoHide={dockAutoHide} itemSize={dockItemPixels(prefs.dockIconSize)}>
            {dockStyle === 'windows' && (
              <StartMenu
                open={startOpen}
                onOpenChange={setStartOpen}
                align={prefs.dockAlign}
                items={startItems}
                onSelect={openApp}
                userName={docs.title}
                actions={startActions}
              />
            )}
            {categories.slice(0, 1).map((category) => (
              <DockItem
                key={category.id}
                label={docText(category.name, language.current)}
                running={manager.windows.some((w) => w.id === category.id)}
                onActivate={() => openApp(category.id)}
              >
                <AppIcon icon={category.icon} color={category.color} shadow="tinted" />
              </DockItem>
            ))}
            <DockSeparator />
            {categories.slice(1).map((category) => (
              <DockItem
                key={category.id}
                label={docText(category.name, language.current)}
                running={manager.windows.some((w) => w.id === category.id)}
                onActivate={() => openApp(category.id)}
              >
                <AppIcon icon={category.icon} color={category.color} shadow="tinted" />
              </DockItem>
            ))}
            <DockSeparator />
            <DockItem
              label={appearanceApp.label}
              running={manager.windows.some((w) => w.id === APPEARANCE_APP_ID)}
              onActivate={openAppearance}
            >
              <AppIcon icon={appearanceApp.icon} color={appearanceApp.color} shadow="tinted" />
            </DockItem>
          </Dock>
        </>
      )}

      {context && !admin && (
        <ContextMenu x={context.x} y={context.y} onClose={() => setContext(null)} aria-label={menu.desktopMenu}>
          <ContextMenuSubmenu label={menu.view} icon="layout-grid">
            {[...iconSizes].reverse().map((iconSize) => (
              <ContextMenuItem
                key={iconSize}
                icon="grid-2x2"
                checkRole="radio"
                checked={prefs.iconSize === iconSize}
                onClick={() => setPrefs({ iconSize })}
              >
                {docs.appearance.iconSizes[iconSize]}
              </ContextMenuItem>
            ))}
            <ContextMenuDivider />
            <ContextMenuItem
              icon="list-ordered"
              checked={prefs.autoArrange}
              onClick={() =>
                setPrefs({
                  autoArrange: !prefs.autoArrange,
                  ...(!prefs.autoArrange && prefs.iconSort !== 'manual' ? { iconLayout: [] } : null),
                })
              }
            >
              {menu.autoArrange}
            </ContextMenuItem>
            <ContextMenuItem
              icon="grid-2x2-check"
              checked={prefs.iconPlacement === 'grid'}
              onClick={() => {
                setPrefs({ iconPlacement: prefs.iconPlacement === 'grid' ? 'free' : 'grid' });
              }}
            >
              {menu.alignToGrid}
            </ContextMenuItem>
            <ContextMenuItem
              icon="monitor"
              checked={prefs.iconsVisible}
              onClick={() => setPrefs({ iconsVisible: !prefs.iconsVisible })}
            >
              {menu.showIcons}
            </ContextMenuItem>
          </ContextMenuSubmenu>
          <ContextMenuSubmenu label={menu.sortBy} icon="arrow-down-wide-narrow">
            <ContextMenuItem
              icon="arrow-down-a-z"
              checkRole="radio"
              checked={prefs.iconSort === 'name'}
              onClick={() => setPrefs({ iconSort: 'name', iconLayout: [] })}
            >
              {menu.sortName}
            </ContextMenuItem>
            <ContextMenuItem
              icon="list-ordered"
              checkRole="radio"
              checked={prefs.iconSort === 'default'}
              onClick={() => setPrefs({ iconSort: 'default', iconLayout: [] })}
            >
              {menu.sortDefault}
            </ContextMenuItem>
            <ContextMenuDivider />
            <ContextMenuItem icon="align-start-vertical" onClick={() => setPrefs({ iconLayout: [] })}>
              {menu.organizeIcons}
            </ContextMenuItem>
          </ContextMenuSubmenu>
          <ContextMenuSubmenu label={menu.desktopBackground} icon="image">
            {wallpapers.map((name) => (
              <ContextMenuItem
                key={name}
                icon="image"
                wallpaper={name}
                checkRole="radio"
                checked={!prefs.customWallpaper && prefs.wallpaper === name}
                onClick={() => selectWallpaper(name)}
              >
                {wallpaperLabels[name]}
              </ContextMenuItem>
            ))}
            <ContextMenuDivider />
            <ContextMenuItem
              icon="image-plus"
              disabled={wallpaperBusy}
              onClick={() => {
                setContext(null);
                chooseWallpaper();
              }}
            >
              {menu.chooseImage}
            </ContextMenuItem>
            {prefs.customWallpaper && (
              <ContextMenuItem
                icon="rotate-ccw"
                disabled={wallpaperBusy}
                onClick={() => selectWallpaper(prefs.wallpaper)}
              >
                {menu.usePresetWallpaper}
              </ContextMenuItem>
            )}
          </ContextMenuSubmenu>
          {canHideDock && (
            <>
              <ContextMenuDivider />
              <ContextMenuItem
                icon={prefs.dockHidden ? 'panel-bottom-open' : 'panel-bottom-close'}
                onClick={() => setPrefs({ dockHidden: !prefs.dockHidden })}
              >
                {prefs.dockHidden ? menu.expandDock : menu.collapseDock}
              </ContextMenuItem>
              <ContextMenuItem
                icon="panel-bottom-open"
                checked={prefs.dockAutoHide && !prefs.dockHidden}
                onClick={() =>
                  setPrefs({
                    dockAutoHide: !(prefs.dockAutoHide && !prefs.dockHidden),
                    dockHidden: false,
                  })
                }
              >
                {menu.autoHideDock}
              </ContextMenuItem>
            </>
          )}
          <ContextMenuDivider />
          <ContextMenuItem
            icon="palette"
            onClick={() => {
              setPrefs({ theme: darkNow ? 'light' : 'dark' });
              setContext(null);
            }}
          >
            {menu.themeAppearance(darkNow ? docs.themes.light : docs.themes.dark)}
          </ContextMenuItem>
          <ContextMenuItem icon="settings" onClick={openAppearance}>
            {menu.appearanceSettings}
          </ContextMenuItem>
          <ContextMenuItem
            icon="x"
            disabled={manager.windows.length === 0}
            onClick={() => {
              manager.closeAll();
              setContext(null);
            }}
          >
            {menu.closeAll}
          </ContextMenuItem>
        </ContextMenu>
      )}

      <AlertDialog
        open={aboutOpen}
        title={menu.about}
        message={menu.aboutMessage}
        confirmLabel={docs.themes.ok}
        onConfirm={() => setAboutOpen(false)}
      />
    </Desktop>
  );
}
