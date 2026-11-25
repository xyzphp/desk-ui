import { useRef, useState } from 'react';
import { DesktopCard, DesktopNote, type DesktopCardDrag, type DesktopCardProps } from '@desk/ui';

type Point = { x: number; y: number };

export function DesktopCardMotionDemo({ note = false }: { note?: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [preview, setPreview] = useState<Point>();
  const [inRail, setInRail] = useState(false);
  const clamp = (point: Point) => ({
    x: Math.max(0, Math.min(point.x, (slot.current?.parentElement?.clientWidth ?? 320) - (slot.current?.offsetWidth ?? 320))),
    y: Math.max(0, Math.min(point.y, (slot.current?.parentElement?.clientHeight ?? 380) - (slot.current?.offsetHeight ?? 100))),
  });
  const move = (event: DesktopCardDrag) => {
    if (event.phase === 'cancel') { setPreview(undefined); return; }
    const point = clamp({ x: position.x + event.point.x - event.start.x, y: position.y + event.point.y - event.start.y });
    if (event.phase === 'drop') { setPosition(point); setPreview(undefined); } else setPreview(point);
  };
  const headerProps: DesktopCardProps['headerProps'] = { tabIndex: 0, onKeyDown: (event) => {
    if (event.target !== event.currentTarget) return;
    const directions: Record<string, Point> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 24 : 8;
    setPosition(clamp({ x: position.x + direction.x * step, y: position.y + direction.y * step }));
  } };
  const point = preview ?? position;
  return <div ref={slot} style={{ position: 'absolute', zIndex: 1, left: point.x, top: point.y, width: 'min(100%, 304px)' }}>
    {note ? <DesktopNote title="会议备忘" icon="sticky-note" placement={inRail ? 'card' : 'note'} headerProps={headerProps} onHeaderDrag={move}
      actions={[{ id: 'place', icon: 'layers', label: inRail ? '切换纸张样式' : '切换卡片样式', onClick: () => setInRail(!inRail) }]}
      defaultValue="周五确认计划。" imageCount={2} /> :
      <DesktopCard title="桌面卡片" icon="layout-grid" headerProps={headerProps} onHeaderDrag={move}>
        <p>按住标题栏拖动，或聚焦标题栏后按方向键。</p>
      </DesktopCard>}
  </div>;
}
