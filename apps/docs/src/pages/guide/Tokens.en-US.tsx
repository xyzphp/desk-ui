import { Lead, Panel, Table, Tag, Title, type TableColumn } from '@xyzos/desk-ui';

interface Swatch {
  token: string;
  label: string;
  note: string;
}

const colors: Swatch[] = [
  { token: '--ds-on-accent', label: 'On-accent text', note: 'Unified foreground for primary buttons, steps, and today' },
  { token: '--ds-desktop-foreground', label: 'Desktop icon text', note: 'Fixed foreground on the wallpaper, independent of artwork brightness' },
  { token: '--ds-icon-image-bg', label: 'Image icon backdrop', note: 'Fixed white backdrop for image icons; unused in transparent mode' },
  { token: '--ds-shade', label: 'Darkening blend', note: 'Fixed blend color for primary button hover' },
  { token: '--ds-window-close', label: 'macOS close', note: 'Platform fixed red' },
  { token: '--ds-window-minimize', label: 'macOS minimize', note: 'Platform fixed yellow' },
  { token: '--ds-window-maximize', label: 'macOS maximize', note: 'Platform fixed green' },
  { token: '--ds-window-close-hover', label: 'Windows close hover', note: 'Platform fixed danger background' },
  { token: '--ds-theme-swatch-light', label: 'Light theme preview', note: 'Static preview for the theme picker' },
  { token: '--ds-theme-swatch-dark', label: 'Dark theme preview', note: 'Static preview for the theme picker' },
  { token: '--ds-theme-swatch-auto', label: 'Auto theme preview', note: 'Static preview split between light and dark' },
  { token: '--ds-wallpaper-sequoia', label: 'Default wallpaper', note: 'Keeps the original gradient asset, maintained centrally' },
  { token: '--ds-wallpaper-sonoma', label: 'Warm wallpaper', note: 'Desktop background asset' },
  { token: '--ds-wallpaper-aurora', label: 'Aurora wallpaper', note: 'Desktop background asset' },
  { token: '--ds-wallpaper-dusk', label: 'Dusk wallpaper', note: 'Desktop background asset' },
  { token: '--accent', label: 'Accent', note: 'Primary actions, selection, focus' },
  { token: '--ds-accent-blue', label: 'Preset blue', note: 'Accent preset from the original site; also the default of --accent' },
  { token: '--ds-accent-purple', label: 'Preset purple', note: 'Desktop Control Center accent' },
  { token: '--ds-accent-pink', label: 'Preset pink', note: 'Desktop Control Center accent' },
  { token: '--ds-accent-orange', label: 'Preset orange', note: 'Desktop Control Center accent' },
  { token: '--ds-accent-green', label: 'Preset green', note: 'Desktop Control Center accent' },
  { token: '--ds-accent-cyan', label: 'Preset cyan', note: 'Desktop Control Center accent' },
  { token: '--ds-accent-gray', label: 'Preset gray', note: 'Desktop Control Center accent' },
  { token: '--bg-panel', label: 'Panel background', note: 'Inputs, panels, table rows' },
  { token: '--bg-win', label: 'Window background', note: 'Page background, table headers, sidebar' },
  { token: '--hover', label: 'Hover background', note: 'List items and buttons on hover' },
  { token: '--border', label: 'Border', note: 'Dividers and control borders' },
  { token: '--text', label: 'Body text', note: 'Headings and body copy' },
  { token: '--text-2', label: 'Secondary text', note: 'Descriptions, placeholders, table headers' },
  { token: '--ds-success', label: 'Success', note: 'Tag / Notice success' },
  { token: '--ds-chart-blue', label: 'Chart blue', note: 'Fixed blue chart color' },
  { token: '--ds-chart-green', label: 'Chart green', note: 'Fixed green chart color' },
  { token: '--ds-workflow-complete', label: 'Workflow complete', note: 'Keeps todo.css completion marks and sub-task progress color' },
  { token: '--ds-warning', label: 'Warning', note: 'Tag / Notice warning' },
  { token: '--ds-danger', label: 'Danger', note: 'Tag / Notice danger, delete' },
  { token: '--ds-file-icon', label: 'File icon gray', note: 'File color in file collections and file management' },
  { token: '--ds-file-folder', label: 'Folder blue', note: 'Folder color in file collections and file management' },
  { token: '--ds-danger-soft', label: 'Danger (soft)', note: 'Delete / failure hint text in file management' },
  { token: '--ds-danger-bright', label: 'Danger (bright)', note: 'Danger border and text on the account page' },
  { token: '--ds-danger-text', label: 'Danger text', note: 'Deep red failure hint text on the account page' },
  { token: '--ds-success-text', label: 'Success text', note: 'Deep green success hint text on the account page' },
  { token: '--ds-tone-blue', label: 'Status blue', note: 'Type tag background / border in file management' },
  { token: '--ds-tone-blue-text', label: 'Status blue text', note: 'Type tag text in file management (light theme)' },
  { token: '--ds-tone-blue-light', label: 'Status blue text (soft)', note: 'Type tag text in file management (dark theme)' },
  { token: '--ds-tone-green', label: 'Status green', note: 'Type tag background / border in file management' },
  { token: '--ds-tone-green-text', label: 'Status green text', note: 'Type tag text in file management (light theme)' },
  { token: '--ds-tone-green-light', label: 'Status green text (soft)', note: 'Type tag text in file management (dark theme)' },
  { token: '--ds-tone-red', label: 'Status red', note: 'Failure tags in file management' },
  { token: '--ds-tone-amber', label: 'Reminder amber', note: 'Due reminder background for todo items' },
  { token: '--ds-tone-amber-text', label: 'Reminder amber text', note: 'Due reminder text for todo items' },
  { token: '--ds-tone-amber-text-soft', label: 'Reminder amber text (muted)', note: 'Secondary due reminder text for todo items' },
  { token: '--ds-tone-gray', label: 'Neutral gray dot', note: 'Fallback gray when a todo task lacks a secondary text token' },
  { token: '--ds-checker-dark', label: 'Checker dark', note: 'Checkerboard for transparent image previews' },
  { token: '--ds-checker-darker', label: 'Preview backdrop', note: 'Dark backdrop of the image preview' },
  { token: '--ds-switch-thumb', label: 'Switch thumb', note: 'White thumb from the native settings switch' },
  { token: '--ds-preview-bg', label: 'Image preview base', note: 'Dark translucent background from the file preview' },
  { token: '--ds-preview-text', label: 'Image preview text', note: 'Toolbar, buttons, and status use white foreground' },
  { token: '--ds-crop-grid', label: 'Crop guides', note: 'Keeps the 20% white guides from the native cover cropper; backdrop stays on preview tokens' },
  { token: '--ds-dialog-overlay', label: 'Dialog scrim', note: 'Keeps the original 18% black scrim' },
  { token: '--ds-dialog-danger', label: 'Dialog danger action', note: 'Keeps the original red confirm button' },
  { token: '--ds-dialog-on-action', label: 'Dialog button text', note: 'White foreground for primary and danger actions' },
  { token: '--ds-selection-bg', label: 'Soft selection background', note: 'Shared by pickers, model options, AI actions, and reference cards' },
  { token: '--ds-selection-border', label: 'Selection border', note: 'Accent mixed with neutral border; hover keeps selection semantics' },
  { token: '--ds-input-border-hover', label: 'Input hover border', note: 'Neutral; keeps the thin border' },
  { token: '--ds-input-border-focus', label: 'Input focus border', note: 'Neutral; avoids thick blue rings' },
  { token: '--ds-note-yellow', label: 'Yellow note', note: 'Original note paper color, maintained per theme' },
  { token: '--ds-note-blue', label: 'Blue note', note: 'Shared by paper and color options' },
  { token: '--ds-note-green', label: 'Green note', note: 'Shared by paper and color options' },
  { token: '--ds-note-pink', label: 'Pink note', note: 'Shared by paper and color options' },
  { token: '--ds-note-white', label: 'White note', note: 'Neutral paper color under the theme' },
  { token: '--ds-liquid-glass-bg', label: 'Liquid glass base', note: 'Clear translucent tint for cards, trees, groups, columns, and shell bars (MenuBar, Dock, Taskbar, Mode bar)' },
  { token: '--ds-liquid-glass-bg-strong', label: 'Liquid glass strong base', note: 'Balanced clear tint for Start menu, popovers, context menus, toasts, lock countdown, sign-in card, Dock sort panel, favorites, and filter bars' },
  { token: '--ds-liquid-glass-card', label: 'Liquid glass inner card', note: 'Crisp elevated glass fill for bookmark cards, task cards, sign-in inputs, and active method tabs' },
  { token: '--ds-liquid-glass-bg-soft', label: 'Liquid glass soft base', note: 'Airy translucent tint for nested groups, Start menu footer, and add-triggers' },
  { token: '--ds-liquid-glass-track-bg', label: 'Liquid glass track base', note: 'Recessed contrast well for segmented controls inside glass popovers' },
  { token: '--ds-liquid-glass-chip-bg', label: 'Liquid glass chip base', note: 'Chip and pill surface for header controls, Start search pill, popover controls, inline notifications, and hover states' },
  { token: '--ds-liquid-glass-chip-border', label: 'Liquid glass chip border', note: 'Subtle translucent stroke for secondary header controls, chips, and dial rings inside glass cards' },
  { token: '--ds-liquid-glass-active-bg', label: 'Liquid glass active pill base', note: 'High-contrast luminous glass pill for selected segmented options and active theme cards' },
  { token: '--ds-liquid-glass-text', label: 'Liquid glass primary text', note: 'Crisp high-contrast primary foreground on glass cards, popovers, menu bar, and Start menu' },
  { token: '--ds-liquid-glass-text-2', label: 'Liquid glass secondary text', note: 'Vibrant alpha-blended secondary text that stays legible over colorful wallpapers' },
  { token: '--ds-liquid-glass-active-text', label: 'Liquid glass active text', note: 'Legible accent or crisp foreground for active glass pills' },
  { token: '--ds-liquid-glass-border', label: 'Liquid glass specular border', note: 'Delicate translucent rim stroke for glass surfaces' },
  { token: '--ds-liquid-glass-border-hover', label: 'Liquid glass hover border', note: 'Softly brightened specular rim stroke on hover' },
  { token: '--ds-liquid-glass-rim', label: 'Liquid glass Fresnel rim', note: '1px 135deg diagonal specular border ring rendered via masked ::before with smooth refraction glide on hover/open' },
];

interface Metric {
  token: string;
  value: string;
  use: string;
}

const metrics: Metric[] = [
  { token: '--ds-space-none', value: '0px', use: 'No spacing' },
  { token: '--ds-space-xs', value: '4px', use: 'Compact spacing' },
  { token: '--ds-space-sm', value: '8px', use: 'Action group spacing' },
  { token: '--ds-space-md', value: '12px', use: 'Default layout spacing' },
  { token: '--ds-space-lg', value: '16px', use: 'Field and content groups' },
  { token: '--ds-space-xl', value: '24px', use: 'Large group spacing' },
  { token: '--ds-space-xxl', value: '32px', use: 'Loose layout spacing' },
  { token: '--ds-resize-hit-size', value: '8px', use: 'Hit size of split resize handles' },
  { token: '--ds-statistic-value-size', value: '28px', use: 'Statistic value font size' },
  { token: '--ds-drawer-sm', value: '320px', use: 'Small drawer size' },
  { token: '--ds-drawer-md', value: '420px', use: 'Default drawer size' },
  { token: '--ds-drawer-lg', value: '640px', use: 'Large drawer size' },
  { token: '--ds-control-md', value: '32px', use: 'Default button height' },
  { token: '--ds-control-sm', value: '28px', use: 'Small and icon buttons' },
  { token: '--ds-field-height', value: '34px', use: 'Minimum height for inputs and selects' },
  { token: '--ds-radius-scale', value: '1', use: 'Radius scale set by the skin; every pixel radius is multiplied by it' },
  { token: '--ds-shadow-strength', value: '1', use: 'Shadow strength set by the skin; drop-shadow opacity is multiplied by it' },
  { token: '--ds-radius-sm', value: '7px × radius scale', use: 'Button and input radius' },
  { token: '--ds-radius-md', value: '9px × radius scale', use: 'Panel and list item radius' },
  { token: '--ds-switch-width', value: '32px', use: 'Settings switch track width' },
  { token: '--ds-switch-height', value: '20px', use: 'Settings switch track height' },
  { token: '--ds-switch-thumb-size', value: '16px', use: 'Settings switch thumb size' },
  { token: '--ds-switch-thumb-shadow', value: '0 1px 2px rgba(0, 0, 0, .18)', use: 'Thumb shadow of the native settings switch' },
  { token: '--ds-range-track-height', value: '6px', use: 'Track height of quality and zoom sliders' },
  { token: '--ds-range-thumb-size', value: '18px', use: 'Outer size of slider thumbs' },
  { token: '--ds-picker-shadow', value: 'Two soft neutral shadows', use: 'Date / time panels and model menus; varies with the theme' },
  {
    token: '--ds-widget-shadow',
    value: '0 8px 26px rgba(0, 0, 0, .16) with an inner highlight',
    use: 'Default frosted mode keeps desktop-widgets.css card shadows; no live backdrop filters',
  },
  {
    token: '--ds-liquid-glass-filter',
    value: 'blur(18px) saturate(165% / 160%)',
    use: 'Balanced low-noise backdrop filter for liquid glass cards, Start menu, floating panels, shell bars, navigation groups, and board columns (165% light / 160% dark)',
  },
  {
    token: '--ds-liquid-glass-filter-soft',
    value: 'blur(12px) saturate(155% / 150%)',
    use: 'Lighter backdrop filter for liquid glass search bars, favorites, toolbars, Dock tooltips, and secondary triggers (155% light / 150% dark)',
  },
  {
    token: '--ds-liquid-glass-shadow',
    value: 'Tight elevation + hairline top specular & soft inner glow',
    use: 'Subtle elevation and gentle inner luminescence for primary liquid glass containers and shell panels (upward shadow extent <= 11px to stay within container gaps)',
  },
  {
    token: '--ds-liquid-glass-shadow-sm',
    value: 'Soft elevation + hairline top highlight & subtle glow',
    use: 'Subtle glass elevation and top sheen for search bars, favorites, Start menu search pill, Dock tooltips, bookmark cards, and task cards',
  },
  {
    token: '--ds-drag-shadow',
    value: '0 16px 32px rgba(0, 0, 0, .25)',
    use: 'Keeps todo.css drag card and workflow column preview shadows',
  },
  {
    token: '--ds-app-icon-brightness',
    value: '1',
    use: 'Graphics render at 100% color in desktop mode, matching the original site; tags, focus, and selection stay independent',
  },
  {
    token: 'Font sizes',
    value: '12 / 13 / 14 / 28px',
    use: 'Tags, buttons, and tables 12; inputs and body 13; headings 14; page titles 28. Visible text stays at 12px or larger',
  },
];

const metricColumns: TableColumn<Metric>[] = [
  { key: 'token', header: 'Token', width: '26%', render: (m) => <code className="docs-code-inline">{m.token}</code> },
  { key: 'value', header: 'Value', width: '24%' },
  { key: 'use', header: 'Purpose' },
];

export function TokensEn() {
  return (
    <div className="docs-content">
      <header className="docs-stack">
        <Title>Design tokens</Title>
        <Lead>
          Tokens define colors, radii, spacing, type sizes, and shadows in one place, and every component shares the same
          theme. Click the theme button in the menu bar or switch light / dark in the Control Center and the swatches
          follow.
        </Lead>
      </header>

      <h2 className="docs-section-title">Colors</h2>
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

      <h2 className="docs-section-title">Sizing, radius, and font sizes</h2>
      <Panel flush>
        <Table wrap caption="Sizing tokens" columns={metricColumns} rows={metrics} rowKey={(m) => m.token} />
      </Panel>

      <h2 className="docs-section-title">Focus and theming</h2>
      <Panel>
        <ul className="docs-list">
          <li>Buttons and navigation keep their own keyboard focus cues; checkboxes and switches outline only the control, not the whole row.</li>
          <li>
            Text inputs, search, message input, and selects keep a single neutral thin border without native black
            outlines, inset strokes, or focus shadows; composite controls express focus with their outer frame.
          </li>
          <li>Selection background, selection border, and menu shadows are recomputed at theme boundaries; nested light and dark never inherit the outer background.</li>
          <li>
            Themes switch through the root element <code className="docs-code-inline">data-theme="light | dark"</code>; the default is light.
          </li>
          <li>
            All rules live in <code className="docs-code-inline">@layer ds</code>; for cascade behavior with native pages see
            <Tag tone="muted">Conventions</Tag>.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
