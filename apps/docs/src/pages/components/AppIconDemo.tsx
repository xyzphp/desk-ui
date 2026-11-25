import { useState } from 'react';
import {
  AppIcon, Desktop, DesktopArea, DesktopIcons, Field, Grid, Inline, Input, Range, Select, Stack, Switch,
  appGradients, type IconName,
} from '@xyzos/desk-ui';
import demoImage from '../../assets/preview-lake.svg';

const symbols = [
  { value: 'book-open', label: '书本' }, { value: 'folder', label: '文件夹' }, { value: 'layers', label: '叠层' },
  { value: 'bell', label: '通知' }, { value: 'image', label: '图片' }, { value: 'settings', label: '设置' },
] as const;
const colors = [
  { value: 'slate', label: '灰蓝' }, { value: 'blue', label: '湖蓝' }, { value: 'indigo', label: '靛蓝' }, { value: 'green', label: '青绿' },
  { value: 'orange', label: '暖橙' }, { value: 'pink', label: '粉色' }, { value: 'purple', label: '紫色' }, { value: 'red', label: '珊瑚红' },
  { value: 'cyan', label: '天青（补充）' }, { value: 'teal', label: '松石绿（补充）' }, { value: 'amber', label: '琥珀（补充）' },
  { value: 'violet', label: '深紫（补充）' }, { value: 'brown', label: '棕色（补充）' }, { value: 'graphite', label: '石墨（补充）' },
] as const;

export function AppIconDemo() {
  const [variant, setVariant] = useState<'desktop' | 'graphic'>('desktop');
  const [kind, setKind] = useState<'icon' | 'glyph' | 'image'>('icon');
  const [icon, setIcon] = useState<IconName>('book-open');
  const [glyph, setGlyph] = useState('▦');
  const [color, setColor] = useState<keyof typeof appGradients>('blue');
  const [brightness, setBrightness] = useState(100);
  const [size, setSize] = useState(56);
  const [iconSize, setIconSize] = useState(28);
  const [strokeWidth, setStrokeWidth] = useState(1.8);
  const [transparent, setTransparent] = useState(false);
  const [tinted, setTinted] = useState(false);
  const [selected, setSelected] = useState('custom');
  const [opened, setOpened] = useState('');
  const artwork = {
    icon: kind === 'icon' ? icon : undefined, glyph: kind === 'glyph' ? glyph : undefined,
    image: kind === 'image' ? demoImage : undefined, color: appGradients[color], transparent, size, iconSize, strokeWidth,
    shadow: tinted ? 'tinted' as const : undefined,
  };
  return <Stack gap="lg">
    <Grid minItemWidth={190} style={{ alignItems: 'start' }}>
      <Field label="显示模式"><Select value={variant} onChange={(event) => setVariant(event.target.value as typeof variant)}>
        <option value="desktop">桌面入口（含名称）</option><option value="graphic">纯图形</option>
      </Select></Field>
      <Field label="图形类型"><Select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
        <option value="icon">图标</option><option value="glyph">字符</option><option value="image">图片</option>
      </Select></Field>
      {kind === 'icon' && <Field label="图标"><Select value={icon} onChange={(event) => setIcon(event.target.value as IconName)}>
        {symbols.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select></Field>}
      {kind === 'glyph' && <Field label="字符"><Input value={glyph} maxLength={4} onChange={(event) => setGlyph(event.target.value)} /></Field>}
      {kind !== 'image' && <Field label="背景"><Select value={color} onChange={(event) => setColor(event.target.value as typeof color)}>
        {colors.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select></Field>}
      {kind !== 'image' && <Field label="阴影"><Inline style={{ minHeight: 'var(--ds-field-height)' }}>
        <Switch checked={tinted} onCheckedChange={setTinted}>同色柔和阴影</Switch>
      </Inline></Field>}
      {kind === 'image' && <Field label="图片底板"><Inline style={{ minHeight: 'var(--ds-field-height)' }}>
        <Switch checked={transparent} onCheckedChange={setTransparent}>透明底板</Switch>
      </Inline></Field>}
    </Grid>
    <Grid minItemWidth={190} style={{ alignItems: 'start' }}>
      <Field label={'图形亮度：' + brightness + '%'}><Range min={0} max={150} step={5} value={brightness} onValueChange={setBrightness} /></Field>
      <Field label={'外框尺寸：' + size + 'px'}><Range min={32} max={96} step={4} value={size} onValueChange={setSize} /></Field>
      <Field label={'内部图形尺寸：' + iconSize + 'px'}><Range min={12} max={72} step={2} value={iconSize} onValueChange={setIconSize} /></Field>
      {kind === 'icon' && <Field label={'笔画粗细：' + strokeWidth.toFixed(1)}><Range min={0.5} max={4} step={0.1} value={strokeWidth} onValueChange={setStrokeWidth} /></Field>}
    </Grid>
    {variant === 'desktop' ? <Desktop style={{ width: '100%', height: 280, flexShrink: 0 }}>
      <DesktopArea><DesktopIcons style={{ flexDirection: 'row', alignContent: 'flex-start' }}>
        <AppIcon {...artwork} variant="desktop" label={'自定义 ' + brightness + '%'} brightness={brightness / 100}
          selected={selected === 'custom'} onSelect={() => setSelected('custom')} onOpen={() => setOpened('已触发自定义图标的打开回调')} />
        <AppIcon {...artwork} variant="desktop" label="原色 100%" brightness={1}
          selected={selected === 'original'} onSelect={() => setSelected('original')} onOpen={() => setOpened('已触发原色图标的打开回调')} />
      </DesktopIcons></DesktopArea>
    </Desktop> : <Inline gap="xl" align="start">
      <Stack gap="sm" align="start"><AppIcon {...artwork} brightness={brightness / 100} /><span>自定义 {brightness}%</span></Stack>
      <Stack gap="sm" align="start"><AppIcon {...artwork} brightness={1} /><span>原色 100%</span></Stack>
    </Inline>}
    {opened && <p role="status" style={{ margin: 0 }}>{opened}</p>}
  </Stack>;
}
