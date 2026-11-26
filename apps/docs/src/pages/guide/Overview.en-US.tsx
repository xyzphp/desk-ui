import { useState } from 'react';
import {
  Button, DocumentPane, Field, Grid, HelpTip, Input, Lead, List, ListItem, Notice, Panel, Property, PropertySheet,
  SearchField, Select, Sidebar, SidebarAddButton, SplitLayout, StatCard, Tag, Title, Toolbar, ToolbarActions, Workspace,
} from '@xyzos/desk-ui';
import type { OverviewContentProps } from './Overview.zh-CN';

const accounts = [
  { id: 'a', name: 'Li Ming', role: 'Admin', on: true },
  { id: 'b', name: 'Wang Fang', role: 'Editor', on: true },
  { id: 'c', name: 'Zhao Qiang', role: 'Visitor', on: false },
];

/** Sample page: built entirely from library components as a live showcase. */
function AccountSample() {
  const [selected, setSelected] = useState('a');
  const [saved, setSaved] = useState(false);
  const current = accounts.find((a) => a.id === selected);
  return (
    <Workspace className="docs-frame">
      <SplitLayout
        sidebar={
          <Sidebar
            title="Account management"
            count={accounts.length}
            actions={<SidebarAddButton label="Add account" />}
            search={<SearchField placeholder="Search accounts" />}
          >
            <List>
              {accounts.map((a) => (
                <ListItem
                  key={a.id}
                  icon="users"
                  title={a.name}
                  subtitle={a.role}
                  selected={a.id === selected}
                  trailing={<Tag tone={a.on ? 'success' : 'muted'}>{a.on ? 'Active' : 'Disabled'}</Tag>}
                  onSelect={() => { setSelected(a.id); setSaved(false); }}
                />
              ))}
            </List>
          </Sidebar>
        }
      >
        <Toolbar title="Account details">
          <ToolbarActions>
            <Button variant="primary" icon="check" onClick={() => setSaved(true)}>Save</Button>
          </ToolbarActions>
        </Toolbar>
        <DocumentPane>
          {saved && <Notice>Saved changes for {current?.name}</Notice>}
          <Panel>
            <PropertySheet>
              <Property label="Display name"><Input key={selected} defaultValue={current?.name} /></Property>
              <Property label={<>Role <HelpTip text="Role permissions merge with direct grants" /></>}>
                <Select key={`${selected}-role`} defaultValue={current?.role}>
                  <option>Admin</option><option>Editor</option><option>Visitor</option>
                </Select>
              </Property>
              <Property label="Status"><Tag tone={current?.on ? 'success' : 'muted'}>{current?.on ? 'Active' : 'Disabled'}</Tag></Property>
            </PropertySheet>
          </Panel>
          <Panel title="Reset password">
            <Field label="New password" hint="At least 8 characters with upper and lower case letters">
              <Input type="password" autoComplete="new-password" />
            </Field>
          </Panel>
        </DocumentPane>
      </SplitLayout>
    </Workspace>
  );
}

export function OverviewEn({ componentCount, pageCount, categoryCount }: OverviewContentProps) {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>Component library overview</Title>
        <Lead>
          This library wraps the shell of a browser desktop (windows, Dock, menu bar, and more) and the UI conventions that
          recur across admin apps into a set of React components. The docs site itself is another desktop built from the library: wallpaper, menu bar,
          desktop icons, Dock, windows, Control Center, and context menus all come from @xyzos/desk-ui. Each desktop icon is a
          component category; hold to move it, double-click (or use the Dock) to open its window.
        </Lead>
      </header>

      <Grid columns={3}>
        <StatCard label="Components" value={componentCount} icon="component" description="By standalone doc entries" />
        <StatCard label="Docs" value={pageCount} icon="book-open" description="Including guides and LLMs docs" />
        <StatCard label="Categories" value={categoryCount} icon="layers" />
      </Grid>

      <h2 className="docs-section-title">An admin page built from library components</h2>
      <Panel flush>
        <div className="docs-demo-head">
          <h3 className="docs-demo-title">Account management (sample)</h3>
          <p className="docs-demo-note">The sidebar list, search, status tags, property form, and save notice all come from the library; resize the window to see the sidebar collapse with container width.</p>
        </div>
        <div className="docs-preview docs-preview--frame">
          <AccountSample />
        </div>
      </Panel>

      <h2 className="docs-section-title">Components available now</h2>
      <Panel>
        <ul className="docs-list">
          <li><strong>Foundation</strong>: Icon, Button / IconButton, Text, Link, Divider, Avatar / AvatarGroup, Badge, Progress, Skeleton,
            Workspace, Scrollable, CopyButton, CodeBlock, ConfigProvider, Chip, Kbd — each with its own doc entry.</li>
          <li><strong>Desktop system</strong>: Desktop, MenuBar, Dock, AppIcon (one graphic and desktop entry with inner sizing and strokes), Window, WindowTitlebar,
            DesktopCard / DesktopNote / ClockCard, Popover / MenuItem, DropdownMenu, ContextMenu, Notification,
            SystemDialog / ConfirmDialog / PromptDialog / AlertDialog, the Control Center appearance pickers,
            and the admin frame AdminLayout / AdminHeader / AdminSidebar / PageTabs.</li>
          <li><strong>Desktop content</strong>: LockScreen, CommandPalette, Launchpad, NotificationCenter, WindowSwitcher —
            sign-in entry, command search, app launching, notification history, and window switching; real sessions and windows stay host-managed.</li>
          <li><strong>Desktop interaction</strong>: SelectionArea, DesktopIconGrid, DockWorkspace, WidgetLayout —
            rubber-band selection, grid placement, window previews, app ordering, and card stacking; positions and selection are saved by the host.</li>
          <li><strong>Forms</strong>: Field, Input, InputNumber, PasswordInput, CopyField, Radio / RadioGroup, Textarea, Select / Combobox / MultiSelect,
            Range / RangeSlider, OTPInput, Rating,
            DatePicker / TimePicker / DateTimePicker, DateRangePicker / TimeRangePicker / NumberRangePicker, Checkbox / CheckboxGroup,
            Switch, ColorPicker, FormSection / FormActions, FieldAddon, InputGroup, UploadZone, MessageComposer.</li>
          <li><strong>AI tools</strong>: AIToolbar, AIReferenceList, AIResultPanel cover selection, generation states, and result previews; business requests stay in the host.</li>
          <li><strong>Feedback</strong>: Tag, HelpTip / Tooltip, Notice, ToastProvider / useToast, AnchorPopover, Popconfirm, Coachmark / Tour,
            EmptyState, Result, Spinner / LoadingOverlay.</li>
          <li><strong>Layout</strong>: Panel, Toolbar, SplitLayout / ResizableSplit, ResizeHandle, Sidebar, SearchField, List, PropertySheet,
            DocumentPane, Disclosure, DetailLayout / DetailSection, AppLayout / NavSidebar, Breadcrumb, Stack / Inline / Grid.</li>
          <li><strong>Data</strong>: Table, Pagination, Tabs, Stepper, Calendar / MonthCalendar, Tree, PermissionTree, SelectionTree,
            Statistic / StatCard, Timeline, AppCard / AppCardGrid; file sizes reuse formatBytes.</li>
          <li><strong>Content preview</strong>: ImagePreview with multi-image switching, retry on load failure, and focus restoration on close; ImageGallery adds a thumbnail strip that opens it.</li>
          <li><strong>Shared modals</strong>: Modal and the four-side Drawer share content / actions and the native modal layer; SystemDialog-style confirmations reuse the same base.</li>
          <li><strong>Tag input</strong>: TagInput supports confirm, remove, paste validation, native forms, and recoverable drafts.</li>
          <li><strong>Content tools</strong>: ImageCropper for local framing and export, MarkdownEditor for source formatting / history with host preview, and SortableList for drag and keyboard ordering.</li>
          <li><strong>Planned</strong>: visual Markdown editing, native notifications, and desktop card drag / save / permission host adapters (see the native component inventory in the library plan).</li>
        </ul>
      </Panel>
    </div>
  );
}
