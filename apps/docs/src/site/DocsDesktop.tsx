import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  AccentPicker, AppIcon, Calendar, ContextMenu, ContextMenuDivider, ContextMenuItem, ContextMenuSubmenu, Desktop, DesktopArea,
  Dock, DockItem, DockSeparator, MenuBar, MenuBarApp, MenuBarClock, MenuBarIconButton, MenuBarLogo, MenuItem,
  MenuSeparator, Popover, PopoverTitle, SegmentedControl, AlertDialog, StartMenu, ThemePicker, WallpaperPicker, Window, appGradients,
  LanguageSwitcher, useLabels, useMessages, type DesktopCardStyle, type StartMenuAction, type StartMenuItem,
  wallpapers,
} from '@desk/ui';
import { docsMessages } from './locale';
import { docText } from '../blocks/docText';
import { categories, defaultPageId, findCategory, findPage, pages, pagesOf } from '../registry';
import { CategoryWindow } from './CategoryWindow';
import { DesktopCategoryIcons } from './DesktopCategoryIcons';
import { DocsAdmin } from './DocsAdmin';
import { useLanguage } from './LocaleProvider';
import { resolveChrome, usePreferences, type ChromeStyle } from './usePreferences';
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

/** 路由格式：#/<页面 id>。 */
const routeOf = () => window.location.hash.replace(/^#\/?/, '');

/**
 * 组件库文档桌面：壁纸、菜单栏、桌面图标、Dock、窗口、控制中心组成的浏览器桌面。
 * 每个组件分类是一个应用图标，打开后在窗口里浏览该分类的文档；整个壳层由 @desk/ui 的组件搭成。
 */
export function DocsDesktop() {
  const [prefs, setPrefs] = usePreferences();
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
  const desktopRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLButtonElement>(null);

  const dockStyle = resolveChrome(prefs.dock);
  const admin = prefs.workspaceMode === 'admin';
  const platform = resolveChrome(prefs.titlebar);
  const activeWindow = manager.windows.find((w) => w.id === manager.activeId);
  const activeCategory = activeWindow ? findCategory(activeWindow.id) : undefined;

  const openWindow = manager.open;
  const openPage = useCallback((pageId: string) => {
    const page = findPage(pageId);
    if (page) openWindow(page.category, page.id);
  }, [openWindow]);

  const openCategory = (categoryId: string) => {
    const existing = manager.windows.find((w) => w.id === categoryId);
    manager.open(categoryId, existing?.pageId ?? pagesOf(categoryId)[0]?.id ?? defaultPageId);
  };

  // 首次进入与地址栏哈希变化：打开对应页面所在的窗口；没有哈希时展示使用指南概览。
  useEffect(() => {
    openPage(findPage(routeOf()) ? routeOf() : defaultPageId);
    const onHash = () => { if (findPage(routeOf())) openPage(routeOf()); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [openPage]);

  const selectPage = (windowId: string, pageId: string) => {
    manager.setPage(windowId, pageId);
    window.history.replaceState(null, '', `#/${pageId}`);
  };

  const togglePopover = (name: Exclude<PopoverName, null>) => setPopover((current) => (current === name ? null : name));

  const onDesktopContext = (event: MouseEvent) => {
    if (event.defaultPrevented || (event.target as Element).closest('.ds-window, [role="menu"]')) return;
    event.preventDefault();
    setContext({ x: event.clientX, y: event.clientY });
    setPopover(null);
  };

  const darkNow = prefs.theme === 'dark' || (prefs.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const accents = [
    { value: '#0a84ff', label: docs.accents.blue },
    { value: '#bf5af2', label: docs.accents.purple },
    { value: '#ff375f', label: docs.accents.pink },
    { value: '#ff9f0a', label: docs.accents.orange },
    { value: '#30d158', label: docs.accents.green },
  ];
  const chromeOptions: { value: ChromeStyle; label: string }[] = [
    { value: 'system', label: docs.themes.system },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
  ];
  const dockAlignOptions: { value: 'center' | 'left'; label: string }[] = [
    { value: 'center', label: docs.dockAlign.center },
    { value: 'left', label: docs.dockAlign.left },
  ];
  const cardStyleOptions: { value: DesktopCardStyle; label: string }[] = [
    { value: 'frosted', label: docs.cardStyles.frosted },
    { value: 'liquid', label: docs.cardStyles.liquid },
  ];

  const startItems: StartMenuItem[] = categories.map((category) => ({
    id: category.id,
    label: docText(category.name, language.current),
    icon: <AppIcon icon={category.icon} color={category.color} />,
    keywords: pages
      .filter((page) => page.category === category.id)
      .map((page) => docText(page.title, language.current))
      .join(' '),
  }));
  const startActions: StartMenuAction[] = [
    { id: 'about', label: menu.about, icon: 'info', onSelect: () => setAboutOpen(true) },
    { id: 'control', label: menu.controlCenter, icon: 'sliders-horizontal', onSelect: () => setPopover('control') },
    { id: 'close-all', label: menu.closeAll, icon: 'x', onSelect: manager.closeAll },
  ];

  return (
    <Desktop ref={desktopRef} className="docs-root" dockStyle={dockStyle} dockAlign={prefs.dockAlign} windowPlatform={platform} wallpaper={prefs.wallpaper} cardStyle={prefs.cardStyle}>
      {admin ? (
        <DocsAdmin
          windows={manager.windows}
          activeId={manager.activeId}
          dark={darkNow}
          controlRef={controlRef}
          controlOpen={popover === 'control'}
          onOpenCategory={openCategory}
          onCloseCategory={manager.close}
          onCloseAll={manager.closeAll}
          onSelectPage={selectPage}
          onOpenPage={(pageId) => { openPage(pageId); window.history.replaceState(null, '', `#/${pageId}`); }}
          onToggleControl={() => togglePopover('control')}
          onToggleTheme={() => setPrefs({ theme: darkNow ? 'light' : 'dark' })}
          onAbout={() => setAboutOpen(true)}
          onDesktop={() => { setPopover(null); setPrefs({ workspaceMode: 'desktop' }); }}
        />
      ) : (
      <MenuBar
        left={
          dockStyle === 'windows' ? undefined : (
          <>
            <MenuBarLogo ref={logoRef} aria-label={menu.systemMenu} aria-haspopup="menu" aria-expanded={popover === 'logo'} active={popover === 'logo'} onClick={() => togglePopover('logo')}>
              <AppIcon icon="component" color={appGradients.indigo} />
            </MenuBarLogo>
            <MenuBarApp>{activeCategory ? docText(activeCategory.name, language.current) : menu.desktop}</MenuBarApp>
          </>
          )
        }
        right={
          <>
            <MenuBarIconButton icon="app-window" label={menu.switchToAdmin} onClick={() => { setPopover(null); setPrefs({ workspaceMode: 'admin' }); }} />
            <LanguageSwitcher choice={language.choice} current={language.current} onChoiceChange={language.setChoice} />
            <MenuBarIconButton icon={darkNow ? 'sun' : 'moon'} label={menu.switchTheme} onClick={() => setPrefs({ theme: darkNow ? 'light' : 'dark' })} />
            <MenuBarIconButton ref={controlRef} icon="sliders-horizontal" label={menu.controlCenter} aria-haspopup="dialog" aria-expanded={popover === 'control'} onClick={() => togglePopover('control')} />
            <MenuBarClock ref={calendarRef} date={clock.date} time={clock.time} aria-haspopup="dialog" aria-expanded={popover === 'calendar'} onClick={() => togglePopover('calendar')} />
          </>
        }
      />
      )}

      <Popover anchor={logoRef} open={popover === 'logo' && !admin} align="left" onClose={() => setPopover(null)} aria-label={menu.systemMenu}>
        <MenuItem icon="info" onClick={() => { setPopover(null); setAboutOpen(true); }}>{menu.about}</MenuItem>
        <MenuSeparator />
        <MenuItem icon="sliders-horizontal" onClick={(event) => { event.preventDefault(); setPopover('control'); }}>{menu.controlCenterDots}</MenuItem>
        <MenuItem icon="x" onClick={() => { setPopover(null); manager.closeAll(); }}>{menu.closeAll}</MenuItem>
      </Popover>

      <Popover anchor={controlRef} open={popover === 'control'} align="right" variant="control" onClose={() => setPopover(null)} aria-label={menu.controlCenter}>
        <PopoverTitle>{menu.appearance}</PopoverTitle>
        <ThemePicker value={prefs.theme} onChange={(theme) => setPrefs({ theme })} />
        {!admin && (
          <>
            <PopoverTitle>{menu.titlebarStyle}</PopoverTitle>
            <SegmentedControl aria-label={menu.titlebarStyleAria} options={chromeOptions} value={prefs.titlebar} onChange={(titlebar) => setPrefs({ titlebar })} />
            <PopoverTitle>{menu.dockStyle}</PopoverTitle>
            <SegmentedControl aria-label={menu.dockStyleAria} options={chromeOptions} value={prefs.dock} onChange={(dock) => setPrefs({ dock })} />
            {dockStyle === 'windows' && (
              <>
                <PopoverTitle>{menu.taskbarButtons}</PopoverTitle>
                <SegmentedControl aria-label={menu.taskbarButtonsAria} options={dockAlignOptions} value={prefs.dockAlign} onChange={(dockAlign) => setPrefs({ dockAlign })} />
              </>
            )}
            <PopoverTitle>{menu.cardStyle}</PopoverTitle>
            <SegmentedControl aria-label={menu.cardStyleAria} options={cardStyleOptions} value={prefs.cardStyle} onChange={(cardStyle) => setPrefs({ cardStyle })} />
          </>
        )}
        <PopoverTitle>{menu.accentColor}</PopoverTitle>
        <AccentPicker colors={accents} value={prefs.accent} onChange={(accent) => setPrefs({ accent })} />
        {!admin && (
          <>
            <PopoverTitle>{menu.wallpaper}</PopoverTitle>
            <WallpaperPicker value={prefs.wallpaper} onChange={(wallpaper) => setPrefs({ wallpaper })} />
          </>
        )}
      </Popover>

      <Popover anchor={calendarRef} open={popover === 'calendar'} align="right" variant="calendar" onClose={() => setPopover(null)} aria-label={menu.calendar}>
        <Calendar />
      </Popover>

      {!admin && (
        <>
      <DesktopArea onContextMenu={onDesktopContext}
        onPointerDown={(e) => { if (e.target === e.currentTarget && e.button === 0) setSelectedIcons([]); }}
        onKeyDown={(event) => {
          if (event.defaultPrevented || event.nativeEvent.isComposing || (event.target as HTMLElement).closest('.ds-window')) return;
          if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
          event.preventDefault();
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          setPopover(null); setContext({ x: rect.right, y: rect.top });
        }}>
        <DesktopCategoryIcons
          placementMode={prefs.iconPlacement}
          selectedIds={selectedIcons}
          onSelectionChange={setSelectedIcons}
          onOpen={(id) => { setSelectedIcons([id]); openCategory(id); }}
        />

        {manager.windows.map((win) => {
          const category = findCategory(win.id);
          if (!category) return null;
          return (
            <Window
              key={win.id}
              title={docText(category.name, language.current)}
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
              <CategoryWindow category={category} pageId={win.pageId} onSelectPage={(pageId) => selectPage(win.id, pageId)}
                onOpenPage={(pageId) => { openPage(pageId); window.history.replaceState(null, '', `#/${pageId}`); }} />
            </Window>
          );
        })}
      </DesktopArea>

      <Dock>
        {dockStyle === 'windows' && (
          <StartMenu
            open={startOpen}
            onOpenChange={setStartOpen}
            align={prefs.dockAlign}
            items={startItems}
            onSelect={openCategory}
            userName={docs.title}
            actions={startActions}
          />
        )}
        {categories.slice(0, 1).map((category) => (
          <DockItem key={category.id} label={docText(category.name, language.current)} running={manager.windows.some((w) => w.id === category.id)} onActivate={() => openCategory(category.id)}>
            <AppIcon icon={category.icon} color={category.color} />
          </DockItem>
        ))}
        <DockSeparator />
        {categories.slice(1).map((category) => (
          <DockItem key={category.id} label={docText(category.name, language.current)} running={manager.windows.some((w) => w.id === category.id)} onActivate={() => openCategory(category.id)}>
            <AppIcon icon={category.icon} color={category.color} />
          </DockItem>
        ))}
      </Dock>
        </>
      )}


      {context && !admin && (
        <ContextMenu x={context.x} y={context.y} onClose={() => setContext(null)} aria-label={menu.desktopMenu}>
          <ContextMenuSubmenu label={menu.view} icon="layout-grid">
            <ContextMenuItem icon="grid-2x2-check" checked={prefs.iconPlacement === 'grid'} onClick={() => {
              setPrefs({ iconPlacement: prefs.iconPlacement === 'grid' ? 'free' : 'grid' });
            }}>{menu.alignToGrid}</ContextMenuItem>
          </ContextMenuSubmenu>
          <ContextMenuSubmenu label={menu.desktopBackground} icon="image">
            {wallpapers.map((name) => (
              <ContextMenuItem key={name} icon="image" wallpaper={name} checkRole="radio" checked={prefs.wallpaper === name}
                onClick={() => setPrefs({ wallpaper: name })}>{wallpaperLabels[name]}</ContextMenuItem>
            ))}
          </ContextMenuSubmenu>
          <ContextMenuDivider />
          <ContextMenuItem icon="palette" onClick={() => { setPrefs({ theme: darkNow ? 'light' : 'dark' }); setContext(null); }}>
            {menu.themeAppearance(darkNow ? docs.themes.light : docs.themes.dark)}
          </ContextMenuItem>
          <ContextMenuItem icon="x" disabled={manager.windows.length === 0} onClick={() => { manager.closeAll(); setContext(null); }}>{menu.closeAll}</ContextMenuItem>
        </ContextMenu>
      )}

      <AlertDialog
        open={aboutOpen}
        title={menu.about}
        message={menu.aboutMessage}
        confirmLabel={docs.themes.ok} onConfirm={() => setAboutOpen(false)}
      />
    </Desktop>
  );
}
