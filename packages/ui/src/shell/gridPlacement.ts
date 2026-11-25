export interface GridPlacement {
  id: string;
  /** 网格单位；桌面图标自由摆放时允许小数。 */
  column: number;
  row: number;
  width?: number;
  height?: number;
  zIndex?: number;
}
export interface GridBounds {
  columns: number;
  rows: number;
}
export function boundedInteger(value: number | undefined, fallback: number, min: number, max: number) {
  return value !== undefined && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}
export function gridBounds(columns = 6, rows = 8): GridBounds {
  return { columns: boundedInteger(columns, 6, 1, 12), rows: boundedInteger(rows, 8, 1, 1000) };
}
export function overlaps(a: GridPlacement, b: GridPlacement) {
  return (
    a.column < b.column + (b.width ?? 1) &&
    a.column + (a.width ?? 1) > b.column &&
    a.row < b.row + (b.height ?? 1) &&
    a.row + (a.height ?? 1) > b.row
  );
}
export function normalizeLayout(
  ids: readonly string[],
  source: readonly GridPlacement[],
  bounds: GridBounds,
  overlap: boolean,
) {
  const result: GridPlacement[] = [];
  for (const id of [...new Set(ids)]) {
    const original = source.find((entry) => entry.id === id);
    const width = boundedInteger(original?.width, 1, 1, bounds.columns);
    const height = boundedInteger(original?.height, 1, 1, bounds.rows);
    let entry = {
      id,
      width,
      height,
      column: boundedInteger(original?.column, 0, 0, bounds.columns - width),
      row: boundedInteger(original?.row, 0, 0, bounds.rows - height),
      zIndex: boundedInteger(original?.zIndex, 0, 0, 10000),
    };
    if (!original || (!overlap && result.some((previous) => overlaps(previous, entry)))) {
      let found = false;
      for (let row = 0; row <= bounds.rows - height && !found; row++) {
        for (let column = 0; column <= bounds.columns - width; column++) {
          const candidate = { ...entry, row, column };
          if (!result.some((previous) => overlaps(previous, candidate))) {
            entry = candidate;
            found = true;
            break;
          }
        }
      }
      // 无空位时保留目录但不渲染重叠图标；调用方可增加行数。
      if (!found && !overlap) continue;
    }
    result.push(entry);
  }
  return result;
}
export function movePlacement(
  layout: readonly GridPlacement[],
  id: string,
  column: number,
  row: number,
  bounds: GridBounds,
  overlap: boolean,
) {
  const current = layout.find((entry) => entry.id === id);
  if (!current) return null;
  const next = {
    ...current,
    column: boundedInteger(column, current.column, 0, bounds.columns - (current.width ?? 1)),
    row: boundedInteger(row, current.row, 0, bounds.rows - (current.height ?? 1)),
  };
  if (!overlap && layout.some((entry) => entry.id !== id && overlaps(entry, next))) return null;
  return layout.map((entry) => (entry.id === id ? next : entry));
}
