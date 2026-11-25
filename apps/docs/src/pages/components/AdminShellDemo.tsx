import { useState, type CSSProperties } from 'react';
import {
  AdminHeader,
  AdminLayout,
  AdminMenuGroup,
  AdminMenuItem,
  AdminSidebar,
  AppIcon,
  Button,
  EmptyState,
  Icon,
  PageTabs,
  Tooltip,
  appGradients,
  useLabels,
} from '@desk/ui';

const pages = [
  { id: 'articles', label: '文章', icon: 'file-text', color: 'blue', group: '内容' },
  { id: 'messages', label: '消息', icon: 'bell', color: 'orange', group: '内容', unread: 3 },
  { id: 'accounts', label: '账号管理', icon: 'key-round', color: 'purple', group: '系统' },
  { id: 'settings', label: '系统设置', icon: 'settings', color: 'slate', group: '系统' },
] as const;
type PageId = (typeof pages)[number]['id'];
const groups = ['内容', '系统'] as const;

export function AdminShellDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [rail, setRail] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const sidebarLabels = useLabels('adminSidebar');
  const [open, setOpen] = useState<readonly PageId[]>(['articles', 'accounts']);
  const [current, setCurrent] = useState<PageId | undefined>('articles');
  const [refreshed, setRefreshed] = useState<Record<string, number>>({});
  const show = (id: PageId) => {
    setOpen((list) => (list.includes(id) ? list : [...list, id]));
    setCurrent(id);
  };
  const close = (id: string) => {
    const rest = open.filter((item) => item !== id);
    setOpen(rest);
    if (current === id) setCurrent(rest.at(-1));
  };
  // 固定页签“文章”不可关闭，关闭其他 / 关闭所有只关闭可关闭的页签。
  const keep = (ids: readonly PageId[], stay?: string) => ids.filter((id) => id === 'articles' || id === stay);
  const closeOthers = (id: string) => {
    setOpen((list) => keep(list, id));
    setCurrent(id as PageId);
  };
  const closeAll = () => {
    setOpen((list) => keep(list));
    setCurrent('articles');
  };
  const page = pages.find((item) => item.id === current);
  return (
    <div
      style={{
        position: 'relative',
        height: 360,
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <AdminLayout
        sidebar={
          <AdminSidebar
            variant={rail ? 'rail' : 'list'}
            density={density}
            title={
              <>
                <AppIcon icon="layout-grid" color={appGradients.blue} size={20} />
                {!rail && <span>控制台</span>}
              </>
            }
            actions={
              !rail && (
                <Tooltip text={collapsed ? sidebarLabels.expand : sidebarLabels.collapse} placement="right-start">
                  {(trigger) => (
                    <Button
                      {...trigger}
                      className="ds-button--icon"
                      variant="quiet"
                      icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
                      aria-label={collapsed ? sidebarLabels.expand : sidebarLabels.collapse}
                      aria-expanded={!collapsed}
                      onClick={() => setCollapsed((value) => !value)}
                    />
                  )}
                </Tooltip>
              )
            }
            collapsed={collapsed}
            style={{ '--ds-app-icon-size': '28px' } as CSSProperties}
          >
            {groups.map((group) => (
              <AdminMenuGroup key={group} label={group}>
                {pages
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <AdminMenuItem
                      key={item.id}
                      icon={<AppIcon icon={item.icon} color={appGradients[item.color]} />}
                      label={item.label}
                      current={item.id === current}
                      open={item.id !== current && open.includes(item.id)}
                      badge={'unread' in item ? item.unread : undefined}
                      onClick={() => show(item.id)}
                    />
                  ))}
              </AdminMenuGroup>
            ))}
          </AdminSidebar>
        }
        header={
          <>
            <AdminHeader
              title={page?.label ?? '控制台'}
              end={
                <>
                  <Button
                    size="sm"
                    pressed={density === 'compact'}
                    disabled={rail}
                    onClick={() => setDensity((value) => (value === 'compact' ? 'comfortable' : 'compact'))}
                  >
                    {sidebarLabels[density]}
                  </Button>
                  <Button size="sm" pressed={rail} onClick={() => setRail((value) => !value)}>
                    图标栏
                  </Button>
                </>
              }
            />
            <PageTabs
              panelId="admin-demo-page"
              items={open.map((id) => {
                const item = pages.find((entry) => entry.id === id)!;
                return { id, label: item.label, icon: <Icon name={item.icon} />, closable: id !== 'articles' };
              })}
              value={current}
              onChange={(id) => setCurrent(id as PageId)}
              onClose={close}
              onReorder={(ids) => setOpen(ids as PageId[])}
              onRefresh={(id) => setRefreshed((counts) => ({ ...counts, [id]: (counts[id] ?? 0) + 1 }))}
              onCloseOthers={closeOthers}
              onCloseAll={closeAll}
            />
          </>
        }
      >
        <div id="admin-demo-page" role="tabpanel" aria-label={page?.label ?? '空页面'} style={{ height: '100%' }}>
          <EmptyState>
            {page
              ? `这里是「${page.label}」页面内容，已刷新 ${refreshed[page.id] ?? 0} 次`
              : '从左侧菜单选择要打开的页面'}
          </EmptyState>
        </div>
      </AdminLayout>
    </div>
  );
}
