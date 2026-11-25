import { useRef, type CSSProperties } from 'react';
import {
  DesktopIconGrid,
  DesktopIcons,
  useDesktopIconViewport,
  useMessages,
  type DesktopIconGridItem,
  type DesktopIconPlacementMode,
  type GridPlacement,
} from '@xyzos/desk-ui';
import { docText } from '../blocks/docText';
import { categories } from '../registry';
import {
  appearanceAppSpec,
  desktopIconPixels,
  type DesktopIconSize,
  type DesktopIconSort,
} from './appearance';
import { docsMessages } from './locale';
import { useLanguage } from './LocaleProvider';

interface DesktopCategoryIconsProps {
  iconSize: DesktopIconSize;
  placementMode: DesktopIconPlacementMode;
  autoArrange: boolean;
  sort: DesktopIconSort;
  layout: readonly GridPlacement[];
  onLayoutChange: (layout: GridPlacement[]) => void;
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  onOpen: (id: string) => void;
}

/** App shortcuts on the docs desktop (doc categories + Appearance Settings app) backed by persisted state. */
export function DesktopCategoryIcons({
  iconSize,
  placementMode,
  autoArrange,
  sort,
  layout,
  onLayoutChange,
  selectedIds,
  onSelectionChange,
  onOpen,
}: DesktopCategoryIconsProps) {
  const docs = useMessages(docsMessages).docs;
  const language = useLanguage();
  const size = desktopIconPixels[iconSize];
  const entries = [
    ...categories.map(({ id, name, icon, color }) => ({
      id,
      label: docText(name, language.current),
      icon,
      color,
    })),
    appearanceAppSpec(docs.menu.appearanceSettings),
  ];
  const ordered =
    sort === 'name' ? [...entries].sort((a, b) => a.label.localeCompare(b.label, language.current)) : entries;
  const items: readonly DesktopIconGridItem[] = ordered.map(({ id, label, icon, color }) => ({
    id,
    label,
    app: { icon, color, shadow: 'tinted', size },
  }));
  const viewport = useRef<HTMLDivElement>(null);
  const viewportProps = useDesktopIconViewport(viewport, items.length, size);

  return (
    <DesktopIcons
      ref={viewport}
      className="docs-desktop-grid-area"
      style={{ '--docs-icon-min-width': `${Math.max(84, size + 28)}px` } as CSSProperties}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && event.button === 0) onSelectionChange([]);
      }}
    >
      <DesktopIconGrid
        className="docs-desktop-grid"
        label={docs.desktopIcons.gridAria}
        items={items}
        placementMode={placementMode}
        autoArrange={autoArrange}
        {...viewportProps}
        layout={layout}
        onLayoutChange={onLayoutChange}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onOpen={(item) => onOpen(item.id)}
      />
    </DesktopIcons>
  );
}
