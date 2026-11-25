import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLabels } from '../foundation/ConfigProvider';
import { cx } from '../foundation/cx';
import { useDesktopCardColumns } from './useDesktopCardColumns';

export interface DesktopCardRailItem {
  id: string;
  content: ReactNode;
}

export interface DesktopCardRailProps extends Omit<ComponentProps<'div'>, 'children' | 'ref'> {
  items: readonly DesktopCardRailItem[];
  header?: ReactNode;
  minimumWorkspace?: number;
  /** In navigation mode, narrow viewports use the original bottom horizontal card rail. */
  navigationMode?: boolean;
  onOccupiedWidthChange?: (width: number) => void;
  onOccupiedHeightChange?: (height: number) => void;
  labels?: { list?: string; column?: (index: number) => string };
}

function CardMount({
  id,
  content,
  root,
  register,
}: DesktopCardRailItem & {
  root: HTMLDivElement;
  register: (id: string, node: HTMLDivElement) => () => void;
}) {
  const [container, setContainer] = useState<HTMLDivElement>();
  useLayoutEffect(() => {
    const node = root.ownerDocument.createElement('div');
    node.dataset.cardRailItem = id;
    setContainer(node);
    return register(id, node);
  }, [id, root, register]);
  return container ? createPortal(content, container) : null;
}

/** 按原站高度预算分列，portal 容器稳定，换列不重建卡片组件。 */
export function DesktopCardRail({
  items,
  header,
  minimumWorkspace = 120,
  navigationMode = false,
  onOccupiedWidthChange,
  onOccupiedHeightChange,
  labels: overrides,
  className,
  hidden,
  ...rest
}: DesktopCardRailProps) {
  const root = useRef<HTMLDivElement>(null);
  const [mountRoot, setMountRoot] = useState<HTMLDivElement | null>(null);
  const bindRoot = useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    setMountRoot(node);
  }, []);
  const columns = useRef<HTMLDivElement>(null);
  const labels = useLabels('desktopCardRail', overrides);
  const register = useDesktopCardColumns(
    root,
    columns,
    items.map(({ id }) => id),
    minimumWorkspace,
    labels.column,
    { hidden: Boolean(hidden || !items.length), navigationMode, onOccupiedWidthChange, onOccupiedHeightChange },
  );
  return (
    <div
      {...rest}
      ref={bindRoot}
      hidden={hidden || !items.length}
      data-navigation-mode={navigationMode || undefined}
      className={cx('ds-desktop-card-rail', className)}
    >
      {header}
      <div ref={columns} className="ds-desktop-card-columns" aria-label={labels.list} />
      {mountRoot && items.map((item) => <CardMount key={item.id} {...item} root={mountRoot} register={register} />)}
    </div>
  );
}
