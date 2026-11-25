import { useState } from 'react';
import { Button, DesktopCard, DesktopCardRail, DesktopCardToolbar, Input } from '@xyzos/desk-ui';

export function DesktopCardRailDemo() {
  const [reversed, setReversed] = useState(false);
  const [hideFirst, setHideFirst] = useState(false);
  const [navigationMode, setNavigationMode] = useState(false);
  const [occupied, setOccupied] = useState(0);
  const [occupiedHeight, setOccupiedHeight] = useState(0);
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: String(index),
    content: (
      <DesktopCard title={`卡片 ${index + 1}`} icon="layout-grid">
        <Input aria-label={`卡片 ${index + 1} 草稿`} placeholder="调整顺序或折叠后保留输入" />
        <p>按卡片实际高度分列，空间不足时滚动最后一列。</p>
      </DesktopCard>
    ),
  }));
  const shown = items.filter((item) => !hideFirst || item.id !== '0');
  return (
    <>
      <span style={{ position: 'absolute', left: 16, top: 12, fontSize: 12 }}>
        卡片占用 {occupied}px × {occupiedHeight}px
      </span>
      <DesktopCardRail
        navigationMode={navigationMode}
        minimumWorkspace={navigationMode ? 760 : 120}
        items={reversed ? [...shown].reverse() : shown}
        onOccupiedWidthChange={setOccupied}
        onOccupiedHeightChange={setOccupiedHeight}
        header={
          <DesktopCardToolbar title="桌面卡片">
            <Button size="sm" aria-pressed={navigationMode} onClick={() => setNavigationMode(!navigationMode)}>
              {navigationMode ? '桌面模式' : '导航模式'}
            </Button>
            <Button size="sm" onClick={() => setReversed(!reversed)}>
              反转顺序
            </Button>
            <Button size="sm" onClick={() => setHideFirst(!hideFirst)}>
              {hideFirst ? '恢复首张卡片' : '隐藏首张卡片'}
            </Button>
          </DesktopCardToolbar>
        }
      />
    </>
  );
}
