import { useState } from 'react';
import {
  Button, DocumentPane, Field, Grid, HelpTip, Input, Lead, List, ListItem, Notice, Panel, Property, PropertySheet,
  SearchField, Select, Sidebar, SidebarAddButton, SplitLayout, StatCard, Tag, Title, Toolbar, ToolbarActions, Workspace,
} from '@xyzos/desk-ui';

const accounts = [
  { id: 'a', name: '李明', role: '管理员', on: true },
  { id: 'b', name: '王芳', role: '编辑', on: true },
  { id: 'c', name: '赵强', role: '访客', on: false },
];

/** 页面示例：整页只用库组件拼成，作为"外观与桌面一致"的活样板。 */
function AccountSample() {
  const [selected, setSelected] = useState('a');
  const [saved, setSaved] = useState(false);
  const current = accounts.find((a) => a.id === selected);
  return (
    <Workspace className="docs-frame">
      <SplitLayout
        sidebar={
          <Sidebar
            title="账号管理"
            count={accounts.length}
            actions={<SidebarAddButton label="新增账号" />}
            search={<SearchField placeholder="搜索账号" />}
          >
            <List>
              {accounts.map((a) => (
                <ListItem
                  key={a.id}
                  icon="users"
                  title={a.name}
                  subtitle={a.role}
                  selected={a.id === selected}
                  trailing={<Tag tone={a.on ? 'success' : 'muted'}>{a.on ? '启用' : '停用'}</Tag>}
                  onSelect={() => { setSelected(a.id); setSaved(false); }}
                />
              ))}
            </List>
          </Sidebar>
        }
      >
        <Toolbar title="账号详情">
          <ToolbarActions>
            <Button variant="primary" icon="check" onClick={() => setSaved(true)}>保存</Button>
          </ToolbarActions>
        </Toolbar>
        <DocumentPane>
          {saved && <Notice>已保存 {current?.name} 的修改</Notice>}
          <Panel>
            <PropertySheet>
              <Property label="显示名称"><Input key={selected} defaultValue={current?.name} /></Property>
              <Property label={<>角色 <HelpTip text="角色权限与直接授权取并集" /></>}>
                <Select key={`${selected}-role`} defaultValue={current?.role}>
                  <option>管理员</option><option>编辑</option><option>访客</option>
                </Select>
              </Property>
              <Property label="状态"><Tag tone={current?.on ? 'success' : 'muted'}>{current?.on ? '启用' : '停用'}</Tag></Property>
            </PropertySheet>
          </Panel>
          <Panel title="重置密码">
            <Field label="新密码" hint="至少 8 位，需包含大小写字母">
              <Input type="password" autoComplete="new-password" />
            </Field>
          </Panel>
        </DocumentPane>
      </SplitLayout>
    </Workspace>
  );
}

export interface OverviewContentProps { componentCount: number; pageCount: number; categoryCount: number }

export function OverviewZh({ componentCount, pageCount, categoryCount }: OverviewContentProps) {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>组件库概览</Title>
        <Lead>
          把浏览器桌面的壳层（窗口、Dock、菜单栏等）和后台应用里反复出现的界面约定封装成一套 React 组件。
          本站本身就是组件库搭成的另一个桌面：壁纸、菜单栏、桌面图标、Dock、窗口、控制中心、右键菜单都来自 @xyzos/desk-ui。
          桌面上每个图标是一个组件分类，按住可以移动，双击（或点击 Dock）打开对应窗口。
        </Lead>
      </header>

      <Grid columns={3}>
        <StatCard label="组件总数" value={componentCount} icon="component" description="按独立组件文档入口统计" />
        <StatCard label="文档总数" value={pageCount} icon="book-open" description="包含指南与 LLMs 文档" />
        <StatCard label="组件分类" value={categoryCount} icon="layers" />
      </Grid>

      <h2 className="docs-section-title">用库组件拼出的管理页</h2>
      <Panel flush>
        <div className="docs-demo-head">
          <h3 className="docs-demo-title">账号管理（示例）</h3>
          <p className="docs-demo-note">侧栏列表、搜索、状态标签、属性表单与保存提示全部来自组件库；缩放窗口可看到侧栏随容器宽度折叠。</p>
        </div>
        <div className="docs-preview docs-preview--frame">
          <AccountSample />
        </div>
      </Panel>

      <h2 className="docs-section-title">现在可用的组件</h2>
      <Panel>
        <ul className="docs-list">
          <li><strong>基础</strong>：Icon、Button / IconButton、Text、Link、Divider、Avatar / AvatarGroup、Badge、Progress、Skeleton、
            Workspace、Scrollable、CopyButton、CodeBlock、ConfigProvider、Chip、Kbd，均有独立文档入口。</li>
          <li><strong>桌面系统</strong>：Desktop、MenuBar、Dock、AppIcon（统一纯图形与桌面入口，支持内部尺寸和笔画）、Window、WindowTitlebar、
            DesktopCard / DesktopNote / ClockCard、Popover / MenuItem、DropdownMenu、ContextMenu、Notification、
            SystemDialog / ConfirmDialog / PromptDialog / AlertDialog、控制中心的外观选择器，
            以及管理后台外框 AdminLayout / AdminHeader / AdminSidebar / PageTabs。</li>
          <li><strong>桌面内容</strong>：LockScreen、CommandPalette、Launchpad、NotificationCenter、WindowSwitcher，
            提供验证入口、命令搜索、应用启动、通知历史和窗口切换视图，实际会话与窗口由宿主管理。</li>
          <li><strong>桌面交互</strong>：SelectionArea、DesktopIconGrid、DockWorkspace、WidgetLayout，
            支持框选、网格定位、窗口预览、应用排序和卡片层级，位置与选择由宿主保存。</li>
          <li><strong>表单</strong>：Field、Input、InputNumber、PasswordInput、CopyField、Radio / RadioGroup、Textarea、Select / Combobox / MultiSelect、
            Range / RangeSlider、OTPInput、Rating、
            DatePicker / TimePicker / DateTimePicker、DateRangePicker / TimeRangePicker / NumberRangePicker、Checkbox / CheckboxGroup、
            Switch、ColorPicker、FormSection / FormActions、FieldAddon、InputGroup、UploadZone、MessageComposer。</li>
          <li><strong>AI 工具</strong>：AIToolbar、AIReferenceList、AIResultPanel，提供选择、生成状态与结果预览，业务请求由宿主处理。</li>
          <li><strong>反馈</strong>：Tag、HelpTip / Tooltip、Notice、ToastProvider / useToast、AnchorPopover、Popconfirm、Coachmark / Tour、
            EmptyState、Result、Spinner / LoadingOverlay。</li>
          <li><strong>布局</strong>：Panel、Toolbar、SplitLayout / ResizableSplit、ResizeHandle、Sidebar、SearchField、List、PropertySheet、
            DocumentPane、Disclosure、DetailLayout / DetailSection、AppLayout / NavSidebar、Breadcrumb、Stack / Inline / Grid。</li>
          <li><strong>数据</strong>：Table、Pagination、Tabs、Stepper、Calendar / MonthCalendar、Tree、PermissionTree、SelectionTree、
            Statistic / StatCard、Timeline、AppCard / AppCardGrid；文件大小展示复用 formatBytes。</li>
          <li><strong>内容预览</strong>：ImagePreview，支持多图切换、加载失败重试与关闭后焦点返回；ImageGallery 提供缩略图条并复用它放大。</li>
          <li><strong>通用模态</strong>：Modal 与四边 Drawer 共用内容 / 动作和原生模态层，SystemDialog 等确认特例复用同一底层。</li>
          <li><strong>标签输入</strong>：TagInput 支持确认、移除、粘贴校验、原生表单和可恢复草稿。</li>
          <li><strong>内容处理</strong>：ImageCropper 本地取景与导出、MarkdownEditor 源码格式 / 历史及宿主预览接入、SortableList 拖动与键盘排序。</li>
          <li><strong>规划中</strong>：可视化 Markdown 编辑、原生通知与桌面卡片的拖动 / 保存 / 权限等宿主适配（见组件库封装计划的原生组件盘点）。</li>
        </ul>
      </Panel>
    </div>
  );
}
