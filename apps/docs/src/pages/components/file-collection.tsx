import { useState } from 'react';
import { FileCollection, Panel, SegmentedControl } from '@xyzos/desk-ui';
import type { ComponentDoc } from '../../blocks/types';

const sampleFiles = [
  { id: 'folder:1', name: '项目资料', icon: 'folder' as const, secondary: '文件夹', title: '项目资料\n所在目录: /' },
  {
    id: 'file:2',
    name: '设计说明.md',
    icon: 'file-text' as const,
    secondary: '8.4 KB',
    title: '设计说明.md\n所在目录: /项目资料',
  },
  {
    id: 'file:3',
    name: '界面参考.png',
    icon: 'image' as const,
    secondary: '420 KB',
    title: '界面参考.png\n所在目录: /项目资料',
  },
  { id: 'file:4', name: '归档.zip', icon: 'file-archive' as const, secondary: '12.6 MB', disabled: true },
];

function FileCollectionDemo() {
  const [view, setView] = useState('grid');
  const [selected, setSelected] = useState<string[]>(['folder:1']);
  const [status, setStatus] = useState('选择或双击项目进行操作');
  return (
    <Panel flush style={{ width: '100%', overflow: 'auto' }}>
      <SegmentedControl
        aria-label="示例显示方式"
        value={view}
        onChange={setView}
        options={[
          { value: 'grid', label: '图标' },
          { value: 'list', label: '列表' },
        ]}
      />
      <FileCollection
        aria-label="示例文件"
        view={view as 'grid' | 'list'}
        items={sampleFiles}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        onActivate={(item) => setStatus('打开：' + item.name)}
        onContextMenu={(_event, item) => setStatus(item ? '右键：' + item.name : '右键空白区域')}
        onDrop={(ids, target) => setStatus(`移动 ${ids.length} 项${target ? ' 到 ' + target : ''}`)}
        renderDetails={(item) => (
          <>
            <span>/{item.id.startsWith('folder:') ? '' : '项目资料'}</span>
            <span>—</span>
            <span>本地存储</span>
            <span>2026-11-07</span>
          </>
        )}
      />
      <p role="status" style={{ padding: 12 }}>
        {status}
      </p>
    </Panel>
  );
}

const fileCollectionSource = `import { FileCollection, Icon } from '@xyzos/desk-ui';

const items = [
  { id: 'folder:1', name: '项目资料', icon: 'folder', secondary: '文件夹' },
  { id: 'file:2', name: '设计说明.md', icon: 'file-text', secondary: '8.4 KB' },
];

<FileCollection
  nativeStructure
  className="fm-items fm-grid"
  role="listbox"
  aria-label="文件"
  aria-multiselectable="true"
  items={items}
  view="grid"
  focusId={items[0]?.id}
  itemIdAttribute="data-fm-item"
  itemClassName={() => 'fm-item'}
  selectedIds={selectedIds}
  onSelectedIdsChange={setSelectedIds}
  onActivate={openItem}
  onContextMenu={(event, item) => openMenu(event, item)}
  onDrop={(ids, targetId) => moveItems(ids, targetId)}
  dragType="application/x-ds-files"
  renderItemContent={(item) => <>
    <span className="fm-file-visual"><Icon className="lucide" name={item.icon ?? 'file-text'} /></span>
    <span className="fm-file-name"><span>{item.name}</span></span>
    <span className="fm-file-subtitle">{item.secondary}</span>
  </>}
/>`;

export const fileCollectionDoc: ComponentDoc = {
  name: { 'zh-CN': '文件集合', 'en-US': 'File collection' },
  summary: {
    'zh-CN': '以原站文件网格和列表密度展示资源；负责选择、键盘焦点、双击、右键与拖放事件，不请求或修改数据。',
    'en-US': 'Displays resources with the original grid and list densities; handles selection, keyboard focus, double-click, context menu, and drop events without requesting or mutating data.',
  },
  usage: [
    'items 使用稳定 id；icon、image、secondary 与 title 只影响展示，数据获取、权限校验和实际文件操作由宿主完成。',
    '默认使用组件自带的文件项结构；迁移既有页面时启用 nativeStructure，并显式传入原容器 / 项目类名、ARIA 属性与内部标记。该模式不添加 ds-* 结构类、默认布局样式、内联列宽或 aria-description，只复用选择、键盘、双击、右键和拖放行为。',
    'selectedIds 与 onSelectedIdsChange 受控；Ctrl / Command 切换选择，Shift 选择范围。键盘支持方向键、Home、End、Space 与 Enter。',
    'view 为 grid 或 list；列表模式用 renderDetails 补充路径、大小、存储位置、日期等业务列。columns 可固定图标列数。',
    'draggable 只控制是否允许拖出，不自动移动。onDrop 返回已拖出的 id 列表和目标 id；宿主须重新检查权限、来源与目录循环。',
  ],
  demos: [
    {
      title: '图标与列表视图',
      description: '切换原站密度；选择、双击、右键和拖放均只发出回调。迁移现有页面时可保留原标记。',
      code: fileCollectionSource,
      render: () => <FileCollectionDemo />,
    },
  ],
  api: [
    {
      component: 'FileCollection',
      props: [
        {
          name: 'items',
          type: 'readonly FileCollectionItem[]',
          description: '必填；每项提供 id、name，可选 icon、image、title、secondary、disabled 与 draggable。',
        },
        {
          name: 'view',
          type: "'grid' | 'list'",
          default: "'grid'",
          description: '图标或列表；列表使用 renderDetails 补充列值。',
        },
        {
          name: 'selectedIds / onSelectedIdsChange',
          type: 'readonly string[] / (ids: string[]) => void',
          description: '受控多选，保留原列表顺序。',
        },
        { name: 'focusId', type: 'string', description: '可选，指定原模板中唯一的键盘焦点项；无效时回退到第一项。' },
        { name: 'columns', type: 'number', description: '可选，固定图标视图列数；省略时按容器自适应。' },
        {
          name: 'nativeStructure',
          type: 'boolean',
          default: 'false',
          description:
            '兼容原生 HTML / CSS：仅输出传入的根类名与项目类名，不注入 ds-* 类、组件默认布局、列宽变量或 aria-description。',
        },
        { name: 'emptyState', type: 'ReactNode', description: '列表为空时放在集合根元素内的占位内容。' },
        {
          name: 'itemIdAttribute',
          type: "'data-file-id' | 'data-fm-item'",
          default: "'data-file-id'",
          description: '自定义项目稳定标记；迁移原页面时可保留既有 data-* 选择器。',
        },
        {
          name: 'dragType',
          type: 'string',
          default: "'application/x-ds-files'",
          description: '拖放时读取与写入的自定义 MIME 类型。',
        },
        {
          name: 'canStartDrag',
          type: '(item) => boolean',
          description: '拖动开始时由宿主校验操作状态；false 会取消拖动。',
        },
        { name: 'onActivate', type: '(item) => void', description: '双击项目或在聚焦项目上按 Enter。' },
        {
          name: 'onContextMenu',
          type: '(event, item?) => void',
          description: '项目或空白区域右键；宿主负责渲染和授权菜单。',
        },
        { name: 'onDrop', type: '(ids, targetId?) => void', description: '内部拖放回调；空目标表示列表空白区域。' },
        { name: 'renderDetails', type: '(item) => ReactNode', description: '仅列表视图显示的附加列。' },
        {
          name: 'itemClassName',
          type: '(item) => string | undefined',
          description: '设置文件项宿主类名；nativeStructure 下只输出这些类名及选中标记。',
        },
        {
          name: 'renderItemContent',
          type: '(item, view) => ReactNode',
          description: '替换文件项内部标记；组件继续管理外层 button、选择、焦点和拖放。',
        },
        {
          name: 'labels',
          type: 'Partial<FileCollectionLabels>',
          description: '可选，文件、图标视图与列表视图的无障碍文案。',
        },
      ],
    },
  ],
  a11y: [
    '默认容器使用 listbox / multiselectable；nativeStructure 下由调用方按源模板显式提供语义属性。项目提供 option、aria-selected、稳定 tab 顺序和原生 button 行为。',
    '方向键移动焦点，Space 选择，Enter 激活；禁用项目不能聚焦或拖出。',
    '图标图片使用空 alt，项目名称保持可读；焦点环和选中态跟随系统强调色。',
  ],
};
