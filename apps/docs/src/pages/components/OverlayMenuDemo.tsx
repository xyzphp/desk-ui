import { useId, useRef, useState } from 'react';
import {
  Button,
  ContextMenu,
  ContextMenuDivider,
  ContextMenuItem,
  ContextMenuSubmenu,
  MenuItem,
  MenuSeparator,
  Panel,
  Popover,
  Stack,
  useLabels, wallpapers, type WallpaperName,
} from '@desk/ui';

export function OverlayMenuDemo() {
  const anchor = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('尚未选择');
  return (
    <Stack
      gap="sm"
      align="start"
      style={{ position: 'relative', width: '100%', minHeight: '100%', padding: 24 }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
      }}
    >
      <Button
        ref={anchor}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        打开操作菜单
      </Button>
      <Panel role="status" style={{ padding: '8px 12px' }}>
        {action}
      </Panel>
      <Popover anchor={anchor} open={open} id={menuId} aria-label="示例操作" onClose={() => setOpen(false)}>
        <MenuItem icon="pencil" textValue="edit" onClick={() => setAction('已选择编辑')}>
          编辑
        </MenuItem>
        <MenuItem icon="copy" textValue="copy" onClick={() => setAction('已选择复制')}>
          复制
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon="trash-2" disabled>
          删除（不可用）
        </MenuItem>
      </Popover>
    </Stack>
  );
}

export function ContextMenuDemo() {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [grid, setGrid] = useState(true);
  const [size, setSize] = useState('中等图标');
  const [background, setBackground] = useState<WallpaperName>('sequoia');
  const wallpaperLabels = useLabels('wallpaperPicker');
  return (
    <Stack
      gap="sm"
      align="start"
      style={{ position: 'relative', width: '100%', minHeight: '100%', padding: 24 }}
      onContextMenu={(event) => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        setPoint({ x: event.clientX, y: event.clientY });
      }}
    >
      <Button
        aria-haspopup="menu"
        aria-expanded={!!point}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPoint({ x: rect.left, y: rect.bottom });
        }}
        onKeyDown={(event) => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            setPoint({ x: rect.left, y: rect.bottom });
          }
        }}
      >
        点击或右键打开菜单
      </Button>
      <Panel role="status" style={{ padding: '8px 12px' }}>
        {size} · {grid ? '网格对齐' : '自由摆放'} · {wallpaperLabels[background]}
      </Panel>
      {point && (
        <ContextMenu {...point} aria-label="画布菜单" onClose={() => setPoint(null)}>
          <ContextMenuSubmenu label="查看" icon="layout-grid">
            <ContextMenuSubmenu label="图标大小" icon="grid-2x2">
              {['大图标', '中等图标', '小图标'].map((option) => (
                <ContextMenuItem
                  key={option}
                  icon="grid-2x2"
                  checkRole="radio"
                  checked={size === option}
                  onClick={() => setSize(option)}
                >
                  {option}
                </ContextMenuItem>
              ))}
            </ContextMenuSubmenu>
            <ContextMenuItem icon="grid-2x2-check" checked={grid} onClick={() => setGrid(!grid)}>
              与网格对齐
            </ContextMenuItem>
          </ContextMenuSubmenu>
          <ContextMenuSubmenu label="桌面背景" icon="image">
            {wallpapers.map((option) => (
              <ContextMenuItem
                key={option}
                icon="image"
                wallpaper={option}
                checkRole="radio"
                checked={background === option}
                onClick={() => setBackground(option)}
              >
                {wallpaperLabels[option]}
              </ContextMenuItem>
            ))}
          </ContextMenuSubmenu>
          <ContextMenuDivider />
          <ContextMenuItem
            icon="rotate-ccw"
            onClick={() => {
              setGrid(true);
              setSize('中等图标');
              setBackground('sequoia');
            }}
          >
            恢复默认
          </ContextMenuItem>
          <ContextMenuSubmenu label="排序方式（不可用）" icon="arrow-down-wide-narrow" disabled>
            <ContextMenuItem>按名称</ContextMenuItem>
          </ContextMenuSubmenu>
        </ContextMenu>
      )}
    </Stack>
  );
}
