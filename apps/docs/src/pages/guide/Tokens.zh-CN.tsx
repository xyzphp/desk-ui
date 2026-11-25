import { Lead, Panel, Table, Tag, Title, type TableColumn } from '@desk/ui';

interface Swatch {
  token: string;
  label: string;
  note: string;
}

const colors: Swatch[] = [
  { token: '--ds-on-accent', label: '强调背景文字', note: '主按钮、步骤和当日日期的统一前景' },
  { token: '--ds-desktop-foreground', label: '桌面图标文字', note: '壁纸上的固定前景，独立于图形亮度' },
  { token: '--ds-icon-image-bg', label: '图片图标底板', note: '图片图标的固定白色底板；透明模式不使用' },
  { token: '--ds-shade', label: '加深混合色', note: '主按钮悬停时的固定混合色' },
  { token: '--ds-window-close', label: 'macOS 关闭', note: '平台固定红色' },
  { token: '--ds-window-minimize', label: 'macOS 最小化', note: '平台固定黄色' },
  { token: '--ds-window-maximize', label: 'macOS 最大化', note: '平台固定绿色' },
  { token: '--ds-window-close-hover', label: 'Windows 关闭悬停', note: '平台固定危险背景' },
  { token: '--ds-theme-swatch-light', label: '浅色主题预览', note: '主题选择器的静态预览' },
  { token: '--ds-theme-swatch-dark', label: '深色主题预览', note: '主题选择器的静态预览' },
  { token: '--ds-theme-swatch-auto', label: '自动主题预览', note: '明暗分割的静态预览' },
  { token: '--ds-wallpaper-sequoia', label: '默认壁纸', note: '保留原有渐变素材，集中维护' },
  { token: '--ds-wallpaper-sonoma', label: '暖色壁纸', note: '桌面背景素材' },
  { token: '--ds-wallpaper-aurora', label: '极光壁纸', note: '桌面背景素材' },
  { token: '--ds-wallpaper-dusk', label: '暮色壁纸', note: '桌面背景素材' },
  { token: '--accent', label: '强调色', note: '主操作、选中、焦点' },
  { token: '--ds-accent-blue', label: '预设蓝色', note: '原站强调色预设，也是 --accent 的默认值' },
  { token: '--ds-accent-purple', label: '预设紫色', note: '桌面控制中心强调色' },
  { token: '--ds-accent-pink', label: '预设粉色', note: '桌面控制中心强调色' },
  { token: '--ds-accent-orange', label: '预设橙色', note: '桌面控制中心强调色' },
  { token: '--ds-accent-green', label: '预设绿色', note: '桌面控制中心强调色' },
  { token: '--ds-accent-cyan', label: '预设青色', note: '桌面控制中心强调色' },
  { token: '--ds-accent-gray', label: '预设灰色', note: '桌面控制中心强调色' },
  { token: '--bg-panel', label: '面板底色', note: '输入框、面板、表格行' },
  { token: '--bg-win', label: '窗口底色', note: '页面背景、表头、侧栏' },
  { token: '--hover', label: '悬停底色', note: '列表项、按钮悬停' },
  { token: '--border', label: '边框', note: '分隔线与控件边框' },
  { token: '--text', label: '正文', note: '标题与正文' },
  { token: '--text-2', label: '次级文字', note: '说明、占位、表头' },
  { token: '--ds-success', label: '成功', note: 'Tag / Notice 的 success' },
  { token: '--ds-chart-blue', label: '图表蓝色', note: '图表固定蓝色配色' },
  { token: '--ds-chart-green', label: '图表绿色', note: '图表固定绿色配色' },
  { token: '--ds-workflow-complete', label: '流程完成', note: '沿用 todo.css 的完成状态标记和子任务进度条颜色' },
  { token: '--ds-warning', label: '警告', note: 'Tag / Notice 的 warning' },
  { token: '--ds-danger', label: '危险', note: 'Tag / Notice 的 danger、删除' },
  { token: '--ds-file-icon', label: '文件图标灰', note: '文件集合与文件管理的文件图标色' },
  { token: '--ds-file-folder', label: '文件夹蓝', note: '文件集合与文件管理的文件夹色' },
  { token: '--ds-danger-soft', label: '危险（柔和）', note: '文件管理的删除 / 失败提示文字' },
  { token: '--ds-danger-bright', label: '危险（亮）', note: '账号页的危险边框与文字' },
  { token: '--ds-danger-text', label: '危险文字', note: '账号页失败提示的深红文字' },
  { token: '--ds-success-text', label: '成功文字', note: '账号页成功提示的深绿文字' },
  { token: '--ds-tone-blue', label: '状态蓝', note: '文件管理的类型标签底色 / 边框' },
  { token: '--ds-tone-blue-text', label: '状态蓝文字', note: '文件管理的类型标签文字（浅色主题）' },
  { token: '--ds-tone-blue-light', label: '状态蓝文字（浅）', note: '文件管理的类型标签文字（深色主题）' },
  { token: '--ds-tone-green', label: '状态绿', note: '文件管理的类型标签底色 / 边框' },
  { token: '--ds-tone-green-text', label: '状态绿文字', note: '文件管理的类型标签文字（浅色主题）' },
  { token: '--ds-tone-green-light', label: '状态绿文字（浅）', note: '文件管理的类型标签文字（深色主题）' },
  { token: '--ds-tone-red', label: '状态红', note: '文件管理的失败标签' },
  { token: '--ds-tone-amber', label: '提醒橙', note: '待办项目的到期提醒底色' },
  { token: '--ds-tone-amber-text', label: '提醒橙文字', note: '待办项目的到期提醒文字' },
  { token: '--ds-tone-amber-text-soft', label: '提醒橙文字（淡）', note: '待办项目的到期提醒次级文字' },
  { token: '--ds-tone-gray', label: '中性灰点', note: '待办任务无次级文字令牌时的回退灰' },
  { token: '--ds-checker-dark', label: '棋盘格深', note: '图片预览透明背景棋盘格' },
  { token: '--ds-checker-darker', label: '预览底色', note: '图片预览暗色底' },
  { token: '--ds-switch-thumb', label: '开关滑块', note: '沿用原生设置开关的白色滑块' },
  { token: '--ds-preview-bg', label: '图片预览衬底', note: '沿用文件预览的深色半透明背景' },
  { token: '--ds-preview-text', label: '图片预览文字', note: '预览工具栏、按钮和状态使用白色前景' },
  { token: '--ds-crop-grid', label: '裁剪辅助网格', note: '沿用原生封面裁剪的 20% 白色辅助线，衬底继续使用预览令牌' },
  { token: '--ds-dialog-overlay', label: '确认弹窗遮罩', note: '沿用原系统 18% 黑色遮罩' },
  { token: '--ds-dialog-danger', label: '确认弹窗危险动作', note: '沿用原系统确认按钮红色' },
  { token: '--ds-dialog-on-action', label: '确认弹窗按钮文字', note: '主操作与危险操作的白色前景' },
  { token: '--ds-selection-bg', label: '柔和选中背景', note: '选择器、模型选项、AI 动作与参考卡片共用' },
  { token: '--ds-selection-border', label: '选中边框', note: '强调色与中性边框混合，hover 保留选中语义' },
  { token: '--ds-input-border-hover', label: '输入悬停边框', note: '中性色，保持细边框' },
  { token: '--ds-input-border-focus', label: '输入聚焦边框', note: '中性色，避免粗蓝框' },
  { token: '--ds-note-yellow', label: '黄色便签', note: '原系统便签纸张色，深浅主题分别维护' },
  { token: '--ds-note-blue', label: '蓝色便签', note: '纸张与颜色选项共用' },
  { token: '--ds-note-green', label: '绿色便签', note: '纸张与颜色选项共用' },
  { token: '--ds-note-pink', label: '粉色便签', note: '纸张与颜色选项共用' },
  { token: '--ds-note-white', label: '白色便签', note: '主题下的中性纸张色' },
  { token: '--ds-liquid-glass-bg', label: '液态玻璃底色', note: '卡片、导航树、分组、看板列与菜单栏 / Dock / 任务栏 / 模式栏的高透纯色玻璃底' },
  { token: '--ds-liquid-glass-bg-strong', label: '液态玻璃强调底色', note: '开始菜单、弹出面板、右键菜单、浮动通知、锁屏倒计时、登录卡片、Dock 排序面板及收藏/筛选栏的通透玻璃底' },
  { token: '--ds-liquid-glass-card', label: '液态玻璃内卡底色', note: '导航书签卡、任务卡片与登录页输入框 / 激活页签等内层玻璃卡面' },
  { token: '--ds-liquid-glass-bg-soft', label: '液态玻璃柔和底色', note: '嵌套分组、开始菜单底栏、分段底槽与添加触发区的轻透玻璃底' },
  { token: '--ds-liquid-glass-chip-bg', label: '液态玻璃胶囊底色', note: '顶栏按钮、开始菜单搜索栏、导航/控制中心胶囊、内联通知卡与悬停态底色' },
  { token: '--ds-liquid-glass-border', label: '液态玻璃高光边框', note: '玻璃轮廓的基础边缘反光描边' },
  { token: '--ds-liquid-glass-border-hover', label: '液态玻璃悬停边框', note: '卡片悬停时增强的高光描边' },
  { token: '--ds-liquid-glass-rim', label: '液态玻璃菲涅耳高光环', note: '主容器、开始菜单与悬浮 Dock 外缘 135° 斜向高光折射环（::before 镂空描边）' },
];

interface Metric {
  token: string;
  value: string;
  use: string;
}

const metrics: Metric[] = [
  { token: '--ds-space-none', value: '0px', use: '无间距' },
  { token: '--ds-space-xs', value: '4px', use: '紧凑间距' },
  { token: '--ds-space-sm', value: '8px', use: '操作组间距' },
  { token: '--ds-space-md', value: '12px', use: '默认布局间距' },
  { token: '--ds-space-lg', value: '16px', use: '字段与内容分组' },
  { token: '--ds-space-xl', value: '24px', use: '大分组间距' },
  { token: '--ds-space-xxl', value: '32px', use: '宽松布局间距' },
  { token: '--ds-resize-hit-size', value: '8px', use: '分栏调整手柄的命中尺寸' },
  { token: '--ds-statistic-value-size', value: '28px', use: '统计主数值字号' },
  { token: '--ds-drawer-sm', value: '320px', use: '小型抽屉尺寸' },
  { token: '--ds-drawer-md', value: '420px', use: '默认抽屉尺寸' },
  { token: '--ds-drawer-lg', value: '640px', use: '大型抽屉尺寸' },
  { token: '--ds-control-md', value: '32px', use: '默认按钮高度' },
  { token: '--ds-control-sm', value: '28px', use: '小按钮、图标按钮' },
  { token: '--ds-field-height', value: '34px', use: '输入框、下拉框最小高度' },
  { token: '--ds-radius-scale', value: '1', use: '圆角比例；皮肤改写，所有像素圆角乘以它' },
  { token: '--ds-shadow-strength', value: '1', use: '投影强度比例；皮肤改写，外投影的透明度乘以它' },
  { token: '--ds-radius-sm', value: '7px × 圆角比例', use: '按钮、输入框圆角' },
  { token: '--ds-radius-md', value: '9px × 圆角比例', use: '面板、列表项圆角' },
  { token: '--ds-switch-width', value: '32px', use: '设置开关轨道宽度' },
  { token: '--ds-switch-height', value: '20px', use: '设置开关轨道高度' },
  { token: '--ds-switch-thumb-size', value: '16px', use: '设置开关滑块尺寸' },
  { token: '--ds-switch-thumb-shadow', value: '0 1px 2px rgba(0, 0, 0, .18)', use: '原生设置开关的滑块投影' },
  { token: '--ds-range-track-height', value: '6px', use: '画质、缩放滑条轨道高度' },
  { token: '--ds-range-thumb-size', value: '18px', use: '滑条滑块外部尺寸' },
  { token: '--ds-picker-shadow', value: '两层中性轻投影', use: '日期 / 时间面板与模型菜单；随深浅主题变化' },
  {
    token: '--ds-widget-shadow',
    value: '0 8px 26px rgba(0, 0, 0, .16) 与内侧高光',
    use: '常规毛玻璃模式下沿用 desktop-widgets.css 的桌面卡片投影，不使用实时背景滤镜',
  },
  {
    token: '--ds-liquid-glass-filter',
    value: 'blur(14px) saturate(210% / 195%)',
    use: '液态玻璃卡片、开始菜单、浮动浮层、系统栏、导航与看板的核心高饱和折射滤镜（浅色 210%，深色 195%）',
  },
  {
    token: '--ds-liquid-glass-filter-soft',
    value: 'blur(10px) saturate(195% / 185%)',
    use: '液态玻璃搜索框、常用收藏、工具栏、Dock 提示泡与轻触发区的轻量折射滤镜（浅色 195%，深色 185%）',
  },
  {
    token: '--ds-liquid-glass-shadow',
    value: '不越界外阴影 + 多向内高光与内发光',
    use: '液态玻璃主容器与系统壳层面板的立体投影与厚玻璃内发光（上方外阴影扩散 <= 11px，避免跨间距波及相邻卡片）',
  },
  {
    token: '--ds-liquid-glass-shadow-sm',
    value: '轻外阴影 + 环绕内高光与内发光',
    use: '液态玻璃搜索框、常用收藏、开始菜单输入栏、Dock 提示泡与内部卡片的轻量高光投影',
  },
  {
    token: '--ds-drag-shadow',
    value: '0 16px 32px rgba(0, 0, 0, .25)',
    use: '沿用 todo.css 的拖动卡片与流程列预览投影',
  },
  {
    token: '--ds-app-icon-brightness',
    value: '1',
    use: '图形与桌面模式默认原色 100%，与原站一致；标签、焦点与选中态保持独立',
  },
  {
    token: '字号',
    value: '12 / 13 / 14 / 28px',
    use: '标签、按钮与表格 12；输入和正文 13；标题 14；页面标题 28。任何可见文字不低于 12px',
  },
];

const metricColumns: TableColumn<Metric>[] = [
  { key: 'token', header: '令牌', width: '26%', render: (m) => <code className="docs-code-inline">{m.token}</code> },
  { key: 'value', header: '取值', width: '24%' },
  { key: 'use', header: '用途' },
];

export function TokensZh() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>设计令牌</Title>
        <Lead>
          令牌集中定义颜色、圆角、间距、字号与阴影，所有组件共用同一份主题。点击菜单栏的主题按钮，或在控制中心切换浅色
          / 深色，色块会随之变化。
        </Lead>
      </header>

      <h2 className="docs-section-title">颜色</h2>
      <div className="docs-grid">
        {colors.map((c) => (
          <div key={c.token} className="docs-swatch">
            <div className="docs-swatch-color" style={{ background: `var(${c.token})` }} />
            <strong>{c.label}</strong>
            <span>
              <code className="docs-code-inline">{c.token}</code>
            </span>
            <span>{c.note}</span>
          </div>
        ))}
      </div>

      <h2 className="docs-section-title">尺寸、圆角与字号</h2>
      <Panel flush>
        <Table wrap caption="尺寸令牌" columns={metricColumns} rows={metrics} rowKey={(m) => m.token} />
      </Panel>

      <h2 className="docs-section-title">焦点与主题</h2>
      <Panel>
        <ul className="docs-list">
          <li>按钮与导航保留独立的键盘焦点提示；复选框和开关只标出控件本身，不框住整行文字。</li>
          <li>
            文本输入、搜索、消息输入和下拉只保留一层中性细边框，不叠加原生黑框、内缩描边或聚焦投影；复合控件的焦点由外框表达。
          </li>
          <li>选中底色、选中边框和菜单投影在主题边界重新计算，嵌套深浅色不会沿用外层底色。</li>
          <li>
            主题通过根元素的 <code className="docs-code-inline">data-theme="light | dark"</code> 切换；缺省为浅色。
          </li>
          <li>
            所有规则位于 <code className="docs-code-inline">@layer ds</code>，与原生页面共存时的优先级见
            <Tag tone="muted">使用约定</Tag>。
          </li>
        </ul>
      </Panel>
    </div>
  );
}
