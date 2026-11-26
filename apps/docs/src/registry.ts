import docs0 from './pages/components/floating?metadata';
import docs1 from './pages/components/essential-inputs?metadata';
import docs2 from './pages/components/copy?metadata';
import docs3 from './pages/components/config?metadata';
import docs4 from './pages/components/tags?metadata';
import docs5 from './pages/components/resizable?metadata';
import docs6 from './pages/components/statistic?metadata';
import docs7 from './pages/components/breadcrumb?metadata';
import docs8 from './pages/components/spacing?metadata';
import docs9 from './pages/components/drawer?metadata';
import docs10 from './pages/components/search-select?metadata';
import docs11 from './pages/components/tree?metadata';
import docs12 from './pages/components/action-overlays?metadata';
import docs13 from './pages/components/editor-media?metadata';
import docs14 from './pages/components/sortable?metadata';
import docs15 from './pages/components/form-extras?metadata';
import docs16 from './pages/components/display-extras?metadata';
import docs17 from './pages/components/input-extras?metadata';
import docs18 from './pages/components/month-calendar?metadata';
import docs19 from './pages/components/lock-screen?metadata';
import docs20 from './pages/components/shell-launchers?metadata';
import docs21 from './pages/components/shell-panels?metadata';
import { createElement, lazy, type ReactElement } from 'react';
import { appGradients, type IconName } from '@xyzos/desk-ui';
import { ComponentPage } from './blocks/ComponentPage';
import type { LocalizedText } from './blocks/docText';
import type { ComponentDoc, DocMetadata } from './blocks/types';
import docs22 from './pages/components/button?metadata';
import docs23 from './pages/components/field?metadata';
import docs24 from './pages/components/feedback?metadata';

import docs25 from './pages/components/layout?metadata';
import docs26 from './pages/components/misc?metadata';
import docs27 from './pages/components/shell?metadata';
import docs28 from './pages/components/dialogs?metadata';
import docs29 from './pages/components/data?metadata';
import docs30 from './pages/components/trees?metadata';
import docs31 from './pages/components/media?metadata';
import docs32 from './pages/components/date-time?metadata';
import docs33 from './pages/components/ai-tools?metadata';
import docs34 from './pages/components/basic?metadata';
import docs35 from './pages/components/desktop-cards?metadata';
import docs39 from './pages/components/file-collection?metadata';
import docs38 from './pages/components/message-thread?metadata';
import docs40 from './pages/components/chart?metadata';
import docs41 from './pages/components/admin-shell?metadata';
import docs42 from './pages/components/start-menu?metadata';
import docs43 from './pages/components/language-switcher?metadata';
import docs44 from './pages/components/guide-tour?metadata';
import docs45 from './pages/components/app-card?metadata';
import docs46 from './pages/components/image-gallery?metadata';
import docs47 from './pages/components/detail-layout?metadata';

/** 组件分类。每个分类在文档桌面上是一个应用图标，点击打开一个窗口，窗口左侧列出该分类下的页面。 */
export interface DocCategory {
  id: string;
  name: string | LocalizedText;
  summary: string | LocalizedText;
  icon: IconName;
  color: string;
}

export const categories: DocCategory[] = [
  {
    id: 'guide',
    name: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
    summary: {
      'zh-CN': '概览、设计令牌、使用约定与 LLMs 文档',
      'en-US': 'Overview, design tokens, conventions, and LLMs docs',
    },
    icon: 'book-open',
    color: appGradients.blue,
  },
  {
    id: 'foundation',
    name: { 'zh-CN': '基础', 'en-US': 'Foundations' },
    summary: { 'zh-CN': '按钮、文字、头像、徽标、进度与容器', 'en-US': 'Buttons, text, avatars, badges, progress, and containers' },
    icon: 'layers',
    color: appGradients.purple,
  },
  {
    id: 'shell',
    name: { 'zh-CN': '桌面系统', 'en-US': 'Desktop system' },
    summary: { 'zh-CN': '菜单栏、程序坞、窗口、弹层与通知', 'en-US': 'Menu bar, dock, windows, overlays, and notifications' },
    icon: 'app-window',
    color: appGradients.indigo,
  },
  {
    id: 'forms',
    name: { 'zh-CN': '表单', 'en-US': 'Forms' },
    summary: { 'zh-CN': '输入控件、选择器与 AI 工具', 'en-US': 'Inputs, pickers, and AI tools' },
    icon: 'text-cursor-input',
    color: appGradients.green,
  },
  {
    id: 'feedback',
    name: { 'zh-CN': '反馈', 'en-US': 'Feedback' },
    summary: { 'zh-CN': '标签、提示、空态与加载', 'en-US': 'Tags, notices, empty states, and loading' },
    icon: 'bell',
    color: appGradients.orange,
  },
  {
    id: 'layout',
    name: { 'zh-CN': '布局', 'en-US': 'Layout' },
    summary: { 'zh-CN': '面板、工具栏、列表与导航', 'en-US': 'Panels, toolbars, lists, and navigation' },
    icon: 'layout-grid',
    color: appGradients.teal,
  },
  {
    id: 'data',
    name: { 'zh-CN': '数据', 'en-US': 'Data' },
    summary: { 'zh-CN': '表格、页签、分步与日历', 'en-US': 'Tables, tabs, steppers, and calendars' },
    icon: 'columns',
    color: appGradients.red,
  },
];

export interface DocPage {
  /** 路由标识，对应 #/<id>。 */
  id: string;
  title: string | LocalizedText;
  summary: string | LocalizedText;
  category: string;
  icon: IconName;
  keywords?: readonly string[];
  render: () => ReactElement;
}

const component = (
  id: string,
  category: string,
  icon: IconName,
  metadata: DocMetadata,
  load: () => Promise<ComponentDoc>,
): DocPage => {
  const Content = lazy(async () => {
    const doc = await load();
    return { default: () => createElement(ComponentPage, { doc }) };
  });
  return {
    id,
    title: metadata.name,
    summary: metadata.summary,
    category,
    icon,
    keywords: metadata.keywords,
    render: () => createElement(Content),
  };
};

const IconPage = lazy(() => import('./pages/components/icon').then((module) => ({ default: module.IconPage })));
const Conventions = lazy(() => import('./pages/guide/Conventions').then((module) => ({ default: module.Conventions })));
const LLMs = lazy(() => import('./pages/guide/LLMs').then((module) => ({ default: module.LLMs })));
const Overview = lazy(() => import('./pages/guide/Overview').then((module) => ({ default: module.Overview })));
const Tokens = lazy(() => import('./pages/guide/Tokens').then((module) => ({ default: module.Tokens })));

function renderOverview() {
  return createElement(Overview, {
    componentCount: pages.filter((page) => page.category !== 'guide').length,
    pageCount: pages.length,
    categoryCount: categories.filter((category) => category.id !== 'guide').length,
  });
}

/** 新增组件文档页时在这里登记并选择分类，桌面图标、窗口导航自动生效。 */
export const pages: DocPage[] = [
  component('window-dialog', 'shell', 'app-window', docs28.windowDialogDoc!, () =>
    import('./pages/components/dialogs').then((module) => module.windowDialogDoc),
  ),
  component('selection-area', 'shell', 'check-square', docs36.selectionAreaDoc!, () =>
    import('./pages/components/desktop-interactions').then((module) => module.selectionAreaDoc),
  ),
  component('desktop-icon-grid', 'shell', 'layout-grid', docs36.desktopIconGridDoc!, () =>
    import('./pages/components/desktop-interactions').then((module) => module.desktopIconGridDoc),
  ),
  component('widget-layout', 'shell', 'layers', docs36.widgetLayoutDoc!, () =>
    import('./pages/components/desktop-interactions').then((module) => module.widgetLayoutDoc),
  ),
  component('dock-workspace', 'shell', 'panel-bottom-close', docs36.dockWorkspaceDoc!, () =>
    import('./pages/components/desktop-interactions').then((module) => module.dockWorkspaceDoc),
  ),
  component('lock-screen', 'shell', 'key-round', docs19.lockScreenDoc!, () =>
    import('./pages/components/lock-screen').then((module) => module.lockScreenDoc),
  ),
  component('lock-countdown', 'shell', 'clock-3', docs19.lockCountdownDoc!, () =>
    import('./pages/components/lock-screen').then((module) => module.lockCountdownDoc),
  ),
  component('command-palette', 'shell', 'search', docs20.commandPaletteDoc!, () =>
    import('./pages/components/shell-launchers').then((module) => module.commandPaletteDoc),
  ),
  component('launchpad', 'shell', 'layout-grid', docs20.launchpadDoc!, () =>
    import('./pages/components/shell-launchers').then((module) => module.launchpadDoc),
  ),
  component('notification-center', 'shell', 'bell', docs21.notificationCenterDoc!, () =>
    import('./pages/components/shell-panels').then((module) => module.notificationCenterDoc),
  ),
  component('window-switcher', 'shell', 'app-window', docs21.windowSwitcherDoc!, () =>
    import('./pages/components/shell-panels').then((module) => module.windowSwitcherDoc),
  ),
  component('range-slider', 'forms', 'sliders-horizontal', docs17.rangeSliderDoc!, () =>
    import('./pages/components/input-extras').then((module) => module.rangeSliderDoc),
  ),
  component('range-input', 'forms', 'sliders-horizontal', docs17.rangeInputDoc!, () =>
    import('./pages/components/input-extras').then((module) => module.rangeInputDoc),
  ),
  component('otp-input', 'forms', 'key-round', docs17.otpInputDoc!, () =>
    import('./pages/components/input-extras').then((module) => module.otpInputDoc),
  ),
  component('rating', 'forms', 'star', docs17.ratingDoc!, () =>
    import('./pages/components/input-extras').then((module) => module.ratingDoc),
  ),
  component('month-calendar', 'data', 'calendar-days', docs18.monthCalendarDoc!, () =>
    import('./pages/components/month-calendar').then((module) => module.monthCalendarDoc),
  ),
  component('checkbox-group', 'forms', 'check-square', docs15.checkboxGroupDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.checkboxGroupDoc),
  ),
  component('color-picker', 'forms', 'palette', docs15.colorPickerDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.colorPickerDoc),
  ),
  component('form-section', 'forms', 'columns', docs15.formSectionDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.formSectionDoc),
  ),
  component('form-actions', 'forms', 'check', docs15.formActionsDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.formActionsDoc),
  ),
  component('field-addon', 'forms', 'boxes', docs15.fieldAddonDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.fieldAddonDoc),
  ),
  component('input-group', 'forms', 'columns', docs15.inputGroupDoc!, () =>
    import('./pages/components/form-extras').then((module) => module.inputGroupDoc),
  ),
  component('timeline', 'data', 'clock-3', docs16.timelineDoc!, () =>
    import('./pages/components/display-extras').then((module) => module.timelineDoc),
  ),
  component('avatar-group', 'foundation', 'users', docs16.avatarGroupDoc!, () =>
    import('./pages/components/display-extras').then((module) => module.avatarGroupDoc),
  ),
  component('kbd', 'foundation', 'type', docs16.kbdDoc!, () =>
    import('./pages/components/display-extras').then((module) => module.kbdDoc),
  ),
  component('result', 'feedback', 'circle-check', docs16.resultDoc!, () =>
    import('./pages/components/display-extras').then((module) => module.resultDoc),
  ),
  component('loading-overlay', 'feedback', 'rotate-ccw', docs16.loadingOverlayDoc!, () =>
    import('./pages/components/display-extras').then((module) => module.loadingOverlayDoc),
  ),
  component('image-cropper', 'forms', 'image', docs13.imageCropperDoc!, () =>
    import('./pages/components/editor-media').then((module) => module.imageCropperDoc),
  ),
  component('markdown-editor', 'forms', 'pencil', docs13.markdownEditorDoc!, () =>
    import('./pages/components/editor-media').then((module) => module.markdownEditorDoc),
  ),
  component('markdown-view', 'forms', 'book-open', docs37.markdownViewDoc!, () =>
    import('./pages/components/markdown-view').then((module) => module.markdownViewDoc),
  ),
  component('sortable-list', 'layout', 'grip-vertical', docs14.sortableListDoc!, () =>
    import('./pages/components/sortable').then((module) => module.sortableListDoc),
  ),
  component('combobox', 'forms', 'search', docs10.comboboxDoc!, () =>
    import('./pages/components/search-select').then((module) => module.comboboxDoc),
  ),
  component('multi-select', 'forms', 'check-square', docs10.multiSelectDoc!, () =>
    import('./pages/components/search-select').then((module) => module.multiSelectDoc),
  ),
  component('tree', 'data', 'folder', docs11.treeDoc!, () =>
    import('./pages/components/tree').then((module) => module.treeDoc),
  ),
  component('dropdown-menu', 'shell', 'chevron-down', docs12.dropdownMenuDoc!, () =>
    import('./pages/components/action-overlays').then((module) => module.dropdownMenuDoc),
  ),
  component('popconfirm', 'feedback', 'circle-check', docs12.popconfirmDoc!, () =>
    import('./pages/components/action-overlays').then((module) => module.popconfirmDoc),
  ),
  component('coachmark', 'feedback', 'message-circle', docs44.coachmarkDoc!, () =>
    import('./pages/components/guide-tour').then((module) => module.coachmarkDoc),
  ),
  component('tour', 'feedback', 'list-checks', docs44.tourDoc!, () =>
    import('./pages/components/guide-tour').then((module) => module.tourDoc),
  ),
  component('anchor-popover', 'feedback', 'sliders-horizontal', docs0.anchorPopoverDoc!, () =>
    import('./pages/components/floating').then((module) => module.anchorPopoverDoc),
  ),
  component('tooltip', 'feedback', 'help-circle', docs0.tooltipDoc!, () =>
    import('./pages/components/floating').then((module) => module.tooltipDoc),
  ),
  component('toast', 'feedback', 'bell', docs0.toastDoc!, () =>
    import('./pages/components/floating').then((module) => module.toastDoc),
  ),
  component('modal', 'shell', 'app-window', docs0.modalDoc!, () =>
    import('./pages/components/floating').then((module) => module.modalDoc),
  ),
  {
    id: 'overview',
    title: { 'zh-CN': '概览', 'en-US': 'Overview' },
    summary: { 'zh-CN': '组件库总数、概览与整页示例', 'en-US': 'Component counts, overview, and full-page examples' },
    category: 'guide',
    icon: 'layers',
    render: renderOverview,
  },
  {
    id: 'tokens',
    title: { 'zh-CN': '设计令牌', 'en-US': 'Design tokens' },
    summary: { 'zh-CN': '颜色、尺寸、圆角与字号', 'en-US': 'Colors, sizes, radii, and font sizes' },
    category: 'guide',
    icon: 'palette',
    render: () => createElement(Tokens),
  },
  {
    id: 'conventions',
    title: { 'zh-CN': '使用约定', 'en-US': 'Conventions' },
    summary: { 'zh-CN': '接入、样式与行为约定', 'en-US': 'Integration, styling, and behavior conventions' },
    category: 'guide',
    icon: 'shield-check',
    render: () => createElement(Conventions),
  },
  {
    id: 'llms',
    title: { 'zh-CN': 'LLMs 文档', 'en-US': 'LLMs documentation' },
    summary: {
      'zh-CN': '为 AI 编程工具提供可直接读取的 @xyzos/desk-ui 索引、完整参考与逐页 Markdown',
      'en-US': 'Machine-readable @xyzos/desk-ui index, full reference, and per-page Markdown for AI coding tools',
    },
    category: 'guide',
    icon: 'bot',
    keywords: ['llm', 'llms.txt', 'llms-full.txt', 'markdown', '大语言模型', 'AI'],
    render: () => createElement(LLMs),
  },

  {
    id: 'icon',
    title: { 'zh-CN': '图标', 'en-US': 'Icons' },
    summary: { 'zh-CN': '图标与图库', 'en-US': 'Icons and gallery' },
    category: 'foundation',
    icon: 'sparkles',
    render: () => createElement(IconPage),
  },
  component('button', 'foundation', 'component', docs22.doc!, () =>
    import('./pages/components/button').then((module) => module.doc),
  ),
  component('icon-button', 'foundation', 'pencil', docs22.iconButtonDoc!, () =>
    import('./pages/components/button').then((module) => module.iconButtonDoc),
  ),
  component('text', 'foundation', 'type', docs34.textDoc!, () =>
    import('./pages/components/basic').then((module) => module.textDoc),
  ),
  component('link', 'foundation', 'external-link', docs34.linkDoc!, () =>
    import('./pages/components/basic').then((module) => module.linkDoc),
  ),
  component('divider', 'foundation', 'minus', docs34.dividerDoc!, () =>
    import('./pages/components/basic').then((module) => module.dividerDoc),
  ),
  component('avatar', 'foundation', 'contact-round', docs34.avatarDoc!, () =>
    import('./pages/components/basic').then((module) => module.avatarDoc),
  ),
  component('badge', 'foundation', 'bell', docs34.badgeDoc!, () =>
    import('./pages/components/basic').then((module) => module.badgeDoc),
  ),
  component('progress', 'foundation', 'sliders-horizontal', docs34.progressDoc!, () =>
    import('./pages/components/basic').then((module) => module.progressDoc),
  ),
  component('skeleton', 'foundation', 'layers', docs34.skeletonDoc!, () =>
    import('./pages/components/basic').then((module) => module.skeletonDoc),
  ),
  component('workspace', 'foundation', 'app-window', docs34.workspaceDoc!, () =>
    import('./pages/components/basic').then((module) => module.workspaceDoc),
  ),
  component('scrollable', 'foundation', 'columns', docs34.scrollableDoc!, () =>
    import('./pages/components/basic').then((module) => module.scrollableDoc),
  ),
  component('config-provider', 'foundation', 'settings', docs3.configProviderDoc!, () =>
    import('./pages/components/config').then((module) => module.configProviderDoc),
  ),
  component('copy-button', 'foundation', 'copy', docs2.copyButtonDoc!, () =>
    import('./pages/components/copy').then((module) => module.copyButtonDoc),
  ),
  component('code-block', 'foundation', 'file-text', docs2.codeBlockDoc!, () =>
    import('./pages/components/copy').then((module) => module.codeBlockDoc),
  ),
  component('chip', 'foundation', 'bookmark', docs4.chipDoc!, () =>
    import('./pages/components/tags').then((module) => module.chipDoc),
  ),

  component('menubar', 'shell', 'panel-bottom-close', docs27.menubarDoc!, () =>
    import('./pages/components/shell').then((module) => module.menubarDoc),
  ),
  component('dock', 'shell', 'layout-grid', docs27.dockDoc!, () =>
    import('./pages/components/shell').then((module) => module.dockDoc),
  ),
  component('taskbar', 'shell', 'panel-bottom-close', docs27.taskbarDoc!, () =>
    import('./pages/components/shell').then((module) => module.taskbarDoc),
  ),
  component('app-icon', 'shell', 'component', docs27.appIconDoc!, () =>
    import('./pages/components/shell').then((module) => module.appIconDoc),
  ),
  component('window', 'shell', 'app-window', docs27.windowDoc!, () =>
    import('./pages/components/shell').then((module) => module.windowDoc),
  ),
  component('admin-shell', 'shell', 'app-window', docs41.adminShellDoc!, () =>
    import('./pages/components/admin-shell').then((module) => module.adminShellDoc),
  ),
  component('start-menu', 'shell', 'layout-grid', docs42.startMenuDoc!, () =>
    import('./pages/components/start-menu').then((module) => module.startMenuDoc),
  ),
  component('language-switcher', 'shell', 'languages', docs43.languageSwitcherDoc!, () =>
    import('./pages/components/language-switcher').then((module) => module.languageSwitcherDoc),
  ),
  component('window-titlebar', 'shell', 'panel-bottom-close', docs27.windowTitlebarDoc!, () =>
    import('./pages/components/shell').then((module) => module.windowTitlebarDoc),
  ),
  component('popover', 'shell', 'sliders-horizontal', docs27.popoverDoc!, () =>
    import('./pages/components/shell').then((module) => module.popoverDoc),
  ),
  component('menu-item', 'shell', 'type', docs27.menuItemDoc!, () =>
    import('./pages/components/shell').then((module) => module.menuItemDoc),
  ),
  component('context-menu', 'shell', 'pencil', docs27.contextMenuDoc!, () =>
    import('./pages/components/shell').then((module) => module.contextMenuDoc),
  ),
  component('notification', 'shell', 'bell', docs27.notificationDoc!, () =>
    import('./pages/components/shell').then((module) => module.notificationDoc),
  ),
  component('system-dialog', 'shell', 'info', docs28.systemDialogDoc!, () =>
    import('./pages/components/dialogs').then((module) => module.systemDialogDoc),
  ),
  component('confirm-dialog', 'shell', 'circle-check', docs28.confirmDialogDoc!, () =>
    import('./pages/components/dialogs').then((module) => module.confirmDialogDoc),
  ),
  component('prompt-dialog', 'shell', 'pencil', docs28.promptDialogDoc!, () =>
    import('./pages/components/dialogs').then((module) => module.promptDialogDoc),
  ),
  component('alert-dialog', 'shell', 'info', docs28.alertDialogDoc!, () =>
    import('./pages/components/dialogs').then((module) => module.alertDialogDoc),
  ),
  component('drawer', 'shell', 'panel-right-close', docs9.drawerDoc!, () =>
    import('./pages/components/drawer').then((module) => module.drawerDoc),
  ),
  // 保留旧的外观组合页链接；该入口现在专门展示分段控件。
  component('appearance-pickers', 'shell', 'palette', docs26.pickersDoc!, () =>
    import('./pages/components/misc').then((module) => module.pickersDoc),
  ),
  component('theme-picker', 'shell', 'sun', docs26.themePickerDoc!, () =>
    import('./pages/components/misc').then((module) => module.themePickerDoc),
  ),
  component('accent-picker', 'shell', 'palette', docs26.accentPickerDoc!, () =>
    import('./pages/components/misc').then((module) => module.accentPickerDoc),
  ),
  component('wallpaper-picker', 'shell', 'monitor', docs26.wallpaperPickerDoc!, () =>
    import('./pages/components/misc').then((module) => module.wallpaperPickerDoc),
  ),
  component('desktop-card', 'shell', 'layout-grid', docs35.desktopCardDoc!, () =>
    import('./pages/components/desktop-cards').then((module) => module.desktopCardDoc),
  ),
  component('desktop-card-rail', 'shell', 'layout-grid', docs35.desktopCardRailDoc!, () =>
    import('./pages/components/desktop-cards').then((module) => module.desktopCardRailDoc),
  ),
  component('desktop-note', 'shell', 'sticky-note', docs35.desktopNoteDoc!, () =>
    import('./pages/components/desktop-cards').then((module) => module.desktopNoteDoc),
  ),
  component('clock-card', 'shell', 'clock-3', docs35.clockCardDoc!, () =>
    import('./pages/components/desktop-cards').then((module) => module.clockCardDoc),
  ),

  component('field', 'forms', 'pencil', docs23.doc!, () =>
    import('./pages/components/field').then((module) => module.doc),
  ),
  component('input', 'forms', 'text-cursor-input', docs23.inputDoc!, () =>
    import('./pages/components/field').then((module) => module.inputDoc),
  ),
  component('input-number', 'forms', 'plus', docs1.inputNumberDoc!, () =>
    import('./pages/components/essential-inputs').then((module) => module.inputNumberDoc),
  ),
  component('password-input', 'forms', 'key-round', docs1.passwordInputDoc!, () =>
    import('./pages/components/essential-inputs').then((module) => module.passwordInputDoc),
  ),
  component('copy-field', 'forms', 'copy', docs2.copyFieldDoc!, () =>
    import('./pages/components/copy').then((module) => module.copyFieldDoc),
  ),
  component('radio', 'forms', 'circle-check', docs1.radioDoc!, () =>
    import('./pages/components/essential-inputs').then((module) => module.radioDoc),
  ),
  component('radio-group', 'forms', 'circle-check', docs1.radioGroupDoc!, () =>
    import('./pages/components/essential-inputs').then((module) => module.radioGroupDoc),
  ),
  component('tag-input', 'forms', 'bookmark', docs4.tagInputDoc!, () =>
    import('./pages/components/tags').then((module) => module.tagInputDoc),
  ),
  component('textarea', 'forms', 'type', docs23.textareaDoc!, () =>
    import('./pages/components/field').then((module) => module.textareaDoc),
  ),
  component('select', 'forms', 'chevrons-up-down', docs23.selectDoc!, () =>
    import('./pages/components/field').then((module) => module.selectDoc),
  ),
  component('range', 'forms', 'sliders-horizontal', docs23.rangeDoc!, () =>
    import('./pages/components/field').then((module) => module.rangeDoc),
  ),
  component('date-picker', 'forms', 'calendar-days', docs32.datePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.datePickerDoc),
  ),
  component('time-picker', 'forms', 'clock-3', docs32.timePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.timePickerDoc),
  ),
  component('date-time-picker', 'forms', 'calendar-days', docs32.dateTimePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.dateTimePickerDoc),
  ),
  component('date-range-picker', 'forms', 'calendar-days', docs32.dateRangePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.dateRangePickerDoc),
  ),
  component('date-range-field', 'forms', 'calendar-days', docs32.dateRangeFieldDoc!, () =>
    import('./pages/components/date-time').then((module) => module.dateRangeFieldDoc),
  ),
  component('time-range-picker', 'forms', 'clock-3', docs32.timeRangePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.timeRangePickerDoc),
  ),
  component('number-range-picker', 'forms', 'sliders-horizontal', docs32.numberRangePickerDoc!, () =>
    import('./pages/components/date-time').then((module) => module.numberRangePickerDoc),
  ),
  component('upload-zone', 'forms', 'upload', docs31.uploadZoneDoc!, () =>
    import('./pages/components/media').then((module) => module.uploadZoneDoc),
  ),
  component('message-composer', 'forms', 'send', docs31.messageComposerDoc!, () =>
    import('./pages/components/media').then((module) => module.messageComposerDoc),
  ),
  component('message-thread', 'data', 'message-circle', docs38.messageThreadDoc!, () =>
    import('./pages/components/message-thread').then((module) => module.messageThreadDoc),
  ),
  component('ai-toolbar', 'forms', 'sparkles', docs33.aiToolbarDoc!, () =>
    import('./pages/components/ai-tools').then((module) => module.aiToolbarDoc),
  ),
  component('ai-reference-list', 'forms', 'book-open', docs33.aiReferenceListDoc!, () =>
    import('./pages/components/ai-tools').then((module) => module.aiReferenceListDoc),
  ),
  component('ai-result-panel', 'forms', 'columns', docs33.aiResultPanelDoc!, () =>
    import('./pages/components/ai-tools').then((module) => module.aiResultPanelDoc),
  ),
  component('checkbox', 'forms', 'check-square', docs24.checkboxDoc!, () =>
    import('./pages/components/feedback').then((module) => module.checkboxDoc),
  ),
  component('switch', 'forms', 'sliders-horizontal', docs24.switchDoc!, () =>
    import('./pages/components/feedback').then((module) => module.switchDoc),
  ),

  component('tag', 'feedback', 'bookmark', docs24.tagDoc!, () =>
    import('./pages/components/feedback').then((module) => module.tagDoc),
  ),
  component('help-tip', 'feedback', 'help-circle', docs24.helpTipDoc!, () =>
    import('./pages/components/feedback').then((module) => module.helpTipDoc),
  ),
  component('notice', 'feedback', 'info', docs24.noticeDoc!, () =>
    import('./pages/components/feedback').then((module) => module.noticeDoc),
  ),
  component('empty-state', 'feedback', 'folder', docs24.emptyDoc!, () =>
    import('./pages/components/feedback').then((module) => module.emptyDoc),
  ),
  component('spinner', 'feedback', 'rotate-ccw', docs26.spinnerDoc!, () =>
    import('./pages/components/misc').then((module) => module.spinnerDoc),
  ),
  component('image-preview', 'feedback', 'image', docs31.imagePreviewDoc!, () =>
    import('./pages/components/media').then((module) => module.imagePreviewDoc),
  ),

  component('panel', 'layout', 'columns', docs25.panelDoc!, () =>
    import('./pages/components/layout').then((module) => module.panelDoc),
  ),
  component('toolbar', 'layout', 'settings', docs25.toolbarDoc!, () =>
    import('./pages/components/layout').then((module) => module.toolbarDoc),
  ),
  component('split-layout', 'layout', 'grid-2x2', docs25.splitDoc!, () =>
    import('./pages/components/layout').then((module) => module.splitDoc),
  ),
  component('sidebar', 'layout', 'panel-right-close', docs25.sidebarDoc!, () =>
    import('./pages/components/layout').then((module) => module.sidebarDoc),
  ),
  component('search-field', 'layout', 'search', docs25.searchDoc!, () =>
    import('./pages/components/layout').then((module) => module.searchDoc),
  ),
  component('list', 'layout', 'users', docs25.listDoc!, () =>
    import('./pages/components/layout').then((module) => module.listDoc),
  ),
  component('list-item', 'layout', 'check-square', docs25.listItemDoc!, () =>
    import('./pages/components/layout').then((module) => module.listItemDoc),
  ),
  component('property-sheet', 'layout', 'type', docs25.propertyDoc!, () =>
    import('./pages/components/layout').then((module) => module.propertyDoc),
  ),
  component('property', 'layout', 'type', docs25.propertyRowDoc!, () =>
    import('./pages/components/layout').then((module) => module.propertyRowDoc),
  ),
  component('detail-layout', 'layout', 'panel-right', docs47.detailLayoutDoc!, () =>
    import('./pages/components/detail-layout').then((module) => module.detailLayoutDoc),
  ),
  component('disclosure', 'layout', 'chevron-down', docs25.disclosureDoc!, () =>
    import('./pages/components/layout').then((module) => module.disclosureDoc),
  ),
  component('app-layout', 'layout', 'columns', docs26.appLayoutDoc!, () =>
    import('./pages/components/misc').then((module) => module.appLayoutDoc),
  ),
  component('settings-row', 'layout', 'settings', docs26.settingsRowDoc!, () =>
    import('./pages/components/misc').then((module) => module.settingsRowDoc),
  ),
  component('nav-sidebar', 'layout', 'compass', docs26.navDoc!, () =>
    import('./pages/components/misc').then((module) => module.navDoc),
  ),
  component('resize-handle', 'layout', 'columns', docs5.resizeHandleDoc!, () =>
    import('./pages/components/resizable').then((module) => module.resizeHandleDoc),
  ),
  component('resizable-split', 'layout', 'columns', docs5.resizableSplitDoc!, () =>
    import('./pages/components/resizable').then((module) => module.resizableSplitDoc),
  ),
  component('breadcrumb', 'layout', 'chevron-right', docs7.breadcrumbDoc!, () =>
    import('./pages/components/breadcrumb').then((module) => module.breadcrumbDoc),
  ),
  component('stack', 'layout', 'layers', docs8.stackDoc!, () =>
    import('./pages/components/spacing').then((module) => module.stackDoc),
  ),
  component('inline', 'layout', 'minus', docs8.inlineDoc!, () =>
    import('./pages/components/spacing').then((module) => module.inlineDoc),
  ),
  component('grid', 'layout', 'layout-grid', docs8.gridDoc!, () =>
    import('./pages/components/spacing').then((module) => module.gridDoc),
  ),

  component('table', 'data', 'newspaper', docs29.tableDoc!, () =>
    import('./pages/components/data').then((module) => module.tableDoc),
  ),
  component('file-collection', 'data', 'files', docs39.fileCollectionDoc!, () =>
    import('./pages/components/file-collection').then((module) => module.fileCollectionDoc),
  ),
  component('app-card', 'data', 'app-window', docs45.appCardDoc!, () =>
    import('./pages/components/app-card').then((module) => module.appCardDoc),
  ),
  component('image-gallery', 'data', 'image', docs46.imageGalleryDoc!, () =>
    import('./pages/components/image-gallery').then((module) => module.imageGalleryDoc),
  ),
  component('pagination', 'data', 'chevron-right', docs29.paginationDoc!, () =>
    import('./pages/components/data').then((module) => module.paginationDoc),
  ),
  component('load-more', 'data', 'chevron-down', docs29.loadMoreDoc!, () =>
    import('./pages/components/data').then((module) => module.loadMoreDoc),
  ),
  component('tabs', 'data', 'folder-kanban', docs29.tabsDoc!, () =>
    import('./pages/components/data').then((module) => module.tabsDoc),
  ),
  component('stepper', 'data', 'check-square', docs29.stepperDoc!, () =>
    import('./pages/components/data').then((module) => module.stepperDoc),
  ),
  component('calendar', 'data', 'sticky-note', docs26.calendarDoc!, () =>
    import('./pages/components/misc').then((module) => module.calendarDoc),
  ),
  component('permission-tree', 'data', 'shield-check', docs30.permissionTreeDoc!, () =>
    import('./pages/components/trees').then((module) => module.permissionTreeDoc),
  ),
  component('selection-tree', 'data', 'check-square', docs30.selectionTreeDoc!, () =>
    import('./pages/components/trees').then((module) => module.selectionTreeDoc),
  ),
  component('statistic', 'data', 'sliders-horizontal', docs6.statisticDoc!, () =>
    import('./pages/components/statistic').then((module) => module.statisticDoc),
  ),
  component('stat-card', 'data', 'layout-grid', docs6.statCardDoc!, () =>
    import('./pages/components/statistic').then((module) => module.statCardDoc),
  ),
  component('chart', 'data', 'sliders-horizontal', docs40.chartDoc!, () =>
    import('./pages/components/chart').then((module) => module.chartDoc),
  ),
];

export const defaultPageId = 'overview';

export function findPage(id: string): DocPage | undefined {
  return pages.find((page) => page.id === id);
}

export function findCategory(id: string): DocCategory | undefined {
  return categories.find((category) => category.id === id);
}

export function pagesOf(category: string): DocPage[] {
  return pages.filter((page) => page.category === category);
}
import docs36 from './pages/components/desktop-interactions?metadata';
import docs37 from './pages/components/markdown-view?metadata';
