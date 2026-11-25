import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EmptyState,
  LoadMore,
  Pagination,
  Panel,
  Stepper,
  Table,
  Tabs,
  Tag,
  type LoadMoreLabels,
  type PaginationLabels,
  type SortState,
  type TableColumn,
} from '@desk/ui';
import type { ComponentDoc } from '../../blocks/types';

interface TokenRow {
  id: string;
  name: string;
  scope: string;
  status: 'on' | 'off';
  used: string;
}

const tokenRows: TokenRow[] = [
  { id: '1', name: 'AI 工作助手', scope: '任务读取', status: 'on', used: '2026-11-02' },
  { id: '2', name: '日报脚本', scope: '备忘录读写', status: 'on', used: '2026-10-28' },
  { id: '3', name: '旧版同步', scope: '收藏夹读取', status: 'off', used: '2026-08-14' },
];

const columns: TableColumn<TokenRow>[] = [
  { key: 'name', header: '名称', sortable: true },
  { key: 'scope', header: '权限范围' },
  {
    key: 'status',
    header: '状态',
    width: '90px',
    render: (r) => <Tag tone={r.status === 'on' ? 'success' : 'muted'}>{r.status === 'on' ? '启用' : '停用'}</Tag>,
  },
  { key: 'used', header: '最后使用', sortable: true, align: 'end', width: '130px' },
];

function TableDemo() {
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'ascending' });
  const [selected, setSelected] = useState('1');
  const rows = useMemo(() => {
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...tokenRows].sort(
      (a, b) => String(a[sort.key as keyof TokenRow]).localeCompare(String(b[sort.key as keyof TokenRow]), 'zh') * sign,
    );
  }, [sort]);
  return (
    <Panel flush style={{ width: '100%' }}>
      <Table
        caption="个人令牌"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        selectedKey={selected}
        onRowSelect={(r) => setSelected(r.id)}
      />
    </Panel>
  );
}

const paginationLabels: PaginationLabels = {
  previous: '上一页',
  next: '下一页',
  pageSize: '每页条数',
  page: (page, pageCount) => `${page} / ${pageCount}`,
  total: (total) => `共 ${total} 条`,
};

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const rows = tokenRows.slice((page - 1) * pageSize, page * pageSize);
  return (
    <Panel flush>
      <Table
        caption="分页令牌示例"
        columns={columns.map((column) => ({ ...column, sortable: false }))}
        rows={rows}
        rowKey={(row) => row.id}
      />
      <Pagination
        aria-label="令牌分页"
        total={tokenRows.length}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[2, 5]}
        labels={paginationLabels}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </Panel>
  );
}

const loadMoreLabels: LoadMoreLabels = {
  status: (loaded, total) => `已加载 ${loaded} 条 · 共 ${total} 条`,
  end: '已加载完毕',
  loadMore: '加载更多',
  retry: '重试加载',
  nextBatch: '下一批',
};

function LoadMoreDemo({ failFirst = false, batchLimit = 0 }: { failFirst?: boolean; batchLimit?: number }) {
  const total = 45;
  const size = 15;
  const [items, setItems] = useState<number[]>(() => Array.from({ length: size }, (_, index) => index + 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const failed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const limited = batchLimit > 0 && items.length >= batchLimit;
  const load = (replace = false) => {
    if (loading) return;
    setLoading(true);
    setError('');
    timer.current = setTimeout(() => {
      setLoading(false);
      if (failFirst && !failed.current) {
        failed.current = true;
        setError('网络错误，请重试');
        return;
      }
      setItems((current) => {
        const start = replace ? items.length : current.length;
        const next = Array.from({ length: Math.min(size, total - start) }, (_, index) => start + index + 1);
        return replace ? next : [...current, ...next];
      });
      if (replace) root.current?.scrollTo({ top: 0 });
    }, 500);
  };
  return (
    <Panel flush>
      <div ref={root} style={{ maxHeight: 200, overflow: 'auto' }}>
        {items.map((item) => (
          <div key={item} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
            记录 {item}
          </div>
        ))}
        <LoadMore
          style={{ padding: '10px 16px' }}
          loaded={items.length}
          total={total}
          end={items.length >= total}
          limited={limited && items.length < total}
          error={error}
          disabled={loading}
          auto={!loading && !limited}
          root={root}
          labels={loadMoreLabels}
          onLoadMore={() => load()}
          onNextBatch={() => load(true)}
        />
      </div>
    </Panel>
  );
}

function TabsDemo() {
  return (
    <div style={{ width: '100%' }}>
      <Tabs
        aria-label="令牌详情"
        defaultValue="overview"
        items={[
          { value: 'overview', label: '概览', content: '连接方式、有效期与最后使用时间。' },
          { value: 'scopes', label: 'API 范围', content: '该令牌可调用的接口范围，取账号权限的交集。' },
          { value: 'danger', label: '危险操作', content: '删除令牌后无法恢复。' },
          { value: 'off', label: '审计（未开放）', disabled: true },
        ]}
      />
    </div>
  );
}

function StepperDemo() {
  const steps = [
    { id: 'source', label: '连接数据源' },
    { id: 'table', label: '选择数据表' },
    { id: 'model', label: '配置数据模型' },
    { id: 'page', label: '设计页面操作' },
    { id: 'report', label: '设计统计报表' },
    { id: 'publish', label: '发布应用' },
  ];
  const [current, setCurrent] = useState('model');
  return (
    <Panel flush style={{ width: '100%' }}>
      <Stepper aria-label="发布流程" steps={steps} current={current} onSelect={setCurrent} />
      <EmptyState>当前步骤：{steps.find((s) => s.id === current)?.label}</EmptyState>
    </Panel>
  );
}

export const tableDoc: ComponentDoc = {
  name: { 'zh-CN': '数据表格', 'en-US': 'Data table' },
  summary: {
    'zh-CN': '数据表：固定布局、粘性表头、可排序、可选中行。排序由调用方完成，组件只负责表头状态和事件。',
    'en-US': 'Table with fixed layout, sticky header, sortable columns, and selectable rows; sorting is done by the caller while the component handles header state and events.',
  },
  usage: [
    '列通过 columns 声明；缺省 render 时读取行对象的同名字段。',
    '排序是受控的：传入 sort 与 onSortChange，在回调里对 rows 重新排序（或请求服务端）。',
    '数据列表默认单行省略；说明类表格（如本页 API）用 wrap 允许换行。',
    '行选中用 onRowSelect + selectedKey，行可聚焦并支持 Enter / Space。',
    '需要分页时在同一个 Panel 下组合 Pagination；Table 只接收当前页 rows，不自行切片或请求。',
  ],
  demos: [
    {
      title: '排序与选中',
      description: '点击"名称"或"最后使用"表头切换排序，点击行选中。',
      code: `<Table
  caption="个人令牌"
  columns={columns}
  rows={rows}
  rowKey={(r) => r.id}
  sort={sort}
  onSortChange={setSort}
  selectedKey={selected}
  onRowSelect={(r) => setSelected(r.id)}
/>`,
      render: () => <TableDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Table<T>',
      props: [
        {
          name: 'columns',
          type: 'TableColumn<T>[]',
          description: '必填。key / header / render / sortable / align / width。',
        },
        { name: 'rows', type: 'T[]', description: '必填，数据行。' },
        { name: 'rowKey', type: '(row: T) => string', description: '必填，稳定行标识。' },
        { name: 'caption', type: 'string', description: '必填，无障碍标题（视觉隐藏）。' },
        { name: 'sort / onSortChange', type: 'SortState / (next) => void', description: '受控排序。' },
        { name: 'selectedKey / onRowSelect', type: 'string / (row) => void', description: '行选中。' },
        { name: 'wrap', type: 'boolean', description: '单元格允许换行。' },
        { name: 'ref', type: 'Ref<HTMLDivElement>', description: '滚动容器，供宿主采集 / 恢复横纵滚动位置。' },
        { name: 'empty', type: 'ReactNode', description: '无数据时显示的内容，通常是 EmptyState。' },
      ],
    },
  ],
  a11y: [
    '原生 table 语义，表头 scope="col"，可排序列提供 aria-sort。',
    '排序表头是按钮，可 Tab 聚焦；选中行以 aria-selected 表达。',
  ],
};

export const tabsDoc: ComponentDoc = {
  name: { 'zh-CN': '页签', 'en-US': 'Tabs' },
  summary: {
    'zh-CN': '页签：用于同一对象的多个视图（概览 / 权限 / 危险操作）。支持受控与非受控。',
    'en-US': 'Tabs for multiple views of one object (overview / permissions / dangerous actions), with controlled and uncontrolled modes.',
  },
  usage: [
    '页签数量保持在一行内；更多层级请改用侧栏或分步。',
    '禁用的页签不会参与方向键切换。',
    '内容既可通过 content 传入，也可在外部根据 value 自行渲染。',
  ],
  demos: [
    {
      title: '方向键切换',
      description: '聚焦页签后使用左右方向键、Home、End。',
      code: `<Tabs aria-label="令牌详情" defaultValue="overview" items={[
  { value: 'overview', label: '概览', content: '…' },
  { value: 'scopes', label: 'API 范围', content: '…' },
  { value: 'off', label: '审计（未开放）', disabled: true },
]} />`,
      render: () => <TabsDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Tabs',
      props: [
        { name: 'items', type: 'TabItem[]', description: '必填。value / label / content / disabled。' },
        { name: 'value / defaultValue', type: 'string', description: '受控 / 非受控当前页签。' },
        { name: 'onChange', type: '(value: string) => void', description: '切换回调。' },
        { name: 'aria-label', type: 'string', description: '必填，页签组名称。' },
      ],
    },
  ],
  a11y: [
    'tablist / tab / tabpanel 角色齐全，roving tabindex：只有当前页签在 Tab 顺序中。',
    '方向键、Home、End 切换并移动焦点。',
  ],
};

export const stepperDoc: ComponentDoc = {
  name: { 'zh-CN': '步骤导航', 'en-US': 'Stepper' },
  summary: {
    'zh-CN': '分步导航，用于应用工坊和通知服务配置。已完成步骤显示勾选与强调色连线。',
    'en-US': 'Step navigation for the app workshop and notification service settings; completed steps show a check and accent-colored connector.',
  },
  usage: [
    'current 之前的步骤视为已完成。',
    '步骤数量由 steps 决定，宽度均分；窄容器下保持单行，文字换行。',
    '是否允许跳步由调用方决定，不允许的步骤传 disabled。通知服务需先保存配置，再启用测试邮件步骤。',
  ],
  demos: [
    {
      title: '六步发布流程',
      code: `<Stepper aria-label="发布流程" steps={steps} current={current} onSelect={setCurrent} />`,
      render: () => <StepperDemo />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Stepper',
      props: [
        { name: 'steps', type: 'StepItem[]', description: '必填。id / label / description / disabled。' },
        { name: 'current', type: 'string', description: '必填，当前步骤 id。' },
        { name: 'onSelect', type: '(id: string) => void', description: '点击步骤回调。' },
        { name: 'aria-label', type: 'string', description: '必填，导航名称。' },
      ],
    },
  ],
  a11y: ['nav + ol 结构，当前步骤 aria-current="step"。', '步骤按钮可聚焦，禁用步骤不可操作。'],
};

export const paginationDoc: ComponentDoc = {
  name: { 'zh-CN': '分页', 'en-US': 'Pagination' },
  summary: {
    'zh-CN': '沿用日志与生成应用的总数、条数选择、上一页 / 下一页布局。复用 Button、Select 和 ToolbarActions，数据处理留给调用方。',
    'en-US': 'Follows the total-count, page-size, and previous / next layout from logs and generated apps, reusing Button, Select, and ToolbarActions; data handling stays with the caller.',
  },
  usage: [
    '页码从 1 开始。page + onPageChange 受控；defaultPage 可提供非受控初始页码。表格切片、请求、错误反馈由调用方处理。',
    '总数为 0 时显示 1 / 1，首尾页分别禁用上一页 / 下一页；加载期间可传 disabled 防止重复操作。',
    'pageSize 始终受控。条数选择只触发 onPageSizeChange，调用方应同时更新 pageSize 和 page，避免两次独立回调导致重复请求。',
    'pageSizeOptions 不传或为空时隐藏选择器；提供选项但不传 onPageSizeChange 时选择器禁用。当前条数会保留为选项，重复或非正整数选项被过滤。',
    '所有文案由 labels 与 aria-label 传入，组件库不包含业务语言。总数减少时只收敛显示页码，不自动回调；调用方仍需同步查询状态。非有限总数按 0、非正或非有限条数按 1 处理。',
  ],
  demos: [
    {
      title: '表格翻页与条数选择',
      description: '使用本页的三条示例记录。选择每页条数后回到第一页，组件本身不请求数据。',
      code: `const paginationLabels: PaginationLabels = {
  previous: '上一页', next: '下一页', pageSize: '每页条数',
  page: (page, pageCount) => \`\${page} / \${pageCount}\`,
  total: (total) => \`共 \${total} 条\`,
};
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(2);
const rows = tokenRows.slice((page - 1) * pageSize, page * pageSize);

<Panel flush>
  <Table caption="分页令牌示例" columns={columns.map((column) => ({ ...column, sortable: false }))} rows={rows} rowKey={(row) => row.id} />
  <Pagination
    aria-label="令牌分页" total={tokenRows.length} page={page} pageSize={pageSize} pageSizeOptions={[2, 5]}
    labels={paginationLabels} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
  />
</Panel>`,
      render: () => <PaginationDemo />,
      layout: 'stack',
    },
    {
      title: '空数据与禁用',
      description: '复用上一示例的 paginationLabels。空数据与暂不可操作的状态保留页码信息。',
      code: `<Pagination aria-label="空列表分页" total={0} pageSize={20} labels={paginationLabels} />
<Pagination aria-label="加载中分页" total={120} page={2} pageSize={20} pageSizeOptions={[20, 50]} labels={paginationLabels} disabled />`,
      render: () => (
        <>
          <Pagination aria-label="空列表分页" total={0} pageSize={20} labels={paginationLabels} />
          <Pagination
            aria-label="加载中分页"
            total={120}
            page={2}
            pageSize={20}
            pageSizeOptions={[20, 50]}
            labels={paginationLabels}
            disabled
          />
        </>
      ),
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'Pagination',
      props: [
        { name: 'aria-label', type: 'string', description: '必填，分页导航的可访问名称。' },
        { name: 'total', type: 'number', description: '必填，总记录数；负数按 0 处理，小数向下取整。' },
        { name: 'pageSize', type: 'number', description: '必填，每页条数。' },
        { name: 'page / defaultPage', type: 'number', default: '1', description: '受控页码 / 非受控初始页码。' },
        { name: 'onPageChange', type: '(page: number) => void', description: '仅在用户翻页时回调新页码。' },
        { name: 'pageSizeOptions', type: 'readonly number[]', description: '可选的每页条数，过滤后按升序显示。' },
        { name: 'onPageSizeChange', type: '(pageSize: number) => void', description: '只回调条数，不自动重置页码。' },
        { name: 'labels', type: 'PaginationLabels', description: '必填，所有控件标签与信息格式。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用翻页按钮与条数选择。' },
        {
          name: '…nav 属性',
          type: "Omit<ComponentProps<'nav'>, 'children'>",
          description: 'id / className / ref / data-* / aria-busy 等透传。',
        },
      ],
    },
    {
      component: 'PaginationLabels',
      props: [
        {
          name: 'previous / next / pageSize',
          type: 'string',
          description: '必填，上一页 / 下一页按钮与条数选择器标签。',
        },
        { name: 'page', type: '(page: number, pageCount: number) => string', description: '必填，当前页信息。' },
        { name: 'total', type: '(total: number) => string', description: '必填，总数信息。' },
      ],
    },
  ],
  a11y: [
    'nav 使用调用方提供的名称，按钮和下拉框保留原生键盘行为与公共焦点样式。',
    '页码使用礼貌的 status 实时区域，翻页不把焦点移到表格；首尾与 disabled 状态使用原生 disabled。',
    '布局随容器换行，字号为 12px；颜色与按钮、下拉框一起跟随主题。',
  ],
};

export const loadMoreDoc: ComponentDoc = {
  name: { 'zh-CN': '加载更多', 'en-US': 'Load more' },
  summary: {
    'zh-CN': '滚动分页的底栏：已加载 / 总数、错误、加载更多与下一批，滚动到底自动触发。',
    'en-US': 'Footer for scroll paging: loaded / total counts, error state, load-more action, and automatic triggering when scrolled to the bottom.',
  },
  usage: [
    '用于无页码的滚动列表。loaded / total 只用于状态文字；end 表示已全部加载，limited 表示已达单批上限（运行页取 1000 条或 6 MB），此时不再自动加载，改为显式“下一批”。',
    'auto 开启时，底部按钮进入可见区会调用 onLoadMore。重新观察会立即回调一次，所以上一批加载完成后若底部仍可见会继续加载；调用方在加载中、表单打开或出错时传 auto={false}。出错、完毕和达到上限时组件自己也不观察。',
    '滚动在容器内时通过 root 传入该容器的 ref，缺省以视口为根。浏览器没有 IntersectionObserver 时只保留手动按钮。',
    '组件不请求、不合并、不去重：加载中的旧请求取消、按键去重、上限判断和“下一批”清空旧批次都由调用方处理，状态文字用 labels.status 传入，组件库不含业务语言。',
  ],
  demos: [
    {
      title: '滚动到底自动加载',
      description: '每批 15 条，共 45 条；滚动到底部自动加载下一批，也可点击按钮。',
      code: `<LoadMore loaded={items.length} total={45} end={items.length >= 45} disabled={loading} auto={!loading}
  root={scrollRef} labels={labels} onLoadMore={load} />`,
      render: () => <LoadMoreDemo />,
      layout: 'stack',
    },
    {
      title: '失败重试',
      description: '第一次加载失败：自动加载暂停，按钮变为重试。',
      code: `<LoadMore loaded={items.length} total={45} error="网络错误，请重试" auto={false} labels={labels} onLoadMore={load} />`,
      render: () => <LoadMoreDemo failFirst />,
      layout: 'stack',
    },
    {
      title: '单批上限与下一批',
      description: '达到 30 条上限后停止自动加载，点击下一批会换成新的一批并回到顶部。',
      code: `<LoadMore loaded={items.length} total={45} limited={items.length >= 30} auto={!loading && items.length < 30}
  labels={labels} onLoadMore={load} onNextBatch={() => load(true)} />`,
      render: () => <LoadMoreDemo batchLimit={30} />,
      layout: 'stack',
    },
  ],
  api: [
    {
      component: 'LoadMore',
      props: [
        { name: 'loaded / total', type: 'number', description: '必填，已加载条数与总数，仅用于状态文字。' },
        { name: 'end', type: 'boolean', default: 'false', description: '已全部加载：显示完毕文字，不再加载。' },
        {
          name: 'limited',
          type: 'boolean',
          default: 'false',
          description: '已达单批上限：不再自动加载，显示下一批按钮。',
        },
        { name: 'error', type: 'string', description: '上次加载错误；存在时停止自动加载，按钮显示重试。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '禁用按钮。' },
        { name: 'auto', type: 'boolean', default: 'true', description: '滚动到底自动触发 onLoadMore。' },
        { name: 'root', type: 'RefObject<Element | null>', description: '观察所在的滚动容器，缺省为视口。' },
        {
          name: 'onLoadMore / onNextBatch',
          type: '() => void',
          description: 'onLoadMore 必填；下一批按钮回调，缺省时该按钮禁用。',
        },
        {
          name: 'labels',
          type: 'LoadMoreLabels',
          description: '必填：status(loaded, total)、end、loadMore、retry、nextBatch。',
        },
        {
          name: '…footer 属性',
          type: "Omit<ComponentProps<'footer'>, 'children'>",
          description: 'className / style / data-* 等透传。',
        },
      ],
    },
  ],
  a11y: [
    '状态文字是 role="status" 的礼貌播报，错误是 role="alert"；按钮为原生 button，禁用时不可聚焦。',
    '自动加载不改变焦点，也不依赖指针；键盘用户可随时使用加载更多 / 重试 / 下一批按钮。',
  ],
};
