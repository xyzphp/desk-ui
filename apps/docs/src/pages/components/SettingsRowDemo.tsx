import { useState, type CSSProperties } from 'react';
import { AppLayout, AppMain, Button, Inline, NavItem, NavSidebar, SegmentedControl, Select, SettingsRow, Stack, ThemePicker, WallpaperPicker } from '@desk/ui';
import type { ThemeChoice, WallpaperName } from '@desk/ui';

const sample = new URL('../../assets/preview-lake.svg?no-inline', import.meta.url).pathname;

export function WallpaperSettingsDemo() {
  const [wallpaper, setWallpaper] = useState<WallpaperName>('sequoia');
  const [custom, setCustom] = useState(false);
  return <SettingsRow label="桌面壁纸" layout="stacked" actions={<>
    <Button icon="image-plus" onClick={() => setCustom(true)}>使用示例图片</Button>
    {custom && <Button icon="rotate-ccw" onClick={() => { setCustom(false); setWallpaper('sequoia'); }}>恢复预设</Button>}
  </>}>
    <WallpaperPicker value={wallpaper} onChange={(value) => { setCustom(false); setWallpaper(value); }}
      custom={{ url: custom ? sample : undefined, onClick: () => setCustom(true) }} />
  </SettingsRow>;
}

export function SettingsRowDemo() {
  const [theme, setTheme] = useState<ThemeChoice>('auto');
  const [dock, setDock] = useState('system');
  const [font, setFont] = useState('apple');
  const [savedFont, setSavedFont] = useState('apple');
  return <AppLayout>
    <NavSidebar title="系统设置" aria-label="系统设置"><NavItem icon="sun-moon" current>外观</NavItem></NavSidebar>
    <AppMain style={{ overflow: 'auto', padding: '20px 24px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>外观</h2>
      <Stack gap="sm">
        <SettingsRow label="主题模式"><ThemePicker variant="settings" value={theme} onChange={setTheme} /></SettingsRow>
        <SettingsRow label="Dock 栏样式">
          <SegmentedControl variant="settings" aria-label="Dock 栏样式" value={dock} onChange={setDock}
            options={[{ value: 'system', label: '跟随系统' }, { value: 'windows', label: 'Windows 风格' }, { value: 'macos', label: 'macOS 风格' }]} />
        </SettingsRow>
        <WallpaperSettingsDemo />
        <SettingsRow label="系统字体">
          <Inline justify="end" wrap={false} style={{ width: 248, maxWidth: '100%' }}>
            <Select aria-label="系统字体" value={font} onChange={(event) => setFont(event.currentTarget.value)}
              style={{ width: 170, flex: '0 1 170px', '--ds-choice-select-font-size': '12px',
                '--ds-picker-surface-height': '32px', '--ds-picker-surface-bg': 'var(--bg-win)' } as CSSProperties}>
              <option value="apple">Apple 系统字体</option><option value="system">系统默认</option>
              <option value="serif">宋体</option><option value="mono">等宽字体</option>
            </Select>
            <Button icon="save" aria-label="保存字体" style={{ flexShrink: 0 }} onClick={() => setSavedFont(font)}>保存</Button>
          </Inline>
        </SettingsRow>
        <span role="status">{savedFont !== 'apple' ? '已保存示例字体' : ''}</span>
      </Stack>
    </AppMain>
  </AppLayout>;
}
