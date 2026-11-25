import { useState, type RefObject } from 'react';
import {
  AdminHeader,
  AdminLayout,
  AdminMenuItem,
  AdminSidebar,
  AppIcon,
  EmptyState,
  IconButton,
  LanguageSwitcher,
  PageTabs,
  appGradients,
} from '@desk/ui';
import { useMessages } from '@desk/ui';
import { docText } from '../blocks/docText';
import { categories, findCategory, type DocCategory } from '../registry';
import { CategoryWindow } from './CategoryWindow';
import { useLanguage } from './LocaleProvider';
import { docsMessages } from './locale';

interface DocsAdminProps {
  /** 已打开的分类窗口（与桌面形态共用同一份窗口状态）。 */
  windows: readonly { id: string; pageId: string }[];
  activeId?: string | null;
  dark: boolean;
  controlRef: RefObject<HTMLButtonElement | null>;
  controlOpen: boolean;
  onOpenCategory: (id: string) => void;
  onCloseCategory: (id: string) => void;
  onCloseAll: () => void;
  onSelectPage: (windowId: string, pageId: string) => void;
  onOpenPage: (pageId: string) => void;
  onToggleControl: () => void;
  onToggleTheme: () => void;
  onAbout: () => void;
  onDesktop: () => void;
}

const icon = (category: DocCategory) => <AppIcon icon={category.icon} color={category.color} />;

/** 文档站的后台形态：左侧分类图标栏、顶栏（当前分类、切回桌面、主题、外观）、页签与文档内容。 */
export function DocsAdmin({
  windows,
  activeId,
  dark,
  controlRef,
  controlOpen,
  onOpenCategory,
  onCloseCategory,
  onCloseAll,
  onSelectPage,
  onOpenPage,
  onToggleControl,
  onToggleTheme,
  onAbout,
  onDesktop,
}: DocsAdminProps) {
  /** 页签的自定义顺序与刷新计数（会话内有效）。 */
  const language = useLanguage();
  const menu = useMessages(docsMessages).docs.menu;
  const [order, setOrder] = useState<string[]>([]);
  const [refreshed, setRefreshed] = useState<Record<string, number>>({});
  const tabs = windows
    .flatMap((win) => {
      const item = findCategory(win.id);
      return item ? [{ id: win.id, label: docText(item.name, language.current), icon: icon(item) }] : [];
    })
    .sort((a, b) => {
      const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
      return rank(a.id) - rank(b.id);
    });
  const current = windows.find((win) => win.id === activeId) ?? windows[0];
  const category = current ? findCategory(current.id) : undefined;
  return (
    <AdminLayout
      className="docs-admin"
      sidebar={
        <AdminSidebar
          variant="rail"
          title={
            <button
              type="button"
              className="docs-admin-brand"
              aria-label={menu.about}
              title={menu.about}
              onClick={onAbout}
            >
              <AppIcon icon="component" color={appGradients.indigo} size={28} />
            </button>
          }
        >
          {categories.map((item) => (
            <AdminMenuItem
              key={item.id}
              icon={icon(item)}
              label={docText(item.name, language.current)}
              current={item.id === current?.id}
              open={windows.some((win) => win.id === item.id)}
              onClick={() => onOpenCategory(item.id)}
            />
          ))}
        </AdminSidebar>
      }
      header={
        <>
          <AdminHeader
            title={category ? docText(category.name, language.current) : menu.brand}
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
          <PageTabs
            items={tabs}
            value={current?.id}
            onChange={onOpenCategory}
            onClose={onCloseCategory}
            onReorder={setOrder}
            onRefresh={(id) => setRefreshed((keys) => ({ ...keys, [id]: (keys[id] ?? 0) + 1 }))}
            onCloseOthers={(id) => tabs.forEach((tab) => tab.id !== id && onCloseCategory(tab.id))}
            onCloseAll={onCloseAll}
          />
        </>
      }
    >
      {current && category ? (
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
