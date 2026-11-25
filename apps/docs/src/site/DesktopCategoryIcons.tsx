import { useRef, useState } from 'react';
import {
  DesktopIconGrid,
  DesktopIcons,
  useDesktopIconViewport,
  type DesktopIconGridItem,
  type DesktopIconPlacementMode,
  type GridPlacement,
} from '@desk/ui';
import { useMessages } from '@desk/ui';
import { docText } from '../blocks/docText';
import { categories } from '../registry';
import { docsMessages } from './locale';
import { useLanguage } from './LocaleProvider';

interface DesktopCategoryIconsProps {
  placementMode: DesktopIconPlacementMode;
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  onOpen: (id: string) => void;
}

/** 文档站保留当前页面的分类图标布局，拖动和键盘行为由组件库实现。 */
export function DesktopCategoryIcons({
  placementMode,
  selectedIds,
  onSelectionChange,
  onOpen,
}: DesktopCategoryIconsProps) {
  const t = useMessages(docsMessages).docs.desktopIcons;
  const language = useLanguage();
  const items: readonly DesktopIconGridItem[] = categories.map(({ id, name, icon, color }) => ({
    id,
    label: docText(name, language.current),
    app: { icon, color },
  }));
  const viewport = useRef<HTMLDivElement>(null);
  const viewportProps = useDesktopIconViewport(viewport, items.length);
  const [layout, setLayout] = useState<GridPlacement[]>();

  return (
    <DesktopIcons
      ref={viewport}
      className="docs-desktop-grid-area"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && event.button === 0) onSelectionChange([]);
      }}
    >
      <DesktopIconGrid
        className="docs-desktop-grid"
        label={t.gridAria}
        items={items}
        placementMode={placementMode}
        {...viewportProps}
        layout={layout}
        onLayoutChange={setLayout}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onOpen={(item) => onOpen(item.id)}
      />
    </DesktopIcons>
  );
}
