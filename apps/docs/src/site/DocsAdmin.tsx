import { useState, type RefObject } from 'react';
import {
  AdminHeader,
  AdminLayout,
  AdminMenuItem,
  AdminSidebar,
  AppIcon,
  Button,
  EmptyState,
  IconButton,
  LanguageSwitcher,
  PageTabs,
  Tooltip,
  appGradients,
  useLabels,
  useMessages,
  type WallpaperName,
} from '@xyzos/desk-ui';
import { docText } from '../blocks/docText';
import { categories, findCategory, type DocCategory } from '../registry';
import { AppearanceWindow } from './AppearanceWindow';
import {
  APPEARANCE_APP_ID,
  appearanceAppSpec,
  type AdminSidebarDensity,
  type AdminSidebarStyle,
} from './appearance';
import { CategoryWindow } from './CategoryWindow';
import { useLanguage } from './LocaleProvider';
import { docsMessages } from './locale';
import type { Preferences } from './usePreferences';

interface DocsAdminProps {
  /** Open app windows shared with desktop mode. */
  windows: readonly { id: string; pageId: string }[];
  activeId?: string | null;
  dark: boolean;
  prefs: Preferences;
  wallpaperBusy: boolean;
  wallpaperError: string;
  onChooseWallpaper: () => void;
  onSelectWallpaper: (wallpaper: WallpaperName) => void;
  onChangePrefs: (patch: Partial<Preferences>) => void;
  onResetPrefs: () => void;
  controlRef: RefObject<HTMLButtonElement | null>;
  controlOpen: boolean;
  onOpenApp: (id: string) => void;
  onCloseCategory: (id: string) => void;
  onCloseAll: () => void;
  onSelectPage: (windowId: string, pageId: string) => void;
  onOpenPage: (pageId: string) => void;
  onToggleSidebarCollapsed: () => void;
  onToggleControl: () => void;
  onToggleTheme: () => void;
  onAbout: () => void;
  onDesktop: () => void;
}

const icon = (category: DocCategory) => <AppIcon icon={category.icon} color={category.color} shadow="tinted" />;

/** Admin workspace view for docs: app sidebar, header controls, page tabs, and doc / settings pages. */
export function DocsAdmin({
  windows,
  activeId,
  dark,
  prefs,
  wallpaperBusy,
  wallpaperError,
  onChooseWallpaper,
  onSelectWallpaper,
  onChangePrefs,
  onResetPrefs,
  controlRef,
  controlOpen,
  onOpenApp,
  onCloseCategory,
  onCloseAll,
  onSelectPage,
  onOpenPage,
  onToggleSidebarCollapsed,
  onToggleControl,
  onToggleTheme,
  onAbout,
  onDesktop,
}: DocsAdminProps) {
  /** Custom tab order and refresh counter kept per session. */
  const language = useLanguage();
  const menu = useMessages(docsMessages).docs.menu;
  const sidebarLabels = useLabels('adminSidebar');
  const [order, setOrder] = useState<string[]>([]);
  const [refreshed, setRefreshed] = useState<Record<string, number>>({});
  const sidebar: AdminSidebarStyle = prefs.adminSidebar;
  const sidebarDensity: AdminSidebarDensity = prefs.adminSidebarDensity;
  const collapsed = sidebar !== 'rail' && prefs.adminSidebarCollapsed;
  const appearanceApp = appearanceAppSpec(menu.appearanceSettings);
  const appearanceIcon = <AppIcon icon={appearanceApp.icon} color={appearanceApp.color} shadow="tinted" />;

  const tabs = windows
    .flatMap((win) => {
      if (win.id === APPEARANCE_APP_ID) {
        return [{ id: win.id, label: appearanceApp.label, icon: appearanceIcon }];
      }
      const item = findCategory(win.id);
      return item ? [{ id: win.id, label: docText(item.name, language.current), icon: icon(item) }] : [];
    })
    .sort((a, b) => {
      const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
      return rank(a.id) - rank(b.id);
    });
  const current = windows.find((win) => win.id === activeId) ?? windows[0];
  const isAppearance = current?.id === APPEARANCE_APP_ID;
  const category = current && !isAppearance ? findCategory(current.id) : undefined;
  const headerTitle = isAppearance
    ? appearanceApp.label
    : category
      ? docText(category.name, language.current)
      : menu.brand;

  return (
    <AdminLayout
      className="docs-admin"
      data-admin-sidebar={sidebar}
      data-admin-sidebar-density={sidebar === 'list' ? sidebarDensity : undefined}
      data-admin-collapsed={collapsed || undefined}
      sidebar={
        <AdminSidebar
          variant={sidebar}
          density={sidebar === 'list' ? sidebarDensity : undefined}
          collapsed={collapsed}
          actions={
            sidebar !== 'rail' && (
              <Tooltip text={collapsed ? sidebarLabels.expand : sidebarLabels.collapse} placement="right-start">
                {(trigger) => (
                  <Button
                    {...trigger}
                    className="ds-button--icon"
                    variant="quiet"
                    icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
                    aria-label={collapsed ? sidebarLabels.expand : sidebarLabels.collapse}
                    aria-expanded={!collapsed}
                    onClick={onToggleSidebarCollapsed}
                  />
                )}
              </Tooltip>
            )
          }
          title={
            <>
              <button
                type="button"
                className="docs-admin-brand"
                aria-label={menu.about}
                title={menu.about}
                onClick={onAbout}
              >
                <AppIcon icon="component" color={appGradients.indigo} shadow="tinted" size={collapsed ? 20 : 28} />
              </button>
              <span className="docs-admin-brand-name">{menu.brand}</span>
            </>
          }
        >
          {categories.map((item) => (
            <AdminMenuItem
              key={item.id}
              icon={icon(item)}
              label={docText(item.name, language.current)}
              current={item.id === current?.id}
              open={windows.some((win) => win.id === item.id)}
              onClick={() => onOpenApp(item.id)}
            />
          ))}
          <AdminMenuItem
            key={APPEARANCE_APP_ID}
            icon={appearanceIcon}
            label={appearanceApp.label}
            current={current?.id === APPEARANCE_APP_ID}
            open={windows.some((win) => win.id === APPEARANCE_APP_ID)}
            onClick={() => onOpenApp(APPEARANCE_APP_ID)}
          />
        </AdminSidebar>
      }
      header={
        <>
          <AdminHeader
            title={headerTitle}
            end={
              <>
                <IconButton variant="quiet" icon="monitor" label={menu.switchToDesktop} onClick={onDesktop} />
                <LanguageSwitcher
                  variant="plain"
                  choice={language.choice}
                  current={language.current}
                  onChoiceChange={language.setChoice}
                />
                <IconButton
                  variant="quiet"
                  icon={dark ? 'sun' : 'moon'}
                  label={dark ? menu.toLightMode : menu.toDarkMode}
                  onClick={onToggleTheme}
                />
                <IconButton
                  ref={controlRef}
                  variant="quiet"
                  icon="sliders-horizontal"
                  label={menu.appearance}
                  aria-haspopup="dialog"
                  aria-expanded={controlOpen}
                  onClick={onToggleControl}
                />
              </>
            }
          />
          {prefs.adminTabs && (
            <PageTabs
              items={tabs}
              value={current?.id}
              onChange={onOpenApp}
              onClose={onCloseCategory}
              onReorder={setOrder}
              onRefresh={(id) => setRefreshed((keys) => ({ ...keys, [id]: (keys[id] ?? 0) + 1 }))}
              onCloseOthers={(id) => tabs.forEach((tab) => tab.id !== id && onCloseCategory(tab.id))}
              onCloseAll={onCloseAll}
            />
          )}
        </>
      }
    >
      {current && isAppearance ? (
        <div className="docs-admin-page" key={`${APPEARANCE_APP_ID}:${refreshed[APPEARANCE_APP_ID] ?? 0}`}>
          <AppearanceWindow
            prefs={prefs}
            wallpaperBusy={wallpaperBusy}
            wallpaperError={wallpaperError}
            onChooseWallpaper={onChooseWallpaper}
            onSelectWallpaper={onSelectWallpaper}
            onChange={onChangePrefs}
            onReset={onResetPrefs}
          />
        </div>
      ) : current && category ? (
        <div className="docs-admin-page" key={`${category.id}:${refreshed[category.id] ?? 0}`}>
          <CategoryWindow
            category={category}
            pageId={current.pageId}
            onSelectPage={(pageId) => onSelectPage(current.id, pageId)}
            onOpenPage={onOpenPage}
          />
        </div>
      ) : (
        <EmptyState>{menu.emptyWorkspace}</EmptyState>
      )}
    </AdminLayout>
  );
}
