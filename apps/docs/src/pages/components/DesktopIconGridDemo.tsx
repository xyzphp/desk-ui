import { useState } from 'react';
import {
  appGradients,
  ContextMenu,
  ContextMenuItem,
  Desktop,
  DesktopIconGrid,
  SegmentedControl,
  Stack,
  Switch,
  type GridPlacement,
  type DesktopIconGridItem,
  type DesktopIconPlacementMode,
  type SegmentedOption,
} from '@desk/ui';

const items: DesktopIconGridItem[] = [
  { id: 'notes', label: '备忘录', app: { icon: 'sticky-note', color: appGradients.orange, brightness: 0.75 } },
  { id: 'files', label: '文件', app: { icon: 'folder', color: appGradients.blue, strokeWidth: 1.5 } },
  { id: 'settings', label: '设置', app: { icon: 'settings', color: appGradients.slate } },
];
const placementOptions: SegmentedOption<DesktopIconPlacementMode>[] = [
  { value: 'grid', label: '网格对齐' },
  { value: 'free', label: '自由摆放' },
];
export function DesktopIconGridDemo() {
  const [placementMode, setPlacementMode] = useState<DesktopIconPlacementMode>('grid');
  const [autoArrange, setAutoArrange] = useState(false);
  const [layout, setLayout] = useState<GridPlacement[]>([
    { id: 'notes', column: 0, row: 0 },
    { id: 'files', column: 1, row: 0 },
    { id: 'settings', column: 0, row: 1 },
  ]);
  const [selected, setSelected] = useState<string[]>(['notes', 'files']);
  const [opened, setOpened] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number; label: string }>();
  return (
    <Stack gap="md">
      <SegmentedControl
        aria-label="桌面图标排列"
        value={placementMode}
        options={placementOptions}
        onChange={setPlacementMode}
      />
      <Switch checked={autoArrange} onCheckedChange={(value) => { setAutoArrange(value); setLayout([]); }}>
        自动排列图标
      </Switch>
      <Desktop style={{ height: 380 }}>
        <div className="ds-scrollable" style={{ padding: 16, height: '100%', overflow: 'auto' }}>
          <DesktopIconGrid
            label="桌面图标定位示例"
            items={items}
            rows={3}
            placementMode={placementMode}
            autoArrange={autoArrange}
            layout={layout}
            onLayoutChange={setLayout}
            selectedIds={selected}
            onSelectionChange={setSelected}
            onOpen={(item) => setOpened(`已请求打开：${item.label}`)}
            onItemContextMenu={(item, point) => setMenu({ ...point, label: item.label })}
          />
        </div>
        {menu && (
          <ContextMenu x={menu.x} y={menu.y} aria-label={`${menu.label}菜单`} onClose={() => setMenu(undefined)}>
            <ContextMenuItem icon="info" onClick={() => setOpened(`已选菜单项：${menu.label}`)}>
              图标信息
            </ContextMenuItem>
          </ContextMenu>
        )}
        <span className="ds-visually-hidden" role="status">
          {opened}
        </span>
      </Desktop>
    </Stack>
  );
}
